import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all appointment validation functions
export {
  onAppointmentUpdate,
  onAppointmentDelete,
  validateAppointmentModification,
} from './appointments/validateModification';

// Export appointment confirmation function
export { onAppointmentCreate } from './appointments/onAppointmentCreate';

// Export all Cloud Functions
export { sendAppointmentReminders } from './appointmentReminders';
export { onVehicleCreated, onVehicleUpdated } from './vehicleNotifications';
// Export admin notification functions
export { onAppointmentCreated } from './adminNotifications';
// Export Google Reviews functions
export { getReviews } from './reviews/getReviews';
export { postReply } from './reviews/postReply';

// Export OAuth functions
export {
  initiateOAuth,
  handleOAuthCallback,
  refreshOAuthToken,
  disconnectOAuth,
  autoRefreshTokens,
} from './oauth/googleOAuth';
