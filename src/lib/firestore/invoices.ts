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
  startAfter,
  Query,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Invoice, InvoiceItem, InvoiceStatus, InvoiceOrigin, Appointment, Quote, User } from '@/types';

/**
 * Generate a unique invoice number
 * Format: FACT-YYYY-NNN (e.g., FACT-2024-001)
 */
async function generateInvoiceNumber(): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const year = new Date().getFullYear();
  const prefix = `FACT-${year}-`;

  // Get the last invoice of the current year
  const invoicesRef = collection(db, 'invoices');
  const q = query(
    invoicesRef,
    where('invoiceNumber', '>=', prefix),
    where('invoiceNumber', '<', `FACT-${year + 1}-`),
    orderBy('invoiceNumber', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return `${prefix}001`;
  }

  const lastInvoiceNumber = snapshot.docs[0].data().invoiceNumber as string;
  const lastNumber = parseInt(lastInvoiceNumber.split('-')[2], 10);
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');

  return `${prefix}${newNumber}`;
}

/**
 * Calculate invoice totals from items
 */
function calculateTotals(items: InvoiceItem[]): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  let subtotal = 0;
  let taxAmount = 0;

  items.forEach((item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemTax = itemTotal * (item.taxRate / 100);
    subtotal += itemTotal;
    taxAmount += itemTax;
  });

  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total };
}

/**
 * Create a new invoice manually
 */
export async function createInvoice(
  createdBy: string,
  userId: string,
  customerName: string,
  customerEmail: string,
  items: InvoiceItem[],
  status: InvoiceStatus = 'draft',
  origin: InvoiceOrigin = 'manual',
  customerPhone?: string,
  customerAddress?: string,
  dueDate?: Date,
  notes?: string
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const invoiceNumber = await generateInvoiceNumber();
  const { subtotal, taxAmount, total } = calculateTotals(items);

  const invoiceData: Omit<Invoice, 'invoiceId'> = {
    invoiceNumber,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    taxAmount,
    total,
    status,
    origin,
    dueDate: dueDate ? Timestamp.fromDate(dueDate) : undefined,
    notes,
    createdBy,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const invoicesRef = collection(db, 'invoices');
  const docRef = await addDoc(invoicesRef, invoiceData);

  return docRef.id;
}

/**
 * Create invoice from an appointment
 */
export async function createInvoiceFromAppointment(
  createdBy: string,
  appointment: Appointment,
  items: InvoiceItem[],
  status: InvoiceStatus = 'draft',
  dueDate?: Date,
  notes?: string
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  // Get user details
  const userDoc = await getDoc(doc(db, 'users', appointment.userId));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data() as User;

  const invoiceNumber = await generateInvoiceNumber();
  const { subtotal, taxAmount, total } = calculateTotals(items);

  const invoiceData: Omit<Invoice, 'invoiceId'> = {
    invoiceNumber,
    userId: appointment.userId,
    customerName: appointment.customerName,
    customerEmail: userData.email,
    items,
    subtotal,
    taxAmount,
    total,
    status,
    origin: 'appointment',
    relatedAppointmentId: appointment.appointmentId,
    dueDate: dueDate ? Timestamp.fromDate(dueDate) : undefined,
    notes,
    createdBy,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const invoicesRef = collection(db, 'invoices');
  const docRef = await addDoc(invoicesRef, invoiceData);

  return docRef.id;
}

/**
 * Create invoice from a quote
 */
export async function createInvoiceFromQuote(
  createdBy: string,
  quote: Quote,
  status: InvoiceStatus = 'draft',
  dueDate?: Date
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const invoiceNumber = await generateInvoiceNumber();

  const invoiceData: Omit<Invoice, 'invoiceId'> = {
    invoiceNumber,
    userId: quote.userId,
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    customerPhone: quote.customerPhone,
    customerAddress: quote.customerAddress,
    items: quote.items,
    subtotal: quote.subtotal,
    taxAmount: quote.taxAmount,
    total: quote.total,
    status,
    origin: 'quote',
    relatedQuoteId: quote.quoteId,
    relatedAppointmentId: quote.relatedAppointmentId,
    dueDate: dueDate ? Timestamp.fromDate(dueDate) : undefined,
    notes: quote.notes,
    createdBy,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const invoicesRef = collection(db, 'invoices');
  const docRef = await addDoc(invoicesRef, invoiceData);

  // Update quote with linked invoice
  const quoteRef = doc(db, 'quotes', quote.quoteId);
  await updateDoc(quoteRef, {
    linkedInvoiceId: docRef.id,
    status: 'accepted',
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
}

/**
 * Create invoice for a user (standalone)
 */
export async function createInvoiceFromUser(
  createdBy: string,
  user: User,
  items: InvoiceItem[],
  status: InvoiceStatus = 'draft',
  customerPhone?: string,
  customerAddress?: string,
  dueDate?: Date,
  notes?: string
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const invoiceNumber = await generateInvoiceNumber();
  const { subtotal, taxAmount, total } = calculateTotals(items);

  const invoiceData: Omit<Invoice, 'invoiceId'> = {
    invoiceNumber,
    userId: user.uid,
    customerName: `${user.firstName} ${user.lastName}`,
    customerEmail: user.email,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    taxAmount,
    total,
    status,
    origin: 'user',
    dueDate: dueDate ? Timestamp.fromDate(dueDate) : undefined,
    notes,
    createdBy,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const invoicesRef = collection(db, 'invoices');
  const docRef = await addDoc(invoicesRef, invoiceData);

  return docRef.id;
}

/**
 * Update an invoice
 */
export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Omit<Invoice, 'invoiceId' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  // If items are updated, recalculate totals
  if (updates.items) {
    const { subtotal, taxAmount, total } = calculateTotals(updates.items);
    updates.subtotal = subtotal;
    updates.taxAmount = taxAmount;
    updates.total = total;
  }

  const invoiceRef = doc(db, 'invoices', invoiceId);
  await updateDoc(invoiceRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceAsSent(invoiceId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const invoiceRef = doc(db, 'invoices', invoiceId);
  await updateDoc(invoiceRef, {
    status: 'sent',
    sentAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(invoiceId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const invoiceRef = doc(db, 'invoices', invoiceId);
  await updateDoc(invoiceRef, {
    status: 'paid',
    paidDate: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(invoiceId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const invoiceRef = doc(db, 'invoices', invoiceId);
  await deleteDoc(invoiceRef);
}

/**
 * Get a single invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  if (!db) throw new Error('Firebase not configured');

  const invoiceRef = doc(db, 'invoices', invoiceId);
  const invoiceSnap = await getDoc(invoiceRef);

  if (!invoiceSnap.exists()) {
    return null;
  }

  return {
    invoiceId: invoiceSnap.id,
    ...invoiceSnap.data(),
  } as Invoice;
}

/**
 * Get all invoices with optional filtering
 */
export async function getInvoices(
  filters?: {
    userId?: string;
    status?: InvoiceStatus;
    origin?: InvoiceOrigin;
  },
  limitCount: number = 50,
  lastDoc?: DocumentSnapshot
): Promise<{ invoices: Invoice[]; lastDoc?: DocumentSnapshot }> {
  if (!db) throw new Error('Firebase not configured');

  let q: Query = collection(db, 'invoices');

  // Apply filters
  if (filters?.userId) {
    q = query(q, where('userId', '==', filters.userId));
  }
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters?.origin) {
    q = query(q, where('origin', '==', filters.origin));
  }

  // Order by creation date (newest first)
  q = query(q, orderBy('createdAt', 'desc'));

  // Pagination
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  q = query(q, limit(limitCount));

  const snapshot = await getDocs(q);

  const invoices: Invoice[] = snapshot.docs.map((doc) => ({
    invoiceId: doc.id,
    ...doc.data(),
  } as Invoice));

  return {
    invoices,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
  };
}

/**
 * Get invoices for a specific user
 */
export async function getUserInvoices(userId: string): Promise<Invoice[]> {
  const { invoices } = await getInvoices({ userId });
  return invoices;
}

/**
 * Get invoices by appointment
 */
export async function getInvoicesByAppointment(appointmentId: string): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');

  const invoicesRef = collection(db, 'invoices');
  const q = query(
    invoicesRef,
    where('relatedAppointmentId', '==', appointmentId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    invoiceId: doc.id,
    ...doc.data(),
  } as Invoice));
}

/**
 * Get invoice by quote
 */
export async function getInvoiceByQuote(quoteId: string): Promise<Invoice | null> {
  if (!db) throw new Error('Firebase not configured');

  const invoicesRef = collection(db, 'invoices');
  const q = query(
    invoicesRef,
    where('relatedQuoteId', '==', quoteId),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return {
    invoiceId: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as Invoice;
}

/**
 * Search invoices by invoice number or customer name
 */
export async function searchInvoices(searchTerm: string): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');

  const invoicesRef = collection(db, 'invoices');
  
  // Search by invoice number
  const q1 = query(
    invoicesRef,
    where('invoiceNumber', '>=', searchTerm.toUpperCase()),
    where('invoiceNumber', '<=', searchTerm.toUpperCase() + '\uf8ff'),
    limit(20)
  );

  const snapshot1 = await getDocs(q1);
  const invoicesByNumber = snapshot1.docs.map((doc) => ({
    invoiceId: doc.id,
    ...doc.data(),
  } as Invoice));

  // Search by customer name
  const q2 = query(
    invoicesRef,
    where('customerName', '>=', searchTerm),
    where('customerName', '<=', searchTerm + '\uf8ff'),
    limit(20)
  );

  const snapshot2 = await getDocs(q2);
  const invoicesByName = snapshot2.docs.map((doc) => ({
    invoiceId: doc.id,
    ...doc.data(),
  } as Invoice));

  // Combine and deduplicate results
  const allInvoices = [...invoicesByNumber, ...invoicesByName];
  const uniqueInvoices = Array.from(
    new Map(allInvoices.map((inv) => [inv.invoiceId, inv])).values()
  );

  return uniqueInvoices;
}

/**
 * Get all invoices (for admin purposes)
 */
export async function getAllInvoices(): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');

  const invoicesRef = collection(db, 'invoices');
  const q = query(invoicesRef, orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    invoiceId: doc.id,
    ...doc.data(),
  } as Invoice));
}

/**
 * Get paid invoices within a date range (for fiscal declarations)
 */
export async function getPaidInvoicesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Invoice[]> {
  if (!db) throw new Error('Firebase not configured');

  const invoicesRef = collection(db, 'invoices');
  const q = query(
    invoicesRef,
    where('status', '==', 'paid'),
    where('paidDate', '>=', Timestamp.fromDate(startDate)),
    where('paidDate', '<=', Timestamp.fromDate(endDate)),
    orderBy('paidDate', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    invoiceId: doc.id,
    ...doc.data(),
  } as Invoice));
}
