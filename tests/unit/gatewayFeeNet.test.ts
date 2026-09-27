/**
 * tests/unit/gatewayFeeNet.test.ts
 *
 * §6.3 NET accounting: G, F, N = G - F, the 85/10/5 allocation, and a balanced
 * double-entry journal.
 *
 * THE DEFECT UNDER TEST
 * `fulfillmentService` used to call `freezeOrderSplits(supabase, invoiceId)`
 * with no fee argument, so `gatewayFeeMinor` defaulted to 0. The split engine
 * computed `netAmountMinor = gross - 0 = gross`, every split was taken on the
 * FULL gross, and `financial_ledger` was posted with `gatewayFeeMinor: 0`, so
 * the GATEWAY_FEES debit/credit pair was never emitted. The 85/10/5
 * beneficiaries were credited the entire capture and the fee Kashier actually
 * charged was silently absorbed as merchant revenue.
 *
 * These tests pin the corrected behaviour: a real F is resolved, N = G - F, the
 * allocation equals N, and Dr N + Dr F == Cr splits + Cr F == G.
 *
 * THE APPROVED FEE MODEL
 * F is derived from the ACTUAL provider payment method, mapped through an
 * explicit table to one of two approved Kashier schedules:
 *
 *   card_settled      0.2%   floor 10 EGP (1_000)   cap 300,000 EGP (30_000_000)
 *   instant_transfer  2.5%   no floor                no cap
 *
 * There is NO region or 'GLOBAL' default fee. An unknown, unmapped or merely
 * fuzzy payment method is `gateway_fee_unresolved`, and the whole point of the
 * fail-closed tests below is that the removal of the regional fallback cannot
 * be quietly undone later.
 */

import { describe, it, expect, vi } from 'vitest';
import {
    resolveGatewayFee,
    computeFeeFromSchedule,
    parseRateBasisPoints,
    normalizeProviderMethodKey,
    readProviderMethodRaw,
    readProviderFeeMinor,
    type KashierFeeScheduleRow,
} from '../../server/payments/gatewayFee';
import { calculateOrderSplits, DEFAULT_OWNER_SPLIT_RATIOS } from '../../server/payments/splitEngine';
import {
    APPROVED_KASHIER_FEE_SCHEDULES,
    APPROVED_KASHIER_FEE_METHOD_MAP,
    expectedNetAllocation,
} from '../helpers/kashierFeeFixtures';

const RULES = [
    {
        id: 'r-author',
        tier_id: null,
        product_id: null,
        beneficiary_id: 'ben-author',
        share_type: 'percentage',
        share_value: 85,
        priority: 0,
        is_active: true,
        destination_account: 'BENEFICIARY_PAYABLE',
    },
    {
        id: 'r-platform',
        tier_id: null,
        product_id: null,
        beneficiary_id: null,
        share_type: 'percentage',
        share_value: 10,
        priority: 0,
        is_active: true,
        destination_account: 'PLATFORM_REVENUE',
    },
    {
        id: 'r-reserve',
        tier_id: null,
        product_id: null,
        beneficiary_id: 'ben-reserve',
        share_type: 'percentage',
        share_value: 5,
        priority: 0,
        is_active: true,
        destination_account: 'RESERVE',
    },
] as any[];

const CARD = APPROVED_KASHIER_FEE_SCHEDULES.card_settled as KashierFeeScheduleRow;
const INSTANT = APPROVED_KASHIER_FEE_SCHEDULES.instant_transfer as KashierFeeScheduleRow;

/**
 * Supabase double serving ONLY the two fee-schedule tables, with real
 * PostgREST-style filter semantics: a row is returned only when every `eq`
 * filter matches. This is what makes the "exact match only" guarantee testable
 * rather than assumed.
 */
function supabaseWithFeeTables(options: {
    schedules?: Record<string, Record<string, unknown>>;
    methodMap?: Record<string, string>;
} = {}) {
    const schedules = Object.values(
        options.schedules ?? APPROVED_KASHIER_FEE_SCHEDULES
    ) as Record<string, unknown>[];
    const map = Object.entries(options.methodMap ?? APPROVED_KASHIER_FEE_METHOD_MAP).map(
        ([key, code]) => ({ provider_method_key: key, schedule_code: code, active: true })
    );
    const tables: Record<string, Record<string, unknown>[]> = {
        kashier_fee_schedules: schedules,
        kashier_fee_method_map: map,
        // A legacy region-default fee model. Present only so a test can PROVE
        // it is never consulted: if any code path still reached for it, these
        // rows would produce a fee and the fail-closed tests would fail.
        merchant_configs: [
            { region: 'GLOBAL', active: true, gateway_fee_percent: 99, gateway_fee_fixed_minor: 0 },
        ],
    };
    const queriedTables: string[] = [];

    const from = vi.fn((table: string) => {
        queriedTables.push(table);
        const filters: Record<string, unknown> = {};
        const q: any = {};
        ['eq', 'limit', 'order', 'in'].forEach((f) => {
            q[f] = vi.fn((col: string, val: unknown) => {
                filters[col] = val;
                return q;
            });
        });
        q.select = vi.fn(() => q);
        const run = () => {
            const rows = tables[table] ?? [];
            const hit = rows.find((r) =>
                Object.entries(filters).every(([k, v]) => r[k] === v)
            );
            return Promise.resolve({ data: hit ?? null, error: null });
        };
        q.maybeSingle = vi.fn(run);
        q.single = vi.fn(run);
        q.then = (onF: any) => run().then(onF);
        return q;
    });

    return { client: { from } as any, queriedTables };
}

describe('payment method normalisation', () => {
    it('lowercases and strips every non-alphanumeric character', () => {
        expect(normalizeProviderMethodKey('Card Transfer')).toBe('cardtransfer');
        expect(normalizeProviderMethodKey('CARD')).toBe('card');
        expect(normalizeProviderMethodKey('  visa  ')).toBe('visa');
        expect(normalizeProviderMethodKey('Credit_Card')).toBe('creditcard');
        expect(normalizeProviderMethodKey('InstaPay')).toBe('instapay');
    });

    it('returns null when nothing usable remains', () => {
        expect(normalizeProviderMethodKey('')).toBeNull();
        expect(normalizeProviderMethodKey('   ')).toBeNull();
        expect(normalizeProviderMethodKey('---')).toBeNull();
        expect(normalizeProviderMethodKey(null)).toBeNull();
        expect(normalizeProviderMethodKey(undefined)).toBeNull();
        expect(normalizeProviderMethodKey({})).toBeNull();
    });

    it('refuses a numeric method token, which is an issuer id not a method', () => {
        // Mapping a bare issuer id onto one schedule would mis-price an entire
        // issuer's transactions.
        expect(normalizeProviderMethodKey(1234)).toBeNull();
        expect(normalizeProviderMethodKey(0)).toBeNull();
    });

    it('reads the method from method-specific payload fields only', () => {
        expect(readProviderMethodRaw({ paymentMethod: 'visa' })).toBe('visa');
        expect(readProviderMethodRaw({ card_type: 'Mastercard' })).toBe('Mastercard');
        expect(readProviderMethodRaw({ data: { channel: 'instapay' } })).toBe('instapay');
        // A generic `type` is Kashier's session type, NOT a payment method.
        expect(readProviderMethodRaw({ type: 'one-time' })).toBeNull();
        expect(readProviderMethodRaw({ data: { status: 'APPROVED' } })).toBeNull();
        expect(readProviderMethodRaw(null)).toBeNull();
    });
});

describe('approved schedule rate parsing', () => {
    it('parses numeric(7,4) strings into exact integer basis points', () => {
        expect(parseRateBasisPoints('0.2000')).toBe(2_000);
        expect(parseRateBasisPoints('2.5000')).toBe(25_000);
        expect(parseRateBasisPoints('0')).toBe(0);
        expect(parseRateBasisPoints(0.2)).toBe(2_000);
        expect(parseRateBasisPoints(2.5)).toBe(25_000);
    });

    it('rejects a malformed or out-of-range rate rather than reading it as zero', () => {
        expect(parseRateBasisPoints(null)).toBeNull();
        expect(parseRateBasisPoints('')).toBeNull();
        expect(parseRateBasisPoints('abc')).toBeNull();
        expect(parseRateBasisPoints('100')).toBeNull();
        expect(parseRateBasisPoints('-0.5')).toBeNull();
        expect(parseRateBasisPoints(Number.NaN)).toBeNull();
    });
});

describe('approved schedule arithmetic', () => {
    it('card_settled: the 10 EGP floor binds on a small capture', () => {
        // G = 2,000 EGP -> raw 0.2% = 4 EGP, below the 10 EGP floor.
        expect(computeFeeFromSchedule(200_000, CARD)).toBe(1_000);
    });

    it('card_settled: the rate governs in the middle band', () => {
        // G = 100,000 EGP -> 0.2% = 200 EGP.
        expect(computeFeeFromSchedule(10_000_000, CARD)).toBe(20_000);
    });

    it('card_settled: the 300,000 EGP cap binds on a large capture', () => {
        // The cap only starts binding above G = 150,000,000 EGP, because that is
        // where 0.2% of G reaches 300,000 EGP. G = 200,000,000 EGP -> raw 0.2% =
        // 400,000 EGP, clamped down to the 300,000 EGP cap.
        expect(computeFeeFromSchedule(20_000_000_000, CARD)).toBe(30_000_000);
    });

    it('card_settled: does NOT clamp below the cap', () => {
        // Guards the arithmetic above: 0.2% of 2,000,000 EGP is 4,000 EGP, which
        // is under the 300,000 EGP cap, so it must be charged in full.
        expect(computeFeeFromSchedule(200_000_000, CARD)).toBe(400_000);
    });

    it('instant_transfer: 2.5% with no floor and no cap', () => {
        // G = 10,000 EGP -> 2.5% = 250 EGP.
        expect(computeFeeFromSchedule(1_000_000, INSTANT)).toBe(25_000);
        // No floor: a tiny wallet payment still pays a real percentage, and
        // critically it does NOT pick up the card schedule's 10 EGP floor.
        expect(computeFeeFromSchedule(10_000, INSTANT)).toBe(250);
        // No cap: a large wallet payment is not clamped.
        expect(computeFeeFromSchedule(200_000_000, INSTANT)).toBe(5_000_000);
    });

    it('the withdrawn 1.5% instant_transfer assumption is nowhere in the model', () => {
        // 1.5% of 10,000 EGP would be 15,000 minor. The approved rate is 2.5%,
        // so this asserts the corrected figure and pins the difference.
        expect(computeFeeFromSchedule(1_000_000, INSTANT)).toBe(25_000);
        expect(computeFeeFromSchedule(1_000_000, INSTANT)).not.toBe(15_000);
        expect(String(INSTANT.rate_percent)).toBe('2.5000');
    });

    it('rejects an absent or malformed schedule rather than emitting zero', () => {
        expect(computeFeeFromSchedule(49_900, null)).toBeNull();
        expect(computeFeeFromSchedule(49_900, { ...CARD, rate_percent: 'abc' })).toBeNull();
        expect(computeFeeFromSchedule(49_900, { ...CARD, min_fee_minor: -1 })).toBeNull();
        expect(computeFeeFromSchedule(49_900, { ...CARD, max_fee_minor: -1 })).toBeNull();
        // min > max is an empty clamp band.
        expect(
            computeFeeFromSchedule(49_900, { ...CARD, min_fee_minor: 5_000, max_fee_minor: 1_000 })
        ).toBeNull();
        // An invalid gross is refused.
        expect(computeFeeFromSchedule(0, CARD)).toBeNull();
        expect(computeFeeFromSchedule(1.5, CARD)).toBeNull();
    });

    it('rounds half-up deterministically in integer minor units', () => {
        // 0.2% of 12,500 minor = 25 exactly; of 12,450 minor = 24.9 -> 25.
        expect(computeFeeFromSchedule(12_500, { ...CARD, min_fee_minor: null, max_fee_minor: null })).toBe(25);
        expect(computeFeeFromSchedule(12_450, { ...CARD, min_fee_minor: null, max_fee_minor: null })).toBe(25);
        // 0.2% of 12,400 minor = 24.8 -> 25. A tie case for half-up: 0.2% of
        // 12,425 = 24.85 -> 25, and 0.2% of 12,375 = 24.75 -> 25.
        expect(computeFeeFromSchedule(12_400, { ...CARD, min_fee_minor: null, max_fee_minor: null })).toBe(25);
    });
});

describe('§6.3 gateway fee resolution precedence', () => {
    it('prefers the persisted intent fee so a replay settles identically', async () => {
        const { client } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 49_900,
            persistedFeeMinor: 1_499,
            providerPayload: { fee: 20 },
            providerMethod: 'visa',
        });
        expect(res).toEqual({ ok: true, feeMinor: 1_499, source: 'persisted' });
    });

    it('prefers a provider-reported fee over the approved schedule', async () => {
        const { client } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 49_900,
            providerPayload: { data: { fee: 15 } },
            providerMethod: 'visa',
        });
        expect(res).toEqual({ ok: true, feeMinor: 1_500, source: 'provider' });
    });

    it('falls back to the approved schedule for the ACTUAL payment method', async () => {
        const { client } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 1_000_000,
            providerPayload: { data: { status: 'APPROVED' } },
            providerMethod: 'instapay',
        });
        expect(res).toEqual({
            ok: true,
            feeMinor: 25_000,
            source: 'kashier_schedule',
            scheduleCode: 'instant_transfer',
        });
    });

    it('selects card_settled for a card method', async () => {
        const { client } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 200_000,
            providerMethod: 'Mastercard',
        });
        expect(res).toEqual({
            ok: true,
            feeMinor: 1_000,
            source: 'kashier_schedule',
            scheduleCode: 'card_settled',
        });
    });

    it('reads the method from the payload when the caller does not pass it', async () => {
        const { client } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 1_000_000,
            providerPayload: { data: { status: 'APPROVED', paymentMethod: 'vodafone cash' } },
        });
        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.scheduleCode).toBe('instant_transfer');
            expect(res.feeMinor).toBe(25_000);
        }
    });
});

describe('fail-closed guarantees (no regional or fuzzy fallback)', () => {
    it('FAILS CLOSED when the payload has no payment method at all', async () => {
        const { client } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 49_900,
            providerPayload: { data: { status: 'APPROVED' } },
        });
        expect(res.ok).toBe(false);
        if (!res.ok) expect(res.reason).toContain('gateway fee unresolved');
    });

    it('FAILS CLOSED for an UNMAPPED method instead of guessing a category', async () => {
        const { client } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 49_900,
            providerMethod: 'bitcoin',
        });
        expect(res.ok).toBe(false);
        if (!res.ok) {
            expect(res.reason).toContain('is not mapped');
            expect(res.reason).toContain('refusing to guess');
        }
    });

    it('does NOT fuzzy-match a method that merely contains a known token', async () => {
        // 'creditcardsavings' contains 'creditcard' but is a different rail. A
        // LIKE/prefix match would silently price it as card_settled.
        const { client } = supabaseWithFeeTables();
        for (const method of ['creditcardsavings', 'mycard', 'xwallet', 'walletonline']) {
            const res = await resolveGatewayFee({
                supabase: client,
                grossMinor: 49_900,
                providerMethod: method,
            });
            expect(res.ok, `${method} must not fuzzy-match`).toBe(false);
        }
    });

    it('FAILS CLOSED when the mapped schedule is not configured', async () => {
        const { client } = supabaseWithFeeTables({ schedules: {} });
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 1_000_000,
            providerMethod: 'instapay',
        });
        expect(res.ok).toBe(false);
        if (!res.ok) expect(res.reason).toContain('is not configured');
    });

    it('FAILS CLOSED when the mapped schedule is inactive', async () => {
        const { client } = supabaseWithFeeTables({
            schedules: {
                card_settled: { ...CARD, active: false },
                instant_transfer: INSTANT,
            },
        });
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 49_900,
            providerMethod: 'visa',
        });
        expect(res.ok).toBe(false);
    });

    it('FAILS CLOSED when the schedule floor would exceed the gross', async () => {
        // G = 5 EGP but the card floor is 10 EGP. Clamping to 0 would hand the
        // whole capture's fee to the beneficiaries, so this must refuse.
        const { client } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 500,
            providerMethod: 'visa',
        });
        expect(res.ok).toBe(false);
        if (!res.ok) expect(res.reason).toContain('not less than G');
    });

    it('NEVER consults merchant_configs, so no region or GLOBAL default can answer', async () => {
        // The double deliberately holds a 99% 'GLOBAL' legacy policy row. If any
        // code path still read it, this capture would resolve at 49,401 instead
        // of failing closed.
        const { client, queriedTables } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: 49_900,
            providerMethod: 'bitcoin',
        });
        expect(res.ok).toBe(false);
        expect(queriedTables).not.toContain('merchant_configs');
    });

    it('rejects an invalid gross', async () => {
        const { client } = supabaseWithFeeTables();
        expect((await resolveGatewayFee({ supabase: client, grossMinor: 0 })).ok).toBe(false);
        expect((await resolveGatewayFee({ supabase: client, grossMinor: 1.5 })).ok).toBe(false);
    });

    it('reads a provider-reported fee in major units and converts to minor', () => {
        expect(readProviderFeeMinor({ data: { fee: 15 } }, 49_900)).toBe(1_500);
        expect(readProviderFeeMinor({ fee: '15.00' }, 49_900)).toBe(1_500);
        expect(readProviderFeeMinor({ processingFee: { amount: 12.5 } }, 49_900)).toBe(1_250);
    });

    it('rejects a provider fee >= gross rather than clamping it', () => {
        expect(readProviderFeeMinor({ data: { status: 'APPROVED' } }, 49_900)).toBeNull();
        expect(readProviderFeeMinor(null, 49_900)).toBeNull();
        expect(readProviderFeeMinor({ fee: 499 }, 49_900)).toBeNull();
    });
});

describe('§6.3 NET basis and 85/10/5 allocation', () => {
    it('uses the approved 85/10/5 ratios', () => {
        expect(DEFAULT_OWNER_SPLIT_RATIOS).toEqual({
            AUTHOR_SHARE_PERCENT: 85,
            PLATFORM_SHARE_PERCENT: 10,
            RESERVE_SHARE_PERCENT: 5,
            TOTAL_PERCENT: 100,
        });
    });

    it('allocates on N = G - F, not on G', () => {
        const gross = 49_900;
        const fee = 1_500;
        const net = gross - fee;

        const splits = calculateOrderSplits({
            grossAmountMinor: gross,
            gatewayFeeMinor: fee,
            rules: RULES,
            currency: 'EGP',
        });

        const allocated = splits.reduce((s: number, c: any) => s + c.allocatedAmountMinor, 0);
        expect(allocated).toBe(net);
        expect(allocated).toBe(48_400);

        const byAccount = Object.fromEntries(
            splits.map((s: any) => [s.destinationAccount, s.allocatedAmountMinor])
        );
        expect(byAccount.BENEFICIARY_PAYABLE).toBe(41_140);
        expect(byAccount.PLATFORM_REVENUE).toBe(4_840);
        expect(byAccount.RESERVE).toBe(2_420);

        expect(allocated).not.toBe(gross);
    });

    it('records the gross, fee and net on the snapshot for audit', () => {
        const splits = calculateOrderSplits({
            grossAmountMinor: 49_900,
            gatewayFeeMinor: 1_500,
            rules: RULES,
            currency: 'EGP',
        });
        expect(splits[0].grossAmountMinor).toBe(49_900);
        expect(splits[0].gatewayFeeMinor).toBe(1_500);
        expect(splits[0].netAmountMinor).toBe(48_400);
    });

    it('allocates the whole gross only when the real fee is genuinely zero', () => {
        const splits = calculateOrderSplits({
            grossAmountMinor: 49_900,
            gatewayFeeMinor: 0,
            rules: RULES,
            currency: 'EGP',
        });
        const allocated = splits.reduce((s: number, c: any) => s + c.allocatedAmountMinor, 0);
        expect(allocated).toBe(49_900);
    });

    /**
     * The four approved worked examples, asserted against the real split engine
     * AND the independent oracle in kashierFeeFixtures. Each proves the
     * schedule arithmetic and the 85/10/5 split agree, so a wrong fee cannot
     * hide behind a coincidentally balanced journal.
     */
    it.each([
        {
            label: 'card_settled, floor binds',
            gross: 200_000,
            method: 'visa',
            fee: 1_000,
            author: 169_150,
            platform: 19_900,
            reserve: 9_950,
        },
        {
            label: 'card_settled, rate governs',
            gross: 10_000_000,
            method: 'visa',
            fee: 20_000,
            author: 8_483_000,
            platform: 998_000,
            reserve: 499_000,
        },
        {
            label: 'card_settled, cap binds',
            gross: 20_000_000_000,
            method: 'visa',
            fee: 30_000_000,
            author: 16_974_500_000,
            platform: 1_997_000_000,
            reserve: 998_500_000,
        },
        {
            label: 'instant_transfer 2.5%',
            gross: 1_000_000,
            method: 'instapay',
            fee: 25_000,
            author: 828_750,
            platform: 97_500,
            reserve: 48_750,
        },
    ])('$label: F, N = G - F and the 85/10/5 split all hold', async (c) => {
        const schedule =
            c.method === 'visa' ? CARD : INSTANT;
        const resolved = computeFeeFromSchedule(c.gross, schedule);
        expect(resolved).toBe(c.fee);

        const oracle = expectedNetAllocation(c.gross, c.fee);
        expect(oracle.netMinor).toBe(c.gross - c.fee);
        expect(oracle.author).toBe(c.author);
        expect(oracle.platform).toBe(c.platform);
        expect(oracle.reserve).toBe(c.reserve);

        // The production engine must agree with the oracle.
        const splits = calculateOrderSplits({
            grossAmountMinor: c.gross,
            gatewayFeeMinor: c.fee,
            rules: RULES,
            currency: 'EGP',
        });
        const byAccount = Object.fromEntries(
            splits.map((s: any) => [s.destinationAccount, s.allocatedAmountMinor])
        );
        expect(byAccount.BENEFICIARY_PAYABLE).toBe(oracle.author);
        expect(byAccount.PLATFORM_REVENUE).toBe(oracle.platform);
        expect(byAccount.RESERVE).toBe(oracle.reserve);
        expect(splits.reduce((s: number, x: any) => s + x.allocatedAmountMinor, 0)).toBe(c.gross - c.fee);

        // And the schedule must be reachable end-to-end for that method.
        const { client } = supabaseWithFeeTables();
        const res = await resolveGatewayFee({
            supabase: client,
            grossMinor: c.gross,
            providerMethod: c.method,
        });
        expect(res).toEqual({
            ok: true,
            feeMinor: c.fee,
            source: 'kashier_schedule',
            scheduleCode: c.method === 'visa' ? 'card_settled' : 'instant_transfer',
        });
    });
});

describe('§6.3 journal balance', () => {
    /** Captures the lines `recordPaymentPostingJournal` writes. */
    function ledgerCapture() {
        const inserts: any[][] = [];
        const from = vi.fn((table: string) => {
            const q: any = {};
            const chain = () => q;
            ['eq', 'limit', 'order', 'in'].forEach((f) => { q[f] = vi.fn(chain); });
            q.insert = vi.fn((rows: any) => { if (table === 'financial_ledger') inserts.push(rows); return q; });
            q.select = vi.fn(() => q);
            q.then = (onF: any) => Promise.resolve({ data: [], error: null }).then(onF);
            return q;
        });
        return { client: { from } as any, inserts };
    }

    it('satisfies Dr(N) + Dr(F) = Cr(author) + Cr(platform) + Cr(reserve) + Cr(F)', async () => {
        const { recordPaymentPostingJournal } = await import(
            '../../server/payments/financialLedgerService'
        );
        const gross = 49_900;
        const fee = 1_500;
        const net = gross - fee;
        const { client, inserts } = ledgerCapture();

        const splits = calculateOrderSplits({
            grossAmountMinor: gross,
            gatewayFeeMinor: fee,
            rules: RULES,
            currency: 'EGP',
        }).map((c: any) => ({
            beneficiaryId: c.beneficiaryId ?? null,
            allocatedAmountMinor: c.allocatedAmountMinor,
            account: c.destinationAccount,
        }));

        const posted = await recordPaymentPostingJournal({
            paymentIntentId: 'pi-net-1',
            invoiceId: 'inv-net-1',
            grossAmountMinor: gross,
            gatewayFeeMinor: fee,
            currency: 'EGP',
            transactionId: 'txn-net-1',
            splits,
            supabaseClient: client,
        });

        expect(posted.totalDebitMinor).toBe(gross);
        expect(posted.totalCreditMinor).toBe(gross);
        expect(posted.totalDebitMinor).toBe(posted.totalCreditMinor);

        const lines = inserts.flat();
        const sum = (pred: (l: any) => boolean) =>
            lines.filter(pred).reduce((s: number, l: any) => s + l.amount_minor, 0);

        expect(sum((l) => l.account === 'CUSTOMER_FUNDS' && l.entry_type === 'DEBIT')).toBe(net);
        expect(sum((l) => l.account === 'GATEWAY_FEES' && l.entry_type === 'DEBIT')).toBe(fee);
        expect(
            sum((l) =>
                l.entry_type === 'CREDIT' &&
                ['BENEFICIARY_PAYABLE', 'PLATFORM_REVENUE', 'RESERVE'].includes(l.account)
            )
        ).toBe(net);
        expect(sum((l) => l.account === 'CUSTOMER_FUNDS' && l.entry_type === 'CREDIT')).toBe(fee);

        expect(sum((l) => l.entry_type === 'DEBIT')).toBe(net + fee);
        expect(sum((l) => l.entry_type === 'CREDIT')).toBe(net + fee);
        expect(sum((l) => l.entry_type === 'DEBIT')).toBe(gross);
    });

    it('omits the GATEWAY_FEES pair entirely when the real fee is zero', async () => {
        const { recordPaymentPostingJournal } = await import(
            '../../server/payments/financialLedgerService'
        );
        const { client, inserts } = ledgerCapture();
        const splits = calculateOrderSplits({
            grossAmountMinor: 49_900,
            gatewayFeeMinor: 0,
            rules: RULES,
            currency: 'EGP',
        }).map((c: any) => ({
            beneficiaryId: c.beneficiaryId ?? null,
            allocatedAmountMinor: c.allocatedAmountMinor,
            account: c.destinationAccount,
        }));

        const posted = await recordPaymentPostingJournal({
            paymentIntentId: 'pi-net-2',
            invoiceId: 'inv-net-2',
            grossAmountMinor: 49_900,
            gatewayFeeMinor: 0,
            currency: 'EGP',
            transactionId: 'txn-net-2',
            splits,
            supabaseClient: client,
        });

        expect(posted.totalDebitMinor).toBe(49_900);
        expect(posted.totalCreditMinor).toBe(49_900);
        const feeLines = inserts.flat().filter((l: any) => l.account === 'GATEWAY_FEES');
        expect(feeLines).toHaveLength(0);
    });

    /**
     * Proves the journal balances at EVERY approved schedule boundary, not just
     * the single worked example. A fee that is arithmetically right but whose
     * journal does not close would still be a financial defect.
     */
    it.each([
        { label: 'card floor', gross: 200_000, method: 'visa' },
        { label: 'card mid', gross: 10_000_000, method: 'visa' },
        { label: 'card cap', gross: 20_000_000_000, method: 'visa' },
        { label: 'instant_transfer 2.5%', gross: 1_000_000, method: 'instapay' },
    ])('$label: Dr == Cr == G exactly', async ({ gross, method }) => {
        const { recordPaymentPostingJournal } = await import(
            '../../server/payments/financialLedgerService'
        );
        const { client } = supabaseWithFeeTables();
        const resolved = await resolveGatewayFee({
            supabase: client,
            grossMinor: gross,
            providerMethod: method,
        });
        expect(resolved.ok).toBe(true);
        if (!resolved.ok) return;
        const fee = resolved.feeMinor;
        const { client: ledgerClient, inserts } = ledgerCapture();

        const splits = calculateOrderSplits({
            grossAmountMinor: gross,
            gatewayFeeMinor: fee,
            rules: RULES,
            currency: 'EGP',
        }).map((c: any) => ({
            beneficiaryId: c.beneficiaryId ?? null,
            allocatedAmountMinor: c.allocatedAmountMinor,
            account: c.destinationAccount,
        }));

        const posted = await recordPaymentPostingJournal({
            paymentIntentId: 'pi-sched',
            invoiceId: 'inv-sched',
            grossAmountMinor: gross,
            gatewayFeeMinor: fee,
            currency: 'EGP',
            transactionId: 'txn-sched',
            splits,
            supabaseClient: ledgerClient,
        });

        expect(posted.totalDebitMinor).toBe(gross);
        expect(posted.totalCreditMinor).toBe(gross);

        const lines = inserts.flat();
        const dr = lines.filter((l: any) => l.entry_type === 'DEBIT').reduce((s: number, l: any) => s + l.amount_minor, 0);
        const cr = lines.filter((l: any) => l.entry_type === 'CREDIT').reduce((s: number, l: any) => s + l.amount_minor, 0);
        expect(dr).toBe(gross);
        expect(cr).toBe(gross);
        expect(fee).toBeLessThan(gross);
    });
});
