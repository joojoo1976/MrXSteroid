/**
 * Part 2: Edge case tests for Tool #010 Aromatization Risk Engine
 */

import { describe, it, expect } from 'vitest'
// @ts-expect-error - types resolved at runtime
import { calculateAromatizationTier, totalAromatization, analyzeScenario } from '../../lib/tools/engines/aromatization-risk'

describe('Tool #010 - Edge Cases', () => {
  describe('calculateAromatizationTier - NaN and Infinity prevention', () => {
    it('should prevent NaN in calculations', () => {
      const result = calculateAromatizationTier([{ name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: NaN, weekly_dose_mg: 500 }])
      expect(isNaN(result.tier)).toBeFalsy()
      expect(isNaN(result.estrogen_estimate_mg)).toBeFalsy()
    })

    it('should prevent Infinity in calculations', () => {
      const result = calculateAromatizationTier([{ name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: Infinity, weekly_dose_mg: 500 }])
      expect(isFinite(result.tier)).toBeTruthy()
      expect(isFinite(result.estrogen_estimate_mg)).toBeTruthy()
    })

    it('should handle negative dose', () => {
      const result = calculateAromatizationTier([
        { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 1, weekly_dose_mg: -100 }
      ])
      // Should not crash, result should be defined
      expect(result.tier).toBeDefined()
    })
  })

  describe('calculateAromatizationTier - tier thresholds', () => {
    it('should classify very low aromatization factor as 1-minimal', () => {
      const result = calculateAromatizationTier([
        { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 0.1, weekly_dose_mg: 100 }
      ])
      expect(result.tier).toBe('1-minimal')
    })

    it('should classify moderate aromatization as 2-moderate', () => {
      const result = calculateAromatizationTier([
        { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 0.5, weekly_dose_mg: 200 }
      ])
      expect(result.tier).toBe('2-moderate')
    })

    it('should classify high aromatization as 3-high', () => {
      const result = calculateAromatizationTier([
        { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 0.8, weekly_dose_mg: 500 }
      ])
      expect(result.tier).toBe('3-high')
    })

    it('should classify very high aromatization as 4-critical', () => {
      const result = calculateAromatizationTier([
        { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 1.5, weekly_dose_mg: 500 }
      ])
      expect(result.tier).toBe('4-critical')
    })
  })

  describe('totalAromatization - edge cases', () => {
    it('should handle mix of compounds with different factors', () => {
      const result = totalAromatization([
        { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 1, weekly_dose_mg: 250 },
        { name_en: 'Nandrolone', name_ar: 'ناندرولون', family: 'nandrolone', aromatization_factor: 0.5, weekly_dose_mg: 200 }
      ])
      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThan(0)
    })

    it('should handle large dose values', () => {
      const result = totalAromatization([
        { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 1, weekly_dose_mg: 1000 }
      ])
      expect(typeof result).toBe('number')
    })
  })

  describe('analyzeScenario - percentage change', () => {
    it('should calculate positive percentage increase', () => {
      const before = { totalAromatization: 30, tier: '1-minimal' }
      const after = { totalAromatization: 60, tier: '3-high' }
      
      const result = analyzeScenario(before, after)
      expect(result.percentageIncrease).toBeGreaterThan(0)
      expect(result.percentageIncrease).toBeLessThanOrEqual(100)
    })

    it('should calculate zero percentage increase when no change', () => {
      const before = { totalAromatization: 50, tier: '2-moderate' }
      const after = { totalAromatization: 50, tier: '2-moderate' }
      
      const result = analyzeScenario(before, after)
      expect(result.percentageIncrease).toBe(0)
    })
  })
})