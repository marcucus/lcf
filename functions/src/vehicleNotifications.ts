import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { sendMulticastNotification } from './notifications';

/**
 * Firestore trigger that runs when a new vehicle is created
 * Sends notifications to all users who have opted in to new vehicle alerts
 */
export const onVehicleCreated = onDocumentCreated(
  'vehicles/{vehicleId}',
  async (event) => {
    logger.info('New vehicle created:', event.params.vehicleId);
    
    const vehicleData = event.data?.data();
    if (!vehicleData) {
      logger.warn('No vehicle data found');
      return null;
    }
    
    const db = admin.firestore();
    
    // Only send notifications for vehicles that are not sold
    if (vehicleData.isSold) {
      logger.info('Vehicle is already sold, skipping notification');
      return null;
    }
    
    try {
      // Get all users who have new vehicle notifications enabled
      const usersSnapshot = await db
        .collection('users')
        .where('notificationPreferences.newVehicles', '==', true)
        .where('fcmToken', '!=', null)
        .get();
      
      if (usersSnapshot.empty) {
        logger.info('No users with new vehicle notifications enabled');
        return null;
      }
      
      logger.info(`Found ${usersSnapshot.size} users to notify`);
      
      // Extract FCM tokens
      const fcmTokens: string[] = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.fcmToken) {
          fcmTokens.push(userData.fcmToken);
        }
      });
      
      if (fcmTokens.length === 0) {
        logger.info('No valid FCM tokens found');
        return null;
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
          vehicleId: event.params.vehicleId,
          url: `/vehicules/${event.params.vehicleId}`,
        }
      );
      
      logger.info('New vehicle notifications sent successfully');
      return null;
    } catch (error) {
      logger.error('Error sending new vehicle notifications:', error);
      throw error;
    }
  });

/**
 * Firestore trigger that runs when a vehicle is updated
 * Can be used to notify when a vehicle price drops or becomes available
 */
export const onVehicleUpdated = onDocumentUpdated(
  'vehicles/{vehicleId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) {
      logger.warn('Missing data in vehicle update event');
      return null;
    }
    
    // Check if vehicle just became available (was sold, now not sold)
    const wasUnavailable = beforeData.isSold === true;
    const isNowAvailable = afterData.isSold === false;
    
    if (wasUnavailable && isNowAvailable) {
      logger.info('Vehicle became available again:', event.params.vehicleId);
      
      const db = admin.firestore();
      
      try {
        // Get all users who have new vehicle notifications enabled
        const usersSnapshot = await db
          .collection('users')
          .where('notificationPreferences.newVehicles', '==', true)
          .where('fcmToken', '!=', null)
          .get();
        
        if (usersSnapshot.empty) {
          logger.info('No users to notify');
          return null;
        }
        
        const fcmTokens: string[] = [];
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.fcmToken) {
            fcmTokens.push(userData.fcmToken);
          }
        });
        
        if (fcmTokens.length === 0) {
          logger.info('No valid FCM tokens found');
          return null;
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
            vehicleId: event.params.vehicleId,
            url: `/vehicules/${event.params.vehicleId}`,
          }
        );
        
        logger.info('Vehicle availability notifications sent');
        return null;
      } catch (error) {
        logger.error('Error sending vehicle availability notifications:', error);
        throw error;
      }
    }
    
    return null;
  });
