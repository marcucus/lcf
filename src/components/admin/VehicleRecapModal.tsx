'use client';

import { useState } from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/Button';
import { FiX, FiDownload, FiCheck } from 'react-icons/fi';
import { generateVehicleSheet } from '@/lib/pdf/vehicleSheet';

interface VehicleRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export function VehicleRecapModal({ isOpen, onClose, vehicle }: VehicleRecapModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const handleDownloadSheet = async () => {
    setIsGenerating(true);
    try {
      await generateVehicleSheet(vehicle);
    } catch (error) {
      console.error('Error generating vehicle sheet:', error);
      alert('Erreur lors de la génération de la fiche véhicule');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('fr-FR').format(mileage) + ' km';
  };

  const getConditionLabel = (condition?: string) => {
    const labels: Record<string, string> = {
      'excellent': 'Excellent',
      'tres-bon': 'Très bon',
      'bon': 'Bon',
      'correct': 'Correct',
    };
    return condition ? labels[condition] : 'Non spécifié';
  };

  const getTransmissionLabel = (transmission?: string) => {
    const labels: Record<string, string> = {
      'manuelle': 'Manuelle',
      'automatique': 'Automatique',
    };
    return transmission ? labels[transmission] : 'Non spécifié';
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const labels: Record<string, string> = {
      'essence': 'Essence',
      'diesel': 'Diesel',
      'electrique': 'Électrique',
      'hybride': 'Hybride',
    };
    return labels[fuelType] || fuelType;
  };

  const nextImage = () => {
    if (vehicle.imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.imageUrls.length);
    }
  };

  const prevImage = () => {
    if (vehicle.imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + vehicle.imageUrls.length) % vehicle.imageUrls.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Véhicule créé avec succès !
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Récapitulatif des informations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Images Gallery */}
          {vehicle.imageUrls.length > 0 && (
            <div className="relative bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
              <img
                src={vehicle.imageUrls[currentImageIndex]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-64 object-cover"
              />
              {vehicle.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {vehicle.imageUrls.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-accent w-6'
                            : 'bg-white/60 dark:bg-gray-600/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Vehicle Title */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-4xl font-extrabold text-accent mt-2">
              {formatPrice(vehicle.price)}
            </p>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCard label="Année" value={vehicle.year.toString()} />
            <InfoCard label="Kilométrage" value={formatMileage(vehicle.mileage)} />
            <InfoCard label="Carburant" value={getFuelTypeLabel(vehicle.fuelType)} />
            {vehicle.transmission && (
              <InfoCard label="Transmission" value={getTransmissionLabel(vehicle.transmission)} />
            )}
            {vehicle.color && <InfoCard label="Couleur" value={vehicle.color} />}
            {vehicle.doors && <InfoCard label="Portes" value={vehicle.doors.toString()} />}
            {vehicle.seats && <InfoCard label="Places" value={vehicle.seats.toString()} />}
            {vehicle.power && vehicle.power > 0 && (
              <InfoCard label="Puissance" value={`${vehicle.power} CV`} />
            )}
            {vehicle.condition && (
              <InfoCard label="État" value={getConditionLabel(vehicle.condition)} />
            )}
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Equipment */}
          {vehicle.equipment && vehicle.equipment.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Équipements</h4>
              <div className="flex flex-wrap gap-2">
                {vehicle.equipment.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Download Section */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Fiche véhicule pour exposition
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Téléchargez la fiche au format PDF pour l&apos;imprimer et la placer sur le pare-brise du véhicule.
            </p>
            <Button
              onClick={handleDownloadSheet}
              disabled={isGenerating}
              size="lg"
            >
              <FiDownload className="w-5 h-5 mr-2" />
              {isGenerating ? 'Génération en cours...' : 'Télécharger la fiche véhicule'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <Button onClick={onClose} variant="secondary" fullWidth>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
}

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
