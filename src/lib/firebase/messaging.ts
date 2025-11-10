import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Request notification permission from the user
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Get FCM token for the current device
 * @param userId - User ID to associate the token with
 * @returns Promise<string | null> - FCM token or null if failed
 */
export async function getFCMToken(userId: string): Promise<string | null> {
  try {
    if (!messaging) {
      console.warn('Firebase Messaging not initialized');
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    // Request permission first
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey });
    
    if (token) {
      console.log('FCM Token obtained:', token);
      
      // Save token to Firestore
      await saveFCMToken(userId, token);
      
      return token;
    } else {
      console.warn('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Save FCM token to user document in Firestore
 * @param userId - User ID
 * @param token - FCM token
 */
export async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    if (!db) {
      console.warn('Firestore not initialized');
      return;
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: token,
      fcmTokenUpdatedAt: new Date().toISOString(),
    });
    
    console.log('FCM token saved to Firestore');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

/**
 * Remove FCM token from user document
 * @param userId - User ID
 */
export async function removeFCMToken(userId: string): Promise<void> {
  try {
    if (!db) {
      console.warn('Firestore not initialized');
      return;
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: null,
      fcmTokenUpdatedAt: new Date().toISOString(),
    });
    
    console.log('FCM token removed from Firestore');
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
}

/**
 * Setup foreground message listener
 * @param callback - Callback function to handle incoming messages
 */
export function onForegroundMessage(callback: (payload: any) => void): void {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
}

/**
 * Check if browser supports notifications
 * @returns boolean
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission status
 * @returns NotificationPermission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}
