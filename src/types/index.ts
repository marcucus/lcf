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
  loyaltyPoints?: number;
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

// Loyalty program types
export type LoyaltyTransactionType = 
  | 'appointment_completed'
  | 'manual_adjustment'
  | 'reward_redemption'
  | 'bonus';

export interface LoyaltyTransaction {
  transactionId: string;
  userId: string;
  type: LoyaltyTransactionType;
  points: number; // Positive for earning, negative for spending
  description: string;
  relatedAppointmentId?: string;
  relatedRewardId?: string;
  createdAt: Timestamp;
  createdBy?: string; // For admin adjustments
}

export type RewardCategory = 'discount' | 'service' | 'product' | 'special';

export interface Reward {
  rewardId: string;
  name: string;
  description: string;
  category: RewardCategory;
  pointsCost: number;
  imageUrl?: string;
  isActive: boolean;
  stock?: number; // Optional, for limited rewards
  validUntil?: Timestamp;
  createdAt: Timestamp;
}

export interface UserReward {
  userRewardId: string;
  userId: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  status: 'available' | 'used' | 'expired';
  claimedAt: Timestamp;
  usedAt?: Timestamp;
  expiresAt?: Timestamp;
}

export interface LoyaltySettings {
  pointsPerAppointment: number;
  pointsPerEuroSpent?: number;
  welcomeBonusPoints?: number;
  birthdayBonusPoints?: number;
  referralBonusPoints?: number;
  minPointsForRedemption: number;
}
