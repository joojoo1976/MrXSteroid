/**
 * tests/helpers/kashierFeeFixtures.ts
 *
 * The APPROVED Kashier commercial fee policy, as fixtures.
 *
 * These are the only two schedules that may exist, and the mapping table holds
 * the exact normalised provider-method tokens that reach them. Keeping them in
 * one helper means a test can never quietly assert a fee that production would
 * not actually charge.
 *
 * ── card_settled ─────────────────────────────────────────────────────────────
 *   0.2%  |  floor 10 EGP (1_000 minor)  |  cap 300,000 EGP (30_000_000 minor)
 *
 * ── instant_transfer ─────────────────────────────────────────────────────────
 *   2.5%  |  no floor  |  no cap
 *
 * All amounts are integer minor units (1 EGP = 100 piastres). The rates are
 * written as STRINGS because `rate_percent` is `numeric(7,4)` and PostgREST
 * returns numeric columns as strings — testing the string form exercises the
 * exact `parseRateBasisPoints` path production uses.
 */

/** The two approved schedule codes. A third code is a design error. */
export const APPROVED_SCHEDULE_CODES = ['card_settled', 'instant_transfer'] as const;
export type ApprovedScheduleCode = (typeof APPROVED_SCHEDULE_CODES)[number];

/**
 * The approved schedule rows, exactly as they would be stored after the owner
 * inserts them. `rate_percent` is the numeric(7,4) string form.
 */
export const APPROVED_KASHIER_FEE_SCHEDULES: Record<string, Record<string, unknown>> = {
    card_settled: {
        code: 'card_settled',
        rate_percent: '0.2000',
        min_fee_minor: 1_000,
        max_fee_minor: 30_000_000,
        active: true,
    },
    instant_transfer: {
        code: 'instant_transfer',
        rate_percent: '2.5000',
        min_fee_minor: null,
        max_fee_minor: null,
        active: true,
    },
};

/**
 * EXPLICIT normalised method -> schedule mapping. These keys are the output of
 * `normalizeProviderMethodKey`, i.e. the provider token lowercased with every
 * non-alphanumeric character removed.
 *
 * There is no LIKE, prefix, or substring row: a method that is not listed here
 * is UNMAPPED and fails closed. The list is intentionally a closed set.
 */
export const APPROVED_KASHIER_FEE_METHOD_MAP: Record<string, string> = {
    // card_settled — card rails
    card: 'card_settled',
    creditcard: 'card_settled',
    debitcard: 'card_settled',
    prepaidcard: 'card_settled',
    visa: 'card_settled',
    mastercard: 'card_settled',
    amex: 'card_settled',
    americanexpress: 'card_settled',
    // instant_transfer — wallets, instant bank transfer, online banking
    wallet: 'instant_transfer',
    ewallet: 'instant_transfer',
    mobilewallet: 'instant_transfer',
    vodafonecash: 'instant_transfer',
    etisalatcash: 'instant_transfer',
    orangecash: 'instant_transfer',
    instapay: 'instant_transfer',
    banktransfer: 'instant_transfer',
    onlinebanking: 'instant_transfer',
};

/**
 * Builds the two `kashier_fee_*` table arrays for an in-memory harness.
 * `overrides` lets a test model a configuration gap (a missing schedule, an
 * inactive mapping) without hand-writing the whole set.
 */
export function seedKashierFeeTables(options: {
    schedules?: Record<string, Record<string, unknown>>;
    methodMap?: Record<string, string>;
} = {}): {
    kashier_fee_schedules: Record<string, unknown>[];
    kashier_fee_method_map: Record<string, unknown>[];
} {
    const schedules = options.schedules ?? APPROVED_KASHIER_FEE_SCHEDULES;
    const methodMap = options.methodMap ?? APPROVED_KASHIER_FEE_METHOD_MAP;
    return {
        kashier_fee_schedules: Object.values(schedules).map((row) => ({ ...row })),
        kashier_fee_method_map: Object.entries(methodMap).map(([key, code]) => ({
            provider_method_key: key,
            schedule_code: code,
            active: true,
        })),
    };
}

/**
 * The §6.3 expected outcome for a (G, F) pair, in minor units, using the
 * 85/10/5 rule. Tests assert against this so the journal balance is proven
 * rather than restated by hand in each file.
 *
 * Rounding mirrors `server/payments/splitEngine.ts` exactly: each quota is
 * floored, then the leftover minor units are handed out largest-remainder-first
 * (the Hare-Niemeyer method the production engine uses at splitEngine.ts:159-172).
 * This is deliberately NOT a "remainder goes to the author" shortcut, because
 * such a shortcut would pass on the exact worked examples below while silently
 * disagreeing with production on any gross that does not divide evenly.
 */
export function expectedNetAllocation(grossMinor: number, feeMinor: number): {
    netMinor: number;
    author: number;
    platform: number;
    reserve: number;
} {
    const netMinor = grossMinor - feeMinor;

    const quotas = [
        { key: 'author' as const, exact: (netMinor * 85) / 100 },
        { key: 'platform' as const, exact: (netMinor * 10) / 100 },
        { key: 'reserve' as const, exact: (netMinor * 5) / 100 },
    ];

    const parts = quotas.map((q) => ({
        key: q.key,
        remainder: q.exact - Math.floor(q.exact),
        value: Math.floor(q.exact),
    }));

    const deficit = netMinor - parts.reduce((sum, p) => sum + p.value, 0);
    // Largest remainder first; ties resolve by the fixed author → platform →
    // reserve order, matching the stable sort the engine performs.
    const byRemainder = [...parts].sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < deficit; i++) {
        byRemainder[i % byRemainder.length].value += 1;
    }

    return {
        netMinor,
        author: parts.find((p) => p.key === 'author')!.value,
        platform: parts.find((p) => p.key === 'platform')!.value,
        reserve: parts.find((p) => p.key === 'reserve')!.value,
    };
}
