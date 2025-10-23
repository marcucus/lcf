import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Appointment, ServiceType, VehicleInfo } from '@/types';

// Create a new appointment with transaction to prevent race conditions
export async function createAppointment(
  userId: string,
  customerName: string,
  serviceType: ServiceType,
  dateTime: Date,
  vehicleInfo: VehicleInfo,
  customerNotes?: string
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const appointmentData = {
      userId,
      customerName,
      serviceType,
      dateTime: Timestamp.fromDate(dateTime),
      vehicleInfo,
      customerNotes: customerNotes || '',
      status: 'confirmed' as const,
      createdAt: Timestamp.now(),
    };

    // Use transaction to ensure no double booking
    const appointmentRef = await runTransaction(db, async (transaction) => {
      // Check if slot is available
      const appointmentsRef = collection(db!, 'appointments');
      const q = query(
        appointmentsRef,
        where('dateTime', '==', Timestamp.fromDate(dateTime)),
        where('status', '==', 'confirmed')
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        throw new Error('Ce créneau horaire n\'est plus disponible');
      }

      // Create the appointment
      const newAppointmentRef = doc(collection(db!, 'appointments'));
      transaction.set(newAppointmentRef, appointmentData);
      
      return newAppointmentRef.id;
    });

    return appointmentRef;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

// Get all appointments for a user
export async function getUserAppointments(userId: string): Promise<Appointment[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('userId', '==', userId),
      orderBy('dateTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      appointmentId: doc.id,
      ...doc.data(),
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting user appointments:', error);
    throw error;
  }
}

// Get all appointments (for admin/agenda manager)
export async function getAllAppointments(): Promise<Appointment[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, orderBy('dateTime', 'asc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      appointmentId: doc.id,
      ...doc.data(),
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting all appointments:', error);
    throw error;
  }
}

// Update appointment
export async function updateAppointment(
  appointmentId: string,
  updates: Partial<Appointment>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, updates);
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
}

// Cancel appointment (with 24h check on client side)
export async function cancelAppointment(appointmentId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'cancelled',
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
}

// Delete appointment (admin only)
export async function deleteAppointment(appointmentId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}

// Check if user can modify appointment (24h rule)
export function canModifyAppointment(appointmentDateTime: Date): boolean {
  const now = new Date();
  const diffInMs = appointmentDateTime.getTime() - now.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  return diffInHours > 24;
}

// Get available time slots for a specific date
export async function getAvailableSlots(date: Date): Promise<string[]> {
  if (!db) return [];
  
  try {
    const allSlots = [
      '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    // Get all appointments for this date
    const appointmentsRef = collection(db, 'appointments');
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      appointmentsRef,
      where('dateTime', '>=', Timestamp.fromDate(startOfDay)),
      where('dateTime', '<=', Timestamp.fromDate(endOfDay)),
      where('status', '==', 'confirmed')
    );

    const snapshot = await getDocs(q);
    const bookedSlots = snapshot.docs.map((doc) => {
      const data = doc.data();
      const dateTime = data.dateTime.toDate();
      return `${dateTime.getHours()}:${dateTime.getMinutes().toString().padStart(2, '0')}`;
    });

    return allSlots.filter((slot) => !bookedSlots.includes(slot));
  } catch (error) {
    console.error('Error getting available slots:', error);
    return [];
  }
}
