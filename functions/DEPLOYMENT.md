# Deployment Guide - Appointment Confirmation Email

This guide explains how to deploy and configure the appointment confirmation email feature.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project configured
- Access to SMTP server credentials

## Configuration Steps

### 1. Set Environment Variables

Configure the email service in Firebase Functions:

```bash
# Navigate to functions directory
cd functions

# Set email configuration
firebase functions:config:set \
  email.host="smtp.your-provider.com" \
  email.port="587" \
  email.secure="false" \
  email.user="your-email@example.com" \
  email.password="your-password" \
  email.from="LCF AUTO PERFORMANCE <noreply@lcfauto.fr>" \
  app.url="https://lcfauto.fr"
```

### 2. Common SMTP Providers

#### Gmail
```bash
firebase functions:config:set \
  email.host="smtp.gmail.com" \
  email.port="587" \
  email.secure="true" \
  email.user="your-gmail@gmail.com" \
  email.password="your-app-password"
```
**Note**: Use App Password, not regular password. Enable 2FA and create an App Password in Google Account settings.

#### SendGrid
```bash
firebase functions:config:set \
  email.host="smtp.sendgrid.net" \
  email.port="587" \
  email.user="apikey" \
  email.password="your-sendgrid-api-key"
```

#### Mailgun
```bash
firebase functions:config:set \
  email.host="smtp.mailgun.org" \
  email.port="587" \
  email.user="postmaster@your-domain.mailgun.org" \
  email.password="your-mailgun-password"
```

### 3. Verify Configuration

```bash
# View current configuration
firebase functions:config:get

# Should output:
# {
#   "email": {
#     "host": "smtp.example.com",
#     "port": "587",
#     ...
#   }
# }
```

## Deployment

### Full Deployment (All Functions)

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Selective Deployment (Only Email Function)

```bash
cd functions
npm install
npm run build
firebase deploy --only functions:onAppointmentCreate
```

## Local Testing with Emulators

### 1. Start Emulators

```bash
cd functions
npm run serve
```

This starts:
- Functions emulator
- Firestore emulator
- Auth emulator

### 2. Create Test Appointment

In another terminal or using the Firebase Console:

```bash
# Using Firebase CLI
firebase firestore:add appointments \
  --data '{"userId":"test-user-123","customerName":"Test User","serviceType":"entretien","dateTime":{"_seconds":1699200000},"vehicleInfo":{"make":"Renault","model":"Clio","plate":"AA-123-BB"},"status":"confirmed"}'
```

Or create via the web app while emulators are running.

### 3. Check Logs

Watch for log output in the terminal running emulators:
- "New appointment created"
- "Appointment confirmation email sent successfully"

### 4. View Email (Test Mode)

In test mode (no EMAIL_HOST configured), check the logs for the email URL:
- Look for a URL like: `https://ethereal.email/message/xxx`
- Open in browser to view the sent email

## Monitoring in Production

### View Logs

```bash
# Recent logs
firebase functions:log --only onAppointmentCreate

# Tail logs (live)
firebase functions:log --only onAppointmentCreate --follow

# Filter by severity
firebase functions:log --only onAppointmentCreate --severity ERROR
```

### Check Function Status

In Firebase Console:
1. Go to Functions section
2. Find `onAppointmentCreate`
3. View:
   - Invocations count
   - Error rate
   - Execution time
   - Memory usage

### Common Log Messages

**Success:**
```
New appointment created: { appointmentId: 'xxx' }
Appointment confirmation email sent successfully: { appointmentId: 'xxx', userId: 'yyy', userEmail: 'user@example.com' }
```

**Errors:**
```
No appointment data found: { appointmentId: 'xxx' }
User not found: { appointmentId: 'xxx', userId: 'yyy' }
No email found for user: { appointmentId: 'xxx', userId: 'yyy' }
Error sending appointment confirmation email: { appointmentId: 'xxx', error: '...' }
```

## Troubleshooting

### Email Not Sending

1. **Check Configuration**
   ```bash
   firebase functions:config:get
   ```
   Verify all email settings are correct.

2. **Check SMTP Credentials**
   - Test credentials using a local email client
   - Verify firewall rules allow outbound SMTP

3. **Check Logs**
   ```bash
   firebase functions:log --only onAppointmentCreate --severity ERROR
   ```

4. **Verify User Email**
   - Check that user document has `email` field
   - Verify email format is valid

### Function Not Triggering

1. **Verify Deployment**
   ```bash
   firebase functions:list
   ```
   Ensure `onAppointmentCreate` is listed.

2. **Check Firestore Rules**
   Verify the function has permission to read user documents.

3. **Test Trigger Manually**
   Create a test appointment via Firebase Console.

### Email Goes to Spam

1. **Configure SPF/DKIM**
   - Add SPF record to DNS
   - Configure DKIM with your email provider

2. **Use Verified Sender**
   - Use a real, verified domain email address
   - Avoid using "noreply" if possible

3. **Improve Email Content**
   - Ensure proper HTML structure
   - Include unsubscribe link (future enhancement)
   - Add physical address in footer

## Performance Optimization

### Cold Start Reduction

The function is optimized for cold starts:
- Transporter singleton pattern
- Minimal dependencies
- Efficient data retrieval

### Cost Optimization

- Function only runs on appointment creation (not updates)
- Email sending is non-blocking
- Errors don't trigger retries (prevents spam)

## Security Best Practices

1. **Never commit email credentials** to version control
2. **Use environment variables** for all secrets
3. **Rotate passwords** regularly
4. **Monitor for unauthorized use**
5. **Rate limit** email sending (future enhancement)

## Rollback

If issues occur after deployment:

```bash
# View deployment history
firebase functions:log

# Rollback to previous version (not directly supported)
# Instead, deploy the previous code:
git checkout <previous-commit>
cd functions
npm install
npm run build
firebase deploy --only functions:onAppointmentCreate
```

## Support

For issues or questions:
- Check Firebase Console logs
- Review function configuration
- Test with emulators first
- Verify email service status

## Next Steps

After successful deployment:
1. Monitor function invocations for first 24 hours
2. Check email delivery rates
3. Verify customer feedback
4. Consider adding email analytics
5. Plan for additional email templates (reminders, cancellations)
