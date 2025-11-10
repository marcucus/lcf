import { NextRequest, NextResponse } from 'next/server';
import { getQuoteById } from '@/lib/firestore/quotes';
import { generateQuotePDF } from '@/lib/pdf/generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteId } = body;

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    // Get the quote from Firestore
    const quote = await getQuoteById(quoteId);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdf = generateQuotePDF(quote);
    const pdfBlob = pdf.output('blob');
    
    // Convert blob to base64 for email attachment
    const pdfBase64 = await blobToBase64(pdfBlob);

    // Call Firebase Cloud Function to send email
    // Note: This assumes you have a Cloud Function deployed
    // For now, we'll return success and log the action
    console.log('Sending quote email to:', quote.customerEmail);
    console.log('Quote number:', quote.quoteNumber);
    
    // TODO: Implement actual email sending via Cloud Function or third-party service
    // For production, you would call a service like SendGrid, Nodemailer, etc.
    // Example:
    // await sendEmail({
    //   to: quote.customerEmail,
    //   subject: `Devis ${quote.quoteNumber} - LCF AUTO PERFORMANCE`,
    //   html: getQuoteEmailTemplate(quote),
    //   attachments: [
    //     {
    //       filename: `Devis-${quote.quoteNumber}.pdf`,
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
    console.error('Error sending quote email:', error);
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

// Email template for quote
function getQuoteEmailTemplate(quote: any): string {
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LCF AUTO PERFORMANCE</h1>
        </div>
        <div class="content">
          <h2>Votre devis ${quote.quoteNumber}</h2>
          <p>Bonjour ${quote.customerName},</p>
          <p>Veuillez trouver ci-joint votre devis pour un montant total de <strong>${quote.total.toFixed(2)} €</strong>.</p>
          <p>Ce devis est valable jusqu'au <strong>${new Date(quote.validUntil.toDate()).toLocaleDateString('fr-FR')}</strong>.</p>
          <p>N'hésitez pas à nous contacter si vous avez des questions.</p>
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
