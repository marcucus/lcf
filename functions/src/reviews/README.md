# Google Reviews Cloud Function

This directory contains the Cloud Function for retrieving Google Business Profile reviews.

## Overview

The `getReviews` Cloud Function provides a secure server-side proxy for fetching reviews from Google Business Profile API. It implements OAuth 2.0 token management, pagination, error handling, and rate limiting as specified in Section 7.5 of the project specifications.

## Features

- **Secure Authentication**: Admin-only access with Firebase Authentication
- **OAuth 2.0 Token Management**: Automatic token refresh with 5-minute buffer
- **Pagination Support**: Fetch up to 50 reviews per request with pagination tokens
- **Comprehensive Error Handling**: Handles all API errors gracefully
- **Rate Limiting**: Detects and reports rate limit errors
- **Structured Logging**: All operations logged for debugging and monitoring

## Function: `getReviews`

### Authentication & Authorization

- **Authentication**: Requires user to be logged in via Firebase Auth
- **Authorization**: Only users with `role: 'admin'` can call this function
- **Security**: API credentials never exposed to client (server-side only)

### Request Parameters

```typescript
{
  pageSize?: number;    // Optional: Number of reviews to fetch (1-50, default: 20)
  pageToken?: string;   // Optional: Token for pagination
}
```

### Response Format

```typescript
{
  reviews: ParsedReview[];     // Array of review objects
  nextPageToken?: string;      // Token for fetching next page (if available)
  totalCount: number;          // Number of reviews in this response
}
```

### Review Object Structure

Each review in the response array has the following structure:

```typescript
{
  reviewId: string;           // Unique review identifier
  reviewerName: string;       // Name of reviewer (or "Anonyme")
  reviewerPhotoUrl?: string;  // Profile photo URL (if available)
  rating: number;             // Star rating (1-5)
  comment: string;            // Review text
  createTime: string;         // ISO timestamp
  updateTime: string;         // ISO timestamp
  hasReply: boolean;          // Whether business has replied
  reply?: {                   // Reply object (if exists)
    comment: string;
    updateTime: string;
  }
}
```

## Configuration

### Firestore Configuration

The function requires a configuration document in Firestore:

**Path**: `settings/googleBusinessProfile`

**Required Fields**:
```typescript
{
  accountId: string;        // Google Business account ID
  locationId: string;       // Location ID
  accessToken: string;      // OAuth 2.0 access token
  refreshToken: string;     // OAuth 2.0 refresh token
  tokenExpiry: Timestamp;   // Token expiration timestamp
}
```

### Environment Variables

The following environment variables must be configured for token refresh:

- `GOOGLE_CLIENT_ID`: OAuth 2.0 client ID
- `GOOGLE_CLIENT_SECRET`: OAuth 2.0 client secret

These can be set using:
```bash
firebase functions:config:set google.client_id="your-client-id"
firebase functions:config:set google.client_secret="your-client-secret"
```

Or in `.env` file for local development:
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Error Handling

The function handles the following error scenarios:

| Error Code | Scenario | Message |
|------------|----------|---------|
| `unauthenticated` | User not logged in | "Vous devez être connecté pour accéder aux avis" |
| `permission-denied` | Non-admin user | "Seuls les administrateurs peuvent accéder aux avis Google" |
| `failed-precondition` | Missing/incomplete config | Configuration error messages |
| `invalid-argument` | Invalid parameters | "pageSize doit être entre 1 et 50" |
| `resource-exhausted` | Rate limit exceeded | Rate limit guidance message |
| `internal` | Other errors | Generic error message |

## Usage Example

### Client-side (JavaScript/TypeScript)

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const getReviews = httpsCallable(functions, 'getReviews');

// Fetch first page of reviews
try {
  const result = await getReviews({ pageSize: 20 });
  console.log('Reviews:', result.data.reviews);
  console.log('Total:', result.data.totalCount);
  
  // Fetch next page if available
  if (result.data.nextPageToken) {
    const nextPage = await getReviews({
      pageSize: 20,
      pageToken: result.data.nextPageToken
    });
    console.log('Next page:', nextPage.data.reviews);
  }
} catch (error) {
  console.error('Error fetching reviews:', error.message);
}
```

### Admin SDK (Server-side)

```typescript
import * as admin from 'firebase-admin';

const callable = admin.functions().httpsCallable('getReviews');
const result = await callable({ pageSize: 20 });
console.log(result.data);
```

## Logging

The function logs the following events:

- **Info**: Token refresh, successful fetches, review counts
- **Warn**: Missing data, configuration issues
- **Error**: API errors, authentication failures, exceptions

Example log entry:
```
INFO: Reviews fetched successfully
  userId: abc123
  count: 15
  hasNextPage: true
```

## Testing

See `../tests/getReviews.test.ts` for comprehensive test scenarios covering:
- Authentication and authorization
- Configuration validation
- Parameter validation
- Pagination
- Token refresh
- Error handling
- Rate limiting
- Review data parsing

## API Reference

This function uses the Google My Business API v4.9:
- Endpoint: `https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews`
- Documentation: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list

## Performance

- **Timeout**: 60 seconds
- **Memory**: 256 MiB
- **Cold Start**: ~1-2 seconds
- **Warm Execution**: ~200-500ms (depending on API response)

## Security Considerations

1. **API Keys**: OAuth credentials stored as environment variables, never in code
2. **Tokens**: Access/refresh tokens stored securely in Firestore
3. **Authorization**: Admin-only access enforced server-side
4. **Validation**: All inputs validated before processing
5. **Error Messages**: Sensitive details never exposed to client

## Monitoring

Consider setting up monitoring for:
- Token refresh failures (indicates OAuth configuration issues)
- Repeated rate limit errors (indicates usage patterns)
- Authentication errors (indicates token/configuration problems)
- High error rates (indicates API or configuration issues)

## Future Enhancements

Potential improvements for future iterations:
- Caching mechanism to reduce API calls
- Webhook support for real-time review notifications
- Bulk operations for fetching all reviews
- Review statistics and analytics
- Support for filtering reviews by date range or rating
