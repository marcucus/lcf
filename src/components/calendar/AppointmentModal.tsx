'use client';

import { useState, useEffect } from 'react';
import { Appointment, ServiceType, VehicleInfo, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FiX } from 'react-icons/fi';
import { Timestamp } from 'firebase/firestore';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  appointment?: Appointment | null;
  clients?: User[];
  mode: 'create' | 'edit' | 'view';
}

export interface AppointmentFormData {
  userId: string;
  customerName: string;
  serviceType: ServiceType;
  dateTime: Date;
  vehicleInfo: VehicleInfo;
  customerNotes?: string;
  status?: 'confirmed' | 'completed' | 'cancelled';
}

export function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  clients = [],
  mode,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    userId: '',
    customerName: '',
    serviceType: 'entretien',
    dateTime: new Date(),
    vehicleInfo: {
      make: '',
      model: '',
      plate: '',
    },
    customerNotes: '',
    status: 'confirmed',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointment) {
      setFormData({
        userId: appointment.userId,
        customerName: appointment.customerName,
        serviceType: appointment.serviceType,
        dateTime: appointment.dateTime.toDate(),
        vehicleInfo: appointment.vehicleInfo,
        customerNotes: appointment.customerNotes || '',
        status: appointment.status,
      });
    } else {
      // Reset form for new appointment
      setFormData({
        userId: '',
        customerName: '',
        serviceType: 'entretien',
        dateTime: new Date(),
        vehicleInfo: {
          make: '',
          model: '',
          plate: '',
        },
        customerNotes: '',
        status: 'confirmed',
      });
    }
  }, [appointment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.customerName.trim()) {
        throw new Error('Le nom du client est requis');
      }
      if (!formData.vehicleInfo.make || !formData.vehicleInfo.model) {
        throw new Error('Les informations du véhicule sont requises');
      }
      if (!formData.dateTime) {
        throw new Error('La date et l\'heure sont requises');
      }

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (userId: string) => {
    const client = clients.find((c) => c.uid === userId);
    if (client) {
      setFormData({
        ...formData,
        userId: client.uid,
        customerName: `${client.firstName} ${client.lastName}`,
      });
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const title =
    mode === 'create'
      ? 'Nouveau rendez-vous'
      : mode === 'edit'
      ? 'Modifier le rendez-vous'
      : 'Détails du rendez-vous';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Client Selection */}
          {mode === 'create' && clients.length > 0 && (
            <div>
              <Select
                label="Client"
                value={formData.userId}
                onChange={(e) => handleClientChange(e.target.value)}
                disabled={isViewMode}
                options={[
                  { value: '', label: 'Sélectionner un client' },
                  ...clients.map((client) => ({
                    value: client.uid,
                    label: `${client.firstName} ${client.lastName} (${client.email})`,
                  })),
                ]}
              />
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du client *
            </label>
            <Input
              type="text"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              disabled={isViewMode || (mode === 'create' && formData.userId !== '')}
              required
            />
          </div>

          {/* Service Type */}
          <div>
            <Select
              label="Type de service *"
              value={formData.serviceType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceType: e.target.value as ServiceType,
                })
              }
              disabled={isViewMode}
              required
              options={[
                { value: 'entretien', label: 'Entretien' },
                { value: 'reparation', label: 'Réparation' },
                { value: 'reprogrammation', label: 'Re-programmation' },
              ]}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <Input
                type="date"
                value={formData.dateTime.toISOString().split('T')[0]}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const time = formData.dateTime;
                  date.setHours(time.getHours(), time.getMinutes());
                  setFormData({ ...formData, dateTime: date });
                }}
                disabled={isViewMode}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heure *
              </label>
              <Input
                type="time"
                value={formData.dateTime.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const date = new Date(formData.dateTime);
                  date.setHours(parseInt(hours), parseInt(minutes));
                  setFormData({ ...formData, dateTime: date });
                }}
                disabled={isViewMode}
                required
              />
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marque *
              </label>
              <Input
                type="text"
                value={formData.vehicleInfo.make}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleInfo: {
                      ...formData.vehicleInfo,
                      make: e.target.value,
                    },
                  })
                }
                disabled={isViewMode}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modèle *
              </label>
              <Input
                type="text"
                value={formData.vehicleInfo.model}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleInfo: {
                      ...formData.vehicleInfo,
                      model: e.target.value,
                    },
                  })
                }
                disabled={isViewMode}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Immatriculation
            </label>
            <Input
              type="text"
              value={formData.vehicleInfo.plate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vehicleInfo: {
                    ...formData.vehicleInfo,
                    plate: e.target.value,
                  },
                })
              }
              disabled={isViewMode}
            />
          </div>

          {/* Customer Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes du client
            </label>
            <Textarea
              value={formData.customerNotes}
              onChange={(e) =>
                setFormData({ ...formData, customerNotes: e.target.value })
              }
              disabled={isViewMode}
              rows={3}
            />
          </div>

          {/* Status (Edit mode only) */}
          {mode === 'edit' && (
            <div>
              <Select
                label="Statut"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'confirmed' | 'completed' | 'cancelled',
                  })
                }
                options={[
                  { value: 'confirmed', label: 'Confirmé' },
                  { value: 'completed', label: 'Terminé' },
                  { value: 'cancelled', label: 'Annulé' },
                ]}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              {isViewMode ? 'Fermer' : 'Annuler'}
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
