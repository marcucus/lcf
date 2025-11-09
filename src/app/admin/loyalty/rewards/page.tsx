'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { getAllRewards, createReward, updateReward } from '@/lib/firestore/loyalty';
import { Reward, RewardCategory } from '@/types';

function AdminRewardsContent() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'discount' as RewardCategory,
    pointsCost: 100,
    stock: undefined as number | undefined,
    isActive: true
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await getAllRewards();
      setRewards(data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (reward?: Reward) => {
    if (reward) {
      setEditingReward(reward);
      setFormData({
        name: reward.name,
        description: reward.description,
        category: reward.category,
        pointsCost: reward.pointsCost,
        stock: reward.stock,
        isActive: reward.isActive
      });
    } else {
      setEditingReward(null);
      setFormData({
        name: '',
        description: '',
        category: 'discount',
        pointsCost: 100,
        stock: undefined,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReward(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingReward) {
        await updateReward(editingReward.rewardId, formData);
        alert('Récompense mise à jour avec succès');
      } else {
        await createReward(formData);
        alert('Récompense créée avec succès');
      }
      
      await loadRewards();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving reward:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (reward: Reward) => {
    try {
      await updateReward(reward.rewardId, { isActive: !reward.isActive });
      await loadRewards();
    } catch (error) {
      console.error('Error toggling reward:', error);
      alert('Erreur lors de la modification');
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      discount: 'Réduction',
      service: 'Service',
      product: 'Produit',
      special: 'Spécial'
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Link href="/admin/loyalty" className="inline-flex items-center text-accent hover:underline mb-4">
            <FiArrowLeft className="mr-2" />
            Retour à la gestion fidélité
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                Gestion des récompenses
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Créer et gérer les récompenses disponibles
              </p>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <FiPlus className="mr-2" />
              Nouvelle récompense
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : rewards.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Aucune récompense créée
              </p>
              <Button onClick={() => handleOpenModal()}>
                Créer la première récompense
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.rewardId}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs font-semibold">
                          {getCategoryLabel(reward.category)}
                        </span>
                        {!reward.isActive && (
                          <span className="px-2 py-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 rounded text-xs font-semibold">
                            Inactif
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {reward.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {reward.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {reward.pointsCost}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
                      </div>
                      {reward.stock !== undefined && (
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {reward.stock}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">en stock</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenModal(reward)}
                        className="flex-1"
                      >
                        <FiEdit className="mr-2" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleActive(reward)}
                        className="px-3"
                      >
                        {reward.isActive ? (
                          <FiToggleRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <FiToggleLeft className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingReward ? 'Modifier la récompense' : 'Nouvelle récompense'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de la récompense *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: 10% de réduction"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez la récompense..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie *
                    </label>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as RewardCategory })}
                      required
                      options={[
                        { value: 'discount', label: 'Réduction' },
                        { value: 'service', label: 'Service' },
                        { value: 'product', label: 'Produit' },
                        { value: 'special', label: 'Spécial' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Coût en points *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.pointsCost}
                      onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock disponible (optionnel)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stock: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Laisser vide pour stock illimité"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Récompense active
                  </label>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? 'Sauvegarde...' : (editingReward ? 'Mettre à jour' : 'Créer')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminRewardsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminRewardsContent />
    </ProtectedRoute>
  );
}
