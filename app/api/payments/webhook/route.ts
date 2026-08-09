/**
 * Route Handler — /api/payments/webhook
 * Re-exports the multi-gateway webhook processor as a Next.js App Router route.
 * The underlying dual-mode handler detects the Web Fetch API signature and
 * processes Stripe/Paymob/SpaceRemit notifications accordingly.
 */
import handler from '../../../../api/payments/webhook';

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
