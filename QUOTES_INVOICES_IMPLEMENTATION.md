# Quotes and Invoices Module - Implementation Notes

## Overview
This module implements complete quote (devis) and invoice (facture) management functionality with PDF generation and email sending capabilities.

## Features Implemented

### 1. Data Model
- **Quote Entity**: Includes customer info, line items, tax calculation, status, and validity dates
- **Invoice Entity**: Similar to quotes but with payment tracking and due dates
- Both support multiple line items with quantity, unit price, and automatic totals

### 2. Admin Interface
- **Quote Management Page** (`/admin/devis`):
  - List all quotes with status filtering
  - Create/Edit quotes with dynamic line items
  - View quote details
  - Download as PDF
  - Send by email
  
- **Invoice Management Page** (`/admin/factures`):
  - List all invoices with status filtering
  - Create/Edit invoices with dynamic line items
  - View invoice details
  - Download as PDF
  - Send by email
  - Mark as paid

### 3. PDF Generation
- Uses jsPDF library for client-side PDF generation
- Professional layout with company header
- Detailed line items table
- Tax calculation display
- Support for notes and additional information

### 4. Email Functionality
- API endpoints for sending quotes and invoices
- PDF attachment support (base64 encoded)
- Email templates with professional HTML formatting
- Customer information and document details in email body

## Implementation Details

### Email Sending Configuration
**IMPORTANT**: The email sending functionality is currently implemented as a placeholder in the API routes (`/api/send-quote-email` and `/api/send-invoice-email`).

For production use, you need to:

1. Choose an email service provider:
   - **SendGrid** (recommended for Firebase)
   - **Nodemailer** with SMTP
   - **Mailgun**
   - **AWS SES**

2. Implement the actual email sending in:
   - `src/app/api/send-quote-email/route.ts`
   - `src/app/api/send-invoice-email/route.ts`

3. Example with SendGrid (recommended):

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const msg = {
  to: invoice.customerEmail,
  from: 'noreply@lcfautoperformance.com',
  subject: `Facture ${invoice.invoiceNumber} - LCF AUTO PERFORMANCE`,
  html: getInvoiceEmailTemplate(invoice),
  attachments: [
    {
      content: pdfBase64,
      filename: `Facture-${invoice.invoiceNumber}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment',
    },
  ],
};

await sgMail.send(msg);
```

4. Add environment variable:
```
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Firebase Cloud Functions Alternative
For a serverless approach, you can also implement email sending via Firebase Cloud Functions:

1. Create a new function in `functions/src/sendEmail.ts`
2. Use the SendGrid or Nodemailer within the function
3. Call the function from the API route instead of direct implementation
4. This keeps sensitive API keys server-side only

## Security

### Firestore Rules
Added security rules in `firestore.rules`:
- Only admins and agenda managers can create/update/delete quotes and invoices
- Users can read their own quotes and invoices
- Proper role-based access control

### Data Validation
- Required fields validation in forms
- Price and quantity validation
- Date validation (valid until / due date)
- Email format validation

## Future Enhancements
1. Email delivery tracking
2. Quote acceptance workflow (customer can accept/reject)
3. Payment integration for invoices
4. Recurring invoices
5. Quote/Invoice templates
6. Multiple tax rates support
7. Multi-currency support
8. Customer portal to view their quotes/invoices
9. Email notification system for overdue invoices
10. Export to accounting software integration

## Testing
To test the functionality:
1. Log in as admin or agendaManager
2. Navigate to `/admin/devis` or `/admin/factures`
3. Create a new quote/invoice
4. View the PDF
5. Test email sending (will show success but needs actual implementation)

## Dependencies
- `jspdf@3.0.3` - PDF generation library

## Notes
- Quote numbers format: `DEV-YYYY-XXXXX`
- Invoice numbers format: `FACT-YYYY-XXXXX`
- Default tax rate: 20% (VAT)
- Default validity period: 30 days
- All amounts in euros (€)
