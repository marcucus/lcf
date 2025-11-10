# Cloud Functions - LCF AUTO PERFORMANCE

This directory contains the Firebase Cloud Functions for the LCF AUTO PERFORMANCE application.

## Overview

These functions implement server-side validation for critical business rules, particularly the **24-hour appointment modification rule** as specified in Section 6.3 of the specifications.

## Functions

### 1. `onAppointmentUpdate`
- **Type**: Firestore Trigger (onUpdate)
- **Path**: `appointments/{appointmentId}`
- **Purpose**: Validates appointment modifications and cancellations
- **Business Rule**: 
  - Regular users cannot modify or cancel appointments within 24 hours of the appointment time
  - Admin and agendaManager roles can modify at any time
- **Behavior**: 
  - Automatically triggered when an appointment document is updated
  - Validates the 24-hour rule based on user role
  - Rolls back changes if validation fails
  - Logs all validation attempts

### 2. `onAppointmentDelete`
- **Type**: Firestore Trigger (onDelete)
- **Path**: `appointments/{appointmentId}`
- **Purpose**: Validates appointment deletions
- **Business Rule**: Same as onAppointmentUpdate
- **Behavior**:
  - Automatically triggered when an appointment document is deleted
  - Validates the 24-hour rule based on user role
  - Restores the appointment if validation fails
  - Logs all deletion attempts

### 3. `validateAppointmentModification`
- **Type**: Callable HTTPS Function
- **Purpose**: Pre-validation check for client applications
- **Usage**: Call from client before attempting modification
- **Returns**: 
  ```typescript
  {
    canModify: boolean,
    message: string,
    appointmentDateTime: string
  }
  ```
- **Benefits**:
  - Provides immediate feedback to users
  - Reduces unnecessary write attempts
  - Improves user experience

## User Roles

The functions recognize three user roles:

1. **user** (regular customer): Subject to the 24-hour rule
2. **agendaManager**: Can modify appointments at any time
3. **admin**: Can modify appointments at any time

## 24-Hour Rule Logic

```typescript
// For regular users only
const appointmentDate = appointmentDateTime.toDate();
const now = new Date();
const diffInHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

// User can modify if more than 24 hours remain
canModify = diffInHours > 24;
```

## Security

- All functions validate user authentication and authorization
- User roles are fetched from the `users` collection
- Failed validations are logged for audit purposes
- Rollback mechanisms protect data integrity

## Development

### Prerequisites
```bash
npm install
```

### Build
```bash
npm run build
```

### Deploy
```bash
firebase deploy --only functions
```

### Local Testing
```bash
npm run serve
```

## Error Messages (French)

- **Unauthenticated**: "Vous devez être connecté pour effectuer cette action"
- **Permission Denied (24h rule)**: "Vous ne pouvez pas modifier ou annuler un rendez-vous dans les 24 heures précédant l'heure prévue. Veuillez contacter le garage directement pour toute modification de dernière minute."
- **User Not Found**: "Utilisateur non trouvé"
- **Appointment Not Found**: "Rendez-vous non trouvé"
- **Invalid Argument**: "L'ID du rendez-vous est requis"

## Implementation Notes

1. **Dual Layer Security**: These functions work in conjunction with Firestore Security Rules for defense in depth
2. **Performance**: Validation is fast (single user document read)
3. **Idempotency**: Functions handle repeated calls safely
4. **Logging**: Comprehensive logging for debugging and auditing
5. **Error Handling**: Graceful error handling with rollback on validation failure

## Reference

See `specifications.md` Section 6.3 for complete business requirements.
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
