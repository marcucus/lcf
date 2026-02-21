/**
 * @file emailClient.ts
 * @description Thin client-side wrapper to call the /api/email/send route.
 *              Safe to import from any 'use client' component.
 */

import type { EmailType } from '@/app/api/email/send/route';

/**
 * Fire-and-forget email call. Errors are logged but never thrown,
 * so UI interactions are never blocked by email failures.
 */
export function sendEmailAsync(type: EmailType, payload: Record<string, unknown>): void {
  fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error(`[Email] ${type} failed:`, data.error ?? res.statusText);
      }
    })
    .catch((err) => console.error(`[Email] ${type} network error:`, err));
}

/**
 * Awaitable version — use when you need to show a success/error message
 * in the UI (e.g., "Devis envoyé" confirmation).
 */
export async function sendEmailAndWait(
  type: EmailType,
  payload: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}
