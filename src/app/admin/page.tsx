'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { KPICard } from '@/components/ui/KPICard';
import { Card } from '@/components/ui/Card';
import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiTruck, FiStar } from 'react-icons/fi';
import { getTodayAppointments, getWeekAppointments } from '@/lib/firestore/appointments';
import { getVehiclesForSaleCount } from '@/lib/firestore/vehicles';
import { Appointment } from '@/types';

function AdminDashboardContent() {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [weekAppointments, setWeekAppointments] = useState<Appointment[]>([]);
  const [vehiclesCount, setVehiclesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [today, week, vehicles] = await Promise.all([
        getTodayAppointments(),
        getWeekAppointments(),
        getVehiclesForSaleCount(),
      ]);
      
      setTodayAppointments(today);
      setWeekAppointments(week);
      setVehiclesCount(vehicles);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceLabel = (serviceType: string) => {
    const labels: Record<string, string> = {
      entretien: 'Entretien',
      reparation: 'Réparation',
      reprogrammation: 'Re-programmation',
    };
    return labels[serviceType] || serviceType;
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Tableau de Bord Administratif
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Vue d&apos;ensemble de l&apos;activité du garage
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Rendez-vous aujourd'hui"
            value={todayAppointments.length}
            icon={<FiCalendar />}
            iconColor="text-accent"
            loading={loading}
          />
          
          <KPICard
            title="Rendez-vous cette semaine"
            value={weekAppointments.length}
            icon={<FiClock />}
            iconColor="text-blue-500"
            loading={loading}
          />
          
          <KPICard
            title="Véhicules en vente"
            value={vehiclesCount}
            icon={<FiTruck />}
            iconColor="text-green-500"
            loading={loading}
          />
          
          <KPICard
            title="Avis Google"
            value="N/A"
            icon={<FiStar />}
            iconColor="text-yellow-500"
            subtitle="Intégration à venir"
            loading={false}
          />
        </div>

        {/* Today's Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Rendez-vous du Jour
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => {
                  const dateTime = appointment.dateTime.toDate();
                  
                  return (
                    <div
                      key={appointment.appointmentId}
                      className="p-4 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-semibold rounded">
                              {getServiceLabel(appointment.serviceType)}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {dateTime.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {appointment.customerName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                          </p>
                          {appointment.customerNotes && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              Note: {appointment.customerNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <p>Aucun rendez-vous prévu aujourd&apos;hui</p>
              </div>
            )}
          </Card>

          {/* Weekly Overview */}
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Aperçu de la Semaine
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-accent/10 to-blue-500/10 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total rendez-vous
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {weekAppointments.length}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Entretien
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {weekAppointments.filter((a) => a.serviceType === 'entretien').length}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Réparation
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {weekAppointments.filter((a) => a.serviceType === 'reparation').length}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Reprog.
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {weekAppointments.filter((a) => a.serviceType === 'reprogrammation').length}
                    </p>
                  </div>
                </div>

                {weekAppointments.length === 0 && (
                  <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                    <p>Aucun rendez-vous cette semaine</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Google Reviews Placeholder */}
        <Card>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Derniers Avis Google
          </h2>
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <FiStar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="mb-2">Intégration des avis Google à venir</p>
            <p className="text-sm">
              Cette section affichera les derniers avis clients et permettra d&apos;y répondre
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'agendaManager']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
