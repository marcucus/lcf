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
