import { NextRequest, NextResponse } from 'next/server';
import { getPaidInvoicesByDateRange } from '@/lib/firestore/invoices';

// Generate CSV export for fiscal declaration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all paid invoices in the date range
    const invoices = await getPaidInvoicesByDateRange(start, end);

    // Calculate totals
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);

    // Generate CSV content
    const csvHeader = [
      'Numéro Facture',
      'Date Emission',
      'Date Paiement',
      'Client',
      'Montant HT (€)',
      'Montant TVA (€)',
      'Montant TTC (€)',
      'Méthode Paiement',
      'Statut',
      'Notes'
    ].join(';');

    const csvRows = invoices.map(invoice => {
      const issueDate = invoice.issueDate.toDate().toLocaleDateString('fr-FR');
      const paymentDate = invoice.paymentDate 
        ? invoice.paymentDate.toDate().toLocaleDateString('fr-FR')
        : '';
      
      return [
        invoice.invoiceNumber,
        issueDate,
        paymentDate,
        invoice.customerName,
        invoice.totalHT.toFixed(2),
        invoice.totalTVA.toFixed(2),
        invoice.totalTTC.toFixed(2),
        invoice.paymentMethod || '',
        invoice.status,
        (invoice.notes || '').replace(/;/g, ',') // Replace semicolons to avoid CSV issues
      ].join(';');
    });

    // Add summary row
    const summaryRow = [
      'TOTAL',
      '',
      '',
      `${invoices.length} factures`,
      invoices.reduce((sum, inv) => sum + inv.totalHT, 0).toFixed(2),
      invoices.reduce((sum, inv) => sum + inv.totalTVA, 0).toFixed(2),
      totalRevenue.toFixed(2),
      '',
      '',
      ''
    ].join(';');

    const csvContent = [csvHeader, ...csvRows, '', summaryRow].join('\n');

    // Add BOM for proper Excel encoding
    const csvWithBOM = '\uFEFF' + csvContent;

    return new NextResponse(csvWithBOM, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="declaration-fiscale-${start.getFullYear()}-${end.getFullYear()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV export' },
      { status: 500 }
    );
  }
}
