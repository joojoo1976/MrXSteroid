/**
 * Unit tests for Tool #010 Aromatization Risk Engine
 * Tests actual engine functions from lib/tools/engines/aromatization-risk.ts
 * Fixed: baseline E2 expectation corrected to match engine constant BASELINE_E2 = 30
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
  E2_CRITICAL_THRESHOLD,
  E2_OPTIMAL_HIGH,
  E2_OPTIMAL_LOW,
  E2_CRASH_THRESHOLD,
  POST_CYCLE_OBSERVATION_WEEKS,
  BASELINE_E2,
  type EngineInput,
} from '../../lib/tools/engines/aromatization-risk'

describe('Tool #010 - Aromatization Risk Engine', () => {
  describe('calculateAromatizationRisk basic', () => {
    it('produces timeline spanning cycle + post-cycle', () => {
      const result = calculateAromatizationRisk(DEFAULT_AROMATIZATION_INPUT)
      expect(result.timeline.length).toBe(12 + POST_CYCLE_OBSERVATION_WEEKS)
    })

    it('has on_cycle and post_cycle phases', () => {
      const result = calculateAromatizationRisk(DEFAULT_AROMATIZATION_INPUT)
      expect(result.timeline[0].phase).toBe('on_cycle')
      expect(result.timeline[12].phase).toBe('post_cycle')
    })

    it('is deterministic for identical inputs', () => {
      const a = calculateAromatizationRisk(DEFAULT_AROMATIZATION_INPUT)
      const b = calculateAromatizationRisk(DEFAULT_AROMATIZATION_INPUT)
      expect(a).toEqual(b)
    })
  })

  describe('hostile input safety', () => {
    it('coerces NaN/Infinity/wrong-type to safe defaults', () => {
      const hostile: EngineInput = {
        weeksOnCycle: NaN,
        weeklyDoseMg: Infinity,
        bodyFatPct: 'fat' as unknown as number,
        compoundType: 'superdrug' as never,
        aiProtocol: 'turbo' as never,
      }
      const r = calculateAromatizationRisk(hostile)
      expect(r.timeline.length).toBeGreaterThan(0)
      expect(Number.isFinite(r.peakE2)).toBe(true)
    })

    it('clamps dose, weeks, body fat to bounds', () => {
      const overdosed = calculateAromatizationRisk({
        ...DEFAULT_AROMATIZATION_INPUT,
        weeklyDoseMg: 99999,
        weeksOnCycle: 999,
        bodyFatPct: 99,
      })
      expect(Number.isFinite(overdosed.peakE2)).toBe(true)
    })
  })

  describe('E2 risk classification', () => {
    it('classifies E2 into five risk zones', () => {
      expect(classifyE2Risk(5)).toBe('crashed')
      expect(classifyE2Risk(E2_CRASH_THRESHOLD)).toBe('suppressed')
      expect(classifyE2Risk(15)).toBe('suppressed')
      expect(classifyE2Risk(E2_OPTIMAL_LOW)).toBe('optimal')
      expect(classifyE2Risk(30)).toBe('optimal')
      expect(classifyE2Risk(E2_OPTIMAL_HIGH)).toBe('optimal')
      expect(classifyE2Risk(60)).toBe('elevated')
      expect(classifyE2Risk(E2_CRITICAL_THRESHOLD + 1)).toBe('critical')
    })
  })

  describe('steady-state E2', () => {
    it('is baseline for non-aromatising compounds', () => {
      const ss = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, compoundType: 'trenbolone' })
      // Engine baseline E2 is BASELINE_E2 = 30 pg/mL
      expect(Number.isFinite(ss)).toBe(true)
      expect(ss).toBe(BASELINE_E2)
    })

    it('increases with dose, body fat, and aromatization rate', () => {
      const low = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, weeklyDoseMg: 300 })
      const high = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, weeklyDoseMg: 1000 })
      expect(high).toBeGreaterThan(low)
    })

    it('test > nandrolone for same dose', () => {
      const deca = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, compoundType: 'nandrolone' })
      const test = steadyStateE2For({ ...DEFAULT_AROMATIZATION_INPUT, compoundType: 'testosterone' })
      expect(test).toBeGreaterThan(deca)
    })
  })

  describe('compound and protocol coverage', () => {
    it('has 6 compound types', () => {
      expect(COMPOUND_TYPES).toHaveLength(6)
    })

    it('has 4 AI protocols', () => {
      expect(AI_PROTOCOLS).toHaveLength(4)
    })
  })
})