'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { getUserLoyaltyTransactions } from '@/lib/firestore/loyalty';
import { LoyaltyTransaction } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function LoyaltyHistoryContent() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      const data = await getUserLoyaltyTransactions(user.uid);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      appointment_completed: 'Rendez-vous complété',
      manual_adjustment: 'Ajustement manuel',
      reward_redemption: 'Récompense échangée',
      bonus: 'Bonus'
    };
    return labels[type] || type;
  };

  const getTransactionIcon = (points: number) => {
    if (points > 0) {
      return <FiArrowUp className="w-5 h-5 text-green-500" />;
    }
    return <FiArrowDown className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/dashboard/loyalty" className="inline-flex items-center text-accent hover:underline mb-4">
            <FiArrowLeft className="mr-2" />
            Retour au programme de fidélité
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Historique des points
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Consultez toutes vos transactions de points de fidélité
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Aucune transaction pour le moment
              </p>
              <Link href="/rendez-vous">
                <span className="text-accent hover:underline">
                  Prenez votre premier rendez-vous pour gagner des points !
                </span>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.transactionId}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {getTransactionIcon(transaction.points)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {getTransactionTypeLabel(transaction.type)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {format(transaction.createdAt.toDate(), 'PPP à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold ${
                      transaction.points > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">points</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoyaltyHistoryPage() {
  return (
    <ProtectedRoute>
      <LoyaltyHistoryContent />
    </ProtectedRoute>
  );
}
