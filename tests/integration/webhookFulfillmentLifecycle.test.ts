/**
 * tests/integration/webhookFulfillmentLifecycle.test.ts
 *
 * End-to-end integration test for POST /api/payments/webhook that exercises the
 * REAL fulfillment orchestration (not just the invoice status flip):
 *
 *   1. Invoice → paid
 *   2. Profile subscription activation
 *   3. Affiliate commission trigger
 *   4. Revenue split freeze (real splitEngine)
 *   5. Double-entry financial ledger journals (real financialLedgerService)
 *   6. Product entitlement grant (real entitlementService)
 *
 * It also covers:
 *   - The legacy Vercel (req, res) dual-mode handler path.
 *   - Failure isolation: a failing entitlement / ledger write must NEVER roll
 *     back the payment activation or turn the webhook into a 5xx.
 *
 * Supabase is mocked with a per-table, chain-aware fake so that the real
 * services run against a deterministic database shape.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

const MERCHANT_ID = 'MID_EG_LIFECYCLE';
const API_KEY = 'APIKEY_EG_LIFECYCLE';
const SECRET_KEY = 'SECRET_EG_LIFECYCLE';

const INVOICE_ID = 'inv-life-001';
const USER_ID = 'user-life-001';
const TIER_ID = 'MRX-PROTOCOL';
const AFFILIATE_ID = 'aff-life-001';
const REFERRAL_CODE = 'MRXLIFE';

interface MockCall {
    table: string;
    op: string;
    payload?: any;
    opts?: any;
}

interface MockState {
    calls: MockCall[];
    invoice: Record<string, any> | null;
    existingSplits: Record<string, any>[];
    savedSplits: Record<string, any>[];
    splitRules: Record<string, any>[];
    errors: Record<string, any>;
}

function signKashierBody(fields: Record<string, string>, apiKey = API_KEY): string {
    const payload = { ...fields, merchantId: MERCHANT_ID };
    const keys = Object.keys(payload).sort();
    const signatureKeys = keys.join(',');
    const input = keys.map(k => `${k}=${payload[k]}`).join('&');
    const signature = crypto.createHmac('sha256', apiKey).update(input).digest('hex');
    return JSON.stringify({ ...payload, signature, signatureKeys });
}

function makeTable(state: MockState, table: string) {
    let lastOp = 'select';
    let lastSelect = '';

    const q: Record<string, any> = {};
    const chain = () => q;
    ['eq', 'in', 'limit', 'order', 'match', 'neq', 'gte', 'lte', 'is', 'filter', 'contains', 'or', 'not']
        .forEach(fn => { q[fn] = vi.fn(chain); });

    q.select = vi.fn((cols?: string) => { lastOp = 'select'; lastSelect = cols || ''; return q; });
    q.insert = vi.fn((payload: any) => { lastOp = 'insert'; state.calls.push({ table, op: 'insert', payload }); return q; });
    q.upsert = vi.fn((payload: any, opts?: any) => { lastOp = 'upsert'; state.calls.push({ table, op: 'upsert', payload, opts }); return q; });
    q.update = vi.fn((payload: any) => { lastOp = 'update'; state.calls.push({ table, op: 'update', payload }); return q; });
    q.delete = vi.fn(() => { lastOp = 'delete'; state.calls.push({ table, op: 'delete' }); return q; });

    const resolveResult = () => {
        const err = state.errors[`${table}.${lastOp}`];
        if (err) return { data: null, error: err };

        if (lastOp === 'insert' || lastOp === 'upsert') return { data: [{ id: `${table}-row` }], error: null };
        if (lastOp === 'update' || lastOp === 'delete') return { data: null, error: null };

        if (table === 'split_rules') return { data: state.splitRules, error: null };
        if (table === 'order_splits') {
            return lastSelect.includes('allocated_amount_minor')
                ? { data: state.savedSplits, error: null }
                : { data: state.existingSplits, error: null };
        }
        return { data: [], error: null };
    };

    q.single = vi.fn(async () => {
        if (table === 'invoices') {
            return state.invoice
                ? { data: state.invoice, error: null }
                : { data: null, error: { code: 'PGRST116', message: 'Row not found' } };
        }
        if (table === 'entitlements') {
            const err = state.errors['entitlements.upsert'] || state.errors['entitlements.single'];
            if (err) return { data: null, error: err };
            return { data: { id: 'ent-life-001' }, error: null };
        }
        return { data: null, error: null };
    });

    q.maybeSingle = vi.fn(async () => {
        if (table === 'invoices') return { data: state.invoice, error: null };
        if (table === 'entitlements') return { data: { id: 'ent-life-001' }, error: null };
        return { data: null, error: null };
    });

    q.then = (onFulfilled: any, onRejected: any) =>
        Promise.resolve(resolveResult()).then(onFulfilled, onRejected);

    return q;
}

function buildSupabaseMock(state: MockState) {
    const tables = new Map<string, any>();
    const from = vi.fn((table: string) => {
        if (!tables.has(table)) tables.set(table, makeTable(state, table));
        return tables.get(table);
    });
    return {
        from,
        rpc: vi.fn(async (name: string, args: any) => {
            state.calls.push({ table: 'rpc', op: name, payload: args });
            return { data: null, error: null };
        }),
    };
}

const triggerAffiliateCommissionMock = vi.fn().mockResolvedValue({ ok: true });

let state: MockState;
let supabaseMock: ReturnType<typeof buildSupabaseMock>;

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => supabaseMock),
}));
vi.mock('../../server/affiliate/ledgerService', () => ({
    triggerAffiliateCommission: (...args: any[]) => triggerAffiliateCommissionMock(...args),
}));

function freshState(overrides: Partial<MockState> = {}): MockState {
    return {
        calls: [],
        invoice: {
            id: INVOICE_ID,
            status: 'pending',
            payment_status: 'pending',
            amount: 499,
            currency: 'EGP',
            user_id: USER_ID,
            tier_id: TIER_ID,
            affiliate_id: AFFILIATE_ID,
            referral_code: REFERRAL_CODE,
        },
        existingSplits: [],
        savedSplits: [
            { beneficiary_id: 'author-1', allocated_amount_minor: 42415, rule_snapshot: { role: 'author' } },
            { beneficiary_id: 'platform-1', allocated_amount_minor: 4990, rule_snapshot: { role: 'platform' } },
            { beneficiary_id: 'reserve-1', allocated_amount_minor: 2495, rule_snapshot: { role: 'reserve' } },
        ],
        splitRules: [
            { id: 'r1', beneficiary_id: 'author-1', share_type: 'percentage', share_value: 85, priority: 0, tier_id: null, is_active: true },
            { id: 'r2', beneficiary_id: 'platform-1', share_type: 'percentage', share_value: 10, priority: 0, tier_id: null, is_active: true },
            { id: 'r3', beneficiary_id: 'reserve-1', share_type: 'percentage', share_value: 5, priority: 0, tier_id: null, is_active: true },
        ],
        errors: {},
        ...overrides,
    };
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

function successBody(): string {
    return signKashierBody({
        orderId: INVOICE_ID,
        orderStatus: 'SUCCESS',
        reconcilation: 'OK',
        amount: '499.00',
        currency: 'EGP',
        transactionId: 'txn-life-001',
    });
}

function callsFor(table: string, op: string): MockCall[] {
    return state.calls.filter(c => c.table === table && c.op === op);
}

describe('POST /api/payments/webhook — Full Fulfillment Lifecycle', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        triggerAffiliateCommissionMock.mockClear();

        process.env.KASHIER_EGYPT_MERCHANT_ID = MERCHANT_ID;
        process.env.KASHIER_EGYPT_PAYMENT_API_KEY = API_KEY;
        process.env.KASHIER_EGYPT_SECRET_KEY = SECRET_KEY;
        process.env.KASHIER_MODE = 'test';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_key';

        state = freshState();
        supabaseMock = buildSupabaseMock(state);

        vi.doMock('@supabase/supabase-js', () => ({
            createClient: vi.fn(() => supabaseMock),
        }));
        vi.doMock('../../server/affiliate/ledgerService', () => ({
            triggerAffiliateCommission: (...args: any[]) => triggerAffiliateCommissionMock(...args),
        }));
    });

    afterEach(() => {
        ['KASHIER_EGYPT_MERCHANT_ID', 'KASHIER_EGYPT_PAYMENT_API_KEY', 'KASHIER_EGYPT_SECRET_KEY',
            'KASHIER_MODE', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
            'KASHIER_TEST_MERCHANT_ID', 'KASHIER_TEST_PAYMENT_API_KEY', 'KASHIER_TEST_SECRET_KEY',
        ].forEach(k => delete process.env[k]);
    });

    it('drives the complete paid → subscription → split → ledger → entitlement pipeline', async () => {
        const res = await postWebhook(successBody());
        expect(res.status).toBe(200);
        expect((await res.json()).status).toBe('ok');

        // 1. Invoice marked paid
        const invoiceUpdates = callsFor('invoices', 'update');
        expect(invoiceUpdates.some(c =>
            c.payload.status === 'success' && c.payload.payment_status === 'paid'
        )).toBe(true);

        // 2. Profile subscription activated
        const profileUpdates = callsFor('profiles', 'update');
        expect(profileUpdates).toHaveLength(1);
        expect(profileUpdates[0].payload).toMatchObject({
            subscription_tier: TIER_ID,
            subscription_status: 'active',
            has_paid: true,
            plan_tier: TIER_ID,
        });

        // 3. Affiliate commission triggered
        expect(triggerAffiliateCommissionMock).toHaveBeenCalledWith(INVOICE_ID);

        // 4. Revenue splits frozen (3 rules @ 85/10/5)
        const splitInserts = callsFor('order_splits', 'insert');
        expect(splitInserts).toHaveLength(1);
        expect(splitInserts[0].payload).toHaveLength(3);
        const allocated = splitInserts[0].payload.reduce((s: number, r: any) => s + r.allocated_amount_minor, 0);
        expect(allocated).toBe(49900);

        // 5. Double-entry ledger: payment capture + split allocation journals
        const ledgerInserts = callsFor('financial_ledger', 'insert');
        expect(ledgerInserts).toHaveLength(2);
        for (const entry of ledgerInserts) {
            const debit = entry.payload.filter((l: any) => l.entry_type === 'DEBIT')
                .reduce((s: number, l: any) => s + l.amount_minor, 0);
            const credit = entry.payload.filter((l: any) => l.entry_type === 'CREDIT')
                .reduce((s: number, l: any) => s + l.amount_minor, 0);
            expect(debit).toBe(credit);
        }

        // 6. Entitlement granted for the canonical product
        const entitlementUpserts = callsFor('entitlements', 'upsert');
        expect(entitlementUpserts).toHaveLength(1);
        expect(entitlementUpserts[0].payload).toMatchObject({
            user_id: USER_ID,
            product_id: TIER_ID,
            invoice_id: INVOICE_ID,
            status: 'granted',
        });
        expect(entitlementUpserts[0].opts).toMatchObject({ onConflict: 'user_id,product_id,invoice_id' });

        // webhook_events lifecycle closed as processed
        const webhookUpdates = callsFor('webhook_events', 'update');
        expect(webhookUpdates.some(c => c.payload.status === 'processed')).toBe(true);
    });

    it('keeps the payment activated even when the entitlement grant fails (failure isolation)', async () => {
        state = freshState({ errors: { 'entitlements.upsert': { message: 'entitlements unavailable' } } });
        supabaseMock = buildSupabaseMock(state);

        const res = await postWebhook(successBody());
        expect(res.status).toBe(200);

        const invoiceUpdates = callsFor('invoices', 'update');
        expect(invoiceUpdates.some(c =>
            c.payload.status === 'success' && c.payload.payment_status === 'paid'
        )).toBe(true);
        expect(callsFor('profiles', 'update')).toHaveLength(1);
    });

    it('keeps the payment activated even when the financial ledger write fails (failure isolation)', async () => {
        state = freshState({ errors: { 'financial_ledger.insert': { message: 'ledger unavailable' } } });
        supabaseMock = buildSupabaseMock(state);

        const res = await postWebhook(successBody());
        expect(res.status).toBe(200);

        const invoiceUpdates = callsFor('invoices', 'update');
        expect(invoiceUpdates.some(c =>
            c.payload.status === 'success' && c.payload.payment_status === 'paid'
        )).toBe(true);
        // Splits still freeze; ledger failure is isolated.
        expect(callsFor('order_splits', 'insert')).toHaveLength(1);
    });

    it('processes the same lifecycle through the legacy Vercel (req, res) dual-mode handler', async () => {
        const handler = (await import('../../server/payments/webhook')).default;

        let statusCode = 0;
        let jsonBody: any = null;
        const res = {
            status(code: number) { statusCode = code; return res; },
            json(body: any) { jsonBody = body; return res; },
        };

        const vercelReq = {
            method: 'POST',
            url: '/api/payments/webhook',
            headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present' },
            body: successBody(),
        };

        await handler(vercelReq as any, res as any);

        expect(statusCode).toBe(200);
        expect(jsonBody).toMatchObject({ status: 'ok' });
        expect(callsFor('profiles', 'update')).toHaveLength(1);
        expect(callsFor('entitlements', 'upsert')).toHaveLength(1);
    });
});
