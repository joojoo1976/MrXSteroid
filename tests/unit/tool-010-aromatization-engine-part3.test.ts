/**
 * Tool #010 — Aromatization Risk Engine · PART 3: Hostile inputs,
 * validation, division-by-zero safety and input sensitivity.
 *
 * Real engine API only (lib/tools/engines/aromatization-risk.ts).
 * The engine is documented as TOTAL: it must never throw, never return
 * NaN/Infinity, and always coerce invalid input to safe clamped defaults.
 */
import { describe, it, expect } from 'vitest'
import {
  calculateAromatizationRisk,
  classifyE2Risk,
  steadyStateE2For,
  bodyFatFactor,
  DEFAULT_AROMATIZATION_INPUT,
  COMPOUND_TYPES,
  AI_PROTOCOLS,
  POST_CYCLE_OBSERVATION_WEEKS,
  type EngineInput,
} from '../../lib/tools/engines/aromatization-risk'

const REF: EngineInput = { ...DEFAULT_AROMATIZATION_INPUT }

/** Assert every numeric leaf of the result is a finite number. */
function expectAllFinite(result: ReturnType<typeof calculateAromatizationRisk>) {
  expect(Number.isFinite(result.peakE2)).toBe(true)
  expect(Number.isFinite(result.steadyStateE2)).toBe(true)
  expect(Number.isFinite(result.finalE2)).toBe(true)
  expect(Number.isFinite(result.gynoRiskScore)).toBe(true)
  expect(Number.isFinite(result.waterRetentionRiskScore)).toBe(true)
  expect(Number.isFinite(result.crashRiskScore)).toBe(true)
  expect(Number.isFinite(result.bodyFatMultiplier)).toBe(true)
  expect(Number.isFinite(result.compoundAromatizationRate)).toBe(true)
  expect(Number.isFinite(result.aiSuppressionFactor)).toBe(true)
  for (const p of result.timeline) {
    expect(Number.isFinite(p.estradiolPgml)).toBe(true)
    expect(Number.isFinite(p.aromataseActivityPct)).toBe(true)
    expect(Number.isFinite(p.aiSuppressionPct)).toBe(true)
  }
}

describe('Tool #010 real engine — part 3: hostile inputs & sensitivity', () => {
  describe('NaN / Infinity / wrong-type prevention', () => {
    it('NaN and Infinity everywhere → finite, clamped, well-formed result', () => {
      const hostile: EngineInput = {
        weeksOnCycle: NaN,
        weeklyDoseMg: Infinity,
        bodyFatPct: -Infinity,
        compoundType: 'not-a-compound' as never,
        aiProtocol: 'turbo' as never,
      }
      const r = calculateAromatizationRisk(hostile)
      expectAllFinite(r)
      expect(r.timeline.length).toBe(12 + POST_CYCLE_OBSERVATION_WEEKS)
      expect(r.timeline.length).toBeGreaterThan(0)
    })

    it('missing keys entirely → safe defaults, no throw', () => {
      const r = calculateAromatizationRisk({} as EngineInput)
      expectAllFinite(r)
      // defaults: 12 weeks, testosterone, no AI → steady 130
      expect(r.steadyStateE2).toBe(130)
    })

    it('string-typed numbers are coerced, never propagated as NaN', () => {
      const r = calculateAromatizationRisk({
        ...REF,
        weeklyDoseMg: '600' as unknown as number,
        bodyFatPct: {} as unknown as number,
      })
      expectAllFinite(r)
    })
  })

  describe('division-by-zero & zero/negative inputs', () => {
    it('zero dose is clamped to the 100 mg floor — no division by zero', () => {
      const r = calculateAromatizationRisk({ ...REF, weeklyDoseMg: 0 })
      expectAllFinite(r)
      // clamped to min 100 mg → doseScale 0.2 → steady = 30 + 20 = 50
      expect(r.steadyStateE2).toBe(50)
    })

    it('negative dose and negative weeks clamp to lower bounds', () => {
      const r = calculateAromatizationRisk({ ...REF, weeklyDoseMg: -500, weeksOnCycle: -3 })
      expectAllFinite(r)
      expect(r.steadyStateE2).toBe(50) // 100 mg floor
      expect(r.totalTimelineWeeks).toBe(4 + POST_CYCLE_OBSERVATION_WEEKS) // 4-week floor
    })

  describe('clamping at upper bounds', () => {
    it('dose 99999 → 2000; weeks 999 → 24; body fat 99 → 40', () => {
      const r = calculateAromatizationRisk({ ...REF, weeklyDoseMg: 99999, weeksOnCycle: 999, bodyFatPct: 99 })
      expectAllFinite(r)
      expect(r.totalTimelineWeeks).toBe(24 + POST_CYCLE_OBSERVATION_WEEKS)
      // steady = 30 + 100·(2000/500)·(0.5 + 40/30), engine round2 → 763.33
      expect(r.steadyStateE2).toBe(Math.round((30 + 100 * 4 * (0.5 + 40 / 30)) * 100) / 100)
    })
  })

  describe('input sensitivity — results track inputs correctly', () => {
    it('peakE2 increases with dose', () => {
      const low = calculateAromatizationRisk({ ...REF, weeklyDoseMg: 250 })
      const high = calculateAromatizationRisk({ ...REF, weeklyDoseMg: 1000 })
      expect(high.peakE2).toBeGreaterThan(low.peakE2)
    })

    it('peakE2 increases with body fat', () => {
      const lean = calculateAromatizationRisk({ ...REF, bodyFatPct: 8 })
      const heavy = calculateAromatizationRisk({ ...REF, bodyFatPct: 35 })
      expect(heavy.peakE2).toBeGreaterThan(lean.peakE2)
    })

    it('peakE2 decreases as AI suppression increases', () => {
      const none = calculateAromatizationRisk({ ...REF, aiProtocol: 'none' })
      const mild = calculateAromatizationRisk({ ...REF, aiProtocol: 'mild' })
      const aggressive = calculateAromatizationRisk({ ...REF, aiProtocol: 'aggressive' })
      expect(mild.peakE2).toBeLessThan(none.peakE2)
      expect(aggressive.peakE2).toBeLessThan(mild.peakE2)
    })

    it('aromatization rate ordering: testosterone > methandienone > trenbolone', () => {
      const test = steadyStateE2For({ ...REF, compoundType: 'testosterone' })
      const dbol = steadyStateE2For({ ...REF, compoundType: 'methandienone' })
      const tren = steadyStateE2For({ ...REF, compoundType: 'trenbolone' })
      expect(test).toBeGreaterThan(dbol)
      expect(dbol).toBeGreaterThan(tren)
    })

    it('critical scenarios classify consistently; safe scenarios stay optimal', () => {
      const critical = calculateAromatizationRisk({ ...REF, weeklyDoseMg: 2000, bodyFatPct: 35 })
      expect(critical.peakRiskZone).toBe(classifyE2Risk(critical.peakE2))
      expect(['elevated', 'critical']).toContain(critical.peakRiskZone)
      const safe = calculateAromatizationRisk({ ...REF, compoundType: 'trenbolone' })
      expect(safe.peakRiskZone).toBe('optimal')
    })
  })

  describe('determinism', () => {
    it('identical hostile input yields byte-identical JSON', () => {
      const hostile = { ...REF, weeklyDoseMg: NaN as unknown as number }
      expect(JSON.stringify(calculateAromatizationRisk(hostile))).toBe(
        JSON.stringify(calculateAromatizationRisk(hostile))
      )
    })

    it('every AI protocol × every compound stays finite (24 combos)', () => {
      for (const compoundType of COMPOUND_TYPES) {
        for (const aiProtocol of AI_PROTOCOLS) {
          expectAllFinite(calculateAromatizationRisk({ ...REF, compoundType, aiProtocol }))
        }
      }
    })
  })
})


    it('zero body fat clamps to the 6% floor inside the simulation', () => {
      expect(bodyFatFactor(0)).toBe(0.5) // pure fn still defined at 0
      const r = calculateAromatizationRisk({ ...REF, bodyFatPct: 0 })
      expectAllFinite(r)
      expect(r.bodyFatMultiplier).toBe(0.7) // 0.5 + 6/30
    })
  })
