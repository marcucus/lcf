import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import * as logger from 'firebase-functions/logger';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI
);

/**
 * Cloud Function to initiate OAuth 2.0 flow
 * Returns the authorization URL for the admin to visit
 */
export const initiateOAuth = onCall(async (request) => {
  // Verify admin authentication
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated to initiate OAuth flow'
    );
  }

  // Verify admin role
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(request.auth.uid)
    .get();

  const userData = userDoc.data();
  if (userData?.role !== 'admin') {
    throw new HttpsError(
      'permission-denied',
      'Only admins can configure OAuth'
    );
  }

  try {
    // Define the scopes for Google Business Profile API
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
    ];

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request refresh token
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
      state: request.auth.uid, // Pass user ID for verification in callback
    });

    return { authUrl };
  } catch (error) {
    logger.error('Error initiating OAuth:', error);
    throw new HttpsError(
      'internal',
      'Failed to generate authorization URL'
    );
  }
});

/**
 * Cloud Function to handle OAuth callback
 * Exchanges authorization code for tokens and stores them securely
 */
export const handleOAuthCallback = onRequest(async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    res.status(400).send('Missing authorization code or state');
    return;
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to obtain tokens');
    }

    // Calculate token expiration
    const expiresIn = tokens.expiry_date 
      ? tokens.expiry_date 
      : Date.now() + (3600 * 1000); // Default 1 hour

    // Store tokens in Firestore
    const configRef = admin.firestore().collection('googleOAuthConfig').doc('default');
    await configRef.set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: admin.firestore.Timestamp.fromMillis(expiresIn),
      isConnected: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSync: null,
    });

    logger.info('OAuth tokens stored successfully');

    // Redirect back to admin page
    res.redirect('/admin/avis?success=true');
  } catch (error) {
    logger.error('Error handling OAuth callback:', error);
    res.redirect('/admin/avis?error=oauth_failed');
  }
});

/**
 * Cloud Function to refresh OAuth token
 */
export const refreshOAuthToken = onCall(async (request) => {
  // Verify admin authentication
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // Verify admin role
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(request.auth.uid)
    .get();

  const userData = userDoc.data();
  if (userData?.role !== 'admin') {
    throw new HttpsError(
      'permission-denied',
      'Only admins can refresh OAuth token'
    );
  }

  try {
    // Get current config
    const configRef = admin.firestore().collection('googleOAuthConfig').doc('default');
    const configDoc = await configRef.get();

    if (!configDoc.exists) {
      throw new HttpsError(
        'not-found',
        'OAuth configuration not found'
      );
    }

    const config = configDoc.data();
    if (!config?.refreshToken) {
      throw new HttpsError(
        'failed-precondition',
        'No refresh token available'
      );
    }

    // Set refresh token and refresh
    oauth2Client.setCredentials({
      refresh_token: config.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    // Update stored tokens
    const expiresIn = credentials.expiry_date 
      ? credentials.expiry_date 
      : Date.now() + (3600 * 1000);

    await configRef.update({
      accessToken: credentials.access_token,
      tokenExpiresAt: admin.firestore.Timestamp.fromMillis(expiresIn),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info('OAuth token refreshed successfully');

    return { success: true };
  } catch (error) {
    logger.error('Error refreshing OAuth token:', error);
    throw new HttpsError(
      'internal',
      'Failed to refresh OAuth token'
    );
  }
});

/**
 * Cloud Function to disconnect OAuth
 */
export const disconnectOAuth = onCall(async (request) => {
  // Verify admin authentication
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // Verify admin role
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(request.auth.uid)
    .get();

  const userData = userDoc.data();
  if (userData?.role !== 'admin') {
    throw new HttpsError(
      'permission-denied',
      'Only admins can disconnect OAuth'
    );
  }

  try {
    // Get current config
    const configRef = admin.firestore().collection('googleOAuthConfig').doc('default');
    const configDoc = await configRef.get();

    if (configDoc.exists) {
      const config = configDoc.data();
      
      // Revoke tokens with Google
      if (config?.accessToken) {
        try {
          await oauth2Client.revokeToken(config.accessToken);
        } catch (err) {
          logger.warn('Failed to revoke token with Google:', err);
          // Continue anyway to clear local config
        }
      }

      // Delete the configuration
      await configRef.delete();
    }

    logger.info('OAuth disconnected successfully');

    return { success: true };
  } catch (error) {
    logger.error('Error disconnecting OAuth:', error);
    throw new HttpsError(
      'internal',
      'Failed to disconnect OAuth'
    );
  }
});

/**
 * Scheduled function to automatically refresh tokens before expiry
 * Runs every 12 hours
 */
export const autoRefreshTokens = onSchedule('every 12 hours', async (event) => {
  try {
    const configRef = admin.firestore().collection('googleOAuthConfig').doc('default');
    const configDoc = await configRef.get();

    if (!configDoc.exists || !configDoc.data()?.isConnected) {
      logger.info('No active OAuth connection, skipping token refresh');
      return;
    }

    const config = configDoc.data()!;
    const expiresAt = config.tokenExpiresAt?.toMillis() || 0;
    const now = Date.now();
    
    // Refresh if token expires within next 24 hours
    if (expiresAt - now < 24 * 60 * 60 * 1000) {
      logger.info('Token expiring soon, refreshing...');

      oauth2Client.setCredentials({
        refresh_token: config.refreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      if (credentials.access_token) {
        const newExpiresIn = credentials.expiry_date 
          ? credentials.expiry_date 
          : Date.now() + (3600 * 1000);

        await configRef.update({
          accessToken: credentials.access_token,
          tokenExpiresAt: admin.firestore.Timestamp.fromMillis(newExpiresIn),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info('Token auto-refreshed successfully');
      }
    } else {
      logger.info('Token still valid, no refresh needed');
    }
  } catch (error) {
    logger.error('Error in auto-refresh:', error);
  }
});
