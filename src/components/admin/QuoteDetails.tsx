'use client';

import { Quote } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiX, FiEdit, FiDownload, FiMail } from 'react-icons/fi';

interface QuoteDetailsProps {
  quote: Quote;
  onClose: () => void;
  onEdit: () => void;
  onDownloadPDF: (quote: Quote) => void;
  onSendEmail: (quote: Quote) => void;
}

export function QuoteDetails({
  quote,
  onClose,
  onEdit,
  onDownloadPDF,
  onSendEmail,
}: QuoteDetailsProps) {
  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Rejeté',
      expired: 'Expiré',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Devis {quote.quoteNumber}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Statut: <span className="font-semibold">{getStatusLabel(quote.status)}</span>
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
              <p className="text-gray-900 dark:text-white font-medium">{quote.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white font-medium">{quote.customerEmail}</p>
            </div>
            {quote.customerPhone && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                <p className="text-gray-900 dark:text-white font-medium">{quote.customerPhone}</p>
              </div>
            )}
            {quote.customerAddress && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                <p className="text-gray-900 dark:text-white font-medium">{quote.customerAddress}</p>
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
                {new Date(quote.createdAt.toDate()).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Valide jusqu'au</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {new Date(quote.validUntil.toDate()).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {quote.sentAt && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date d'envoi</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(quote.sentAt.toDate()).toLocaleDateString('fr-FR')}
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
                {quote.items.map((item, index) => (
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
              <span>{quote.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>TVA ({(quote.taxRate * 100).toFixed(0)}%):</span>
              <span>{quote.taxAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-700 pt-2">
              <span>Total TTC:</span>
              <span>{quote.total.toFixed(2)} €</span>
            </div>
          </div>
        </Card>

        {quote.notes && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Notes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{quote.notes}</p>
          </Card>
        )}

        <div className="flex flex-wrap gap-4 justify-end">
          <Button onClick={onEdit} variant="secondary">
            Modifier
          </Button>
          <Button onClick={() => onDownloadPDF(quote)} variant="secondary">
            Télécharger PDF
          </Button>
          <Button onClick={() => onSendEmail(quote)} variant="primary">
            Envoyer par Email
          </Button>
        </div>
      </div>
    </div>
  );
}
