'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import InvoiceForm, { InvoiceFormData } from '@/components/admin/invoices/InvoiceForm';
import { 
  createInvoice, 
  createInvoiceFromAppointment, 
  createInvoiceFromQuote, 
  createInvoiceFromUser 
} from '@/lib/firestore/invoices';
import { getAppointment } from '@/lib/firestore/appointments';
import { getQuote } from '@/lib/firestore/quotes';
import { getUser } from '@/lib/firestore/users';

export default function NewInvoicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  const handleSubmit = async (data: InvoiceFormData) => {
    if (!user) return;

    try {
      setIsLoading(true);
      let invoiceId: string;

      switch (data.origin) {
        case 'appointment':
          if (!data.relatedAppointmentId) {
            throw new Error('Appointment ID is required');
          }
          const appointment = await getAppointment(data.relatedAppointmentId);
          if (!appointment) {
            throw new Error('Appointment not found');
          }
          invoiceId = await createInvoiceFromAppointment(
            user.uid,
            appointment,
            data.items,
            data.status,
            data.dueDate,
            data.notes
          );
          break;

        case 'quote':
          if (!data.relatedQuoteId) {
            throw new Error('Quote ID is required');
          }
          const quote = await getQuote(data.relatedQuoteId);
          if (!quote) {
            throw new Error('Quote not found');
          }
          invoiceId = await createInvoiceFromQuote(
            user.uid,
            quote,
            data.status,
            data.dueDate
          );
          break;

        case 'user':
          const userData = await getUser(data.userId);
          if (!userData) {
            throw new Error('User not found');
          }
          invoiceId = await createInvoiceFromUser(
            user.uid,
            userData,
            data.items,
            data.status,
            data.customerPhone,
            data.customerAddress,
            data.dueDate,
            data.notes
          );
          break;

        case 'manual':
        default:
          invoiceId = await createInvoice(
            user.uid,
            data.userId,
            data.customerName,
            data.customerEmail,
            data.items,
            data.status,
            'manual',
            data.customerPhone,
            data.customerAddress,
            data.dueDate,
            data.notes
          );
          break;
      }

      alert('Facture créée avec succès !');
      router.push(`/admin/factures/${invoiceId}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Erreur lors de la création de la facture: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/factures');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Nouvelle Facture
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Créez une nouvelle facture pour un client
        </p>
      </div>

      <InvoiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
