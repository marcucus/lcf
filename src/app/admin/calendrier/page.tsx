'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useRole } from '@/hooks/useRole';
import { useRouter } from 'next/navigation';
import { Appointment, User } from '@/types';
import { CalendarView } from '@/components/calendar/CalendarView';
import {
  AppointmentModal,
  AppointmentFormData,
} from '@/components/calendar/AppointmentModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FiPlus, FiCalendar } from 'react-icons/fi';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

function CalendarContent() {
  const { user, isAgendaManager, isAdmin } = useRole();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(
    null
  );
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    total: 0,
  });

  // Check if user has required permissions
  useEffect(() => {
    if (!loading && user && !isAgendaManager && !isAdmin) {
      router.push('/unauthorized');
    }
  }, [user, isAgendaManager, isAdmin, loading, router]);

  // Real-time synchronization with Firestore for appointments
  useEffect(() => {
    if (!db) {
      console.warn('Firebase not configured');
      setLoading(false);
      return;
    }

    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, orderBy('dateTime', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointmentsData = snapshot.docs.map((doc) => ({
          appointmentId: doc.id,
          ...doc.data(),
        })) as Appointment[];

        setAppointments(appointmentsData);
        calculateStats(appointmentsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Load clients for admin/manager
  useEffect(() => {
    if (!db) return;

    const loadClients = async () => {
      if (!db) return;
      
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const usersData = snapshot.docs.map((doc) => doc.data() as User);
        setClients(usersData);
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };

    if (isAgendaManager || isAdmin) {
      loadClients();
    }
  }, [isAgendaManager, isAdmin]);

  // Calculate statistics
  const calculateStats = (appointmentsData: Appointment[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    const todayCount = appointmentsData.filter((apt) => {
      const aptDate = apt.dateTime.toDate();
      return (
        aptDate >= today &&
        aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000) &&
        apt.status === 'confirmed'
      );
    }).length;

    const weekCount = appointmentsData.filter((apt) => {
      const aptDate = apt.dateTime.toDate();
      return aptDate >= today && aptDate < weekFromNow && apt.status === 'confirmed';
    }).length;

    setStats({
      today: todayCount,
      thisWeek: weekCount,
      total: appointmentsData.filter((apt) => apt.status === 'confirmed').length,
    });
  };

  // Handle appointment click - show details
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalMode('view');
    setModalOpen(true);
  };

  // Handle create appointment
  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setModalMode('create');
    setModalOpen(true);
  };

  // Handle edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!db) return;

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le rendez-vous de ${appointment.customerName} ?`
      )
    ) {
      return;
    }

    try {
      const appointmentRef = doc(db, 'appointments', appointment.appointmentId);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erreur lors de la suppression du rendez-vous');
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: AppointmentFormData) => {
    if (!db) throw new Error('Firebase not configured');

    try {
      if (modalMode === 'create') {
        // Create new appointment
        const appointmentData = {
          userId: data.userId || user?.uid || '',
          customerName: data.customerName,
          serviceType: data.serviceType,
          dateTime: Timestamp.fromDate(data.dateTime),
          vehicleInfo: data.vehicleInfo,
          customerNotes: data.customerNotes || '',
          status: 'confirmed',
          createdAt: Timestamp.now(),
        };

        const newAppointmentRef = doc(collection(db, 'appointments'));
        await setDoc(newAppointmentRef, appointmentData);
      } else if (modalMode === 'edit' && selectedAppointment) {
        // Update existing appointment
        const appointmentRef = doc(
          db,
          'appointments',
          selectedAppointment.appointmentId
        );
        await updateDoc(appointmentRef, {
          customerName: data.customerName,
          serviceType: data.serviceType,
          dateTime: Timestamp.fromDate(data.dateTime),
          vehicleInfo: data.vehicleInfo,
          customerNotes: data.customerNotes || '',
          status: data.status || 'confirmed',
        });
      }

      setModalOpen(false);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      throw new Error(error.message || 'Erreur lors de l\'enregistrement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                Calendrier Global
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Gérez tous les rendez-vous du garage
              </p>
            </div>
            <Button onClick={handleCreateAppointment} size="lg">
              <FiPlus className="w-5 h-5 mr-2" />
              Nouveau Rendez-vous
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <FiCalendar className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.today}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rendez-vous aujourd&apos;hui
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
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.thisWeek}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cette semaine
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <FiCalendar className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total confirmés
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar View */}
        <Card>
          <CalendarView
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            showActions={true}
          />
        </Card>

        {/* Appointment Modal */}
        <AppointmentModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handleFormSubmit}
          appointment={selectedAppointment}
          clients={clients}
          mode={modalMode}
        />
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ProtectedRoute allowedRoles={['agendaManager', 'admin']}>
      <CalendarContent />
    </ProtectedRoute>
  );
}
