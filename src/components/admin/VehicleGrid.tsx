'use client';

import { Vehicle } from '@/types';
import { VehicleCard } from './VehicleCard';

interface VehicleGridProps {
  vehicles: Vehicle[];
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
  onMarkAsSold?: (vehicleId: string) => void;
  isAdmin?: boolean;
}

export function VehicleGrid({
  vehicles,
  onEdit,
  onDelete,
  onMarkAsSold,
  isAdmin = false,
}: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Aucun véhicule disponible pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.vehicleId}
          vehicle={vehicle}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsSold={onMarkAsSold}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
