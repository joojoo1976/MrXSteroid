/**
 * lib/tools/engines/multi-ester-pharmacokinetics.test.ts
 * Tool #001 — Layer 1 engine tests: Bateman math, Heaviside gating, depot
 * depletion, telemetry aggregates and the degenerate k_a ≈ k_e limit.
 */
import { describe, it, expect } from 'vitest';
import {
    batemanTerm,
    calculateMultiEsterPK,
    DEFAULT_MULTI_ESTER_INPUT,
    ESTER_DATABASE,
    KA_KE_EPSILON,
    NG_DL_CONVERSION_FACTOR,
    STEADY_STATE_HALF_LIVES,
    TROUGH_START_DAY,
    VD_L_PER_KG,
    VD_MIN_LITERS,
    type EngineInput,
} from './multi-ester-pharmacokinetics';

const singleInjection = (ester: keyof typeof ESTER_DATABASE, doseMg = 250, day = 0): EngineInput => ({
    bodyWeightKg: 85,
    simulationDays: 60,
    injections: [{ id: 'inj-1', day, doseMg, ester }],
});

describe('Tool #001 — Bateman term', () => {
    it('is zero before the injection instant (Heaviside Θ)', () => {
        expect(batemanTerm(175, 0.4621, 0.154, 21.25, -1)).toBe(0);
        expect(batemanTerm(175, 0.4621, 0.154, 21.25, -30)).toBe(0);
    });

    it('equals zero at t = 0 and decays to ~0 far in the future', () => {
        expect(batemanTerm(175, 0.4621, 0.154, 21.25, 0)).toBeCloseTo(0, 10);
        expect(batemanTerm(175, 0.4621, 0.154, 21.25, 90)).toBeLessThan(0.0001);
    });

    it('uses the (D/Vd)·k·t·e^{−kt} limit branch when k_a ≈ k_e', () => {
        const ka = 0.3;
        const ke = ka; // exactly equal → inside the epsilon window by construction
        const expected = (175 / 21.25) * ka * 5 * Math.exp(-ka * 5);
        expect(batemanTerm(175, ka, ke, 21.25, 5)).toBeCloseTo(expected, 10);
        // and the result stays finite/positive (no 0/0 blow-up)
        expect(batemanTerm(175, ka, ke, 21.25, 5)).toBeGreaterThan(0);
    });

    it('peaks at the analytic Bateman maximum t* = ln(k_a/k_e)/(k_a − k_e)', () => {
        const ka = Math.LN2 / ESTER_DATABASE.enanthate.halfLifeAbsDays;
        const ke = Math.LN2 / ESTER_DATABASE.enanthate.halfLifeElimDays;
        const vd = 85 * VD_L_PER_KG;
        const tStar = Math.log(ka / ke) / (ka - ke);

        let peak = 0;
        let peakDay = 0;
        for (let d = 0; d <= 30; d += 0.01) {
            const value = batemanTerm(175, ka, ke, vd, d);
            if (value > peak) { peak = value; peakDay = d; }
        }
        expect(peakDay).toBeCloseTo(tStar, 1);
        // the true maximum straddles the 0.01 grid, so 4-decimal equality is the sane bar
        expect(batemanTerm(175, ka, ke, vd, tStar)).toBeCloseTo(peak, 4);
    });
});

describe('Tool #001 — single-ester simulation (250 mg enanthate, 85 kg)', () => {
    const result = calculateMultiEsterPK(singleInjection('enanthate'));

    it('produces a full daily timeline including day 0', () => {
        expect(result.timeline).toHaveLength(61);
        expect(result.timeline[0].day).toBe(0);
        expect(result.timeline[0].concentrationNgl).toBe(0);
    });

    it('peaks on day 3–4 and reaches the ng/dL scale through the conversion factor', () => {
        const peakPoint = result.timeline.reduce((a, b) => (b.concentrationNgl > a.concentrationNgl ? b : a));
        expect(peakPoint.day).toBeGreaterThanOrEqual(3);
        expect(peakPoint.day).toBeLessThanOrEqual(4);
        expect(result.peakConcentrationNgDl).toBeGreaterThan(0);
        // sanity: the conversion factor actually maps onto the ng/dL scale
        expect(result.peakConcentrationNgDl).toBeLessThan(NG_DL_CONVERSION_FACTOR * 500);
    });

    it('depletes the muscle depot monotonically (e^{−k_a·t})', () => {
        const depot = result.timeline.map((p) => p.accumulatedEsterMg);
        for (let i = 1; i < depot.length; i++) {
            expect(depot[i]).toBeLessThanOrEqual(depot[i - 1] + 1e-9);
        }
        expect(result.timeline[0].accumulatedEsterMg).toBeCloseTo(250, 0);
    });

    it('reports the release rate k_a·D_net·e^{−k_a·t} at day 0', () => {
        const ka = Math.LN2 / ESTER_DATABASE.enanthate.halfLifeAbsDays;
        expect(result.timeline[0].activeReleaseMg).toBeCloseTo(ka * 250 * 0.7, 0);
    });

    it('computes delivered hormone with the ester cleavage factor', () => {
        expect(result.totalActiveHormoneDeliveredMg).toBeCloseTo(250 * 0.7, 0);
    });

    it('estimates steady state as 4.5 elimination half-lives of the longest ester', () => {
        expect(result.estimatedSteadyStateDay).toBe(Math.round(4.5 * ESTER_DATABASE.enanthate.halfLifeElimDays));
        expect(STEADY_STATE_HALF_LIVES).toBe(4.5);
    });

    it('never emits NaN or Infinity anywhere in the timeline', () => {
        for (const point of result.timeline) {
            expect(Number.isFinite(point.concentrationNgl)).toBe(true);
            expect(Number.isFinite(point.activeReleaseMg)).toBe(true);
            expect(Number.isFinite(point.accumulatedEsterMg)).toBe(true);
        }
    });

    it('floors Vd at the safety minimum for emaciated body weights', () => {
        const emaciated = calculateMultiEsterPK({ ...singleInjection('enanthate'), bodyWeightKg: 30 });
        const normal = calculateMultiEsterPK(singleInjection('enanthate'));
        // 30 kg × 0.25 = 7.5 L < 10 L floor → identical to a 40 kg subject.
        const atFloor = calculateMultiEsterPK({ ...singleInjection('enanthate'), bodyWeightKg: 40 });
        expect(emaciated.peakConcentrationNgDl).toBe(atFloor.peakConcentrationNgDl);
        expect(normal.peakConcentrationNgDl).toBeLessThan(emaciated.peakConcentrationNgDl);
        expect(VD_MIN_LITERS).toBe(10);
    });
});

describe('Tool #001 — multi-ester & gating behaviour', () => {
    it('ignores future injections entirely (Heaviside gating)', () => {
        const now = calculateMultiEsterPK(singleInjection('propionate', 100, 0));
        const future = calculateMultiEsterPK(singleInjection('propionate', 100, 30));
        expect(future.timeline[0].concentrationNgl).toBe(0);
        // Bateman(Δt = 0) is exactly 0: serum only rises from day 1 on.
        expect(now.timeline[0].concentrationNgl).toBe(0);
        expect(now.timeline[1].concentrationNgl).toBeGreaterThan(0);
        // The future protocol contributes nothing until its own day 30.
        expect(future.timeline.slice(0, 30).every((p) => p.concentrationNgl === 0)).toBe(true);
        expect(future.timeline[30].concentrationNgl).toBe(0); // injection lands, serum still 0
        expect(future.timeline[31].concentrationNgl).toBeGreaterThan(0); // Bateman release afterwards
    });

    it('sums overlapping esters (suspension + enanthate stack beats each alone)', () => {
        const stack = calculateMultiEsterPK({
            bodyWeightKg: 85,
            simulationDays: 30,
            injections: [
                { id: 'a', day: 0, doseMg: 100, ester: 'suspension' },
                { id: 'b', day: 0, doseMg: 100, ester: 'enanthate' },
            ],
        });
        const suspension = calculateMultiEsterPK(singleInjection('suspension', 100));
        const enanthate = calculateMultiEsterPK(singleInjection('enanthate', 100));
        const stackDay3 = stack.timeline[3].concentrationNgl;
        const aloneSum = suspension.timeline[3].concentrationNgl + enanthate.timeline[3].concentrationNgl;
        expect(stackDay3).toBeCloseTo(aloneSum, 1); // linearity of the sum
    });

    it('tracks delivered hormone across a mixed-ester protocol', () => {
        const mixed = calculateMultiEsterPK({
            bodyWeightKg: 90,
            simulationDays: 90,
            injections: [
                { id: 'a', day: 0, doseMg: 200, ester: 'suspension' },   // ×1.00 → 200
                { id: 'b', day: 3, doseMg: 200, ester: 'acetate' },      // ×0.87 → 174
                { id: 'c', day: 6, doseMg: 200, ester: 'decanoate' },    // ×0.62 → 124
            ],
        });
        expect(mixed.totalActiveHormoneDeliveredMg).toBeCloseTo(200 + 174 + 124, 0);
        expect(mixed.estimatedSteadyStateDay).toBe(Math.round(7.5 * 4.5)); // longest = decanoate
    });

    it('measures trough only after the day-7 distribution window', () => {
        expect(TROUGH_START_DAY).toBe(7);
        const single = calculateMultiEsterPK(singleInjection('enanthate'));
        // A single shot decays monotonically after its peak, so the trough is the last day.
        expect(single.troughConcentrationNgDl).toBeCloseTo(single.timeline[60].concentrationNgl, 1);
    });

    it('is deterministic: identical inputs → identical outputs', () => {
        const a = calculateMultiEsterPK(DEFAULT_MULTI_ESTER_INPUT);
        const b = calculateMultiEsterPK(DEFAULT_MULTI_ESTER_INPUT);
        expect(a).toEqual(b);
    });

    it('degrades safely on hostile input (never throws, never NaN)', () => {
        const hostile = calculateMultiEsterPK({
            bodyWeightKg: Number.NaN,
            simulationDays: Number.NaN,
            injections: [
                { id: 'x', day: 0, doseMg: 250, ester: 'ghost-ester' as never }, // unknown → skipped
                { id: 'y', day: 0, doseMg: Number.NaN, ester: 'enanthate' },     // non-finite → skipped
            ],
        });
        expect(hostile.timeline).toHaveLength(1);
        expect(hostile.peakConcentrationNgDl).toBe(0);
        expect(hostile.totalActiveHormoneDeliveredMg).toBe(0);
        expect(hostile.peakToTroughRatio).toBe(0); // no trough → no ratio
    });
});