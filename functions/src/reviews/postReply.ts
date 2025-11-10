import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

/**
 * Configuration stored in Firestore for Google Business Profile integration
 */
interface GoogleBusinessConfig {
  accountId: string;
  locationId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: admin.firestore.Timestamp;
}

/**
 * Request data interface for postReply function
 */
interface PostReplyRequest {
  reviewId: string;
  replyText: string;
}

/**
 * Refreshes the OAuth 2.0 access token using the refresh token
 * 
 * @param refreshToken - The refresh token
 * @returns New access token and expiry time
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    functions.logger.error('Missing Google OAuth credentials in environment variables');
    throw new HttpsError(
      'failed-precondition',
      'Configuration OAuth manquante. Veuillez configurer les variables d\'environnement GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.'
    );
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    functions.logger.error('Failed to refresh access token', {
      status: response.status,
      error: errorData,
    });
    throw new HttpsError(
      'unauthenticated',
      'Échec du renouvellement du jeton d\'authentification. Veuillez reconfigurer l\'intégration Google Business Profile.'
    );
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Gets a valid access token, refreshing if necessary
 * 
 * @param config - Google Business Profile configuration
 * @returns Valid access token
 */
async function getValidAccessToken(config: GoogleBusinessConfig): Promise<string> {
  const now = admin.firestore.Timestamp.now();
  
  // Check if token is still valid (with 5-minute buffer)
  const bufferMs = 5 * 60 * 1000; // 5 minutes
  const expiryWithBuffer = new admin.firestore.Timestamp(
    config.tokenExpiry.seconds - Math.floor(bufferMs / 1000),
    config.tokenExpiry.nanoseconds
  );

  if (now.toMillis() < expiryWithBuffer.toMillis()) {
    return config.accessToken;
  }

  // Token expired or about to expire, refresh it
  functions.logger.info('Access token expired, refreshing...');
  
  const { accessToken, expiresIn } = await refreshAccessToken(config.refreshToken);
  
  // Update the config in Firestore
  const newExpiry = admin.firestore.Timestamp.fromMillis(
    Date.now() + (expiresIn * 1000)
  );
  
  await admin.firestore()
    .collection('settings')
    .doc('googleBusinessProfile')
    .update({
      accessToken,
      tokenExpiry: newExpiry,
    });

  functions.logger.info('Access token refreshed successfully');
  
  return accessToken;
}

/**
 * Posts a reply to a Google Business Profile review
 * 
 * @param accessToken - Valid OAuth 2.0 access token
 * @param locationId - Location ID in format: locations/{locationId}
 * @param reviewId - Review ID to reply to
 * @param replyText - Text content of the reply
 * @returns Success status
 */
async function postReplyToApi(
  accessToken: string,
  locationId: string,
  reviewId: string,
  replyText: string
): Promise<void> {
  // Google Business Profile API endpoint for updating review reply
  // Format: https://mybusinessaccountmanagement.googleapis.com/v1/{review}/reply
  const url = `https://mybusinessaccountmanagement.googleapis.com/v1/locations/${locationId}/reviews/${reviewId}/reply`;

  functions.logger.info('Posting reply to Google Business Profile API', {
    locationId,
    reviewId,
    replyLength: replyText.length,
  });

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: replyText,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    functions.logger.error('Failed to post reply to API', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });

    // Handle rate limiting
    if (response.status === 429) {
      throw new HttpsError(
        'resource-exhausted',
        'Limite de taux atteinte pour l\'API Google Business Profile. Veuillez réessayer dans quelques minutes.'
      );
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new HttpsError(
        'unauthenticated',
        'Erreur d\'authentification avec l\'API Google Business Profile. Veuillez reconfigurer l\'intégration.'
      );
    }

    // Handle not found (invalid review ID)
    if (response.status === 404) {
      throw new HttpsError(
        'not-found',
        'Avis non trouvé. Vérifiez que l\'ID de l\'avis est correct.'
      );
    }

    // Handle invalid request (e.g., reply too long, already replied)
    if (response.status === 400) {
      throw new HttpsError(
        'invalid-argument',
        'Requête invalide. Vérifiez que l\'avis n\'a pas déjà une réponse ou que le texte n\'est pas trop long.'
      );
    }

    throw new HttpsError(
      'internal',
      `Erreur lors de la publication de la réponse: ${response.statusText}`
    );
  }

  functions.logger.info('Reply posted successfully');
}

/**
 * Cloud Function: Post Reply to Google Business Profile Review
 * 
 * Posts a reply to a Google Business Profile review.
 * Requires admin authentication.
 * Handles OAuth token refresh, validation, rate limiting, and error handling.
 * 
 * Request parameters:
 * - reviewId (required): ID of the review to reply to
 * - replyText (required): Text content of the reply
 * 
 * Response:
 * - success: Boolean indicating operation success
 * - message: Confirmation message
 * 
 * Reference: Section 7.5 of specifications
 */
export const postReply = onCall(
  {
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    // Authentication check
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Vous devez être connecté pour répondre aux avis'
      );
    }

    const userId = request.auth.uid;

    try {
      // Authorization check - only admin users can post replies
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        throw new HttpsError(
          'not-found',
          'Utilisateur non trouvé'
        );
      }

      const userData = userDoc.data();
      const userRole = userData?.role;

      if (userRole !== 'admin') {
        throw new HttpsError(
          'permission-denied',
          'Seuls les administrateurs peuvent répondre aux avis Google'
        );
      }

      // Validate request data
      const { reviewId, replyText } = request.data as PostReplyRequest;

      if (!reviewId || typeof reviewId !== 'string' || reviewId.trim() === '') {
        throw new HttpsError(
          'invalid-argument',
          'reviewId est requis et doit être une chaîne non vide'
        );
      }

      if (!replyText || typeof replyText !== 'string' || replyText.trim() === '') {
        throw new HttpsError(
          'invalid-argument',
          'replyText est requis et doit être une chaîne non vide'
        );
      }

      // Validate reply text length (Google typically has a limit)
      const maxReplyLength = 4096; // Conservative limit
      if (replyText.length > maxReplyLength) {
        throw new HttpsError(
          'invalid-argument',
          `Le texte de la réponse ne doit pas dépasser ${maxReplyLength} caractères`
        );
      }

      // Get Google Business Profile configuration
      const configDoc = await admin.firestore()
        .collection('settings')
        .doc('googleBusinessProfile')
        .get();

      if (!configDoc.exists) {
        throw new HttpsError(
          'failed-precondition',
          'L\'intégration Google Business Profile n\'est pas configurée. Veuillez configurer OAuth 2.0 dans les paramètres.'
        );
      }

      const config = configDoc.data() as GoogleBusinessConfig;

      if (!config.accountId || !config.locationId || !config.accessToken || !config.refreshToken) {
        throw new HttpsError(
          'failed-precondition',
          'Configuration Google Business Profile incomplète. Veuillez reconfigurer l\'intégration.'
        );
      }

      // Get valid access token (refresh if needed)
      const accessToken = await getValidAccessToken(config);

      // Post reply to Google API
      await postReplyToApi(
        accessToken,
        config.locationId,
        reviewId,
        replyText.trim()
      );

      functions.logger.info('Reply posted successfully', {
        userId,
        reviewId,
      });

      return {
        success: true,
        message: 'Réponse publiée avec succès',
      };

    } catch (error) {
      // Log the error
      functions.logger.error('Error in postReply function', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Re-throw HttpsErrors
      if (error instanceof HttpsError) {
        throw error;
      }

      // Wrap other errors
      throw new HttpsError(
        'internal',
        'Une erreur interne est survenue lors de la publication de la réponse'
      );
    }
  }
);
