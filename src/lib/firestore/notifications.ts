import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { NotificationPreferences } from '@/types';

/**
 * Get user's notification preferences
 * @param userId - User ID
 * @returns Promise<NotificationPreferences>
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.notificationPreferences || {
        appointmentReminders: true,
        newVehicles: true,
        generalUpdates: true,
      };
    }
    
    // Default preferences
    return {
      appointmentReminders: true,
      newVehicles: true,
      generalUpdates: true,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw error;
  }
}

/**
 * Update user's notification preferences
 * @param userId - User ID
 * @param preferences - Notification preferences to update
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const userRef = doc(db, 'users', userId);
    const currentPrefs = await getNotificationPreferences(userId);
    
    await updateDoc(userRef, {
      notificationPreferences: {
        ...currentPrefs,
        ...preferences,
      },
    });
    
    console.log('Notification preferences updated');
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

/**
 * Check if user has enabled a specific notification type
 * @param userId - User ID
 * @param type - Notification type
 * @returns Promise<boolean>
 */
export async function isNotificationEnabled(
  userId: string,
  type: keyof NotificationPreferences
): Promise<boolean> {
  try {
    const preferences = await getNotificationPreferences(userId);
    return preferences[type] ?? true;
  } catch (error) {
    console.error('Error checking notification preference:', error);
    return false;
  }
}
