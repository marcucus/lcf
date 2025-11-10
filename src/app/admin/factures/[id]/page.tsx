'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getInvoice, markInvoiceAsPaid, deleteInvoice } from '@/lib/firestore/invoices';
import { Invoice } from '@/types';
import { FiEdit2, FiTrash2, FiMail, FiCheck, FiDownload, FiArrowLeft } from 'react-icons/fi';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function InvoiceViewPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const invoiceId = params.id as string;

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }

    loadInvoice();
  }, [user, invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await getInvoice(invoiceId);
      if (!data) {
        alert('Facture non trouvée');
        router.push('/admin/factures');
        return;
      }
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Erreur lors du chargement de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice) return;

    try {
      setSending(true);
      const functions = getFunctions();
      const sendInvoiceEmail = httpsCallable(functions, 'sendInvoiceEmail');
      
      await sendInvoiceEmail({ invoiceId: invoice.invoiceId });
      
      alert('Facture envoyée par email avec succès !');
      await loadInvoice(); // Reload to get updated status
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erreur lors de l\'envoi de l\'email: ' + (error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;

    try {
      await markInvoiceAsPaid(invoice.invoiceId);
      alert('Facture marquée comme payée !');
      await loadInvoice();
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;

    try {
      await deleteInvoice(invoice.invoiceId);
      alert('Facture supprimée avec succès');
      router.push('/admin/factures');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Erreur lors de la suppression de la facture');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      overdue: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };

    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      cancelled: 'Annulée',
      overdue: 'En retard',
    };

    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1CCEFF] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => router.push('/admin/factures')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#1CCEFF] transition-colors mb-4"
          >
            <FiArrowLeft />
            Retour aux factures
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Facture {invoice.invoiceNumber}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {getStatusBadge(invoice.status)}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Créée le {new Date(invoice.createdAt.toMillis()).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {invoice.status !== 'paid' && (
            <button
              onClick={handleMarkAsPaid}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiCheck />
              Marquer comme payée
            </button>
          )}
          {invoice.status === 'draft' && (
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FiMail />
              {sending ? 'Envoi...' : 'Envoyer par email'}
            </button>
          )}
          <button
            onClick={() => router.push(`/admin/factures/${invoice.invoiceId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiEdit2 />
            Modifier
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FiTrash2 />
            Supprimer
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1CCEFF] to-[#0ea5e9] text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">LCF AUTO PERFORMANCE</h2>
              <p className="mt-2 text-sm opacity-90">Votre garage de confiance</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">FACTURE</p>
              <p className="text-2xl font-bold">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Invoice & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                Informations de facturation
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900 dark:text-white">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(invoice.createdAt.toMillis()).toLocaleDateString('fr-FR')}
                </p>
                {invoice.dueDate && (
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Date d'échéance:</span>{' '}
                    {new Date(invoice.dueDate.toMillis()).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {invoice.sentAt && (
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Envoyée le:</span>{' '}
                    {new Date(invoice.sentAt.toMillis()).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {invoice.paidDate && (
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Payée le:</span>{' '}
                    {new Date(invoice.paidDate.toMillis()).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                Client
              </h3>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900 dark:text-white">{invoice.customerName}</p>
                <p className="text-gray-600 dark:text-gray-400">{invoice.customerEmail}</p>
                {invoice.customerPhone && (
                  <p className="text-gray-600 dark:text-gray-400">{invoice.customerPhone}</p>
                )}
                {invoice.customerAddress && (
                  <p className="text-gray-600 dark:text-gray-400">{invoice.customerAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
              Détails de la facture
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Qté
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Prix unitaire
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      TVA
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Total TTC
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.items.map((item) => (
                    <tr key={item.itemId}>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {item.description}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white">
                        {item.unitPrice.toFixed(2)} €
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white">
                        {item.taxRate}%
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                        {item.totalWithTax.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Sous-total HT:</span>
                <span className="font-medium">{invoice.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>TVA:</span>
                <span className="font-medium">{invoice.taxAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-3">
                <span className="text-gray-900 dark:text-white">Total TTC:</span>
                <span className="text-[#1CCEFF]">{invoice.total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-r">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Note:</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
