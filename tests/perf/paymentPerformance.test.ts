/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *  PAYMENT HOT-PATH PERFORMANCE BENCHMARKS (Final Gate v5.1)
 *
 *  Measures the deterministic, CPU-bound paths exercised on every payment /
 *  webhook event:
 *    - calculateOrderSplits          (integer largest-remainder allocation)
 *    - resolveKashierPaymentOutcome  (webhook outcome resolution)
 *    - validateJournalBalance        (double-entry invariant G-11)
 *    - postJournalEntry              (row build + invariant, fake client)
 *    - KashierGateway.verifyWebhook  (JSON parse + sort + HMAC-SHA256 + resolve)
 *    - getMerchantConfig             (env resolution / rotation)
 *    - buildKashierPaymentPageUrl    (URL construction)
 *
 *  Assertions use deliberately generous floors (~10-50x below typical) so they
 *  only trip on a catastrophic regression (accidental O(n^2), sync crypto,
 *  unbounded allocations), never on noisy CI hardware. The measured numbers are
 *  printed as a report for humans.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

import { calculateOrderSplits, type SplitRule } from '../../server/payments/splitEngine';
import { resolveKashierPaymentOutcome } from '../../server/payments/gateways/kashierVerification';
import {
    validateJournalBalance,
    postJournalEntry,
    recordPaymentPostingJournal,
} from '../../server/payments/financialLedgerService';
import { getMerchantConfig } from '../../server/payments/merchantResolver';
import { buildKashierPaymentPageUrl } from '../../server/payments/paymentLinkConfig';
import { KashierGateway } from '../../server/payments/gateways/KashierGateway';
import { buildKashierSessionRequest } from '../../server/payments/checkout/sessionRequest';
import { createCheckoutSession } from '../../server/payments/checkout/checkoutSessionService';

interface BenchResult {
    name: string;
    iterations: number;
    opsPerSec: number;
    usPerOp: number;
}

const results: BenchResult[] = [];
const savedEnv: Record<string, string | undefined> = {};

const PERF_ENV: Record<string, string> = {
    KASHIER_MODE: 'test',
    KASHIER_TEST_MERCHANT_ID: 'MID-PERF-0001',
    KASHIER_TEST_PAYMENT_API_KEY: 'perf-payment-api-key-primary',
    KASHIER_TEST_SECRET_KEY: 'perf-secret-key-primary',
    KASHIER_TEST_PAYMENT_API_KEY_SECONDARY: 'perf-payment-api-key-secondary',
    KASHIER_TEST_SECRET_KEY_SECONDARY: 'perf-secret-key-secondary',
};

function benchSync(name: string, fn: () => void, iterations: number, floor: number): BenchResult {
    const warmup = Math.max(50, Math.floor(iterations / 10));
    for (let i = 0; i < warmup; i++) fn();

    const runStart = performance.now();
    for (let i = 0; i < iterations; i++) fn();
    const elapsedMs = performance.now() - runStart;

    const result: BenchResult = {
        name,
        iterations,
        opsPerSec: (iterations / elapsedMs) * 1000,
        usPerOp: (elapsedMs / iterations) * 1000,
    };
    results.push(result);

    expect(Number.isFinite(result.opsPerSec)).toBe(true);
    expect(result.opsPerSec).toBeGreaterThan(floor);
    return result;
}

async function benchAsync(name: string, fn: () => Promise<unknown>, iterations: number, floor: number): Promise<BenchResult> {
    const warmup = Math.max(20, Math.floor(iterations / 10));
    for (let i = 0; i < warmup; i++) await fn();

    const runStart = performance.now();
    for (let i = 0; i < iterations; i++) await fn();
    const elapsedMs = performance.now() - runStart;

    const result: BenchResult = {
        name,
        iterations,
        opsPerSec: (iterations / elapsedMs) * 1000,
        usPerOp: (elapsedMs / iterations) * 1000,
    };
    results.push(result);

    expect(Number.isFinite(result.opsPerSec)).toBe(true);
    expect(result.opsPerSec).toBeGreaterThan(floor);
    return result;
}

function makeRules(count: number): SplitRule[] {
    const rules: SplitRule[] = [];
    for (let i = 0; i < count; i++) {
        rules.push({
            id: `rule-${i}`,
            beneficiary_id: `beneficiary-${i}`,
            share_type: i % 5 === 0 ? 'fixed' : 'percentage',
            share_value: i % 5 === 0 ? 500 : 100 / count,
            priority: count - i,
            is_active: true,
        });
    }
    return rules;
}

function signedKashierBody(apiKey: string): string {
    const payload: Record<string, unknown> = {
        merchantId: 'MID-PERF-0001',
        orderId: 'inv-perf-0001',
        amount: '499.00',
        currency: 'EGP',
        status: 'APPROVED',
        transactionId: 'txn-perf-0001',
        signatureKeys: 'merchantId,orderId,amount,currency,status,transactionId',
    };
    const input = String(payload.signatureKeys)
        .split(',')
        .map((k) => k.trim())
        .sort()
        .map((f) => `${f}=${payload[f]}`)
        .join('&');
    payload.signature = crypto.createHmac('sha256', apiKey).update(input).digest('hex');
    return JSON.stringify(payload);
}

const fakeLedgerClient = {
    from: () => ({ insert: async () => ({ error: null }) }),
} as unknown as SupabaseClient;

// â”€â”€  Phase 4 checkout orchestration bench fixture â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Row = Record<string, any>;

function perfFakeSupabase(ref: { invoices: Row[]; payment_intents: Row[] }) {
    const db: Record<string, Row[]> = {
        invoices: ref.invoices,
        payment_intents: ref.payment_intents,
        admin_settings: [],
    };
    let idc = 0;
    const from = (table: string) => {
        const state: any = { mode: 'select', payload: null, filters: {}, orderCol: null, ascending: true };
        const exec = async () => {
            const rows = db[table] || (db[table] = []);
            if (state.mode === 'insert') {
                const row: Row = { id: `${table}-${++idc}`, metadata: {}, ...state.payload };
                rows.push(row);
                return { data: row, error: null };
            }
            const matched = rows.filter(r => Object.entries(state.filters).every(([k, v]) => r[k] === v));
            if (state.mode === 'update') {
                matched.forEach(r => Object.assign(r, state.payload));
                return { data: null, error: null };
            }
            const result = [...matched];
            if (state.orderCol) {
                result.sort((a, b) => (a[state.orderCol] > b[state.orderCol] ? 1 : -1) * (state.ascending ? 1 : -1));
            }
            return { data: result, error: null };
        };
        const b: any = {
            select() { return b; },
            insert(p: Row) { state.mode = 'insert'; state.payload = p; return b; },
            update(p: Row) { state.mode = 'update'; state.payload = p; return b; },
            eq(c: string, v: any) { state.filters[c] = v; return b; },
            order(c: string, o?: { ascending?: boolean }) { state.orderCol = c; state.ascending = o?.ascending !== false; return b; },
            async single() { const { data } = await exec(); return { data: Array.isArray(data) ? (data[0] ?? null) : data, error: null }; },
            async maybeSingle() { const { data } = await exec(); return { data: Array.isArray(data) ? (data[0] ?? null) : data, error: null }; },
            then(res: any, rej: any) { return exec().then(res, rej); },
        };
        return b;
    };
    return { from } as unknown as SupabaseClient;
}

function perfGateway() {
    return {
        getGatewayName: () => 'KASHIER_EGYPT',
        createPaymentSession: async (params: any) => ({
            sessionId: 'sess-perf',
            sessionUrl: 'https://test-api.kashier.io/s/perf',
            orderId: params.orderRef,
            amount: params.amount,
            currency: params.currency,
            status: 'ACTIVE',
        }),
    };
}

beforeAll(() => {
    for (const [key, value] of Object.entries(PERF_ENV)) {
        savedEnv[key] = process.env[key];
        process.env[key] = value;
    }
});

afterAll(() => {
    for (const [key, value] of Object.entries(savedEnv)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }

    const rows = results
        .map((r) => `| ${r.name.padEnd(38)} | ${r.iterations.toString().padStart(7)} | ${r.opsPerSec.toFixed(0).padStart(12)} | ${r.usPerOp.toFixed(3).padStart(10)} |`)
        .join('\n');
    console.log(`\n[perf] Payment hot-path benchmarks\n| Operation                              | Iters   |     ops/sec  |    Âµs/op   |\n|----------------------------------------|---------|--------------|------------|\n${rows}\n`);
});

describe('payment hot-path performance', () => {
    it('calculateOrderSplits scales with rule count (no O(n^2))', () => {
        const small = makeRules(3);
        const large = makeRules(60);

        const r3 = benchSync('calculateOrderSplits(3 rules)', () => {
            calculateOrderSplits({ grossAmountMinor: 49900, gatewayFeeMinor: 1500, rules: small, currency: 'EGP' });
        }, 3000, 1_000);

        const r60 = benchSync('calculateOrderSplits(60 rules)', () => {
            calculateOrderSplits({ grossAmountMinor: 1084800, gatewayFeeMinor: 3000, rules: large, currency: 'EGP' });
        }, 2000, 500);

        const ratio = r60.usPerOp / r3.usPerOp;
        expect(ratio).toBeLessThan(100);
    });

    it('resolveKashierPaymentOutcome resolves primary statuses fast', () => {
        const approved = { orderStatus: 'APPROVED', reconciliation: 'OK', transactionResponseCode: '00' };
        const pending = { orderStatus: 'PENDING', reconcilation: 'NA' };
        benchSync('resolveKashierPaymentOutcome(approved)', () => {
            resolveKashierPaymentOutcome(approved);
        }, 20_000, 1_000);
        benchSync('resolveKashierPaymentOutcome(pending)', () => {
            resolveKashierPaymentOutcome(pending);
        }, 20_000, 1_000);
    });

    it('validateJournalBalance enforces G-11 quickly', () => {
        const lines = [
            { account: 'CUSTOMER_FUNDS' as const, entryType: 'DEBIT' as const, amountMinor: 49900 },
            { account: 'BENEFICIARY_PAYABLE' as const, entryType: 'CREDIT' as const, amountMinor: 49900 },
            { account: 'GATEWAY_FEES' as const, entryType: 'DEBIT' as const, amountMinor: 1500 },
            { account: 'CUSTOMER_FUNDS' as const, entryType: 'CREDIT' as const, amountMinor: 1500 },
        ];
        benchSync('validateJournalBalance(4 lines)', () => {
            validateJournalBalance(lines);
        }, 50_000, 5_000);
    });

    it('postJournalEntry builds and validates rows quickly (fake client)', async () => {
        await benchAsync('postJournalEntry(fake client)', async () => {
            await postJournalEntry({
                invoiceId: 'inv-perf-0001',
                currency: 'EGP',
                eventType: 'PAYMENT_CAPTURED',
                sourceId: 'txn-perf-0001',
                sourceEventType: 'kashier_transaction',
                lines: [
                    { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: 49900 },
                    { account: 'BENEFICIARY_PAYABLE', entryType: 'CREDIT', amountMinor: 49900 },
                ],
            }, fakeLedgerClient);
        }, 3000, 2_000);

        await benchAsync('recordPaymentPostingJournal(fake)', async () => {
            await recordPaymentPostingJournal({
                paymentIntentId: 'pi-perf-0001',
                invoiceId: 'inv-perf-0001',
                grossAmountMinor: 49900,
                gatewayFeeMinor: 1500,
                currency: 'EGP',
                transactionId: 'txn-perf-0001',
                splits: [
                    { beneficiaryId: 'author', allocatedAmountMinor: 41140, account: 'BENEFICIARY_PAYABLE' },
                    { beneficiaryId: null, allocatedAmountMinor: 4840, account: 'PLATFORM_REVENUE' },
                    { beneficiaryId: 'reserve', allocatedAmountMinor: 2420, account: 'RESERVE' },
                ],
                supabaseClient: fakeLedgerClient,
            });
        }, 3000, 2_000);
    });

    it('KashierGateway.verifyWebhook verifies HMAC + resolves outcome', async () => {
        const gateway = new KashierGateway('egypt');
        const body = signedKashierBody(PERF_ENV.KASHIER_TEST_PAYMENT_API_KEY);

        const originalLog = console.log;
        const originalError = console.error;
        console.log = () => {};
        console.error = () => {};
        try {
            const first = await gateway.verifyWebhook({} as never, body);
            expect(first.valid).toBe(true);
            expect(first.status).toBe('success');

            await benchAsync('KashierGateway.verifyWebhook(HMAC)', async () => {
                await gateway.verifyWebhook({} as never, body);
            }, 500, 200);
        } finally {
            console.log = originalLog;
            console.error = originalError;
        }
    });

    it('getMerchantConfig and payment-link URL building are cheap', () => {
        benchSync('getMerchantConfig(EGYPT)', () => {
            getMerchantConfig('EGYPT');
        }, 5000, 2_000);
        benchSync('getMerchantConfig(GLOBAL)', () => {
            getMerchantConfig('GLOBAL');
        }, 5000, 2_000);
        benchSync('buildKashierPaymentPageUrl', () => {
            buildKashierPaymentPageUrl('digital', { userId: 'u-1', userEmail: 'a@b.com', referralCode: 'REF1' });
        }, 5000, 2_000);
    });

    it('buildKashierSessionRequest mints the v3 session payload cheaply', () => {
        benchSync('buildKashierSessionRequest', () => {
            buildKashierSessionRequest({
                merchantId: 'MID-PERF-0001',
                orderRef: 'inv-perf-0001',
                amount: 749.0,
                currency: 'EGP',
                merchantRedirect: 'https://www.mrxsteroid.com/api/payments/callback?txn=inv-perf-0001',
                serverWebhook: 'https://www.mrxsteroid.com/api/payments/webhook',
                customer: { name: 'Perf Buyer', email: 'a@b.com' },
                paymentMethods: ['card', 'wallet'],
                defaultMethod: 'card',
            });
        }, 100_000, 20_000);
    });

    it('createCheckoutSession orchestrates invoice+intent+session without network stalls', async () => {
        const ref = { invoices: [] as Row[], payment_intents: [] as Row[] };
        await benchAsync('createCheckoutSession(digital EG)', async () => {
            const res = await createCheckoutSession(
                {
                    tierId: 'digital',
                    email: 'perf@example.com',
                    fullName: 'Perf Buyer',
                    country: 'EG',
                    idempotencyKey: crypto.randomUUID(),
                },
                { supabase: perfFakeSupabase(ref), gatewayFactory: () => perfGateway() as never, pricingRows: async () => [] },
            );
            if (!res.invoiceId || !res.sessionId || res.idempotent) {
                throw new Error('broken checkout orchestration');
            }
        }, 400, 30);

        // Oracle: every minted session produced exactly one invoice + one intent.
        const wrote = ref.invoices.length;
        expect(wrote).toBeGreaterThanOrEqual(400);
        expect(ref.payment_intents.length).toBe(wrote);
        expect(ref.invoices[0].kashier_session_id).toBe('sess-perf');
    });

    it('createCheckoutSession heating on a warm idempotency key stays cheap', async () => {
        const ref = { invoices: [] as Row[], payment_intents: [] as Row[] };
        const supabase = perfFakeSupabase(ref);
        const key = 'perf-dup-key';
        await createCheckoutSession(
            { tierId: 'digital', email: 'perf@example.com', fullName: 'Perf Buyer', country: 'EG', idempotencyKey: key },
            { supabase, gatewayFactory: () => perfGateway() as never, pricingRows: async () => [] },
        );
        await benchAsync('createCheckoutSession(idempotent replay)', async () => {
            await createCheckoutSession(
                { tierId: 'digital', email: 'perf@example.com', fullName: 'Perf Buyer', country: 'EG', idempotencyKey: key },
                { supabase, gatewayFactory: () => perfGateway() as never, pricingRows: async () => [] },
            );
        }, 5_000, 500);
    });
});
