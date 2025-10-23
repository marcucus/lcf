'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FiCheckCircle, FiCalendar, FiClock, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { ServiceType } from '@/types';

type Step = 1 | 2 | 3 | 4;

export default function RendezVousPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    serviceType: '' as ServiceType | '',
    date: '',
    time: '',
    vehicleMake: '',
    vehicleModel: '',
    vehiclePlate: '',
    notes: '',
  });

  const services = [
    { value: 'entretien', label: 'Entretien' },
    { value: 'reparation', label: 'Réparation' },
    { value: 'reprogrammation', label: 'Re-programmation' },
  ];

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Combine date and time into a single Date object
      const [hours, minutes] = formData.time.split(':').map(Number);
      const dateTime = new Date(formData.date);
      dateTime.setHours(hours, minutes, 0, 0);

      // Create appointment in Firestore
      const { createAppointment } = await import('@/lib/firestore/appointments');
      
      await createAppointment(
        user.uid,
        `${user.firstName} ${user.lastName}`.trim() || user.email,
        formData.serviceType as ServiceType,
        dateTime,
        {
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          plate: formData.vehiclePlate,
        },
        formData.notes
      );

      setCurrentStep(4);
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      alert(error.message || 'Erreur lors de la création du rendez-vous');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.serviceType !== '';
      case 2:
        return formData.date !== '' && formData.time !== '';
      case 3:
        return formData.vehicleMake !== '' && formData.vehicleModel !== '' && formData.vehiclePlate !== '';
      default:
        return true;
    }
  };

  const steps = [
    { number: 1, title: 'Service', icon: <FiFileText /> },
    { number: 2, title: 'Date & Heure', icon: <FiCalendar /> },
    { number: 3, title: 'Véhicule', icon: <FiClock /> },
    { number: 4, title: 'Confirmation', icon: <FiCheckCircle /> },
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
            Prendre rendez-vous
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Réservez votre créneau en quelques clics
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
                      currentStep >= step.number
                        ? 'bg-accent text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <FiCheckCircle />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className="text-xs mt-2 hidden sm:block text-gray-600 dark:text-gray-400">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      currentStep > step.number
                        ? 'bg-accent'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sélectionnez le type de service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service) => (
                  <button
                    key={service.value}
                    onClick={() => setFormData({ ...formData, serviceType: service.value as ServiceType })}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      formData.serviceType === service.value
                        ? 'border-accent bg-accent/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-accent/50'
                    }`}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {service.label}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Choisissez la date et l&apos;heure
              </h2>
              
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Créneau horaire
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setFormData({ ...formData, time })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.time === time
                          ? 'border-accent bg-accent/10 text-accent font-semibold'
                          : 'border-gray-200 dark:border-gray-700 hover:border-accent/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Informations sur votre véhicule
              </h2>
              
              <Input
                label="Marque"
                value={formData.vehicleMake}
                onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                placeholder="ex: Renault"
                required
              />

              <Input
                label="Modèle"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                placeholder="ex: Clio"
                required
              />

              <Input
                label="Immatriculation"
                value={formData.vehiclePlate}
                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                placeholder="ex: AA-123-BB"
                required
              />

              <Textarea
                label="Notes additionnelles (optionnel)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Décrivez le problème ou vos besoins..."
              />
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Rendez-vous confirmé !
              </h2>
              
              <div className="bg-gray-50 dark:bg-dark-bg-secondary p-6 rounded-lg text-left max-w-md mx-auto">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                  Récapitulatif
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Service:</strong> {services.find(s => s.value === formData.serviceType)?.label}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Date:</strong> {new Date(formData.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Heure:</strong> {formData.time}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Véhicule:</strong> {formData.vehicleMake} {formData.vehicleModel}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FiAlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-left text-gray-700 dark:text-gray-300">
                    <p className="font-semibold mb-1">Important</p>
                    <p>
                      Un email de confirmation vous a été envoyé. Vous pouvez modifier ou annuler votre rendez-vous jusqu&apos;à 24h avant.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => router.push('/dashboard')} fullWidth>
                Voir mes rendez-vous
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Précédent
              </Button>
              
              {currentStep === 3 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                >
                  Confirmer le rendez-vous
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Suivant
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
