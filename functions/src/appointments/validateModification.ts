import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

/**
 * Validates if a user can modify or delete an appointment based on the 24-hour rule.
 * 
 * Business Rule (Section 6.3):
 * - Regular users (role: 'user') cannot modify or cancel appointments within 24 hours
 * - Admin and agendaManager roles can modify appointments at any time
 * 
 * @param appointmentDateTime - The date and time of the appointment
 * @param userRole - The role of the user attempting the modification
 * @returns boolean - true if modification is allowed, false otherwise
 */
export function canModifyAppointment(
  appointmentDateTime: admin.firestore.Timestamp,
  userRole: string
): boolean {
  // Admin and agenda managers can modify appointments without time restrictions
  if (userRole === 'admin' || userRole === 'agendaManager') {
    return true;
  }

  // Calculate time difference for regular users
  const appointmentDate = appointmentDateTime.toDate();
  const now = new Date();
  const diffInMs = appointmentDate.getTime() - now.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  // Regular users must have more than 24 hours until appointment
  return diffInHours > 24;
}

/**
 * Validates if a user is authorized to perform the operation.
 * Throws an error if the user is not found or not authorized.
 * 
 * @param userId - The ID of the user attempting the modification
 * @param appointmentDateTime - The date and time of the appointment
 */
async function validateUserAuthorization(
  userId: string,
  appointmentDateTime: admin.firestore.Timestamp
): Promise<void> {
  // Get user document to check role
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    throw new HttpsError(
      'not-found',
      'Utilisateur non trouvé'
    );
  }

  const userData = userDoc.data();
  const userRole = userData?.role || 'user';

  // Check if user can modify the appointment
  if (!canModifyAppointment(appointmentDateTime, userRole)) {
    throw new HttpsError(
      'permission-denied',
      'Vous ne pouvez pas modifier ou annuler un rendez-vous dans les 24 heures précédant l\'heure prévue. ' +
      'Veuillez contacter le garage directement pour toute modification de dernière minute.'
    );
  }
}

/**
 * Firestore trigger: Validates appointment updates
 * Triggered on appointments collection document update
 */
export const onAppointmentUpdate = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    try {
      const beforeData = event.data?.before.data();
      const afterData = event.data?.after.data();

      if (!beforeData || !afterData) {
        functions.logger.warn('Missing data in appointment update event');
        return;
      }

      // Skip validation if appointment is being completed or already cancelled
      if (afterData.status === 'completed' && beforeData.status !== 'completed') {
        functions.logger.info('Appointment marked as completed, skipping validation', {
          appointmentId: event.params.appointmentId,
        });
        return;
      }

      // Check if this is a status change to cancelled or a modification
      const isCancellation = afterData.status === 'cancelled' && beforeData.status !== 'cancelled';
      const isModification = !isCancellation && (
        afterData.dateTime.toMillis() !== beforeData.dateTime.toMillis() ||
        afterData.serviceType !== beforeData.serviceType
      );

      // Skip if no significant changes
      if (!isCancellation && !isModification) {
        return;
      }

      // Validate the modification
      await validateUserAuthorization(afterData.userId, beforeData.dateTime);

      functions.logger.info('Appointment modification validated', {
        appointmentId: event.params.appointmentId,
        userId: afterData.userId,
        action: isCancellation ? 'cancellation' : 'modification',
      });

    } catch (error) {
      functions.logger.error('Error validating appointment update', {
        appointmentId: event.params.appointmentId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Roll back the change by restoring the previous data
      if (event.data?.after.ref && event.data?.before.data()) {
        await event.data.after.ref.set(event.data.before.data(), { merge: false });
      }

      throw error;
    }
  }
);

/**
 * Firestore trigger: Validates appointment deletions
 * Triggered on appointments collection document delete
 */
export const onAppointmentDelete = onDocumentDeleted(
  'appointments/{appointmentId}',
  async (event) => {
    try {
      const deletedData = event.data?.data();

      if (!deletedData) {
        functions.logger.warn('Missing data in appointment delete event');
        return;
      }

      // Skip validation if appointment is already completed or cancelled
      if (deletedData.status === 'completed' || deletedData.status === 'cancelled') {
        functions.logger.info('Deleting completed/cancelled appointment, skipping validation', {
          appointmentId: event.params.appointmentId,
        });
        return;
      }

      // Validate the deletion
      await validateUserAuthorization(deletedData.userId, deletedData.dateTime);

      functions.logger.info('Appointment deletion validated', {
        appointmentId: event.params.appointmentId,
        userId: deletedData.userId,
      });

    } catch (error) {
      functions.logger.error('Error validating appointment deletion', {
        appointmentId: event.params.appointmentId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Restore the deleted appointment
      if (event.data?.ref && event.data?.data()) {
        await event.data.ref.set(event.data.data());
      }

      throw error;
    }
  }
);

/**
 * Callable function: Validates if a user can modify a specific appointment
 * Can be called from the client to check before attempting modifications
 * 
 * @param data - Object containing appointmentId
 * @param context - Function context with auth information
 * @returns Object with canModify boolean and optional message
 */
export const validateAppointmentModification = onCall(
  async (request) => {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Vous devez être connecté pour effectuer cette action'
      );
    }

    const { appointmentId } = request.data;

    if (!appointmentId) {
      throw new HttpsError(
        'invalid-argument',
        'L\'ID du rendez-vous est requis'
      );
    }

    try {
      // Get the appointment
      const appointmentDoc = await admin.firestore()
        .collection('appointments')
        .doc(appointmentId)
        .get();

      if (!appointmentDoc.exists) {
        throw new HttpsError(
          'not-found',
          'Rendez-vous non trouvé'
        );
      }

      const appointmentData = appointmentDoc.data();

      // Verify the user owns this appointment or is an admin
      const userId = request.auth.uid;
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new HttpsError(
          'not-found',
          'Utilisateur non trouvé'
        );
      }

      const userData = userDoc.data();
      const userRole = userData?.role || 'user';

      // Check ownership for regular users
      if (userRole === 'user' && appointmentData?.userId !== userId) {
        throw new HttpsError(
          'permission-denied',
          'Vous n\'avez pas les permissions pour modifier ce rendez-vous'
        );
      }

      // Check 24-hour rule
      const canModify = canModifyAppointment(
        appointmentData?.dateTime,
        userRole
      );

      return {
        canModify,
        message: canModify 
          ? 'Vous pouvez modifier ce rendez-vous' 
          : 'Impossible de modifier ce rendez-vous dans les 24 heures précédant l\'heure prévue',
        appointmentDateTime: appointmentData?.dateTime.toDate().toISOString(),
      };

    } catch (error) {
      functions.logger.error('Error in validateAppointmentModification', {
        appointmentId,
        userId: request.auth.uid,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        'internal',
        'Une erreur est survenue lors de la validation'
      );
    }
  }
);
