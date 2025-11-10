'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiArrowLeft, FiPhone, FiMail } from 'react-icons/fi';
import { Vehicle } from '@/types';
import { getVehicleById } from '@/lib/firestore/vehicles';
import Image from 'next/image';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId]);

  const loadVehicle = async () => {
    setLoading(true);
    try {
      const data = await getVehicleById(vehicleId);
      if (data && !data.isSold) {
        setVehicle(data);
      } else {
        router.push('/vehicules');
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
      router.push('/vehicules');
    } finally {
      setLoading(false);
    }
  };

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
    if (!transmission) return '-';
    const labels: Record<string, string> = {
      manuelle: 'Manuelle',
      automatique: 'Automatique',
    };
    return labels[transmission] || transmission;
  };

  const getConditionLabel = (condition?: string) => {
    if (!condition) return '-';
    const labels: Record<string, string> = {
      excellent: 'Excellent',
      'tres-bon': 'Très bon',
      bon: 'Bon',
      correct: 'Correct',
    };
    return labels[condition] || condition;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/vehicules')}
          className="mb-6 flex items-center gap-2"
        >
          <FiArrowLeft className="w-5 h-5" />
          Retour au catalogue
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
                {vehicle.imageUrls && vehicle.imageUrls.length > 0 ? (
                  <Image
                    src={vehicle.imageUrls[selectedImageIndex]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400 dark:text-gray-500 text-6xl">🚗</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {vehicle.imageUrls && vehicle.imageUrls.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {vehicle.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-accent'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Description */}
            <Card className="mt-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {vehicle.description}
              </p>
            </Card>

            {/* Equipment */}
            {vehicle.equipment && vehicle.equipment.length > 0 && (
              <Card className="mt-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Équipements
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {vehicle.equipment.map((item, index) => (
                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="text-accent mr-2">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Right Column - Details and Contact */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{vehicle.year}</p>

              <div className="mb-6">
                <p className="text-4xl font-bold text-accent">{formatPrice(vehicle.price)}</p>
              </div>

              {/* Technical Specs */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Kilométrage</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatMileage(vehicle.mileage)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Carburant</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {getFuelTypeLabel(vehicle.fuelType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transmission</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {getTransmissionLabel(vehicle.transmission)}
                  </span>
                </div>
                {vehicle.power && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Puissance</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {vehicle.power} CV
                    </span>
                  </div>
                )}
                {vehicle.color && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Couleur</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {vehicle.color}
                    </span>
                  </div>
                )}
                {vehicle.doors && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Portes</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {vehicle.doors}
                    </span>
                  </div>
                )}
                {vehicle.seats && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Places</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {vehicle.seats}
                    </span>
                  </div>
                )}
                {vehicle.condition && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">État</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {getConditionLabel(vehicle.condition)}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Intéressé ? Contactez-nous
                </h3>
                <Button
                  fullWidth
                  onClick={() => (window.location.href = 'tel:+33123456789')}
                  className="flex items-center justify-center gap-2"
                >
                  <FiPhone className="w-5 h-5" />
                  Appeler
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => router.push('/contact')}
                  className="flex items-center justify-center gap-2"
                >
                  <FiMail className="w-5 h-5" />
                  Envoyer un message
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => router.push('/rendez-vous')}
                  className="flex items-center justify-center gap-2"
                >
                  Demander un essai
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
