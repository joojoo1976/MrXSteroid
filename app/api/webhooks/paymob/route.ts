/**
 * Route Handler — /api/webhooks/paymob
 *
 * Dedicated Paymob webhook endpoint. Verification is PINNED to Paymob (HMAC
 * over the callback object); this URL can never be verified as another
 * provider and there is no fallback.
 *
 * Configure this URL in the Paymob dashboard:
 *   https://<host>/api/webhooks/paymob
 *
 * NOTE: Paymob remains hidden from the storefront (`customer_visible=false`);
 * this route only makes its webhook verifiable, it does not enable checkout.
 */

import handler from '../../../../server/payments/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const result = await handler(req, undefined, { forcedGateway: 'PAYMOB' });
    if (result instanceof Response) {
        return result;
    }
    return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
