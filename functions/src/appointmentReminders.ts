import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { sendNotification } from './notifications';

const SERVICE_LABELS: Record<string, string> = {
  entretien: 'Entretien général',
  reparation: 'Réparation',
  reprogrammation: 'Reprogrammation moteur',
};

/**
 * Send email reminder via Resend API (no SDK needed — Node 18 has global fetch).
 */
async function sendReminderEmail(
  toEmail: string,
  firstName: string,
  serviceType: string,
  formattedDate: string,
  formattedTime: string,
  vehicleInfo: { make?: string; model?: string; plate?: string } | undefined
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn('RESEND_API_KEY not set — skipping reminder email');
    return;
  }

  const svc = SERVICE_LABELS[serviceType] ?? serviceType;
  const vehicleStr = vehicleInfo
    ? `${vehicleInfo.make ?? ''} ${vehicleInfo.model ?? ''} (${vehicleInfo.plate ?? ''})`.trim()
    : '';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#2563EB,#1CCEFF);padding:32px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">⏰</div>
      <h1 style="color:#fff;margin:0 0 8px;font-size:24px;">Rappel de rendez-vous</h1>
      <p style="color:rgba(255,255,255,0.85);margin:0;">Votre rendez-vous est demain !</p>
    </div>
    <div style="padding:24px;">
      <p style="color:#374151;">Bonjour ${firstName}, nous vous rappelons votre rendez-vous prévu demain.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 4px;color:#6B7280;">🔧 Prestation</td><td style="padding:8px 4px;font-weight:600;color:#111827;">${svc}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px 4px;color:#6B7280;">📅 Date</td><td style="padding:8px 4px;font-weight:600;color:#111827;">${formattedDate}</td></tr>
        <tr><td style="padding:8px 4px;color:#6B7280;">🕐 Heure</td><td style="padding:8px 4px;font-weight:600;color:#111827;">${formattedTime}</td></tr>
        ${vehicleStr ? `<tr style="background:#f9fafb;"><td style="padding:8px 4px;color:#6B7280;">🚗 Véhicule</td><td style="padding:8px 4px;font-weight:600;color:#111827;">${vehicleStr}</td></tr>` : ''}
      </table>
      <div style="background:#EFF6FF;border-left:4px solid #1CCEFF;border-radius:0 6px 6px 0;padding:12px 16px;margin-top:16px;">
        <strong style="color:#1e40af;">ℹ️ Informations pratiques</strong>
        <ul style="margin:8px 0 0;padding-left:18px;color:#374151;">
          <li>Adresse : 6 Rue de la Forteresse, 41330 Saint-Bohaire, France</li>
          <li>Téléphone : 07 61 88 82 63</li>
          <li>En cas d'empêchement, merci de nous prévenir dès que possible.</li>
        </ul>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f9fafb;text-align:center;color:#9CA3AF;font-size:12px;">
      LCF Auto Performance — lcfautoperformance@outlook.fr
    </div>
  </div>
</body>
</html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'LCF Auto Performance <onboarding@resend.dev>',
      to: [process.env.EMAIL_TEST_RECIPIENT ?? toEmail],
      subject: 'Rappel : votre rendez-vous de demain ⏰',
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    logger.error(`[Email] Resend error for reminder to ${toEmail}:`, err);
  } else {
    logger.info(`[Email] Reminder email sent to ${toEmail}`);
  }
}

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
      
      logger.info(`Found ${appointmentsSnapshot.size} appointments to remind`);
      
      // Process each appointment
      const promises = appointmentsSnapshot.docs.map(async (doc) => {
        const appointment = doc.data();
        const userId = appointment.userId;
        
        // Check if reminder was already sent
        if (appointment.reminderSent) {
          logger.info(`Reminder already sent for appointment ${doc.id}`);
          return;
        }
        
        // Get user document
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
          logger.error(`User ${userId} not found`);
          return;
        }
        
        const userData = userDoc.data();
        const fcmToken = userData?.fcmToken;
        const preferences = userData?.notificationPreferences;
        
        // Check if user has reminders enabled (gates both push and email)
        if (!preferences?.appointmentReminders) {
          logger.info(`User ${userId} has disabled appointment reminders`);
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

        // Send push notification (only if user has an FCM token)
        if (fcmToken) {
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
          } catch (error) {
            logger.error(`Failed to send push reminder for appointment ${doc.id}:`, error);
          }
        }

        // #7 — Send email reminder (independent of push notification)
        const userEmail = userData?.email;
        if (userEmail) {
          try {
            await sendReminderEmail(
              userEmail,
              userData?.firstName || userData?.email || '',
              appointment.serviceType,
              formattedDate,
              formattedTime,
              appointment.vehicleInfo
            );
          } catch (error) {
            logger.error(`Failed to send email reminder for appointment ${doc.id}:`, error);
          }
        }
        
        // Mark reminder as sent
        try {
          await doc.ref.update({
            reminderSent: true,
            reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          logger.info(`Reminder sent for appointment ${doc.id}`);
        } catch (error) {
          logger.error(`Failed to mark reminder as sent for appointment ${doc.id}:`, error);
        }
      });
      
      await Promise.all(promises);
      console.log('Appointment reminders processed successfully');
      
    } catch (error) {
      logger.error('Error processing appointment reminders:', error);
      throw error;
    }
  }
);
