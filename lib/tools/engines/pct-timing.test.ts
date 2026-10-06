/**
 * lib/tools/engines/pct-timing.test.ts
 * Tool #004 — Layer 1 engine tests: exponential decay, washout window, PCT
 * gating, axis rebound, determinism and hostile-input safety.
 */
import { describe, it, expect } from 'vitest';
import {
    DEFAULT_PCT_TIMING_INPUT,
    ENDO_LOW_PCT,
    ENDO_WASHOUT_END_PCT,
    PCT_BOOST_FACTORS,
    PCT_DURATIONS_WEEKS,
    RECOVERY_COMPLETE_THRESHOLD,
    calculatePctTiming,
    daysToClearance,
    endoRecoveryFraction,
    serumPctAfter,
    type EngineInput,
} from './pct-timing';

const baseInput = (overrides: Partial<EngineInput> = {}): EngineInput => ({
    compoundHalfLifeDays: 5,
    weeksOnCycle: 12,
    clearanceThresholdPct: 5,
    pctProtocol: 'standard',
    ...overrides,
});

describe('Tool #004 — elimination math', () => {
    it('serum halves every half-life', () => {
        expect(serumPctAfter(5, 5)).toBeCloseTo(50, 1);
        expect(serumPctAfter(10, 5)).toBeCloseTo(25, 1);
        expect(serumPctAfter(0, 5)).toBe(100);
    });

    it('days-to-clearance is finite, positive and grows with half-life', () => {
        const short = daysToClearance(2, 5);
        const long = daysToClearance(15, 5);
        expect(short).toBeGreaterThan(0);
        expect(long).toBeGreaterThan(short);
        expect(Number.isFinite(long)).toBe(true);
    });

    it('recovery fraction is monotonic and bounded [0,1)', () => {
        const f1 = endoRecoveryFraction(1, PCT_BOOST_FACTORS.aggressive_mrx);
        const f5 = endoRecoveryFraction(5, PCT_BOOST_FACTORS.aggressive_mrx);
        expect(f1).toBeGreaterThanOrEqual(0);
        expect(f5).toBeGreaterThan(f1);
        expect(f5).toBeLessThan(1);
    });
});

describe('Tool #004 — phase structure', () => {
    const result = calculatePctTiming(baseInput());

    it('emits one point per week across all phases', () => {
        expect(result.timeline).toHaveLength(result.totalTimelineWeeks);
        expect(result.timeline[0].phase).toBe('active_cycle');
        expect(result.timeline[0].serumConcentrationPct).toBe(100);
    });

    it('transitions cycle → washout → pct_active → recovery in order', () => {
        const phases = result.timeline.map((p) => p.phase);
        const cycleEnd = phases.lastIndexOf('active_cycle');
        const washoutStart = phases.indexOf('washout');
        expect(washoutStart).toBe(cycleEnd + 1);
        // pct standard => pct_active present
        const pctStart = phases.indexOf('pct_active');
        expect(pctStart).toBe(result.pctStartWeek - 1); // 1-indexed week → array idx
        const recoveryStart = phases.indexOf('recovery');
        expect(recoveryStart).toBeGreaterThan(pctStart);
    });

    it('serum decays monotonically after the last dose', () => {
        const postCycle = result.timeline.filter((p) => p.phase !== 'active_cycle');
        for (let i = 1; i < postCycle.length; i++) {
            expect(postCycle[i].serumConcentrationPct).toBeLessThanOrEqual(postCycle[i - 1].serumConcentrationPct + 0.01);
        }
    });

    it('never lets endogenous T drop below the on-cycle floor', () => {
        for (const p of result.timeline) {
            expect(p.endogenousTestosteronePct).toBeGreaterThanOrEqual(ENDO_LOW_PCT);
        }
    });
});

describe('Tool #004 — PCT gating & recovery', () => {
    it('PCT never starts before serum crosses the clearance threshold', () => {
        const r = calculatePctTiming(baseInput({ clearanceThresholdPct: 5 }));
        const pctWeek = r.timeline.find((p) => p.pctActive);
        if (pctWeek) {
            expect(pctWeek.serumConcentrationPct).toBeLessThanOrEqual(5 + 0.5);
        }
        expect(r.pctStartWeek).toBeGreaterThan(baseInput().weeksOnCycle);
    });

    it('a longer half-life produces a longer washout window', () => {
        const short = calculatePctTiming(baseInput({ compoundHalfLifeDays: 2 }));
        const long = calculatePctTiming(baseInput({ compoundHalfLifeDays: 15 }));
        expect(long.washoutWeeks).toBeGreaterThan(short.washoutWeeks);
    });

    it('a stricter (lower) threshold delays PCT start', () => {
        const loose = calculatePctTiming(baseInput({ clearanceThresholdPct: 20 }));
        const strict = calculatePctTiming(baseInput({ clearanceThresholdPct: 2 }));
        expect(strict.pctStartWeek).toBeGreaterThanOrEqual(loose.pctStartWeek);
    });

    it('aggressive PCT recovers endogenous T faster than none', () => {
        const aggressive = calculatePctTiming(baseInput({ pctProtocol: 'aggressive_mrx' }));
        const none = calculatePctTiming(baseInput({ pctProtocol: 'none' }));
        expect(aggressive.finalTestosteronePct).toBeGreaterThan(none.finalTestosteronePct);
        const ag = aggressive.fullRecoveryWeek || Infinity;
        const no = none.fullRecoveryWeek || Infinity;
        expect(ag).toBeLessThanOrEqual(no);
    });

    it('no-PCT protocol emits zero pct_active weeks', () => {
        const r = calculatePctTiming(baseInput({ pctProtocol: 'none' }));
        expect(r.pctDurationWeeks).toBe(0);
        expect(r.timeline.some((p) => p.pctActive)).toBe(false);
        // PCT durations constant sanity
        expect(PCT_DURATIONS_WEEKS.none).toBe(0);
        expect(PCT_DURATIONS_WEEKS.aggressive_mrx).toBeGreaterThan(PCT_DURATIONS_WEEKS.standard);
    });

    it('reaches the 90% threshold within a long-enough aggressive protocol', () => {
        const r = calculatePctTiming(baseInput({ pctProtocol: 'aggressive_mrx' }));
        expect(r.fullRecoveryWeek).toBeGreaterThan(0);
        const at = r.timeline.find((p) => p.weekNumber === r.fullRecoveryWeek);
        expect(at?.endogenousTestosteronePct).toBeGreaterThanOrEqual(RECOVERY_COMPLETE_THRESHOLD);
    });
});

describe('Tool #004 — determinism & hostile input', () => {
    it('is deterministic: identical inputs → identical outputs', () => {
        expect(calculatePctTiming(DEFAULT_PCT_TIMING_INPUT)).toEqual(calculatePctTiming(DEFAULT_PCT_TIMING_INPUT));
    });

    it('degrades safely on hostile input (never throws, never NaN)', () => {
        const hostile = calculatePctTiming({
            compoundHalfLifeDays: Number.NaN,
            weeksOnCycle: Number.NaN,
            clearanceThresholdPct: Number.POSITIVE_INFINITY,
            pctProtocol: 'alien' as never,
        });
        expect(hostile.timeline.length).toBeGreaterThan(0);
        for (const p of hostile.timeline) {
            expect(Number.isFinite(p.serumConcentrationPct)).toBe(true);
            expect(Number.isFinite(p.endogenousTestosteronePct)).toBe(true);
        }
    });

    it('clamps an over-long cycle to the 24-week ceiling', () => {
        const r = calculatePctTiming(baseInput({ weeksOnCycle: 9999 }));
        const cycleWeeks = r.timeline.filter((p) => p.phase === 'active_cycle').length;
        expect(cycleWeeks).toBe(24);
    });

    it('clamps half-life into the [0.5, 30] band', () => {
        const r = calculatePctTiming(baseInput({ compoundHalfLifeDays: 9999 }));
        // a 30-day half-life washout is large but finite
        expect(r.washoutWeeks).toBeGreaterThan(0);
        expect(Number.isFinite(r.washoutWeeks)).toBe(true);
    });

    it('uses the PCT boost factor constants consistently', () => {
        expect(PCT_BOOST_FACTORS.aggressive_mrx).toBeGreaterThan(PCT_BOOST_FACTORS.standard);
        expect(PCT_BOOST_FACTORS.none).toBeLessThan(PCT_BOOST_FACTORS.standard);
    });
});

describe('Tool #004 v2.0 — Multi-compound stack, ester interference & bio-modifiers', () => {
    it('bottlenecks washout window on the slowest ester in a multi-compound stack', async () => {
        const { calculateDynamicPctWashout } = await import('./pct-timing');
        const res = calculateDynamicPctWashout({
            stack: [
                { id: '1', presetKey: 'test_propionate', halfLifeDays: 1.5, doseMgPerWeek: 350, isLipophilic: false },
                { id: '2', presetKey: 'trenbolone_acetate', halfLifeDays: 1.0, doseMgPerWeek: 300, isLipophilic: false },
                { id: '3', presetKey: 'nandrolone_decanoate', halfLifeDays: 15.0, doseMgPerWeek: 400, isLipophilic: true },
            ],
            weeksOnCycle: 12,
            lastInjectionDateIso: '2026-10-01',
            bioModifiers: {
                bodyFatPct: 15,
                organHealth: 'normal',
                cycleHistory: 'intermediate',
            },
            pctProtocol: 'standard',
        });

        expect(res.limitingHalfLifeDays).toBe(15.0);
        expect(res.limitingCompoundName).toContain('Nandrolone Decanoate');
        expect(res.hasConflictingEsters).toBe(true);
        expect(res.washoutWeeks).toBeGreaterThanOrEqual(5);
        expect(res.washoutDays).toBeGreaterThan(30);
        expect(res.dailyWashout.length).toBeGreaterThan(45);
    });

    it('extends effective half-life for lipophilic compounds when body fat > 20%', async () => {
        const { calculateDynamicPctWashout } = await import('./pct-timing');
        const lean = calculateDynamicPctWashout({
            stack: [{ id: '1', presetKey: 'test_enanthate', halfLifeDays: 4.5, doseMgPerWeek: 500, isLipophilic: true }],
            weeksOnCycle: 12,
            lastInjectionDateIso: '2026-10-01',
            bioModifiers: { bodyFatPct: 12, organHealth: 'normal', cycleHistory: 'intermediate' },
            pctProtocol: 'standard',
        });

        const highBf = calculateDynamicPctWashout({
            stack: [{ id: '1', presetKey: 'test_enanthate', halfLifeDays: 4.5, doseMgPerWeek: 500, isLipophilic: true }],
            weeksOnCycle: 12,
            lastInjectionDateIso: '2026-10-01',
            bioModifiers: { bodyFatPct: 30, organHealth: 'normal', cycleHistory: 'intermediate' },
            pctProtocol: 'standard',
        });

        expect(highBf.effectiveHalfLifeDays).toBeGreaterThan(lean.effectiveHalfLifeDays);
        expect(highBf.washoutDays).toBeGreaterThan(lean.washoutDays);
    });

    it('lowers inhibitory threshold to 100 ng/dL for veteran/long-term users', async () => {
        const { calculateDynamicPctWashout } = await import('./pct-timing');
        const standard = calculateDynamicPctWashout({
            stack: [{ id: '1', presetKey: 'test_enanthate', halfLifeDays: 4.5, doseMgPerWeek: 500, isLipophilic: true }],
            weeksOnCycle: 12,
            lastInjectionDateIso: '2026-10-01',
            bioModifiers: { bodyFatPct: 15, organHealth: 'normal', cycleHistory: 'first_cycle' },
            pctProtocol: 'standard',
        });

        const veteran = calculateDynamicPctWashout({
            stack: [{ id: '1', presetKey: 'test_enanthate', halfLifeDays: 4.5, doseMgPerWeek: 500, isLipophilic: true }],
            weeksOnCycle: 12,
            lastInjectionDateIso: '2026-10-01',
            bioModifiers: { bodyFatPct: 15, organHealth: 'normal', cycleHistory: 'veteran_long_term' },
            pctProtocol: 'standard',
        });

        expect(veteran.hptaThresholdNgDl).toBe(100);
        expect(standard.hptaThresholdNgDl).toBe(150);
        expect(veteran.washoutDays).toBeGreaterThanOrEqual(standard.washoutDays);
    });
});
