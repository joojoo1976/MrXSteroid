/**
 * Unit tests for app/api/auth/check-password — the server-side leaked-password
 * endpoint. The HIBP leaf (passwordSafety) and the rate limiter are mocked;
 * the real route + CORS allowlist run, so the request contract is locked:
 *   - POST only (GET → 405).
 *   - Origin allowlist: cross-origin / missing-Origin → 403.
 *   - Rate limit exceeded → 429.
 *   - Oversized body → 413.
 *   - Bad JSON / bad password field / wrong content-type → 400.
 *   - Fail-closed: HIBP unavailable → 503; emergency open-mode → 200 safe.
 *   - The plaintext password never appears in any response body.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const debounced = vi.hoisted(() => {
    const successValue = { value: true };
    return {
        rateLimitSuccess: successValue,
        checkResult: vi.fn(async () => 'safe' as const),
        failMode: vi.fn(() => 'closed' as const),
        rateLimit: vi.fn(async () => ({ success: successValue.value })),
        ip: vi.fn(() => '127.0.0.1'),
    };
});

vi.mock('../../../../server/auth/passwordSafety', () => ({
    checkPasswordLeaked: debounced.checkResult,
    passwordLeakFailMode: debounced.failMode,
}));

vi.mock('../../../../lib/ratelimit', () => ({
    enforceRateLimit: debounced.rateLimit,
    clientIp: debounced.ip,
}));

import { POST, GET, OPTIONS } from './route';

const req = (body: unknown, { origin = 'https://www.mrxsteroid.com' } = {}) => {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (origin) headers.origin = origin;
    return new Request('http://localhost/api/auth/check-password', {
        method: 'POST',
        headers,
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });
};

const setSiteUrlEnv = () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.mrxsteroid.com';
    delete process.env.VERCEL_URL;
};

describe('/api/auth/check-password', () => {
    beforeEach(() => {
        setSiteUrlEnv();
        debounced.rateLimitSuccess.value = true;
        debounced.failMode.mockReturnValue('closed');
        debounced.rateLimit.mockReset();
        debounced.rateLimit.mockImplementation(async () => ({ success: debounced.rateLimitSuccess.value }));
    });
    afterEach(() => {
        vi.clearAllMocks();
        delete process.env.NEXT_PUBLIC_SITE_URL;
        delete process.env.VERCEL_URL;
    });

    it('POST with an allowed origin returns safe (200)', async () => {
        debounced.checkResult.mockResolvedValueOnce('safe');
        const res = await POST(req({ password: 'Str0ng!Pass' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ status: 'safe' });
        expect(res.headers.get('Cache-Control')).toContain('no-store');
    });

    it('POST returns leaked (200) when the password was breached', async () => {
        debounced.checkResult.mockResolvedValueOnce('leaked');
        const res = await POST(req({ password: 'Str0ng!Pass' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ status: 'leaked' });
    });

    it('never echoes the plaintext password in the response', async () => {
        const leakedPassword = 'Str0ng!Pass';
        debounced.checkResult.mockResolvedValueOnce('leaked');
        const res = await POST(req({ password: leakedPassword }));
        const body = await res.text();
        expect(body).not.toContain(leakedPassword);
    });

    it('rejects a request with no Origin header (403)', async () => {
        const res = await POST(req({ password: 'Str0ng!Pass' }, { origin: '' }));
        expect(res.status).toBe(403);
        expect(await res.json()).toEqual({ status: 'forbidden' });
    });

    it('rejects a cross-origin request (403)', async () => {
        const res = await POST(req({ password: 'Str0ng!Pass' }, { origin: 'https://evil.example.com' }));
        expect(res.status).toBe(403);
        expect(await res.json()).toEqual({ status: 'forbidden' });
    });

    it('accepts the apex domain origin', async () => {
        debounced.checkResult.mockResolvedValueOnce('safe');
        const res = await POST(req({ password: 'Str0ng!Pass' }, { origin: 'https://mrxsteroid.com' }));
        expect(res.status).toBe(200);
    });

    it('rate-limits the client IP (429)', async () => {
        debounced.rateLimitSuccess.value = false;
        const res = await POST(req({ password: 'Str0ng!Pass' }));
        expect(res.status).toBe(429);
        expect(await res.json()).toEqual({ status: 'rate_limited' });
        expect(res.headers.get('Retry-After')).toBe('60');
        expect(debounced.rateLimit).toHaveBeenCalledWith('password-check:127.0.0.1');
    });

    it('rejects an oversized body (413)', async () => {
        const big = { password: 'x'.repeat(3000) };
        const res = await POST(req(big));
        expect(res.status).toBe(413);
        expect(await res.json()).toEqual({ status: 'payload_too_large' });
        expect(debounced.checkResult).not.toHaveBeenCalled();
    });

    it('rejects malformed JSON (400)', async () => {
        const res = await POST(req('{ not json'));
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ status: 'invalid_request' });
    });

    it('rejects a missing / non-string password field (400)', async () => {
        const res = await POST(req({ password: '' }));
        expect(res.status).toBe(400);
        expect(debounced.checkResult).not.toHaveBeenCalled();
    });

    it('rejects a wrong content-type (400)', async () => {
        const res = await POST(
            new Request('http://localhost/api/auth/check-password', {
                method: 'POST',
                headers: { 'content-type': 'text/plain', origin: 'https://www.mrxsteroid.com' },
                body: 'password=foo',
            })
        );
        expect(res.status).toBe(400);
    });

    it('fail-closed: HIBP unavailable → 503 temporarily_unavailable', async () => {
        debounced.checkResult.mockResolvedValueOnce('temporarily_unavailable');
        const res = await POST(req({ password: 'Str0ng!Pass' }));
        expect(res.status).toBe(503);
        expect(await res.json()).toEqual({ status: 'temporarily_unavailable' });
    });

    it('emergency open mode: HIBP unavailable → 200 safe', async () => {
        debounced.failMode.mockReturnValue('open');
        debounced.checkResult.mockResolvedValueOnce('safe');
        const res = await POST(req({ password: 'Str0ng!Pass' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ status: 'safe' });
    });

    it('GET is rejected with 405 (POST only)', async () => {
        const res = await GET();
        expect(res.status).toBe(405);
        expect(await res.json()).toEqual({ status: 'method_not_allowed' });
    });

    it('OPTIONS returns a 204 preflight for allowed origins', async () => {
        const res = await OPTIONS(
            new Request('http://localhost/api/auth/check-password', {
                method: 'OPTIONS',
                headers: { origin: 'https://www.mrxsteroid.com', 'access-control-request-method': 'POST' },
            })
        );
        expect(res.status).toBe(204);
        expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://www.mrxsteroid.com');
    });
});