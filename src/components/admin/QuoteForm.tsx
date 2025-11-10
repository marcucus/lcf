'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Quote, InvoiceItem, User } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createQuote, updateQuote } from '@/lib/firestore/quotes';
import { getAllUsers } from '@/lib/firestore/users';
import { useAuth } from '@/contexts/AuthContext';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { Timestamp } from 'firebase/firestore';

interface QuoteFormProps {
  quote?: Quote;
  onCancel: () => void;
  onSuccess: () => void;
}

export function QuoteForm({ quote, onCancel, onSuccess }: QuoteFormProps) {
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
    validUntil: string;
    notes: string;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  }>({
    userId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    validUntil: '',
    notes: '',
    status: 'draft',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 20, total: 0, totalWithTax: 0 },
  ]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (quote) {
      setFormData({
        userId: quote.userId,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone || '',
        customerAddress: quote.customerAddress || '',
        validUntil: new Date(quote.validUntil.toDate()).toISOString().split('T')[0],
        notes: quote.notes || '',
        status: quote.status,
      });
      setItems(quote.items);
    } else {
      // Default valid until: 30 days from now
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + 30);
      setFormData((prev) => ({
        ...prev,
        validUntil: validUntilDate.toISOString().split('T')[0],
      }));
    }
  }, [quote]);

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
    setItems([...items, { itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 20, total: 0, totalWithTax: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    
    // Recalculate total for this item
    const itemTotal = newItems[index].quantity * newItems[index].unitPrice;
    newItems[index].total = itemTotal;
    newItems[index].totalWithTax = itemTotal * (1 + newItems[index].taxRate / 100);
    
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.total * item.taxRate / 100), 0);
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

      if (!formData.validUntil) {
        throw new Error('Veuillez définir une date de validité');
      }

      const { subtotal, taxAmount, total } = calculateTotals();
      const validUntilDate = new Date(formData.validUntil);

      if (quote) {
        // Calculate average tax rate from items
        const avgTaxRate = items.length > 0 
          ? items.reduce((sum, item) => sum + item.taxRate, 0) / items.length / 100
          : 0.20; // default 20%
        
        await updateQuote(quote.quoteId, {
          userId: formData.userId || 'guest',
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          items,
          subtotal,
          taxRate: avgTaxRate,
          taxAmount,
          total,
          status: formData.status,
          validUntil: Timestamp.fromDate(validUntilDate),
          notes: formData.notes,
        });
      } else {
        await createQuote(
          user?.uid || '',
          formData.userId || 'guest',
          formData.customerName,
          formData.customerEmail,
          items,
          formData.status,
          formData.customerPhone,
          formData.customerAddress,
          validUntilDate,
          formData.notes
        );
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
          {quote ? 'Modifier le devis' : 'Nouveau devis'}
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
              label="Valide jusqu'au *"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
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
                  Total: {item.total.toFixed(2)} €
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
              <span>TVA:</span>
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
            {loading ? 'Enregistrement...' : quote ? 'Mettre à jour' : 'Créer le devis'}
          </Button>
        </div>
      </form>
    </div>
  );
}
