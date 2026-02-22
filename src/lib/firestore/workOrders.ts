import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { WorkOrder, WorkOrderStatus, Quotation } from '@/types';

/**
 * Create a WorkOrder when a quotation is accepted.
 */
export async function createWorkOrderFromQuotation(
    adminUid: string,
    quotation: Quotation
): Promise<string> {
    if (!db) throw new Error('Firebase not configured');

    const workOrderData: any = {
        quotationId: quotation.quotationId,
        quotationNumber: quotation.quotationNumber,
        clientName: quotation.clientName,
        clientEmail: quotation.clientEmail,
        clientPhone: quotation.clientPhone || null,
        description:
            quotation.notes ||
            `Travaux suite au devis ${quotation.quotationNumber}`,
        items: quotation.items,
        totalAmount: quotation.totalAmount,
        status: 'pending',
        userId: quotation.userId || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: adminUid,
    };

    const ref = collection(db, 'workOrders');
    const docRef = await addDoc(ref, workOrderData);
    return docRef.id;
}

/**
 * Get all work orders (admin view — ordered by creation date desc)
 */
export async function getAllWorkOrders(): Promise<WorkOrder[]> {
    if (!db) throw new Error('Firebase not configured');

    const ref = collection(db, 'workOrders');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
        workOrderId: d.id,
        ...d.data(),
    })) as WorkOrder[];
}

/**
 * Get work orders for a specific user (client view)
 */
export async function getWorkOrdersByUserId(userId: string): Promise<WorkOrder[]> {
    if (!db) throw new Error('Firebase not configured');

    const ref = collection(db, 'workOrders');
    const q = query(ref, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
        workOrderId: d.id,
        ...d.data(),
    })) as WorkOrder[];
}

/**
 * Get a work order by its ID
 */
export async function getWorkOrderById(workOrderId: string): Promise<WorkOrder | null> {
    if (!db) throw new Error('Firebase not configured');

    const ref = doc(db, 'workOrders', workOrderId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return { workOrderId: snap.id, ...snap.data() } as WorkOrder;
}

/**
 * Update the status of a work order.
 * - 'in_progress': records startedAt
 * - 'completed': records completedAt
 */
export async function updateWorkOrderStatus(
    workOrderId: string,
    status: WorkOrderStatus,
    progressNotes?: string
): Promise<void> {
    if (!db) throw new Error('Firebase not configured');

    const ref = doc(db, 'workOrders', workOrderId);
    const updates: Record<string, unknown> = {
        status,
        updatedAt: Timestamp.now(),
        ...(progressNotes !== undefined ? { progressNotes } : {}),
    };

    if (status === 'in_progress') updates.startedAt = Timestamp.now();
    if (status === 'completed') updates.completedAt = Timestamp.now();

    await updateDoc(ref, updates);
}

/**
 * Mark a work order as completed and record whether an invoice was sent.
 */
export async function completeWorkOrder(
    workOrderId: string,
    invoiceSentOnCompletion: boolean,
    invoiceId?: string,
    progressNotes?: string
): Promise<void> {
    if (!db) throw new Error('Firebase not configured');

    const ref = doc(db, 'workOrders', workOrderId);
    await updateDoc(ref, {
        status: 'completed',
        completedAt: Timestamp.now(),
        invoiceSentOnCompletion,
        ...(invoiceId ? { invoiceId } : {}),
        ...(progressNotes !== undefined ? { progressNotes } : {}),
        updatedAt: Timestamp.now(),
    });
}
