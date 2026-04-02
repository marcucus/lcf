'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { FiCalendar, FiStar, FiTruck, FiUsers, FiFileText, FiDollarSign } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Tableau de bord administratif
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Bienvenue, {user?.firstName || user?.email}
        </p>
      </div>

      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <FiCalendar className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                RDV aujourd&apos;hui
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FiCalendar className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                RDV cette semaine
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <FiStar className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Derniers avis
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <FiTruck className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Véhicules en vente
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Accès rapide
          </h2>
          <div className="space-y-3">
            <a
              href="/admin/calendrier"
              className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-accent flex-shrink-0" /> Calendrier global
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gérer tous les rendez-vous
              </p>
            </a>
            
            {user?.role === 'admin' && (
              <>
                <a
                  href="/admin/chiffre-affaires"
                  className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4 text-accent flex-shrink-0" /> Chiffre d&apos;affaires
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Suivi des revenus et déclaration fiscale
                  </p>
                </a>
                
                <a
                  href="/admin/utilisateurs"
                  className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-accent flex-shrink-0" /> Utilisateurs
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérer les comptes utilisateurs
                  </p>
                </a>
                
                <a
                  href="/admin/vehicules"
                  className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FiTruck className="w-4 h-4 text-accent flex-shrink-0" /> Parc de véhicules
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérer le catalogue
                  </p>
                </a>
                
                <a
                  href="/admin/avis"
                  className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FiStar className="w-4 h-4 text-accent flex-shrink-0" /> Avis Google
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérer les avis clients
                  </p>
                </a>
                
                <a
                  href="/admin/factures"
                  className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-accent flex-shrink-0" /> Factures
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérer les factures et devis
                  </p>
                </a>
              </>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Activité récente
          </h2>
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>Aucune activité récente</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'agendaManager']}>
      <AdminPage />
    </ProtectedRoute>
  );
}