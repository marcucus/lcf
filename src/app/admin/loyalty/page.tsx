'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiGift, FiSettings, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { getAllRewards, getLoyaltySettings } from '@/lib/firestore/loyalty';
import { Reward, LoyaltySettings } from '@/types';

function AdminLoyaltyContent() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rewardsData, loyaltySettings] = await Promise.all([
        getAllRewards(),
        getLoyaltySettings()
      ]);
      
      setRewards(rewardsData);
      setSettings(loyaltySettings);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeRewards = rewards.filter(r => r.isActive);
  const inactiveRewards = rewards.filter(r => !r.isActive);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Gestion du Programme de Fidélité
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez les récompenses, paramètres et points des clients
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <FiGift className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeRewards.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Récompenses actives
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <FiGift className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {rewards.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total récompenses
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <FiTrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {settings?.pointsPerAppointment || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Points par RDV
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FiUsers className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {settings?.minPointsForRedemption || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Points minimum
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/loyalty/rewards">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <FiGift className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Gérer les récompenses
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Créer, modifier ou supprimer des récompenses
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/loyalty/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FiSettings className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Paramètres du programme
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configurer les règles et bonus
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/loyalty/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <FiUsers className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Gérer les points clients
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ajuster les points des utilisateurs
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Current Settings Overview */}
        {settings && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Paramètres actuels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Points par rendez-vous</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {settings.pointsPerAppointment}
                </p>
              </div>
              
              {settings.welcomeBonusPoints !== undefined && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Bonus de bienvenue</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {settings.welcomeBonusPoints}
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Points minimum pour échanger</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {settings.minPointsForRedemption}
                </p>
              </div>
              
              {settings.pointsPerEuroSpent !== undefined && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Points par euro dépensé</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {settings.pointsPerEuroSpent}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminLoyaltyPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLoyaltyContent />
    </ProtectedRoute>
  );
}
