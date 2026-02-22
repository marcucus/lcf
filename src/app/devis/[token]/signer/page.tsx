'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Quotation } from '@/types';
import { getQuotationByToken, acceptQuotation } from '@/lib/firestore/quotations';
import { createWorkOrderFromQuotation } from '@/lib/firestore/workOrders';
import { FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const LEGAL_CLAUSES = [
    {
        id: 'accept-quote',
        text: `J'ai lu et j'accepte le devis dans son intégralité, incluant les prestations détaillées, les tarifs appliqués (HT et TTC) et les conditions de réalisation.`,
    },
    {
        id: 'authorize-work',
        text: `J'autorise expressément LCF Auto Performance à commencer les travaux décrits dans ce devis. Je reconnais que cette acceptation vaut bon pour accord et engage les deux parties.`,
    },
    {
        id: 'understand-terms',
        text: `Je comprends que toute modification demandée après acceptation fera l'objet d'un avenant écrit. Les travaux réalisés conformément au devis accepté seront facturés au prix convenu.`,
    },
];

export default function QuotationSigningPage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();

    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [checkedClauses, setCheckedClauses] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        loadQuotation();
    }, [token]);

    const loadQuotation = async () => {
        try {
            const data = await getQuotationByToken(token as string);
            if (!data) {
                setNotFound(true);
            } else if (['accepted', 'rejected', 'converted', 'expired'].includes(data.status)) {
                // Already in a terminal state — redirect back to the main view
                router.replace(`/devis/${token}`);
            } else {
                setQuotation(data);
            }
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const toggleClause = (id: string) => {
        setCheckedClauses((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const allChecked = LEGAL_CLAUSES.every((c) => checkedClauses.has(c.id));

    const handleConfirm = async () => {
        if (!quotation || !allChecked) return;
        setSubmitting(true);
        setError(null);
        try {
            await acceptQuotation(quotation.quotationId);

            // Auto-create a WorkOrder so the admin can track the work
            try {
                // Use a placeholder admin uid (the system) since this is client-side
                await createWorkOrderFromQuotation('system', quotation);
            } catch (woErr) {
                // Non-blocking: WorkOrder creation failure should not block the client
                console.warn('Could not create work order automatically:', woErr);
            }

            setSuccess(true);
        } catch (err) {
            console.error('Error accepting quotation:', err);
            setError("Une erreur est survenue. Veuillez réessayer ou contacter le garage directement.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── States ─────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lien invalide</h1>
                    <p className="text-gray-600 dark:text-gray-400">Ce lien est invalide ou a expiré.</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Devis accepté ! 🎉
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Votre acceptation du devis <strong>{quotation!.quotationNumber}</strong> a bien été enregistrée.
                        Notre équipe va prendre contact avec vous pour planifier les travaux.
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-left">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Prochaines étapes :</p>
                        <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                            <li>✓ Notre équipe examine votre acceptation</li>
                            <li>✓ Nous vous recontactons pour fixer la date d&apos;intervention</li>
                            <li>✓ Une facture vous sera adressée à la fin des travaux</li>
                        </ul>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">📞 07 61 88 82 63 · lcfautoperformance@outlook.fr</p>
                </div>
            </div>
        );
    }

    // ── Signing form ────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LCF Auto Performance</h1>
                    <p className="text-gray-500 mt-1">Signature électronique du devis</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Banner */}
                    <div className="bg-green-500/10 px-8 py-6 border-b border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                            <FiCheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Acceptation du devis {quotation!.quotationNumber}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Montant TTC : <strong>{quotation!.totalAmount.toFixed(2)} €</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <p className="text-gray-700 dark:text-gray-300">
                            Avant de confirmer votre acceptation, veuillez lire et cocher chacune des clauses
                            ci-dessous. Ces conditions sont nécessaires pour valider l&apos;acceptation du devis.
                        </p>

                        {/* Legal clauses */}
                        <div className="space-y-4">
                            {LEGAL_CLAUSES.map((clause) => (
                                <label
                                    key={clause.id}
                                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${checkedClauses.has(clause.id)
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checkedClauses.has(clause.id)}
                                        onChange={() => toggleClause(clause.id)}
                                        className="mt-0.5 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                                    />
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {clause.text}
                                    </p>
                                </label>
                            ))}
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Progress indicator */}
                        <p className="text-sm text-gray-500 text-center">
                            {checkedClauses.size} / {LEGAL_CLAUSES.length} clauses acceptées
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center justify-center gap-2 px-5 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Retour
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!allChecked || submitting}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${allChecked && !submitting
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <FiCheckCircle className="w-5 h-5" />
                                {submitting ? 'Confirmation en cours...' : 'Confirmer et signer le devis'}
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 text-center">
                            Cette acceptation électronique a la même valeur juridique qu&apos;une signature manuscrite
                            conformément à la réglementation française sur la signature électronique.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
