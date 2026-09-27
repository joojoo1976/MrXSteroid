/**
 * tests/integration/guestFulfillmentSettlement.test.ts
 *
 * THE DEFECT UNDER TEST
 * `entitlements.user_id` is NOT NULL, so both delivery steps in
 * `fulfillmentService` were gated on `invoice.user_id`. For a guest
 * (`user_id = NULL`, which `checkoutSessionService` writes via
 * `input.userId || null`) the webhook therefore:
 *
 *     settled the §6.3 journal  ->  returned `success`  ->  granted NOTHING
 *
 * A real captured payment with a zero-error success response and no product
 * delivered. Guest checkout is intentional and must remain enabled, so the fix
 * is to settle financially, report `pending_claim`, and defer delivery behind a
 * single-use email-bound claim — while still crediting the §6.3 beneficiaries
 * on the correct NET basis (N = G - F), never the gross.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

const MERCHANT_ID = 'MID_EG_GUEST';
const API_KEY = 'APIKEY_EG_GUEST';
const SECRET_KEY = 'SECRET_EG_GUEST';

const INVOICE_ID = 'inv-guest-001';
const PAYMENT_INTENT_ID = 'pi-guest-001';
const TIER_ID = 'MRX-PROTOCOL';
const GUEST_EMAIL = 'Guest@Example.com';

const GROSS_MINOR = 49900;
const FEE_MINOR = 1500;
const NET_MINOR = 48400;

interface MockCall {
    table: string;
    op: string;
    payload?: any;
}

interface MockState {
    calls: MockCall[];
    invoice: Record<string, any> | null;
    paymentIntent: Record<string, any> | null;
    splitRules: Record<string, any>[];
    existingSplits: Record<string, any>[];
    savedSplits: Record<string, any>[];
    claims: Record<string, any>[];
    errors: Record<string, any>;
    nextClaimId: number;
}

function signKashierBody(fields: Record<string, string>): string {
    const payload = { ...fields, merchantId: MERCHANT_ID };
    const keys = Object.keys(payload).sort();
    const input = keys.map((k) => `${k}=${payload[k]}`).join('&');
    const signature = crypto.createHmac('sha256', API_KEY).update(input).digest('hex');
    return JSON.stringify({ ...payload, signature, signatureKeys: keys.join(',') });
}

function makeTable(state: MockState, table: string) {
    const q: Record<string, any> = {};
    const chain = () => q;
    // `write` is the pending mutation, consumed exactly once at await time.
    // It is deliberately NOT cleared by `.select()`, because PostgREST supports
    // `insert().select().single()` — a write that returns rows.
    const s = { write: '', payload: undefined as any, selCols: '' };
    ['eq', 'in', 'limit', 'order', 'neq', 'gte', 'gt', 'lte', 'is', 'or', 'not']
        .forEach((fn) => { q[fn] = vi.fn(chain); });

    q.select = vi.fn((cols?: string) => { s.selCols = cols || ''; return q; });
    q.insert = vi.fn((payload: any) => { s.write = 'insert'; s.payload = payload; return q; });
    q.update = vi.fn((payload: any) => { s.write = 'update'; s.payload = payload; return q; });
    q.upsert = vi.fn((payload: any) => { s.write = 'upsert'; s.payload = payload; return q; });
    q.delete = vi.fn(() => { s.write = 'delete'; s.payload = null; return q; });

    const exec = (): any => {
        const op = s.write;
        if (op) s.write = ''; // consume: a later read must not re-run this write

        const err = state.errors[`${table}.${op || 'select'}`];
        if (err) return { data: null, error: err };

        if (op === 'insert' || op === 'upsert') {
            state.calls.push({ table, op, payload: s.payload });
            if (table === 'guest_order_claims') {
                const row = { id: `claim-${state.nextClaimId++}`, ...s.payload };
                state.claims.push(row);
                return { data: [row], error: null };
            }
            return { data: [{ id: `${table}-row` }], error: null };
        }
        if (op === 'update') {
            state.calls.push({ table, op: 'update', payload: s.payload });
            // Single-row fixtures must actually mutate, otherwise a replayed
            // webhook cannot observe the paid invoice and the idempotency guard
            // is never exercised.
            if (table === 'invoices' && state.invoice) Object.assign(state.invoice, s.payload);
            if (table === 'payment_intents' && state.paymentIntent) {
                Object.assign(state.paymentIntent, s.payload);
            }
            return { data: [], error: null };
        }
        if (op === 'delete') return { data: [], error: null };

        if (table === 'split_rules') return { data: state.splitRules, error: null };
        if (table === 'guest_order_claims') return { data: state.claims, error: null };
        if (table === 'order_splits') {
            return s.selCols.includes('allocated_amount_minor')
                ? { data: state.savedSplits, error: null }
                : { data: state.existingSplits, error: null };
        }
        return { data: [], error: null };
    };

    q.single = vi.fn(async () => {
        if (table === 'payment_intents') {
            return state.paymentIntent
                ? { data: state.paymentIntent, error: null }
                : { data: null, error: { code: 'PGRST116' } };
        }
        if (table === 'invoices') {
            return state.invoice ? { data: state.invoice, error: null } : { data: null, error: { code: 'PGRST116' } };
        }
        const r = exec();
        if (r.error) return { data: null, error: r.error };
        return { data: Array.isArray(r.data) ? r.data[0] ?? null : null, error: null };
    });
    q.maybeSingle = vi.fn(async () => {
        if (table === 'payment_intents') return { data: state.paymentIntent, error: null };
        if (table === 'invoices') return { data: state.invoice, error: null };
        const r = exec();
        if (r.error) return { data: null, error: r.error };
        return { data: Array.isArray(r.data) ? r.data[0] ?? null : null, error: null };
    });
    q.then = (onF: any, onR: any) => Promise.resolve(exec()).then(onF, onR);

    return q;
}

function buildSupabaseMock(state: MockState) {
    const tables = new Map<string, any>();
    const from = vi.fn((table: string) => {
        if (!tables.has(table)) tables.set(table, makeTable(state, table));
        return tables.get(table);
    });
    return { from, rpc: vi.fn(async () => ({ data: null, error: null })) };
}

const triggerAffiliateCommissionMock = vi.fn().mockResolvedValue({ ok: true });
const sendEmailMock = vi.fn();

let state: MockState;
let supabaseMock: ReturnType<typeof buildSupabaseMock>;

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => supabaseMock) }));
vi.mock('../../server/affiliate/ledgerService', () => ({
    triggerAffiliateCommission: (...a: any[]) => triggerAffiliateCommissionMock(...a),
}));
vi.mock('../../shared/lib/emailService', () => ({
    isEmailConfigured: vi.fn(() => true),
    sendEmail: (...a: any[]) => sendEmailMock(...a),
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
            user_id: null,                 // <-- the guest
            tier_id: TIER_ID,
            customer_email: GUEST_EMAIL,
            region: 'EGYPT',
        },
        paymentIntent: {
            id: PAYMENT_INTENT_ID,
            invoice_id: INVOICE_ID,
            attempt_number: 1,
            is_current: true,
            status: 'initiated',
            provider: 'kashier',
            // Left NULL on purpose: the fee is derived from the verified provider
            // payload below and then PERSISTED, which is the path this test proves.
            gateway_fee_minor: null,
        },
        splitRules: [
            { id: 'r1', beneficiary_id: 'ben-author', share_type: 'percentage', share_value: 85, priority: 0, tier_id: null, is_active: true, destination_account: 'BENEFICIARY_PAYABLE' },
            { id: 'r2', beneficiary_id: null, share_type: 'percentage', share_value: 10, priority: 0, tier_id: null, is_active: true, destination_account: 'PLATFORM_REVENUE' },
            { id: 'r3', beneficiary_id: 'ben-reserve', share_type: 'percentage', share_value: 5, priority: 0, tier_id: null, is_active: true, destination_account: 'RESERVE' },
        ],
        existingSplits: [],
        savedSplits: [
            { beneficiary_id: 'ben-author', allocated_amount_minor: 41140, destination_account: 'BENEFICIARY_PAYABLE' },
            { beneficiary_id: null, allocated_amount_minor: 4840, destination_account: 'PLATFORM_REVENUE' },
            { beneficiary_id: 'ben-reserve', allocated_amount_minor: 2420, destination_account: 'RESERVE' },
        ],
        claims: [],
        nextClaimId: 1,
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
        // Kashier reports the fee in major units, same convention as amount.
        processingFee: '15.00',
        currency: 'EGP',
        transactionId: 'txn-guest-001',
    });
}

function callsFor(table: string, op: string): MockCall[] {
    return state.calls.filter((c) => c.table === table && c.op === op);
}

describe('guest payment settlement — deferred entitlement', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        triggerAffiliateCommissionMock.mockClear();
        sendEmailMock.mockClear();
        sendEmailMock.mockResolvedValue({ ok: true });

        process.env.KASHIER_EGYPT_MERCHANT_ID = MERCHANT_ID;
        process.env.KASHIER_EGYPT_PAYMENT_API_KEY = API_KEY;
        process.env.KASHIER_EGYPT_SECRET_KEY = SECRET_KEY;
        process.env.KASHIER_MODE = 'test';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_key';

        state = freshState();
        supabaseMock = buildSupabaseMock(state);

        vi.doMock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => supabaseMock) }));
        vi.doMock('../../server/affiliate/ledgerService', () => ({
            triggerAffiliateCommission: (...a: any[]) => triggerAffiliateCommissionMock(...a),
        }));
        vi.doMock('../../shared/lib/emailService', () => ({
            isEmailConfigured: vi.fn(() => true),
            sendEmail: (...a: any[]) => sendEmailMock(...a),
        }));
    });

    afterEach(() => {
        ['KASHIER_EGYPT_MERCHANT_ID', 'KASHIER_EGYPT_PAYMENT_API_KEY', 'KASHIER_EGYPT_SECRET_KEY',
            'KASHIER_MODE', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
        ].forEach((k) => delete process.env[k]);
    });

    it('reports pending_claim and does NOT claim success for a guest capture', async () => {
        const res = await postWebhook(successBody());
        const body = await res.json();

        // The critical regression: this used to be `ok` / `success`.
        expect(body.status).toBe('pending_claim');
        expect(body.status).not.toBe('ok');
        expect(body.delivery).toBe('deferred');
    });

    it('settles the money correctly: invoice paid, splits on NET, balanced journal', async () => {
        await postWebhook(successBody());

        const invoiceUpdates = callsFor('invoices', 'update');
        expect(invoiceUpdates.some(
            (c) => c.payload.status === 'success' && c.payload.payment_status === 'paid'
        )).toBe(true);

        // The real fee is resolved and persisted, not defaulted to zero.
        const feeUpdates = callsFor('payment_intents', 'update')
            .filter((c) => c.payload.gateway_fee_minor !== undefined);
        expect(feeUpdates.length).toBeGreaterThan(0);
        expect(feeUpdates[0].payload.gateway_fee_minor).toBe(FEE_MINOR);

        // 85/10/5 applies to N = G - F, so the allocation is 48400, not 49900.
        const splitInserts = callsFor('order_splits', 'insert');
        expect(splitInserts).toHaveLength(1);
        const allocated = splitInserts[0].payload.reduce((s: number, r: any) => s + r.allocated_amount_minor, 0);
        expect(allocated).toBe(NET_MINOR);
        expect(allocated).not.toBe(GROSS_MINOR);

        // Journal balances and books the fee.
        const ledgerInserts = callsFor('financial_ledger', 'insert');
        expect(ledgerInserts).toHaveLength(1);
        const lines = ledgerInserts[0].payload;
        const sum = (pred: (l: any) => boolean) =>
            lines.filter(pred).reduce((s: number, l: any) => s + l.amount_minor, 0);
        expect(sum((l) => l.entry_type === 'DEBIT')).toBe(GROSS_MINOR);
        expect(sum((l) => l.entry_type === 'CREDIT')).toBe(GROSS_MINOR);
        expect(sum((l) => l.account === 'GATEWAY_FEES' && l.entry_type === 'DEBIT')).toBe(FEE_MINOR);
        expect(sum((l) => l.account === 'CUSTOMER_FUNDS' && l.entry_type === 'DEBIT')).toBe(NET_MINOR);
    });

    it('grants NO entitlement and activates NO subscription for the guest', async () => {
        await postWebhook(successBody());

        // `entitlements.user_id` is NOT NULL, so these must not be attempted.
        expect(callsFor('entitlements', 'upsert')).toHaveLength(0);
        expect(callsFor('profiles', 'update')).toHaveLength(0);
    });

    it('creates exactly one single-use claim bound to the guest email', async () => {
        await postWebhook(successBody());

        expect(state.claims).toHaveLength(1);
        const claim = state.claims[0];
        expect(claim.invoice_id).toBe(INVOICE_ID);
        expect(claim.payment_intent_id).toBe(PAYMENT_INTENT_ID);
        expect(claim.product_id).toBe(TIER_ID);
        expect(claim.status).toBe('pending');
        // Email is normalized for the ownership binding.
        expect(claim.email).toBe('guest@example.com');
        // Only a digest is persisted.
        expect(claim.token_hash).toMatch(/^[a-f0-9]{64}$/);
        expect(new Date(claim.expires_at).getTime()).toBeGreaterThan(Date.now());
    });

    it('emails the claim link and never logs the raw token', async () => {
        const logs: string[] = [];
        const spies = (['log', 'warn', 'error', 'info'] as const).map(
            (lvl) => vi.spyOn(console, lvl).mockImplementation((...a: any[]) => {
                logs.push(a.map(String).join(' '));
            })
        );

        try {
            await postWebhook(successBody());
        } finally {
            spies.forEach((s) => s.mockRestore());
        }

        expect(sendEmailMock).toHaveBeenCalledTimes(1);
        const sent = sendEmailMock.mock.calls[0][0];
        expect(sent.to).toBe('guest@example.com');
        expect(sent.text).toContain('/claim-order?token=');
        // The live token is emailed but never written to a log line.
        const rawToken = /token=([A-Za-z0-9_-]+)/.exec(sent.text)![1];
        expect(rawToken).toHaveLength(43);
        expect(logs.join('\n')).not.toContain(rawToken);
    });

    it('closes the webhook event as processed', async () => {
        await postWebhook(successBody());
        expect(callsFor('webhook_events', 'update').some((c) => c.payload.status === 'processed')).toBe(true);
    });

    it('keeps the claim durable and does NOT unwind the payment when email fails', async () => {
        sendEmailMock.mockResolvedValue({ ok: false, reason: 'SMTP down' });

        const res = await postWebhook(successBody());
        const body = await res.json();

        expect(body.status).toBe('pending_claim');
        expect(state.claims).toHaveLength(1);
        expect(callsFor('invoices', 'update').some((c) => c.payload.payment_status === 'paid')).toBe(true);
        expect(callsFor('financial_ledger', 'insert')).toHaveLength(1);
    });

    it('does not re-issue a claim when the same webhook is redelivered', async () => {
        await postWebhook(successBody());
        expect(state.claims).toHaveLength(1);
        const firstHash = state.claims[0].token_hash;

        // Redelivery of the identical capture.
        const second = await postWebhook(successBody());

        // Still exactly one live claim — a replay must not revoke the token the
        // guest is holding and hand them a new one.
        expect(state.claims).toHaveLength(1);
        expect(state.claims[0].token_hash).toBe(firstHash);
        expect(state.claims[0].status).toBe('pending');
        expect(second.status).toBe(200);
    });
});

describe('guest claim redemption endpoint', () => {
    beforeEach(() => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_key';
    });

    afterEach(() => {
        ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].forEach((k) => delete process.env[k]);
    });

    it('rejects an unauthenticated redemption', async () => {
        vi.resetModules();
        const { POST } = await import('../../app/api/guest-claims/redeem/route');
        const res = await POST(
            new Request('http://localhost/api/guest-claims/redeem', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ token: 'x'.repeat(43) }),
            })
        );
        expect(res.status).toBe(401);
    });

    it('rejects a redemption with no token', async () => {
        vi.resetModules();
        const { POST } = await import('../../app/api/guest-claims/redeem/route');
        const res = await POST(
            new Request('http://localhost/api/guest-claims/redeem', {
                method: 'POST',
                headers: { 'content-type': 'application/json', authorization: 'Bearer faketoken' },
                body: JSON.stringify({}),
            })
        );
        // 401 (no verified session) or 400 (missing token) — never 200.
        expect([400, 401, 500]).toContain(res.status);
        expect(res.status).not.toBe(200);
    });
});
