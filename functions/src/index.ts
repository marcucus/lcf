import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all appointment validation functions
export {
  onAppointmentUpdate,
  onAppointmentDelete,
  validateAppointmentModification,
} from './appointments/validateModification';
// Export all Cloud Functions
export { sendAppointmentReminders } from './appointmentReminders';
export { onVehicleCreated, onVehicleUpdated } from './vehicleNotifications';

// Export OAuth functions
export {
  initiateOAuth,
  handleOAuthCallback,
  refreshOAuthToken,
  disconnectOAuth,
  autoRefreshTokens,
} from './oauth/googleOAuth';
