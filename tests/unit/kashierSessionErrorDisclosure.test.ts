import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    KashierGateway,
    KashierSessionError,
    buildSanitizedUpstreamDetail,
    buildSanitizedUpstreamMessage,
    scrubSensitiveText,
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

    describe('buildSanitizedUpstreamMessage', () => {
        it('captures a top-level message field', () => {
            expect(buildSanitizedUpstreamMessage(JSON.stringify({ message: 'Invalid payment_type value' })))
                .toBe('Invalid payment_type value');
        });

        it('captures and flattens a messages object', () => {
            const out = buildSanitizedUpstreamMessage(JSON.stringify({ messages: { en: 'Field amount is required' } }));
            expect(out).toBe('Field amount is required');
        });

        it('captures a messages array', () => {
            const out = buildSanitizedUpstreamMessage(JSON.stringify({ messages: ['first problem', 'second problem'] }));
            expect(out).toBe('first problem | second problem');
        });

        it('returns undefined when the body carries no message', () => {
            expect(buildSanitizedUpstreamMessage(JSON.stringify({ status: 'INVALID_REQUEST' }))).toBeUndefined();
            expect(buildSanitizedUpstreamMessage('not json')).toBeUndefined();
            expect(buildSanitizedUpstreamMessage('')).toBeUndefined();
        });

        it('truncates the captured message to a safe maximum length', () => {
            const out = buildSanitizedUpstreamMessage(JSON.stringify({ message: 'validation problem: '.repeat(40) }));
            expect(out).toBeDefined();
            expect(out!.length).toBe(200);
        });
    });

    describe('scrubSensitiveText', () => {
        it('redacts secret-key material', () => {
            const out = scrubSensitiveText(`rejected ${FAKE_SECRET_LIKE}`);
            expect(out).not.toContain(FAKE_SECRET_LIKE);
            expect(out).toContain('[REDACTED_KEY]');
        });

        it('redacts bearer tokens', () => {
            expect(scrubSensitiveText('Authorization: Bearer abc.def.ghi')).not.toContain('abc.def.ghi');
        });

        it('redacts card-like digit runs', () => {
            expect(scrubSensitiveText(`pan ${FAKE_PAN}`)).not.toContain(FAKE_PAN);
        });

        it('redacts spaced card-like digit runs', () => {
            expect(scrubSensitiveText('pan 4111 1111 1111 1111')).not.toContain('4111 1111 1111 1111');
        });

        it('redacts email addresses', () => {
            expect(scrubSensitiveText('customer buyer@example.com rejected')).not.toContain('buyer@example.com');
        });

        it('redacts long hex tokens', () => {
            expect(scrubSensitiveText(`trace ${'a1b2c3d4'.repeat(6)}`)).not.toContain('a1b2c3d4a1b2c3d4');
        });

        it('leaves ordinary diagnostic text intact', () => {
            expect(scrubSensitiveText('paymentType credit is not allowed'))
                .toBe('paymentType credit is not allowed');
        });
    });

    describe('server-side message logging', () => {
        function captureLog(body: string, status: number) {
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.stubGlobal(
                'fetch',
                vi.fn().mockResolvedValue(
                    new Response(body, { status, headers: { 'Content-Type': 'application/json' } }),
                ),
            );
            return newGateway()
                .createPaymentSession(sessionArgs)
                .catch(() => undefined)
                .then(() => errorSpy.mock.calls.map((c) => String(c[0])).join('\n'));
        }

        it('logs the upstream message with orderRef, region, mode and status', async () => {
            const logged = await captureLog(
                JSON.stringify({ message: 'paymentType is not a supported field' }),
                400,
            );
            expect(logged).toContain('inv-disclosure-1');
            expect(logged).toContain('region=EGYPT');
            expect(logged).toContain('mode=test');
            expect(logged).toContain('status=400');
            expect(logged).toContain('paymentType is not a supported field');
        });

        it('never logs secrets even when the upstream message contains them', async () => {
            const logged = await captureLog(SENSITIVE_UPSTREAM_BODY, 400);
            expect(logged).toContain('upstreamMessage=');
            expect(logged).not.toContain(FAKE_SECRET_LIKE);
            expect(logged).not.toContain(FAKE_PAN);
            expect(logged).not.toContain('buyer@example.com');
            expect(logged).not.toContain('test-secret-key-456');
            expect(logged).not.toContain('test-api-key-123');
        });

        it('keeps the thrown client-facing message free of upstream detail', async () => {
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.stubGlobal(
                'fetch',
                vi.fn().mockResolvedValue(
                    new Response(JSON.stringify({ message: 'paymentType is not a supported field' }), { status: 400 }),
                ),
            );

            const error = await newGateway()
                .createPaymentSession(sessionArgs)
                .then(() => null)
                .catch((e: unknown) => e);

            expect(error).toBeInstanceOf(KashierSessionError);
            const message = (error as KashierSessionError).message;
            expect(message).not.toContain('paymentType is not a supported field');
            expect(message).toContain('inv-disclosure-1');
            expect(message).toContain('HTTP 400');
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
