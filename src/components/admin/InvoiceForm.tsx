'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Invoice, InvoiceLineItem, User } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createInvoice, updateInvoice } from '@/lib/firestore/invoices';
import { getAllUsers } from '@/lib/firestore/users';
import { useAuth } from '@/contexts/AuthContext';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { Timestamp } from 'firebase/firestore';

interface InvoiceFormProps {
  invoice?: Invoice;
  onCancel: () => void;
  onSuccess: () => void;
}

export function InvoiceForm({ invoice, onCancel, onSuccess }: InvoiceFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState<{
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    taxRate: number;
    dueDate: string;
    notes: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  }>({
    userId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    taxRate: 0.20, // 20% TVA by default
    dueDate: '',
    notes: '',
    status: 'draft',
  });

  const [items, setItems] = useState<InvoiceLineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
  ]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (invoice) {
      setFormData({
        userId: invoice.userId,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerPhone: invoice.customerPhone || '',
        customerAddress: invoice.customerAddress || '',
        taxRate: invoice.taxRate,
        dueDate: new Date(invoice.dueDate.toDate()).toISOString().split('T')[0],
        notes: invoice.notes || '',
        status: invoice.status,
      });
      setItems(invoice.items);
    } else {
      // Default due date: 30 days from now
      const dueDateValue = new Date();
      dueDateValue.setDate(dueDateValue.getDate() + 30);
      setFormData((prev) => ({
        ...prev,
        dueDate: dueDateValue.toISOString().split('T')[0],
      }));
    }
  }, [invoice]);

  const loadUsers = async () => {
    try {
      const { users: userData } = await getAllUsers();
      setUsers(userData);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find((u) => u.uid === userId);
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        userId,
        customerName: `${selectedUser.firstName} ${selectedUser.lastName}`,
        customerEmail: selectedUser.email,
      }));
    }
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    
    // Recalculate total for this item
    newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * formData.taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.customerName || !formData.customerEmail) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      if (items.length === 0 || items.some((item) => !item.description)) {
        throw new Error('Veuillez ajouter au moins un article avec une description');
      }

      if (!formData.dueDate) {
        throw new Error('Veuillez définir une date d\'échéance');
      }

      const { subtotal, taxAmount, total } = calculateTotals();
      const dueDateValue = new Date(formData.dueDate);

      const invoiceData = {
        userId: formData.userId || 'guest',
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items,
        subtotal,
        taxRate: formData.taxRate,
        taxAmount,
        total,
        status: formData.status,
        dueDate: Timestamp.fromDate(dueDateValue),
        notes: formData.notes,
        createdBy: user?.uid || '',
      };

      if (invoice) {
        await updateInvoice(invoice.invoiceId, invoiceData);
      } else {
        await createInvoice(invoiceData);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Informations client
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Sélectionner un client (optionnel)
              </label>
              <Select
                value={formData.userId}
                onChange={(e) => handleUserSelect(e.target.value)}
              >
                <option value="">-- Nouveau client --</option>
                {users.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Nom du client *"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
            <Input
              label="Email *"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              required
            />
            <Input
              label="Téléphone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
            <Input
              label="Date d'échéance *"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Adresse"
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              rows={2}
            />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Articles
            </h2>
            <Button type="button" onClick={handleAddItem} size="sm">
              Ajouter
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Article {index + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      variant="secondary"
                      size="sm"
                      className="text-red-600"
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      label="Description *"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Quantité *"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    required
                  />
                  <Input
                    label="Prix unitaire (€) *"
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="mt-2 text-right text-gray-900 dark:text-white font-medium">
                  Total: {item.totalPrice.toFixed(2)} €
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Totaux
          </h2>
          <div className="space-y-2 text-right">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Sous-total:</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>TVA ({(formData.taxRate * 100).toFixed(0)}%):</span>
              <span>{taxAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
              <span>Total TTC:</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          <div className="mt-4">
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Conditions de paiement, garanties, etc."
            />
          </div>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" onClick={onCancel} variant="secondary" disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : invoice ? 'Mettre à jour' : 'Créer la facture'}
          </Button>
        </div>
      </form>
    </div>
  );
}
