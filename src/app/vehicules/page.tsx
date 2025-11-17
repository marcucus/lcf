'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { Vehicle, FuelType } from '@/types';
import { getVehiclesForSale } from '@/lib/firestore/vehicles';
import Image from 'next/image';

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'mileage-asc' | 'mileage-desc';
type ViewMode = 'grid' | 'list';

export default function VehiculesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [vehicles, searchQuery, selectedMake, selectedFuelType, selectedYear, priceMin, priceMax, sortBy]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehiclesForSale();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...vehicles];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
      );
    }

    // Apply brand filter
    if (selectedMake) {
      filtered = filtered.filter((v) => v.make === selectedMake);
    }

    // Apply fuel type filter
    if (selectedFuelType) {
      filtered = filtered.filter((v) => v.fuelType === selectedFuelType);
    }

    // Apply year filter
    if (selectedYear) {
      filtered = filtered.filter((v) => v.year.toString() === selectedYear);
    }

    // Apply price range filter
    if (priceMin) {
      filtered = filtered.filter((v) => v.price >= parseInt(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter((v) => v.price <= parseInt(priceMax));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'mileage-asc':
          return a.mileage - b.mileage;
        case 'mileage-desc':
          return b.mileage - a.mileage;
        default:
          return 0;
      }
    });

    setFilteredVehicles(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMake('');
    setSelectedFuelType('');
    setSelectedYear('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('recent');
  };

  const getUniqueMakes = () => {
    const makes = Array.from(new Set(vehicles.map((v) => v.make)));
    return makes.sort();
  };

  const getUniqueYears = () => {
    const years = Array.from(new Set(vehicles.map((v) => v.year)));
    return years.sort((a, b) => b - a);
  };

  const isVehicleNew = (createdAt: any) => {
    const now = Date.now();
    const created = createdAt.toMillis();
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    return daysDiff < 30;
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

  const VehicleCardComponent = ({ vehicle }: { vehicle: Vehicle }) => {
    const mainImage = vehicle.imageUrls?.[0];

    return (
      <div
        onClick={() => router.push(`/vehicules/${vehicle.vehicleId}`)}
        className="cursor-pointer"
      >
        <Card hover className="overflow-hidden">
          {/* Image Section */}
          <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
            {mainImage ? (
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

            {/* New Badge */}
            {isVehicleNew(vehicle.createdAt) && (
              <div className="absolute top-2 right-2 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                NOUVEAU
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {vehicle.make} {vehicle.model}
            </h3>

            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {vehicle.year}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {vehicle.fuelType}
              </span>
            </div>

            <div className="mb-3">
              <p className="text-2xl font-bold text-accent">
                {formatPrice(vehicle.price)}
              </p>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatMileage(vehicle.mileage)}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const VehicleListItem = ({ vehicle }: { vehicle: Vehicle }) => {
    const mainImage = vehicle.imageUrls?.[0];

    return (
      <div
        onClick={() => router.push(`/vehicules/${vehicle.vehicleId}`)}
        className="cursor-pointer"
      >
        <Card hover className="overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Image Section */}
            <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0 bg-gray-200 dark:bg-gray-700">
              {mainImage ? (
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

              {/* New Badge */}
              {isVehicleNew(vehicle.createdAt) && (
                <div className="absolute top-2 right-2 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  NOUVEAU
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {vehicle.make} {vehicle.model}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Année</span>
                  <p className="text-gray-900 dark:text-white font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Kilométrage</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatMileage(vehicle.mileage)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Carburant</span>
                  <p className="text-gray-900 dark:text-white font-medium capitalize">
                    {vehicle.fuelType}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prix</span>
                  <p className="text-2xl font-bold text-accent">{formatPrice(vehicle.price)}</p>
                </div>
              </div>

              {vehicle.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {vehicle.description}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
            Véhicules d&apos;Occasion
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Découvrez notre sélection de véhicules disponibles
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par marque, modèle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Select
              label="Marque"
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
            >
              <option value="">Toutes les marques</option>
              {getUniqueMakes().map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </Select>

            <Select
              label="Carburant"
              value={selectedFuelType}
              onChange={(e) => setSelectedFuelType(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="electrique">Électrique</option>
              <option value="hybride">Hybride</option>
            </Select>

            <Select
              label="Année"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Toutes</option>
              {getUniqueYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>

            <Input
              label="Prix min (€)"
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Min"
            />

            <Input
              label="Prix max (€)"
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max"
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>

            <div className="flex gap-4 items-center">
              {/* Sort */}
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-48"
              >
                <option value="recent">Plus récent</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="mileage-asc">Km croissant</option>
                <option value="mileage-desc">Km décroissant</option>
              </Select>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  aria-label="Vue grille"
                >
                  <FiGrid className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  aria-label="Vue liste"
                >
                  <FiList className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          {filteredVehicles.length} véhicule{filteredVehicles.length !== 1 ? 's' : ''} trouvé
          {filteredVehicles.length !== 1 ? 's' : ''}
        </div>

        {/* Vehicle List/Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <Card className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun véhicule trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Button onClick={resetFilters}>Réinitialiser les filtres</Button>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredVehicles.map((vehicle) =>
              viewMode === 'grid' ? (
                <VehicleCardComponent key={vehicle.vehicleId} vehicle={vehicle} />
              ) : (
                <VehicleListItem key={vehicle.vehicleId} vehicle={vehicle} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
