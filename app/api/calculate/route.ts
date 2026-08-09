/**
 * POST /api/calculate
 * Server-side metabolic simulation endpoint.
 *
 * OWASP / zero-trust flow:
 *  1. Rate-limit the caller IP (Upstash sliding window, in-memory fallback).
 *  2. Sanitize the entire payload through the Zod schema — reject NaN, Infinity,
 *     out-of-range and unknown fields before the engine is ever touched.
 *  3. Run the pure model and return a strictly typed result.
 * No biometric data is stored server-side or client-side.
 */
import { NextResponse } from 'next/server';
import { simulateMetabolism } from '../../../lib/metabolicModel';
import { tryParseMetabolicInput } from '../../../lib/schemas/calculatorSchema';
import { enforceRateLimit, clientIp } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const ip = clientIp(req);

    const rate = await enforceRateLimit(ip);
    if (!rate.success) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again in a minute.' },
            { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Limit': String(rate.limit), 'X-RateLimit-Remaining': '0' } },
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const parsed = tryParseMetabolicInput(body);
    if (!parsed.ok) {
        return NextResponse.json(
            {
                error: 'Invalid input payload.',
                details: parsed.error.flatten().fieldErrors,
            },
            { status: 422 },
        );
    }

    const output = simulateMetabolism(parsed.data);

    return NextResponse.json(
        {
            ok: true,
            output,
            rate: { remaining: rate.remaining, limit: rate.limit },
        },
        {
            headers: {
                'Cache-Control': 'no-store',
                'X-RateLimit-Limit': String(rate.limit),
                'X-RateLimit-Remaining': String(rate.remaining),
            },
        },
    );
}
