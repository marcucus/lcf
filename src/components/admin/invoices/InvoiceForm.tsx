'use client';

import { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceStatus, InvoiceOrigin, User, Appointment, Quote } from '@/types';
import { getAllUsers } from '@/lib/firestore/users';
import { getAllAppointments } from '@/lib/firestore/appointments';
import { getQuotes } from '@/lib/firestore/quotes';
import { FiPlus, FiTrash2, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';

interface InvoiceFormProps {
  initialData?: Partial<Invoice>;
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface InvoiceFormData {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  origin: InvoiceOrigin;
  relatedAppointmentId?: string;
  relatedQuoteId?: string;
  dueDate?: Date;
  notes?: string;
}

export default function InvoiceForm({ initialData, onSubmit, onCancel, isLoading }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    userId: initialData?.userId || '',
    customerName: initialData?.customerName || '',
    customerEmail: initialData?.customerEmail || '',
    customerPhone: initialData?.customerPhone || '',
    customerAddress: initialData?.customerAddress || '',
    items: initialData?.items || [],
    status: initialData?.status || 'draft',
    origin: initialData?.origin || 'manual',
    relatedAppointmentId: initialData?.relatedAppointmentId,
    relatedQuoteId: initialData?.relatedQuoteId,
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate.toMillis()) : undefined,
    notes: initialData?.notes || '',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [usersResult, appointmentsData, quotesData] = await Promise.all([
        getAllUsers(),
        getAllAppointments(),
        getQuotes().then((result) => result.quotes),
      ]);
      setUsers(usersResult.users);
      setAppointments(appointmentsData);
      setQuotes(quotesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleOriginChange = (origin: InvoiceOrigin) => {
    setFormData({ 
      ...formData, 
      origin,
      relatedAppointmentId: undefined,
      relatedQuoteId: undefined,
    });
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find((u) => u.uid === userId);
    if (user) {
      setFormData({
        ...formData,
        userId,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
      });
    }
  };

  const handleAppointmentSelect = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.appointmentId === appointmentId);
    if (appointment) {
      const user = users.find((u) => u.uid === appointment.userId);
      setFormData({
        ...formData,
        relatedAppointmentId: appointmentId,
        userId: appointment.userId,
        customerName: appointment.customerName,
        customerEmail: user?.email || '',
      });
    }
  };

  const handleQuoteSelect = (quoteId: string) => {
    const quote = quotes.find((q) => q.quoteId === quoteId);
    if (quote) {
      setFormData({
        ...formData,
        relatedQuoteId: quoteId,
        userId: quote.userId,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        customerAddress: quote.customerAddress,
        items: quote.items,
        notes: quote.notes,
      });
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      itemId: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 20,
      total: 0,
      totalWithTax: 0,
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const removeItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.itemId !== itemId),
    });
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: unknown) => {
    const updatedItems = formData.items.map((item) => {
      if (item.itemId === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        updatedItem.totalWithTax = updatedItem.total * (1 + updatedItem.taxRate / 100);
        
        return updatedItem;
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    formData.items.forEach((item) => {
      subtotal += item.total;
      taxAmount += item.total * (item.taxRate / 100);
    });

    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.customerEmail || formData.items.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires et ajouter au moins un article.');
      return;
    }

    await onSubmit(formData);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1CCEFF]"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Origin Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Origine de la facture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['manual', 'user', 'appointment', 'quote'] as InvoiceOrigin[]).map((origin) => {
            const icons = {
              manual: FiFileText,
              user: FiUser,
              appointment: FiCalendar,
              quote: FiFileText,
            };
            const labels = {
              manual: 'Manuelle',
              user: 'Depuis un utilisateur',
              appointment: 'Depuis un rendez-vous',
              quote: 'Depuis un devis',
            };
            const Icon = icons[origin];

            return (
              <button
                key={origin}
                type="button"
                onClick={() => handleOriginChange(origin)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.origin === origin
                    ? 'border-[#1CCEFF] bg-[#1CCEFF] bg-opacity-10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#1CCEFF]'
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {labels[origin]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Source Selection */}
      {formData.origin !== 'manual' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Sélection de la source
          </h2>
          
          {formData.origin === 'user' && (
            <select
              value={formData.userId}
              onChange={(e) => handleUserSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">-- Sélectionner un utilisateur --</option>
              {users.map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          )}

          {formData.origin === 'appointment' && (
            <select
              value={formData.relatedAppointmentId || ''}
              onChange={(e) => handleAppointmentSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">-- Sélectionner un rendez-vous --</option>
              {appointments.map((apt) => (
                <option key={apt.appointmentId} value={apt.appointmentId}>
                  {apt.customerName} - {new Date(apt.dateTime.toMillis()).toLocaleDateString('fr-FR')} ({apt.serviceType})
                </option>
              ))}
            </select>
          )}

          {formData.origin === 'quote' && (
            <select
              value={formData.relatedQuoteId || ''}
              onChange={(e) => handleQuoteSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">-- Sélectionner un devis --</option>
              {quotes.filter((q) => !q.linkedInvoiceId).map((quote) => (
                <option key={quote.quoteId} value={quote.quoteId}>
                  {quote.quoteNumber} - {quote.customerName} ({quote.total.toFixed(2)} €)
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Customer Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Informations client
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.customerPhone || ''}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={formData.customerAddress || ''}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Articles
          </h2>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-[#1CCEFF] text-white rounded-lg hover:bg-[#17b4e0] transition-colors"
          >
            <FiPlus />
            Ajouter un article
          </button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={item.itemId} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Article {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.itemId)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <FiTrash2 />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.itemId, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.itemId, 'quantity', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix unitaire (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.itemId, 'unitPrice', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    TVA (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={item.taxRate}
                    onChange={(e) => updateItem(item.itemId, 'taxRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-2 text-right">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total TTC: <span className="font-semibold">{item.totalWithTax.toFixed(2)} €</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {formData.items.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Aucun article. Cliquez sur "Ajouter un article" pour commencer.
          </p>
        )}
      </div>

      {/* Totals */}
      {formData.items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Totaux
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sous-total HT:</span>
              <span className="font-medium text-gray-900 dark:text-white">{totals.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">TVA:</span>
              <span className="font-medium text-gray-900 dark:text-white">{totals.taxAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
              <span className="text-gray-900 dark:text-white">Total TTC:</span>
              <span className="text-[#1CCEFF]">{totals.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Informations complémentaires
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date d'échéance
            </label>
            <input
              type="date"
              value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1CCEFF] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Notes internes ou message pour le client..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading || formData.items.length === 0}
          className="px-6 py-2 bg-[#1CCEFF] text-white rounded-lg hover:bg-[#17b4e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
