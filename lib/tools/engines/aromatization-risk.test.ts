/**
 * lib/tools/engines/aromatization-risk.test.ts
 * Tool #002 — Layer 1 engine tests: illustrative E2 curve, determinism,
 * hostile-input safety.
 */
import { describe, it, expect } from 'vitest';
import {
    AI_PROTOCOLS,
    AI_SUPPRESSION_FACTORS,
    AROMATIZATION_RATES,
    BASELINE_E2,
    COMPOUND_TYPES,
    DEFAULT_AROMATIZATION_INPUT,
    POST_CYCLE_OBSERVATION_WEEKS,
    bodyFatFactor,
    calculateAromatizationRisk,
    steadyStateE2For,
    type EngineInput,
} from './aromatization-risk';

describe('Tool #002 — helpers', () => {
    it('body-fat factor is 1.0 at 15% and scales with adipose density', () => {
        expect(bodyFatFactor(15)).toBeCloseTo(1.0, 5);
        expect(bodyFatFactor(30)).toBeGreaterThan(bodyFatFactor(15));
        expect(bodyFatFactor(6)).toBeLessThan(bodyFatFactor(15));
    });

    it('steady-state E2 is baseline for non-aromatising compounds', () => {
        const ss = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, compoundType: 'trenbolone' });
        expect(ss).toBe(BASELINE_E2);
    });

    it('steady-state E2 increases with dose, body fat, and aromatization rate', () => {
        const low = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, weeklyDoseMg: 300 });
        const high = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, weeklyDoseMg: 1000 });
        expect(high).toBeGreaterThan(low);

        const lean = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, bodyFatPct: 10 });
        const obese = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, bodyFatPct: 30 });
        expect(obese).toBeGreaterThan(lean);

        const deca = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, compoundType: 'nandrolone' });
        const test = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, compoundType: 'testosterone' });
        expect(test).toBeGreaterThan(deca);
    });
});

describe('Tool #002 — E2 trajectory structure', () => {
    const result = calculateAromatizationRisk(DEFAULT_AROMATIZATION_INPUT);

    it('produces a timeline spanning cycle + post-cycle observation', () => {
        expect(result.timeline.length).toBe(12 + POST_CYCLE_OBSERVATION_WEEKS);
        expect(result.totalTimelineWeeks).toBe(12 + POST_CYCLE_OBSERVATION_WEEKS);
    });

    it('has on_cycle phase for the first 12 weeks and post_cycle after', () => {
        expect(result.timeline[0].phase).toBe('on_cycle');
        expect(result.timeline[11].phase).toBe('on_cycle');
        expect(result.timeline[12].phase).toBe('post_cycle');
        expect(result.timeline[result.timeline.length - 1].phase).toBe('post_cycle');
    });

    it('E2 rises monotonically during on-cycle phase', () => {
        const onCycle = result.timeline.slice(0, 12);
        for (let i = 1; i < onCycle.length; i++) {
            expect(onCycle[i].estradiolPgml).toBeGreaterThanOrEqual(onCycle[i - 1].estradiolPgml);
        }
    });

    it('E2 decays monotonically during post-cycle phase', () => {
        const postCycle = result.timeline.slice(12);
        for (let i = 1; i < postCycle.length; i++) {
            expect(postCycle[i].estradiolPgml).toBeLessThanOrEqual(postCycle[i - 1].estradiolPgml);
        }
    });

    it('peak E2 equals the last on-cycle week value', () => {
        const lastOnCycle = result.timeline[11].estradiolPgml;
        expect(result.peakE2).toBe(lastOnCycle);
    });

    it('final E2 trends toward baseline but does not overshoot below it', () => {
        expect(result.finalE2).toBeGreaterThanOrEqual(BASELINE_E2 - 2);
        expect(result.finalE2).toBeLessThan(result.peakE2);
    });
});

describe('Tool #002 — illustrative scenario outputs', () => {
    it('calculates its scenario curve but does not expose an unvalidated risk assessment', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'trenbolone',
            aiProtocol: 'none',
        });
        expect(r.compoundAromatizationRate).toBe(0);
        expect(r.peakE2).toBe(BASELINE_E2);
        expect(r.gynoRiskScore).toBeNull();
        expect(r.waterRetentionRiskScore).toBeNull();
        expect(r.crashRiskScore).toBeNull();
        expect(r.peakRiskZone).toBe('not_assessed');
        expect(r.aiRecommendation).toBe('not_assessed');
    });

    it('high-dose testosterone produces a higher modelled value without clinical classification', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'testosterone',
            weeklyDoseMg: 1500,
            bodyFatPct: 25,
            aiProtocol: 'none',
        });
        expect(r.peakE2).toBeGreaterThan(BASELINE_E2);
        expect(r.peakRiskZone).toBe('not_assessed');
        expect(r.gynoRiskScore).toBeNull();
    });

    it('AI suppression lowers peak E2 vs no AI', () => {
        const noAi = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'testosterone',
            weeklyDoseMg: 1000,
            aiProtocol: 'none',
        });
        const withAi = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'testosterone',
            weeklyDoseMg: 1000,
            aiProtocol: 'standard',
        });
        expect(withAi.peakE2).toBeLessThan(noAi.peakE2);
    });

    it('does not infer clinical crash risk or medication need from a model factor', () => {
        const noAi = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'trenbolone',
            aiProtocol: 'none',
        });
        expect(noAi.crashRiskScore).toBeNull();

        const unnecessaryAi = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'trenbolone',
            aiProtocol: 'aggressive',
        });
        expect(unnecessaryAi.crashRiskScore).toBeNull();
        expect(unnecessaryAi.aiRecommendation).toBe('not_assessed');
    });

    it('keeps unsupported water-retention risk unavailable', () => {
        const lean = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            weeklyDoseMg: 1000,
            bodyFatPct: 10,
        });
        const obese = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            weeklyDoseMg: 1000,
            bodyFatPct: 30,
        });
        expect(lean.waterRetentionRiskScore).toBeNull();
        expect(obese.waterRetentionRiskScore).toBeNull();
    });
});

describe('Tool #002 — no medication recommendations', () => {
    it('does not recommend medication changes when the modeled E2 value is high', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'testosterone',
            weeklyDoseMg: 2000,
            bodyFatPct: 35,
            aiProtocol: 'none',
        });
        expect(r.aiRecommendation).toBe('not_assessed');
    });

    it('does not infer monitoring actions from an elevated modeled value', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'testosterone',
            weeklyDoseMg: 600,
            bodyFatPct: 15,
            aiProtocol: 'none',
        });
        expect(r.aiRecommendation).toBe('not_assessed');
    });

    it('does not recommend reducing an AI based on an unsupported curve', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'nandrolone', // low aromatization
            weeklyDoseMg: 200,
            bodyFatPct: 8,
            aiProtocol: 'aggressive',
        });
        expect(r.aiRecommendation).toBe('not_assessed');
    });

    it('does not label a selected factor unnecessary for a compound', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'trenbolone',
            aiProtocol: 'mild',
        });
        expect(r.aiRecommendation).toBe('not_assessed');
    });
});

describe('Tool #002 — determinism & hostile-input safety', () => {
    it('is deterministic for identical inputs', () => {
        const a = calculateAromatizationRisk(DEFAULT_AROMATIZATION_INPUT);
        const b = calculateAromatizationRisk(DEFAULT_AROMATIZATION_INPUT);
        expect(a).toEqual(b);
    });

    it('coerces NaN/Infinity/wrong-type inputs to safe defaults', () => {
        const hostile: EngineInput = {
            weeksOnCycle: NaN,
            weeklyDoseMg: Infinity,
            bodyFatPct: 'fat' as unknown as number,
            compoundType: 'superdrug' as never,
            aiProtocol: 'turbo' as never,
        };
        const r = calculateAromatizationRisk(hostile);
        expect(r.timeline.length).toBeGreaterThan(0);
        expect(Number.isFinite(r.peakE2)).toBe(true);
        expect(r.gynoRiskScore).toBeNull();
        expect(r.crashRiskScore).toBeNull();
    });

    it('clamps dose, weeks, and body fat to bounds', () => {
        const overdosed = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            weeklyDoseMg: 99999,
            weeksOnCycle: 999,
            bodyFatPct: 99,
        });
        // Should not crash and should produce finite values
        expect(Number.isFinite(overdosed.peakE2)).toBe(true);
        expect(overdosed.totalTimelineWeeks).toBe(24 + POST_CYCLE_OBSERVATION_WEEKS);
    });

    it('exposes all compound types and AI protocols', () => {
        expect(COMPOUND_TYPES).toHaveLength(6);
        expect(AI_PROTOCOLS).toHaveLength(4);
        expect(AROMATIZATION_RATES.trenbolone).toBe(0);
        expect(AROMATIZATION_RATES.testosterone).toBe(1.0);
        expect(AI_SUPPRESSION_FACTORS.none).toBe(0);
        expect(AI_SUPPRESSION_FACTORS.aggressive).toBeGreaterThan(AI_SUPPRESSION_FACTORS.mild);
    });
});
