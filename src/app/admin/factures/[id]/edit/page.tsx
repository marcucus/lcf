'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import InvoiceForm, { InvoiceFormData } from '@/components/admin/invoices/InvoiceForm';
import { getInvoice, updateInvoice } from '@/lib/firestore/invoices';
import { Invoice } from '@/types';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const invoiceId = params.id as string;

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }

    loadInvoice();
  }, [user, invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await getInvoice(invoiceId);
      if (!data) {
        alert('Facture non trouvée');
        router.push('/admin/factures');
        return;
      }
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Erreur lors du chargement de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      setIsSubmitting(true);
      
      await updateInvoice(invoiceId, {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        items: data.items,
        status: data.status,
        dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : undefined,
        notes: data.notes,
      });

      alert('Facture mise à jour avec succès !');
      router.push(`/admin/factures/${invoiceId}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Erreur lors de la mise à jour de la facture: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/factures/${invoiceId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1CCEFF] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!invoice || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Modifier la Facture {invoice.invoiceNumber}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modifiez les informations de la facture
        </p>
      </div>

      <InvoiceForm
        initialData={invoice}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
}
