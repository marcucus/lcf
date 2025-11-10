import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Cloud Function to send a quotation by email
 * 
 * This is a placeholder implementation that will be completed once
 * email sending infrastructure (e.g., SendGrid, Nodemailer) is configured.
 * 
 * TODO:
 * 1. Set up email service (SendGrid API key or SMTP configuration)
 * 2. Create email template for quotations
 * 3. Generate PDF version of the quotation
 * 4. Send email with PDF attachment
 * 5. Update quotation status to 'sent' after successful send
 */
export const sendQuotationEmail = functions.https.onCall(
  async (data: { quotationId: string; recipientEmail?: string }, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to send quotations'
      );
    }

    // Verify admin role
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can send quotations'
      );
    }

    const { quotationId, recipientEmail } = data;

    if (!quotationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Quotation ID is required'
      );
    }

    try {
      // Get the quotation from Firestore
      const quotationDoc = await admin
        .firestore()
        .collection('quotations')
        .doc(quotationId)
        .get();

      if (!quotationDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Quotation not found'
        );
      }

      const quotation = quotationDoc.data();
      const emailTo = recipientEmail || quotation?.clientEmail;

      if (!emailTo) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'No recipient email specified'
        );
      }

      // TODO: Implement actual email sending logic
      // Example with Nodemailer (requires configuration):
      // const mailOptions = {
      //   from: 'LCF AUTO PERFORMANCE <noreply@lcfauto.com>',
      //   to: emailTo,
      //   subject: `Devis ${quotation.quotationNumber}`,
      //   html: generateEmailHTML(quotation),
      //   attachments: [
      //     {
      //       filename: `${quotation.quotationNumber}.pdf`,
      //       content: await generatePDF(quotation),
      //     },
      //   ],
      // };
      // await transporter.sendMail(mailOptions);

      // For now, just log and update status
      console.log(`Would send quotation ${quotationId} to ${emailTo}`);
      console.log('Quotation data:', JSON.stringify(quotation, null, 2));

      // Update quotation status to 'sent'
      await admin
        .firestore()
        .collection('quotations')
        .doc(quotationId)
        .update({
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        message: `Quotation prepared for ${emailTo}. Email sending will be implemented with email service configuration.`,
      };
    } catch (error) {
      console.error('Error sending quotation email:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send quotation email'
      );
    }
  }
);

/**
 * Helper function to generate email HTML (to be implemented)
 */
// function generateEmailHTML(quotation: any): string {
//   return `
//     <html>
//       <body>
//         <h1>Devis ${quotation.quotationNumber}</h1>
//         <p>Cher(e) ${quotation.clientName},</p>
//         <p>Veuillez trouver ci-joint votre devis.</p>
//         <!-- Add more details -->
//       </body>
//     </html>
//   `;
// }

/**
 * Helper function to generate PDF (to be implemented with a library like pdfkit or puppeteer)
 */
// async function generatePDF(quotation: any): Promise<Buffer> {
//   // Generate PDF with quotation details
//   return Buffer.from('PDF content placeholder');
// }
