import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    KashierGateway,
    KashierSessionError,
    buildSanitizedUpstreamDetail,
} from '../../server/payments/gateways/KashierGateway';

const FAKE_SECRET_LIKE = ['sk', 'live', '9f8e7d6c5b4a3210'].join('_');
const FAKE_PAN = ['4111', '1111', '1111', '1111'].join('');
const FAKE_TRACE = 'trace-abc-123-def-456';

const SENSITIVE_UPSTREAM_BODY = JSON.stringify({
    response: {},
    messages: {
        en: `Card vault rejected token ${FAKE_SECRET_LIKE} for merchant MID-TEST-EG`,
    },
    internalTrace: FAKE_TRACE,
    merchantPan: FAKE_PAN,
});

function newGateway() {
    return new KashierGateway('egypt');
}

const sessionArgs = {
    orderRef: 'inv-disclosure-1',
    amount: 948,
    currency: 'EGP',
    customerEmail: 'buyer@example.com',
};

describe('KashierSessionError upstream disclosure', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-TEST-EG';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'test-api-key-123';
        process.env.KASHIER_TEST_SECRET_KEY = 'test-secret-key-456';
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('buildSanitizedUpstreamDetail', () => {
        it('returns undefined for a non-JSON body rather than passing it through', () => {
            expect(buildSanitizedUpstreamDetail('<html>502 Bad Gateway</html>')).toBeUndefined();
            expect(buildSanitizedUpstreamDetail('')).toBeUndefined();
        });

        it('returns undefined for a JSON array or scalar', () => {
            expect(buildSanitizedUpstreamDetail('[1,2,3]')).toBeUndefined();
            expect(buildSanitizedUpstreamDetail('"just a string"')).toBeUndefined();
        });

        it('keeps only allow-listed keys and drops everything else', () => {
            const detail = buildSanitizedUpstreamDetail(SENSITIVE_UPSTREAM_BODY);
            expect(detail).toBeUndefined();
        });

        it('drops free-form prose even under an allow-listed key', () => {
            const detail = buildSanitizedUpstreamDetail(
                JSON.stringify({ status: 'Card vault rejected token' + FAKE_SECRET_LIKE + ' for merchant' }),
            );
            expect(detail).toBeUndefined();
        });

        it('drops nested objects rather than stringifying them', () => {
            const detail = buildSanitizedUpstreamDetail(
                JSON.stringify({ status: { nested: FAKE_SECRET_LIKE } }),
            );
            expect(detail).toBeUndefined();
        });

        it('retains a code-shaped status for diagnostics', () => {
            expect(buildSanitizedUpstreamDetail(JSON.stringify({ status: 'INVALID_REQUEST' })))
                .toBe('status=INVALID_REQUEST');
        });

        it('caps the sanitized detail length', () => {
            const code = 'A'.repeat(64);
            const detail = buildSanitizedUpstreamDetail(
                JSON.stringify({ code, error: code, status: code }),
            );
            expect(detail).toBeDefined();
            expect(detail!.length).toBeLessThanOrEqual(120);
        });

        it('rejects over-long code values outright', () => {
            expect(buildSanitizedUpstreamDetail(JSON.stringify({ code: 'A'.repeat(65) }))).toBeUndefined();
        });
    });

    describe('createPaymentSession failure surfacing', () => {
        it('does not put the raw upstream body in the thrown error message', async () => {
            vi.stubGlobal(
                'fetch',
                vi.fn().mockResolvedValue(
                    new Response(SENSITIVE_UPSTREAM_BODY, {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    }),
                ),
            );

            const error = await newGateway()
                .createPaymentSession(sessionArgs)
                .then(() => null)
                .catch((e: unknown) => e);

            expect(error).toBeInstanceOf(KashierSessionError);
            const message = (error as KashierSessionError).message;
            expect(message).not.toContain(FAKE_SECRET_LIKE);
            expect(message).not.toContain(FAKE_TRACE);
            expect(message).not.toContain(FAKE_PAN);
            expect(message).not.toContain('internalTrace');
            expect((error as KashierSessionError).status).toBe(400);
        });

        it('keeps the order reference in the message for correlation', async () => {
            vi.stubGlobal(
                'fetch',
                vi.fn().mockResolvedValue(new Response(SENSITIVE_UPSTREAM_BODY, { status: 422 })),
            );

            const error = await newGateway()
                .createPaymentSession(sessionArgs)
                .then(() => null)
                .catch((e: unknown) => e);

            expect((error as KashierSessionError).message).toContain('inv-disclosure-1');
        });

        it('logs the sanitized failure server-side with the order reference', async () => {
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.stubGlobal(
                'fetch',
                vi.fn().mockResolvedValue(new Response(SENSITIVE_UPSTREAM_BODY, { status: 400 })),
            );

            await newGateway().createPaymentSession(sessionArgs).catch(() => {});

            const logged = errorSpy.mock.calls.map((c) => String(c[0])).join('\n');
            expect(logged).toContain('inv-disclosure-1');
            expect(logged).toContain('status=400');
            expect(logged).not.toContain(FAKE_SECRET_LIKE);
            expect(logged).not.toContain(FAKE_PAN);
        });

        it('sends the documented customer shape and paymentType on the wire', async () => {
            const fetchMock = vi.fn().mockResolvedValue(
                new Response(
                    JSON.stringify({ sessionId: 'sess-ok', sessionUrl: 'https://checkout.kashier.io/s/ok' }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } },
                ),
            );
            vi.stubGlobal('fetch', fetchMock);

            await newGateway().createPaymentSession(sessionArgs);

            const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
            expect(payload.paymentType).toBe('credit');
            expect(payload.customer).toEqual({
                email: 'buyer@example.com',
                reference: 'inv-disclosure-1',
            });
        });
    });
});
