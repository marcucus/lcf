import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Appointment } from '@/types';

/**
 * Revenue period types
 */
export type RevenuePeriod = 'monthly' | 'annual' | 'fiscal';

/**
 * Revenue summary data structure
 */
export interface RevenueSummary {
  period: RevenuePeriod;
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  completedAppointments: number;
  appointments: Appointment[];
}

/**
 * Get revenue summary for a specific period
 */
export async function getRevenueSummary(
  period: RevenuePeriod,
  date: Date = new Date()
): Promise<RevenueSummary> {
  if (!db) throw new Error('Firebase not configured');

  const { startDate, endDate } = getPeriodDates(period, date);

  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('dateTime', '>=', Timestamp.fromDate(startDate)),
      where('dateTime', '<=', Timestamp.fromDate(endDate)),
      where('status', '==', 'completed'),
      orderBy('dateTime', 'desc')
    );

    const snapshot = await getDocs(q);
    const appointments = snapshot.docs.map((doc) => ({
      appointmentId: doc.id,
      ...doc.data(),
    })) as Appointment[];

    // Calculate total revenue
    const totalRevenue = appointments.reduce(
      (sum, appointment) => sum + (appointment.amount || 0),
      0
    );

    return {
      period,
      startDate,
      endDate,
      totalRevenue,
      completedAppointments: appointments.length,
      appointments,
    };
  } catch (error) {
    console.error('Error getting revenue summary:', error);
    throw error;
  }
}

/**
 * Get revenue for current month
 */
export async function getCurrentMonthRevenue(): Promise<RevenueSummary> {
  return getRevenueSummary('monthly');
}

/**
 * Get revenue for current year
 */
export async function getCurrentYearRevenue(): Promise<RevenueSummary> {
  return getRevenueSummary('annual');
}

/**
 * Get revenue for current fiscal year
 * French fiscal year: January 1st to December 31st
 */
export async function getCurrentFiscalYearRevenue(): Promise<RevenueSummary> {
  return getRevenueSummary('fiscal');
}

/**
 * Calculate date range for a given period
 */
function getPeriodDates(
  period: RevenuePeriod,
  referenceDate: Date
): { startDate: Date; endDate: Date } {
  const date = new Date(referenceDate);

  switch (period) {
    case 'monthly': {
      // First day of the month at 00:00:00
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      // Last day of the month at 23:59:59
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate, endDate };
    }

    case 'annual': {
      // January 1st at 00:00:00
      const startDate = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
      // December 31st at 23:59:59
      const endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate, endDate };
    }

    case 'fiscal': {
      // French fiscal year = calendar year (January 1st to December 31st)
      const startDate = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
      const endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate, endDate };
    }

    default:
      throw new Error(`Unknown period: ${period}`);
  }
}

/**
 * Get revenue breakdown by month for a given year
 */
export async function getMonthlyRevenueBreakdown(
  year: number
): Promise<{ month: number; revenue: number; count: number }[]> {
  if (!db) throw new Error('Firebase not configured');

  const results: { month: number; revenue: number; count: number }[] = [];

  try {
    // Get data for each month
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1, 0, 0, 0, 0);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('dateTime', '>=', Timestamp.fromDate(startDate)),
        where('dateTime', '<=', Timestamp.fromDate(endDate)),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map((doc) => doc.data()) as Appointment[];

      const revenue = appointments.reduce(
        (sum, appointment) => sum + (appointment.amount || 0),
        0
      );

      results.push({
        month: month + 1, // 1-indexed
        revenue,
        count: appointments.length,
      });
    }

    return results;
  } catch (error) {
    console.error('Error getting monthly revenue breakdown:', error);
    throw error;
  }
}

/**
 * Generate fiscal declaration data
 * Returns a formatted summary suitable for tax declaration
 */
export async function generateFiscalDeclarationData(year: number): Promise<{
  fiscalYear: number;
  totalRevenue: number;
  totalAppointments: number;
  monthlyBreakdown: { month: number; revenue: number; count: number }[];
  generatedAt: Date;
}> {
  const monthlyBreakdown = await getMonthlyRevenueBreakdown(year);
  const totalRevenue = monthlyBreakdown.reduce((sum, item) => sum + item.revenue, 0);
  const totalAppointments = monthlyBreakdown.reduce((sum, item) => sum + item.count, 0);

  return {
    fiscalYear: year,
    totalRevenue,
    totalAppointments,
    monthlyBreakdown,
    generatedAt: new Date(),
  };
}
