import { Appointment, ServiceType } from '@/types';
import { FiClock, FiUser, FiTool, FiEdit, FiTrash2 } from 'react-icons/fi';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const serviceColors: Record<ServiceType, { bg: string; border: string; text: string }> = {
  entretien: { bg: 'bg-blue-500', border: '#3B82F6', text: 'text-white' },
  reparation: { bg: 'bg-orange-500', border: '#F97316', text: 'text-white' },
  reprogrammation: { bg: 'bg-purple-500', border: '#A855F7', text: 'text-white' },
};

const serviceLabels: Record<ServiceType, string> = {
  entretien: 'Entretien',
  reparation: 'Réparation',
  reprogrammation: 'Re-programmation',
};

export function AppointmentCard({
  appointment,
  onClick,
  onEdit,
  onDelete,
  showActions = false,
}: AppointmentCardProps) {
  const dateTime = appointment.dateTime.toDate();
  const serviceColor = serviceColors[appointment.serviceType];

  return (
    <div
      className="bg-white dark:bg-dark-bg-secondary border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderLeftColor: serviceColor.border }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`px-2 py-1 ${serviceColor.bg} ${serviceColor.text} text-xs font-semibold rounded`}
            >
              {serviceLabels[appointment.serviceType]}
            </span>
            {appointment.status !== 'confirmed' && (
              <span className="px-2 py-1 bg-gray-400 text-white text-xs font-semibold rounded">
                {appointment.status === 'cancelled' ? 'Annulé' : 'Terminé'}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-gray-900 dark:text-white font-medium">
              <FiUser className="w-4 h-4 mr-2" />
              {appointment.customerName}
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
              <FiClock className="w-4 h-4 mr-2" />
              {dateTime.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
              <FiTool className="w-4 h-4 mr-2" />
              {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
            </div>

            {appointment.customerNotes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                {appointment.customerNotes.length > 50
                  ? `${appointment.customerNotes.substring(0, 50)}...`
                  : appointment.customerNotes}
              </p>
            )}
          </div>
        </div>

        {showActions && (onEdit || onDelete) && (
          <div className="flex space-x-2 ml-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Modifier"
              >
                <FiEdit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Supprimer"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
