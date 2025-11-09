import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { sendEmail, generateAppointmentConfirmationEmail } from '../services/email';

/**
 * Firestore trigger that runs when a new appointment is created
 * Sends a confirmation email to the customer
 * 
 * Reference: Section 6.1 of specifications - Appointment confirmation workflow
 */
export const onAppointmentCreate = onDocumentCreated(
  'appointments/{appointmentId}',
  async (event) => {
    const appointmentId = event.params.appointmentId;
    logger.info('New appointment created', { appointmentId });

    try {
      // Get appointment data
      const appointmentData = event.data?.data();
      
      if (!appointmentData) {
        logger.warn('No appointment data found', { appointmentId });
        return;
      }

      // Get user data to retrieve email address
      const userId = appointmentData.userId;
      if (!userId) {
        logger.error('No userId found in appointment', { appointmentId });
        return;
      }

      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        logger.error('User not found', { appointmentId, userId });
        return;
      }

      const userData = userDoc.data();
      const userEmail = userData?.email;

      if (!userEmail) {
        logger.error('No email found for user', { appointmentId, userId });
        return;
      }

      // Extract appointment details
      const customerName = appointmentData.customerName || userData.displayName || 'Client';
      const serviceType = appointmentData.serviceType;
      const dateTime = appointmentData.dateTime.toDate();
      const vehicleInfo = appointmentData.vehicleInfo || {};
      const customerNotes = appointmentData.customerNotes;

      // Generate email content
      const { html, text } = generateAppointmentConfirmationEmail({
        customerName,
        serviceType,
        dateTime,
        vehicleInfo,
        customerNotes,
        appointmentId,
      });

      // Send confirmation email
      await sendEmail(
        userEmail,
        'Confirmation de votre rendez-vous - LCF AUTO PERFORMANCE',
        html,
        text
      );

      logger.info('Appointment confirmation email sent successfully', {
        appointmentId,
        userId,
        userEmail,
      });

      // Update appointment document to mark email as sent
      await event.data?.ref.update({
        confirmationEmailSent: true,
        confirmationEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    } catch (error) {
      logger.error('Error sending appointment confirmation email', {
        appointmentId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      // Don't throw error to avoid retries that might spam the user
      // The email failure is logged and can be handled manually if needed
    }
  }
);
