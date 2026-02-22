'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getQuotationById, updateQuotationStatus, deleteQuotation, regenerateQuotationToken } from '@/lib/firestore/quotations';
import { convertQuotationToInvoice } from '@/lib/firestore/invoices';
import { Quotation } from '@/types';
import { FiEdit2, FiTrash2, FiMail, FiCheck, FiDownload, FiArrowLeft, FiPrinter, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { sendEmailAndWait } from '@/lib/email/emailClient';

export default function QuotationViewPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [converting, setConverting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const quotationId = params.id as string;

    useEffect(() => {
        if (user?.role !== 'admin') {
            router.push('/unauthorized');
            return;
        }

        loadQuotation();
    }, [user, quotationId]);

    const loadQuotation = async () => {
        try {
            setLoading(true);
            const data = await getQuotationById(quotationId);
            if (!data) {
                alert('Devis non trouvé');
                router.push('/admin/devis');
                return;
            }
            setQuotation(data);
        } catch (error) {
            console.error('Error loading quotation:', error);
            alert('Erreur lors du chargement du devis');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!quotation) return;

        try {
            setSending(true);
            const emailResult = await sendEmailAndWait('QUOTATION_SENT', {
                clientEmail: quotation.clientEmail,
                clientName: quotation.clientName,
                quotationNumber: quotation.quotationNumber,
                items: quotation.items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalWithTax: item.totalWithTax,
                })),
                totalAmount: quotation.totalAmount,
                validUntil: quotation.validUntil ? (quotation.validUntil as any).toDate().toISOString() : null,
                acceptanceToken: quotation.acceptanceToken,
            });

            if (!emailResult.success) {
                throw new Error(emailResult.error || 'Erreur inconnue');
            }

            await updateQuotationStatus(quotation.quotationId, 'sent');
            alert('Devis envoyé par email avec succès !');
            await loadQuotation();
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Erreur lors de l\'envoi de l\'email: ' + (error as Error).message);
        } finally {
            setSending(false);
        }
    };

    const handleConvertToInvoice = async () => {
        if (!quotation || !user) return;
        if (!confirm(`Convertir le devis ${quotation.quotationNumber} en facture ?`)) return;

        try {
            setConverting(true);
            const invoiceId = await convertQuotationToInvoice(user.uid, quotation);
            alert('Facture créée avec succès !');
            router.push(`/admin/factures/${invoiceId}`);
        } catch (error) {
            console.error('Error converting quotation:', error);
            alert('Erreur lors de la conversion');
        } finally {
            setConverting(false);
        }
    };

    const handleRegenerateToken = async () => {
        if (!quotation) return;
        if (!confirm('Régénérer le lien d\'acceptation ? L\'ancien lien sera invalidé.')) return;

        try {
            await regenerateQuotationToken(quotation.quotationId);
            alert('Lien d\'acceptation régénéré avec succès');
            await loadQuotation();
        } catch (error) {
            console.error('Error regenerating token:', error);
            alert('Erreur lors de la régénération du lien');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = async () => {
        if (!quotation) return;

        try {
            await deleteQuotation(quotation.quotationId);
            alert('Devis supprimé avec succès');
            router.push('/admin/devis');
        } catch (error) {
            console.error('Error deleting quotation:', error);
            alert('Erreur lors de la suppression du devis');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        };

        const labels = {
            draft: 'Brouillon',
            sent: 'Envoyé',
            accepted: 'Accepté',
            rejected: 'Refusé',
            expired: 'Expiré',
            converted: 'Converti',
        };

        return (
            <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles]}`}
            >
                {labels[status as keyof typeof labels] || status}
            </span>
        );
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

    if (!quotation) {
        return null;
    }

    const isExpired = quotation.validUntil && (quotation.validUntil as any).toDate() < new Date();
    const canConvert = quotation.status === 'accepted' && !quotation.convertedToInvoice;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <button
                        onClick={() => router.push('/admin/devis')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#1CCEFF] transition-colors mb-4 print:hidden"
                    >
                        <FiArrowLeft />
                        Retour aux devis
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Devis {quotation.quotationNumber}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        {getStatusBadge(quotation.status)}
                        {isExpired && quotation.status !== 'expired' && (
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                                Expiré
                            </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Créé le {new Date(quotation.createdAt.toMillis()).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <FiPrinter />
                        Imprimer
                    </button>

                    {canConvert && (
                        <button
                            onClick={handleConvertToInvoice}
                            disabled={converting}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <FiFileText />
                            {converting ? 'Conversion...' : 'Convertir en facture'}
                        </button>
                    )}

                    {['draft', 'sent'].includes(quotation.status) && (
                        <button
                            onClick={handleSendEmail}
                            disabled={sending}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <FiMail />
                            {sending ? 'Envoi...' : 'Envoyer par email'}
                        </button>
                    )}

                    {quotation.status !== 'converted' && (
                        <button
                            onClick={handleRegenerateToken}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            title="Régénérer le lien d'acceptation client"
                        >
                            <FiRefreshCw />
                            Régénérer lien
                        </button>
                    )}

                    <button
                        onClick={() => router.push(`/admin/devis?edit=${quotation.quotationId}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <FiEdit2 />
                        Modifier
                    </button>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <FiTrash2 />
                        Supprimer
                    </button>
                </div>
            </div>

            {/* Quotation Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1CCEFF] to-[#0ea5e9] text-white p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">LCF AUTO PERFORMANCE</h2>
                            <p className="mt-2 text-sm opacity-90">Garage Automobile</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-90">DEVIS</p>
                            <p className="text-2xl font-bold">{quotation.quotationNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                                Informations
                            </h3>
                            <div className="space-y-2">
                                <p className="text-gray-900 dark:text-white">
                                    <span className="font-medium">Date d'émission:</span>{' '}
                                    {new Date(quotation.createdAt.toMillis()).toLocaleDateString('fr-FR')}
                                </p>
                                {quotation.validUntil && (
                                    <p className="text-gray-900 dark:text-white">
                                        <span className="font-medium">Valable jusqu'au:</span>{' '}
                                        {new Date((quotation.validUntil as any).toMillis()).toLocaleDateString('fr-FR')}
                                    </p>
                                )}
                                {quotation.acceptedAt && (
                                    <p className="text-green-600 font-medium">
                                        <span className="font-medium">Accepté le:</span>{' '}
                                        {new Date((quotation.acceptedAt as any).toMillis()).toLocaleDateString('fr-FR')}
                                    </p>
                                )}
                                {quotation.rejectedAt && (
                                    <p className="text-red-600 font-medium">
                                        <span className="font-medium">Refusé le:</span>{' '}
                                        {new Date((quotation.rejectedAt as any).toMillis()).toLocaleDateString('fr-FR')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                                Client
                            </h3>
                            <div className="space-y-2">
                                <p className="font-semibold text-gray-900 dark:text-white">{quotation.clientName}</p>
                                <p className="text-gray-600 dark:text-gray-400">{quotation.clientEmail}</p>
                                {quotation.clientPhone && (
                                    <p className="text-gray-600 dark:text-gray-400">{quotation.clientPhone}</p>
                                )}
                                {quotation.clientAddress && (
                                    <p className="text-gray-600 dark:text-gray-400">{quotation.clientAddress}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
                            Détails des prestations
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Qté
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Prix Unitaire HT
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            TVA
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Total TTC
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {quotation.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                {item.description}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-center text-gray-900 dark:text-white">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white">
                                                {item.unitPrice.toFixed(2)} €
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white">
                                                {item.taxRate}%
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                                                {item.totalWithTax.toFixed(2)} €
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span>Sous-total HT:</span>
                                <span className="font-medium">{quotation.subtotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span>Total TVA:</span>
                                <span className="font-medium">{quotation.totalTax.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-3">
                                <span className="text-gray-900 dark:text-white">Total TTC:</span>
                                <span className="text-[#1CCEFF]">{quotation.totalAmount.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>

                    {(quotation.notes || quotation.internalNotes) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {quotation.notes && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Notes client:</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{quotation.notes}</p>
                                </div>
                            )}
                            {quotation.internalNotes && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Notes internes:</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{quotation.internalNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Confirmer la suppression
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
