import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import serviceAccount from "./projectcar-2ee73-firebase-adminsdk-703pj-0e04f54092.json";

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

if (getApps().length === 0) {
  try {
    adminApp = initializeApp({
      credential: cert(serviceAccount as any),
    });
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else {
  adminApp = getApps()[0];
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
}

export { adminApp, adminDb, adminAuth };
