# Email Service for Appointment Confirmations

This directory contains the email service implementation for LCF AUTO PERFORMANCE, specifically for sending appointment confirmation emails.

## Features

### Email Service (`email.ts`)

The email service provides:
- **Nodemailer integration** for sending emails via SMTP
- **HTML email templates** with professional styling
- **Plain text fallback** for better compatibility
- **Environment-based configuration** for production and development
- **Error handling and logging** using Firebase Functions logger

### Appointment Confirmation Function (`onAppointmentCreate.ts`)

A Firestore trigger that:
- Automatically fires when a new appointment is created in the `appointments` collection
- Retrieves user information (email address) from the `users` collection
- Generates a professional HTML email with appointment details
- Sends the confirmation email to the customer
- Updates the appointment document with email status tracking

## Configuration

### Environment Variables

Add these to your Firebase Functions configuration:

```bash
# Required for production
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM="LCF AUTO PERFORMANCE <noreply@lcfauto.fr>"
APP_URL=https://lcfauto.fr
```

### Setting Environment Variables

```bash
# Set individual variables
firebase functions:config:set email.host="smtp.example.com"
firebase functions:config:set email.user="your-email@example.com"
firebase functions:config:set email.password="your-password"

# Or use a .env file with firebase-functions-test
```

## Email Template

The confirmation email includes:
- **Professional header** with brand color (#1CCEFF)
- **Appointment details** (service, date, time, vehicle info)
- **Reference number** for tracking
- **Customer notes** if provided
- **Important information** section
- **Call-to-action button** to manage the appointment
- **Contact information** footer
- **Responsive design** for mobile devices

### Template Styling

- Uses inline CSS for maximum email client compatibility
- Responsive layout adapts to mobile screens
- Brand color (#1CCEFF) for accent elements
- Professional typography and spacing
- Clear visual hierarchy

## Security Considerations

- **Nodemailer v7.0.10** used (fixes CVE vulnerability in earlier versions)
- Email credentials stored in environment variables, never in code
- User email addresses validated before sending
- Error handling prevents email spam through retry loops
- Logging includes relevant context without exposing sensitive data

## Testing

### Development Mode

By default, the service uses Ethereal Email for testing:
- No real emails are sent
- Messages are logged to console
- Safe for development and testing

### Production Mode

When environment variables are configured:
- Real SMTP server is used
- Actual emails are sent to customers
- Full logging for monitoring

### Manual Testing

```bash
# Deploy to Firebase
cd functions
npm run deploy

# Or test locally with emulators
npm run serve

# Trigger by creating a test appointment in Firestore
```

## Monitoring

### Logs

View logs in Firebase Console or CLI:
```bash
firebase functions:log --only onAppointmentCreate
```

### Success Indicators

- Log: "Appointment confirmation email sent successfully"
- Appointment document updated with `confirmationEmailSent: true`
- `confirmationEmailSentAt` timestamp added

### Error Indicators

- Log: "Error sending appointment confirmation email"
- Detailed error message and stack trace in logs
- Appointment document remains unchanged

## Reference

- **Specifications**: Section 6.1 - Processus de Prise de Rendez-vous
- **Data Model**: Section 8.2.2 - Collection appointments
- **Architecture**: Section 2.1 - Cloud Functions for Firebase

## Future Enhancements

Potential improvements:
- Email templates for appointment reminders (24h before)
- Email templates for appointment cancellations
- Email templates for appointment modifications
- Multi-language support
- Rich text formatting for customer notes
- Attachment support for service terms/conditions
- Email open tracking
- Click tracking for CTAs
