'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FiCheckCircle, FiCalendar, FiClock, FiFileText, FiAlertCircle, FiChevronLeft, FiChevronRight, FiTruck, FiPlus } from 'react-icons/fi';
import { ServiceType, VehicleInfo } from '@/types';
import { startOfWeek, addDays, format, isSameDay, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { getUserVehicles } from '@/lib/firestore/userVehicles';

type Step = 1 | 2 | 3 | 4;

export default function RendezVousPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userVehicles, setUserVehicles] = useState<VehicleInfo[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);
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

  // Load user vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      if (!user) return;
      
      setLoadingVehicles(true);
      try {
        const vehicles = await getUserVehicles(user.uid);
        setUserVehicles(vehicles);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoadingVehicles(false);
      }
    };

    loadVehicles();
  }, [user]);

  // Get the week days (Monday to Friday) for the current week offset
  const weekDays = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(addWeeks(today, currentWeekOffset), { weekStartsOn: 1 }); // Start on Monday
    return Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  }, [currentWeekOffset]);

  // Handle time slot selection
  const handleTimeSlotSelect = (day: Date, time: string) => {
    setSelectedDate(day);
    setFormData({ 
      ...formData, 
      date: format(day, 'yyyy-MM-dd'),
      time 
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
  };

  const goToPreviousWeek = () => {
    setCurrentWeekOffset(prev => Math.max(0, prev - 1));
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: VehicleInfo) => {
    setSelectedVehicleId(vehicle.vehicleId || null);
    setFormData({
      ...formData,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      vehiclePlate: vehicle.plate,
    });
    setShowNewVehicleForm(false);
  };

  // Handle new vehicle form toggle
  const handleNewVehicleToggle = () => {
    setShowNewVehicleForm(!showNewVehicleForm);
    setSelectedVehicleId(null);
    if (!showNewVehicleForm) {
      setFormData({
        ...formData,
        vehicleMake: '',
        vehicleModel: '',
        vehiclePlate: '',
      });
    }
  };

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

      // Si c'est un nouveau véhicule, le sauvegarder
      if (showNewVehicleForm && !selectedVehicleId) {
        const { saveUserVehicle } = await import('@/lib/firestore/userVehicles');
        await saveUserVehicle(user.uid, {
          plate: formData.vehiclePlate,
          make: formData.vehicleMake,
          model: formData.vehicleModel,
        });
      }

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
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Quel service souhaitez-vous ?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sélectionnez le type de prestation dont vous avez besoin
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map((service) => (
                  <button
                    key={service.value}
                    onClick={() => setFormData({ ...formData, serviceType: service.value as ServiceType })}
                    className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      formData.serviceType === service.value
                        ? 'border-accent bg-gradient-to-br from-accent/10 to-accent/5 shadow-xl shadow-accent/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-accent/50 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                        formData.serviceType === service.value
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-accent/20 group-hover:text-accent'
                      }`}>
                        {service.value === 'entretien' && <FiClock className="w-8 h-8" />}
                        {service.value === 'reparation' && <FiFileText className="w-8 h-8" />}
                        {service.value === 'reprogrammation' && <FiCheckCircle className="w-8 h-8" />}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {service.label}
                      </h3>
                      {formData.serviceType === service.value && (
                        <div className="absolute top-4 right-4">
                          <FiCheckCircle className="w-6 h-6 text-accent" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Choisissez votre créneau
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sélectionnez un jour et une heure qui vous conviennent
                </p>
              </div>
              
              {/* Week Navigation */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                <Button
                  variant="outline"
                  onClick={goToPreviousWeek}
                  disabled={currentWeekOffset === 0}
                  className="flex items-center gap-2 disabled:opacity-40"
                >
                  <FiChevronLeft className="w-5 h-5" /> 
                  <span className="hidden sm:inline">Semaine précédente</span>
                </Button>
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Semaine du</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {format(weekDays[0], 'd MMM', { locale: fr })} - {format(weekDays[4], 'd MMM yyyy', { locale: fr })}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={goToNextWeek}
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Semaine suivante</span>
                  <FiChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Weekly Calendar View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {weekDays.map((day, index) => {
                  const isToday = isSameDay(day, new Date());
                  const hasSelection = selectedDate && isSameDay(selectedDate, day);
                  
                  return (
                    <div 
                      key={index} 
                      className={`rounded-xl border-2 overflow-hidden transition-all ${
                        hasSelection 
                          ? 'border-accent shadow-lg shadow-accent/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Day Header */}
                      <div className={`p-4 text-center transition-colors ${
                        hasSelection 
                          ? 'bg-gradient-to-r from-accent to-blue-600 text-white' 
                          : isToday
                          ? 'bg-gradient-to-r from-blue-500 to-accent text-white'
                          : 'bg-gray-50 dark:bg-gray-800'
                      }`}>
                        <div className="text-xs font-bold uppercase tracking-wider mb-1">
                          {format(day, 'EEE', { locale: fr })}
                        </div>
                        <div className="text-2xl font-bold">
                          {format(day, 'd', { locale: fr })}
                        </div>
                        <div className="text-xs opacity-90">
                          {format(day, 'MMM', { locale: fr })}
                        </div>
                      </div>
                      
                      {/* Time Slots */}
                      <div className="p-3 space-y-2 bg-white dark:bg-gray-900 max-h-96 overflow-y-auto custom-scrollbar">
                        {timeSlots.map((time) => {
                          const isSelected = selectedDate && isSameDay(selectedDate, day) && formData.time === time;
                          return (
                            <button
                              key={time}
                              onClick={() => handleTimeSlotSelect(day, time)}
                              className={`w-full py-2.5 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                                isSelected
                                  ? 'bg-accent text-white shadow-md transform scale-105'
                                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-accent/10 hover:text-accent hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <FiClock className="w-3.5 h-3.5" />
                                {time}
                                {isSelected && <FiCheckCircle className="w-3.5 h-3.5" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Summary */}
              {selectedDate && formData.time && (
                <div className="p-6 bg-gradient-to-r from-accent/10 to-blue-500/10 border-2 border-accent/30 rounded-xl">
                  <div className="flex items-center justify-center gap-3">
                    <FiCheckCircle className="w-6 h-6 text-accent" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Créneau sélectionné</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })} à {formData.time}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Vehicle Information */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Votre véhicule
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sélectionnez un véhicule existant ou ajoutez-en un nouveau
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Existing Vehicles */}
                {loadingVehicles ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de vos véhicules...</p>
                  </div>
                ) : userVehicles.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Mes véhicules
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userVehicles.map((vehicle) => (
                        <button
                          key={vehicle.vehicleId}
                          onClick={() => handleVehicleSelect(vehicle)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedVehicleId === vehicle.vehicleId
                              ? 'border-accent bg-accent/10 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-accent/50 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              selectedVehicleId === vehicle.vehicleId
                                ? 'bg-accent text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>
                              <FiTruck className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {vehicle.make} {vehicle.model}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                {vehicle.plate}
                              </p>
                            </div>
                            {selectedVehicleId === vehicle.vehicleId && (
                              <FiCheckCircle className="w-6 h-6 text-accent" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* New Vehicle Button */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <Button
                      onClick={handleNewVehicleToggle}
                      variant="outline"
                      className="bg-white dark:bg-dark-bg-secondary px-4"
                      type="button"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      {showNewVehicleForm ? 'Annuler' : 'Ajouter un nouveau véhicule'}
                    </Button>
                  </div>
                </div>

                {/* New Vehicle Form */}
                {showNewVehicleForm && (
                  <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Nouveau véhicule
                    </h3>
                    
                    <div className="space-y-4">
                      <Input
                        label="Plaque d'immatriculation"
                        value={formData.vehiclePlate}
                        onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() })}
                        placeholder="AA-123-BB"
                        required
                        className="text-lg font-mono text-center tracking-wider"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Marque du véhicule"
                          value={formData.vehicleMake}
                          onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                          placeholder="ex: Renault, Peugeot..."
                          required
                        />

                        <Input
                          label="Modèle"
                          value={formData.vehicleModel}
                          onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                          placeholder="ex: Clio, 308..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Textarea
                    label="Notes additionnelles (optionnel)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Décrivez le problème, vos besoins spécifiques, ou toute information utile..."
                    rows={5}
                    className="resize-none"
                  />
                </div>

                {/* Summary Card */}
                <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Récapitulatif de votre réservation
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <FiFileText className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Service</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {services.find(s => s.value === formData.serviceType)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <FiCalendar className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date et heure</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : formData.date} à {formData.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-8 py-8">
              {/* Success Animation */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
                    <FiCheckCircle className="w-14 h-14 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Rendez-vous confirmé !
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Nous avons hâte de vous accueillir
                </p>
              </div>
              
              {/* Appointment Details Card */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-accent to-blue-600 p-6 text-white">
                    <h3 className="text-xl font-bold mb-1">Détails de votre rendez-vous</h3>
                    <p className="text-white/80 text-sm">Voici un récapitulatif de votre réservation</p>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <FiFileText className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Service</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                              {services.find(s => s.value === formData.serviceType)?.label}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <FiCalendar className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                              {new Date(formData.date).toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <FiClock className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Heure</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                              {formData.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <FiAlertCircle className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Véhicule</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                              {formData.vehicleMake} {formData.vehicleModel}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                              {formData.vehiclePlate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.notes && (
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Vos notes
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          {formData.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-blue-50 to-accent/10 dark:from-blue-900/20 dark:to-accent/10 border-2 border-blue-200 dark:border-blue-800 p-6 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <FiAlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white mb-2">À noter</p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <li>✉️ Un email de confirmation vous a été envoyé</li>
                        <li>📅 Vous pouvez modifier votre rendez-vous jusqu&apos;à 24h avant</li>
                        <li>📍 N&apos;oubliez pas d&apos;apporter vos papiers du véhicule</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  className="flex-1"
                >
                  Voir mes rendez-vous
                </Button>
                <Button 
                  onClick={() => router.push('/')} 
                  variant="outline"
                  className="flex-1"
                >
                  Retour à l&apos;accueil
                </Button>
              </div>
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
