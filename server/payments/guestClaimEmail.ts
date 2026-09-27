/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GUEST CLAIM EMAIL (notification leaf for the deferred guest entitlement)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Deliberately a separate, tiny module so the settlement path has exactly one
 *  network dependency to reason about, and so tests can mock a single leaf.
 *
 *  CRITICAL CONTRACT
 *  This function NEVER throws and NEVER reports success unless the message was
 *  actually accepted for delivery. A settled guest capture is durable in the
 *  database regardless of what happens here, so an email failure must not
 *  unwind the payment — the claim row simply remains re-deliverable by support.
 *
 *  The claim token appears in this message and nowhere else. It is never
 *  written to a log, and only its SHA-256 digest is stored server-side.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { sendEmail, isEmailConfigured } from '../../shared/lib/emailService';

export interface GuestClaimEmailResult {
    ok: boolean;
    reason?: string;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export async function sendGuestClaimEmail(params: {
    to: string;
    productId: string;
    claimUrl: string;
    expiresAt: string;
}): Promise<GuestClaimEmailResult> {
    if (!isEmailConfigured()) {
        return { ok: false, reason: 'SMTP not configured' };
    }

    const safeClaimUrl = escapeHtml(params.claimUrl);
    const safeProduct = escapeHtml(params.productId);
    const safeExpiry = escapeHtml(params.expiresAt);

    const subject = 'Your MrXSteroid order is ready — claim your product';
    const text = [
        'Thanks for your purchase.',
        '',
        `Your order for ${params.productId} has been paid and is ready to claim.`,
        '',
        `Open this link to attach it to your account:`,
        params.claimUrl,
        '',
        `This link is single-use and expires at ${params.expiresAt}.`,
        'If you did not make this purchase you can safely ignore this email.',
    ].join('\n');

    const html = `
        <h2>Your order is ready</h2>
        <p>Thanks for your purchase of <strong>${safeProduct}</strong>. Your payment has been received and your product is ready to claim.</p>
        <p>
            <a href="${safeClaimUrl}"
               style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
                Claim your product
            </a>
        </p>
        <p>This link is single-use and expires at <strong>${safeExpiry}</strong>.</p>
        <p style="color:#666;font-size:12px;">
            If the button does not work, copy this URL into your browser:<br>
            ${safeClaimUrl}
        </p>
        <p style="color:#666;font-size:12px;">If you did not make this purchase you can safely ignore this email.</p>
    `;

    const result = await sendEmail({ to: params.to, subject, text, html });
    return result.ok ? { ok: true } : { ok: false, reason: result.reason };
}
