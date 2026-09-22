/**
 * lib/tools/engines/hpta-recovery.test.ts
 * Tool #003 — Layer 1 engine tests: suppression ramp, washout decay, recovery
 * rebound, PCT acceleration, determinism and hostile-input safety.
 */
import { describe, it, expect } from 'vitest';
import {
    DEFAULT_HPTA_INPUT,
    ENDO_FLOOR_PCT,
    LH_LAG_FACTOR,
    PCT_BOOST_FACTORS,
    POTENCY_FACTORS,
    RECOVERY_COMPLETE_THRESHOLD,
    SUPPRESSION_MAX,
    calculateHptaRecovery,
    recoveryFraction,
    washoutWeeksFor,
    type EngineInput,
} from './hpta-recovery';

const baseInput = (overrides: Partial<EngineInput> = {}): EngineInput => ({
    weeksOnCycle: 12,
    compoundPotency: 'heavy',
    pctProtocol: 'aggressive_mrx',
    ...overrides,
});

describe('Tool #003 — helpers', () => {
    it('maps potency → washout window within bounds', () => {
        expect(washoutWeeksFor('mild')).toBeGreaterThanOrEqual(1);
        expect(washoutWeeksFor('extreme')).toBeGreaterThanOrEqual(washoutWeeksFor('mild'));
        expect(washoutWeeksFor('extreme')).toBeLessThanOrEqual(8);
        // extreme: 2 * 1.8 = 3.6 → 4
        expect(washoutWeeksFor('extreme')).toBe(4);
    });

    it('recovery fraction is monotonic and bounded [0,1)', () => {
        const f1 = recoveryFraction(1, PCT_BOOST_FACTORS.aggressive_mrx, 'heavy');
        const f5 = recoveryFraction(5, PCT_BOOST_FACTORS.aggressive_mrx, 'heavy');
        expect(f1).toBeGreaterThanOrEqual(0);
        expect(f5).toBeGreaterThan(f1);
        expect(f5).toBeLessThan(1);
    });
});

describe('Tool #003 — suppression & washout', () => {
    const result = calculateHptaRecovery(baseInput());

    it('emits one point per week across all three phases', () => {
        expect(result.timeline).toHaveLength(result.totalTimelineWeeks);
        expect(result.timeline[0].weekNumber).toBe(1);
        expect(result.timeline[0].phase).toBe('cycle');
        const washoutStart = result.timeline[12]; // week 13 (cycle was 12)
        expect(washoutStart.phase).toBe('washout');
        const recoveryStart = result.timeline[12 + result.washoutWeeks];
        expect(recoveryStart.phase).toBe('recovery');
    });

    it('suppression climbs during the cycle and peaks at the cycle end', () => {
        const cyclePoints = result.timeline.filter((p) => p.phase === 'cycle');
        expect(cyclePoints[cyclePoints.length - 1].suppressionPct).toBeGreaterThanOrEqual(cyclePoints[0].suppressionPct);
        expect(result.peakSuppressionPct).toBeGreaterThan(0);
        expect(result.peakSuppressionPct).toBeLessThanOrEqual(SUPPRESSION_MAX);
    });

    it('keeps suppression + endogenous T as a consistent inverse (~100) on the cycle', () => {
        for (const p of result.timeline) {
            if (p.phase === 'cycle' || p.phase === 'washout') {
                expect(p.suppressionPct + p.endogenousTestosteronePct).toBeCloseTo(100, 0);
            }
        }
    });

    it('endogenous T never drops below the physiological floor', () => {
        for (const p of result.timeline) {
            expect(p.endogenousTestosteronePct).toBeGreaterThanOrEqual(ENDO_FLOOR_PCT);
        }
    });

    it('LH tracks endogenous T just below parity', () => {
        for (const p of result.timeline) {
            expect(p.lhPct).toBeLessThanOrEqual(p.endogenousTestosteronePct + 0.01);
            // lag factor <= 1
            expect(LH_LAG_FACTOR).toBeLessThanOrEqual(1);
        }
    });
});

describe('Tool #003 — recovery rebound & PCT acceleration', () => {
    it('endogenous T rebounds monotonically during the recovery phase', () => {
        const r = calculateHptaRecovery(baseInput());
        const recoveryPoints = r.timeline.filter((p) => p.phase === 'recovery');
        for (let i = 1; i < recoveryPoints.length; i++) {
            expect(recoveryPoints[i].endogenousTestosteronePct).toBeGreaterThanOrEqual(
                recoveryPoints[i - 1].endogenousTestosteronePct - 0.01,
            );
        }
    });

    it('aggressive PCT recovers faster than no PCT for the same potency', () => {
        const aggressive = calculateHptaRecovery(baseInput({ pctProtocol: 'aggressive_mrx' }));
        const none = calculateHptaRecovery(baseInput({ pctProtocol: 'none' }));
        expect(aggressive.finalTestosteronePct).toBeGreaterThan(none.finalTestosteronePct);
        expect(aggressive.recoveryCompleteWeek).toBeLessThanOrEqual(none.recoveryCompleteWeek || Infinity);
    });

    it('extreme potency suppresses deeper and recovers slower than mild', () => {
        const extreme = calculateHptaRecovery(baseInput({ compoundPotency: 'extreme' }));
        const mild = calculateHptaRecovery(baseInput({ compoundPotency: 'mild' }));
        expect(extreme.peakSuppressionPct).toBeGreaterThanOrEqual(mild.peakSuppressionPct);
        // recovery completion for extreme is not faster than mild (potency slows λ)
        const ex = extreme.recoveryCompleteWeek || Infinity;
        const mi = mild.recoveryCompleteWeek || Infinity;
        expect(ex).toBeGreaterThanOrEqual(mi);
    });

    it('reaches the 90% recovery threshold within a long-enough aggressive protocol', () => {
        const r = calculateHptaRecovery(baseInput({ pctProtocol: 'aggressive_mrx' }));
        expect(r.recoveryCompleteWeek).toBeGreaterThan(0);
        const at = r.timeline.find((p) => p.weekNumber === r.recoveryCompleteWeek);
        expect(at?.endogenousTestosteronePct).toBeGreaterThanOrEqual(RECOVERY_COMPLETE_THRESHOLD);
    });
});

describe('Tool #003 — determinism & hostile input', () => {
    it('is deterministic: identical inputs → identical outputs', () => {
        expect(calculateHptaRecovery(DEFAULT_HPTA_INPUT)).toEqual(calculateHptaRecovery(DEFAULT_HPTA_INPUT));
    });

    it('degrades safely on hostile input (never throws, never NaN)', () => {
        const hostile = calculateHptaRecovery({
            weeksOnCycle: Number.NaN,
            compoundPotency: 'ghost' as never,
            pctProtocol: 'alien' as never,
        });
        expect(hostile.timeline.length).toBeGreaterThan(0);
        for (const p of hostile.timeline) {
            expect(Number.isFinite(p.suppressionPct)).toBe(true);
            expect(Number.isFinite(p.endogenousTestosteronePct)).toBe(true);
            expect(Number.isFinite(p.lhPct)).toBe(true);
        }
    });

    it('clamps an over-long cycle to the 24-week ceiling', () => {
        const r = calculateHptaRecovery(baseInput({ weeksOnCycle: 9999 }));
        const cycleWeeks = r.timeline.filter((p) => p.phase === 'cycle').length;
        expect(cycleWeeks).toBe(24);
    });

    it('uses the potency and PCT boost factor constants consistently', () => {
        expect(POTENCY_FACTORS.extreme).toBeGreaterThan(POTENCY_FACTORS.mild);
        expect(PCT_BOOST_FACTORS.aggressive_mrx).toBeGreaterThan(PCT_BOOST_FACTORS.none);
    });
});
