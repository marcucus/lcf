import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getCountFromServer,
  Timestamp,
  serverTimestamp,
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

// Get count of vehicles for sale (optimized with count aggregation)
export async function getVehiclesForSaleCount(): Promise<number> {
  if (!db) return 0;
  
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(
      vehiclesRef,
      where('isSold', '==', false)
    );
    
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting vehicles count:', error);
    return 0;
  }
}

// Get all vehicles (including sold ones) - Admin only
export async function getAllVehicles(): Promise<Vehicle[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(vehiclesRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      vehicleId: doc.id,
      ...doc.data(),
    })) as Vehicle[];
  } catch (error) {
    console.error('Error getting all vehicles:', error);
    throw error;
  }
}

// Get available vehicles (alias for getVehiclesForSale for consistency)
export async function getAvailableVehicles(): Promise<Vehicle[]> {
  return getVehiclesForSale();
}

// Get vehicle by ID
export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    const snapshot = await getDoc(vehicleRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      vehicleId: snapshot.id,
      ...snapshot.data(),
    } as Vehicle;
  } catch (error) {
    console.error('Error getting vehicle by ID:', error);
    throw error;
  }
}

// Create a new vehicle
export async function createVehicle(
  vehicleData: Omit<Vehicle, 'vehicleId' | 'createdAt'>
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const docRef = await addDoc(vehiclesRef, {
      ...vehicleData,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
}

// Update an existing vehicle
export async function updateVehicle(
  vehicleId: string,
  vehicleData: Partial<Omit<Vehicle, 'vehicleId' | 'createdAt'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    await updateDoc(vehicleRef, vehicleData);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}

// Delete a vehicle
export async function deleteVehicle(vehicleId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    await deleteDoc(vehicleRef);
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}

// Mark vehicle as sold
export async function markVehicleAsSold(vehicleId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    await updateDoc(vehicleRef, {
      isSold: true,
    });
  } catch (error) {
    console.error('Error marking vehicle as sold:', error);
    throw error;
  }
}
