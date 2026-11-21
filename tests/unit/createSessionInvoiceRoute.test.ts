import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const sessionMock = vi.hoisted(() => vi.fn());

vi.mock('../../server/payments/checkout/checkoutSessionService', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../server/payments/checkout/checkoutSessionService')>();
    return { ...actual, createSessionFromInvoice: sessionMock };
});

import { POST } from '../../app/api/payments/create-session/route';

const INVOICE_ID = '11111111-1111-4111-8111-111111111111';

const request = (body: unknown, ip = '10.42.0.1') =>
    new NextRequest('http://localhost/api/payments/create-session', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-forwarded-for': ip,
        },
        body: JSON.stringify(body),
    });

describe('POST /api/payments/create-session — invoice-first branch', () => {
    beforeEach(() => {
        sessionMock.mockReset();
        sessionMock.mockResolvedValue({
            invoiceId: INVOICE_ID,
            orderRef: 'ord-1',
            sessionId: 'sess-1',
            sessionUrl: 'https://checkout.kashier.io/payment/sess-1',
            amount: 948,
            currency: 'EGP',
            region: 'EGYPT',
            merchantId: 'MID-TEST',
            paymentMethods: ['card'],
            environment: 'test',
            idempotent: false,
        });
    });

    it('loads the amount from the invoice and ignores body amount/total', async () => {
        const res = await POST(request({
            invoiceId: INVOICE_ID,
            amount: 1,
            total: 1,
            currency: 'USD',
            lines: [{ sku: 'digital', unit_price: 1 }],
        }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.amount).toBe(948);
        expect(body.currency).toBe('EGP');

        expect(sessionMock).toHaveBeenCalledTimes(1);
        const input = sessionMock.mock.calls[0][0];
        expect(input.invoiceId).toBe(INVOICE_ID);
        expect(input).not.toHaveProperty('amount');
        expect(input).not.toHaveProperty('total');
        expect(input).not.toHaveProperty('currency');
        expect(input).not.toHaveProperty('lines');
    });

    it('rejects an invalid invoice id before calling the service', async () => {
        const res = await POST(request({ invoiceId: 'not-a-uuid' }, '10.42.0.2'));
        expect(res.status).toBe(400);
        expect(sessionMock).not.toHaveBeenCalled();
    });
});
