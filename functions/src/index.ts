import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all appointment validation functions
export {
  onAppointmentUpdate,
  onAppointmentDelete,
  validateAppointmentModification,
} from './appointments/validateModification';
