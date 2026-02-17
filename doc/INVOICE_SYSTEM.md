# Invoice Management and Fiscal Declaration System

This document describes the invoice management and fiscal declaration export system implemented for LCF AUTO PERFORMANCE.

## Overview

The system allows administrators to:
- Create and manage invoices
- Track payments
- Export data for fiscal declarations (auto-entrepreneur regime)
- Generate CSV and PDF reports

## Features

### Invoice Management
- Sequential invoice numbering (FAC-YYYY-NNN format)
- Multi-line invoice items with VAT calculations
- Payment tracking with date, method, and status
- Support for attachment URLs (supporting documents)

### Fiscal Declaration Export
- CSV export for accounting software
- HTML-based PDF export for fiscal declarations
- Period-based filtering (date range)
- Revenue calculation for specified periods
- Only paid invoices included for accurate reporting

## Usage

### Creating an Invoice
1. Navigate to Admin > Factures
2. Click "Nouvelle Facture"
3. Fill in customer information
4. Add invoice line items
5. Set payment status and details
6. Save the invoice

### Generating Fiscal Declarations
1. Navigate to Admin > Déclaration Fiscale
2. Select the date range (start and end dates)
3. Click "Rechercher" to load invoices
4. Use "Exporter en CSV" or "Exporter en PDF" buttons
5. The CSV can be imported into accounting software
6. The PDF can be printed for fiscal declarations

## Data Model

### Invoice
- `invoiceNumber`: Unique sequential number (FAC-YYYY-NNN)
- `userId`: Customer ID
- `customerName`: Customer full name
- `issueDate`: Date of invoice issue
- `paymentDate`: Date payment was received
- `status`: paid | pending | cancelled
- `paymentMethod`: cash | card | transfer | check
- `items`: Array of invoice line items
- `totalHT`: Total excluding VAT
- `totalTVA`: Total VAT amount
- `totalTTC`: Total including VAT
- `attachmentUrls`: Array of supporting document URLs

### Invoice Item
- `description`: Item description
- `quantity`: Quantity
- `unitPrice`: Price per unit
- `vatRate`: VAT rate percentage
- `totalHT`: Line total excluding VAT
- `totalTTC`: Line total including VAT

## API Routes

### `/api/fiscal/export-csv`
POST endpoint that generates a CSV file with invoice data.

Request body:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

Response: CSV file download

### `/api/fiscal/export-pdf`
POST endpoint that generates an HTML report (printable to PDF).

Request body:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

Response: HTML page

## Admin Pages

- `/admin/factures` - Invoice list and management
- `/admin/factures/nouvelle` - Create new invoice
- `/admin/factures/[id]` - View and edit invoice details
- `/admin/declaration-fiscale` - Fiscal declaration export

## Security

- Only users with `admin` role can access invoice features
- All invoice operations require authentication
- Firestore security rules should be configured to restrict access

## Notes for Auto-Entrepreneur

For the French auto-entrepreneur regime (garage auto):
- The system tracks paid invoices for revenue declaration
- CSV exports can be imported into accounting software
- PDF reports provide a printable summary for fiscal authorities
- Keep all supporting documents (attachments) for audits
- Declare the total revenue (TTC) of paid invoices for each period
