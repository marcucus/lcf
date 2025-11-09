import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

/**
 * Interface representing a Google Business Profile Review
 * Based on Google My Business API v4.9
 */
interface GoogleReview {
  reviewId: string;
  reviewer: {
    profilePhotoUrl?: string;
    displayName: string;
    isAnonymous?: boolean;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

/**
 * Parsed review interface for client consumption
 */
interface ParsedReview {
  reviewId: string;
  reviewerName: string;
  reviewerPhotoUrl?: string;
  rating: number;
  comment: string;
  createTime: string;
  updateTime: string;
  hasReply: boolean;
  reply?: {
    comment: string;
    updateTime: string;
  };
}

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
 * Converts star rating enum to numeric value
 */
function starRatingToNumber(rating: string): number {
  const ratingMap: Record<string, number> = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5,
  };
  return ratingMap[rating] || 0;
}

/**
 * Parses Google Business Profile API review data
 */
function parseReview(review: GoogleReview): ParsedReview {
  return {
    reviewId: review.reviewId,
    reviewerName: review.reviewer.displayName || 'Anonyme',
    reviewerPhotoUrl: review.reviewer.profilePhotoUrl,
    rating: starRatingToNumber(review.starRating),
    comment: review.comment || '',
    createTime: review.createTime,
    updateTime: review.updateTime,
    hasReply: !!review.reviewReply,
    reply: review.reviewReply ? {
      comment: review.reviewReply.comment,
      updateTime: review.reviewReply.updateTime,
    } : undefined,
  };
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
 * Fetches reviews from Google Business Profile API with pagination
 * 
 * @param accessToken - Valid OAuth 2.0 access token
 * @param accountId - Google Business account ID
 * @param locationId - Location ID
 * @param pageSize - Number of reviews per page (max 50)
 * @param pageToken - Token for pagination
 * @returns Reviews and next page token
 */
async function fetchReviewsFromApi(
  accessToken: string,
  accountId: string,
  locationId: string,
  pageSize: number = 20,
  pageToken?: string
): Promise<{
  reviews: GoogleReview[];
  nextPageToken?: string;
}> {
  const url = new URL(
    `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`
  );
  
  url.searchParams.append('pageSize', Math.min(pageSize, 50).toString());
  if (pageToken) {
    url.searchParams.append('pageToken', pageToken);
  }

  functions.logger.info('Fetching reviews from Google Business Profile API', {
    accountId,
    locationId,
    pageSize,
    hasPageToken: !!pageToken,
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    functions.logger.error('Failed to fetch reviews from API', {
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

    throw new HttpsError(
      'internal',
      `Erreur lors de la récupération des avis: ${response.statusText}`
    );
  }

  const data = await response.json();
  
  return {
    reviews: data.reviews || [],
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Cloud Function: Get Google Business Profile Reviews
 * 
 * Retrieves reviews from Google Business Profile API.
 * Requires admin authentication.
 * Handles OAuth token refresh, pagination, rate limiting, and error handling.
 * 
 * Request parameters:
 * - pageSize (optional): Number of reviews to fetch (default: 20, max: 50)
 * - pageToken (optional): Token for pagination
 * 
 * Response:
 * - reviews: Array of parsed review objects
 * - nextPageToken: Token for fetching next page (if available)
 * - totalCount: Total number of reviews returned in this call
 * 
 * Reference: Section 7.5 of specifications
 */
export const getReviews = onCall(
  {
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    // Authentication check
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Vous devez être connecté pour accéder aux avis'
      );
    }

    const userId = request.auth.uid;

    try {
      // Authorization check - only admin users can fetch reviews
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
          'Seuls les administrateurs peuvent accéder aux avis Google'
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

      // Parse request parameters
      const { pageSize = 20, pageToken } = request.data || {};

      if (pageSize && (pageSize < 1 || pageSize > 50)) {
        throw new HttpsError(
          'invalid-argument',
          'pageSize doit être entre 1 et 50'
        );
      }

      // Fetch reviews from Google API
      const { reviews, nextPageToken } = await fetchReviewsFromApi(
        accessToken,
        config.accountId,
        config.locationId,
        pageSize,
        pageToken
      );

      // Parse reviews for client consumption
      const parsedReviews = reviews.map(parseReview);

      functions.logger.info('Reviews fetched successfully', {
        userId,
        count: parsedReviews.length,
        hasNextPage: !!nextPageToken,
      });

      return {
        reviews: parsedReviews,
        nextPageToken,
        totalCount: parsedReviews.length,
      };

    } catch (error) {
      // Log the error
      functions.logger.error('Error in getReviews function', {
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
        'Une erreur interne est survenue lors de la récupération des avis'
      );
    }
  }
);
