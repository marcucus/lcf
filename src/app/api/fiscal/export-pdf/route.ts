import { NextRequest, NextResponse } from 'next/server';
import { getPaidInvoicesByDateRange } from '@/lib/firestore/invoices';

// Generate HTML report for fiscal declaration (can be printed to PDF by browser)
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
    const totalHT = invoices.reduce((sum, inv) => sum + inv.totalHT, 0);
    const totalTVA = invoices.reduce((sum, inv) => sum + inv.totalTVA, 0);
    const totalTTC = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);

    // Generate HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Déclaration Fiscale - LCF AUTO PERFORMANCE</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-size: 12px;
    }
    h1 {
      color: #1CCEFF;
      text-align: center;
      margin-bottom: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #1CCEFF;
      padding-bottom: 20px;
    }
    .period {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .summary {
      background-color: #f9f9f9;
      border: 2px solid #1CCEFF;
      padding: 20px;
      margin-top: 30px;
    }
    .summary h2 {
      color: #1CCEFF;
      margin-top: 0;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .summary-item:last-child {
      border-bottom: none;
      font-weight: bold;
      font-size: 16px;
      margin-top: 10px;
      padding-top: 20px;
      border-top: 2px solid #1CCEFF;
    }
    .text-right {
      text-align: right;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background-color: #1CCEFF;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover {
      background-color: #17b8e6;
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Imprimer en PDF</button>
  
  <div class="header">
    <h1>DÉCLARATION FISCALE AUTO-ENTREPRENEUR</h1>
    <p><strong>LCF AUTO PERFORMANCE</strong></p>
    <p>Garage Automobile - Régime Auto-Entrepreneur</p>
  </div>

  <div class="period">
    Période : du ${start.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}
  </div>

  <h2>Liste des Factures Payées</h2>
  <table>
    <thead>
      <tr>
        <th>N° Facture</th>
        <th>Date</th>
        <th>Client</th>
        <th class="text-right">Montant HT</th>
        <th class="text-right">TVA</th>
        <th class="text-right">Montant TTC</th>
        <th>Paiement</th>
      </tr>
    </thead>
    <tbody>
      ${invoices.map(invoice => `
        <tr>
          <td>${invoice.invoiceNumber}</td>
          <td>${invoice.paymentDate ? invoice.paymentDate.toDate().toLocaleDateString('fr-FR') : '-'}</td>
          <td>${invoice.customerName}</td>
          <td class="text-right">${invoice.totalHT.toFixed(2)} €</td>
          <td class="text-right">${invoice.totalTVA.toFixed(2)} €</td>
          <td class="text-right">${invoice.totalTTC.toFixed(2)} €</td>
          <td>${invoice.paymentMethod || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary">
    <h2>Récapitulatif Fiscal</h2>
    <div class="summary-item">
      <span>Nombre de factures :</span>
      <span>${invoices.length}</span>
    </div>
    <div class="summary-item">
      <span>Total Hors Taxes (HT) :</span>
      <span>${totalHT.toFixed(2)} €</span>
    </div>
    <div class="summary-item">
      <span>Total TVA :</span>
      <span>${totalTVA.toFixed(2)} €</span>
    </div>
    <div class="summary-item">
      <span>CHIFFRE D'AFFAIRES TOTAL (TTC) :</span>
      <span>${totalTTC.toFixed(2)} €</span>
    </div>
  </div>

  <div style="margin-top: 50px; text-align: center; color: #666; font-size: 10px;">
    <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
    <p>LCF AUTO PERFORMANCE - Garage Automobile</p>
  </div>
</body>
</html>
    `;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating PDF export:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF export' },
      { status: 500 }
    );
  }
}
