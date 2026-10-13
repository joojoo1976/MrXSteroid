/**
 * Tool #010 — Aromatization Risk Engine · PART 1: Reference cases.
 *
 * Rewritten against the REAL engine API of
 * lib/tools/engines/aromatization-risk.ts:
 *   calculateAromatizationRisk(input) · classifyE2Risk · steadyStateE2For ·
 *   bodyFatFactor
 * (the previous revision imported non-existent symbols
 * `calculateAromatizationTier` / `totalAromatization` / `analyzeScenario`).
 *
 * Covered here: KNOWN reference scenarios with exact expected values derived
 * from the engine's documented constants (BASELINE_E2, MAX_E2_ELEVATION,
 * AROMATIZATION_RATES, AI_SUPPRESSION_FACTORS, bodyFatFactor).
 */
import { describe, it, expect } from 'vitest'
import {
  calculateAromatizationRisk,
  classifyE2Risk,
  steadyStateE2For,
  bodyFatFactor,
  DEFAULT_AROMATIZATION_INPUT,
  AROMATIZATION_RATES,
  AI_SUPPRESSION_FACTORS,
  BASELINE_E2,
  MAX_E2_ELEVATION,
  POST_CYCLE_OBSERVATION_WEEKS,
  type EngineInput,
} from '../../lib/tools/engines/aromatization-risk'

/** Reference protocol: 500 mg/wk testosterone, 12 wks, 15% BF, no AI. */
const REF: EngineInput = { ...DEFAULT_AROMATIZATION_INPUT }

describe('Tool #010 real engine — part 1: reference scenarios', () => {
  describe('calculateAromatizationRisk — known reference cases', () => {
    it('reference protocol produces the documented 12+8 week timeline', () => {
      const r = calculateAromatizationRisk(REF)
      expect(r.timeline).toHaveLength(12 + POST_CYCLE_OBSERVATION_WEEKS)
      expect(r.totalTimelineWeeks).toBe(12 + POST_CYCLE_OBSERVATION_WEEKS)
      expect(r.timeline[0].phase).toBe('on_cycle')
      expect(r.timeline[12].phase).toBe('post_cycle')
    })

    it('reference protocol steady-state = BASELINE + MAX_E2_ELEVATION·(dose 500 scale)', () => {
      // doseScale=1, aromRate(testosterone)=1, bfFactor(15%)=1, aiSupp(none)=0
      // → steady = 30 + 100·1·1·1·(1−0) = 130 pg/mL
      const r = calculateAromatizationRisk(REF)
      expect(r.steadyStateE2).toBe(BASELINE_E2 + MAX_E2_ELEVATION)
      expect(r.compoundAromatizationRate).toBe(AROMATIZATION_RATES.testosterone)
      expect(r.aiSuppressionFactor).toBe(0)
      expect(r.bodyFatMultiplier).toBe(1)
    })

    it('peakE2 sits strictly between baseline and steady-state for 12 weeks', () => {
      const r = calculateAromatizationRisk(REF)
      expect(r.peakE2).toBeGreaterThan(BASELINE_E2)
      expect(r.peakE2).toBeLessThan(r.steadyStateE2)
      // week 12 = 3τ rise → 30 + 100·(1−e^−4) ≈ 128.17 pg/mL
      expect(r.peakE2).toBeCloseTo(128.17, 1)
    })

    it('final E2 decays back toward baseline after 8 post-cycle weeks', () => {
      const r = calculateAromatizationRisk(REF)
      expect(r.finalE2).toBeLessThan(r.peakE2)
      expect(r.finalE2).toBeGreaterThan(BASELINE_E2)
    })

    it('trenbolone (non-aromatizable) stays at baseline E2 throughout', () => {
      const r = calculateAromatizationRisk({ ...REF, compoundType: 'trenbolone' })
      expect(r.compoundAromatizationRate).toBe(0)
      expect(r.steadyStateE2).toBe(BASELINE_E2)
      expect(r.peakE2).toBe(BASELINE_E2)
      expect(r.finalE2).toBe(BASELINE_E2)
      expect(r.peakRiskZone).toBe('optimal')
    })

    it('methandienone (0.9) steady-state = 30 + 90 = 120', () => {
      const r = calculateAromatizationRisk({ ...REF, compoundType: 'methandienone' })
      expect(r.steadyStateE2).toBe(BASELINE_E2 + MAX_E2_ELEVATION * 0.9)
    })

    it('AI protocols scale the ceiling exactly by (1 − suppression)', () => {
      // none → 130 · mild(0.5) → 80 · standard(0.72) → 58 · aggressive(0.88) → 42
      expect(steadyStateE2For({ ...REF, aiProtocol: 'none' })).toBe(130)
      expect(steadyStateE2For({ ...REF, aiProtocol: 'mild' })).toBe(80)
      expect(steadyStateE2For({ ...REF, aiProtocol: 'standard' })).toBe(58)
      expect(steadyStateE2For({ ...REF, aiProtocol: 'aggressive' })).toBe(42)
      expect(AI_SUPPRESSION_FACTORS.mild).toBe(0.5)
    })

    it('risk scores stay inside the documented 0–100 bands', () => {
      const r = calculateAromatizationRisk(REF)
      for (const s of [r.gynoRiskScore, r.waterRetentionRiskScore, r.crashRiskScore]) {
        expect(Number.isFinite(s)).toBe(true)
        expect(s).toBeGreaterThanOrEqual(0)
        expect(s).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('classifyE2Risk — known zone lookups', () => {
    it('classifies the documented reference values', () => {
      expect(classifyE2Risk(5)).toBe('crashed')
      expect(classifyE2Risk(15)).toBe('suppressed')
      expect(classifyE2Risk(30)).toBe('optimal')
      expect(classifyE2Risk(60)).toBe('elevated')
      expect(classifyE2Risk(120)).toBe('critical')
    })

    it('peakRiskZone always equals classifyE2Risk(peakE2)', () => {
      for (const input of [
        REF,
        { ...REF, weeklyDoseMg: 1500 },
        { ...REF, compoundType: 'trenbolone' as const },
        { ...REF, bodyFatPct: 35 },
      ]) {
        const r = calculateAromatizationRisk(input)
        expect(r.peakRiskZone).toBe(classifyE2Risk(r.peakE2))
      }
    })
  })

  describe('bodyFatFactor — reference points', () => {
    it('15% BF is the 1.0× lean-male anchor; 0% → 0.5×; 30% → 1.5×', () => {
      expect(bodyFatFactor(15)).toBe(1)
      expect(bodyFatFactor(0)).toBe(0.5)
      expect(bodyFatFactor(30)).toBe(1.5)
    })
  })
})
