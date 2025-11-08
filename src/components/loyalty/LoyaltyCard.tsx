'use client';

import { Card } from '@/components/ui/Card';
import { FiAward, FiTrendingUp, FiGift } from 'react-icons/fi';
import Link from 'next/link';

interface LoyaltyCardProps {
  points: number;
  loading?: boolean;
}

export function LoyaltyCard({ points, loading }: LoyaltyCardProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <FiAward className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Points de fidélité</p>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {points.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Link 
            href="/dashboard/loyalty"
            className="text-purple-500 hover:text-purple-600 transition-colors text-sm font-medium"
          >
            Voir détails →
          </Link>
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/loyalty/history">
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <FiTrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Historique</span>
              </div>
            </Link>
            <Link href="/dashboard/loyalty/rewards">
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <FiGift className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Récompenses</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
