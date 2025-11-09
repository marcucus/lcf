import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { sendNotification } from './notifications';

/**
 * Scheduled function that runs every hour to check for appointments
 * that need reminders (24 hours before the appointment)
 */
export const sendAppointmentReminders = onSchedule(
  {
    schedule: 'every 1 hours',
    timeZone: 'Europe/Paris',
  },
  async (event) => {
    console.log('Running appointment reminder check...');
    
    const db = admin.firestore();
    const now = new Date();
    
    // Calculate the time window: 24 hours from now, with 1 hour buffer
    const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead
    const bufferStart = new Date(reminderTime.getTime() - 30 * 60 * 1000); // 30 min before
    const bufferEnd = new Date(reminderTime.getTime() + 30 * 60 * 1000); // 30 min after
    
    try {
      // Query appointments that are in the reminder window
      const appointmentsSnapshot = await db
        .collection('appointments')
        .where('status', '==', 'confirmed')
        .where('dateTime', '>=', admin.firestore.Timestamp.fromDate(bufferStart))
        .where('dateTime', '<=', admin.firestore.Timestamp.fromDate(bufferEnd))
        .get();
      
      if (appointmentsSnapshot.empty) {
        console.log('No appointments found needing reminders');
        return;
      }
      
      console.log(`Found ${appointmentsSnapshot.size} appointments to remind`);
      
      // Process each appointment
      const promises = appointmentsSnapshot.docs.map(async (doc) => {
        const appointment = doc.data();
        const userId = appointment.userId;
        
        // Check if reminder was already sent
        if (appointment.reminderSent) {
          console.log(`Reminder already sent for appointment ${doc.id}`);
          return;
        }
        
        // Get user document
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
          console.error(`User ${userId} not found`);
          return;
        }
        
        const userData = userDoc.data();
        const fcmToken = userData?.fcmToken;
        const preferences = userData?.notificationPreferences;
        
        // Check if user has notification enabled for appointment reminders
        if (!preferences?.appointmentReminders) {
          console.log(`User ${userId} has disabled appointment reminders`);
          return;
        }
        
        if (!fcmToken) {
          console.log(`User ${userId} has no FCM token`);
          return;
        }
        
        // Format appointment details
        const appointmentDate = appointment.dateTime.toDate();
        const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedTime = appointmentDate.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        
        const serviceTypeLabels: { [key: string]: string } = {
          entretien: 'Entretien',
          reparation: 'Réparation',
          reprogrammation: 'Re-programmation',
        };
        
        const serviceLabel = serviceTypeLabels[appointment.serviceType] || appointment.serviceType;
        
        // Send notification
        try {
          await sendNotification(
            fcmToken,
            'Rappel de rendez-vous',
            `Votre rendez-vous pour ${serviceLabel} est prévu demain ${formattedDate} à ${formattedTime}`,
            {
              type: 'appointment_reminder',
              appointmentId: doc.id,
              url: '/dashboard',
            }
          );
          
          // Mark reminder as sent
          await doc.ref.update({
            reminderSent: true,
            reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          console.log(`Reminder sent for appointment ${doc.id}`);
        } catch (error) {
          console.error(`Failed to send reminder for appointment ${doc.id}:`, error);
        }
      });
      
      await Promise.all(promises);
      console.log('Appointment reminders processed successfully');
      
    } catch (error) {
      console.error('Error processing appointment reminders:', error);
      throw error;
    }
  }
);
