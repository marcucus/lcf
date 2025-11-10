'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiAward, FiTrendingUp, FiGift, FiInfo, FiArrowLeft } from 'react-icons/fi';
import { getUserLoyaltyPoints, getLoyaltySettings } from '@/lib/firestore/loyalty';
import { LoyaltySettings } from '@/types';

function LoyaltyDashboardContent() {
  const { user } = useAuth();
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [points, loyaltySettings] = await Promise.all([
        getUserLoyaltyPoints(user.uid),
        getLoyaltySettings()
      ]);
      
      setLoyaltyPoints(points);
      setSettings(loyaltySettings);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-accent hover:underline mb-4">
            <FiArrowLeft className="mr-2" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Programme de Fidélité
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gagnez des points et bénéficiez de récompenses exclusives
          </p>
        </div>

        {/* Points Overview */}
        <Card className="mb-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/10 rounded-full mb-4">
              <FiAward className="w-10 h-10 text-purple-500" />
            </div>
            <h2 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vos points disponibles</h2>
            {loading ? (
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto"></div>
            ) : (
              <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {loyaltyPoints.toLocaleString()}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              points de fidélité
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/loyalty/history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Historique des points
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Consultez toutes vos transactions de points
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/loyalty/rewards">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <FiGift className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Catalogue de récompenses
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Découvrez et échangez vos points
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* How it works */}
        {settings && (
          <Card>
            <div className="flex items-start space-x-3 mb-4">
              <FiInfo className="w-5 h-5 text-accent mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Comment ça marche ?
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-500 font-bold mt-0.5">•</span>
                    <p>
                      Gagnez <strong className="text-gray-900 dark:text-white">{settings.pointsPerAppointment} points</strong> à chaque rendez-vous complété
                    </p>
                  </div>
                  {settings.welcomeBonusPoints && settings.welcomeBonusPoints > 0 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-purple-500 font-bold mt-0.5">•</span>
                      <p>
                        Recevez <strong className="text-gray-900 dark:text-white">{settings.welcomeBonusPoints} points de bienvenue</strong> lors de votre inscription
                      </p>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-500 font-bold mt-0.5">•</span>
                    <p>
                      Échangez vos points contre des récompenses (minimum <strong className="text-gray-900 dark:text-white">{settings.minPointsForRedemption} points</strong>)
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-500 font-bold mt-0.5">•</span>
                    <p>
                      Vos points n&apos;expirent jamais, profitez-en quand vous voulez !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function LoyaltyDashboardPage() {
  return (
    <ProtectedRoute>
      <LoyaltyDashboardContent />
    </ProtectedRoute>
  );
}
