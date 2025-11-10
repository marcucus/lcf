import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { VehicleInfo } from '@/types';

/**
 * Récupère tous les véhicules d'un utilisateur
 */
export async function getUserVehicles(userId: string): Promise<VehicleInfo[]> {
  if (!db) return [];
  
  try {
    const vehiclesRef = collection(db, 'userVehicles');
    const q = query(vehiclesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      vehicleId: doc.id,
      ...doc.data(),
    })) as VehicleInfo[];
  } catch (error) {
    console.error('Error getting user vehicles:', error);
    return [];
  }
}

/**
 * Cherche un véhicule par plaque dans les véhicules de l'utilisateur
 */
export async function findVehicleByPlate(
  userId: string,
  plate: string
): Promise<VehicleInfo | null> {
  if (!db) return null;
  
  try {
    const vehiclesRef = collection(db, 'userVehicles');
    const q = query(
      vehiclesRef,
      where('userId', '==', userId),
      where('plate', '==', plate.toUpperCase())
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { vehicleId: doc.id, ...doc.data() } as VehicleInfo;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding vehicle by plate:', error);
    return null;
  }
}

/**
 * Ajoute un nouveau véhicule pour un utilisateur
 */
export async function saveUserVehicle(
  userId: string,
  vehicleData: {
    plate: string;
    make: string;
    model: string;
    year?: number;
    color?: string;
  }
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehiclesRef = collection(db, 'userVehicles');
    
    // Vérifier si le véhicule existe déjà
    const existing = await findVehicleByPlate(userId, vehicleData.plate);
    if (existing) {
      return existing.vehicleId as string;
    }
    
    // Préparer les données en filtrant les valeurs undefined
    const vehicleDoc: any = {
      userId,
      plate: vehicleData.plate.toUpperCase(),
      make: vehicleData.make,
      model: vehicleData.model,
      createdAt: Timestamp.now(),
      lastUsed: Timestamp.now(),
    };
    
    // Ajouter les champs optionnels seulement s'ils sont définis
    if (vehicleData.year !== undefined) {
      vehicleDoc.year = vehicleData.year;
    }
    if (vehicleData.color !== undefined && vehicleData.color !== '') {
      vehicleDoc.color = vehicleData.color;
    }
    
    // Créer le nouveau véhicule
    const docRef = await addDoc(vehiclesRef, vehicleDoc);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving user vehicle:', error);
    throw error;
  }
}

/**
 * Met à jour un véhicule existant
 */
export async function updateUserVehicle(
  vehicleId: string,
  updates: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
  }
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehicleRef = doc(db, 'userVehicles', vehicleId);
    
    // Filtrer les valeurs undefined
    const updateData: any = {
      lastUsed: Timestamp.now(),
    };
    
    if (updates.make !== undefined) {
      updateData.make = updates.make;
    }
    if (updates.model !== undefined) {
      updateData.model = updates.model;
    }
    if (updates.year !== undefined) {
      updateData.year = updates.year;
    }
    if (updates.color !== undefined && updates.color !== '') {
      updateData.color = updates.color;
    }
    
    await updateDoc(vehicleRef, updateData);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}

/**
 * Supprime un véhicule
 */
export async function deleteUserVehicle(vehicleId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const vehicleRef = doc(db, 'userVehicles', vehicleId);
    await deleteDoc(vehicleRef);
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}
