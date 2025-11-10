import jsPDF from 'jspdf';
import { Quote, Invoice } from '@/types';

// Generate PDF for quote
export function generateQuotePDF(quote: Quote): jsPDF {
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LCF AUTO PERFORMANCE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Garage Automobile Professionnel', 105, 28, { align: 'center' });
  
  // Add document title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', 105, 45, { align: 'center' });
  
  // Add quote number and date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Numéro: ${quote.quoteNumber}`, 20, 60);
  doc.text(`Date: ${new Date(quote.createdAt.toDate()).toLocaleDateString('fr-FR')}`, 20, 67);
  doc.text(`Valide jusqu'au: ${new Date(quote.validUntil.toDate()).toLocaleDateString('fr-FR')}`, 20, 74);
  
  // Add customer information
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 20, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.customerName, 20, 97);
  doc.text(quote.customerEmail, 20, 104);
  if (quote.customerPhone) {
    doc.text(quote.customerPhone, 20, 111);
  }
  if (quote.customerAddress) {
    doc.text(quote.customerAddress, 20, 118);
  }
  
  // Add line items table
  let yPos = 140;
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, yPos);
  doc.text('Qté', 120, yPos, { align: 'right' });
  doc.text('Prix Unit.', 150, yPos, { align: 'right' });
  doc.text('Total', 190, yPos, { align: 'right' });
  
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  
  quote.items.forEach((item) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(item.description, 20, yPos);
    doc.text(item.quantity.toString(), 120, yPos, { align: 'right' });
    doc.text(`${item.unitPrice.toFixed(2)} €`, 150, yPos, { align: 'right' });
    doc.text(`${item.total.toFixed(2)} €`, 190, yPos, { align: 'right' });
    yPos += 7;
  });
  
  // Add totals
  yPos += 5;
  doc.line(20, yPos, 190, yPos);
  yPos += 8;
  
  doc.text('Sous-total:', 120, yPos);
  doc.text(`${quote.subtotal.toFixed(2)} €`, 190, yPos, { align: 'right' });
  yPos += 7;
  
  doc.text(`TVA (${(quote.taxRate * 100).toFixed(0)}%):`, 120, yPos);
  doc.text(`${quote.taxAmount.toFixed(2)} €`, 190, yPos, { align: 'right' });
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC:', 120, yPos);
  doc.text(`${quote.total.toFixed(2)} €`, 190, yPos, { align: 'right' });
  
  // Add notes if any
  if (quote.notes) {
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(quote.notes, 170);
    doc.text(splitNotes, 20, yPos);
  }
  
  return doc;
}

// Generate PDF for invoice
export function generateInvoicePDF(invoice: Invoice): jsPDF {
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LCF AUTO PERFORMANCE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Garage Automobile Professionnel', 105, 28, { align: 'center' });
  
  // Add document title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 105, 45, { align: 'center' });
  
  // Add invoice number and date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Numéro: ${invoice.invoiceNumber}`, 20, 60);
  doc.text(`Date: ${new Date(invoice.createdAt.toDate()).toLocaleDateString('fr-FR')}`, 20, 67);
  if (invoice.dueDate) {
    doc.text(`Date d'échéance: ${new Date(invoice.dueDate.toDate()).toLocaleDateString('fr-FR')}`, 20, 74);
  }
  
  // Add status badge
  let statusText = '';
  switch (invoice.status) {
    case 'paid':
      statusText = 'PAYÉE';
      break;
    case 'sent':
      statusText = 'ENVOYÉE';
      break;
    case 'overdue':
      statusText = 'EN RETARD';
      break;
    default:
      statusText = 'BROUILLON';
  }
  doc.setFont('helvetica', 'bold');
  doc.text(`Statut: ${statusText}`, 20, 81);
  
  // Add customer information
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 20, 97);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName, 20, 104);
  doc.text(invoice.customerEmail, 20, 111);
  if (invoice.customerPhone) {
    doc.text(invoice.customerPhone, 20, 118);
  }
  if (invoice.customerAddress) {
    doc.text(invoice.customerAddress, 20, 125);
  }
  
  // Add line items table
  let yPos = 145;
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, yPos);
  doc.text('Qté', 120, yPos, { align: 'right' });
  doc.text('Prix Unit.', 150, yPos, { align: 'right' });
  doc.text('Total', 190, yPos, { align: 'right' });
  
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  
  invoice.items.forEach((item) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(item.description, 20, yPos);
    doc.text(item.quantity.toString(), 120, yPos, { align: 'right' });
    doc.text(`${item.unitPrice.toFixed(2)} €`, 150, yPos, { align: 'right' });
    doc.text(`${item.total.toFixed(2)} €`, 190, yPos, { align: 'right' });
    yPos += 7;
  });
  
  // Add totals
  yPos += 5;
  doc.line(20, yPos, 190, yPos);
  yPos += 8;
  
  doc.text('Sous-total:', 120, yPos);
  doc.text(`${invoice.subtotal.toFixed(2)} €`, 190, yPos, { align: 'right' });
  yPos += 7;
  
  doc.text('TVA:', 120, yPos);
  doc.text(`${invoice.taxAmount.toFixed(2)} €`, 190, yPos, { align: 'right' });
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC:', 120, yPos);
  doc.text(`${invoice.total.toFixed(2)} €`, 190, yPos, { align: 'right' });
  
  // Add notes if any
  if (invoice.notes) {
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, 20, yPos);
  }
  
  return doc;
}

// Download quote PDF
export function downloadQuotePDF(quote: Quote): void {
  const doc = generateQuotePDF(quote);
  doc.save(`Devis-${quote.quoteNumber}.pdf`);
}

// Download invoice PDF
export function downloadInvoicePDF(invoice: Invoice): void {
  const doc = generateInvoicePDF(invoice);
  doc.save(`Facture-${invoice.invoiceNumber}.pdf`);
}

// Get PDF as blob for email attachment
export function getQuotePDFBlob(quote: Quote): Blob {
  const doc = generateQuotePDF(quote);
  return doc.output('blob');
}

// Get PDF as blob for email attachment
export function getInvoicePDFBlob(invoice: Invoice): Blob {
  const doc = generateInvoicePDF(invoice);
  return doc.output('blob');
}
