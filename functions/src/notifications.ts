import * as admin from 'firebase-admin';

/**
 * Send FCM notification to a single user
 * @param fcmToken - User's FCM token
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data payload
 * @returns Promise<string> - Message ID
 */
export async function sendNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: { [key: string]: string }
): Promise<string> {
  const message = {
    notification: {
      title,
      body,
    },
    data: data || {},
    token: fcmToken,
    webpush: {
      fcmOptions: {
        link: data?.url || '/dashboard',
      },
      notification: {
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send FCM notification to multiple users
 * @param fcmTokens - Array of FCM tokens
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data payload
 * @returns Promise<admin.messaging.BatchResponse>
 */
export async function sendMulticastNotification(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: { [key: string]: string }
): Promise<admin.messaging.BatchResponse> {
  if (fcmTokens.length === 0) {
    throw new Error('No FCM tokens provided');
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: data || {},
    tokens: fcmTokens,
    webpush: {
      fcmOptions: {
        link: data?.url || '/dashboard',
      },
      notification: {
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} notifications`);
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx]);
          console.error(`Failed to send to token ${fcmTokens[idx]}:`, resp.error);
        }
      });
      
      // Clean up invalid tokens from Firestore
      await cleanupInvalidTokens(failedTokens);
    }
    
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw error;
  }
}

/**
 * Remove invalid FCM tokens from user documents
 * @param tokens - Array of invalid tokens
 */
async function cleanupInvalidTokens(tokens: string[]): Promise<void> {
  const db = admin.firestore();
  const batch = db.batch();
  
  for (const token of tokens) {
    const usersRef = db.collection('users').where('fcmToken', '==', token);
    const snapshot = await usersRef.get();
    
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        fcmToken: admin.firestore.FieldValue.delete(),
      });
    });
  }
  
  await batch.commit();
  console.log(`Cleaned up ${tokens.length} invalid FCM tokens`);
}
