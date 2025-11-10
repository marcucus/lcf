import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Invoice, InvoiceItem, InvoiceStatus, PaymentMethod } from '@/types';

// Generate next invoice number
export async function generateInvoiceNumber(): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(invoicesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const year = new Date().getFullYear();
    
    if (snapshot.empty) {
      return `FAC-${year}-001`;
    }
    
    // Get the last invoice number
    const lastInvoice = snapshot.docs[0].data();
    const lastNumber = lastInvoice.invoiceNumber;
    
    // Extract number from format FAC-YYYY-NNN
    const match = lastNumber.match(/FAC-(\d{4})-(\d{3})/);
    if (match) {
      const lastYear = parseInt(match[1]);
      const lastSequence = parseInt(match[2]);
      
      // Reset sequence if new year
      if (lastYear < year) {
        return `FAC-${year}-001`;
      }
      
      // Increment sequence
      const newSequence = (lastSequence + 1).toString().padStart(3, '0');
      return `FAC-${year}-${newSequence}`;
    }
    
    // Fallback
    return `FAC-${year}-001`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
}

// Create a new invoice
export async function createInvoice(
  userId: string,
  customerName: string,
  items: InvoiceItem[],
  createdBy: string,
  options?: {
    customerEmail?: string;
    customerAddress?: string;
    appointmentId?: string;
    dueDate?: Date;
    paymentDate?: Date;
    status?: InvoiceStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    attachmentUrls?: string[];
  }
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    // Calculate totals
    const totalHT = items.reduce((sum, item) => sum + item.totalHT, 0);
    const totalTVA = items.reduce((sum, item) => sum + (item.totalTTC - item.totalHT), 0);
    const totalTTC = items.reduce((sum, item) => sum + item.totalTTC, 0);
    
    const invoiceNumber = await generateInvoiceNumber();
    
    const invoiceData = {
      invoiceNumber,
      userId,
      customerName,
      customerEmail: options?.customerEmail || '',
      customerAddress: options?.customerAddress || '',
      appointmentId: options?.appointmentId || '',
      issueDate: Timestamp.now(),
      dueDate: options?.dueDate ? Timestamp.fromDate(options.dueDate) : null,
      paymentDate: options?.paymentDate ? Timestamp.fromDate(options.paymentDate) : null,
      status: options?.status || 'pending',
      paymentMethod: options?.paymentMethod || null,
      items,
      totalHT,
      totalTVA,
      totalTTC,
      notes: options?.notes || '',
      attachmentUrls: options?.attachmentUrls || [],
      createdAt: Timestamp.now(),
      createdBy,
    };
    
    const invoicesRef = collection(db, 'invoices');
    const docRef = await addDoc(invoicesRef, invoiceData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

// Get invoice by ID
export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    
    if (!invoiceSnap.exists()) {
      return null;
    }
    
    return {
      invoiceId: invoiceSnap.id,
      ...invoiceSnap.data(),
    } as Invoice;
  } catch (error) {
    console.error('Error getting invoice:', error);
    throw error;
  }
}

// Get all invoices
export async function getAllInvoices(): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(invoicesRef, orderBy('issueDate', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      invoiceId: doc.id,
      ...doc.data(),
    })) as Invoice[];
  } catch (error) {
    console.error('Error getting all invoices:', error);
    throw error;
  }
}

// Get invoices for a specific user
export async function getUserInvoices(userId: string): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(
      invoicesRef,
      where('userId', '==', userId),
      orderBy('issueDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      invoiceId: doc.id,
      ...doc.data(),
    })) as Invoice[];
  } catch (error) {
    console.error('Error getting user invoices:', error);
    throw error;
  }
}

// Get invoices within a date range
export async function getInvoicesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(
      invoicesRef,
      where('issueDate', '>=', Timestamp.fromDate(startDate)),
      where('issueDate', '<=', Timestamp.fromDate(endDate)),
      orderBy('issueDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      invoiceId: doc.id,
      ...doc.data(),
    })) as Invoice[];
  } catch (error) {
    console.error('Error getting invoices by date range:', error);
    throw error;
  }
}

// Get paid invoices within a date range (for fiscal declaration)
export async function getPaidInvoicesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(
      invoicesRef,
      where('status', '==', 'paid'),
      where('paymentDate', '>=', Timestamp.fromDate(startDate)),
      where('paymentDate', '<=', Timestamp.fromDate(endDate)),
      orderBy('paymentDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      invoiceId: doc.id,
      ...doc.data(),
    })) as Invoice[];
  } catch (error) {
    console.error('Error getting paid invoices by date range:', error);
    throw error;
  }
}

// Update invoice
export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Invoice>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
}

// Mark invoice as paid
export async function markInvoiceAsPaid(
  invoiceId: string,
  paymentDate: Date,
  paymentMethod: PaymentMethod
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceRef, {
      status: 'paid',
      paymentDate: Timestamp.fromDate(paymentDate),
      paymentMethod,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    throw error;
  }
}

// Delete invoice
export async function deleteInvoice(invoiceId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await deleteDoc(invoiceRef);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

// Calculate total revenue for a period
export async function calculateRevenue(
  startDate: Date,
  endDate: Date
): Promise<number> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const invoices = await getPaidInvoicesByDateRange(startDate, endDate);
    return invoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);
  } catch (error) {
    console.error('Error calculating revenue:', error);
    throw error;
  }
}
