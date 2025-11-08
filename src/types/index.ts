import { Timestamp } from 'firebase/firestore';

// User roles
export type UserRole = 'user' | 'agendaManager' | 'admin';

// User interface
export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Timestamp;
  fcmToken?: string;
  notificationPreferences?: NotificationPreferences;
}

// Notification preferences
export interface NotificationPreferences {
  appointmentReminders: boolean;
  newVehicles: boolean;
  generalUpdates: boolean;
}

// Service types
export type ServiceType = 'entretien' | 'reparation' | 'reprogrammation';

// Appointment status
export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled';

// Vehicle information
export interface VehicleInfo {
  make: string;
  model: string;
  plate: string;
}

// Appointment interface
export interface Appointment {
  appointmentId: string;
  userId: string;
  customerName: string;
  serviceType: ServiceType;
  dateTime: Timestamp;
  vehicleInfo: VehicleInfo;
  customerNotes?: string;
  status: AppointmentStatus;
  createdAt: Timestamp;
}

// Fuel types
export type FuelType = 'essence' | 'diesel' | 'electrique' | 'hybride';

// Vehicle for sale interface
export interface Vehicle {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: FuelType;
  description: string;
  imageUrls: string[];
  isSold: boolean;
  createdAt: Timestamp;
}

// Google Review interface
export interface GoogleReview {
  reviewId: string;
  starRating: number;
  comment: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

// Response template interface
export interface ResponseTemplate {
  templateId: string;
  name: string;
  content: string;
  createdAt: Timestamp;
}

// Auth context interface
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
