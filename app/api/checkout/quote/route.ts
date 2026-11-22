/**
 * Route Handler — POST /api/checkout/quote
 *
 * Phase 3: read-only quote. Builds proposed invoice lines from the canonical
 * pricing catalog, signs a short-lived quote_token, and returns the breakdown.
 *
 * The route is still READ-ONLY: it resolves the same `admin_settings` pricing
 * catalog the invoice path uses through the dedicated loader, but it never
 * creates an order, invoice, payment intent or gateway session.
 */
import { buildCorsHeaders, corsPreflightResponse } from '../../../../server/cors/corsConfig';
import { enforceRateLimit, clientIp } from '../../../../lib/ratelimit';
import {
    QuoteRequestSchema,
    QuoteValidationError,
    QuoteTokenError,
    buildQuote,
    findForbiddenPriceFields,
} from '../../../../server/payments/quote';
import { loadQuotePricing } from '../../../../server/payments/quotePricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body: unknown, status = 200, req?: Request): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...(req ? buildCorsHeaders(req) : {}),
        },
    });

export async function OPTIONS(req: Request) {
    return corsPreflightResponse(req, 'POST, OPTIONS', 'Content-Type');
}

export async function POST(req: Request) {
    const rate = await enforceRateLimit(`quote:${clientIp(req)}`);
    if (!rate.success) {
        return json({ success: false, error: 'Rate limit exceeded. Please wait a moment and try again.' }, 429, req);
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return json({ success: false, error: 'Invalid JSON body' }, 400, req);
    }

    const forbidden = findForbiddenPriceFields(body);
    if (forbidden.length > 0) {
        return json({
            success: false,
            error: `Client-supplied price fields are not allowed: ${forbidden.join(', ')}. The server prices the cart.`,
            code: 'CLIENT_PRICE_FIELD_FORBIDDEN',
            fields: forbidden,
        }, 400, req);
    }

    const parsed = QuoteRequestSchema.safeParse(body);
    if (!parsed.success) {
        return json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_FAILED',
            details: parsed.error.flatten().fieldErrors,
        }, 400, req);
    }

    try {
        const pricing = await loadQuotePricing();
        const quote = buildQuote(parsed.data, { pricing });
        return json({ success: true, ...quote }, 200, req);
    } catch (error) {
        if (error instanceof QuoteValidationError) {
            return json({ success: false, error: error.message, code: error.code }, 400, req);
        }
        if (error instanceof QuoteTokenError) {
            if (error.code === 'MISSING_SECRET') {
                console.error('[Quote] Signing secret is not configured.');
                return json({ success: false, error: 'Quote signing is not configured.' }, 500, req);
            }
            return json({ success: false, error: error.message, code: error.code }, 400, req);
        }
        const message = error instanceof Error ? error.message : String(error);
        console.error('[Quote] Unhandled error:', message);
        return json({ success: false, error: 'Internal server error' }, 500, req);
    }
}
