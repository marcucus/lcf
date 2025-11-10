import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { sendMulticastNotification } from './notifications';

/**
 * Firestore trigger that runs when a new appointment is created
 * Sends notifications to all admin and agendaManager users
 */
export const onAppointmentCreated = onDocumentCreated(
  'appointments/{appointmentId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }
    const context = event;
    console.log('New appointment created:', context.params?.appointmentId);
    
    const appointmentData = snapshot.data();
    const db = admin.firestore();
    
    try {
      // Get all admin and agendaManager users who should be notified
      const usersSnapshot = await db
        .collection('users')
        .where('role', 'in', ['admin', 'agendaManager'])
        .where('fcmToken', '!=', null)
        .get();
      
      if (usersSnapshot.empty) {
        console.log('No admin users with notifications enabled');
        return;
      }
      
      console.log(`Found ${usersSnapshot.size} admin users to notify`);
      
      // Extract FCM tokens from admin users who have preferences enabled
      const fcmTokens: string[] = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        // Check if admin has enabled new appointment notifications
        // Default to true if preference not set
        const hasNotificationEnabled = userData.notificationPreferences?.newAppointments !== false;
        
        if (userData.fcmToken && hasNotificationEnabled) {
          fcmTokens.push(userData.fcmToken);
        }
      });
      
      if (fcmTokens.length === 0) {
        console.log('No admin users with valid FCM tokens and enabled preferences');
        return;
      }
      
      // Format notification message
      const customerName = appointmentData.customerName || 'Client';
      const serviceTypeLabels: { [key: string]: string } = {
        entretien: 'Entretien',
        reparation: 'Réparation',
        reprogrammation: 'Re-programmation',
      };
      const serviceLabel = serviceTypeLabels[appointmentData.serviceType] || appointmentData.serviceType;
      
      const appointmentDate = appointmentData.dateTime?.toDate();
      const formattedDate = appointmentDate ? appointmentDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : '';
      const formattedTime = appointmentDate ? appointmentDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }) : '';
      
      const title = 'Nouveau rendez-vous';
      const body = `${customerName} a pris rendez-vous pour ${serviceLabel} le ${formattedDate} à ${formattedTime}`;
      
      // Send notification to all eligible admin users
      await sendMulticastNotification(
        fcmTokens,
        title,
        body,
        {
          type: 'new_appointment',
          appointmentId: context.params?.appointmentId || '',
          url: '/admin/calendar',
        }
      );
      
      console.log('Admin notification sent successfully for new appointment');
    } catch (error) {
      console.error('Error sending admin notification for new appointment:', error);
      throw error;
    }
  }
);
