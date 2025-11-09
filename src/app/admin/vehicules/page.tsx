'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VehicleGrid } from '@/components/admin/VehicleGrid';
import { VehicleForm } from '@/components/admin/VehicleForm';
import { Vehicle } from '@/types';
import {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  markVehicleAsSold,
} from '@/lib/firestore/vehicles';
import { uploadVehicleImages, deleteAllVehicleImages } from '@/lib/firebase/storage';
import { FiPlus, FiFilter } from 'react-icons/fi';

function VehiclesManagementPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [vehicles, filter]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...vehicles];
    
    if (filter === 'available') {
      filtered = filtered.filter((v) => !v.isSold);
    } else if (filter === 'sold') {
      filtered = filtered.filter((v) => v.isSold);
    }
    
    setFilteredVehicles(filtered);
  };

  const handleAddNew = () => {
    setEditingVehicle(undefined);
    setShowForm(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingVehicle(undefined);
    setShowForm(false);
  };

  const handleSubmit = async (vehicleData: Partial<Vehicle>, newImages: File[]) => {
    try {
      setError(null);
      
      if (editingVehicle) {
        // Update existing vehicle
        let imageUrls = vehicleData.imageUrls || [];
        
        // Upload new images if any
        if (newImages.length > 0) {
          const uploadedUrls = await uploadVehicleImages(editingVehicle.vehicleId, newImages);
          imageUrls = [...imageUrls, ...uploadedUrls];
        }
        
        await updateVehicle(editingVehicle.vehicleId, {
          ...vehicleData,
          imageUrls,
        });
      } else {
        // Create new vehicle
        const vehicleId = await createVehicle({
          make: vehicleData.make!,
          model: vehicleData.model!,
          year: vehicleData.year!,
          price: vehicleData.price!,
          mileage: vehicleData.mileage!,
          fuelType: vehicleData.fuelType!,
          description: vehicleData.description || '',
          imageUrls: [],
          isSold: false,
        });
        
        // Upload images for the new vehicle
        if (newImages.length > 0) {
          const uploadedUrls = await uploadVehicleImages(vehicleId, newImages);
          await updateVehicle(vehicleId, { imageUrls: uploadedUrls });
        }
      }
      
      // Reload vehicles and close form
      await loadVehicles();
      handleCancel();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
      throw err; // Re-throw to let the form handle it
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }

    try {
      setError(null);
      // Delete all images from storage
      await deleteAllVehicleImages(vehicleId);
      // Delete vehicle document
      await deleteVehicle(vehicleId);
      // Reload vehicles
      await loadVehicles();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError('Erreur lors de la suppression du véhicule');
    }
  };

  const handleMarkAsSold = async (vehicleId: string) => {
    if (!confirm('Marquer ce véhicule comme vendu ?')) {
      return;
    }

    try {
      setError(null);
      await markVehicleAsSold(vehicleId);
      await loadVehicles();
    } catch (err) {
      console.error('Error marking vehicle as sold:', err);
      setError('Erreur lors de la mise à jour du véhicule');
    }
  };

  if (showForm) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            {editingVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
          </h1>
        </div>
        
        <Card>
          <VehicleForm
            vehicle={editingVehicle}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Gestion des véhicules
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez le catalogue de véhicules d&apos;occasion
          </p>
        </div>
        
        <Button onClick={handleAddNew}>
          <FiPlus className="w-5 h-5 mr-2" />
          Ajouter un véhicule
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-6">
        <Card>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">Filtrer:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-accent text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Tous ({vehicles.length})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'available'
                    ? 'bg-accent text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Disponibles ({vehicles.filter((v) => !v.isSold).length})
              </button>
              <button
                onClick={() => setFilter('sold')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'sold'
                    ? 'bg-accent text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Vendus ({vehicles.filter((v) => v.isSold).length})
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      ) : (
        <VehicleGrid
          vehicles={filteredVehicles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkAsSold={handleMarkAsSold}
          isAdmin={true}
        />
      )}
    </div>
  );
}

export default function AdminVehiclesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <VehiclesManagementPage />
    </ProtectedRoute>
  );
}
