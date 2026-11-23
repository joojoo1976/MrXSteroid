/**
 * Route Handler — /api/webhooks/spaceremit
 *
 * Dedicated SpaceRemit webhook endpoint. Verification is PINNED to SpaceRemit
 * (HMAC-SHA256 of the raw body, or explicit API verification for GET-style
 * payment codes). No other provider can be verified on this URL, and the
 * generic callback no longer falls back to SpaceRemit for unknown requests.
 *
 * Configure this URL in the SpaceRemit dashboard:
 *   https://<host>/api/webhooks/spaceremit
 */

import handler from '../../../../server/payments/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const result = await handler(req, undefined, { forcedGateway: 'SPACEREMIT' });
    if (result instanceof Response) {
        return result;
    }
    return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
