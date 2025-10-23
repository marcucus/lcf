'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiSettings, FiX, FiEdit } from 'react-icons/fi';
import { Appointment } from '@/types';
import { getUserAppointments, cancelAppointment, canModifyAppointment } from '@/lib/firestore/appointments';

function DashboardContent() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    
    try {
      const data = await getUserAppointments(user.uid);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string, dateTime: any) => {
    const appointmentDate = dateTime.toDate();
    
    if (!canModifyAppointment(appointmentDate)) {
      alert('Vous ne pouvez pas annuler un rendez-vous moins de 24h avant. Veuillez nous contacter directement.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      await cancelAppointment(appointmentId);
      await loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Erreur lors de l\'annulation du rendez-vous');
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'confirmed' && apt.dateTime.toDate() > new Date()
  );

  const pastAppointments = appointments.filter(
    (apt) => apt.dateTime.toDate() < new Date() || apt.status !== 'confirmed'
  );

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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {upcomingAppointments.length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pastAppointments.length}
                </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Prochains rendez-vous
              </h2>
              <Link href="/rendez-vous">
                <Button size="sm">Nouveau RDV</Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => {
                  const dateTime = appointment.dateTime.toDate();
                  const canModify = canModifyAppointment(dateTime);
                  
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
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {dateTime.toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {dateTime.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                          </p>
                        </div>
                        {canModify && (
                          <button
                            onClick={() => handleCancelAppointment(appointment.appointmentId, appointment.dateTime)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Annuler"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      {!canModify && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                          Modification impossible (moins de 24h)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <p>Aucun rendez-vous à venir</p>
                <Link href="/rendez-vous" className="text-accent hover:underline mt-2 inline-block">
                  Prendre un rendez-vous
                </Link>
              </div>
            )}
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
