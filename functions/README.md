# Firebase Cloud Functions - LCF Auto Performance

This directory contains the Firebase Cloud Functions for the LCF Auto Performance application.

## Features

### 1. Appointment Reminders (`sendAppointmentReminders`)
- **Type**: Scheduled function (runs every hour)
- **Purpose**: Sends push notifications to users 24 hours before their appointments
- **Checks**: 
  - Only sends to users with notification preferences enabled
  - Only sends to confirmed appointments
  - Marks reminders as sent to avoid duplicates

### 2. New Vehicle Notifications (`onVehicleCreated`)
- **Type**: Firestore trigger
- **Purpose**: Notifies all subscribed users when a new vehicle is added to the catalog
- **Checks**:
  - Only sends for vehicles that are not sold
  - Only sends to users who have opted in to new vehicle notifications

### 3. Vehicle Availability Updates (`onVehicleUpdated`)
- **Type**: Firestore trigger
- **Purpose**: Notifies users when a previously sold vehicle becomes available again
- **Checks**:
  - Only triggers when vehicle status changes from sold to available

## Setup

### Prerequisites
- Node.js 18 or higher
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project configured

### Installation

1. Navigate to the functions directory:
   ```bash
   cd functions
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

### Configuration

The Cloud Functions use Firebase Admin SDK which is automatically configured when deployed to Firebase.

For local development, you'll need to:
1. Download the service account key from Firebase Console
2. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### Deployment

Deploy all functions:
```bash
npm run deploy
```

Deploy a specific function:
```bash
firebase deploy --only functions:sendAppointmentReminders
firebase deploy --only functions:onVehicleCreated
firebase deploy --only functions:onVehicleUpdated
```

### Local Development

Run the Firebase emulator:
```bash
npm run serve
```

This will start the Functions emulator and allow you to test your functions locally.

### Testing

You can test the scheduled function manually:
```bash
firebase functions:shell
sendAppointmentReminders()
```

## Function Details

### sendAppointmentReminders
- **Schedule**: Every 1 hour
- **Timezone**: Europe/Paris
- **Logic**:
  1. Queries appointments 24 hours in the future (±30 min buffer)
  2. Checks if reminder was already sent
  3. Verifies user has notifications enabled
  4. Sends FCM notification
  5. Marks appointment as reminder sent

### onVehicleCreated
- **Trigger**: On vehicle document creation in Firestore
- **Logic**:
  1. Checks if vehicle is not sold
  2. Queries all users with newVehicles notification enabled
  3. Sends multicast notification to all eligible users
  4. Cleans up invalid FCM tokens

### onVehicleUpdated
- **Trigger**: On vehicle document update in Firestore
- **Logic**:
  1. Detects when a vehicle changes from sold to available
  2. Notifies all subscribed users
  3. Cleans up invalid tokens

## Notification Format

All notifications include:
- **Title**: Short, descriptive title
- **Body**: Detailed message
- **Data**: Additional metadata (type, ID, URL)
- **Web Push Options**: Icon, badge, vibration pattern

## Error Handling

- Invalid FCM tokens are automatically removed from user documents
- Failed notifications are logged but don't block the function
- All errors are logged to Firebase Functions logs

## Monitoring

View function logs:
```bash
npm run logs
```

Or in Firebase Console:
- Navigate to Functions section
- Click on a function to see execution logs and metrics

## Cost Optimization

- Scheduled function runs once per hour (730 invocations/month)
- Firestore triggers only run on document changes
- Multicast messaging reduces function invocations for bulk notifications

## Security

- Functions use Firebase Admin SDK with elevated privileges
- All operations are server-side and cannot be called directly from client
- FCM tokens are validated before sending notifications
- Invalid tokens are automatically cleaned up
