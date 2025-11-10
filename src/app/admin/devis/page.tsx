'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { QuotationCard } from '@/components/admin/QuotationCard';
import { QuotationForm, QuotationFormData } from '@/components/admin/QuotationForm';
import { Quotation, User, Appointment, QuotationStatus } from '@/types';
import {
  getAllQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  updateQuotationStatus,
} from '@/lib/firestore/quotations';
import { getAllUsers } from '@/lib/firestore/users';
import { getAllAppointments } from '@/lib/firestore/appointments';
import { FiPlus, FiFilter, FiMail, FiAlertCircle } from 'react-icons/fi';

function QuotationsManagementPage() {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>();
  const [filter, setFilter] = useState<QuotationStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [quotations, filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [quotationsData, usersData, appointmentsData] = await Promise.all([
        getAllQuotations(),
        getAllUsers(),
        getAllAppointments(),
      ]);
      setQuotations(quotationsData);
      setUsers(usersData.users);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredQuotations(quotations);
    } else {
      setFilteredQuotations(quotations.filter((q) => q.status === filter));
    }
  };

  const handleCreateQuotation = async (data: QuotationFormData) => {
    if (!user) return;

    try {
      setError(null);
      await createQuotation(
        user.uid,
        data.clientName,
        data.clientEmail,
        data.items,
        {
          userId: data.userId,
          appointmentId: data.appointmentId,
          clientPhone: data.clientPhone,
          clientAddress: data.clientAddress,
          notes: data.notes,
          internalNotes: data.internalNotes,
          validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
          status: data.status,
        }
      );
      setSuccessMessage('Devis créé avec succès');
      setShowForm(false);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error creating quotation:', err);
      setError('Erreur lors de la création du devis');
    }
  };

  const handleUpdateQuotation = async (data: QuotationFormData) => {
    if (!editingQuotation) return;

    try {
      setError(null);
      await updateQuotation(editingQuotation.quotationId, {
        userId: data.userId,
        appointmentId: data.appointmentId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        items: data.items,
        notes: data.notes,
        internalNotes: data.internalNotes,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() as any : undefined,
        status: data.status,
      });
      setSuccessMessage('Devis mis à jour avec succès');
      setShowForm(false);
      setEditingQuotation(undefined);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating quotation:', err);
      setError('Erreur lors de la mise à jour du devis');
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      return;
    }

    try {
      setError(null);
      await deleteQuotation(quotationId);
      setSuccessMessage('Devis supprimé avec succès');
      await loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting quotation:', err);
      setError('Erreur lors de la suppression du devis');
    }
  };

  const handleSendEmail = async (quotation: Quotation) => {
    // Placeholder for email sending functionality
    // This will be implemented with Cloud Functions
    try {
      setError(null);
      // TODO: Call Cloud Function to send email
      await updateQuotationStatus(quotation.quotationId, 'sent');
      setSuccessMessage(
        'Devis marqué comme envoyé. La fonctionnalité d\'envoi d\'email sera implémentée via Cloud Functions.'
      );
      await loadData();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Erreur lors de l\'envoi du devis');
    }
  };

  const handleConvertToInvoice = (quotation: Quotation) => {
    // Placeholder for invoice conversion
    // This will be implemented when the invoice module is created
    alert(
      'La fonctionnalité de conversion en facture sera disponible une fois le module facture implémenté.'
    );
  };

  const handleEdit = (quotation: Quotation) => {
    const formData: QuotationFormData = {
      clientName: quotation.clientName,
      clientEmail: quotation.clientEmail,
      clientPhone: quotation.clientPhone || '',
      clientAddress: quotation.clientAddress || '',
      userId: quotation.userId,
      appointmentId: quotation.appointmentId,
      items: quotation.items,
      notes: quotation.notes || '',
      internalNotes: quotation.internalNotes || '',
      validUntil: quotation.validUntil
        ? new Date(quotation.validUntil.seconds * 1000).toISOString().split('T')[0]
        : '',
      status: quotation.status,
    };
    setEditingQuotation(quotation);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingQuotation(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des devis...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-6 md:p-8">
        <Card>
          <QuotationForm
            onSubmit={editingQuotation ? handleUpdateQuotation : handleCreateQuotation}
            onCancel={handleCancelForm}
            initialData={
              editingQuotation
                ? {
                    clientName: editingQuotation.clientName,
                    clientEmail: editingQuotation.clientEmail,
                    clientPhone: editingQuotation.clientPhone || '',
                    clientAddress: editingQuotation.clientAddress || '',
                    userId: editingQuotation.userId,
                    appointmentId: editingQuotation.appointmentId,
                    items: editingQuotation.items,
                    notes: editingQuotation.notes || '',
                    internalNotes: editingQuotation.internalNotes || '',
                    validUntil: editingQuotation.validUntil
                      ? new Date(editingQuotation.validUntil.seconds * 1000)
                          .toISOString()
                          .split('T')[0]
                      : '',
                    status: editingQuotation.status,
                  }
                : undefined
            }
            users={users}
            appointments={appointments}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Gestion des devis
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Créez, modifiez et gérez les devis clients
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium">Erreur</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 dark:text-green-200 font-medium">Succès</p>
            <p className="text-green-700 dark:text-green-300 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <FiFilter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as QuotationStatus | 'all')}
            className="min-w-[200px]"
          >
            <option value="all">Tous les devis ({quotations.length})</option>
            <option value="draft">
              Brouillons ({quotations.filter((q) => q.status === 'draft').length})
            </option>
            <option value="sent">
              Envoyés ({quotations.filter((q) => q.status === 'sent').length})
            </option>
            <option value="accepted">
              Acceptés ({quotations.filter((q) => q.status === 'accepted').length})
            </option>
            <option value="rejected">
              Refusés ({quotations.filter((q) => q.status === 'rejected').length})
            </option>
            <option value="expired">
              Expirés ({quotations.filter((q) => q.status === 'expired').length})
            </option>
            <option value="converted">
              Convertis ({quotations.filter((q) => q.status === 'converted').length})
            </option>
          </Select>
        </div>

        <Button onClick={() => setShowForm(true)}>
          <FiPlus className="w-5 h-5 mr-2" />
          Nouveau devis
        </Button>
      </div>

      {/* Quotations Grid */}
      {filteredQuotations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiMail className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun devis trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all'
                ? 'Commencez par créer votre premier devis'
                : 'Aucun devis ne correspond au filtre sélectionné'}
            </p>
            {filter === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <FiPlus className="w-5 h-5 mr-2" />
                Créer un devis
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuotations.map((quotation) => (
            <QuotationCard
              key={quotation.quotationId}
              quotation={quotation}
              onEdit={handleEdit}
              onDelete={handleDeleteQuotation}
              onSendEmail={handleSendEmail}
              onConvertToInvoice={handleConvertToInvoice}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <QuotationsManagementPage />
    </ProtectedRoute>
  );
}
