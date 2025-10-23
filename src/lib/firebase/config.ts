import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBkAmBzmAULbl06AUbzgR3JjwCvJYNQxWo",
    authDomain: "projectcar-2ee73.firebaseapp.com",
    projectId: "projectcar-2ee73",
    storageBucket: "projectcar-2ee73.appspot.com",
    messagingSenderId: "3841353320",
    appId: "1:3841353320:web:2b747e27860c14834dfddd",
    measurementId: "G-XZEGYK3H08"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== 'undefined') {
  // Client-side initialization
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
