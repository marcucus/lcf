'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Invoice } from '@/types';
import { getPaidInvoicesByDateRange } from '@/lib/firestore/invoices';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FiBarChart2, FiFileText, FiInfo } from 'react-icons/fi';

export default function FiscalDeclarationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Set default dates to current year
    const currentYear = new Date().getFullYear();
    setStartDate(`${currentYear}-01-01`);
    setEndDate(`${currentYear}-12-31`);
  }, []);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      alert('Veuillez sélectionner les dates de début et de fin');
      return;
    }

    try {
      setIsLoading(true);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const data = await getPaidInvoicesByDateRange(start, end);
      setInvoices(data);
      setHasSearched(true);
    } catch (error) {
      console.error('Error loading invoices:', error);
      alert('Erreur lors du chargement des factures');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return;

    // Build CSV content from in-memory invoices
    const headers = ['N° Facture', 'Date paiement', 'Client', 'Montant HT (€)', 'TVA (€)', 'Total TTC (€)', 'Notes'];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.paidDate?.toDate().toLocaleDateString('fr-FR') ?? '',
      inv.customerName,
      inv.subtotal.toFixed(2),
      inv.taxAmount.toFixed(2),
      inv.total.toFixed(2),
      inv.notes ?? '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `declaration-fiscale-${startDate}-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportPDF = () => {
    if (invoices.length === 0) return;
    window.print();
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalHT = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const totalTVA = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Déclaration Fiscale Auto-Entrepreneur</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Période de Déclaration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date de début</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date de fin</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Chargement...' : 'Rechercher'}
            </Button>
          </div>
        </div>

        {hasSearched && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <Button
                onClick={handleExportCSV}
                disabled={invoices.length === 0}
              >
                <FiBarChart2 className="w-4 h-4 mr-2 inline" /> Exporter en CSV
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={invoices.length === 0}
                variant="secondary"
              >
                <FiFileText className="w-4 h-4 mr-2 inline" /> Exporter en PDF
              </Button>
            </div>
          </div>
        )}
      </Card>

      {hasSearched && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Nombre de Factures</h3>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Total HT</h3>
              <p className="text-2xl font-bold">{totalHT.toFixed(2)} €</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Total TVA</h3>
              <p className="text-2xl font-bold">{totalTVA.toFixed(2)} €</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Chiffre d'Affaires TTC</h3>
              <p className="text-2xl font-bold text-[#1CCEFF]">{totalRevenue.toFixed(2)} €</p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Factures Payées de la Période</h2>

            {invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune facture payée trouvée pour cette période
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Facture
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Paiement
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant HT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TVA
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant TTC
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Détails
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoices.map((invoice) => (
                      <tr key={invoice.invoiceId}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {invoice.paidDate?.toDate().toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {invoice.customerName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {invoice.subtotal.toFixed(2)} €
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {invoice.taxAmount.toFixed(2)} €
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {invoice.total.toFixed(2)} €
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {invoice.notes || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(`/admin/factures/${invoice.invoiceId}`);
                            }}
                            className="text-[#1CCEFF] hover:underline"
                          >
                            Voir
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-6 mt-6 bg-blue-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" /> Informations pour la Déclaration</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Le chiffre d'affaires à déclarer est le montant TTC des factures <strong>payées</strong> sur la période</li>
              <li>Pour le régime auto-entrepreneur garage auto, conservez toutes les pièces justificatives</li>
              <li>Les exports CSV et PDF contiennent toutes les informations nécessaires pour votre déclaration</li>
              <li>Vérifiez que toutes les factures ont bien un statut "payé" et une date de paiement</li>
              <li>Les pièces justificatives associées aux factures sont accessibles depuis la page de détail de chaque facture</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
