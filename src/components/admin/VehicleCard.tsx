'use client';

import { Vehicle } from '@/types';
import { Card } from '@/components/ui/Card';
import { FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import Image from 'next/image';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
  onMarkAsSold?: (vehicleId: string) => void;
  isAdmin?: boolean;
}

export function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onMarkAsSold,
  isAdmin = false,
}: VehicleCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('fr-FR').format(mileage) + ' km';
  };

  const mainImage = vehicle.imageUrls && vehicle.imageUrls.length > 0
    ? vehicle.imageUrls[0]
    : '/placeholder-car.jpg';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {vehicle.imageUrls && vehicle.imageUrls.length > 0 ? (
          <Image
            src={mainImage}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400 dark:text-gray-500 text-4xl">🚗</span>
          </div>
        )}
        
        {vehicle.isSold && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl">
              VENDU
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {vehicle.make} {vehicle.model}
        </h3>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Année:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {vehicle.year}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Kilométrage:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatMileage(vehicle.mileage)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Carburant:</span>
            <span className="text-gray-900 dark:text-white font-medium capitalize">
              {vehicle.fuelType}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold text-accent">
            {formatPrice(vehicle.price)}
          </p>
        </div>

        {vehicle.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {vehicle.description}
          </p>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {onEdit && (
              <button
                onClick={() => onEdit(vehicle)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                aria-label="Modifier le véhicule"
              >
                <FiEdit2 className="w-4 h-4" />
                <span className="text-sm">Modifier</span>
              </button>
            )}
            
            {!vehicle.isSold && onMarkAsSold && (
              <button
                onClick={() => onMarkAsSold(vehicle.vehicleId)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                aria-label="Marquer comme vendu"
              >
                <FiCheck className="w-4 h-4" />
                <span className="text-sm">Vendu</span>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(vehicle.vehicleId)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                aria-label="Supprimer le véhicule"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
