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
  newAppointments?: boolean; // For admin/agendaManager to receive notifications of new appointments
}

// Service types
export type ServiceType = 'entretien' | 'reparation' | 'reprogrammation';

// Appointment status
export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled';

// Vehicle information
export interface VehicleInfo {
  vehicleId?: string;
  userId?: string;
  make: string;
  model: string;
  plate: string;
  year?: number;
  color?: string;
  createdAt?: Timestamp;
  lastUsed?: Timestamp;
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
  amount?: number; // Revenue amount for this appointment in euros
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

// Response template categories
export type TemplateCategory = 'positif' | 'negatif' | 'neutre';

// Response template interface
export interface ResponseTemplate {
  templateId: string;
  name: string;
  content: string;
  category: TemplateCategory;
  createdAt: Timestamp;
}

// Google OAuth configuration interface
export interface GoogleOAuthConfig {
  configId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Timestamp;
  accountId?: string; // Google Business Profile account ID
  locationId?: string; // Google Business Profile location ID
  isConnected: boolean;
  lastSync?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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

// Invoice and Quote types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';
export type InvoiceOrigin = 'appointment' | 'quote' | 'user' | 'manual';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface InvoiceItem {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // Percentage (e.g., 20 for 20%)
  total: number; // quantity * unitPrice
  totalWithTax: number; // total * (1 + taxRate/100)
}

export interface Quote {
  quoteId: string;
  quoteNumber: string; // Human-readable quote number (e.g., "DEV-2024-001")
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number; // Sum of all item totals
  taxRate: number; // Tax rate in decimal (e.g., 0.20 for 20%)
  taxAmount: number; // Sum of all taxes
  total: number; // Subtotal + taxAmount
  status: QuoteStatus;
  validUntil: Timestamp;
  notes?: string;
  relatedAppointmentId?: string;
  createdBy: string; // Admin UID who created the quote
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sentAt?: Timestamp; // When the quote was sent by email
  linkedInvoiceId?: string; // If converted to invoice
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string; // Human-readable invoice number (e.g., "FACT-2024-001")
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number; // Sum of all item totals
  taxAmount: number; // Sum of all taxes
  total: number; // Subtotal + taxAmount
  status: InvoiceStatus;
  origin: InvoiceOrigin;
  relatedAppointmentId?: string; // If created from appointment
  relatedQuoteId?: string; // If created from quote
  dueDate?: Timestamp;
  paidDate?: Timestamp;
  notes?: string;
  createdBy: string; // Admin UID who created the invoice
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sentAt?: Timestamp; // When the invoice was sent by email
}
