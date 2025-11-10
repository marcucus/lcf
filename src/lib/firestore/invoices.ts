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
import { Invoice } from '@/types';

// Get all invoices
export async function getAllInvoices(): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(invoicesRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      invoiceId: doc.id,
      ...doc.data(),
    })) as Invoice[];
  } catch (error) {
    console.error('Error getting invoices:', error);
    throw error;
  }
}

// Get invoices by user ID
export async function getInvoicesByUserId(userId: string): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(
      invoicesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      invoiceId: doc.id,
      ...doc.data(),
    })) as Invoice[];
  } catch (error) {
    console.error('Error getting invoices by user:', error);
    throw error;
  }
}

// Get single invoice by ID
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoiceDoc = await getDoc(doc(db, 'invoices', invoiceId));
    if (!invoiceDoc.exists()) return null;
    
    return {
      invoiceId: invoiceDoc.id,
      ...invoiceDoc.data(),
    } as Invoice;
  } catch (error) {
    console.error('Error getting invoice:', error);
    throw error;
  }
}

// Generate unique invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const invoicesRef = collection(db!, 'invoices');
  const q = query(invoicesRef);
  const snapshot = await getDocs(q);
  const count = snapshot.size + 1;
  return `FACT-${year}-${count.toString().padStart(5, '0')}`;
}

// Create new invoice
export async function createInvoice(
  invoiceData: Omit<Invoice, 'invoiceId' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoiceNumber = await generateInvoiceNumber();
    const docRef = await addDoc(collection(db, 'invoices'), {
      ...invoiceData,
      invoiceNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

// Update invoice
export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Omit<Invoice, 'invoiceId' | 'createdAt' | 'invoiceNumber'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
}

// Delete invoice
export async function deleteInvoice(invoiceId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    await deleteDoc(doc(db, 'invoices', invoiceId));
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

// Mark invoice as sent
export async function markInvoiceAsSent(invoiceId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceRef, {
      status: 'sent',
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking invoice as sent:', error);
    throw error;
  }
}

// Mark invoice as paid
export async function markInvoiceAsPaid(invoiceId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceRef, {
      status: 'paid',
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    throw error;
  }
}
