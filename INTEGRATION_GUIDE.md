# Integration Guide: Using the 24-Hour Validation Functions

This guide explains how to integrate the Firebase Cloud Functions with the Next.js client application.

## Prerequisites

1. Deploy the functions to Firebase:
```bash
cd functions
npm run build
firebase deploy --only functions
```

2. Ensure Firebase is initialized in your client app (already done in `src/lib/firebase/config.ts`)

## Client-Side Integration

### Option 1: Use the Callable Function (Recommended for UX)

Call the `validateAppointmentModification` function before showing modification UI:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

async function checkCanModifyAppointment(appointmentId: string): Promise<boolean> {
  try {
    const functions = getFunctions();
    const validateModification = httpsCallable(functions, 'validateAppointmentModification');
    
    const result = await validateModification({ appointmentId });
    const data = result.data as { canModify: boolean; message: string };
    
    if (!data.canModify) {
      // Show user-friendly message
      alert(data.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating appointment:', error);
    // Show error message to user
    return false;
  }
}

// Usage in a component:
async function handleModifyClick(appointmentId: string) {
  const canModify = await checkCanModifyAppointment(appointmentId);
  
  if (canModify) {
    // Show modification form
    setShowModifyModal(true);
  }
}
```

### Option 2: Rely on Server-Side Validation (Simpler)

Simply attempt the modification. The Firestore triggers will automatically validate and rollback if needed:

```typescript
import { updateAppointment } from '@/lib/firestore/appointments';

async function modifyAppointment(appointmentId: string, updates: Partial<Appointment>) {
  try {
    await updateAppointment(appointmentId, updates);
    alert('Rendez-vous modifié avec succès');
  } catch (error) {
    // The Cloud Function will have blocked the change
    alert('Impossible de modifier ce rendez-vous. Veuillez contacter le garage.');
    console.error('Error modifying appointment:', error);
  }
}
```

### Option 3: Client-Side Check + Server Validation (Best Practice)

Combine both approaches for optimal UX and security:

```typescript
// 1. Client-side check (from existing code)
import { canModifyAppointment } from '@/lib/firestore/appointments';

// Check before showing UI
if (canModifyAppointment(appointment.dateTime.toDate())) {
  // Show modify/cancel buttons
} else {
  // Hide buttons and show info message
}

// 2. Server validates when user actually makes the change
// The Cloud Functions automatically validate on Firestore write
```

## UI Integration Example

Update your appointment card component:

```tsx
// src/components/appointments/AppointmentCard.tsx
import { Appointment } from '@/types';
import { canModifyAppointment } from '@/lib/firestore/appointments';

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: string;
}

export function AppointmentCard({ appointment, userRole }: AppointmentCardProps) {
  const appointmentDate = appointment.dateTime.toDate();
  const canModify = canModifyAppointment(appointmentDate);
  
  // Admin/AgendaManager always see buttons
  const showButtons = userRole !== 'user' || canModify;
  
  return (
    <div className="appointment-card">
      <h3>{appointment.serviceType}</h3>
      <p>{appointmentDate.toLocaleString('fr-FR')}</p>
      
      {showButtons ? (
        <div className="actions">
          <button onClick={() => handleModify(appointment.appointmentId)}>
            Modifier
          </button>
          <button onClick={() => handleCancel(appointment.appointmentId)}>
            Annuler
          </button>
        </div>
      ) : (
        <p className="warning">
          ⚠️ Modification impossible dans les 24h précédant le rendez-vous.
          Contactez le garage pour toute modification.
        </p>
      )}
    </div>
  );
}
```

## Error Handling

The Cloud Functions throw specific errors. Handle them appropriately:

```typescript
try {
  await updateAppointment(appointmentId, updates);
} catch (error: any) {
  if (error.code === 'permission-denied') {
    // 24-hour rule violation
    showError('Vous ne pouvez pas modifier ce rendez-vous dans les 24 heures précédant l\'heure prévue.');
  } else if (error.code === 'not-found') {
    // Appointment or user not found
    showError('Rendez-vous introuvable.');
  } else {
    // Other errors
    showError('Une erreur est survenue. Veuillez réessayer.');
  }
}
```

## Testing

1. **Test as regular user:**
   - Create an appointment 25+ hours in the future → Should allow modification
   - Create an appointment <24 hours in the future → Should block modification

2. **Test as admin/agendaManager:**
   - Should be able to modify any appointment at any time

3. **Test edge cases:**
   - Exactly 24 hours → Should block
   - 24 hours + 1 second → Should allow
   - Past appointments → Should block for users, allow for admins

## Production Checklist

- [ ] Deploy Cloud Functions to Firebase
- [ ] Update Firestore Security Rules to complement the functions
- [ ] Test all scenarios in production-like environment
- [ ] Monitor Cloud Function logs for errors
- [ ] Set up alerts for function failures

## Firestore Security Rules (Complementary)

Add these rules to `firestore.rules`:

```javascript
match /appointments/{appointmentId} {
  // Allow read access
  allow read: if request.auth != null;
  
  // Allow create for authenticated users
  allow create: if request.auth != null;
  
  // Update/delete: validated by Cloud Functions
  // Rules here are secondary but provide first layer of defense
  allow update, delete: if request.auth != null && (
    // Admin/agendaManager can always modify
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'agendaManager'] ||
    // Regular users: checked by Cloud Function
    resource.data.userId == request.auth.uid
  );
}
```

## Monitoring

Monitor your Cloud Functions:

```bash
# View logs
firebase functions:log

# View specific function logs
firebase functions:log --only onAppointmentUpdate

# Check function status
firebase functions:list
```

## Cost Considerations

- Firestore triggers: Called on every appointment update/delete
- Callable function: Called on-demand (optional, for UX improvement)
- Each trigger reads 1 user document (to check role)
- Estimated cost: ~$0.40 per 1M invocations + Firestore reads

## Support

For issues or questions:
1. Check the logs: `firebase functions:log`
2. Review the function code: `functions/src/appointments/validateModification.ts`
3. See documentation: `functions/README.md`
