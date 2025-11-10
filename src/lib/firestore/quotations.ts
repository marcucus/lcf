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
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Quotation, QuotationItem, QuotationStatus } from '@/types';

// Generate a unique quotation number
async function generateQuotationNumber(): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  
  const year = new Date().getFullYear();
  const quotationsRef = collection(db, 'quotations');
  const q = query(
    quotationsRef,
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  let number = 1;
  
  if (!snapshot.empty) {
    const lastQuotation = snapshot.docs[0].data() as Quotation;
    const lastNumber = lastQuotation.quotationNumber;
    const match = lastNumber.match(/DEV-\d{4}-(\d+)/);
    if (match && lastNumber.startsWith(`DEV-${year}`)) {
      number = parseInt(match[1]) + 1;
    }
  }
  
  return `DEV-${year}-${number.toString().padStart(3, '0')}`;
}

// Calculate totals for quotation items
function calculateTotals(items: QuotationItem[]): {
  subtotal: number;
  totalTax: number;
  totalAmount: number;
} {
  let subtotal = 0;
  let totalTax = 0;
  
  items.forEach(item => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemTax = itemTotal * (item.taxRate / 100);
    subtotal += itemTotal;
    totalTax += itemTax;
  });
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalAmount: Math.round((subtotal + totalTax) * 100) / 100,
  };
}

// Create a new quotation
export async function createQuotation(
  createdBy: string,
  clientName: string,
  clientEmail: string,
  items: QuotationItem[],
  options?: {
    userId?: string;
    appointmentId?: string;
    clientPhone?: string;
    clientAddress?: string;
    notes?: string;
    internalNotes?: string;
    validUntil?: Date;
    status?: QuotationStatus;
  }
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotationNumber = await generateQuotationNumber();
    const { subtotal, totalTax, totalAmount } = calculateTotals(items);
    const now = Timestamp.now();
    
    const quotationData = {
      quotationNumber,
      status: options?.status || 'draft',
      userId: options?.userId,
      appointmentId: options?.appointmentId,
      clientName,
      clientEmail,
      clientPhone: options?.clientPhone,
      clientAddress: options?.clientAddress,
      items,
      subtotal,
      totalTax,
      totalAmount,
      notes: options?.notes,
      internalNotes: options?.internalNotes,
      validUntil: options?.validUntil ? Timestamp.fromDate(options.validUntil) : undefined,
      convertedToInvoice: false,
      createdAt: now,
      updatedAt: now,
      createdBy,
    };
    
    const quotationsRef = collection(db, 'quotations');
    const docRef = await addDoc(quotationsRef, quotationData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating quotation:', error);
    throw error;
  }
}

// Get all quotations
export async function getAllQuotations(): Promise<Quotation[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotationsRef = collection(db, 'quotations');
    const q = query(quotationsRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      quotationId: doc.id,
      ...doc.data(),
    })) as Quotation[];
  } catch (error) {
    console.error('Error getting quotations:', error);
    throw error;
  }
}

// Get quotation by ID
export async function getQuotationById(quotationId: string): Promise<Quotation | null> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotationRef = doc(db, 'quotations', quotationId);
    const quotationDoc = await getDoc(quotationRef);
    
    if (!quotationDoc.exists()) {
      return null;
    }
    
    return {
      quotationId: quotationDoc.id,
      ...quotationDoc.data(),
    } as Quotation;
  } catch (error) {
    console.error('Error getting quotation:', error);
    throw error;
  }
}

// Get quotations by user ID
export async function getQuotationsByUserId(userId: string): Promise<Quotation[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotationsRef = collection(db, 'quotations');
    const q = query(
      quotationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      quotationId: doc.id,
      ...doc.data(),
    })) as Quotation[];
  } catch (error) {
    console.error('Error getting quotations by user:', error);
    throw error;
  }
}

// Get quotations by appointment ID
export async function getQuotationsByAppointmentId(appointmentId: string): Promise<Quotation[]> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotationsRef = collection(db, 'quotations');
    const q = query(
      quotationsRef,
      where('appointmentId', '==', appointmentId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      quotationId: doc.id,
      ...doc.data(),
    })) as Quotation[];
  } catch (error) {
    console.error('Error getting quotations by appointment:', error);
    throw error;
  }
}

// Update a quotation
export async function updateQuotation(
  quotationId: string,
  updates: Partial<Omit<Quotation, 'quotationId' | 'quotationNumber' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotationRef = doc(db, 'quotations', quotationId);
    
    // Recalculate totals if items are updated
    if (updates.items) {
      const { subtotal, totalTax, totalAmount } = calculateTotals(updates.items);
      updates.subtotal = subtotal;
      updates.totalTax = totalTax;
      updates.totalAmount = totalAmount;
    }
    
    await updateDoc(quotationRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
}

// Update quotation status
export async function updateQuotationStatus(
  quotationId: string,
  status: QuotationStatus
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotationRef = doc(db, 'quotations', quotationId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };
    
    // Set sentAt timestamp when status changes to 'sent'
    if (status === 'sent') {
      updateData.sentAt = Timestamp.now();
    }
    
    await updateDoc(quotationRef, updateData);
  } catch (error) {
    console.error('Error updating quotation status:', error);
    throw error;
  }
}

// Mark quotation as converted to invoice
export async function markQuotationAsConverted(
  quotationId: string,
  invoiceId: string
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotationRef = doc(db, 'quotations', quotationId);
    await updateDoc(quotationRef, {
      status: 'converted',
      convertedToInvoice: true,
      invoiceId,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking quotation as converted:', error);
    throw error;
  }
}

// Delete a quotation
export async function deleteQuotation(quotationId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  
  try {
    const quotationRef = doc(db, 'quotations', quotationId);
    await deleteDoc(quotationRef);
  } catch (error) {
    console.error('Error deleting quotation:', error);
    throw error;
  }
}
