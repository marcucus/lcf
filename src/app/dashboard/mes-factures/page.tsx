'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getUserInvoices } from '@/lib/firestore/invoices';
import { Invoice, InvoiceStatus } from '@/types';
import { FiFileText, FiDownload, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
    draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    sent: { label: 'Envoyée', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    paid: { label: 'Payée', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    overdue: { label: 'En retard', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

function MesFacturesContent() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        loadInvoices();
    }, [user]);

    const loadInvoices = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getUserInvoices(user.uid);
            setInvoices(data);
        } catch (err) {
            console.error('Error loading invoices:', err);
            setError('Erreur lors du chargement de vos factures');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '—';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getStatusBadge = (status: InvoiceStatus) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const totalPending = invoices.filter((i) => ['sent', 'draft'].includes(i.status)).reduce((s, i) => s + i.total, 0);

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Mes Factures</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Historique de vos factures LCF Auto Performance
                </p>
            </div>

            {/* KPIs */}
            {!loading && invoices.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total factures</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{invoices.length}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <FiCheckCircle className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-700 dark:text-green-400">Payées</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{totalPaid.toFixed(2)} €</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <FiClock className="w-4 h-4 text-orange-600" />
                            <p className="text-sm text-orange-700 dark:text-orange-400">En attente</p>
                        </div>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{totalPending.toFixed(2)} €</p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {!loading && !error && invoices.length === 0 && (
                <div className="text-center py-16">
                    <FiFileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucune facture</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Vos factures apparaîtront ici une fois vos prestations réalisées.
                    </p>
                </div>
            )}

            {!loading && invoices.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">N° Facture</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prestations</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Montant</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                                    {invoices.some((i) => i.dueDate) && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Échéance</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {invoices.map((invoice) => (
                                    <tr
                                        key={invoice.invoiceId}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                                {invoice.invoiceNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(invoice.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                                            {invoice.items.length > 0 ? (
                                                <span className="truncate block">
                                                    {invoice.items[0].description}
                                                    {invoice.items.length > 1 && ` + ${invoice.items.length - 1} autre(s)`}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                {invoice.total.toFixed(2)} €
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getStatusBadge(invoice.status)}
                                        </td>
                                        {invoices.some((i) => i.dueDate) && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Info */}
            {!loading && invoices.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-start gap-3">
                        <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Pour toute question sur vos factures, contactez-nous au{' '}
                            <strong>07 61 88 82 63</strong> ou à{' '}
                            <a href="mailto:lcfautoperformance@outlook.fr" className="underline">
                                lcfautoperformance@outlook.fr
                            </a>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MesFacturesPage() {
    return (
        <ProtectedRoute allowedRoles={['user', 'admin', 'agendaManager']}>
            <MesFacturesContent />
        </ProtectedRoute>
    );
}
