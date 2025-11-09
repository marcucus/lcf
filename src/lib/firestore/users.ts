import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  Timestamp,
  setDoc,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, UserRole } from '@/types';

// Get all users with optional pagination
export async function getAllUsers(
  pageSize: number = 20,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ users: User[]; lastDoc: QueryDocumentSnapshot | null }> {
  if (!db) throw new Error('Firebase not configured');

  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, orderBy('createdAt', 'desc'), limit(pageSize));

    if (lastDoc) {
      q = query(usersRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    } as User));
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { users, lastDoc: lastVisible };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// Get a single user by ID
export async function getUserById(userId: string): Promise<User | null> {
  if (!db) throw new Error('Firebase not configured');

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return {
        uid: userDoc.id,
        ...userDoc.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// Create a new user manually (admin only)
// NOTE: This function creates only the Firestore user document.
// In a production environment, this should be implemented as a Cloud Function
// that uses Firebase Admin SDK to:
// 1. Create the Firebase Auth account
// 2. Send a password reset email to the user
// 3. Create the Firestore user document
// For now, this creates a user document that can be linked when the user signs up.
export async function createUser(
  email: string,
  firstName: string,
  lastName: string,
  role: UserRole = 'user'
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  try {
    // Create user document with email as a reference
    // The actual Firebase Auth account should be created via Cloud Function
    const newUser: Omit<User, 'uid'> & { uid?: string } = {
      email,
      firstName,
      lastName,
      role,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'users'), newUser);
    
    // Update the document with its own ID as uid
    await updateDoc(doc(db, 'users', docRef.id), { uid: docRef.id });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user information
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'uid' | 'createdAt'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Update user role specifically
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Delete user account
export async function deleteUser(userId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  try {
    // Note: In production, this should also delete the Firebase Auth account
    // via a Cloud Function using Firebase Admin SDK
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Search users by name or email
export async function searchUsers(searchTerm: string): Promise<User[]> {
  if (!db) throw new Error('Firebase not configured');

  try {
    // Note: Firestore doesn't have full-text search built-in.
    // For production, consider using Algolia or similar service.
    // This is a basic implementation that gets all users and filters client-side.
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const searchLower = searchTerm.toLowerCase();
    const users = snapshot.docs
      .map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      } as User))
      .filter((user) => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

// Get users by role
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  if (!db) throw new Error('Firebase not configured');

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role), orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    } as User));
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
}

// Count total users
export async function countUsers(): Promise<number> {
  if (!db) throw new Error('Firebase not configured');

  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting users:', error);
    throw error;
  }
}
