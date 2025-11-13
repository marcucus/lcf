'use client';

import { Vehicle } from '@/types';
import { Card } from '@/components/ui/Card';
import { 
  FiCalendar, 
  FiTruck, 
  FiDollarSign, 
  FiDroplet, 
  FiSettings,
  FiPackage,
  FiUsers,
  FiZap
} from 'react-icons/fi';

interface VehicleSpecsProps {
  vehicle: Vehicle;
}

export function VehicleSpecs({ vehicle }: VehicleSpecsProps) {
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

  const getFuelTypeLabel = (fuelType: string) => {
    const labels: Record<string, string> = {
      essence: 'Essence',
      diesel: 'Diesel',
      electrique: 'Électrique',
      hybride: 'Hybride',
    };
    return labels[fuelType] || fuelType;
  };

  const getTransmissionLabel = (transmission?: string) => {
    const labels: Record<string, string> = {
      manuelle: 'Manuelle',
      automatique: 'Automatique',
    };
    return transmission ? labels[transmission] || transmission : 'Non spécifiée';
  };

  const getConditionLabel = (condition?: string) => {
    const labels: Record<string, string> = {
      excellent: 'Excellent',
      'tres-bon': 'Très bon',
      bon: 'Bon',
      correct: 'Correct',
    };
    return condition ? labels[condition] || condition : 'Non spécifiée';
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Fiche Technique
      </h2>

      <div className="space-y-6">
        {/* Price Section */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Prix</p>
              <p className="text-3xl font-bold text-accent">{formatPrice(vehicle.price)}</p>
            </div>
          </div>
        </div>

        {/* Main Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SpecItem
            icon={<FiCalendar className="w-5 h-5" />}
            label="Année"
            value={vehicle.year.toString()}
          />
          <SpecItem
            icon={<FiTruck className="w-5 h-5" />}
            label="Kilométrage"
            value={formatMileage(vehicle.mileage)}
          />
          <SpecItem
            icon={<FiDroplet className="w-5 h-5" />}
            label="Carburant"
            value={getFuelTypeLabel(vehicle.fuelType)}
          />
          <SpecItem
            icon={<FiSettings className="w-5 h-5" />}
            label="Transmission"
            value={getTransmissionLabel(vehicle.transmission)}
          />
          
          {vehicle.color && (
            <SpecItem
              icon={<FiPackage className="w-5 h-5" />}
              label="Couleur"
              value={vehicle.color}
            />
          )}
          
          {vehicle.doors && (
            <SpecItem
              icon={<FiPackage className="w-5 h-5" />}
              label="Portes"
              value={`${vehicle.doors} portes`}
            />
          )}
          
          {vehicle.seats && (
            <SpecItem
              icon={<FiUsers className="w-5 h-5" />}
              label="Places"
              value={`${vehicle.seats} places`}
            />
          )}
          
          {vehicle.power && (
            <SpecItem
              icon={<FiZap className="w-5 h-5" />}
              label="Puissance"
              value={`${vehicle.power} CV`}
            />
          )}
          
          {vehicle.condition && (
            <SpecItem
              icon={<FiPackage className="w-5 h-5" />}
              label="État"
              value={getConditionLabel(vehicle.condition)}
            />
          )}
        </div>

        {/* Equipment Section */}
        {vehicle.equipment && vehicle.equipment.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Équipements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {vehicle.equipment.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description Section */}
        {vehicle.description && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {vehicle.description}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function SpecItem({ icon, label, value }: SpecItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="text-accent">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
