/**
 * @file emails.ts
 * @description All transactional email senders for LCF Auto Performance.
 *              SERVER-SIDE ONLY — do not import in client components.
 *              Each function builds the template blocks and calls sendEmail().
 */

import { sendEmail, SendEmailResult } from './emailService';

// ─────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://lcf-auto-performance.fr';
const GARAGE_EMAIL = 'lcfautoperformance@outlook.fr';
const GARAGE_PHONE = '07 61 88 82 63';
const GARAGE_ADDRESS = '6 Rue de la Forteresse, 41330 Saint-Bohaire, France';

const SERVICE_LABELS: Record<string, string> = {
  entretien: 'Entretien général',
  reparation: 'Réparation',
  reprogrammation: 'Reprogrammation moteur',
};

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────
function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

function fmtDate(value: Date | string | number): string {
  return toDate(value).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function fmtTime(value: Date | string | number): string {
  return toDate(value).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtShortDate(value: Date | string | number): string {
  return toDate(value).toLocaleDateString('fr-FR');
}

function serviceLabel(type: string): string {
  return SERVICE_LABELS[type] ?? type;
}

// ─────────────────────────────────────────────────
// Vehicle helper
// ─────────────────────────────────────────────────
function vehicleStr(v: { make: string; model: string; plate: string }): string {
  return `${v.make} ${v.model} (${v.plate})`;
}

// =================================================================
// #1 — Welcome email (new account)
// =================================================================
export interface WelcomeEmailPayload {
  email: string;
  firstName: string;
}

export async function sendWelcomeEmail(
  payload: WelcomeEmailPayload
): Promise<SendEmailResult> {
  return sendEmail({
    to: payload.email,
    subject: 'Bienvenue chez LCF Auto Performance ! 🎉',
    template: {
      previewText: 'Votre compte a été créé avec succès',
      blocks: [
        {
          type: 'banner',
          emoji: '🎉',
          title: 'Bienvenue !',
          subtitle: `Bonjour ${payload.firstName}, votre compte a été créé avec succès.`,
        },
        {
          type: 'text',
          content:
            'Vous pouvez maintenant prendre des rendez-vous en ligne, suivre l\'historique de vos véhicules et profiter de notre programme de fidélité.',
        },
        {
          type: 'buttons',
          buttons: [
            { label: 'Accéder à mon espace', href: `${BASE_URL}/dashboard` },
          ],
        },
        { type: 'divider' },
        {
          type: 'alert',
          color: 'blue',
          icon: 'ℹ️',
          title: 'Besoin d\'aide ?',
          items: [
            `Appelez-nous au ${GARAGE_PHONE}`,
            `Écrivez-nous à ${GARAGE_EMAIL}`,
          ],
        },
      ],
    },
  });
}

// =================================================================
// #20 — Welcome bonus awarded
// =================================================================
export interface WelcomeBonusEmailPayload {
  email: string;
  firstName: string;
  points: number;
}

export async function sendWelcomeBonusEmail(
  payload: WelcomeBonusEmailPayload
): Promise<SendEmailResult> {
  return sendEmail({
    to: payload.email,
    subject: `🌟 ${payload.points} points de bienvenue vous ont été offerts !`,
    template: {
      previewText: `Vous avez reçu ${payload.points} points de fidélité`,
      blocks: [
        {
          type: 'banner',
          emoji: '🌟',
          title: 'Bonus de bienvenue !',
          subtitle: `${payload.points} points ont été ajoutés à votre compte`,
        },
        {
          type: 'text',
          content: `Bonjour ${payload.firstName}, pour fêter votre inscription nous vous offrons ${payload.points} points de fidélité !`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🎁', label: 'Points offerts', value: `+${payload.points} pts` },
          ],
        },
        {
          type: 'buttons',
          buttons: [
            {
              label: 'Voir les récompenses',
              href: `${BASE_URL}/dashboard/loyalty/rewards`,
            },
          ],
        },
      ],
    },
  });
}

// =================================================================
// #5 — Appointment confirmed → user
// =================================================================
export interface AppointmentConfirmedPayload {
  email: string;
  firstName: string;
  serviceType: string;
  /** ISO string or ms timestamp */
  dateTime: string | number;
  vehicleInfo: { make: string; model: string; plate: string };
}

export async function sendAppointmentConfirmedEmail(
  payload: AppointmentConfirmedPayload
): Promise<SendEmailResult> {
  const svc = serviceLabel(payload.serviceType);
  const dt = toDate(payload.dateTime);

  return sendEmail({
    to: payload.email,
    subject: 'Votre rendez-vous est confirmé ✅',
    template: {
      previewText: `RDV • ${svc} le ${fmtDate(dt)} à ${fmtTime(dt)}`,
      blocks: [
        {
          type: 'banner',
          emoji: '✅',
          title: 'Rendez-vous confirmé !',
          subtitle: 'Nous avons hâte de vous accueillir',
        },
        {
          type: 'text',
          content: `Bonjour ${payload.firstName}, voici les détails de votre rendez-vous.`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🔧', label: 'Prestation', value: svc },
            { icon: '📅', label: 'Date', value: fmtDate(dt) },
            { icon: '🕐', label: 'Heure', value: fmtTime(dt) },
            { icon: '🚗', label: 'Véhicule', value: vehicleStr(payload.vehicleInfo) },
          ],
        },
        {
          type: 'buttons',
          buttons: [
            { label: 'Voir mes rendez-vous', href: `${BASE_URL}/dashboard` },
          ],
        },
        { type: 'divider' },
        {
          type: 'alert',
          color: 'blue',
          icon: 'ℹ️',
          title: 'Informations pratiques',
          items: [
            `Adresse : ${GARAGE_ADDRESS}`,
            `Téléphone : ${GARAGE_PHONE}`,
            'En cas d\'empêchement, merci de nous prévenir au moins 24 h à l\'avance.',
          ],
        },
      ],
    },
  });
}

// =================================================================
// #6 — New appointment notification → garage
// =================================================================
export interface AppointmentGarageNotifPayload {
  customerName: string;
  customerEmail: string;
  serviceType: string;
  dateTime: string | number;
  vehicleInfo: { make: string; model: string; plate: string };
  notes?: string;
}

export async function sendAppointmentGarageNotifEmail(
  payload: AppointmentGarageNotifPayload
): Promise<SendEmailResult> {
  const svc = serviceLabel(payload.serviceType);
  const dt = toDate(payload.dateTime);

  return sendEmail({
    to: GARAGE_EMAIL,
    subject: `🔔 Nouveau RDV — ${payload.customerName} — ${fmtDate(dt)}`,
    template: {
      previewText: `Nouveau rendez-vous de ${payload.customerName} pour ${svc}`,
      blocks: [
        {
          type: 'banner',
          emoji: '🔔',
          title: 'Nouveau rendez-vous',
          subtitle: `Pris en ligne par ${payload.customerName}`,
        },
        {
          type: 'info-table',
          rows: [
            {
              icon: '👤',
              label: 'Client',
              value: `${payload.customerName} (${payload.customerEmail})`,
            },
            { icon: '🔧', label: 'Prestation', value: svc },
            { icon: '📅', label: 'Date', value: fmtDate(dt) },
            { icon: '🕐', label: 'Heure', value: fmtTime(dt) },
            { icon: '🚗', label: 'Véhicule', value: vehicleStr(payload.vehicleInfo) },
            ...(payload.notes
              ? [{ icon: '💬', label: 'Notes client', value: payload.notes }]
              : []),
          ],
        },
        {
          type: 'buttons',
          buttons: [
            {
              label: 'Voir le calendrier',
              href: `${BASE_URL}/admin/calendrier`,
            },
          ],
        },
      ],
    },
  });
}

// =================================================================
// #8 — Appointment cancelled by user
// =================================================================
export interface AppointmentCancelledPayload {
  email: string;
  firstName: string;
  serviceType: string;
  dateTime: string | number;
  vehicleInfo: { make: string; model: string; plate: string };
}

export async function sendAppointmentCancelledEmail(
  payload: AppointmentCancelledPayload
): Promise<SendEmailResult> {
  const svc = serviceLabel(payload.serviceType);
  const dt = toDate(payload.dateTime);

  return sendEmail({
    to: payload.email,
    subject: 'Annulation de votre rendez-vous',
    template: {
      previewText: `Votre rendez-vous du ${fmtDate(dt)} a été annulé`,
      blocks: [
        {
          type: 'banner',
          emoji: '❌',
          title: 'Rendez-vous annulé',
          subtitle: 'Votre annulation a bien été prise en compte',
        },
        {
          type: 'text',
          content: `Bonjour ${payload.firstName}, votre rendez-vous suivant a été annulé :`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🔧', label: 'Prestation', value: svc },
            { icon: '📅', label: 'Date', value: fmtDate(dt) },
            { icon: '🕐', label: 'Heure', value: fmtTime(dt) },
            { icon: '🚗', label: 'Véhicule', value: vehicleStr(payload.vehicleInfo) },
          ],
        },
        {
          type: 'buttons',
          buttons: [
            {
              label: 'Prendre un nouveau rendez-vous',
              href: `${BASE_URL}/rendez-vous`,
            },
          ],
        },
        {
          type: 'alert',
          color: 'orange',
          icon: '📞',
          title: 'Des questions ?',
          items: [`Appelez-nous au ${GARAGE_PHONE}`],
        },
      ],
    },
  });
}

// =================================================================
// #10 — Appointment deleted by admin
// =================================================================
export interface AppointmentDeletedPayload {
  email: string;
  firstName: string;
  serviceType: string;
  dateTime: string | number;
  vehicleInfo: { make: string; model: string; plate: string };
}

export async function sendAppointmentDeletedEmail(
  payload: AppointmentDeletedPayload
): Promise<SendEmailResult> {
  const svc = serviceLabel(payload.serviceType);
  const dt = toDate(payload.dateTime);

  return sendEmail({
    to: payload.email,
    subject: 'Votre rendez-vous a été annulé par le garage',
    template: {
      previewText: `Votre rendez-vous du ${fmtDate(dt)} a été annulé par le garage`,
      blocks: [
        {
          type: 'banner',
          emoji: '⚠️',
          title: 'Rendez-vous annulé',
          subtitle: 'Votre rendez-vous a été annulé par notre équipe',
        },
        {
          type: 'text',
          content: `Bonjour ${payload.firstName}, nous avons dû annuler votre rendez-vous suivant :`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🔧', label: 'Prestation', value: svc },
            { icon: '📅', label: 'Date', value: fmtDate(dt) },
            { icon: '🕐', label: 'Heure', value: fmtTime(dt) },
            { icon: '🚗', label: 'Véhicule', value: vehicleStr(payload.vehicleInfo) },
          ],
        },
        {
          type: 'buttons',
          buttons: [
            {
              label: 'Reprendre un rendez-vous',
              href: `${BASE_URL}/rendez-vous`,
            },
          ],
        },
        {
          type: 'alert',
          color: 'orange',
          icon: '📞',
          title: 'Des questions ?',
          items: [
            `Contactez-nous au ${GARAGE_PHONE}`,
            `Ou par email : ${GARAGE_EMAIL}`,
          ],
        },
      ],
    },
  });
}

// =================================================================
// #12 — Appointment rescheduled by admin
// =================================================================
export interface AppointmentRescheduledPayload {
  email: string;
  firstName: string;
  serviceType: string;
  oldDateTime: string | number;
  newDateTime: string | number;
  vehicleInfo: { make: string; model: string; plate: string };
}

export async function sendAppointmentRescheduledEmail(
  payload: AppointmentRescheduledPayload
): Promise<SendEmailResult> {
  const svc = serviceLabel(payload.serviceType);
  const oldDt = toDate(payload.oldDateTime);
  const newDt = toDate(payload.newDateTime);

  return sendEmail({
    to: payload.email,
    subject: 'Votre rendez-vous a été reprogrammé 🔄',
    template: {
      previewText: `Nouveau créneau : ${fmtDate(newDt)} à ${fmtTime(newDt)}`,
      blocks: [
        {
          type: 'banner',
          emoji: '🔄',
          title: 'Rendez-vous modifié',
          subtitle: 'Le garage a mis à jour votre rendez-vous',
        },
        {
          type: 'text',
          content: `Bonjour ${payload.firstName}, votre rendez-vous a été reprogrammé. Voici le nouveau créneau :`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🔧', label: 'Prestation', value: svc },
            {
              icon: '📅',
              label: 'Ancienne date',
              value: `${fmtDate(oldDt)} à ${fmtTime(oldDt)}`,
            },
            {
              icon: '✅',
              label: 'Nouvelle date',
              value: `${fmtDate(newDt)} à ${fmtTime(newDt)}`,
            },
            { icon: '🚗', label: 'Véhicule', value: vehicleStr(payload.vehicleInfo) },
          ],
        },
        {
          type: 'buttons',
          buttons: [
            { label: 'Voir mon espace', href: `${BASE_URL}/dashboard` },
          ],
        },
        {
          type: 'alert',
          color: 'blue',
          icon: 'ℹ️',
          title: 'Une question ?',
          items: [`Contactez-nous au ${GARAGE_PHONE}`],
        },
      ],
    },
  });
}

// =================================================================
// #13 — Appointment completed + points earned
// =================================================================
export interface AppointmentCompletedPayload {
  email: string;
  firstName: string;
  serviceType: string;
  dateTime: string | number;
  vehicleInfo: { make: string; model: string; plate: string };
  pointsEarned: number;
}

export async function sendAppointmentCompletedEmail(
  payload: AppointmentCompletedPayload
): Promise<SendEmailResult> {
  const svc = serviceLabel(payload.serviceType);
  const dt = toDate(payload.dateTime);

  return sendEmail({
    to: payload.email,
    subject: `🏁 Prestation terminée — +${payload.pointsEarned} points fidélité !`,
    template: {
      previewText: `Merci pour votre passage. +${payload.pointsEarned} pts ajoutés.`,
      blocks: [
        {
          type: 'banner',
          emoji: '🏁',
          title: 'Prestation terminée !',
          subtitle: 'Merci de nous avoir fait confiance',
        },
        {
          type: 'text',
          content: `Bonjour ${payload.firstName}, nous espérons que vous êtes satisfait(e) de la prestation réalisée sur votre véhicule.`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🔧', label: 'Prestation', value: svc },
            { icon: '📅', label: 'Date', value: fmtDate(dt) },
            { icon: '🚗', label: 'Véhicule', value: vehicleStr(payload.vehicleInfo) },
            {
              icon: '⭐',
              label: 'Points gagnés',
              value: `+${payload.pointsEarned} pts`,
            },
          ],
        },
        {
          type: 'buttons',
          buttons: [
            {
              label: 'Voir mes points fidélité',
              href: `${BASE_URL}/dashboard/loyalty`,
            },
          ],
        },
        {
          type: 'alert',
          color: 'green',
          icon: '⭐',
          title: 'Programme fidélité',
          items: [
            `Vous avez gagné ${payload.pointsEarned} points grâce à cette prestation.`,
            'Cumulez-les pour obtenir des récompenses exclusives !',
          ],
        },
      ],
    },
  });
}

// =================================================================
// #14 — Quotation sent to client
// =================================================================
export interface QuotationSentPayload {
  clientEmail: string;
  clientName: string;
  quotationNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalWithTax: number;
  }>;
  totalAmount: number;
  validUntil?: string | number | null;
  /** UUID token for the client acceptance link */
  acceptanceToken?: string;
}

export async function sendQuotationEmail(
  payload: QuotationSentPayload
): Promise<SendEmailResult> {
  const acceptUrl = payload.acceptanceToken
    ? `${BASE_URL}/devis/${payload.acceptanceToken}`
    : `${BASE_URL}/contact`;

  return sendEmail({
    to: payload.clientEmail,
    subject: `Votre devis n° ${payload.quotationNumber} — LCF Auto Performance`,
    replyTo: GARAGE_EMAIL,
    template: {
      previewText: `Devis n° ${payload.quotationNumber} — ${payload.totalAmount.toFixed(2)} €`,
      blocks: [
        {
          type: 'banner',
          emoji: '📄',
          title: 'Votre devis',
          subtitle: `Référence : ${payload.quotationNumber}`,
        },
        {
          type: 'text',
          content: `Bonjour ${payload.clientName}, veuillez trouver ci-dessous votre devis. Vous pouvez l'accepter ou le refuser directement en cliquant sur le bouton ci-dessous.`,
        },
        {
          type: 'info-table',
          rows: [
            ...payload.items.map((item) => ({
              icon: '🔹',
              label: `${item.quantity}x ${item.description}`,
              value: `${item.totalWithTax.toFixed(2)} € TTC`,
            })),
            {
              icon: '💰',
              label: 'TOTAL TTC',
              value: `${payload.totalAmount.toFixed(2)} €`,
            },
            ...(payload.validUntil
              ? [
                {
                  icon: '📅',
                  label: 'Valable jusqu\'au',
                  value: fmtShortDate(payload.validUntil),
                },
              ]
              : []),
          ],
        },
        {
          type: 'buttons',
          buttons: [
            { label: '✅ Consulter et accepter le devis', href: acceptUrl },
          ],
        },
        {
          type: 'alert',
          color: 'blue',
          icon: 'ℹ️',
          title: 'Des questions sur ce devis ?',
          items: [
            `Téléphone : ${GARAGE_PHONE}`,
            `Email : ${GARAGE_EMAIL}`,
            `Adresse : ${GARAGE_ADDRESS}`,
          ],
        },
      ],
    },
  });
}


// =================================================================
// #17 — Invoice sent to client
// =================================================================
export interface InvoiceSentPayload {
  customerEmail: string;
  customerName: string;
  invoiceNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalWithTax: number;
  }>;
  total: number;
  dueDate?: string | number | null;
}

export async function sendInvoiceEmail(
  payload: InvoiceSentPayload
): Promise<SendEmailResult> {
  return sendEmail({
    to: payload.customerEmail,
    subject: `Facture n° ${payload.invoiceNumber} — LCF Auto Performance`,
    replyTo: GARAGE_EMAIL,
    template: {
      previewText: `Facture n° ${payload.invoiceNumber} — ${payload.total.toFixed(2)} €`,
      blocks: [
        {
          type: 'banner',
          emoji: '🧾',
          title: 'Votre facture',
          subtitle: `Référence : ${payload.invoiceNumber}`,
        },
        {
          type: 'text',
          content: `Bonjour ${payload.customerName}, veuillez trouver ci-dessous votre facture.`,
        },
        {
          type: 'info-table',
          rows: [
            ...payload.items.map((item) => ({
              icon: '🔹',
              label: `${item.quantity}x ${item.description}`,
              value: `${item.totalWithTax.toFixed(2)} € TTC`,
            })),
            {
              icon: '💰',
              label: 'TOTAL TTC',
              value: `${payload.total.toFixed(2)} €`,
            },
            ...(payload.dueDate
              ? [
                {
                  icon: '📅',
                  label: 'À régler avant le',
                  value: fmtShortDate(payload.dueDate),
                },
              ]
              : []),
          ],
        },
        {
          type: 'buttons',
          buttons: [
            { label: 'Nous contacter', href: `${BASE_URL}/contact` },
          ],
        },
        {
          type: 'alert',
          color: 'blue',
          icon: 'ℹ️',
          title: 'Informations de paiement',
          items: [
            `Pour toute question : ${GARAGE_PHONE}`,
            GARAGE_ADDRESS,
          ],
        },
      ],
    },
  });
}

// =================================================================
// #19 — Invoice overdue reminder
// =================================================================
export interface InvoiceOverduePayload {
  customerEmail: string;
  customerName: string;
  invoiceNumber: string;
  total: number;
  dueDate: string | number;
}

export async function sendInvoiceOverdueEmail(
  payload: InvoiceOverduePayload
): Promise<SendEmailResult> {
  return sendEmail({
    to: payload.customerEmail,
    subject: `⚠️ Rappel de paiement — Facture n° ${payload.invoiceNumber}`,
    replyTo: GARAGE_EMAIL,
    template: {
      previewText: `La facture n° ${payload.invoiceNumber} est en attente de règlement`,
      blocks: [
        {
          type: 'banner',
          emoji: '⚠️',
          title: 'Rappel de paiement',
          subtitle: `Facture n° ${payload.invoiceNumber}`,
        },
        {
          type: 'text',
          content: `Bonjour ${payload.customerName}, nous vous rappelons que la facture suivante est en attente de règlement.`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🧾', label: 'Facture n°', value: payload.invoiceNumber },
            { icon: '💰', label: 'Montant', value: `${payload.total.toFixed(2)} €` },
            {
              icon: '📅',
              label: 'Date d\'échéance',
              value: fmtShortDate(payload.dueDate),
            },
          ],
        },
        {
          type: 'alert',
          color: 'red',
          icon: '⚠️',
          title: 'Action requise',
          items: [
            'Merci de procéder au règlement dès que possible.',
            `Téléphone : ${GARAGE_PHONE}`,
            `Email : ${GARAGE_EMAIL}`,
          ],
        },
      ],
    },
  });
}

// =================================================================
// #22 — Reward claimed
// =================================================================
export interface RewardClaimedPayload {
  email: string;
  firstName: string;
  rewardName: string;
  rewardDescription: string;
  pointsCost: number;
}

export async function sendRewardClaimedEmail(
  payload: RewardClaimedPayload
): Promise<SendEmailResult> {
  return sendEmail({
    to: payload.email,
    subject: `🎁 Récompense obtenue : ${payload.rewardName}`,
    template: {
      previewText: `Votre récompense "${payload.rewardName}" est prête !`,
      blocks: [
        {
          type: 'banner',
          emoji: '🎁',
          title: 'Récompense obtenue !',
          subtitle: payload.rewardName,
        },
        {
          type: 'text',
          content: `Bonjour ${payload.firstName}, votre récompense a bien été enregistrée.`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🎁', label: 'Récompense', value: payload.rewardName },
            { icon: '📝', label: 'Description', value: payload.rewardDescription },
            { icon: '⭐', label: 'Points utilisés', value: `-${payload.pointsCost} pts` },
          ],
        },
        {
          type: 'buttons',
          buttons: [
            {
              label: 'Voir mes récompenses',
              href: `${BASE_URL}/dashboard/loyalty/rewards`,
            },
          ],
        },
        {
          type: 'alert',
          color: 'green',
          icon: '✅',
          title: 'Comment l\'utiliser ?',
          items: [
            'Présentez cette confirmation lors de votre prochaine visite.',
            `Téléphone : ${GARAGE_PHONE}`,
          ],
        },
      ],
    },
  });
}

// =================================================================
// #7 — Appointment reminder (24 h) — also used by Cloud Function
// =================================================================
export interface AppointmentReminderPayload {
  email: string;
  firstName: string;
  serviceType: string;
  dateTime: string | number;
  vehicleInfo: { make: string; model: string; plate: string };
}

export async function sendAppointmentReminderEmail(
  payload: AppointmentReminderPayload
): Promise<SendEmailResult> {
  const svc = serviceLabel(payload.serviceType);
  const dt = toDate(payload.dateTime);

  return sendEmail({
    to: payload.email,
    subject: `Rappel : votre rendez-vous de demain ⏰`,
    template: {
      previewText: `Rappel — ${svc} demain ${fmtDate(dt)} à ${fmtTime(dt)}`,
      blocks: [
        {
          type: 'banner',
          emoji: '⏰',
          title: 'Rappel de rendez-vous',
          subtitle: 'Votre rendez-vous est demain !',
        },
        {
          type: 'text',
          content: `Bonjour ${payload.firstName}, nous vous rappelons votre rendez-vous prévu demain.`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🔧', label: 'Prestation', value: svc },
            { icon: '📅', label: 'Date', value: fmtDate(dt) },
            { icon: '🕐', label: 'Heure', value: fmtTime(dt) },
            { icon: '🚗', label: 'Véhicule', value: vehicleStr(payload.vehicleInfo) },
          ],
        },
        {
          type: 'buttons',
          buttons: [
            { label: 'Voir mon rendez-vous', href: `${BASE_URL}/dashboard` },
          ],
        },
        {
          type: 'alert',
          color: 'blue',
          icon: 'ℹ️',
          title: 'Informations pratiques',
          items: [
            `Adresse : ${GARAGE_ADDRESS}`,
            `Téléphone : ${GARAGE_PHONE}`,
            'En cas d\'empêchement, merci de nous prévenir dès que possible.',
          ],
        },
      ],
    },
  });
}

// =================================================================
// #25 — Work completed notification (with or without invoice)
// =================================================================
export interface WorkCompletedPayload {
  clientEmail: string;
  clientName: string;
  workOrderDescription: string;
  quotationNumber: string;
  /** Whether the invoice was sent with the notification */
  withInvoice: boolean;
  invoiceNumber?: string;
  invoiceTotal?: number;
}

export async function sendWorkCompletedEmail(
  payload: WorkCompletedPayload
): Promise<SendEmailResult> {
  const invoiceAlertBlocks = payload.withInvoice && payload.invoiceNumber
    ? [
      {
        type: 'alert' as const,
        color: 'green' as const,
        icon: '🧾',
        title: `Facture n° ${payload.invoiceNumber} — ${payload.invoiceTotal?.toFixed(2)} € TTC`,
        items: [
          'Votre facture est disponible. Merci de procéder au règlement dès que possible.',
          `Pour toute question : ${GARAGE_PHONE}`,
        ],
      },
    ]
    : [];

  return sendEmail({
    to: payload.clientEmail,
    subject: `✅ Travaux terminés — Réf. ${payload.quotationNumber} — LCF Auto Performance`,
    replyTo: GARAGE_EMAIL,
    template: {
      previewText: `Vos travaux (devis ${payload.quotationNumber}) sont terminés`,
      blocks: [
        {
          type: 'banner',
          emoji: '✅',
          title: 'Travaux terminés !',
          subtitle: `Référence devis : ${payload.quotationNumber}`,
        },
        {
          type: 'text',
          content: `Bonjour ${payload.clientName}, nous avons le plaisir de vous informer que vos travaux sont terminés et que votre véhicule est prêt à être récupéré.`,
        },
        {
          type: 'info-table',
          rows: [
            { icon: '🔧', label: 'Travaux réalisés', value: payload.workOrderDescription },
            { icon: '📄', label: 'Réf. devis', value: payload.quotationNumber },
          ],
        },
        ...invoiceAlertBlocks,
        {
          type: 'buttons',
          buttons: [
            { label: 'Nous contacter', href: `${BASE_URL}/contact` },
          ],
        },
        {
          type: 'alert',
          color: 'blue',
          icon: 'ℹ️',
          title: 'Informations pratiques',
          items: [
            `Adresse : ${GARAGE_ADDRESS}`,
            `Téléphone : ${GARAGE_PHONE}`,
            `Email : ${GARAGE_EMAIL}`,
          ],
        },
      ],
    },
  });
}

