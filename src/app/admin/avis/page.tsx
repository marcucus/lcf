'use client';

import { useState, useEffect } from 'react';
import { GoogleReview, ResponseTemplate } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { 
  getGoogleReviews, 
  replyToGoogleReview,
  getAllResponseTemplates,
  createResponseTemplate,
  updateResponseTemplate,
  deleteResponseTemplate
} from '@/lib/firestore/reviews';
import { 
  FiStar, 
  FiMessageSquare, 
  FiRefreshCw, 
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck
} from 'react-icons/fi';

type FilterType = 'all' | 'no-response' | '5-stars' | '4-stars' | '3-stars' | '2-stars' | '1-star';

function GoogleReviewsContent() {
  // Reviews state
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  
  // Templates state
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null);
  const [templateFormData, setTemplateFormData] = useState({ name: '', content: '' });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Auto-refresh interval (5 minutes)
  const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

  useEffect(() => {
    loadReviews();
    loadTemplates();
    
    // Set up auto-refresh
    const intervalId = setInterval(() => {
      refreshReviews();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    applyFilter();
  }, [reviews, filter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getGoogleReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshReviews = async () => {
    try {
      setRefreshing(true);
      const data = await getGoogleReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await getAllResponseTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const applyFilter = () => {
    let filtered = [...reviews];
    
    switch (filter) {
      case 'no-response':
        filtered = filtered.filter(r => !r.reviewReply);
        break;
      case '5-stars':
        filtered = filtered.filter(r => r.starRating === 5);
        break;
      case '4-stars':
        filtered = filtered.filter(r => r.starRating === 4);
        break;
      case '3-stars':
        filtered = filtered.filter(r => r.starRating === 3);
        break;
      case '2-stars':
        filtered = filtered.filter(r => r.starRating === 2);
        break;
      case '1-star':
        filtered = filtered.filter(r => r.starRating === 1);
        break;
    }
    
    setFilteredReviews(filtered);
  };

  const handleStartReply = (reviewId: string) => {
    setReplyingTo(reviewId);
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      alert('Veuillez entrer une réponse');
      return;
    }

    try {
      setSending(true);
      await replyToGoogleReview(reviewId, replyText);
      alert('Réponse envoyée avec succès !');
      setReplyingTo(null);
      setReplyText('');
      await refreshReviews();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Erreur lors de l\'envoi de la réponse. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  const handleUseTemplate = (template: ResponseTemplate) => {
    setReplyText(template.content);
    setShowTemplateModal(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateFormData.name.trim() || !templateFormData.content.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSavingTemplate(true);
      if (editingTemplate) {
        await updateResponseTemplate(editingTemplate.templateId, {
          name: templateFormData.name,
          content: templateFormData.content
        });
      } else {
        await createResponseTemplate({
          name: templateFormData.name,
          content: templateFormData.content
        });
      }
      await loadTemplates();
      setTemplateFormData({ name: '', content: '' });
      setEditingTemplate(null);
      setShowTemplateManager(false);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Erreur lors de la sauvegarde du modèle');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleEditTemplate = (template: ResponseTemplate) => {
    setEditingTemplate(template);
    setTemplateFormData({
      name: template.name,
      content: template.content
    });
    setShowTemplateManager(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      return;
    }

    try {
      await deleteResponseTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Erreur lors de la suppression du modèle');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Gestion des Avis Google
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Consultez et répondez aux avis de vos clients
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={refreshReviews}
              disabled={refreshing}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              Rafraîchir
            </Button>
            <Button
              onClick={() => setShowTemplateManager(true)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <FiMessageSquare />
              Gérer les modèles
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-600 dark:text-gray-400" />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              options={[
                { value: 'all', label: 'Tous les avis' },
                { value: 'no-response', label: 'Sans réponse' },
                { value: '5-stars', label: '5 étoiles' },
                { value: '4-stars', label: '4 étoiles' },
                { value: '3-stars', label: '3 étoiles' },
                { value: '2-stars', label: '2 étoiles' },
                { value: '1-star', label: '1 étoile' }
              ]}
            />
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Card className="p-12 text-center">
            <FiStar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Aucun avis trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'no-response'
                ? 'Tous les avis ont déjà reçu une réponse.'
                : 'Aucun avis ne correspond aux critères de filtrage.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.reviewId} className="p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.reviewer.profilePhotoUrl && (
                      <img
                        src={review.reviewer.profilePhotoUrl}
                        alt={review.reviewer.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {review.reviewer.displayName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(review.createTime)}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.starRating)}
                </div>

                {/* Review Comment */}
                {review.comment && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {review.comment}
                  </p>
                )}

                {/* Existing Reply */}
                {review.reviewReply && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-accent">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCheck className="text-accent" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Votre réponse
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(review.reviewReply.updateTime)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {review.reviewReply.comment}
                    </p>
                  </div>
                )}

                {/* Reply Form */}
                {!review.reviewReply && (
                  <div>
                    {replyingTo === review.reviewId ? (
                      <div className="space-y-3">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Rédigez votre réponse..."
                          rows={4}
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSendReply(review.reviewId)}
                            disabled={sending}
                            className="flex items-center gap-2"
                          >
                            {sending ? 'Envoi...' : 'Envoyer la réponse'}
                          </Button>
                          <Button
                            onClick={() => setShowTemplateModal(true)}
                            variant="secondary"
                          >
                            Utiliser un modèle
                          </Button>
                          <Button
                            onClick={handleCancelReply}
                            variant="secondary"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleStartReply(review.reviewId)}
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        <FiMessageSquare />
                        Répondre
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Choisir un modèle
                </h2>
                {templates.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Aucun modèle disponible. Créez-en un dans la gestion des modèles.
                  </p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {templates.map((template) => (
                      <div
                        key={template.templateId}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  onClick={() => setShowTemplateModal(false)}
                  variant="secondary"
                  className="w-full"
                >
                  Fermer
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Template Manager Modal */}
        {showTemplateManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Gestion des modèles de réponse
                </h2>

                {/* Template Form */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom du modèle
                      </label>
                      <input
                        type="text"
                        value={templateFormData.name}
                        onChange={(e) =>
                          setTemplateFormData({ ...templateFormData, name: e.target.value })
                        }
                        placeholder="Ex: Réponse positive"
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contenu
                      </label>
                      <Textarea
                        value={templateFormData.content}
                        onChange={(e) =>
                          setTemplateFormData({ ...templateFormData, content: e.target.value })
                        }
                        placeholder="Merci beaucoup pour votre commentaire..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveTemplate}
                        disabled={savingTemplate}
                        className="flex items-center gap-2"
                      >
                        <FiPlus />
                        {editingTemplate ? 'Mettre à jour' : 'Ajouter'}
                      </Button>
                      {editingTemplate && (
                        <Button
                          onClick={() => {
                            setEditingTemplate(null);
                            setTemplateFormData({ name: '', content: '' });
                          }}
                          variant="secondary"
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Templates List */}
                <div>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    Modèles existants
                  </h3>
                  {templates.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      Aucun modèle créé pour le moment
                    </p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {templates.map((template) => (
                        <div
                          key={template.templateId}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {template.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {template.content}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditTemplate(template)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.templateId)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    setShowTemplateManager(false);
                    setEditingTemplate(null);
                    setTemplateFormData({ name: '', content: '' });
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Fermer
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleReviewsPage() {
  return <GoogleReviewsContent />;
}
