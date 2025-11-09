'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Vehicle, FuelType } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from './ImageUploader';
import { uploadVehicleImages, deleteVehicleImage } from '@/lib/firebase/storage';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (vehicleData: Partial<Vehicle>, images: File[]) => Promise<void>;
  onCancel: () => void;
}

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuelType: 'essence' as FuelType,
    description: '',
    isSold: false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType,
        description: vehicle.description,
        isSold: vehicle.isSold,
      });
      setExistingImageUrls(vehicle.imageUrls || []);
    }
  }, [vehicle]);

  const handleRemoveExistingImage = (url: string) => {
    setExistingImageUrls(existingImageUrls.filter((u) => u !== url));
    setImagesToDelete([...imagesToDelete, url]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.make || !formData.model) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      if (formData.price <= 0) {
        throw new Error('Le prix doit être supérieur à 0');
      }

      if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
        throw new Error('Année invalide');
      }

      // Delete removed images
      for (const url of imagesToDelete) {
        try {
          await deleteVehicleImage(url);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }

      // Submit form with new images and updated image URLs
      await onSubmit(
        {
          ...formData,
          imageUrls: existingImageUrls,
        },
        images
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fuelTypes: { value: FuelType; label: string }[] = [
    { value: 'essence', label: 'Essence' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electrique', label: 'Électrique' },
    { value: 'hybride', label: 'Hybride' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Marque *"
          type="text"
          value={formData.make}
          onChange={(e) => setFormData({ ...formData, make: e.target.value })}
          placeholder="ex: Peugeot"
          required
        />

        <Input
          label="Modèle *"
          type="text"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          placeholder="ex: 208"
          required
        />

        <Select
          label="Année *"
          value={formData.year.toString()}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          options={years.map((year) => ({ value: year.toString(), label: year.toString() }))}
          required
        />

        <Input
          label="Prix (€) *"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          placeholder="15000"
          min="0"
          step="100"
          required
        />

        <Input
          label="Kilométrage *"
          type="number"
          value={formData.mileage}
          onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
          placeholder="45000"
          min="0"
          step="1000"
          required
        />

        <Select
          label="Carburant *"
          value={formData.fuelType}
          onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
          options={fuelTypes}
          required
        />
      </div>

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Décrivez le véhicule..."
        rows={4}
      />

      {vehicle && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isSold"
            checked={formData.isSold}
            onChange={(e) => setFormData({ ...formData, isSold: e.target.checked })}
            className="w-4 h-4 text-accent rounded focus:ring-accent"
          />
          <label htmlFor="isSold" className="text-gray-900 dark:text-white">
            Véhicule vendu
          </label>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Images du véhicule
        </h3>
        <ImageUploader
          images={images}
          existingImageUrls={existingImageUrls}
          onChange={setImages}
          onRemoveExisting={handleRemoveExistingImage}
          maxImages={10}
        />
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Enregistrement...' : vehicle ? 'Mettre à jour' : 'Ajouter le véhicule'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
