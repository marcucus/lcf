'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Quote, QuoteStatus } from '@/types';
import {
  getAllQuotes,
  deleteQuote,
  markQuoteAsSent,
} from '@/lib/firestore/quotes';
import { downloadQuotePDF } from '@/lib/pdf/generator';
import { FiPlus, FiEdit, FiTrash2, FiMail, FiDownload, FiFilter, FiEye } from 'react-icons/fi';
import { QuoteForm } from '@/components/admin/QuoteForm';
import { QuoteDetails } from '@/components/admin/QuoteDetails';

function QuotesManagementPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>();
  const [viewingQuote, setViewingQuote] = useState<Quote | undefined>();
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [quotes, filter]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllQuotes();
      setQuotes(data);
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...quotes];
    
    if (filter !== 'all') {
      filtered = filtered.filter((q) => q.status === filter);
    }
    
    setFilteredQuotes(filtered);
  };

  const handleAddNew = () => {
    setEditingQuote(undefined);
    setShowForm(true);
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setShowForm(true);
  };

  const handleView = (quote: Quote) => {
    setViewingQuote(quote);
  };

  const handleCancel = () => {
    setEditingQuote(undefined);
    setShowForm(false);
  };

  const handleDelete = async (quoteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return;
    
    try {
      await deleteQuote(quoteId);
      await loadQuotes();
    } catch (err) {
      console.error('Error deleting quote:', err);
      setError('Erreur lors de la suppression du devis');
    }
  };

  const handleDownloadPDF = (quote: Quote) => {
    try {
      downloadQuotePDF(quote);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Erreur lors du téléchargement du PDF');
    }
  };

  const handleSendEmail = async (quote: Quote) => {
    try {
      setSendingEmail(quote.quoteId);
      setError(null);
      
      // Call the API endpoint to send email
      const response = await fetch('/api/send-quote-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteId: quote.quoteId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Mark as sent
      await markQuoteAsSent(quote.quoteId);
      await loadQuotes();
      
      alert('Email envoyé avec succès !');
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(null);
    }
  };

  const getStatusBadge = (status: QuoteStatus) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    
    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Rejeté',
      expired: 'Expiré',
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
        <QuoteForm
          quote={editingQuote}
          onCancel={handleCancel}
          onSuccess={() => {
            setShowForm(false);
            loadQuotes();
          }}
        />
      </ProtectedRoute>
    );
  }

  if (viewingQuote) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'agendaManager']}>
        <QuoteDetails
          quote={viewingQuote}
          onClose={() => setViewingQuote(undefined)}
          onEdit={() => {
            handleEdit(viewingQuote);
            setViewingQuote(undefined);
          }}
          onDownloadPDF={handleDownloadPDF}
          onSendEmail={handleSendEmail}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'agendaManager']}>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Gestion des Devis
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Créer et gérer les devis pour vos clients
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
            Nouveau Devis
          </Button>

          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as QuoteStatus | 'all')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">Tous</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyés</option>
              <option value="accepted">Acceptés</option>
              <option value="rejected">Rejetés</option>
              <option value="expired">Expirés</option>
            </select>
          </div>
        </div>

        {/* Quotes List */}
        {loading ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          </Card>
        ) : filteredQuotes.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Aucun devis trouvé
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <Card key={quote.quoteId}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {quote.quoteNumber}
                      </h3>
                      {getStatusBadge(quote.status)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Client: {quote.customerName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Email: {quote.customerEmail}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Montant: <span className="font-semibold">{quote.total.toFixed(2)} €</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Créé le {new Date(quote.createdAt.toDate()).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleView(quote)}
                      variant="secondary"
                      size="sm"
                     
                    >
                      Voir
                    </Button>
                    <Button
                      onClick={() => handleEdit(quote)}
                      variant="secondary"
                      size="sm"
                     
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDownloadPDF(quote)}
                      variant="secondary"
                      size="sm"
                     
                    >
                      PDF
                    </Button>
                    <Button
                      onClick={() => handleSendEmail(quote)}
                      variant="primary"
                      size="sm"
                     
                      disabled={sendingEmail === quote.quoteId}
                    >
                      {sendingEmail === quote.quoteId ? 'Envoi...' : 'Envoyer'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(quote.quoteId)}
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

export default QuotesManagementPage;
