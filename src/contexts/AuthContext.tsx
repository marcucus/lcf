'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User, AuthContextType, UserRole } from '@/types';
import { awardWelcomeBonus } from '@/lib/firestore/loyalty';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      console.warn('Firebase not configured, skipping authentication');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    if (!db) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      } else {
        // If user document doesn't exist, create a basic one
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: '',
          lastName: '',
          role: 'user' as UserRole,
          createdAt: Timestamp.now(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    if (!auth || !db) throw new Error('Firebase not configured');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: User = {
      uid: userCredential.user.uid,
      email,
      firstName,
      lastName,
      role: 'user',
      loyaltyPoints: 0,
      createdAt: Timestamp.now(),
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    
    // Award welcome bonus
    try {
      await awardWelcomeBonus(userCredential.user.uid);
    } catch (error) {
      console.error('Error awarding welcome bonus:', error);
    }
    
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!auth || !db) throw new Error('Firebase not configured');
    
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      // Create new user document
      const displayName = userCredential.user.displayName || '';
      const [firstName, ...lastNameParts] = displayName.split(' ');
      const newUser: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        role: 'user',
        loyaltyPoints: 0,
        createdAt: Timestamp.now(),
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      // Award welcome bonus
      try {
        await awardWelcomeBonus(userCredential.user.uid);
      } catch (error) {
        console.error('Error awarding welcome bonus:', error);
      }
      
      setUser(newUser);
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase not configured');
    await firebaseSignOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase not configured');
    await sendPasswordResetEmail(auth, email);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
