import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { sendMulticastNotification } from './notifications';

/**
 * Firestore trigger that runs when a new vehicle is created
 * Sends notifications to all users who have opted in to new vehicle alerts
 */
export const onVehicleCreated = onDocumentCreated(
  'vehicles/{vehicleId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }
    const context = event;
    console.log('New vehicle created:', context.params?.vehicleId);
    
    const vehicleData = snapshot.data();
    const db = admin.firestore();
    
    // Only send notifications for vehicles that are not sold
    if (vehicleData.isSold) {
      console.log('Vehicle is already sold, skipping notification');
      return;
    }
    
    try {
      // Get all users who have new vehicle notifications enabled
      const usersSnapshot = await db
        .collection('users')
        .where('notificationPreferences.newVehicles', '==', true)
        .where('fcmToken', '!=', null)
        .get();
      
      if (usersSnapshot.empty) {
        console.log('No users with new vehicle notifications enabled');
        return;
      }
      
      console.log(`Found ${usersSnapshot.size} users to notify`);
      
      // Extract FCM tokens
      const fcmTokens: string[] = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.fcmToken) {
          fcmTokens.push(userData.fcmToken);
        }
      });
      
      if (fcmTokens.length === 0) {
        console.log('No valid FCM tokens found');
        return;
      }
      
      // Format notification message
      const make = vehicleData.make || '';
      const model = vehicleData.model || '';
      const year = vehicleData.year || '';
      const price = vehicleData.price || 0;
      
      const title = 'Nouveau véhicule disponible';
      const body = `${make} ${model} ${year} - ${price.toLocaleString('fr-FR')}€ maintenant disponible à la vente`;
      
      // Send notification to all eligible users
      await sendMulticastNotification(
        fcmTokens,
        title,
        body,
        {
          type: 'new_vehicle',
          vehicleId: context.params?.vehicleId || '',
          url: `/vehicules/${context.params?.vehicleId}`,
        }
      );
      
      console.log('New vehicle notifications sent successfully');
    } catch (error) {
      console.error('Error sending new vehicle notifications:', error);
      throw error;
    }
  }
);

/**
 * Firestore trigger that runs when a vehicle is updated
 * Can be used to notify when a vehicle price drops or becomes available
 */
export const onVehicleUpdated = onDocumentUpdated(
  'vehicles/{vehicleId}',
  async (event) => {
    const change = event.data;
    if (!change) {
      console.log('No data associated with the event');
      return;
    }
    const context = event;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    // Check if vehicle just became available (was sold, now not sold)
    const wasUnavailable = beforeData.isSold === true;
    const isNowAvailable = afterData.isSold === false;
    
    if (wasUnavailable && isNowAvailable) {
      console.log('Vehicle became available again:', context.params?.vehicleId);
      
      const db = admin.firestore();
      
      try {
        // Get all users who have new vehicle notifications enabled
        const usersSnapshot = await db
          .collection('users')
          .where('notificationPreferences.newVehicles', '==', true)
          .where('fcmToken', '!=', null)
          .get();
        
        if (usersSnapshot.empty) {
          console.log('No users to notify');
          return;
        }
        
        const fcmTokens: string[] = [];
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.fcmToken) {
            fcmTokens.push(userData.fcmToken);
          }
        });
        
        if (fcmTokens.length === 0) {
          console.log('No valid FCM tokens found');
          return;
        }
        
        const make = afterData.make || '';
        const model = afterData.model || '';
        const year = afterData.year || '';
        
        const title = 'Véhicule de nouveau disponible';
        const body = `${make} ${model} ${year} est de nouveau disponible à la vente`;
        
        await sendMulticastNotification(
          fcmTokens,
          title,
          body,
          {
            type: 'vehicle_available',
            vehicleId: context.params?.vehicleId || '',
            url: `/vehicules/${context.params?.vehicleId}`,
          }
        );
        
        console.log('Vehicle availability notifications sent');
      } catch (error) {
        console.error('Error sending vehicle availability notifications:', error);
        throw error;
      }
    }
  }
);
