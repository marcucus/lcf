'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { QuotationItem, QuotationStatus, User, Appointment } from '@/types';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

interface QuotationFormProps {
  onSubmit: (data: QuotationFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: QuotationFormData;
  users?: User[];
  appointments?: Appointment[];
  isLoading?: boolean;
}

export interface QuotationFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  userId?: string;
  appointmentId?: string;
  items: QuotationItem[];
  notes: string;
  internalNotes: string;
  validUntil: string;
  status: QuotationStatus;
}

export function QuotationForm({
  onSubmit,
  onCancel,
  initialData,
  users = [],
  appointments = [],
  isLoading = false,
}: QuotationFormProps) {
  const [formData, setFormData] = useState<QuotationFormData>(
    initialData || {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      userId: '',
      appointmentId: '',
      items: [{ itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 20, total: 0, totalWithTax: 0 }],
      notes: '',
      internalNotes: '',
      validUntil: '',
      status: 'draft',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill client info when user is selected
  useEffect(() => {
    if (formData.userId) {
      const selectedUser = users.find((u) => u.uid === formData.userId);
      if (selectedUser) {
        setFormData((prev) => ({
          ...prev,
          clientName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          clientEmail: selectedUser.email,
        }));
      }
    }
  }, [formData.userId, users]);

  // Update item total when quantity or price changes
  const updateItemTotal = (index: number, item: QuotationItem) => {
    const total = item.quantity * item.unitPrice;
    return { ...item, total };
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'description' ? value : Number(value),
    };
    newItems[index] = updateItemTotal(index, newItems[index]);
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 20, total: 0, totalWithTax: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;

    formData.items.forEach((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTax = itemTotal * (item.taxRate / 100);
      subtotal += itemTotal;
      totalTax += itemTax;
    });

    return {
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalAmount: (subtotal + totalTax).toFixed(2),
    };
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est requis';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'L\'email du client est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Format d\'email invalide';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Au moins un article est requis';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.description.trim()) {
          newErrors[`item_${index}_description`] = 'Description requise';
        }
        if (item.quantity <= 0) {
          newErrors[`item_${index}_quantity`] = 'Quantité invalide';
        }
        if (item.unitPrice < 0) {
          newErrors[`item_${index}_unitPrice`] = 'Prix invalide';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {initialData ? 'Modifier le devis' : 'Nouveau devis'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Optional Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lier à un utilisateur (optionnel)
          </label>
          <Select
            value={formData.userId || ''}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value || undefined })}
          >
            <option value="">Aucun utilisateur</option>
            {users.map((user) => (
              <option key={user.uid} value={user.uid}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lier à un rendez-vous (optionnel)
          </label>
          <Select
            value={formData.appointmentId || ''}
            onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value || undefined })}
          >
            <option value="">Aucun rendez-vous</option>
            {appointments.map((apt) => (
              <option key={apt.appointmentId} value={apt.appointmentId}>
                {apt.customerName} - {new Date(apt.dateTime.seconds * 1000).toLocaleDateString()}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informations client</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom du client *"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            error={errors.clientName}
            required
          />

          <Input
            label="Email *"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            error={errors.clientEmail}
            required
          />

          <Input
            label="Téléphone"
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
          />

          <Input
            label="Adresse"
            value={formData.clientAddress}
            onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Articles / Services</h3>
          <Button type="button" onClick={addItem} variant="secondary" size="sm">
            <FiPlus className="w-4 h-4 mr-2" />
            Ajouter un article
          </Button>
        </div>

        {errors.items && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
        )}

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Article {index + 1}
                </span>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Input
                label="Description *"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                error={errors[`item_${index}_description`]}
                required
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input
                  label="Quantité *"
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  error={errors[`item_${index}_quantity`]}
                  required
                />

                <Input
                  label="Prix unitaire (€) *"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  error={errors[`item_${index}_unitPrice`]}
                  required
                />

                <Input
                  label="TVA (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={item.taxRate}
                  onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total HT
                  </label>
                  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white font-medium">
                    {item.total.toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-gray-700 dark:text-gray-300">
          <span>Sous-total HT:</span>
          <span className="font-medium">{totals.subtotal} €</span>
        </div>
        <div className="flex justify-between text-gray-700 dark:text-gray-300">
          <span>Total TVA:</span>
          <span className="font-medium">{totals.totalTax} €</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Total TTC:</span>
          <span>{totals.totalAmount} €</span>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date de validité
          </label>
          <Input
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Statut
          </label>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as QuotationStatus })}
          >
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyé</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Refusé</option>
            <option value="expired">Expiré</option>
          </Select>
        </div>
      </div>

      <Textarea
        label="Notes pour le client"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
        placeholder="Notes qui apparaîtront sur le devis..."
      />

      <Textarea
        label="Notes internes"
        value={formData.internalNotes}
        onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
        rows={3}
        placeholder="Notes visibles uniquement par les administrateurs..."
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" onClick={onCancel} variant="secondary" disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer le devis'}
        </Button>
      </div>
    </form>
  );
}
