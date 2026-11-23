/**
 * Route Handler — /api/webhooks/stripe
 *
 * Dedicated Stripe webhook endpoint. Verification is PINNED to Stripe: the
 * canonical multi-gateway handler runs the same idempotent settlement/refund
 * pipeline as `/api/payments/callback`, but this URL can never be verified as
 * Kashier/Paymob/SpaceRemit (and there is no provider fallback at all).
 *
 * Configure this URL in the Stripe dashboard:
 *   https://<host>/api/webhooks/stripe
 */

import handler from '../../../../server/payments/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const result = await handler(req, undefined, { forcedGateway: 'STRIPE' });
    if (result instanceof Response) {
        return result;
    }
    return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
