import { Resend } from 'resend';
import { render } from '@react-email/render';
import { BaseEmailTemplate, BaseEmailTemplateProps } from './templates/BaseEmailTemplate';

// ────────────────────────────────────────────────────────────
// Resend client (server-side only — never exposed client-side)
// ────────────────────────────────────────────────────────────
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not defined. Add it to your .env.local file.'
    );
  }
  return new Resend(apiKey);
}

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
export interface SendEmailOptions {
  /** Recipient email address(es) */
  to: string | string[];
  /** Email subject line */
  subject: string;
  /** Template content — maps 1-to-1 with BaseEmailTemplateProps */
  template: BaseEmailTemplateProps;
  /**
   * Override the "From" field.
   * Defaults to: LCF Auto Performance <no-reply@lcf-auto-performance.fr>
   * During development (no verified domain) uses Resend's onboarding address.
   */
  from?: string;
  /** Optional Reply-To address */
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ────────────────────────────────────────────────────────────
// Default sender
// ────────────────────────────────────────────────────────────
const DEFAULT_FROM =
  process.env.EMAIL_FROM ?? 'LCF Auto Performance <onboarding@resend.dev>';

/**
 * Resolve the actual recipient(s).
 *
 * While no domain is verified on Resend, set EMAIL_TEST_RECIPIENT in .env
 * to redirect ALL outgoing emails to that single address.
 * Once a domain is verified and EMAIL_TEST_RECIPIENT is removed, emails go
 * to their real recipients.
 */
function resolveRecipients(to: string | string[]): string[] {
  const testRecipient = process.env.EMAIL_TEST_RECIPIENT;
  const recipients = Array.isArray(to) ? to : [to];

  if (testRecipient) {
    if (recipients.join(',') !== testRecipient) {
      console.log(
        `[Email] TEST MODE — redirecting to ${testRecipient} (original: ${recipients.join(', ')})`
      );
    }
    return [testRecipient];
  }

  return recipients;
}

// ────────────────────────────────────────────────────────────
// Core send function
// ────────────────────────────────────────────────────────────
/**
 * Send a transactional email using Resend + the shared BaseEmailTemplate.
 *
 * @example
 * await sendEmail({
 *   to: 'client@example.com',
 *   subject: 'Votre rendez-vous est confirmé',
 *   template: {
 *     previewText: 'RDV confirmé le lundi 20 février à 10h00',
 *     blocks: [
 *       { type: 'banner', emoji: '✅', title: 'Rendez-vous confirmé !', subtitle: 'Nous avons hâte de vous accueillir' },
 *       { type: 'text', content: 'Bonjour Jean, voici les détails de votre rendez-vous.' },
 *       { type: 'info-table', rows: [
 *           { icon: '🔧', label: 'Service', value: 'Entretien' },
 *           { icon: '📅', label: 'Date', value: 'Lundi 20 février 2026' },
 *           { icon: '🕐', label: 'Heure', value: '10:00' },
 *         ]
 *       },
 *       { type: 'buttons', buttons: [{ label: 'Voir mes rendez-vous', href: 'https://…/dashboard' }] },
 *       { type: 'divider' },
 *       { type: 'alert', color: 'blue', icon: 'ℹ️', title: 'À noter', items: ['Pensez à apporter vos papiers.'] },
 *     ],
 *   },
 * });
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();

    const html = await render(
      BaseEmailTemplate({
        previewText: options.template.previewText,
        blocks: options.template.blocks,
      })
    );

    const { data, error } = await resend.emails.send({
      from: options.from ?? DEFAULT_FROM,
      to: resolveRecipients(options.to),
      subject: options.subject,
      html,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully. ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Email] Unexpected error:', err);
    return { success: false, error: err?.message ?? 'Unknown error' };
  }
}

// ────────────────────────────────────────────────────────────
// Convenience: send to multiple recipients in parallel
// ────────────────────────────────────────────────────────────
export async function sendEmailToMany(
  recipients: string[],
  options: Omit<SendEmailOptions, 'to'>
): Promise<SendEmailResult[]> {
  return Promise.all(recipients.map((to) => sendEmail({ ...options, to })));
}
