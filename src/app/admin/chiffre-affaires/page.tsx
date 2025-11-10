'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  getCurrentMonthRevenue, 
  getCurrentYearRevenue, 
  getCurrentFiscalYearRevenue,
  generateFiscalDeclarationData,
  RevenueSummary
} from '@/lib/firestore/revenue';
import { FiCalendar, FiTrendingUp, FiFileText, FiDownload } from 'react-icons/fi';

function RevenueDisplay() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueSummary | null>(null);
  const [yearlyRevenue, setYearlyRevenue] = useState<RevenueSummary | null>(null);
  const [fiscalRevenue, setFiscalRevenue] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [monthly, yearly, fiscal] = await Promise.all([
        getCurrentMonthRevenue(),
        getCurrentYearRevenue(),
        getCurrentFiscalYearRevenue(),
      ]);

      setMonthlyRevenue(monthly);
      setYearlyRevenue(yearly);
      setFiscalRevenue(fiscal);
    } catch (err) {
      console.error('Error loading revenue data:', err);
      setError('Erreur lors du chargement des données de chiffre d\'affaires');
    } finally {
      setLoading(false);
    }
  };

  const handleExportFiscalData = async () => {
    setExporting(true);
    try {
      const currentYear = new Date().getFullYear();
      const fiscalData = await generateFiscalDeclarationData(currentYear);

      // Create a formatted text file with the fiscal data
      const content = `
===========================================
DÉCLARATION FISCALE - LCF AUTO PERFORMANCE
===========================================

Année fiscale: ${fiscalData.fiscalYear}
Date de génération: ${fiscalData.generatedAt.toLocaleDateString('fr-FR')} à ${fiscalData.generatedAt.toLocaleTimeString('fr-FR')}

RÉSUMÉ ANNUEL
-------------
Chiffre d'affaires total: ${fiscalData.totalRevenue.toFixed(2)} €
Nombre total de rendez-vous: ${fiscalData.totalAppointments}

DÉTAIL MENSUEL
--------------
${fiscalData.monthlyBreakdown
  .map(
    (item) =>
      `${getMonthName(item.month)}: ${item.revenue.toFixed(2)} € (${item.count} rendez-vous)`
  )
  .join('\n')}

===========================================
Document généré automatiquement
Ne pas modifier
===========================================
      `.trim();

      // Create and download the file
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `declaration-fiscale-${fiscalData.fiscalYear}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating fiscal data:', err);
      alert('Erreur lors de la génération des données fiscales');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getMonthName = (month: number): string => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1];
  };

  const formatDateRange = (startDate: Date, endDate: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return `${startDate.toLocaleDateString('fr-FR', options)} - ${endDate.toLocaleDateString('fr-FR', options)}`;
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            Chargement des données...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={loadRevenueData} className="mt-4">
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Chiffre d&apos;Affaires
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Suivi du chiffre d&apos;affaires par période
        </p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Monthly Revenue */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FiCalendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Chiffre d&apos;affaires mensuel
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {monthlyRevenue ? formatCurrency(monthlyRevenue.totalRevenue) : '0 €'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {monthlyRevenue?.completedAppointments || 0} rendez-vous complétés
          </p>
          {monthlyRevenue && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {formatDateRange(monthlyRevenue.startDate, monthlyRevenue.endDate)}
            </p>
          )}
        </Card>

        {/* Annual Revenue */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <FiTrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Chiffre d&apos;affaires annuel
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {yearlyRevenue ? formatCurrency(yearlyRevenue.totalRevenue) : '0 €'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {yearlyRevenue?.completedAppointments || 0} rendez-vous complétés
          </p>
          {yearlyRevenue && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {formatDateRange(yearlyRevenue.startDate, yearlyRevenue.endDate)}
            </p>
          )}
        </Card>

        {/* Fiscal Year Revenue */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <FiFileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Période fiscale en cours
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {fiscalRevenue ? formatCurrency(fiscalRevenue.totalRevenue) : '0 €'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {fiscalRevenue?.completedAppointments || 0} rendez-vous complétés
          </p>
          {fiscalRevenue && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Année fiscale {fiscalRevenue.startDate.getFullYear()}
            </p>
          )}
        </Card>
      </div>

      {/* Fiscal Declaration Export */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Déclaration fiscale
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Préparez les éléments à déclarer pour la période fiscale en cours. 
              Le fichier généré contiendra un récapitulatif détaillé de votre chiffre d&apos;affaires.
            </p>
            <Button
              onClick={handleExportFiscalData}
              disabled={exporting || !fiscalRevenue || fiscalRevenue.totalRevenue === 0}
              className="inline-flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              {exporting ? 'Génération en cours...' : 'Exporter la déclaration fiscale'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Appointments Table */}
      {fiscalRevenue && fiscalRevenue.appointments.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Rendez-vous récents (période fiscale)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr className="text-left">
                  <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Date
                  </th>
                  <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Client
                  </th>
                  <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Service
                  </th>
                  <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400 text-right">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody>
                {fiscalRevenue.appointments.slice(0, 10).map((appointment) => (
                  <tr
                    key={appointment.appointmentId}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="py-3 text-sm text-gray-900 dark:text-white">
                      {appointment.dateTime.toDate().toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 text-sm text-gray-900 dark:text-white">
                      {appointment.customerName}
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {appointment.serviceType}
                    </td>
                    <td className="py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                      {appointment.amount ? formatCurrency(appointment.amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fiscalRevenue.appointments.length > 10 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                Affichage des 10 rendez-vous les plus récents sur {fiscalRevenue.appointments.length} au total
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ChiffreAffairesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <RevenueDisplay />
    </ProtectedRoute>
  );
}
