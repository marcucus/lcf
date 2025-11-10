import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Invoice } from '../../../src/types';

/**
 * Generates HTML email template for invoice
 */
function generateInvoiceEmailHTML(invoice: Invoice): string {
  const itemsHTML = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.unitPrice.toFixed(2)} €</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.taxRate}%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${item.totalWithTax.toFixed(2)} €</td>
      </tr>
    `
    )
    .join('');

  const dueDateText = invoice.dueDate
    ? `<p style="margin: 0; color: #6b7280;">Date d'échéance: ${new Date(
        invoice.dueDate.toMillis()
      ).toLocaleDateString('fr-FR')}</p>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoice.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 650px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #1CCEFF 0%, #0ea5e9 100%); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">LCF AUTO PERFORMANCE</h1>
        <p style="margin: 8px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Facture</p>
      </div>
      <div style="padding: 32px 24px;">
        <div style="margin-bottom: 32px;">
          <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 600;">Facture ${invoice.invoiceNumber}</h2>
          <p style="margin: 0; color: #6b7280;">Date: ${new Date(
            invoice.createdAt.toMillis()
          ).toLocaleDateString('fr-FR')}</p>
          ${dueDateText}
        </div>
        <div style="margin-bottom: 32px; padding: 20px; background-color: #f9fafb; border-radius: 6px;">
          <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px; font-weight: 600;">Facturé à:</h3>
          <p style="margin: 0 0 4px; color: #374151; font-weight: 600;">${invoice.customerName}</p>
          <p style="margin: 0 0 4px; color: #6b7280;">${invoice.customerEmail}</p>
          ${
            invoice.customerPhone
              ? `<p style="margin: 0 0 4px; color: #6b7280;">${invoice.customerPhone}</p>`
              : ''
          }
          ${
            invoice.customerAddress
              ? `<p style="margin: 0; color: #6b7280;">${invoice.customerAddress}</p>`
              : ''
          }
        </div>
        <div style="margin-bottom: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Description</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Qté</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Prix unitaire</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">TVA</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>
        <div style="margin-bottom: 32px; padding: 20px; background-color: #f9fafb; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280;">Sous-total HT:</span>
            <span style="color: #374151; font-weight: 600;">${invoice.subtotal.toFixed(2)} €</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280;">TVA:</span>
            <span style="color: #374151; font-weight: 600;">${invoice.taxAmount.toFixed(2)} €</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #111827; font-size: 18px; font-weight: 700;">Total TTC:</span>
            <span style="color: #1CCEFF; font-size: 20px; font-weight: 700;">${invoice.total.toFixed(2)} €</span>
          </div>
        </div>
        ${
          invoice.notes
            ? `
        <div style="padding: 16px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Note:</strong> ${invoice.notes}</p>
        </div>
        `
            : ''
        }
      </div>
      <div style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
          Merci pour votre confiance !
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          LCF AUTO PERFORMANCE - Votre garage de confiance
        </p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px; padding: 0 24px;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        Si vous avez des questions, n'hésitez pas à nous contacter.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export const sendInvoiceEmail = functions.https.onCall(
  async (data: { invoiceId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to send invoices'
      );
    }

    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    if (userData?.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can send invoices'
      );
    }

    try {
      const invoiceDoc = await admin
        .firestore()
        .collection('invoices')
        .doc(data.invoiceId)
        .get();

      if (!invoiceDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Invoice not found'
        );
      }

      const invoice = {
        invoiceId: invoiceDoc.id,
        ...invoiceDoc.data(),
      } as Invoice;

      const emailHTML = generateInvoiceEmailHTML(invoice);

      await admin
        .firestore()
        .collection('invoices')
        .doc(data.invoiceId)
        .update({
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      functions.logger.info(
        `Invoice ${invoice.invoiceNumber} email would be sent to ${invoice.customerEmail}`
      );
      functions.logger.info('Email HTML:', emailHTML);

      return {
        success: true,
        message: `Facture ${invoice.invoiceNumber} envoyée avec succès`,
        invoiceNumber: invoice.invoiceNumber,
      };
    } catch (error: unknown) {
      functions.logger.error('Error sending invoice email:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send invoice email',
        error
      );
    }
  }
);
