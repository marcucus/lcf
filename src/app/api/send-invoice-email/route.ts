import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById } from '@/lib/firestore/invoices';
import { generateInvoicePDF } from '@/lib/pdf/generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Get the invoice from Firestore
    const invoice = await getInvoiceById(invoiceId);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdf = generateInvoicePDF(invoice);
    const pdfBlob = pdf.output('blob');
    
    // Convert blob to base64 for email attachment
    const pdfBase64 = await blobToBase64(pdfBlob);

    // Call Firebase Cloud Function to send email
    // Note: This assumes you have a Cloud Function deployed
    // For now, we'll return success and log the action
    console.log('Sending invoice email to:', invoice.customerEmail);
    console.log('Invoice number:', invoice.invoiceNumber);
    
    // TODO: Implement actual email sending via Cloud Function or third-party service
    // For production, you would call a service like SendGrid, Nodemailer, etc.
    // Example:
    // await sendEmail({
    //   to: invoice.customerEmail,
    //   subject: `Facture ${invoice.invoiceNumber} - LCF AUTO PERFORMANCE`,
    //   html: getInvoiceEmailTemplate(invoice),
    //   attachments: [
    //     {
    //       filename: `Facture-${invoice.invoiceNumber}.pdf`,
    //       content: pdfBase64,
    //       encoding: 'base64',
    //     },
    //   ],
    // });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// Helper function to convert Blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Email template for invoice
function getInvoiceEmailTemplate(invoice: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1CCEFF; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; }
        .total { font-size: 18px; font-weight: bold; color: #1CCEFF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LCF AUTO PERFORMANCE</h1>
        </div>
        <div class="content">
          <h2>Votre facture ${invoice.invoiceNumber}</h2>
          <p>Bonjour ${invoice.customerName},</p>
          <p>Veuillez trouver ci-joint votre facture pour un montant total de <strong class="total">${invoice.total.toFixed(2)} €</strong>.</p>
          <p>Date d'échéance: <strong>${new Date(invoice.dueDate.toDate()).toLocaleDateString('fr-FR')}</strong>.</p>
          <p>Merci de procéder au règlement avant cette date.</p>
          <p>Nous restons à votre disposition pour toute question.</p>
          <p>Cordialement,<br>L'équipe LCF AUTO PERFORMANCE</p>
        </div>
        <div class="footer">
          <p>LCF AUTO PERFORMANCE - Garage Automobile Professionnel</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
