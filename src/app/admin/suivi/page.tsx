'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WorkOrder, WorkOrderStatus } from '@/types';
import {
    getAllWorkOrders,
    updateWorkOrderStatus,
    completeWorkOrder,
} from '@/lib/firestore/workOrders';
import { convertQuotationToInvoice } from '@/lib/firestore/invoices';
import { getQuotationById } from '@/lib/firestore/quotations';
import { sendEmailAndWait } from '@/lib/email/emailClient';
import {
    FiClock,
    FiPlay,
    FiCheckCircle,
    FiAlertCircle,
    FiLoader,
    FiUser,
    FiFileText,
    FiTool,
    FiXCircle,
} from 'react-icons/fi';

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: {
        label: 'En attente',
        color: 'text-yellow-700 dark:text-yellow-300',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: <FiClock className="w-4 h-4" />,
    },
    in_progress: {
        label: 'En cours',
        color: 'text-blue-700 dark:text-blue-300',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: <FiPlay className="w-4 h-4" />,
    },
    completed: {
        label: 'Terminé',
        color: 'text-green-700 dark:text-green-300',
        bg: 'bg-green-100 dark:bg-green-900/30',
        icon: <FiCheckCircle className="w-4 h-4" />,
    },
};

function WorkOrderCard({
    workOrder,
    onStatusChange,
}: {
    workOrder: WorkOrder;
    onStatusChange: () => void;
}) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [progressNotes, setProgressNotes] = useState(workOrder.progressNotes || '');
    const [withInvoice, setWithInvoice] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const config = STATUS_CONFIG[workOrder.status];

    const formatDate = (ts: any) => {
        if (!ts) return '—';
        const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            await updateWorkOrderStatus(workOrder.workOrderId, 'in_progress', progressNotes || undefined);
            onStatusChange();
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!user) return;
        setCompleting(true);
        setError(null);
        try {
            let invoiceId: string | undefined;
            let invoiceNumber: string | undefined;

            if (withInvoice) {
                // Load the quotation to get full data
                const quotation = await getQuotationById(workOrder.quotationId);
                if (quotation) {
                    invoiceId = await convertQuotationToInvoice(user.uid, quotation);
                }
            }

            await completeWorkOrder(workOrder.workOrderId, withInvoice, invoiceId, progressNotes || undefined);

            // Send completion email
            await sendEmailAndWait('WORK_COMPLETED', {
                clientEmail: workOrder.clientEmail,
                clientName: workOrder.clientName,
                workOrderDescription: workOrder.description,
                quotationNumber: workOrder.quotationNumber,
                withInvoice,
                invoiceNumber,
                invoiceTotal: withInvoice ? workOrder.totalAmount : undefined,
            });

            setShowCompleteModal(false);
            onStatusChange();
        } catch (err) {
            console.error('Error completing work order:', err);
            setError('Une erreur est survenue lors de la finalisation des travaux.');
        } finally {
            setCompleting(false);
        }
    };

    return (
        <>
            <Card>
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                                    {config.icon}
                                    {config.label}
                                </span>
                                <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                                    {workOrder.quotationNumber}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FiUser className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{workOrder.clientName}</span>
                                {workOrder.clientPhone && <span>· {workOrder.clientPhone}</span>}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {workOrder.totalAmount.toFixed(2)} €
                            </p>
                            <p className="text-xs text-gray-500">TTC</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{workOrder.description}</p>
                    </div>

                    {/* Items */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prestations</p>
                        <div className="space-y-1">
                            {workOrder.items.slice(0, 4).map((item, i) => (
                                <div key={i} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                    <span>{item.quantity}× {item.description}</span>
                                    <span className="font-medium">{(item.quantity * item.unitPrice).toFixed(2)} €</span>
                                </div>
                            ))}
                            {workOrder.items.length > 4 && (
                                <p className="text-xs text-gray-400 italic">+ {workOrder.items.length - 4} autre(s)</p>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="text-xs text-gray-400 space-y-0.5">
                        <p>Créé le {formatDate(workOrder.createdAt)}</p>
                        {workOrder.startedAt && <p>Démarré le {formatDate(workOrder.startedAt)}</p>}
                        {workOrder.completedAt && <p>Terminé le {formatDate(workOrder.completedAt)}</p>}
                    </div>

                    {/* Progress notes */}
                    {workOrder.status !== 'completed' && (
                        <textarea
                            value={progressNotes}
                            onChange={(e) => setProgressNotes(e.target.value)}
                            placeholder="Notes de progression (optionnel)..."
                            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            rows={2}
                        />
                    )}

                    {workOrder.progressNotes && workOrder.status === 'completed' && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <span className="font-medium">Notes : </span>{workOrder.progressNotes}
                        </div>
                    )}

                    {/* Actions */}
                    {workOrder.status === 'pending' && (
                        <Button
                            onClick={handleStart}
                            variant="secondary"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2"
                        >
                            {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiPlay className="w-4 h-4" />}
                            Démarrer les travaux
                        </Button>
                    )}

                    {workOrder.status === 'in_progress' && (
                        <Button
                            onClick={() => setShowCompleteModal(true)}
                            variant="secondary"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 !bg-green-600 !text-white hover:!bg-green-700"
                        >
                            <FiCheckCircle className="w-4 h-4" />
                            Marquer comme terminé
                        </Button>
                    )}

                    {workOrder.status === 'completed' && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                            <FiCheckCircle className="w-4 h-4" />
                            Travaux terminés
                            {workOrder.invoiceSentOnCompletion && ' · Facture envoyée'}
                        </div>
                    )}
                </div>
            </Card>

            {/* Complete modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Finaliser les travaux
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Travaux pour <strong>{workOrder.clientName}</strong> — {workOrder.quotationNumber}
                        </p>

                        {/* Invoice option */}
                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                Envoyer une facture avec la notification ?
                            </p>
                            <div className="flex gap-3">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${withInvoice ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                    <input
                                        type="radio"
                                        name="withInvoice"
                                        checked={withInvoice}
                                        onChange={() => setWithInvoice(true)}
                                        className="w-4 h-4 accent-green-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><FiCheckCircle className="w-4 h-4 text-green-500" /> Oui</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${!withInvoice ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                    <input
                                        type="radio"
                                        name="withInvoice"
                                        checked={!withInvoice}
                                        onChange={() => setWithInvoice(false)}
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><FiXCircle className="w-4 h-4 text-red-500" /> Non</span>
                                </label>
                            </div>
                            {withInvoice && (
                                <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                                    Une facture sera automatiquement créée depuis le devis et incluse dans l&apos;email.
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                                <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCompleteModal(false)}
                                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={completing}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {completing ? (
                                    <><FiLoader className="w-4 h-4 animate-spin" /> En cours...</>
                                ) : (
                                    <><FiCheckCircle className="w-4 h-4" /> Confirmer</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Filter tabs
const FILTER_TABS: { key: WorkOrderStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'pending', label: 'En attente' },
    { key: 'in_progress', label: 'En cours' },
    { key: 'completed', label: 'Terminés' },
];

function SuiviTravauxPage() {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<WorkOrderStatus | 'all'>('all');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadWorkOrders();
    }, []);

    const loadWorkOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllWorkOrders();
            setWorkOrders(data);
        } catch (err) {
            console.error('Error loading work orders:', err);
            setError('Erreur lors du chargement des ordres de travail');
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === 'all' ? workOrders : workOrders.filter((w) => w.status === filter);
    const counts = {
        all: workOrders.length,
        pending: workOrders.filter((w) => w.status === 'pending').length,
        in_progress: workOrders.filter((w) => w.status === 'in_progress').length,
        completed: workOrders.filter((w) => w.status === 'completed').length,
    };

    return (
        <div className="flex-1 h-screen overflow-auto">
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-accent/10 rounded-xl">
                                <FiTool className="w-6 h-6 text-accent" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suivi des travaux</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Gérez et suivez l&apos;avancement des ordres de travail issus des devis acceptés
                        </p>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.key
                                    ? 'bg-accent text-white shadow-sm'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-accent/50'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${filter === tab.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                {counts[tab.key]}
                            </span>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-6">
                        <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-16">
                        <FiTool className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Aucun ordre de travail
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {filter === 'all'
                                ? 'Les ordres de travail apparaissent automatiquement quand un devis est accepté.'
                                : `Aucun travail avec le statut "${FILTER_TABS.find((t) => t.key === filter)?.label}".`}
                        </p>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map((wo) => (
                            <WorkOrderCard
                                key={wo.workOrderId}
                                workOrder={wo}
                                onStatusChange={loadWorkOrders}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SuiviTravauxAdminPage() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'agendaManager']}>
            <SuiviTravauxPage />
        </ProtectedRoute>
    );
}
