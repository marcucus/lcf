import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Validate environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required environment variables are present
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);

if (missingVars.length > 0) {
  const errorMessage = `Missing Firebase environment variables: ${missingVars.join(', ')}\n\nPlease:\n1. Copy .env.example to .env.local\n2. Fill in your Firebase configuration values\n3. Get them from: https://console.firebase.google.com`;
  
  // In development, show a helpful error
  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Firebase Configuration Error:', errorMessage);
  }
  
  // During build time, we'll create a mock config to prevent build failures
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️  Firebase environment variables not configured. Using placeholder values for build.');
  }
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || 'placeholder-api-key',
  authDomain: requiredEnvVars.authDomain || 'placeholder.firebaseapp.com',
  projectId: requiredEnvVars.projectId || 'placeholder-project',
  storageBucket: requiredEnvVars.storageBucket || 'placeholder.appspot.com',
  messagingSenderId: requiredEnvVars.messagingSenderId || '123456789',
  appId: requiredEnvVars.appId || 'placeholder-app-id',
};

// Initialize Firebase only if we have real configuration
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Check if we have real Firebase configuration (not placeholders)
const hasRealConfig = missingVars.length === 0;

if (hasRealConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.warn('⚠️  Firebase not configured - running in offline mode with sample data');
}

export { auth, db, storage };
export default app;