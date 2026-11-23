/**
 * Route Handler — /api/webhooks/kashier
 *
 * Dedicated Kashier Webhook endpoint compliant with Kashier webhook specifications.
 * Delegates directly to the canonical multi-gateway webhook processor which implements:
 *   1. Raw body HMAC-SHA256 signature verification (Payment API Key / Secret).
 *   2. Deduplication via `webhook_events` table (provider_event_id unique constraint).
 *   3. Replay guard and idempotency check against invoices and payment_intents.
 *   4. Order amount and currency verification.
 *   5. Subscription activation and Product Entitlements.
 *   6. Server-side affiliate attribution retrieval from invoices.
 *   7. Commission calculation & atomic PostgreSQL RPC (`affiliate_create_commission`).
 *   8. Financial ledger journals and revenue splits.
 *
 * PROVIDER PINNING (Phase B follow-up)
 * ------------------------------------
 * This endpoint must never verify a non-Kashier payload. It is restricted to
 * the Kashier provider family — `KASHIER_EGYPT` and `KASHIER_GLOBAL` — rather
 * than a single account, because Kashier runs two merchant identities and the
 * handler still needs its EG/GLOBAL cross-account routing to accept both.
 * A request signed for Stripe/Paymob/SpaceRemit/Fourthwall is rejected with
 * 401 before any signature check, exactly like the other dedicated routes.
 */

import handler from '../../../../server/payments/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const result = await handler(req, undefined, {
        allowedGateways: ['KASHIER_EGYPT', 'KASHIER_GLOBAL'],
    });
    if (result instanceof Response) {
        return result;
    }
    return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
