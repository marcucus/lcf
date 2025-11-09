# Testing Checklist - Appointment Confirmation Email

Use this checklist to verify the appointment confirmation email feature works correctly.

## Pre-Deployment Testing (Emulators)

### Setup
- [ ] Install dependencies: `cd functions && npm install`
- [ ] Build functions: `npm run build`
- [ ] Start emulators: `npm run serve`
- [ ] Verify function loaded: Look for "onAppointmentCreate" in emulator output

### Test Case 1: Complete Appointment Data
**Scenario**: Create appointment with all fields populated

1. **Create User Document** (via Firestore UI or code)
   ```json
   {
     "userId": "test-user-1",
     "email": "test@example.com",
     "displayName": "Jean Dupont",
     "role": "user"
   }
   ```

2. **Create Appointment Document**
   ```json
   {
     "userId": "test-user-1",
     "customerName": "Jean Dupont",
     "serviceType": "entretien",
     "dateTime": {
       "_seconds": 1731254400,
       "_nanoseconds": 0
     },
     "vehicleInfo": {
       "make": "Renault",
       "model": "Clio",
       "plate": "AA-123-BB"
     },
     "customerNotes": "Bruit suspect au niveau du frein avant",
     "status": "confirmed"
   }
   ```

3. **Expected Results**
   - [ ] Function triggers automatically
   - [ ] Logs show: "New appointment created"
   - [ ] Logs show: "Appointment confirmation email sent successfully"
   - [ ] Appointment document updated with:
     - [ ] `confirmationEmailSent: true`
     - [ ] `confirmationEmailSentAt: <timestamp>`
   - [ ] Email preview URL in logs (test mode)
   - [ ] Email contains all appointment details
   - [ ] Email displays customer notes

### Test Case 2: Minimal Appointment Data
**Scenario**: Create appointment with minimal required fields

1. **Create Appointment Document**
   ```json
   {
     "userId": "test-user-1",
     "customerName": "Jean Dupont",
     "serviceType": "reparation",
     "dateTime": {
       "_seconds": 1731340800,
       "_nanoseconds": 0
     },
     "status": "confirmed"
   }
   ```

2. **Expected Results**
   - [ ] Function triggers successfully
   - [ ] Email sent without errors
   - [ ] Vehicle info shows "Non spécifié"
   - [ ] No customer notes section displayed

### Test Case 3: Missing User Email
**Scenario**: User document exists but has no email

1. **Create User Document**
   ```json
   {
     "userId": "test-user-2",
     "displayName": "Test User"
   }
   ```

2. **Create Appointment**
   ```json
   {
     "userId": "test-user-2",
     "customerName": "Test User",
     "serviceType": "entretien",
     "dateTime": { "_seconds": 1731254400 },
     "status": "confirmed"
   }
   ```

3. **Expected Results**
   - [ ] Function triggers
   - [ ] Error logged: "No email found for user"
   - [ ] No email sent
   - [ ] Appointment document NOT updated with email status

### Test Case 4: Non-existent User
**Scenario**: Appointment references user that doesn't exist

1. **Create Appointment**
   ```json
   {
     "userId": "nonexistent-user-id",
     "customerName": "Ghost User",
     "serviceType": "entretien",
     "dateTime": { "_seconds": 1731254400 },
     "status": "confirmed"
   }
   ```

2. **Expected Results**
   - [ ] Function triggers
   - [ ] Error logged: "User not found"
   - [ ] No email sent
   - [ ] No crash or retry loop

### Test Case 5: Different Service Types
**Scenario**: Verify all service types render correctly

1. **Test each service type:**
   - [ ] `entretien` → Displays "Entretien"
   - [ ] `reparation` → Displays "Réparation"
   - [ ] `reprogrammation` → Displays "Re-programmation"

### Test Case 6: Email Template Visual Check
**Scenario**: Verify email appearance

1. **Open email preview**
   - [ ] Header has LCF cyan color (#1CCEFF)
   - [ ] Logo/branding visible
   - [ ] Appointment details box formatted correctly
   - [ ] Date formatted in French (e.g., "lundi 10 novembre 2024")
   - [ ] Time formatted correctly (e.g., "14:30")
   - [ ] Vehicle info formatted properly
   - [ ] Reference number displayed (first 8 chars of appointmentId)
   - [ ] CTA button visible and styled
   - [ ] Footer with contact info
   - [ ] Responsive on mobile (check preview)

### Test Case 7: Plain Text Email
**Scenario**: Verify plain text version

1. **Check email logs/preview**
   - [ ] Plain text version exists
   - [ ] All important info included
   - [ ] Readable without HTML

## Post-Deployment Testing (Production/Staging)

### Configuration Check
- [ ] Environment variables configured
  ```bash
  firebase functions:config:get
  ```
- [ ] All email.* variables present
- [ ] app.url configured

### Live Test
1. **Create Real Appointment** (via web app)
   - [ ] Appointment created successfully
   - [ ] Check Firebase Console Functions logs
   - [ ] Email received in inbox (not spam)
   - [ ] Email displays correctly in email client
   - [ ] All links work (CTA button)

### Monitoring
- [ ] Check Functions dashboard for invocations
- [ ] Verify success rate (should be >95%)
- [ ] Check execution time (should be <5 seconds)
- [ ] Monitor error logs for 24 hours

## Email Deliverability Testing

### Spam Check
- [ ] Email lands in inbox (not spam/junk)
- [ ] No spam warnings in email client
- [ ] Sender reputation checked (if using custom domain)

### Email Client Testing
Test email rendering in:
- [ ] Gmail (desktop)
- [ ] Gmail (mobile)
- [ ] Outlook (desktop)
- [ ] Outlook (mobile)
- [ ] Apple Mail (iOS)
- [ ] Apple Mail (macOS)
- [ ] Yahoo Mail
- [ ] Other common clients

### Link Testing
- [ ] CTA button links to correct URL
- [ ] Dashboard link opens properly
- [ ] Links work on mobile

## Performance Testing

### Load Test
- [ ] Create 10 appointments simultaneously
- [ ] All emails sent successfully
- [ ] No rate limiting issues
- [ ] Reasonable execution time

### Error Recovery
- [ ] SMTP temporarily unavailable → Logged but doesn't crash
- [ ] Invalid email format → Handled gracefully
- [ ] Network timeout → Doesn't retry infinitely

## Security Testing

### Data Privacy
- [ ] Email contains only intended user data
- [ ] No exposure of other users' information
- [ ] Appointment ID not sensitive/guessable

### Authentication
- [ ] Cannot trigger function without proper Firestore write
- [ ] User data access properly authenticated

## Regression Testing

### Existing Functions
- [ ] `onAppointmentUpdate` still works
- [ ] `onAppointmentDelete` still works
- [ ] `validateAppointmentModification` still works
- [ ] `sendAppointmentReminders` still works
- [ ] `onVehicleCreated` still works
- [ ] `onVehicleUpdated` still works

## Documentation Testing

### README
- [ ] Instructions are clear
- [ ] Code examples work
- [ ] Configuration steps accurate

### Deployment Guide
- [ ] Steps work as documented
- [ ] SMTP examples valid
- [ ] Troubleshooting section helpful

## Sign-off

### Developer
- [ ] All tests passed
- [ ] Code reviewed
- [ ] Documentation complete
- [ ] Security scans clean

**Tested by:** _________________  
**Date:** _________________  
**Environment:** _________________  

### QA/Product Owner
- [ ] Feature meets requirements
- [ ] User experience acceptable
- [ ] Ready for production

**Approved by:** _________________  
**Date:** _________________  

## Issues Found

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| | | | |

## Notes

_Add any additional observations or recommendations here._
