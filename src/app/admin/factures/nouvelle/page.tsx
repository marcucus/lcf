'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { InvoiceItem, PaymentMethod, InvoiceStatus } from '@/types';
import { createInvoice } from '@/lib/firestore/invoices';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function NewInvoicePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [userId, setUserId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('pending');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Invoice items
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, vatRate: 0, totalHT: 0, totalTTC: 0 }
  ]);

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, loading, router]);

  const calculateItemTotal = (item: InvoiceItem): InvoiceItem => {
    const totalHT = item.quantity * item.unitPrice;
    const totalTTC = totalHT * (1 + item.vatRate / 100);
    return { ...item, totalHT, totalTTC };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index] = calculateItemTotal(newItems[index]);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, vatRate: 0, totalHT: 0, totalTTC: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Le nom du client est requis');
      return;
    }

    if (items.some(item => !item.description.trim())) {
      alert('Toutes les lignes doivent avoir une description');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createInvoice(
        userId || 'unknown',
        customerName,
        items,
        user!.uid,
        {
          customerEmail,
          customerAddress,
          appointmentId,
          status,
          paymentMethod: status === 'paid' ? paymentMethod : undefined,
          paymentDate: status === 'paid' && paymentDate ? new Date(paymentDate) : undefined,
          notes,
        }
      );

      alert('Facture créée avec succès');
      router.push('/admin/factures');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Erreur lors de la création de la facture');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalHT = items.reduce((sum, item) => sum + item.totalHT, 0);
  const totalTVA = items.reduce((sum, item) => sum + (item.totalTTC - item.totalHT), 0);
  const totalTTC = items.reduce((sum, item) => sum + item.totalTTC, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nouvelle Facture</h1>
        <Button variant="secondary" onClick={() => router.push('/admin/factures')}>
          Retour
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations Client</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom du Client *</label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Adresse</label>
              <Input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ID Utilisateur</label>
              <Input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ID Rendez-vous</label>
              <Input
                type="text"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lignes de Facture</h2>
            <Button type="button" onClick={addItem} variant="secondary" size="sm">
              + Ajouter une ligne
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantité</label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prix Unitaire (€)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">TVA (%)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.vatRate}
                    onChange={(e) => handleItemChange(index, 'vatRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    variant="secondary"
                    size="sm"
                    disabled={items.length === 1}
                    className="w-full"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Total HT: {item.totalHT.toFixed(2)} € | Total TTC: {item.totalTTC.toFixed(2)} €
              </div>
            </div>
          ))}

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Total HT:</span>
              <span className="font-medium">{totalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Total TVA:</span>
              <span className="font-medium">{totalTVA.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
              <span>Total TTC:</span>
              <span className="text-[#1CCEFF]">{totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Paiement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Statut</label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              >
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="cancelled">Annulée</option>
              </Select>
            </div>
            {status === 'paid' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Méthode de Paiement</label>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="cash">Espèces</option>
                    <option value="card">Carte bancaire</option>
                    <option value="transfer">Virement</option>
                    <option value="check">Chèque</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date de Paiement</label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes additionnelles..."
          />
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer la Facture'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/factures')}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
