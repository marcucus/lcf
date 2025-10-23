'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { FiCalendar, FiClock, FiSettings } from 'react-icons/fi';

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Bienvenue, {user?.firstName || user?.email} !
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez vos rendez-vous et vos informations personnelles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <FiCalendar className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rendez-vous à venir</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FiClock className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rendez-vous passés</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <FiSettings className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Profil</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === 'admin' ? 'Administrateur' : user?.role === 'agendaManager' ? 'Gestionnaire' : 'Utilisateur'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Prochains rendez-vous
            </h2>
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <p>Aucun rendez-vous à venir</p>
              <Link href="/rendez-vous" className="text-accent hover:underline mt-2 inline-block">
                Prendre un rendez-vous
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Accès rapide
            </h2>
            <div className="space-y-3">
              <Link href="/rendez-vous" className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <p className="font-medium text-gray-900 dark:text-white">📅 Prendre rendez-vous</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Réserver un créneau</p>
              </Link>
              <Link href="/vehicules" className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <p className="font-medium text-gray-900 dark:text-white">🚗 Véhicules d&apos;occasion</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Voir le catalogue</p>
              </Link>
              <Link href="/contact" className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <p className="font-medium text-gray-900 dark:text-white">📞 Contact</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nous contacter</p>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
