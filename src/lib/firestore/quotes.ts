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
import { Quote, InvoiceItem, QuoteStatus, User } from '@/types';

/**
 * Generate a unique quote number
 * Format: DEV-YYYY-NNN (e.g., DEV-2024-001)
 */
async function generateQuoteNumber(): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const year = new Date().getFullYear();
  const prefix = `DEV-${year}-`;

  // Get the last quote of the current year
  const quotesRef = collection(db, 'quotes');
  const q = query(
    quotesRef,
    where('quoteNumber', '>=', prefix),
    where('quoteNumber', '<', `DEV-${year + 1}-`),
    orderBy('quoteNumber', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return `${prefix}001`;
  }

  const lastQuoteNumber = snapshot.docs[0].data().quoteNumber as string;
  const lastNumber = parseInt(lastQuoteNumber.split('-')[2], 10);
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');

  return `${prefix}${newNumber}`;
}

/**
 * Calculate quote totals from items
 */
function calculateTotals(items: InvoiceItem[]): {
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
} {
  let subtotal = 0;
  let taxAmount = 0;
  let totalTaxRate = 0;

  items.forEach((item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemTax = itemTotal * (item.taxRate / 100);
    subtotal += itemTotal;
    taxAmount += itemTax;
    totalTaxRate += item.taxRate;
  });

  // Calculate average tax rate
  const taxRate = items.length > 0 ? totalTaxRate / items.length / 100 : 0.20;
  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total, taxRate };
}

/**
 * Create a new quote
 */
export async function createQuote(
  createdBy: string,
  userId: string,
  customerName: string,
  customerEmail: string,
  items: InvoiceItem[],
  status: QuoteStatus = 'draft',
  customerPhone?: string,
  customerAddress?: string,
  validUntil?: Date,
  notes?: string,
  relatedAppointmentId?: string
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const quoteNumber = await generateQuoteNumber();
  const { subtotal, taxAmount, total, taxRate } = calculateTotals(items);

  // Default validUntil to 30 days from now if not provided
  const validUntilDate = validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const quoteData: Omit<Quote, 'quoteId'> = {
    quoteNumber,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    status,
    validUntil: Timestamp.fromDate(validUntilDate),
    notes,
    relatedAppointmentId,
    createdBy,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const quotesRef = collection(db, 'quotes');
  const docRef = await addDoc(quotesRef, quoteData);

  return docRef.id;
}

/**
 * Create quote from a user
 */
export async function createQuoteFromUser(
  createdBy: string,
  user: User,
  items: InvoiceItem[],
  status: QuoteStatus = 'draft',
  customerPhone?: string,
  customerAddress?: string,
  validUntil?: Date,
  notes?: string
): Promise<string> {
  return createQuote(
    createdBy,
    user.uid,
    `${user.firstName} ${user.lastName}`,
    user.email,
    items,
    status,
    customerPhone,
    customerAddress,
    validUntil,
    notes
  );
}

/**
 * Update a quote
 */
export async function updateQuote(
  quoteId: string,
  updates: Partial<Omit<Quote, 'quoteId' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  // If items are updated, recalculate totals
  if (updates.items) {
    const { subtotal, taxAmount, total, taxRate } = calculateTotals(updates.items);
    updates.subtotal = subtotal;
    updates.taxRate = taxRate;
    updates.taxAmount = taxAmount;
    updates.total = total;
  }

  const quoteRef = doc(db, 'quotes', quoteId);
  await updateDoc(quoteRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a quote
 */
export async function deleteQuote(quoteId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const quoteRef = doc(db, 'quotes', quoteId);
  await deleteDoc(quoteRef);
}

/**
 * Get a single quote by ID
 */
export async function getQuote(quoteId: string): Promise<Quote | null> {
  if (!db) throw new Error('Firebase not configured');

  const quoteRef = doc(db, 'quotes', quoteId);
  const quoteSnap = await getDoc(quoteRef);

  if (!quoteSnap.exists()) {
    return null;
  }

  return {
    quoteId: quoteSnap.id,
    ...quoteSnap.data(),
  } as Quote;
}

/**
 * Get a single quote by ID
 */
export async function getQuoteById(quoteId: string): Promise<Quote | null> {
  if (!db) throw new Error('Firebase not configured');

  const quoteRef = doc(db, 'quotes', quoteId);
  const quoteSnap = await getDoc(quoteRef);

  if (!quoteSnap.exists()) {
    return null;
  }

  return {
    quoteId: quoteSnap.id,
    ...quoteSnap.data(),
  } as Quote;
}

/**
 * Get all quotes with optional filtering
 */
export async function getQuotes(
  filters?: {
    userId?: string;
    status?: QuoteStatus;
  },
  limitCount: number = 50,
  lastDoc?: DocumentSnapshot
): Promise<{ quotes: Quote[]; lastDoc?: DocumentSnapshot }> {
  if (!db) throw new Error('Firebase not configured');

  let q: Query = collection(db, 'quotes');

  // Apply filters
  if (filters?.userId) {
    q = query(q, where('userId', '==', filters.userId));
  }
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  // Order by creation date (newest first)
  q = query(q, orderBy('createdAt', 'desc'));

  // Pagination
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  q = query(q, limit(limitCount));

  const snapshot = await getDocs(q);

  const quotes: Quote[] = snapshot.docs.map((doc) => ({
    quoteId: doc.id,
    ...doc.data(),
  } as Quote));

  return {
    quotes,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
  };
}

/**
 * Get quotes for a specific user
 */
export async function getUserQuotes(userId: string): Promise<Quote[]> {
  const { quotes } = await getQuotes({ userId });
  return quotes;
}

/**
 * Get quotes by appointment
 */
export async function getQuotesByAppointment(appointmentId: string): Promise<Quote[]> {
  if (!db) throw new Error('Firebase not configured');

  const quotesRef = collection(db, 'quotes');
  const q = query(
    quotesRef,
    where('relatedAppointmentId', '==', appointmentId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    quoteId: doc.id,
    ...doc.data(),
  } as Quote));
}

/**
 * Search quotes by quote number or customer name
 */
export async function searchQuotes(searchTerm: string): Promise<Quote[]> {
  if (!db) throw new Error('Firebase not configured');

  const quotesRef = collection(db, 'quotes');
  
  // Search by quote number
  const q1 = query(
    quotesRef,
    where('quoteNumber', '>=', searchTerm.toUpperCase()),
    where('quoteNumber', '<=', searchTerm.toUpperCase() + '\uf8ff'),
    limit(20)
  );

  const snapshot1 = await getDocs(q1);
  const quotesByNumber = snapshot1.docs.map((doc) => ({
    quoteId: doc.id,
    ...doc.data(),
  } as Quote));

  // Search by customer name
  const q2 = query(
    quotesRef,
    where('customerName', '>=', searchTerm),
    where('customerName', '<=', searchTerm + '\uf8ff'),
    limit(20)
  );

  const snapshot2 = await getDocs(q2);
  const quotesByName = snapshot2.docs.map((doc) => ({
    quoteId: doc.id,
    ...doc.data(),
  } as Quote));

  // Combine and deduplicate results
  const allQuotes = [...quotesByNumber, ...quotesByName];
  const uniqueQuotes = Array.from(
    new Map(allQuotes.map((quote) => [quote.quoteId, quote])).values()
  );

  return uniqueQuotes;
}

/**
 * Link a quote to an invoice
 */
export async function linkQuoteToInvoice(
  quoteId: string,
  invoiceId: string
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const quoteRef = doc(db, 'quotes', quoteId);
  await updateDoc(quoteRef, {
    linkedInvoiceId: invoiceId,
    status: 'accepted',
    updatedAt: Timestamp.now(),
  });
}
