import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Hr,
  Img,
  Link,
  Preview,
  Font,
} from '@react-email/components';
import { ReactNode, CSSProperties } from 'react';

// ────────────────────────────────────────────────────────────
// Token design (calqués sur globals.css + tailwind.config.js)
// ────────────────────────────────────────────────────────────
const BRAND = {
  accent: '#1CCEFF',
  accentDark: '#0E677F',
  bg: '#FFFFFF',
  bgSecondary: '#F8F9FA',
  text: '#212529',
  textMuted: '#6C757D',
  border: '#DEE2E6',
  gradientFrom: '#2563EB',   // blue-600
  gradientTo: '#1CCEFF',     // accent
} as const;

// ────────────────────────────────────────────────────────────
// Block types accepted by the template
// ────────────────────────────────────────────────────────────
export interface EmailButton {
  label: string;
  href: string;
  variant?: 'primary' | 'outline';
}

export interface EmailInfoRow {
  label: string;
  value: string;
  icon?: string; // emoji or text symbol
}

export interface EmailSection {
  type: 'text';
  content: string;
}

export interface EmailBannerSection {
  type: 'banner';
  emoji?: string;
  title: string;
  subtitle?: string;
  /** background color override */
  color?: string;
}

export interface EmailInfoTableSection {
  type: 'info-table';
  rows: EmailInfoRow[];
}

export interface EmailButtonsSection {
  type: 'buttons';
  buttons: EmailButton[];
}

export interface EmailDividerSection {
  type: 'divider';
}

export interface EmailAlertSection {
  type: 'alert';
  icon?: string;
  title?: string;
  items: string[];
  color?: 'blue' | 'orange' | 'green' | 'red';
}

export type EmailBlock =
  | EmailSection
  | EmailBannerSection
  | EmailInfoTableSection
  | EmailButtonsSection
  | EmailDividerSection
  | EmailAlertSection;

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────
export interface BaseEmailTemplateProps {
  /** Short preview text shown in email clients (< 150 chars) */
  previewText: string;
  /** Blocks rendered inside the card body, in order */
  blocks: EmailBlock[];
}

// ────────────────────────────────────────────────────────────
// Sub-renderers
// ────────────────────────────────────────────────────────────

function renderText(block: EmailSection) {
  return (
    <Text key={block.content.slice(0, 20)} style={styles.text}>
      {block.content}
    </Text>
  );
}

function renderBanner(block: EmailBannerSection) {
  const bg = block.color ?? BRAND.accentDark;
  return (
    <Section key={block.title} style={{ ...styles.banner, backgroundColor: bg }}>
      {block.emoji && (
        <Text style={styles.bannerEmoji}>{block.emoji}</Text>
      )}
      <Heading as="h2" style={styles.bannerTitle}>
        {block.title}
      </Heading>
      {block.subtitle && (
        <Text style={styles.bannerSubtitle}>{block.subtitle}</Text>
      )}
    </Section>
  );
}

function renderInfoTable(block: EmailInfoTableSection) {
  return (
    <Section key="info-table" style={styles.infoTable}>
      {block.rows.map((row, i) => (
        <Row key={i} style={i % 2 === 0 ? styles.infoRowEven : styles.infoRowOdd}>
          <Column style={styles.infoLabel}>
            {row.icon && <span style={{ marginRight: 6 }}>{row.icon}</span>}
            {row.label}
          </Column>
          <Column style={styles.infoValue}>{row.value}</Column>
        </Row>
      ))}
    </Section>
  );
}

function renderButtons(block: EmailButtonsSection) {
  return (
    <Section key="buttons" style={styles.buttonsSection}>
      {block.buttons.map((btn, i) => (
        <Button
          key={i}
          href={btn.href}
          style={btn.variant === 'outline' ? styles.btnOutline : styles.btnPrimary}
        >
          {btn.label}
        </Button>
      ))}
    </Section>
  );
}

function renderDivider() {
  return <Hr key="divider" style={styles.divider} />;
}

const ALERT_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  blue:   { bg: '#EFF6FF', border: '#BFDBFE', icon: '#3B82F6' },
  orange: { bg: '#FFF7ED', border: '#FED7AA', icon: '#F97316' },
  green:  { bg: '#F0FDF4', border: '#BBF7D0', icon: '#22C55E' },
  red:    { bg: '#FEF2F2', border: '#FECACA', icon: '#EF4444' },
};

function renderAlert(block: EmailAlertSection) {
  const palette = ALERT_COLORS[block.color ?? 'blue'];
  return (
    <Section
      key="alert"
      style={{
        ...styles.alertBox,
        backgroundColor: palette.bg,
        borderLeft: `4px solid ${palette.border}`,
      }}
    >
      {block.title && (
        <Text style={{ ...styles.alertTitle, color: palette.icon }}>
          {block.icon ?? 'ℹ️'} {block.title}
        </Text>
      )}
      {block.items.map((item, i) => (
        <Text key={i} style={styles.alertItem}>
          {item}
        </Text>
      ))}
    </Section>
  );
}

function renderBlock(block: EmailBlock, index: number): ReactNode {
  switch (block.type) {
    case 'text':         return renderText(block);
    case 'banner':       return renderBanner(block);
    case 'info-table':   return renderInfoTable(block);
    case 'buttons':      return renderButtons(block);
    case 'divider':      return renderDivider();
    case 'alert':        return renderAlert(block);
    default:             return null;
  }
}

// ────────────────────────────────────────────────────────────
// Main template
// ────────────────────────────────────────────────────────────
export function BaseEmailTemplate({ previewText, blocks }: BaseEmailTemplateProps) {
  return (
    <Html lang="fr" dir="ltr">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={600}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* ── Header ── */}
          <Section style={styles.header}>
            <Row>
              <Column align="center">
                {/* Logo text fallback (replace src with real logo URL once hosted) */}
                <Heading as="h1" style={styles.logoText}>
                  LCF Auto Performance
                </Heading>
                <Text style={styles.tagline}>Garage automobile de confiance</Text>
              </Column>
            </Row>
          </Section>

          {/* ── Card body ── */}
          <Section style={styles.card}>
            {blocks.map((block, i) => renderBlock(block, i))}
          </Section>

          {/* ── Footer ── */}
          <Section style={styles.footer}>
            <Hr style={styles.footerDivider} />
            <Row>
              <Column align="center">
                <Text style={styles.footerText}>
                  <strong>LCF Auto Performance</strong>
                  <br />
                  6 Rue de la Forteresse, 41330 Saint-Bohaire, France
                  <br />
                  <Link href="tel:+33761888263" style={styles.footerLink}>
                    07 61 88 82 63
                  </Link>
                  {' · '}
                  <Link href="mailto:lcfautoperformance@outlook.fr" style={styles.footerLink}>
                    lcfautoperformance@outlook.fr
                  </Link>
                </Text>
                <Text style={styles.footerLegal}>
                  Vous recevez cet email suite à une action effectuée sur notre
                  plateforme. © {new Date().getFullYear()} LCF Auto Performance.
                </Text>
              </Column>
            </Row>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ────────────────────────────────────────────────────────────
// Styles (inline – required for email clients)
// ────────────────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: '#F0F4F8',
    fontFamily: "'Inter', Arial, sans-serif",
    margin: 0,
    padding: '32px 0',
  },
  container: {
    maxWidth: 600,
    margin: '0 auto',
  },

  // Header
  header: {
    background: `linear-gradient(135deg, ${BRAND.gradientFrom} 0%, ${BRAND.accent} 100%)`,
    borderRadius: '12px 12px 0 0',
    padding: '32px 40px 28px',
    textAlign: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 700,
    margin: '0 0 4px',
    letterSpacing: '-0.5px',
  },
  tagline: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 13,
    margin: 0,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    padding: '32px 40px',
    borderLeft: `1px solid ${BRAND.border}`,
    borderRight: `1px solid ${BRAND.border}`,
  },

  // Text block
  text: {
    color: BRAND.text,
    fontSize: 15,
    lineHeight: '1.7',
    margin: '0 0 16px',
  },

  // Banner block
  banner: {
    borderRadius: 10,
    padding: '24px 28px',
    margin: '4px 0 24px',
    textAlign: 'center',
  },
  bannerEmoji: {
    fontSize: 40,
    margin: '0 0 8px',
    lineHeight: '1',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 6px',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    margin: 0,
  },

  // Info table block
  infoTable: {
    borderRadius: 8,
    border: `1px solid ${BRAND.border}`,
    overflow: 'hidden',
    margin: '0 0 24px',
  },
  infoRowEven: {
    backgroundColor: BRAND.bg,
    padding: '10px 16px',
  },
  infoRowOdd: {
    backgroundColor: BRAND.bgSecondary,
    padding: '10px 16px',
  },
  infoLabel: {
    color: BRAND.textMuted,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    width: '40%',
    padding: '10px 12px',
  },
  infoValue: {
    color: BRAND.text,
    fontSize: 14,
    fontWeight: 600,
    padding: '10px 12px',
  },

  // Buttons block
  buttonsSection: {
    textAlign: 'center',
    margin: '8px 0 24px',
  },
  btnPrimary: {
    backgroundColor: BRAND.accent,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    padding: '14px 32px',
    borderRadius: 8,
    textDecoration: 'none',
    display: 'inline-block',
    margin: '0 8px 10px',
    letterSpacing: '0.2px',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    color: BRAND.accentDark,
    border: `2px solid ${BRAND.accentDark}`,
    fontSize: 15,
    fontWeight: 600,
    padding: '12px 30px',
    borderRadius: 8,
    textDecoration: 'none',
    display: 'inline-block',
    margin: '0 8px 10px',
  },

  // Divider block
  divider: {
    borderColor: BRAND.border,
    margin: '24px 0',
  },

  // Alert block
  alertBox: {
    borderRadius: 8,
    padding: '16px 20px',
    margin: '0 0 24px',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 700,
    margin: '0 0 8px',
  },
  alertItem: {
    color: BRAND.text,
    fontSize: 13,
    lineHeight: '1.6',
    margin: '0 0 4px',
  },

  // Footer
  footer: {
    backgroundColor: BRAND.bgSecondary,
    borderRadius: '0 0 12px 12px',
    padding: '24px 40px',
    border: `1px solid ${BRAND.border}`,
    borderTop: 'none',
  },
  footerDivider: {
    borderColor: BRAND.border,
    margin: '0 0 16px',
  },
  footerText: {
    color: BRAND.textMuted,
    fontSize: 12,
    lineHeight: '1.7',
    textAlign: 'center',
    margin: '0 0 8px',
  },
  footerLegal: {
    color: '#ADB5BD',
    fontSize: 11,
    textAlign: 'center',
    margin: 0,
  },
  footerLink: {
    color: BRAND.accentDark,
    textDecoration: 'none',
  },
};
