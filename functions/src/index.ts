import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all Cloud Functions
export { sendAppointmentReminders } from './appointmentReminders';
export { onVehicleCreated, onVehicleUpdated } from './vehicleNotifications';
