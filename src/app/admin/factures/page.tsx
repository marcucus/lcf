'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Invoice, InvoiceStatus } from '@/types';
import {
  getAllInvoices,
  deleteInvoice,
  markInvoiceAsSent,
  markInvoiceAsPaid,
} from '@/lib/firestore/invoices';
import { downloadInvoicePDF } from '@/lib/pdf/generator';
import { FiPlus, FiEdit, FiTrash2, FiMail, FiDownload, FiFilter, FiEye, FiCheck } from 'react-icons/fi';
import { InvoiceForm } from '@/components/admin/InvoiceForm';
import { InvoiceDetails } from '@/components/admin/InvoiceDetails';

function InvoicesManagementPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | undefined>();
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await getAllInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      return;
    }

    try {
      await deleteInvoice(invoiceId);
      await loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Erreur lors de la suppression de la facture');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true;
    return invoice.status === filter;
  });

  const totalRevenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalTTC, 0);

  if (loading || isLoading) {
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Factures</h1>
        <Button onClick={() => router.push('/admin/factures/nouvelle')}>
          Nouvelle Facture
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Factures</h3>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Payées</h3>
          <p className="text-2xl font-bold text-green-600">
            {invoices.filter(inv => inv.status === 'paid').length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">En Attente</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {invoices.filter(inv => inv.status === 'pending').length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Chiffre d'Affaires</h3>
          <p className="text-2xl font-bold text-[#1CCEFF]">
            {totalRevenue.toFixed(2)} €
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            Toutes
          </Button>
          <Button
            variant={filter === 'paid' ? 'primary' : 'secondary'}
            onClick={() => setFilter('paid')}
          >
            Payées
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'secondary'}
            onClick={() => setFilter('pending')}
          >
            En Attente
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'primary' : 'secondary'}
            onClick={() => setFilter('cancelled')}
          >
            Annulées
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Facture
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.invoiceId}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {invoice.issueDate.toDate().toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {invoice.customerName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {invoice.totalTTC.toFixed(2)} €
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Annulée'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/admin/factures/${invoice.invoiceId}`)}
                      >
                        Voir
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(invoice.invoiceId)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune facture trouvée
          </div>
        )}
      </Card>
    </div>
  );
}
  useEffect(() => {
    applyFilter();
  }, [invoices, filter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllInvoices();
      setInvoices(data);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...invoices];
    
    if (filter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === filter);
    }
    
    setFilteredInvoices(filtered);
  };

  const handleAddNew = () => {
    setEditingInvoice(undefined);
    setShowForm(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
  };

  const handleCancel = () => {
    setEditingInvoice(undefined);
    setShowForm(false);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;
    
    try {
      await deleteInvoice(invoiceId);
      await loadInvoices();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Erreur lors de la suppression de la facture');
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      await markInvoiceAsPaid(invoiceId);
      await loadInvoices();
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      setError('Erreur lors du marquage de la facture comme payée');
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    try {
      downloadInvoicePDF(invoice);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Erreur lors du téléchargement du PDF');
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      setSendingEmail(invoice.invoiceId);
      setError(null);
      
      // Call the API endpoint to send email
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: invoice.invoiceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Mark as sent
      await markInvoiceAsSent(invoice.invoiceId);
      await loadInvoices();
      
      alert('Email envoyé avec succès !');
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(null);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    
    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (showForm) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'agendaManager']}>
        <InvoiceForm
          invoice={editingInvoice}
          onCancel={handleCancel}
          onSuccess={() => {
            setShowForm(false);
            loadInvoices();
          }}
        />
      </ProtectedRoute>
    );
  }

  if (viewingInvoice) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'agendaManager']}>
        <InvoiceDetails
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(undefined)}
          onEdit={() => {
            handleEdit(viewingInvoice);
            setViewingInvoice(undefined);
          }}
          onDownloadPDF={handleDownloadPDF}
          onSendEmail={handleSendEmail}
          onMarkAsPaid={() => {
            handleMarkAsPaid(viewingInvoice.invoiceId);
            setViewingInvoice(undefined);
          }}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'agendaManager']}>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Gestion des Factures
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Créer et gérer les factures pour vos clients
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Actions and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <Button onClick={handleAddNew}>
            Nouvelle Facture
          </Button>

          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as InvoiceStatus | 'all')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">Toutes</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyées</option>
              <option value="paid">Payées</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>

        {/* Invoices List */}
        {loading ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          </Card>
        ) : filteredInvoices.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Aucune facture trouvée
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.invoiceId}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </h3>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Client: {invoice.customerName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Email: {invoice.customerEmail}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Montant: <span className="font-semibold">{invoice.total.toFixed(2)} €</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Créée le {new Date(invoice.createdAt.toDate()).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleView(invoice)}
                      variant="secondary"
                      size="sm"
                     
                    >
                      Voir
                    </Button>
                    <Button
                      onClick={() => handleEdit(invoice)}
                      variant="secondary"
                      size="sm"
                     
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDownloadPDF(invoice)}
                      variant="secondary"
                      size="sm"
                     
                    >
                      PDF
                    </Button>
                    <Button
                      onClick={() => handleSendEmail(invoice)}
                      variant="primary"
                      size="sm"
                     
                      disabled={sendingEmail === invoice.invoiceId}
                    >
                      {sendingEmail === invoice.invoiceId ? 'Envoi...' : 'Envoyer'}
                    </Button>
                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                      <Button
                        onClick={() => handleMarkAsPaid(invoice.invoiceId)}
                        variant="secondary"
                        size="sm"
                       
                        className="text-green-600 hover:text-green-700"
                      >
                        Marquer payée
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(invoice.invoiceId)}
                      variant="secondary"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default InvoicesManagementPage;
