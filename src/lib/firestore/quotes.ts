import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Quote } from '@/types';

// Get all quotes
export async function getAllQuotes(): Promise<Quote[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotesRef = collection(db, 'quotes');
    const q = query(quotesRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      quoteId: doc.id,
      ...doc.data(),
    })) as Quote[];
  } catch (error) {
    console.error('Error getting quotes:', error);
    throw error;
  }
}

// Get quotes by user ID
export async function getQuotesByUserId(userId: string): Promise<Quote[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotesRef = collection(db, 'quotes');
    const q = query(
      quotesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      quoteId: doc.id,
      ...doc.data(),
    })) as Quote[];
  } catch (error) {
    console.error('Error getting quotes by user:', error);
    throw error;
  }
}

// Get single quote by ID
export async function getQuoteById(quoteId: string): Promise<Quote | null> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quoteDoc = await getDoc(doc(db, 'quotes', quoteId));
    if (!quoteDoc.exists()) return null;
    
    return {
      quoteId: quoteDoc.id,
      ...quoteDoc.data(),
    } as Quote;
  } catch (error) {
    console.error('Error getting quote:', error);
    throw error;
  }
}

// Generate unique quote number
async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const quotesRef = collection(db!, 'quotes');
  const q = query(quotesRef);
  const snapshot = await getDocs(q);
  const count = snapshot.size + 1;
  return `DEV-${year}-${count.toString().padStart(5, '0')}`;
}

// Create new quote
export async function createQuote(
  quoteData: Omit<Quote, 'quoteId' | 'createdAt' | 'updatedAt' | 'quoteNumber'>
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quoteNumber = await generateQuoteNumber();
    const docRef = await addDoc(collection(db, 'quotes'), {
      ...quoteData,
      quoteNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
}

// Update quote
export async function updateQuote(
  quoteId: string,
  updates: Partial<Omit<Quote, 'quoteId' | 'createdAt' | 'quoteNumber'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quoteRef = doc(db, 'quotes', quoteId);
    await updateDoc(quoteRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    throw error;
  }
}

// Delete quote
export async function deleteQuote(quoteId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    await deleteDoc(doc(db, 'quotes', quoteId));
  } catch (error) {
    console.error('Error deleting quote:', error);
    throw error;
  }
}

// Mark quote as sent
export async function markQuoteAsSent(quoteId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quoteRef = doc(db, 'quotes', quoteId);
    await updateDoc(quoteRef, {
      status: 'sent',
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking quote as sent:', error);
    throw error;
  }
}
