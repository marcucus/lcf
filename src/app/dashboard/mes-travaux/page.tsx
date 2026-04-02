'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getWorkOrdersByUserId } from '@/lib/firestore/workOrders';
import { WorkOrder, WorkOrderStatus } from '@/types';
import { FiTool, FiClock, FiPlay, FiCheckCircle, FiAlertCircle, FiCheck } from 'react-icons/fi';

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; colorClass: string; bgClass: string; icon: React.ReactNode; progressColor: string }> = {
    pending: {
        label: 'En attente',
        colorClass: 'text-yellow-700 dark:text-yellow-300',
        bgClass: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
        icon: <FiClock className="w-5 h-5" />,
        progressColor: 'bg-yellow-400',
    },
    in_progress: {
        label: 'En cours',
        colorClass: 'text-blue-700 dark:text-blue-300',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
        icon: <FiPlay className="w-5 h-5" />,
        progressColor: 'bg-blue-500',
    },
    completed: {
        label: 'Terminé',
        colorClass: 'text-green-700 dark:text-green-300',
        bgClass: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800',
        icon: <FiCheckCircle className="w-5 h-5" />,
        progressColor: 'bg-green-500',
    },
};

const PROGRESS_STEPS: { key: WorkOrderStatus; label: string }[] = [
    { key: 'pending', label: 'Prise en charge' },
    { key: 'in_progress', label: 'En cours' },
    { key: 'completed', label: 'Terminé' },
];

function MesTravauxContent() {
    const { user } = useAuth();
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        loadWorkOrders();
    }, [user]);

    const loadWorkOrders = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getWorkOrdersByUserId(user.uid);
            setWorkOrders(data);
        } catch (err) {
            console.error('Error loading work orders:', err);
            setError('Erreur lors du chargement de vos travaux');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (ts: any) => {
        if (!ts) return '—';
        const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getStepIndex = (status: WorkOrderStatus) =>
        PROGRESS_STEPS.findIndex((s) => s.key === status);

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/10 rounded-xl">
                        <FiTool className="w-5 h-5 text-accent" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Mes Travaux</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                    Suivez l&apos;avancement des travaux sur votre ou vos véhicules en temps réel.
                </p>
            </div>

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

            {!loading && !error && workOrders.length === 0 && (
                <div className="text-center py-16">
                    <FiTool className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun travail en cours</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Vos travaux apparaîtront ici une fois vos devis acceptés et pris en charge par notre équipe.
                    </p>
                </div>
            )}

            {!loading && workOrders.length > 0 && (
                <div className="space-y-6">
                    {workOrders.map((wo) => {
                        const config = STATUS_CONFIG[wo.status];
                        const currentStep = getStepIndex(wo.status);

                        return (
                            <div
                                key={wo.workOrderId}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden"
                            >
                                {/* Status banner */}
                                <div className={`px-6 py-4 border-b flex items-center gap-3 ${config.bgClass}`}>
                                    <div className={`${config.colorClass}`}>{config.icon}</div>
                                    <div>
                                        <p className={`font-bold ${config.colorClass}`}>{config.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Réf. devis : {wo.quotationNumber}
                                        </p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{wo.totalAmount.toFixed(2)} €</p>
                                        <p className="text-xs text-gray-500">TTC</p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Progress bar */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            {PROGRESS_STEPS.map((step, i) => (
                                                <div key={step.key} className="flex flex-col items-center flex-1">
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= currentStep
                                                                ? `${config.progressColor} text-white`
                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                            }`}
                                                    >
                                                        {i < currentStep ? <FiCheck className="w-4 h-4" /> : i + 1}
                                                    </div>
                                                    <p className={`text-xs mt-1 text-center font-medium ${i <= currentStep ? config.colorClass : 'text-gray-400'
                                                        }`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Connector line */}
                                        <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-4 -mt-8 mb-8">
                                            <div
                                                className={`absolute left-0 h-1 rounded-full transition-all duration-500 ${config.progressColor}`}
                                                style={{ width: `${(currentStep / (PROGRESS_STEPS.length - 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{wo.description}</p>
                                    </div>

                                    {/* Prestations */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            Prestations ({wo.items.length})
                                        </p>
                                        <div className="space-y-1">
                                            {wo.items.map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                                    <span>{item.quantity}× {item.description}</span>
                                                    <span className="font-medium">{(item.quantity * item.unitPrice).toFixed(2)} €</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {wo.progressNotes && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3">
                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                                                Message de l&apos;équipe
                                            </p>
                                            <p className="text-sm text-blue-800 dark:text-blue-200">{wo.progressNotes}</p>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="text-xs text-gray-400 flex flex-wrap gap-4">
                                        <span>Créé : {formatDate(wo.createdAt)}</span>
                                        {wo.startedAt && <span>Démarré : {formatDate(wo.startedAt)}</span>}
                                        {wo.completedAt && <span className="text-green-600 font-medium flex items-center gap-1.5"><FiCheckCircle className="w-4 h-4 flex-shrink-0" /> Terminé : {formatDate(wo.completedAt)}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Info box */}
            {!loading && (
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-start gap-3">
                        <FiAlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Vous serez notifié par email dès que votre véhicule est prêt.
                            Pour toute question : <strong>07 61 88 82 63</strong> ·{' '}
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

export default function MesTravauxPage() {
    return (
        <ProtectedRoute allowedRoles={['user', 'admin', 'agendaManager']}>
            <MesTravauxContent />
        </ProtectedRoute>
    );
}
