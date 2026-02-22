/**
 * POST /api/email/send
 *
 * Generic transactional email dispatcher.
 * Called from client-side components (which cannot use Resend directly).
 *
 * Body: { type: EmailType; payload: <type-specific shape> }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendAppointmentConfirmedEmail,
  sendAppointmentGarageNotifEmail,
  sendAppointmentCancelledEmail,
  sendAppointmentDeletedEmail,
  sendAppointmentRescheduledEmail,
  sendAppointmentCompletedEmail,
  sendQuotationEmail,
  sendInvoiceEmail,
  sendInvoiceOverdueEmail,
  sendAppointmentReminderEmail,
  sendWorkCompletedEmail,
} from '@/lib/email/emails';

export type EmailType =
  | 'WELCOME'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_GARAGE_NOTIF'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_DELETED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_COMPLETED'
  | 'QUOTATION_SENT'
  | 'INVOICE_SENT'
  | 'INVOICE_OVERDUE'
  | 'APPOINTMENT_REMINDER'
  | 'WORK_COMPLETED';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body as { type: EmailType; payload: unknown };

    if (!type || !payload) {
      return NextResponse.json(
        { success: false, error: 'Missing type or payload' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'WELCOME':
        result = await sendWelcomeEmail(payload as Parameters<typeof sendWelcomeEmail>[0]);
        break;

      case 'APPOINTMENT_CONFIRMED':
        result = await sendAppointmentConfirmedEmail(
          payload as Parameters<typeof sendAppointmentConfirmedEmail>[0]
        );
        break;

      case 'APPOINTMENT_GARAGE_NOTIF':
        result = await sendAppointmentGarageNotifEmail(
          payload as Parameters<typeof sendAppointmentGarageNotifEmail>[0]
        );
        break;

      case 'APPOINTMENT_CANCELLED':
        result = await sendAppointmentCancelledEmail(
          payload as Parameters<typeof sendAppointmentCancelledEmail>[0]
        );
        break;

      case 'APPOINTMENT_DELETED':
        result = await sendAppointmentDeletedEmail(
          payload as Parameters<typeof sendAppointmentDeletedEmail>[0]
        );
        break;

      case 'APPOINTMENT_RESCHEDULED':
        result = await sendAppointmentRescheduledEmail(
          payload as Parameters<typeof sendAppointmentRescheduledEmail>[0]
        );
        break;

      case 'APPOINTMENT_COMPLETED':
        result = await sendAppointmentCompletedEmail(
          payload as Parameters<typeof sendAppointmentCompletedEmail>[0]
        );
        break;

      case 'QUOTATION_SENT':
        result = await sendQuotationEmail(payload as Parameters<typeof sendQuotationEmail>[0]);
        break;

      case 'INVOICE_SENT':
        result = await sendInvoiceEmail(payload as Parameters<typeof sendInvoiceEmail>[0]);
        break;

      case 'INVOICE_OVERDUE':
        result = await sendInvoiceOverdueEmail(
          payload as Parameters<typeof sendInvoiceOverdueEmail>[0]
        );
        break;

      case 'APPOINTMENT_REMINDER':
        result = await sendAppointmentReminderEmail(
          payload as Parameters<typeof sendAppointmentReminderEmail>[0]
        );
        break;

      case 'WORK_COMPLETED':
        result = await sendWorkCompletedEmail(
          payload as Parameters<typeof sendWorkCompletedEmail>[0]
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      console.error(`[Email API] Failed to send ${type}:`, result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('[Email API] Unhandled error:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
