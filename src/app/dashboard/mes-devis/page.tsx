'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getQuotationsByUserId } from '@/lib/firestore/quotations';
import { Quotation } from '@/types';
import { FiFileText, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    draft: {
        label: 'Brouillon',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        icon: <FiClock className="w-3 h-3" />,
    },
    sent: {
        label: 'Envoyé',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        icon: <FiClock className="w-3 h-3" />,
    },
    accepted: {
        label: 'Accepté',
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        icon: <FiCheckCircle className="w-3 h-3" />,
    },
    rejected: {
        label: 'Refusé',
        className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        icon: <FiXCircle className="w-3 h-3" />,
    },
    expired: {
        label: 'Expiré',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
        icon: <FiAlertCircle className="w-3 h-3" />,
    },
    converted: {
        label: 'Converti',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        icon: <FiCheckCircle className="w-3 h-3" />,
    },
};

function MesDevisContent() {
    const { user } = useAuth();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        loadQuotations();
    }, [user]);

    const loadQuotations = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getQuotationsByUserId(user.uid);
            setQuotations(data);
        } catch (err) {
            console.error('Error loading quotations:', err);
            setError('Erreur lors du chargement de vos devis');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '—';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Mes Devis</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Consultez et acceptez vos devis LCF Auto Performance
                </p>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            {!loading && !error && quotations.length === 0 && (
                <div className="text-center py-16">
                    <FiFileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun devis</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Vous n&apos;avez pas encore de devis. Prenez un rendez-vous pour obtenir un devis personnalisé.
                    </p>
                    <Link
                        href="/rendez-vous"
                        className="inline-block mt-6 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold transition-colors"
                    >
                        Prendre un rendez-vous
                    </Link>
                </div>
            )}

            {!loading && quotations.length > 0 && (
                <div className="space-y-4">
                    {quotations.map((quotation) => (
                        <div
                            key={quotation.quotationId}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {quotation.quotationNumber}
                                        </h3>
                                        {getStatusBadge(quotation.status)}
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <p>Créé le : {formatDate(quotation.createdAt)}</p>
                                        {quotation.validUntil && (
                                            <p>Valable jusqu&apos;au : {formatDate(quotation.validUntil)}</p>
                                        )}
                                        <p>{quotation.items.length} prestation(s)</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:items-end gap-3">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {quotation.totalAmount.toFixed(2)} €
                                        </p>
                                        <p className="text-xs text-gray-500">TTC</p>
                                    </div>

                                    {quotation.acceptanceToken && !['accepted', 'rejected', 'converted', 'expired'].includes(quotation.status) && (
                                        <Link
                                            href={`/devis/${quotation.acceptanceToken}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-semibold transition-colors"
                                        >
                                            <FiCheckCircle className="w-4 h-4" />
                                            Consulter / Accepter
                                        </Link>
                                    )}

                                    {quotation.status === 'accepted' && quotation.acceptanceToken && (
                                        <Link
                                            href={`/devis/${quotation.acceptanceToken}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <FiFileText className="w-4 h-4" />
                                            Voir le devis
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Items preview */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Prestations</p>
                                <div className="space-y-1">
                                    {quotation.items.slice(0, 3).map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                            <span>{item.quantity}× {item.description}</span>
                                            <span className="font-medium">{(item.quantity * item.unitPrice).toFixed(2)} €</span>
                                        </div>
                                    ))}
                                    {quotation.items.length > 3 && (
                                        <p className="text-xs text-gray-400 italic">+ {quotation.items.length - 3} autre(s) prestation(s)</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function MesDevisPage() {
    return (
        <ProtectedRoute allowedRoles={['user', 'admin', 'agendaManager']}>
            <MesDevisContent />
        </ProtectedRoute>
    );
}
