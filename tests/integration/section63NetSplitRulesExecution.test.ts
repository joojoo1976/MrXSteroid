/**
 * §6.3 NET split-rules seed — behavioral tests over the committed engine.
 *
 * The static lock (section63NetSplitRulesSeed.test.ts) proves the migration
 * artifact says the right thing. This suite proves the SEEDED rules, fed
 * through the committed splitEngine, actually produce the signed §6.3 NET
 * allocation — including the beneficiary-less platform rule and the internal
 * reserve rule, neither of which the previous schema could represent.
 */
import { describe, it, expect } from 'vitest';
import { calculateOrderSplits, type SplitRule } from '../../server/payments/splitEngine';

const AUTHOR_ID = '8a6f0e10-0000-4000-8000-00000000a101';
const RESERVE_ID = '8a6f0e10-0000-4000-8000-00000000a105';

/** The exact three rows seeded by
 *  supabase/migrations/20260925130000_section63_net_split_rules_seed.sql */
const CANONICAL_SEED: SplitRule[] = [
    {
        id: '8a6f0e10-0000-4000-8000-00000000a201',
        beneficiary_id: AUTHOR_ID,
        share_type: 'percentage',
        share_value: 85,
        priority: 0,
        is_active: true,
        destination_account: 'BENEFICIARY_PAYABLE',
    },
    {
        id: '8a6f0e10-0000-4000-8000-00000000a203',
        beneficiary_id: null,
        share_type: 'percentage',
        share_value: 10,
        priority: 0,
        is_active: true,
        destination_account: 'PLATFORM_REVENUE',
    },
    {
        id: '8a6f0e10-0000-4000-8000-00000000a202',
        beneficiary_id: RESERVE_ID,
        share_type: 'percentage',
        share_value: 5,
        priority: 0,
        is_active: true,
        destination_account: 'RESERVE',
    },
];

const G = 49900;
const F = 1500;
const N = G - F;

describe('§6.3 canonical seed produces the signed NET allocation', () => {
    const splits = calculateOrderSplits({
        grossAmountMinor: G,
        gatewayFeeMinor: F,
        rules: CANONICAL_SEED,
        currency: 'EGP',
    });

    it('produces exactly three splits', () => {
        expect(splits).toHaveLength(3);
    });

    it('allocates 85% = 41140 to BENEFICIARY_PAYABLE for the author', () => {
        const author = splits.find((s) => s.beneficiaryId === AUTHOR_ID);
        expect(author).toBeDefined();
        expect(author!.allocatedAmountMinor).toBe(41140);
        expect(author!.destinationAccount).toBe('BENEFICIARY_PAYABLE');
    });

    it('allocates 10% = 4840 to PLATFORM_REVENUE with no beneficiary', () => {
        const platform = splits.find((s) => s.destinationAccount === 'PLATFORM_REVENUE');
        expect(platform).toBeDefined();
        expect(platform!.allocatedAmountMinor).toBe(4840);
        expect(platform!.beneficiaryId).toBeNull();
    });

    it('allocates 5% = 2420 to RESERVE via the internal reserve identity', () => {
        const reserve = splits.find((s) => s.destinationAccount === 'RESERVE');
        expect(reserve).toBeDefined();
        expect(reserve!.allocatedAmountMinor).toBe(2420);
        expect(reserve!.beneficiaryId).toBe(RESERVE_ID);
    });

    it('sums the splits to the NET amount, never the gross', () => {
        const total = splits.reduce((sum, s) => sum + s.allocatedAmountMinor, 0);
        expect(total).toBe(N);
        expect(total).toBe(48400);
        expect(total).not.toBe(G);
    });

    it('never uses gross-basis values', () => {
        const amounts = splits.map((s) => s.allocatedAmountMinor).sort((a, b) => b - a);
        expect(amounts).not.toContain(42415);
        expect(amounts).not.toContain(4990);
        expect(amounts).not.toContain(2495);
    });

    it('every split carries an explicit §6.3 destination account', () => {
        for (const split of splits) {
            expect(split.destinationAccount).toBeTruthy();
            expect([
                'BENEFICIARY_PAYABLE',
                'PLATFORM_REVENUE',
                'RESERVE',
            ]).toContain(split.destinationAccount);
        }
    });
});

describe('§6.3 canonical seed is exact for many gross/fee combinations', () => {
    it.each([
        [49900, 1500, 41140, 4840, 2420],
        [10000, 0, 8500, 1000, 500],
        [999, 0, 849, 100, 50],
        [123456, 3456, 102000, 12000, 6000],
        // G=1: only one minor unit exists; Largest-Remainder awards it to the
        // largest share (author 85%), and the others receive nothing. The
        // total is still exactly NET.
        [1, 0, 1, 0, 0],
    ])(
        'G=%i F=%i allocates %i/%i/%i',
        (gross, fee, author, platform, reserve) => {
            const result = calculateOrderSplits({
                grossAmountMinor: gross,
                gatewayFeeMinor: fee,
                rules: CANONICAL_SEED,
                currency: 'EGP',
            });

            const by = (account: string) =>
                result.find((s) => s.destinationAccount === account)?.allocatedAmountMinor ?? 0;

            expect(by('BENEFICIARY_PAYABLE')).toBe(author);
            expect(by('PLATFORM_REVENUE')).toBe(platform);
            expect(by('RESERVE')).toBe(reserve);
            expect(result.reduce((s, r) => s + r.allocatedAmountMinor, 0)).toBe(gross - fee);
        }
    );
});

describe('§6.3 destination_account actually changes the posting destination', () => {
    it('without destination_account every rule falls back to BENEFICIARY_PAYABLE', () => {
        const withoutDestinations: SplitRule[] = CANONICAL_SEED.map((r) => ({
            ...r,
            destination_account: null,
        }));

        const result = calculateOrderSplits({
            grossAmountMinor: G,
            gatewayFeeMinor: F,
            rules: withoutDestinations,
            currency: 'EGP',
        });

        for (const split of result) {
            expect(split.destinationAccount).toBe('BENEFICIARY_PAYABLE');
        }
    });

    it('with the seed each rule reaches its own signed account', () => {
        const result = calculateOrderSplits({
            grossAmountMinor: G,
            gatewayFeeMinor: F,
            rules: CANONICAL_SEED,
            currency: 'EGP',
        });

        expect(
            result.map((s) => s.destinationAccount).sort()
        ).toEqual(['BENEFICIARY_PAYABLE', 'PLATFORM_REVENUE', 'RESERVE']);
    });
});
