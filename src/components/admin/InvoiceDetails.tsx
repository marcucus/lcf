'use client';

import { Invoice } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiX, FiEdit, FiDownload, FiMail, FiCheck } from 'react-icons/fi';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  onDownloadPDF: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
  onMarkAsPaid: () => void;
}

export function InvoiceDetails({
  invoice,
  onClose,
  onEdit,
  onDownloadPDF,
  onSendEmail,
  onMarkAsPaid,
}: InvoiceDetailsProps) {
  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Facture {invoice.invoiceNumber}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Statut: <span className="font-semibold">{getStatusLabel(invoice.status)}</span>
          </p>
        </div>
        <Button onClick={onClose} variant="secondary">
          Fermer
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Informations client
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
              <p className="text-gray-900 dark:text-white font-medium">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white font-medium">{invoice.customerEmail}</p>
            </div>
            {invoice.customerPhone && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                <p className="text-gray-900 dark:text-white font-medium">{invoice.customerPhone}</p>
              </div>
            )}
            {invoice.customerAddress && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                <p className="text-gray-900 dark:text-white font-medium">{invoice.customerAddress}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Dates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date de création</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {new Date(invoice.createdAt.toDate()).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {invoice.dueDate && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date d'échéance</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(invoice.dueDate.toDate()).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
            {invoice.sentAt && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date d'envoi</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(invoice.sentAt.toDate()).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
            {invoice.paidDate && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date de paiement</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(invoice.paidDate.toDate()).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Articles
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300">Qté</th>
                  <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300">Prix Unit.</th>
                  <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-2 text-gray-900 dark:text-white">{item.description}</td>
                    <td className="py-3 px-2 text-right text-gray-900 dark:text-white">{item.quantity}</td>
                    <td className="py-3 px-2 text-right text-gray-900 dark:text-white">
                      {item.unitPrice.toFixed(2)} €
                    </td>
                    <td className="py-3 px-2 text-right text-gray-900 dark:text-white font-medium">
                      {item.total.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Sous-total:</span>
              <span>{invoice.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>TVA:</span>
              <span>{invoice.taxAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-700 pt-2">
              <span>Total TTC:</span>
              <span>{invoice.total.toFixed(2)} €</span>
            </div>
          </div>
        </Card>

        {invoice.notes && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Notes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
          </Card>
        )}

        <div className="flex flex-wrap gap-4 justify-end">
          <Button onClick={onEdit} variant="secondary">
            Modifier
          </Button>
          <Button onClick={() => onDownloadPDF(invoice)} variant="secondary">
            Télécharger PDF
          </Button>
          <Button onClick={() => onSendEmail(invoice)} variant="primary">
            Envoyer par Email
          </Button>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <Button onClick={onMarkAsPaid} variant="primary">
              Marquer comme payée
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
