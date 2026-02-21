import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/emailService';
import { BaseEmailTemplateProps } from '@/lib/email/templates/BaseEmailTemplate';

/**
 * Development-only endpoint to preview / test the email template.
 * POST /api/email/test  { "to": "you@example.com" }
 *
 * Remove or guard with auth before deploying to production.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const to: string = body.to ?? 'test@example.com';

  const template: BaseEmailTemplateProps = {
    previewText: 'Test du template e-mail LCF Auto Performance',
    blocks: [
      {
        type: 'banner',
        emoji: '🔧',
        title: 'Test du template e-mail',
        subtitle: 'Ce mail vérifie que le service Resend est correctement configuré.',
        color: '#0E677F',
      },
      {
        type: 'text',
        content:
          'Bonjour,\n\nVoici un aperçu de tous les blocs disponibles dans le template de base LCF Auto Performance.',
      },
      {
        type: 'info-table',
        rows: [
          { icon: '🔧', label: 'Service', value: 'Entretien complet' },
          { icon: '📅', label: 'Date', value: 'Lundi 23 février 2026' },
          { icon: '🕐', label: 'Heure', value: '10:00' },
          { icon: '🚗', label: 'Véhicule', value: 'Renault Clio — AA-123-BB' },
        ],
      },
      {
        type: 'buttons',
        buttons: [
          { label: 'Bouton principal', href: 'https://lcf-auto-performance.fr', variant: 'primary' },
          { label: 'Bouton secondaire', href: 'https://lcf-auto-performance.fr', variant: 'outline' },
        ],
      },
      { type: 'divider' },
      {
        type: 'alert',
        color: 'blue',
        icon: 'ℹ️',
        title: 'Bloc alerte (blue)',
        items: [
          '✉️ Un email de confirmation vous a été envoyé',
          '📅 Vous pouvez modifier votre rendez-vous jusqu\'à 24h avant',
          '📍 N\'oubliez pas d\'apporter vos papiers du véhicule',
        ],
      },
      {
        type: 'alert',
        color: 'orange',
        icon: '⚠️',
        title: 'Bloc alerte (orange)',
        items: ['Exemple d\'alerte de type avertissement.'],
      },
      {
        type: 'alert',
        color: 'green',
        icon: '✅',
        title: 'Bloc alerte (green)',
        items: ['Exemple d\'alerte de type succès.'],
      },
    ],
  };

  const result = await sendEmail({
    to,
    subject: '[TEST] Template e-mail LCF Auto Performance',
    template,
    replyTo: 'lcfautoperformance@outlook.fr',
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: result.id });
}
