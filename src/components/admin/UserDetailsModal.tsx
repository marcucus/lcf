'use client';

import { useState, useEffect } from 'react';
import { User, Appointment } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FiX, FiUser, FiMail, FiCalendar, FiClock } from 'react-icons/fi';
import { getUserAppointments } from '@/lib/firestore/appointments';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
}: UserDetailsModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserAppointments();
    }
  }, [isOpen, user]);

  const loadUserAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userAppointments = await getUserAppointments(user.uid);
      setAppointments(userAppointments);
    } catch (error) {
      console.error('Error loading user appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      agendaManager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      user: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };

    const labels = {
      admin: 'Administrateur',
      agendaManager: 'Gestionnaire d\'Agenda',
      user: 'Utilisateur',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    const labels = {
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const formatDateTime = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border sticky top-0 bg-white dark:bg-dark-bg-secondary z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Détails de l&apos;utilisateur
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Information Card */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiUser className="w-5 h-5 mr-2" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Nom complet
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <FiMail className="inline w-4 h-4 mr-1" />
                  Email
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Rôle
                </p>
                <div>
                  {getRoleBadge(user.role)}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <FiClock className="inline w-4 h-4 mr-1" />
                  Membre depuis
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  ID Utilisateur
                </p>
                <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                  {user.uid}
                </p>
              </div>
            </div>
          </Card>

          {/* Appointments History Card */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiCalendar className="w-5 h-5 mr-2" />
              Historique des rendez-vous ({appointments.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun rendez-vous trouvé pour cet utilisateur.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.appointmentId}
                    className="p-4 border border-light-border dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {appointment.serviceType === 'entretien' ? 'Entretien' :
                           appointment.serviceType === 'reparation' ? 'Réparation' :
                           appointment.serviceType === 'reprogrammation' ? 'Re-programmation' :
                           appointment.serviceType}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDateTime(appointment.dateTime)}
                        </p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    {appointment.vehicleInfo && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        🚗 {appointment.vehicleInfo.make} {appointment.vehicleInfo.model} 
                        {appointment.vehicleInfo.plate && ` - ${appointment.vehicleInfo.plate}`}
                      </p>
                    )}

                    {appointment.customerNotes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                        Note: {appointment.customerNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-light-border dark:border-dark-border">
          <Button onClick={onClose} variant="secondary" fullWidth>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
