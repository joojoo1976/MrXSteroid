/**
 * Tool #010 — Aromatization Risk Engine · PART 2: Boundary tests.
 *
 * Real engine API only (lib/tools/engines/aromatization-risk.ts).
 *
 * Coverage per acceptance requirements:
 *  - Boundaries at 0.4 / 0.6 / 0.8 of the engine's scaling factors:
 *      · doseScale = weeklyDoseMg / REFERENCE_DOSE_MG(500) → 200/300/400 mg
 *      · bodyFatFactor extrapolated points: −3 → 0.4, 3 → 0.6, 9 → 0.8
 *  - Minimum and maximum value of EVERY risk zone (the engine's five tiers:
 *    crashed / suppressed / optimal / elevated / critical).
 *  - Exact threshold-edge behaviour of classifyE2Risk.
 */
import { describe, it, expect } from 'vitest'
import {
  calculateAromatizationRisk,
  classifyE2Risk,
  steadyStateE2For,
  bodyFatFactor,
  DEFAULT_AROMATIZATION_INPUT,
  BASELINE_E2,
  MAX_E2_ELEVATION,
  E2_CRASH_THRESHOLD,
  E2_OPTIMAL_LOW,
  E2_OPTIMAL_HIGH,
  E2_CRITICAL_THRESHOLD,
  REFERENCE_DOSE_MG,
  type EngineInput,
} from '../../lib/tools/engines/aromatization-risk'

const REF: EngineInput = { ...DEFAULT_AROMATIZATION_INPUT }

describe('Tool #010 real engine — part 2: boundaries 0.4 / 0.6 / 0.8', () => {
  describe('doseScale boundaries (dose / 500 mg reference)', () => {
    it('200 mg → doseScale 0.4 → steady = 30 + 40 = 70', () => {
      expect(REFERENCE_DOSE_MG).toBe(500)
      expect(steadyStateE2For({ ...REF, weeklyDoseMg: 200 })).toBe(BASELINE_E2 + MAX_E2_ELEVATION * 0.4)
    })

    it('300 mg → doseScale 0.6 → steady = 30 + 60 = 90', () => {
      expect(steadyStateE2For({ ...REF, weeklyDoseMg: 300 })).toBe(BASELINE_E2 + MAX_E2_ELEVATION * 0.6)
    })

    it('400 mg → doseScale 0.8 → steady = 30 + 80 = 110', () => {
      expect(steadyStateE2For({ ...REF, weeklyDoseMg: 400 })).toBe(BASELINE_E2 + MAX_E2_ELEVATION * 0.8)
    })

    it('steady-state is strictly monotone across the 0.4/0.6/0.8 boundary ladder', () => {
      const s200 = steadyStateE2For({ ...REF, weeklyDoseMg: 200 })
      const s300 = steadyStateE2For({ ...REF, weeklyDoseMg: 300 })
      const s400 = steadyStateE2For({ ...REF, weeklyDoseMg: 400 })
      expect(s200).toBeLessThan(s300)
      expect(s300).toBeLessThan(s400)
    })
  })

  describe('bodyFatFactor boundaries at 0.4 / 0.6 / 0.8', () => {
    it('factor(bf) = 0.5 + bf/30 hits 0.4 / 0.6 / 0.8 exactly at bf −3 / 3 / 9', () => {
      expect(bodyFatFactor(-3)).toBe(0.4)
      expect(bodyFatFactor(3)).toBe(0.6)
      expect(bodyFatFactor(9)).toBe(0.8)
    })

    it('factor is strictly increasing and finite across the full real range', () => {
      const lo = bodyFatFactor(6)
      const mid = bodyFatFactor(15)
      const hi = bodyFatFactor(40)
      expect(lo).toBeLessThan(mid)
      expect(mid).toBeLessThan(hi)
      for (const v of [lo, mid, hi]) expect(Number.isFinite(v)).toBe(true)
    })
  })

  describe('min & max of every risk zone (five engine tiers)', () => {
    it('crashed: min 0, max just below the crash threshold', () => {
      expect(classifyE2Risk(0)).toBe('crashed')
      expect(classifyE2Risk(E2_CRASH_THRESHOLD - 0.01)).toBe('crashed')
    })

    it('suppressed: min = E2_CRASH_THRESHOLD, max just below optimal low', () => {
      expect(classifyE2Risk(E2_CRASH_THRESHOLD)).toBe('suppressed')
      expect(classifyE2Risk(E2_OPTIMAL_LOW - 0.01)).toBe('suppressed')
    })

    it('optimal: min = E2_OPTIMAL_LOW, max = E2_OPTIMAL_HIGH (inclusive)', () => {
      expect(classifyE2Risk(E2_OPTIMAL_LOW)).toBe('optimal')
      expect(classifyE2Risk(E2_OPTIMAL_HIGH)).toBe('optimal')
    })

    it('elevated: min just above optimal high, max = critical threshold (inclusive)', () => {
      expect(classifyE2Risk(E2_OPTIMAL_HIGH + 0.01)).toBe('elevated')
      expect(classifyE2Risk(E2_CRITICAL_THRESHOLD)).toBe('elevated')
    })

    it('critical: min just above the critical threshold, still valid at 500', () => {
      expect(classifyE2Risk(E2_CRITICAL_THRESHOLD + 0.01)).toBe('critical')
      expect(classifyE2Risk(500)).toBe('critical')
    })

    it('zone mapping is exhaustive and gap-free across 0–500 pg/mL', () => {
      const allowed = new Set(['crashed', 'suppressed', 'optimal', 'elevated', 'critical'])
      for (let e2 = 0; e2 <= 500; e2 += 0.25) {
        expect(allowed.has(classifyE2Risk(e2))).toBe(true)
      }
    })
  })

  describe('boundary behaviour through the public simulation API', () => {
    it('minimum clamp dose 100 mg vs maximum 2000 mg both stay finite & ordered', () => {
      const lo = calculateAromatizationRisk({ ...REF, weeklyDoseMg: 100 })
      const hi = calculateAromatizationRisk({ ...REF, weeklyDoseMg: 2000 })
      expect(Number.isFinite(lo.peakE2)).toBe(true)
      expect(Number.isFinite(hi.peakE2)).toBe(true)
      expect(hi.peakE2).toBeGreaterThan(lo.peakE2)
    })

    it('AI-on-non-aromatizing crash risk is exactly 0.5·80·1.5 = 60', () => {
      // trenbolone (aromRate 0) + mild AI (0.5): pure crash risk, no benefit.
      const r = calculateAromatizationRisk({ ...REF, compoundType: 'trenbolone', aiProtocol: 'mild' })
      expect(r.crashRiskScore).toBe(60)
      expect(r.aiRecommendation).toBe('unnecessary')
    })

    it('critical-stack gyno score saturates at the 100 cap; water retention stays in band', () => {
      const r = calculateAromatizationRisk({ ...REF, weeklyDoseMg: 2000, bodyFatPct: 35 })
      expect(r.gynoRiskScore).toBe(100)
      expect(r.waterRetentionRiskScore).toBeGreaterThan(0)
      expect(r.waterRetentionRiskScore).toBeLessThanOrEqual(100)
    })
  })
})
