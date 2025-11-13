'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vehicle } from '@/types';
import { getVehicleById, getVehiclesForSale } from '@/lib/firestore/vehicles';
import { VehicleGallery } from '@/components/vehicules/VehicleGallery';
import { VehicleSpecs } from '@/components/vehicules/VehicleSpecs';
import { ContactForm } from '@/components/vehicules/ContactForm';
import { VehicleCard } from '@/components/admin/VehicleCard';
import { Button } from '@/components/ui/Button';
import { 
  FiArrowLeft, 
  FiShare2,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiMail
} from 'react-icons/fi';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const vehicleData = await getVehicleById(vehicleId);
      
      if (!vehicleData) {
        alert('Véhicule non trouvé');
        router.push('/vehicules');
        return;
      }

      if (vehicleData.isSold) {
        alert('Ce véhicule a déjà été vendu');
        router.push('/vehicules');
        return;
      }

      setVehicle(vehicleData);
      
      // Load similar vehicles
      loadSimilarVehicles(vehicleData);
    } catch (error) {
      console.error('Error loading vehicle:', error);
      alert('Erreur lors du chargement du véhicule');
      router.push('/vehicules');
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarVehicles = async (currentVehicle: Vehicle) => {
    try {
      const allVehicles = await getVehiclesForSale();
      
      // Filter similar vehicles (same make or similar price range)
      const similar = allVehicles
        .filter(v => v.vehicleId !== currentVehicle.vehicleId)
        .filter(v => {
          // Same make or price within 20% range
          const sameMake = v.make === currentVehicle.make;
          const priceRange = Math.abs(v.price - currentVehicle.price) / currentVehicle.price;
          return sameMake || priceRange <= 0.2;
        })
        .slice(0, 3);
      
      setSimilarVehicles(similar);
    } catch (error) {
      console.error('Error loading similar vehicles:', error);
    }
  };

  const handleShare = (platform?: string) => {
    const url = window.location.href;
    const title = vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year}` : '';
    const text = vehicle ? `Découvrez ce ${title} à ${vehicle.price}€` : '';

    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        '_blank'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
    } else if (navigator.share) {
      // Use Web Share API if available
      navigator.share({
        title: title,
        text: text,
        url: url,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        alert('Lien copié dans le presse-papiers !');
      });
    }
    
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement du véhicule...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  const vehicleName = `${vehicle.make} ${vehicle.model}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/vehicules">
            <Button variant="outline" className="flex items-center gap-2">
              <FiArrowLeft className="w-4 h-4" />
              Retour aux véhicules
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {vehicleName}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {vehicle.year}
            </p>
          </div>
          
          {/* Share Button */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2"
            >
              <FiShare2 className="w-5 h-5" />
              Partager
            </Button>
            
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <FiTwitter className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-900 dark:text-white">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <FiFacebook className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <FiLinkedin className="w-5 h-5 text-blue-700" />
                  <span className="text-gray-900 dark:text-white">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left rounded-b-lg"
                >
                  <FiMail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Email</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gallery and Specs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <VehicleGallery
              images={vehicle.imageUrls}
              alt={vehicleName}
            />
            
            {/* Specs */}
            <VehicleSpecs vehicle={vehicle} />
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ContactForm
                vehicleName={vehicleName}
                vehicleId={vehicle.vehicleId}
              />
            </div>
          </div>
        </div>

        {/* Similar Vehicles Section */}
        {similarVehicles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Véhicules similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarVehicles.map((similarVehicle) => (
                <Link
                  key={similarVehicle.vehicleId}
                  href={`/vehicules/${similarVehicle.vehicleId}`}
                >
                  <VehicleCard vehicle={similarVehicle} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
