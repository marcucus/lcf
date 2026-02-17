'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiPlus, FiTrash2, FiEdit2, FiTruck, FiX } from 'react-icons/fi';
import { VehicleInfo } from '@/types';
import {
  getUserVehicles,
  saveUserVehicle,
  updateUserVehicle,
  deleteUserVehicle,
} from '@/lib/firestore/userVehicles';

function UserVehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleInfo | null>(null);
  const [formData, setFormData] = useState({
    plate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
  });

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadVehicles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserVehicles(user.uid);
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingVehicle(null);
    setFormData({
      plate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
    });
    setShowForm(true);
  };

  const handleEdit = (vehicle: VehicleInfo) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      color: vehicle.color || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingVehicle(null);
    setShowForm(false);
    setFormData({
      plate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingVehicle) {
        // Update existing vehicle
        await updateUserVehicle(editingVehicle.vehicleId as string, {
          make: formData.make,
          model: formData.model,
          year: formData.year,
          color: formData.color,
        });
      } else {
        // Create new vehicle
        await saveUserVehicle(user.uid, formData);
      }

      await loadVehicles();
      handleCancel();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Erreur lors de l\'enregistrement du véhicule');
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }

    try {
      await deleteUserVehicle(vehicleId);
      await loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Erreur lors de la suppression du véhicule');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              Mes véhicules
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérez vos véhicules pour faciliter vos prises de rendez-vous
            </p>
          </div>
          {!showForm && (
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              Ajouter un véhicule
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingVehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Plaque d'immatriculation *"
                  value={formData.plate}
                  onChange={(e) =>
                    setFormData({ ...formData, plate: e.target.value.toUpperCase() })
                  }
                  placeholder="AB-123-CD"
                  required
                  disabled={!!editingVehicle}
                />

                <Input
                  label="Marque *"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="Peugeot, Renault, etc."
                  required
                />

                <Input
                  label="Modèle *"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="208, Clio, etc."
                  required
                />

                <Input
                  label="Année"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  min={1900}
                  max={new Date().getFullYear() + 1}
                />

                <Input
                  label="Couleur"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Bleu, Rouge, etc."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  {editingVehicle ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiTruck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucun véhicule enregistré
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ajoutez votre premier véhicule pour simplifier vos prises de rendez-vous
              </p>
              <Button onClick={handleAddNew} className="inline-flex items-center gap-2">
                <FiPlus className="w-5 h-5" />
                Ajouter un véhicule
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.vehicleId} className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <FiTruck className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {vehicle.plate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {vehicle.year && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Année:</span> {vehicle.year}
                    </p>
                  )}
                  {vehicle.color && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Couleur:</span> {vehicle.color}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vehicle)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(vehicle.vehicleId as string)}
                    className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Supprimer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserVehiclesPageWithAuth() {
  return (
    <ProtectedRoute>
      <UserVehiclesPage />
    </ProtectedRoute>
  );
}
