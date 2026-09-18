/**
 * tests/integration/webhookPhase5.test.ts
 *
 * Phase 5 (C7) — webhook `provider_status` persistence + replay / late-arrival
 * handling on POST /api/payments/webhook:
 *
 *   1. Success (APPROVED) → webhook_events row stores provider_status /
 *      provider_transaction_id / provider_operation / payment_intent_id, and the
 *      CURRENT PaymentIntent is marked `succeeded` with the provider verdict.
 *   2. Failure (DECLINED) → PaymentIntent marked `failed` + provider verdict.
 *   3. Replay (event:"idempotency") → ack 200, NO mutation of invoice or intent,
 *      webhook_events marked `duplicate`/`replay`.
 *   4. Late-arrival on an already-PAID invoice (quarantine, spec §10 N-1) →
 *      invoice stays paid, intent keeps its status but gains the provider verdict,
 *      webhook_events marked `skipped`/quarantined.
 *
 * Uses the shared table-backed in-memory Supabase fake
 * (tests/helpers/inMemorySupabase.ts) so the real handler + services run against
 * deterministic rows.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { createInMemorySupabase } from '../helpers/inMemorySupabase';

const MERCHANT_ID = 'MID_EG_P5';
const API_KEY = 'APIKEY_EG_P5';
const SECRET_KEY = 'SECRET_EG_P5';

const ib = createInMemorySupabase();

vi.mock('@supabase/supabase-js', () => ({
    createClient: ib.createClientMock,
}));

interface DbShape {
    invoice?: Record<string, any>;
    intents?: Record<string, any>[];
}

let triggerAffiliateCommissionMock: ReturnType<typeof vi.fn>;
let freezeOrderSplitsMock: ReturnType<typeof vi.fn>;
let verifyPaidAmountMock: ReturnType<typeof vi.fn>;

function signKashierBody(fields: Record<string, string>): string {
    const payload = { ...fields, merchantId: MERCHANT_ID };
    const keys = Object.keys(payload).sort();
    const signatureKeys = keys.join(',');
    const input = keys.map((k) => `${k}=${payload[k]}`).join('&');
    const signature = crypto.createHmac('sha256', API_KEY).update(input).digest('hex');
    return JSON.stringify({ ...payload, signature, signatureKeys });
}

async function postWebhook(body: string): Promise<Response> {
    const { POST } = await import('../../app/api/payments/webhook/route');
    const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        body,
        headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present' },
    });
    return POST(req);
}

function seed(db: DbShape): void {
    Object.keys(ib.tables).forEach((k) => delete ib.tables[k]);
    if (db.invoice) ib.tables.invoices = [db.invoice];
    ib.tables.payment_intents = db.intents || [];
}

beforeEach(() => {
    Object.keys(ib.tables).forEach((k) => delete ib.tables[k]);
    ib.rpcLog.length = 0;
    Object.assign(process.env, {
        KASHIER_EGYPT_MERCHANT_ID: MERCHANT_ID,
        KASHIER_EGYPT_PAYMENT_API_KEY: API_KEY,
        KASHIER_EGYPT_SECRET_KEY: SECRET_KEY,
        KASHIER_MODE: 'test',
        NEXT_PUBLIC_SUPABASE_URL: 'https://p5.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'svc_p5',
    });

    triggerAffiliateCommissionMock = vi.fn().mockResolvedValue({ ok: true });
    freezeOrderSplitsMock = vi.fn().mockResolvedValue({ frozen: true, splitsCount: 0 });
    verifyPaidAmountMock = vi.fn().mockResolvedValue({ ok: true });

    vi.doMock('../../server/payments/splitEngine', () => ({
        freezeOrderSplits: freezeOrderSplitsMock,
    }));
    vi.doMock('../../server/affiliate/ledgerService', () => ({
        triggerAffiliateCommission: triggerAffiliateCommissionMock,
    }));
    vi.doMock('../../server/payments/verifyPaidAmount', () => ({
        verifyPaidAmount: verifyPaidAmountMock,
    }));
    vi.resetModules();
});

afterEach(() => {
    ['KASHIER_EGYPT_MERCHANT_ID', 'KASHIER_EGYPT_PAYMENT_API_KEY', 'KASHIER_EGYPT_SECRET_KEY',
     'KASHIER_MODE', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].forEach((k) => delete process.env[k]);
    vi.restoreAllMocks();
});

describe('Phase 5 — webhook provider_status persistence (C7)', () => {
    it('success persists provider signals on webhook_events + PaymentIntent and fulfils', async () => {
        seed({
            invoice: {
                id: 'inv-p5-s', status: 'pending', payment_status: 'pending',
                user_id: 'user-p5-s', tier_id: 'MRX-PROTOCOL', affiliate_id: 'aff-p5-s', referral_code: 'MRXP5',
                amount: 100, currency: 'EGP',
            },
            intents: [{
                id: 'pi-1', invoice_id: 'inv-p5-s', attempt_number: 1, is_current: true,
                status: 'initiated', provider: 'kashier',
            }],
        });

        const res = await postWebhook(signKashierBody({
            orderId: 'inv-p5-s',
            orderStatus: 'APPROVED',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'txn-p5-s',
        }));
        expect(res.status).toBe(200);

        const ev = ib.tables.webhook_events[0];
        expect(ev).toBeDefined();
        expect(ev.provider_status).toBe('APPROVED');
        expect(ev.provider_transaction_id).toBe('txn-p5-s');
        expect(ev.provider_operation).toBe('pay');
        expect(ev.payment_intent_id).toBe('pi-1');
        expect(ev.invoice_id).toBe('inv-p5-s');
        expect(ev.event_type).toBe('APPROVED');

        const intent = ib.tables.payment_intents[0];
        expect(intent.status).toBe('succeeded');
        expect(intent.provider_status).toBe('APPROVED');
        expect(intent.provider_transaction_id).toBe('txn-p5-s');

        const invoice = ib.tables.invoices[0];
        expect(invoice.payment_status).toBe('paid');
        expect(invoice.status).toBe('success');
        expect(triggerAffiliateCommissionMock).toHaveBeenCalledWith('inv-p5-s');
        expect(freezeOrderSplitsMock).toHaveBeenCalled();
    });

    it('failure (DECLINED) marks the PaymentIntent failed + provider verdict', async () => {
        seed({
            invoice: {
                id: 'inv-p5-d', status: 'pending', payment_status: 'pending',
                user_id: 'user-p5-d', tier_id: 'MRX-PROTOCOL', affiliate_id: null,
                amount: 100, currency: 'EGP',
            },
            intents: [{
                id: 'pi-2', invoice_id: 'inv-p5-d', attempt_number: 1, is_current: true,
                status: 'initiated', provider: 'kashier',
            }],
        });

        const res = await postWebhook(signKashierBody({
            orderId: 'inv-p5-d',
            orderStatus: 'DECLINED',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'txn-p5-d',
        }));
        expect(res.status).toBe(200);

        const intent = ib.tables.payment_intents[0];
        expect(intent.status).toBe('failed');
        expect(intent.provider_status).toBe('DECLINED');
        expect(intent.provider_transaction_id).toBe('txn-p5-d');

        expect(ib.tables.invoices[0].payment_status).toBe('failed');

        const ev = ib.tables.webhook_events[0];
        expect(ev.provider_status).toBe('DECLINED');
        expect(triggerAffiliateCommissionMock).not.toHaveBeenCalled();
    });

    it('replay (event:"idempotency") acks 200 with NO invoice/intent mutation', async () => {
        seed({
            invoice: {
                id: 'inv-p5-r', status: 'pending', payment_status: 'pending',
                user_id: 'user-p5-r', tier_id: 'MRX-PROTOCOL', affiliate_id: null,
                amount: 100, currency: 'EGP',
            },
            intents: [{
                id: 'pi-3', invoice_id: 'inv-p5-r', attempt_number: 1, is_current: true,
                status: 'initiated', provider: 'kashier',
            }],
        });

        const res = await postWebhook(signKashierBody({
            orderId: 'inv-p5-r',
            orderStatus: 'APPROVED',
            event: 'idempotency',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'txn-p5-r',
        }));
        expect(res.status).toBe(200);
        const json = (await res.json()) as any;
        expect(json.message).toMatch(/replay/i);

        expect(ib.tables.invoices[0].payment_status).toBe('pending');
        const intent = ib.tables.payment_intents[0];
        expect(intent.status).toBe('initiated');

        const ev = ib.tables.webhook_events[0];
        expect(ev.status).toBe('duplicate');
        expect(ev.processing_status).toBe('replay');
        expect(ev.provider_status).toBe('APPROVED');
        expect(triggerAffiliateCommissionMock).not.toHaveBeenCalled();
    });

    it('late-arrival DECLINED on an already-PAID invoice is quarantined (no downgrade)', async () => {
        seed({
            invoice: {
                id: 'inv-p5-l', status: 'success', payment_status: 'paid',
                user_id: 'user-p5-l', tier_id: 'MRX-PROTOCOL', affiliate_id: null,
                amount: 100, currency: 'EGP',
            },
            intents: [{
                id: 'pi-4', invoice_id: 'inv-p5-l', attempt_number: 1, is_current: true,
                status: 'succeeded', provider: 'kashier',
            }],
        });

        const res = await postWebhook(signKashierBody({
            orderId: 'inv-p5-l',
            orderStatus: 'DECLINED',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'txn-p5-l',
        }));
        expect(res.status).toBe(200);
        const json = (await res.json()) as any;
        expect(json.message).toMatch(/quarantin/i);

        expect(ib.tables.invoices[0].payment_status).toBe('paid');
        const intent = ib.tables.payment_intents[0];
        expect(intent.status).toBe('succeeded');
        expect(intent.provider_status).toBe('DECLINED');
        expect(intent.provider_transaction_id).toBe('txn-p5-l');

        const ev = ib.tables.webhook_events[0];
        expect(ev.status).toBe('skipped');
        expect(String(ev.processing_status || '')).toMatch(/quarantin/i);
        expect(triggerAffiliateCommissionMock).not.toHaveBeenCalled();
    });
});