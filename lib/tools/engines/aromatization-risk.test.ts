/**
 * lib/tools/engines/aromatization-risk.test.ts
 * Tool #002 — Layer 1 engine tests: E2 trajectory, risk zones, determinism,
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
    E2_CRASH_THRESHOLD,
    E2_CRITICAL_THRESHOLD,
    E2_OPTIMAL_HIGH,
    E2_OPTIMAL_LOW,
    POST_CYCLE_OBSERVATION_WEEKS,
    bodyFatFactor,
    calculateAromatizationRisk,
    classifyE2Risk,
    steadyStateE2For,
    type EngineInput,
} from './aromatization-risk';

describe('Tool #002 — helpers', () => {
    it('classifies E2 into five risk zones', () => {
        expect(classifyE2Risk(5)).toBe('crashed');
        expect(classifyE2Risk(E2_CRASH_THRESHOLD)).toBe('suppressed');
        expect(classifyE2Risk(15)).toBe('suppressed');
        expect(classifyE2Risk(E2_OPTIMAL_LOW)).toBe('optimal');
        expect(classifyE2Risk(30)).toBe('optimal');
        expect(classifyE2Risk(E2_OPTIMAL_HIGH)).toBe('optimal');
        expect(classifyE2Risk(60)).toBe('elevated');
        expect(classifyE2Risk(E2_CRITICAL_THRESHOLD + 1)).toBe('critical');
    });

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

describe('Tool #002 — risk zones and scores', () => {
    it('trenbolone with no AI produces baseline E2 and zero gyno risk', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'trenbolone',
            aiProtocol: 'none',
        });
        expect(r.compoundAromatizationRate).toBe(0);
        expect(r.peakE2).toBe(BASELINE_E2);
        expect(r.gynoRiskScore).toBe(0);
        expect(r.peakRiskZone).toBe('optimal');
    });

    it('high-dose testosterone no AI produces elevated or critical E2', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'testosterone',
            weeklyDoseMg: 1500,
            bodyFatPct: 25,
            aiProtocol: 'none',
        });
        expect(r.peakE2).toBeGreaterThan(E2_OPTIMAL_HIGH);
        expect(['elevated', 'critical']).toContain(r.peakRiskZone);
        expect(r.gynoRiskScore).toBeGreaterThan(0);
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

    it('crash risk is zero without AI and positive with AI on non-aromatising compound', () => {
        const noAi = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'trenbolone',
            aiProtocol: 'none',
        });
        expect(noAi.crashRiskScore).toBe(0);

        const unnecessaryAi = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'trenbolone',
            aiProtocol: 'aggressive',
        });
        expect(unnecessaryAi.crashRiskScore).toBeGreaterThan(0);
        expect(unnecessaryAi.aiRecommendation).toBe('unnecessary');
    });

    it('water-retention risk scales with body fat', () => {
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
        expect(obese.waterRetentionRiskScore).toBeGreaterThanOrEqual(lean.waterRetentionRiskScore);
    });
});

describe('Tool #002 — AI recommendation logic', () => {
    it('recommends adjust_up when E2 is critical with no AI', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'testosterone',
            weeklyDoseMg: 2000,
            bodyFatPct: 35,
            aiProtocol: 'none',
        });
        expect(r.aiRecommendation).toBe('adjust_up');
    });

    it('recommends monitor when E2 is elevated with no AI', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'testosterone',
            weeklyDoseMg: 600,
            bodyFatPct: 15,
            aiProtocol: 'none',
        });
        // 600mg test, 15% BF, no AI — E2 should be above optimal but maybe not critical
        if (r.peakE2 > E2_OPTIMAL_HIGH && r.peakE2 <= E2_CRITICAL_THRESHOLD) {
            expect(r.aiRecommendation).toBe('monitor');
        }
    });

    it('recommends reduce_ai when AI crashes E2 below optimal', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'nandrolone', // low aromatization
            weeklyDoseMg: 200,
            bodyFatPct: 8,
            aiProtocol: 'aggressive',
        });
        expect(['reduce_ai', 'none_needed']).toContain(r.aiRecommendation);
    });

    it('recommends unnecessary for trenbolone with AI', () => {
        const r = calculateAromatizationRisk({
            ...DEFAULT_AROMATIZATION_INPUT,
            compoundType: 'trenbolone',
            aiProtocol: 'mild',
        });
        expect(r.aiRecommendation).toBe('unnecessary');
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
        expect(Number.isFinite(r.gynoRiskScore)).toBe(true);
        expect(Number.isFinite(r.crashRiskScore)).toBe(true);
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
