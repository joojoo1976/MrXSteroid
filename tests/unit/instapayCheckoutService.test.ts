/**
 * InstaPay submission service (paymentService.submitInstaPay) unit tests.
 * Covers: multipart body shape, Idempotency-Key header, success mapping and
 * the two failure surfaces (API error body + non-JSON response).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { paymentService } from '../../shared/lib/payment.service';

const successResponse = {
    success: true,
    orderId: 'order-1',
    orderRef: 'MRX-INSTAPAY-1',
    receiptId: 'receipt-1',
    status: 'pending_review',
    amount: 1150,
    currency: 'EGP',
};

describe('PaymentService.submitInstaPay', () => {
    let capturedInit: RequestInit | undefined;
    let capturedUrl: string | undefined;

    const makeFile = () =>
        new File([new Uint8Array([1, 2, 3, 4])], 'receipt.png', { type: 'image/png' });

    const stubFetch = (status: number, body: unknown | undefined, ok: boolean, contentType?: string) => {
        const text = body === undefined ? 'not-json' : JSON.stringify(body);
        return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
            capturedUrl = String(url);
            capturedInit = init;
            return {
                ok,
                status,
                clone: () => ({
                    json: async () => JSON.parse(text),
                    text: async () => text,
                }),
                json: async () => JSON.parse(text),
                text: async () => text,
                headers: { get: () => contentType },
            } as Response;
        });
    };

    beforeEach(() => {
        capturedInit = undefined;
        capturedUrl = undefined;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('posts multipart FormData (file + JSON data) to /api/checkout/instapay with Idempotency-Key header', async () => {
        globalThis.fetch = stubFetch(200, successResponse, true) as unknown as typeof fetch;

        const result = await paymentService.submitInstaPay({
            receipt: makeFile(),
            idempotencyKey: 'idem-123',
            data: { tierId: 'bundle', quantity: 1 },
        });

        expect(capturedUrl).toBe('/api/checkout/instapay');
        expect(capturedInit?.method).toBe('POST');
        expect(capturedInit?.headers).toMatchObject({ 'Idempotency-Key': 'idem-123' });

        const form = capturedInit?.body as FormData;
        expect(form).toBeInstanceOf(FormData);
        const filePart = form.get('receipt');
        expect(filePart).toBeInstanceOf(File);
        expect((filePart as File).name).toBe('receipt.png');
        const dataPart = JSON.parse(String(form.get('data')));
        expect(dataPart).toMatchObject({ tierId: 'bundle', quantity: 1, idempotencyKey: 'idem-123' });

        expect(result).toMatchObject({
            success: true,
            orderId: 'order-1',
            orderRef: 'MRX-INSTAPAY-1',
            receiptId: 'receipt-1',
            status: 'pending_review',
        });
    });

    it('maps a 400 API error body into a failed result with the server message', async () => {
        globalThis.fetch = stubFetch(400, { success: false, error: 'التاج غير مدعوم' }, false) as unknown as typeof fetch;

        const result = await paymentService.submitInstaPay({
            receipt: makeFile(),
            data: { tierId: 'bundle', quantity: 99 },
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('التاج غير مدعوم');
    });

    it('returns a friendly error when the server responds with a non-JSON body', async () => {
        globalThis.fetch = stubFetch(500, undefined, false, 'text/html') as unknown as typeof fetch;

        const result = await paymentService.submitInstaPay({
            receipt: makeFile(),
            data: {},
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
        expect(result.error).toContain('مؤقت');
    });

    it('returns a failed result when fetch itself throws (network error)', async () => {
        globalThis.fetch = vi.fn(async () => {
            throw new Error('network down');
        }) as unknown as typeof fetch;

        const result = await paymentService.submitInstaPay({
            receipt: makeFile(),
            data: {},
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('network down');
    });
});