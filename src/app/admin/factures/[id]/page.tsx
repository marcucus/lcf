'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Invoice } from '@/types';
import { getInvoice, markInvoiceAsPaid, updateInvoice } from '@/lib/firestore/invoices';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function InvoiceDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'check'>('cash');

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setIsLoading(true);
      const data = await getInvoice(invoiceId);
      if (data) {
        setInvoice(data);
        if (data.paymentDate) {
          setPaymentDate(data.paymentDate.toDate().toISOString().split('T')[0]);
        }
      } else {
        alert('Facture non trouvée');
        router.push('/admin/factures');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Erreur lors du chargement de la facture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!paymentDate) {
      alert('Veuillez sélectionner une date de paiement');
      return;
    }

    try {
      setIsUpdating(true);
      await markInvoiceAsPaid(invoiceId, new Date(paymentDate), paymentMethod);
      await loadInvoice();
      setShowPaymentForm(false);
      alert('Facture marquée comme payée');
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (status: 'pending' | 'cancelled') => {
    try {
      setIsUpdating(true);
      await updateInvoice(invoiceId, { status });
      await loadInvoice();
      alert('Statut mis à jour');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!invoice || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Facture {invoice.invoiceNumber}</h1>
        <Button variant="secondary" onClick={() => router.push('/admin/factures')}>
          Retour
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Statut</h3>
          <p className="text-xl font-bold">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                invoice.status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : invoice.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Annulée'}
            </span>
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Montant Total</h3>
          <p className="text-2xl font-bold text-[#1CCEFF]">{invoice.totalTTC.toFixed(2)} €</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Date d'émission</h3>
          <p className="text-xl font-bold">{invoice.issueDate.toDate().toLocaleDateString('fr-FR')}</p>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Informations Client</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nom</p>
            <p className="font-medium">{invoice.customerName}</p>
          </div>
          {invoice.customerEmail && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium">{invoice.customerEmail}</p>
            </div>
          )}
          {invoice.customerAddress && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Adresse</p>
              <p className="font-medium">{invoice.customerAddress}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Détails de la Facture</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qté</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix Unit.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">TVA</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total HT</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.unitPrice.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-sm text-right">{item.vatRate}%</td>
                  <td className="px-4 py-3 text-sm text-right">{item.totalHT.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{item.totalTTC.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total HT:</span>
                <span className="font-medium">{invoice.totalHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total TVA:</span>
                <span className="font-medium">{invoice.totalTVA.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
                <span>Total TTC:</span>
                <span className="text-[#1CCEFF]">{invoice.totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {invoice.notes && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <p className="text-gray-700 dark:text-gray-300">{invoice.notes}</p>
        </Card>
      )}

      {invoice.status === 'paid' && invoice.paymentDate && (
        <Card className="p-6 mb-6 bg-green-50 dark:bg-green-900/20">
          <h2 className="text-xl font-semibold mb-4">Informations de Paiement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Date de paiement</p>
              <p className="font-medium">{invoice.paymentDate.toDate().toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Méthode de paiement</p>
              <p className="font-medium">
                {invoice.paymentMethod === 'cash' ? 'Espèces' : 
                 invoice.paymentMethod === 'card' ? 'Carte bancaire' :
                 invoice.paymentMethod === 'transfer' ? 'Virement' : 'Chèque'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {invoice.attachmentUrls && invoice.attachmentUrls.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Pièces Justificatives</h2>
          <div className="space-y-2">
            {invoice.attachmentUrls.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded">
                <span className="text-sm">Document {index + 1}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1CCEFF] hover:underline text-sm"
                >
                  Télécharger
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        
        {invoice.status === 'pending' && !showPaymentForm && (
          <div className="flex gap-4">
            <Button onClick={() => setShowPaymentForm(true)}>
              Marquer comme Payée
            </Button>
            <Button variant="secondary" onClick={() => handleUpdateStatus('cancelled')}>
              Annuler la Facture
            </Button>
          </div>
        )}

        {invoice.status === 'pending' && showPaymentForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date de paiement</label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Méthode de paiement</label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="cash">Espèces</option>
                  <option value="card">Carte bancaire</option>
                  <option value="transfer">Virement</option>
                  <option value="check">Chèque</option>
                </Select>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleMarkAsPaid} disabled={isUpdating}>
                {isUpdating ? 'Mise à jour...' : 'Confirmer le Paiement'}
              </Button>
              <Button variant="secondary" onClick={() => setShowPaymentForm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {invoice.status === 'cancelled' && (
          <div className="flex gap-4">
            <Button onClick={() => handleUpdateStatus('pending')}>
              Réactiver la Facture
            </Button>
          </div>
        )}

        {invoice.status === 'paid' && (
          <p className="text-green-600 font-medium">Cette facture a été payée</p>
        )}
      </Card>
    </div>
  );
}
