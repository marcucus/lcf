'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiPlus, FiEdit2, FiTrash2, FiTruck, FiCheck, FiX } from 'react-icons/fi';
import { VehicleInfo } from '@/types';
import { getUserVehicles, saveUserVehicle, deleteUserVehicle, updateUserVehicle } from '@/lib/firestore/userVehicles';

export default function VehiculesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    plate: '',
    make: '',
    model: '',
    year: '',
    color: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadVehicles();
  }, [user, router]);

  const loadVehicles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getUserVehicles(user.uid);
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await saveUserVehicle(user.uid, {
        plate: formData.plate.toUpperCase(),
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: formData.color || undefined,
      });

      setFormData({ plate: '', make: '', model: '', year: '', color: '' });
      setShowAddForm(false);
      loadVehicles();
      alert('✅ Véhicule ajouté avec succès !');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'ajout du véhicule');
    }
  };

  const handleUpdateVehicle = async (vehicleId: string) => {
    if (!user) return;

    try {
      await updateUserVehicle(vehicleId, {
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: formData.color || undefined,
      });

      setEditingId(null);
      setFormData({ plate: '', make: '', model: '', year: '', color: '' });
      loadVehicles();
      alert('✅ Véhicule modifié avec succès !');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string, plate: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le véhicule ${plate} ?`)) {
      return;
    }

    try {
      await deleteUserVehicle(vehicleId);
      loadVehicles();
      alert('✅ Véhicule supprimé avec succès !');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression');
    }
  };

  const startEdit = (vehicle: VehicleInfo) => {
    setEditingId(vehicle.vehicleId || '');
    setFormData({
      plate: vehicle.plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year?.toString() || '',
      color: vehicle.color || '',
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ plate: '', make: '', model: '', year: '', color: '' });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
            Mes Véhicules
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez vos véhicules pour une prise de rendez-vous plus rapide
          </p>
        </div>

        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setFormData({ plate: '', make: '', model: '', year: '', color: '' });
            }}
            className="flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Ajouter un véhicule
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Nouveau véhicule
            </h3>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Plaque d'immatriculation *"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  placeholder="AA-123-BB"
                  required
                  className="font-mono"
                />
                <Input
                  label="Marque *"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="ex: Renault"
                  required
                />
                <Input
                  label="Modèle *"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="ex: Clio"
                  required
                />
                <Input
                  label="Année"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="ex: 2021"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                <Input
                  label="Couleur"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="ex: Bleu"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <FiCheck className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="text-center py-12">
            <FiTruck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun véhicule enregistré
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ajoutez votre premier véhicule pour accélérer vos prises de rendez-vous
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <FiPlus className="w-4 h-4 mr-2" />
              Ajouter un véhicule
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.vehicleId} className="relative">
                {editingId === vehicle.vehicleId ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateVehicle(vehicle.vehicleId!); }} className="space-y-3">
                    <Input
                      label="Marque *"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      required
                    />
                    <Input
                      label="Modèle *"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                    <Input
                      label="Année"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                    <Input
                      label="Couleur"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" size="sm" className="flex-1">
                        <FiCheck className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={cancelEdit} className="flex-1">
                        <FiX className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4 mx-auto">
                      <FiTruck className="w-8 h-8 text-accent" />
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white mb-2">
                        {vehicle.plate}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {vehicle.make} {vehicle.model}
                      </div>
                      {vehicle.year && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Année: {vehicle.year}
                        </div>
                      )}
                      {vehicle.color && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Couleur: {vehicle.color}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(vehicle)}
                        className="flex-1"
                      >
                        <FiEdit2 className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteVehicle(vehicle.vehicleId!, vehicle.plate)}
                        className="flex-1 text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <FiTrash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
