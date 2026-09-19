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
 */

import handler from '../../../../server/payments/webhook';

export async function POST(req: Request) {
    const result = await handler(req);
    if (result instanceof Response) {
        return result;
    }
    return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
