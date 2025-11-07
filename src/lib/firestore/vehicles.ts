import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Vehicle } from '@/types';

// Get all vehicles for sale (not sold)
export async function getVehiclesForSale(): Promise<Vehicle[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(
      vehiclesRef,
      where('isSold', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      vehicleId: doc.id,
      ...doc.data(),
    })) as Vehicle[];
  } catch (error) {
    console.error('Error getting vehicles for sale:', error);
    throw error;
  }
}

// Get count of vehicles for sale
export async function getVehiclesForSaleCount(): Promise<number> {
  if (!db) return 0;
  
  try {
    const vehicles = await getVehiclesForSale();
    return vehicles.length;
  } catch (error) {
    console.error('Error getting vehicles count:', error);
    return 0;
  }
}
