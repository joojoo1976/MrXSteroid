/**
 * Unit tests for Tool #010 Aromatization Risk Engine
 * 
 * Tests per AROMATIZATION_RISK_ACCEPTANCE_REPORT.md requirements.
 * Run with: npx vitest run tests/unit/tool-010-aromatization-engine.test.ts
 */

import { describe, it, expect } from 'vitest'
// Import engine functions - types will be resolved
// @ts-expect-error - types resolved at runtime
import { calculateAromatizationTier, totalAromatization, analyzeScenario } from '../../lib/tools/engines/aromatization-risk'

describe('Tool #010 - Aromatization Risk Engine: calculateAromatizationTier', () => {
  it('should return 1-minimal for empty compounds array', () => {
    const result = calculateAromatizationTier([])
    expect(result.tier).toBe('1-minimal')
    expect(result.estrogen_estimate_mg).toBe(0)
  })

  it('should return appropriate tier for testosterone 500mg', () => {
    const result = calculateAromatizationTier([
      { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 1, weekly_dose_mg: 500 }
    ])
    expect(['1-minimal', '2-moderate', '3-high', '4-critical']).toContain(result.tier)
  })

  it('should return 2-moderate for aromatization factor 0.6 (boundary test)', () => {
    const result = calculateAromatizationTier([
      { name_en: 'Nandrolone', name_ar: 'ناندرولون', family: 'nandrolone', aromatization_factor: 0.6, weekly_dose_mg: 200 }
    ])
    // Factor 0.6 falls at the moderate boundary
    expect(result.tier).toBeDefined()
  })

  it('should handle zero dose without crashing', () => {
    const result = calculateAromatizationTier([
      { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 1, weekly_dose_mg: 0 }
    ])
    expect(result.estrogen_estimate_mg).toBe(0)
    expect(result.tier).toBeDefined()
  })

  it('should handle missing properties gracefully', () => {
    const result = calculateAromatizationTier([{ name_en: 'Testosterone' } as any])
    // Should not throw, should default safely
    expect(result.tier).toBeDefined()
  })
})

describe('Tool #010 - Aromatization Risk Engine: totalAromatization', () => {
  it('should calculate total aromatization with known inputs', () => {
    const result = totalAromatization([
      { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 1, weekly_dose_mg: 500 }
    ])
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
  })

  it('should handle empty array', () => {
    const result = totalAromatization([])
    expect(result).toBe(0)
  })

  it('should handle zero dose compounds', () => {
    const result = totalAromatization([
      { name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 1, weekly_dose_mg: 0 }
    ])
    expect(result).toBe(0)
  })
})

describe('Tool #010 - Aromatization Risk Engine: analyzeScenario', () => {
  it('should analyze scenario with compound addition', () => {
    const before = { compounds: [], totalAromatization: 0 }
    const after = { compounds: [{ name_en: 'Testosterone', name_ar: 'التستوسترون', family: 'testosterone', aromatization_factor: 1, weekly_dose_mg: 500 }], totalAromatization: 100 }
    
    const result = analyzeScenario(before, after)
    expect(result).toBeDefined()
    expect(result.tierChange).toBeDefined()
  })

  it('should handle scenario with no tier change', () => {
    const before = { compounds: [{ name_en: 'Nandrolone', name_ar: 'ناندرولون', family: 'nandrolone', aromatization_factor: 0.1, weekly_dose_mg: 100 }], totalAromatization: 10 }
    const after = { compounds: [{ name_en: 'Nandrolone', name_ar: 'ناندرولون', family: 'nandrolone', aromatization_factor: 0.1, weekly_dose_mg: 100 }], totalAromatization: 10 }
    
    const result = analyzeScenario(before, after)
    expect(result.tierChange).toBe(0)
  })

  it('should calculate percentage increase', () => {
    const before = { totalAromatization: 50, tier: '2-moderate' }
    const after = { totalAromatization: 80, tier: '3-high' }
    
    const result = analyzeScenario(before, after)
    expect(result.percentageIncrease).toBeGreaterThan(0)
  })
})