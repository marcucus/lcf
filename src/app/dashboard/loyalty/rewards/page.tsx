'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiGift, FiCheck, FiX } from 'react-icons/fi';
import { getActiveRewards, getUserLoyaltyPoints, claimReward, getUserRewards } from '@/lib/firestore/loyalty';
import { Reward, UserReward } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function RewardsContent() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'claimed'>('available');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [rewardsData, points, userRewardsData] = await Promise.all([
        getActiveRewards(),
        getUserLoyaltyPoints(user.uid),
        getUserRewards(user.uid)
      ]);
      
      setRewards(rewardsData);
      setLoyaltyPoints(points);
      setUserRewards(userRewardsData);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (rewardId: string, pointsCost: number) => {
    if (!user) return;
    
    if (loyaltyPoints < pointsCost) {
      alert('Vous n\'avez pas assez de points pour cette récompense.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir échanger vos points contre cette récompense ?')) {
      return;
    }

    setClaiming(rewardId);
    
    try {
      await claimReward(user.uid, rewardId);
      alert('Récompense réclamée avec succès ! Vous la retrouverez dans l\'onglet "Mes récompenses".');
      await loadData();
      setActiveTab('claimed');
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      alert(error.message || 'Erreur lors de la réclamation de la récompense');
    } finally {
      setClaiming(null);
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

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      discount: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      service: 'bg-green-500/10 text-green-600 dark:text-green-400',
      product: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      special: 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
    };
    return colors[category] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  const availableUserRewards = userRewards.filter(r => r.status === 'available');
  const usedUserRewards = userRewards.filter(r => r.status === 'used' || r.status === 'expired');

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Link href="/dashboard/loyalty" className="inline-flex items-center text-accent hover:underline mb-4">
            <FiArrowLeft className="mr-2" />
            Retour au programme de fidélité
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                Récompenses
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Échangez vos points contre des récompenses exclusives
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Vos points</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {loyaltyPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'available'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Catalogue ({rewards.length})
          </button>
          <button
            onClick={() => setActiveTab('claimed')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'claimed'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Mes récompenses ({availableUserRewards.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : activeTab === 'available' ? (
          // Available Rewards
          rewards.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <FiGift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Aucune récompense disponible pour le moment
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => {
                const canAfford = loyaltyPoints >= reward.pointsCost;
                const isOutOfStock = reward.stock !== undefined && reward.stock <= 0;
                
                return (
                  <Card key={reward.rewardId} className="flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(reward.category)}`}>
                          {getCategoryLabel(reward.category)}
                        </span>
                        {isOutOfStock && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                            Épuisé
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {reward.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {reward.description}
                      </p>
                      
                      {reward.validUntil && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mb-4">
                          Valide jusqu&apos;au {format(reward.validUntil.toDate(), 'PP', { locale: fr })}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {reward.pointsCost}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
                        </div>
                        
                        <Button
                          onClick={() => handleClaimReward(reward.rewardId, reward.pointsCost)}
                          disabled={!canAfford || isOutOfStock || claiming === reward.rewardId}
                          size="sm"
                        >
                          {claiming === reward.rewardId ? (
                            'Réclamation...'
                          ) : isOutOfStock ? (
                            'Épuisé'
                          ) : !canAfford ? (
                            'Points insuffisants'
                          ) : (
                            'Réclamer'
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          // User's Claimed Rewards
          availableUserRewards.length === 0 && usedUserRewards.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <FiGift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Vous n&apos;avez encore réclamé aucune récompense
                </p>
                <Button onClick={() => setActiveTab('available')}>
                  Parcourir le catalogue
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {availableUserRewards.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Récompenses disponibles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableUserRewards.map((userReward) => (
                      <Card key={userReward.userRewardId}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <FiCheck className="w-5 h-5 text-green-500" />
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                {userReward.rewardName}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Réclamée le {format(userReward.claimedAt.toDate(), 'PP', { locale: fr })}
                            </p>
                            {userReward.expiresAt && (
                              <p className="text-xs text-orange-600 dark:text-orange-400">
                                Expire le {format(userReward.expiresAt.toDate(), 'PP', { locale: fr })}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {userReward.pointsSpent} pts
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {usedUserRewards.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Récompenses utilisées
                  </h2>
                  <div className="space-y-2">
                    {usedUserRewards.map((userReward) => (
                      <Card key={userReward.userRewardId}>
                        <div className="flex items-start justify-between opacity-60">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <FiX className="w-4 h-4 text-gray-500" />
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {userReward.rewardName}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {userReward.status === 'used' ? 'Utilisée' : 'Expirée'} le{' '}
                              {userReward.usedAt && format(userReward.usedAt.toDate(), 'PP', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function RewardsPage() {
  return (
    <ProtectedRoute>
      <RewardsContent />
    </ProtectedRoute>
  );
}
