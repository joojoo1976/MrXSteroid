/**
 * app/api/auth/check-password/route.ts
 *
 * Server-side leaked-password check endpoint (POST only).
 * The client sends the plaintext password over HTTPS to THIS application;
 * the server slices it to a SHA-1 prefix and queries HIBP (k-anonymity).
 *
 * Protections (hard requirement):
 *  - POST only (explicit 405 for GET and other methods).
 *  - JSON body only.
 *  - Hard body-size cap.
 *  - Rate limited per client IP.
 *  - Origin allowlist — cross-origin callers not in the allowlist get 403,
 *    and browsers will never receive a CORS green-light from us.
 *  - Cache-Control: no-store on every response.
 *  - The password, full hash, and request body are NEVER logged or stored.
 *  - No email / user identifier is ever sent to HIBP.
 */
import {
    checkPasswordLeaked,
    passwordLeakFailMode,
} from '../../../../server/auth/passwordSafety';
import { enforceRateLimit, clientIp } from '../../../../lib/ratelimit';
import {
    isOriginAllowed,
    corsPreflightResponse,
} from '../../../../server/cors/corsConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 2 * 1024; // 2 KB
const MAX_PASSWORD_LENGTH = 1024;

const noStoreHeaders = (): Record<string, string> => ({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
});

export async function GET(): Promise<Response> {
    return Response.json(
        { status: 'method_not_allowed' },
        { status: 405, headers: noStoreHeaders() }
    );
}

export async function POST(req: Request): Promise<Response> {
    // 1. Origin allowlist — only our own domains may call this endpoint.
    const origin = req.headers.get('origin');
    if (!origin || !isOriginAllowed(origin)) {
        return Response.json(
            { status: 'forbidden' },
            { status: 403, headers: noStoreHeaders() }
        );
    }

    // 2. Rate limit — per client IP, shared with the app's existing limiter.
    const rate = await enforceRateLimit(`password-check:${clientIp(req)}`);
    if (!rate.success) {
        return Response.json(
            { status: 'rate_limited' },
            { status: 429, headers: { ...noStoreHeaders(), 'Retry-After': '60' } }
        );
    }

    // 3. JSON content type only.
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        return Response.json(
            { status: 'invalid_request' },
            { status: 400, headers: noStoreHeaders() }
        );
    }

    // 4/5. Body-size cap — checked via Content-Length and enforced post-read.
    const contentLength = Number(req.headers.get('content-length') || '0');
    const payloadTooLarge = (): Response =>
        Response.json(
            { status: 'payload_too_large' },
            { status: 413, headers: noStoreHeaders() }
        );

    if (contentLength > MAX_BODY_BYTES) return payloadTooLarge();

    let bodyText: string;
    try {
        bodyText = await req.text();
    } catch {
        return Response.json(
            { status: 'invalid_request' },
            { status: 400, headers: noStoreHeaders() }
        );
    }
    if (bodyText.length > MAX_BODY_BYTES) return payloadTooLarge();

    // 6. Parse JSON defensively.
    let body: unknown;
    try {
        body = JSON.parse(bodyText);
    } catch {
        return Response.json(
            { status: 'invalid_request' },
            { status: 400, headers: noStoreHeaders() }
        );
    }

    // 7. Validate the password field.
    const password = (body as { password?: unknown } | null)?.password;
    if (
        typeof password !== 'string' ||
        password.length === 0 ||
        password.length > MAX_PASSWORD_LENGTH
    ) {
        return Response.json(
            { status: 'invalid_request' },
            { status: 400, headers: noStoreHeaders() }
        );
    }

    // 8. Perform the HIBP check. The password is consumed and discarded here;
    //    it is never logged, echoed, or persisted.
    const status = await checkPasswordLeaked(password, passwordLeakFailMode());

    return Response.json(
        { status },
        { status: status === 'temporarily_unavailable' ? 503 : 200, headers: noStoreHeaders() }
    );
}

export async function OPTIONS(req: Request): Promise<Response> {
    return corsPreflightResponse(req, 'POST, OPTIONS', 'Content-Type');
}