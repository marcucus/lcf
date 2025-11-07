'use client';

import { useState, useMemo } from 'react';
import { Appointment } from '@/types';
import { AppointmentCard } from './AppointmentCard';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isToday,
  isSameMonth,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

type ViewMode = 'day' | 'week' | 'month';

interface CalendarViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (appointment: Appointment) => void;
  showActions?: boolean;
}

export function CalendarView({
  appointments,
  onAppointmentClick,
  onEditAppointment,
  onDeleteAppointment,
  showActions = false,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  // Navigation functions
  const goToPrevious = () => {
    if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNext = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get visible dates based on view mode
  const visibleDates = useMemo(() => {
    if (viewMode === 'day') {
      return [currentDate];
    }
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
    if (viewMode === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
    return [];
  }, [currentDate, viewMode]);

  // Filter appointments for visible dates
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = apt.dateTime.toDate();
      return visibleDates.some((date) => isSameDay(aptDate, date));
    });
  }, [appointments, visibleDates]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    filteredAppointments.forEach((apt) => {
      const dateKey = format(apt.dateTime.toDate(), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    // Sort appointments by time for each date
    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort(
        (a, b) => a.dateTime.toDate().getTime() - b.dateTime.toDate().getTime()
      );
    });
    return grouped;
  }, [filteredAppointments]);

  // Get title based on view mode
  const getTitle = () => {
    if (viewMode === 'day') {
      return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
    }
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'd MMM', { locale: fr })} - ${format(end, 'd MMM yyyy', { locale: fr })}`;
    }
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: fr });
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {getTitle()}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Buttons */}
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-accent text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-x border-gray-300 dark:border-gray-600 ${
                viewMode === 'week'
                  ? 'bg-accent text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-accent text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Mois
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Précédent"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <Button size="sm" variant="outline" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Suivant"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'day' && (
        <DayView
          date={currentDate}
          appointments={appointmentsByDate[format(currentDate, 'yyyy-MM-dd')] || []}
          onAppointmentClick={onAppointmentClick}
          onEditAppointment={onEditAppointment}
          onDeleteAppointment={onDeleteAppointment}
          showActions={showActions}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          dates={visibleDates}
          appointmentsByDate={appointmentsByDate}
          onAppointmentClick={onAppointmentClick}
          onEditAppointment={onEditAppointment}
          onDeleteAppointment={onDeleteAppointment}
          showActions={showActions}
        />
      )}

      {viewMode === 'month' && (
        <MonthView
          currentDate={currentDate}
          dates={visibleDates}
          appointmentsByDate={appointmentsByDate}
          onAppointmentClick={onAppointmentClick}
          onEditAppointment={onEditAppointment}
          onDeleteAppointment={onDeleteAppointment}
          showActions={showActions}
        />
      )}
    </div>
  );
}

// Day View Component
function DayView({
  date,
  appointments,
  onAppointmentClick,
  onEditAppointment,
  onDeleteAppointment,
  showActions,
}: {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick: (apt: Appointment) => void;
  onEditAppointment?: (apt: Appointment) => void;
  onDeleteAppointment?: (apt: Appointment) => void;
  showActions: boolean;
}) {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white capitalize">
        {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
      </h3>
      {appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <AppointmentCard
              key={apt.appointmentId}
              appointment={apt}
              onClick={() => onAppointmentClick(apt)}
              onEdit={onEditAppointment ? () => onEditAppointment(apt) : undefined}
              onDelete={onDeleteAppointment ? () => onDeleteAppointment(apt) : undefined}
              showActions={showActions}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Aucun rendez-vous pour cette journée
        </p>
      )}
    </div>
  );
}

// Week View Component
function WeekView({
  dates,
  appointmentsByDate,
  onAppointmentClick,
  onEditAppointment,
  onDeleteAppointment,
  showActions,
}: {
  dates: Date[];
  appointmentsByDate: Record<string, Appointment[]>;
  onAppointmentClick: (apt: Appointment) => void;
  onEditAppointment?: (apt: Appointment) => void;
  onDeleteAppointment?: (apt: Appointment) => void;
  showActions: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {dates.map((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayAppointments = appointmentsByDate[dateKey] || [];
        const today = isToday(date);

        return (
          <div
            key={dateKey}
            className={`bg-white dark:bg-dark-bg-secondary rounded-lg shadow p-4 ${
              today ? 'ring-2 ring-accent' : ''
            }`}
          >
            <div className="mb-3">
              <p className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
                {format(date, 'EEE', { locale: fr })}
              </p>
              <p
                className={`text-2xl font-bold ${
                  today
                    ? 'text-accent'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {format(date, 'd')}
              </p>
            </div>
            <div className="space-y-2">
              {dayAppointments.length > 0 ? (
                dayAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.appointmentId}
                    appointment={apt}
                    onClick={() => onAppointmentClick(apt)}
                    onEdit={onEditAppointment ? () => onEditAppointment(apt) : undefined}
                    onDelete={onDeleteAppointment ? () => onDeleteAppointment(apt) : undefined}
                    showActions={showActions}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
                  Aucun RDV
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Month View Component
function MonthView({
  currentDate,
  dates,
  appointmentsByDate,
  onAppointmentClick,
  onEditAppointment,
  onDeleteAppointment,
  showActions,
}: {
  currentDate: Date;
  dates: Date[];
  appointmentsByDate: Record<string, Appointment[]>;
  onAppointmentClick: (apt: Appointment) => void;
  onEditAppointment?: (apt: Appointment) => void;
  onDeleteAppointment?: (apt: Appointment) => void;
  showActions: boolean;
}) {
  // Add padding days to start from Monday
  const firstDayOfMonth = dates[0];
  const dayOfWeek = firstDayOfMonth.getDay();
  const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const paddedDates = [
    ...Array(paddingDays).fill(null),
    ...dates,
  ];

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-white dark:bg-dark-bg-secondary p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {paddedDates.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`padding-${index}`}
                className="bg-gray-50 dark:bg-gray-900 min-h-[120px]"
              />
            );
          }

          const dateKey = format(date, 'yyyy-MM-dd');
          const dayAppointments = appointmentsByDate[dateKey] || [];
          const today = isToday(date);
          const inCurrentMonth = isSameMonth(date, currentDate);

          return (
            <div
              key={dateKey}
              className={`bg-white dark:bg-dark-bg-secondary p-2 min-h-[120px] ${
                !inCurrentMonth ? 'opacity-40' : ''
              } ${today ? 'ring-2 ring-inset ring-accent' : ''}`}
            >
              <p
                className={`text-sm font-semibold mb-1 ${
                  today
                    ? 'text-accent'
                    : inCurrentMonth
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {format(date, 'd')}
              </p>
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map((apt) => (
                  <div
                    key={apt.appointmentId}
                    onClick={() => onAppointmentClick(apt)}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                      apt.serviceType === 'entretien'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : apt.serviceType === 'reparation'
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                    }`}
                  >
                    {format(apt.dateTime.toDate(), 'HH:mm')} {apt.customerName.split(' ')[0]}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    +{dayAppointments.length - 2} autre{dayAppointments.length > 3 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
