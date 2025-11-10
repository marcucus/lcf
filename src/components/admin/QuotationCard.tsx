'use client';

import { Quotation } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiEdit2, FiTrash2, FiMail, FiFileText, FiCheck, FiX } from 'react-icons/fi';

interface QuotationCardProps {
  quotation: Quotation;
  onEdit: (quotation: Quotation) => void;
  onDelete: (quotationId: string) => void;
  onSendEmail: (quotation: Quotation) => void;
  onConvertToInvoice?: (quotation: Quotation) => void;
}

export function QuotationCard({
  quotation,
  onEdit,
  onDelete,
  onSendEmail,
  onConvertToInvoice,
}: QuotationCardProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      sent: { label: 'Envoyé', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      accepted: { label: 'Accepté', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      rejected: { label: 'Refusé', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
      expired: { label: 'Expiré', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
      converted: { label: 'Converti', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    };

    const badge = badges[status as keyof typeof badges] || badges.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = quotation.validUntil && new Date(quotation.validUntil.seconds * 1000) < new Date();
  const canConvert = quotation.status === 'accepted' && !quotation.convertedToInvoice;
  const canSendEmail = ['draft', 'sent'].includes(quotation.status);

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {quotation.quotationNumber}
              </h3>
              {getStatusBadge(quotation.status)}
              {isExpired && quotation.status !== 'expired' && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                  Expiré
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Client: {quotation.clientName}
            </p>
            {quotation.clientEmail && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Email: {quotation.clientEmail}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quotation.totalAmount.toFixed(2)} €
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">TTC</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Créé le:</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(quotation.createdAt)}
            </p>
          </div>
          {quotation.validUntil && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Valable jusqu&apos;au:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(quotation.validUntil)}
              </p>
            </div>
          )}
        </div>

        {/* Items Summary */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Articles ({quotation.items.length}):
          </p>
          <ul className="space-y-1 text-sm">
            {quotation.items.slice(0, 3).map((item, index) => (
              <li key={index} className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>
                  {item.quantity}x {item.description}
                </span>
                <span className="font-medium">{(item.quantity * item.unitPrice).toFixed(2)} €</span>
              </li>
            ))}
            {quotation.items.length > 3 && (
              <li className="text-gray-500 dark:text-gray-400 italic">
                + {quotation.items.length - 3} autre(s) article(s)
              </li>
            )}
          </ul>
        </div>

        {/* Breakdown */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Sous-total HT:</span>
            <span>{quotation.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>TVA:</span>
            <span>{quotation.totalTax.toFixed(2)} €</span>
          </div>
        </div>

        {/* Optional Information */}
        {quotation.notes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {quotation.notes}
            </p>
          </div>
        )}

        {quotation.convertedToInvoice && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <FiCheck className="w-4 h-4" />
            <span>Converti en facture</span>
            {quotation.invoiceId && <span className="font-mono">({quotation.invoiceId})</span>}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => onEdit(quotation)}
            variant="secondary"
            size="sm"
          >
            <FiEdit2 className="w-4 h-4 mr-2" />
            Modifier
          </Button>

          {canSendEmail && (
            <Button
              onClick={() => onSendEmail(quotation)}
              variant="secondary"
              size="sm"
            >
              <FiMail className="w-4 h-4 mr-2" />
              Envoyer par email
            </Button>
          )}

          {canConvert && onConvertToInvoice && (
            <Button
              onClick={() => onConvertToInvoice(quotation)}
              variant="secondary"
              size="sm"
            >
              <FiFileText className="w-4 h-4 mr-2" />
              Convertir en facture
            </Button>
          )}

          <Button
            onClick={() => onDelete(quotation.quotationId)}
            variant="secondary"
            size="sm"
            className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
