import { describe, it, expect, vi } from 'vitest';
import {
  batemanLevel,
  decayLevel,
  buildInjectionDays,
  clearanceDaysFromHalfLife,
  pctWaitDays,
  simulateSerum,
  stabilityScore,
  assessRisks,
  roundTo,
  clamp,
  isFiniteNumber,
  HALF_LIFE_STEP,
  CLEARANCE_MULTIPLIER,
  PCT_HALF_LIFE_MULTIPLIER,
  FREQ_INTERVALS,
} from './pharmaEngine';

describe('pharmaEngine — Pure Pharmacokinetic Math Core', () => {

  describe('Constants', () => {
    it('HALF_LIFE_STEP = 0.25 days (6-hour resolution)', () => {
      expect(HALF_LIFE_STEP).toBe(0.25);
    });

    it('CLEARANCE_MULTIPLIER = 5.32 (≈95% elimination)', () => {
      expect(CLEARANCE_MULTIPLIER).toBe(5.32);
    });

    it('PCT_HALF_LIFE_MULTIPLIER = 3.5 (SERM wait window)', () => {
      expect(PCT_HALF_LIFE_MULTIPLIER).toBe(3.5);
    });

    it('FREQ_INTERVALS maps frequency codes to days', () => {
      expect(FREQ_INTERVALS).toEqual({
        ed: 1, eod: 2, e3d: 3, e7d: 7,
      });
    });
  });

  describe('Number Precision Guards', () => {
    describe('isFiniteNumber', () => {
      it('returns true for finite numbers', () => {
        expect(isFiniteNumber(0)).toBe(true);
        expect(isFiniteNumber(1)).toBe(true);
        expect(isFiniteNumber(-5)).toBe(true);
        expect(isFiniteNumber(3.14)).toBe(true);
      });

      it('returns false for NaN, Infinity, non-numbers', () => {
        expect(isFiniteNumber(NaN)).toBe(false);
        expect(isFiniteNumber(Infinity)).toBe(false);
        expect(isFiniteNumber(-Infinity)).toBe(false);
        expect(isFiniteNumber('5')).toBe(false);
        expect(isFiniteNumber(null)).toBe(false);
        expect(isFiniteNumber(undefined)).toBe(false);
        expect(isFiniteNumber({})).toBe(false);
      });
    });

    describe('clamp', () => {
      it('clamps within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-5, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
      });

      it('handles NaN by returning min', () => {
        expect(clamp(NaN, 0, 10)).toBe(0);
        expect(clamp('invalid' as any, 0, 10)).toBe(0);
      });
    });

    describe('roundTo', () => {
      it('rounds to specified decimals', () => {
        expect(roundTo(3.14159, 2)).toBe(3.14);
        expect(roundTo(2.5, 0)).toBe(3);
      });

      it('handles floating point drift', () => {
        expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
      });

      it('rounds 1.005 correctly (banker rounding behavior)', () => {
        // 1.005 in binary FP is slightly < 1.005, so rounds to 1.00
        expect(roundTo(1.005, 2)).toBe(1.0);
      });

      it('returns 0 for invalid input', () => {
        expect(roundTo(NaN, 2)).toBe(0);
        expect(roundTo(Infinity, 2)).toBe(0);
      });
    });
  });

  describe('Bateman Absorption-Elimination Model', () => {
    it('returns 0 before injection (t < 0)', () => {
      expect(batemanLevel({ doseMg: 250, halfLifeDays: 5, deltaDays: -1 })).toBe(0);
    });

    it('returns 0 for zero or negative dose', () => {
      expect(batemanLevel({ doseMg: 0, halfLifeDays: 5, deltaDays: 1 })).toBe(0);
      expect(batemanLevel({ doseMg: -100, halfLifeDays: 5, deltaDays: 1 })).toBe(0);
    });

    it('computes positive concentration after injection', () => {
      const level = batemanLevel({ doseMg: 250, halfLifeDays: 5, deltaDays: 1 });
      expect(level).toBeGreaterThan(0);
    });

    it('respects esterWeight (active fraction)', () => {
      const full = batemanLevel({ doseMg: 250, halfLifeDays: 5, deltaDays: 1, esterWeight: 1 });
      const half = batemanLevel({ doseMg: 250, halfLifeDays: 5, deltaDays: 1, esterWeight: 0.5 });
      expect(half).toBeLessThan(full);
      expect(half / full).toBeCloseTo(0.5, 2);
    });

    it('clamps half-life to [0.1, 100]', () => {
      const tiny = batemanLevel({ doseMg: 250, halfLifeDays: 0.01, deltaDays: 1 });
      const huge = batemanLevel({ doseMg: 250, halfLifeDays: 1000, deltaDays: 1 });
      expect(tiny).toBeGreaterThan(0);
      expect(huge).toBeGreaterThan(0);
    });

    it('guards against division by zero (ka ≈ ke)', () => {
      const h = Math.LN2 / 3.0;
      const level = batemanLevel({ doseMg: 250, halfLifeDays: h, deltaDays: 1 });
      expect(isFiniteNumber(level)).toBe(true);
      expect(level).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Mono-exponential Decay (Verification)', () => {
    it('returns 0 before injection', () => {
      expect(decayLevel(250, 5, -1)).toBe(0);
    });

    it('returns dose at t=0', () => {
      expect(decayLevel(250, 5, 0)).toBe(250);
    });

    it('halves every half-life', () => {
      expect(decayLevel(250, 5, 5)).toBeCloseTo(125, 0);
      expect(decayLevel(250, 5, 10)).toBeCloseTo(62.5, 0);
    });
  });

  describe('Injection Schedule', () => {
    it('builds daily injections (ed)', () => {
      const days = buildInjectionDays(0, 7, 1);
      expect(days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it('builds every-other-day (eod)', () => {
      const days = buildInjectionDays(0, 7, 2);
      expect(days).toEqual([0, 2, 4, 6]);
    });

    it('builds every-3-days (e3d)', () => {
      const days = buildInjectionDays(0, 10, 3);
      expect(days).toEqual([0, 3, 6, 9]);
    });

    it('builds weekly (e7d)', () => {
      const days = buildInjectionDays(0, 21, 7);
      expect(days).toEqual([0, 7, 14]);
    });

    it('handles start offset', () => {
      const days = buildInjectionDays(7, 7, 1);
      expect(days).toEqual([7, 8, 9, 10, 11, 12, 13]);
    });

    it('returns empty for invalid interval', () => {
      expect(buildInjectionDays(0, 7, 0)).toEqual([]);
      expect(buildInjectionDays(0, 7, -1)).toEqual([]);
      expect(buildInjectionDays(0, 7, NaN)).toEqual([]);
    });
  });

  describe('Clearance & PCT Timing', () => {
    describe('clearanceDaysFromHalfLife', () => {
      it('computes 5.32 × t½ rounded to 1 decimal', () => {
        expect(clearanceDaysFromHalfLife(1)).toBe(5.3);
        expect(clearanceDaysFromHalfLife(5)).toBe(26.6);
        expect(clearanceDaysFromHalfLife(10)).toBe(53.2);
      });

      it('clamps half-life to [0.1, 100]', () => {
        expect(clearanceDaysFromHalfLife(0.01)).toBe(0.5);
        expect(clearanceDaysFromHalfLife(200)).toBe(532.0);
      });
    });

    describe('pctWaitDays', () => {
      it('computes 3.5 × t½ clamped to [3, 21]', () => {
        expect(pctWaitDays(1)).toBe(4); // 3.5 * 1 = 3.5 → round(3.5) = 4
        expect(pctWaitDays(5)).toBe(18); // 3.5 * 5 = 17.5 → round(17.5) = 18
        expect(pctWaitDays(0.5)).toBe(3); // clamped min
        expect(pctWaitDays(10)).toBe(21); // clamped max
      });
    });
  });

  describe('Full Serum Simulation', () => {
    const compounds = [
      { id: 'test_e', halfLife: 5.0, esterWeight: 0.72, name: 'Testosterone Enanthate' },
      { id: 'tren_a', halfLife: 2.5, esterWeight: 0.87, name: 'Trenbolone Acetate' },
      { id: 'deca', halfLife: 7.5, esterWeight: 0.62, name: 'Nandrolone Decanoate' },
    ];

    it('returns empty profile for empty stack', () => {
      const profile = simulateSerum({ stack: [], compounds });
      expect(profile.series).toEqual([]);
      expect(profile.maxLevel).toBe(0);
    });

    it('simulates single compound with daily dosing', () => {
      const stack = [{
        compoundId: 'test_e',
        dosage: 250,
        frequency: 'ed',
        duration: 12,
        startWeek: 1,
      }];
      const profile = simulateSerum({ stack, compounds });
      expect(profile.series.length).toBeGreaterThan(0);
      expect(profile.maxLevel).toBeGreaterThan(0);
      expect(profile.compoundNames).toContain('test_e_' + stack[0].id);
    });

    it('simulates multi-compound stack', () => {
      const stack = [
        { compoundId: 'test_e', dosage: 250, frequency: 'e3d', duration: 12, startWeek: 1 },
        { compoundId: 'tren_a', dosage: 75, frequency: 'eod', duration: 8, startWeek: 1 },
      ];
      const profile = simulateSerum({ stack, compounds });
      expect(profile.compoundNames.length).toBe(2);
      expect(profile.maxLevel).toBeGreaterThan(0);
    });

    it('handles different start weeks (staggered)', () => {
      const stack = [
        { compoundId: 'test_e', dosage: 250, frequency: 'e3d', duration: 12, startWeek: 1 },
        { compoundId: 'deca', dosage: 300, frequency: 'e7d', duration: 10, startWeek: 3 },
      ];
      const profile = simulateSerum({ stack, compounds });
      expect(profile.lastInjectionDay).toBeGreaterThan(0);
    });

    it('calculates saturation day (90% of Cmax)', () => {
      const stack = [{ compoundId: 'test_e', dosage: 250, frequency: 'ed', duration: 12, startWeek: 1 }];
      const profile = simulateSerum({ stack, compounds });
      expect(profile.saturationDay).toBeGreaterThanOrEqual(0);
    });

    it('computes trough level in steady-state window', () => {
      const stack = [{ compoundId: 'test_e', dosage: 250, frequency: 'ed', duration: 12, startWeek: 1 }];
      const profile = simulateSerum({ stack, compounds });
      expect(profile.troughLevel).toBeGreaterThanOrEqual(0);
    });

    it('deterministic: same input → same output', () => {
      const stack = [{ compoundId: 'test_e', dosage: 250, frequency: 'e3d', duration: 12, startWeek: 1 }];
      const p1 = simulateSerum({ stack, compounds });
      const p2 = simulateSerum({ stack, compounds });
      expect(p1.maxLevel).toBe(p2.maxLevel);
      expect(p1.series[10].total).toBe(p2.series[10].total);
    });
  });

  describe('Stability Score (CV-based)', () => {
    it('returns 100 for perfectly flat levels', () => {
      expect(stabilityScore([100, 100, 100, 100])).toBe(100);
    });

    it('returns 0 for empty or invalid input', () => {
      expect(stabilityScore([])).toBe(0);
      expect(stabilityScore([NaN, Infinity])).toBe(0);
    });

    it('decreases with higher variance', () => {
      const flat = stabilityScore([100, 100, 100, 100]);
      const wavy = stabilityScore([50, 150, 50, 150]);
      expect(wavy).toBeLessThan(flat);
    });

    it('filters out non-positive values', () => {
      const withZeros = stabilityScore([100, 0, 100, -10]);
      const clean = stabilityScore([100, 100]);
      expect(withZeros).toBe(clean);
    });
  });

  describe('Risk Stratification', () => {
    const stackWith19Nor = [
      { compoundId: 'test_e', dosage: 250, frequency: 'e3d', duration: 12, startWeek: 1 },
      { compoundId: 'tren_a', dosage: 75, frequency: 'eod', duration: 8, startWeek: 1 },
    ];

    const stackWithOral = [
      { compoundId: 'test_e', dosage: 250, frequency: 'e3d', duration: 12, startWeek: 1 },
      { compoundId: 'dbol', dosage: 30, frequency: 'ed', duration: 6, startWeek: 1 },
      { compoundId: 'anavar', dosage: 40, frequency: 'ed', duration: 8, startWeek: 3 },
    ];

    const stackWithAI = [
      { compoundId: 'test_e', dosage: 500, frequency: 'e3d', duration: 12, startWeek: 1 },
      { compoundId: 'arimidex', dosage: 1, frequency: 'e3d', duration: 12, startWeek: 1 },
    ];

    it('detects 19-nor compounds', () => {
      const risks = assessRisks(stackWith19Nor);
      expect(risks.has19Nor).toBe(true);
    });

    it('counts oral compounds', () => {
      const risks = assessRisks(stackWithOral);
      expect(risks.oralCount).toBe(2);
    });

    it('counts aromatizing compounds', () => {
      const risks = assessRisks(stackWithOral);
      expect(risks.aromatizationRisk).toBe(2); // test_e + dbol
    });

    it('detects AI presence', () => {
      const risksWithAI = assessRisks(stackWithAI);
      const risksWithoutAI = assessRisks(stackWithOral);
      expect(risksWithAI.hasAI).toBe(true);
      expect(risksWithoutAI.hasAI).toBe(false);
    });
  });

  describe('Edge Cases & Safety', () => {
    it('handles extreme half-life values safely', () => {
      const stack = [{ compoundId: 'test_e', dosage: 1000, frequency: 'ed', duration: 52, startWeek: 1 }];
      const compounds = [{ id: 'test_e', halfLife: 100, esterWeight: 0.7, name: 'Test' }];
      const profile = simulateSerum({ stack, compounds });
      expect(profile.maxLevel).toBeGreaterThan(0);
      expect(isFiniteNumber(profile.maxLevel)).toBe(true);
    });

    it('handles zero/negative duration gracefully (clamps to 1 week)', () => {
      const stack = [{ compoundId: 'test_e', dosage: 250, frequency: 'ed', duration: 0, startWeek: 1 }];
      const compounds = [{ id: 'test_e', halfLife: 5, esterWeight: 0.7, name: 'Test' }];
      const profile = simulateSerum({ stack, compounds });
      // Duration 0 is clamped to 1 week, so series is generated
      expect(profile.series.length).toBeGreaterThan(0);
      expect(profile.activePhaseEndDay).toBeGreaterThan(0);
    });

    it('clamps startWeek to [1, 52]', () => {
      const stack = [{ compoundId: 'test_e', dosage: 250, frequency: 'ed', duration: 12, startWeek: 100 }];
      const compounds = [{ id: 'test_e', halfLife: 5, esterWeight: 0.7, name: 'Test' }];
      const profile = simulateSerum({ stack, compounds });
      expect(profile.activePhaseEndDay).toBeLessThanOrEqual(52 * 7 + 12 * 7);
    });

    it('handles unknown compound IDs gracefully', () => {
      const stack = [{ compoundId: 'unknown_compound', dosage: 250, frequency: 'ed', duration: 12, startWeek: 1 }];
      const compounds = [{ id: 'test_e', halfLife: 5, esterWeight: 0.7, name: 'Test' }];
      const profile = simulateSerum({ stack, compounds });
      expect(profile.compoundNames).toEqual([]);
      expect(profile.maxLevel).toBe(0);
    });
  });
});