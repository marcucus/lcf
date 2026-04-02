'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Quotation } from '@/types';
import { getQuotationByToken, rejectQuotation } from '@/lib/firestore/quotations';
import { FiCheckCircle, FiXCircle, FiFileText, FiAlertCircle, FiLoader, FiPhone, FiClock } from 'react-icons/fi';
import React from 'react';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
    accepted: { label: 'Accepté', color: 'text-green-600', icon: FiCheckCircle },
    rejected: { label: 'Refusé', color: 'text-red-600', icon: FiXCircle },
    converted: { label: 'Converti en facture', color: 'text-purple-600', icon: FiFileText },
    expired: { label: 'Expiré', color: 'text-orange-600', icon: FiAlertCircle },
};

export default function QuotationAcceptancePage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();

    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [showRefuseModal, setShowRefuseModal] = useState(false);
    const [refuseReason, setRefuseReason] = useState('');
    const [refusing, setRefusing] = useState(false);
    const [refused, setRefused] = useState(false);

    useEffect(() => {
        if (!token) return;
        loadQuotation();
    }, [token]);

    const loadQuotation = async () => {
        try {
            const data = await getQuotationByToken(token as string);
            if (!data) {
                setNotFound(true);
            } else {
                setQuotation(data);
            }
        } catch (err) {
            console.error('Error loading quotation:', err);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        if (!quotation) return;
        router.push(`/devis/${token}/signer`);
    };

    const handleRefuse = async () => {
        if (!quotation) return;
        setRefusing(true);
        try {
            await rejectQuotation(quotation.quotationId, refuseReason || undefined);
            setRefused(true);
            setShowRefuseModal(false);
        } catch (err) {
            console.error('Error refusing quotation:', err);
        } finally {
            setRefusing(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // ── States ────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Chargement du devis...</p>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Devis introuvable</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Ce lien est invalide ou a expiré. Veuillez contacter le garage.
                    </p>
                </div>
            </div>
        );
    }

    if (refused) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <FiXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Devis refusé</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Votre refus a bien été enregistré. Nous en prenons note et restons disponibles si vous avez des questions.
                    </p>
                    <p className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-1.5">
                        <FiPhone className="w-4 h-4 flex-shrink-0" /> 07 61 88 82 63 · lcfautoperformance@outlook.fr
                    </p>
                </div>
            </div>
        );
    }

    // Terminal statuses — already decided
    const terminalStatus = STATUS_LABELS[quotation!.status];
    if (terminalStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <terminalStatus.icon className={`w-16 h-16 mx-auto mb-4 ${terminalStatus.color}`} />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Devis {terminalStatus.label.toLowerCase()}
                    </h1>
                    <p className={`font-semibold ${terminalStatus.color} mb-4`}>
                        Ce devis a déjà été {terminalStatus.label.toLowerCase()}.
                    </p>
                    {quotation!.acceptedAt && (
                        <p className="text-sm text-gray-500">
                            Le {formatDate(quotation!.acceptedAt)}
                        </p>
                    )}
                    <p className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-1.5">
                        Pour toute question : <FiPhone className="w-4 h-4 flex-shrink-0" /> 07 61 88 82 63
                    </p>
                </div>
            </div>
        );
    }

    // ── Main view ─────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Logo + Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LCF Auto Performance</h1>
                    <p className="text-gray-500 mt-1">6 Rue de la Forteresse, 41330 Saint-Bohaire</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-accent/10 px-8 py-6 border-b border-accent/20">
                        <div className="flex items-center gap-3">
                            <FiFileText className="w-8 h-8 text-accent" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Devis n° {quotation!.quotationNumber}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    À l&apos;attention de {quotation!.clientName}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Date du devis</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(quotation!.createdAt)}</p>
                            </div>
                            {quotation!.validUntil && (
                                <div>
                                    <p className="text-gray-500">Valable jusqu&apos;au</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(quotation!.validUntil)}</p>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Détail des prestations
                            </h3>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qté</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">P.U.</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total HT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {quotation!.items.map((item, i) => (
                                            <tr key={i} className="bg-white dark:bg-gray-800">
                                                <td className="px-4 py-3 text-gray-900 dark:text-white">{item.description}</td>
                                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{item.unitPrice.toFixed(2)} €</td>
                                                <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                                    {(item.quantity * item.unitPrice).toFixed(2)} €
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Sous-total HT</span>
                                <span>{quotation!.subtotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>TVA</span>
                                <span>{quotation!.totalTax.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
                                <span>TOTAL TTC</span>
                                <span className="text-accent">{quotation!.totalAmount.toFixed(2)} €</span>
                            </div>
                        </div>

                        {/* Notes */}
                        {quotation!.notes && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Notes</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">{quotation!.notes}</p>
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={handleAccept}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors shadow-md shadow-green-500/20"
                            >
                                <FiCheckCircle className="w-5 h-5" />
                                Accepter le devis
                            </button>
                            <button
                                onClick={() => setShowRefuseModal(true)}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-semibold transition-colors"
                            >
                                <FiXCircle className="w-5 h-5" />
                                Refuser le devis
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refuse modal */}
            {showRefuseModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Refuser le devis</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Vous pouvez indiquer un motif (optionnel) :
                        </p>
                        <textarea
                            value={refuseReason}
                            onChange={(e) => setRefuseReason(e.target.value)}
                            placeholder="Motif du refus (optionnel)..."
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={3}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowRefuseModal(false)}
                                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleRefuse}
                                disabled={refusing}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                            >
                                {refusing ? 'En cours...' : 'Confirmer le refus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
