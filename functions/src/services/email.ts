import * as nodemailer from 'nodemailer';
import * as logger from 'firebase-functions/logger';

/**
 * Email service configuration and utilities
 * Uses Nodemailer for sending emails
 */

// Transporter configuration
// In production, this should use environment variables for credentials
let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize the email transporter
 * Uses Gmail SMTP or a test account for development
 */
function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  // In production, use environment variables for configuration
  // For now, using ethereal for testing (or configure with real SMTP)
  const emailConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER
    ? {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      }
    : null;

  if (emailConfig) {
    transporter = nodemailer.createTransport(emailConfig);
    logger.info('Email transporter initialized with custom SMTP');
  } else {
    // For development/testing - logs email to console
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.password',
      },
    });
    logger.warn('Email transporter initialized with test configuration');
  }

  return transporter;
}

/**
 * Send an email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content
 * @param text - Plain text content
 * @returns Promise with send result
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<nodemailer.SentMessageInfo> {
  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"LCF AUTO PERFORMANCE" <noreply@lcfauto.fr>',
    to,
    subject,
    html,
    text: text || stripHtml(html),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', {
      to,
      subject,
      messageId: info.messageId,
    });
    return info;
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Strip HTML tags for plain text version
 * @param html - HTML string
 * @returns Plain text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate HTML email template for appointment confirmation
 * @param data - Appointment data
 * @returns HTML email content
 */
export function generateAppointmentConfirmationEmail(data: {
  customerName: string;
  serviceType: string;
  dateTime: Date;
  vehicleInfo: {
    make?: string;
    model?: string;
    plate?: string;
  };
  customerNotes?: string;
  appointmentId: string;
}): { html: string; text: string } {
  const { customerName, serviceType, dateTime, vehicleInfo, customerNotes, appointmentId } = data;

  // Format date and time
  const formattedDate = dateTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = dateTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Service type labels
  const serviceTypeLabels: { [key: string]: string } = {
    entretien: 'Entretien',
    reparation: 'Réparation',
    reprogrammation: 'Re-programmation',
  };
  const serviceLabel = serviceTypeLabels[serviceType] || serviceType;

  // Build vehicle info string
  const vehicleInfoStr = vehicleInfo.make && vehicleInfo.model
    ? `${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.plate ? ` (${vehicleInfo.plate})` : ''}`
    : 'Non spécifié';

  // HTML email template
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de rendez-vous</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #1CCEFF;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .appointment-details {
      background-color: #f8f9fa;
      border-left: 4px solid #1CCEFF;
      padding: 20px;
      margin: 20px 0;
    }
    .appointment-details h2 {
      margin-top: 0;
      color: #1CCEFF;
      font-size: 18px;
    }
    .detail-row {
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #dee2e6;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: bold;
      color: #495057;
      display: inline-block;
      width: 140px;
    }
    .detail-value {
      color: #212529;
    }
    .notes-section {
      margin-top: 20px;
      padding: 15px;
      background-color: #fff3cd;
      border-radius: 4px;
    }
    .notes-section h3 {
      margin-top: 0;
      font-size: 14px;
      color: #856404;
    }
    .info-box {
      background-color: #e7f3ff;
      border-left: 4px solid #0066cc;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #6c757d;
    }
    .footer p {
      margin: 5px 0;
    }
    .contact-info {
      margin-top: 15px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #1CCEFF;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 10px;
      }
      .detail-label {
        display: block;
        width: 100%;
        margin-bottom: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Rendez-vous confirmé</h1>
    </div>
    
    <div class="content">
      <p class="greeting">Bonjour ${customerName},</p>
      
      <p>Merci d'avoir pris rendez-vous avec <strong>LCF AUTO PERFORMANCE</strong>. Nous avons le plaisir de confirmer votre réservation.</p>
      
      <div class="appointment-details">
        <h2>Détails du rendez-vous</h2>
        
        <div class="detail-row">
          <span class="detail-label">Service :</span>
          <span class="detail-value">${serviceLabel}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Date :</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Heure :</span>
          <span class="detail-value">${formattedTime}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Véhicule :</span>
          <span class="detail-value">${vehicleInfoStr}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">N° de référence :</span>
          <span class="detail-value">${appointmentId.substring(0, 8).toUpperCase()}</span>
        </div>
      </div>
      
      ${customerNotes ? `
      <div class="notes-section">
        <h3>Vos notes :</h3>
        <p>${customerNotes}</p>
      </div>
      ` : ''}
      
      <div class="info-box">
        <p><strong>Informations importantes :</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Merci d'arriver 5 minutes avant l'heure du rendez-vous</li>
          <li>Vous pouvez modifier ou annuler votre rendez-vous jusqu'à 24 heures avant</li>
          <li>N'oubliez pas d'apporter votre carte grise et permis de conduire</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'https://lcfauto.fr'}/dashboard" class="button">
          Gérer mon rendez-vous
        </a>
      </div>
      
      <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à nous contacter.</p>
    </div>
    
    <div class="footer">
      <p><strong>LCF AUTO PERFORMANCE</strong></p>
      <div class="contact-info">
        <p>📍 Adresse du garage</p>
        <p>📞 Téléphone : XX XX XX XX XX</p>
        <p>✉️ Email : contact@lcfauto.fr</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px;">
        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text version
  const text = `
CONFIRMATION DE RENDEZ-VOUS - LCF AUTO PERFORMANCE

Bonjour ${customerName},

Merci d'avoir pris rendez-vous avec LCF AUTO PERFORMANCE. Nous avons le plaisir de confirmer votre réservation.

DÉTAILS DU RENDEZ-VOUS
----------------------
Service : ${serviceLabel}
Date : ${formattedDate}
Heure : ${formattedTime}
Véhicule : ${vehicleInfoStr}
N° de référence : ${appointmentId.substring(0, 8).toUpperCase()}

${customerNotes ? `VOS NOTES :\n${customerNotes}\n\n` : ''}

INFORMATIONS IMPORTANTES :
- Merci d'arriver 5 minutes avant l'heure du rendez-vous
- Vous pouvez modifier ou annuler votre rendez-vous jusqu'à 24 heures avant
- N'oubliez pas d'apporter votre carte grise et permis de conduire

Gérez votre rendez-vous en ligne : ${process.env.APP_URL || 'https://lcfauto.fr'}/dashboard

Si vous avez des questions ou besoin d'assistance, n'hésitez pas à nous contacter.

---
LCF AUTO PERFORMANCE
Adresse du garage
Téléphone : XX XX XX XX XX
Email : contact@lcfauto.fr

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
  `;

  return { html, text };
}
