// tests/shared/engine-safety.test.ts
/**
 * Engine Safety Integration Tests
 * Tests for engine safety guarantees (no NaN, Infinity, div/0, etc.)
 */

import { describe, it, expect } from 'vitest';
import { 
  calculateAromatizationRisk, 
  steadyStateE2For, 
  bodyFatFactor,
  DEFAULT_AROMATIZATION_INPUT,
} from '@/lib/tools/engines/aromatization-risk';

describe('Engine Safety Integration Tests', () => {
  describe('No NaN in Results', () => {
    it('steadyStateE2For never returns NaN for valid inputs', () => {
      const result = steadyStateE2For(DEFAULT_AROMATIZATION_INPUT);
      expect(Number.isFinite(result)).toBe(true);
      expect(Number.isNaN(result)).toBe(false);
    });

    it('calculateAromatizationRisk never returns NaN for valid inputs', () => {
      const result = calculateAromatizationRisk(DEFAULT_AROMATIZATION_INPUT);
      expect(Number.isFinite(result.steadyStateE2)).toBe(true);
      expect(Number.isFinite(result.peakE2)).toBe(true);
      expect(Number.isFinite(result.finalE2)).toBe(true);
      expect(Number.isFinite(result.gynoRiskScore)).toBe(true);
      expect(Number.isFinite(result.waterRetentionRiskScore)).toBe(true);
      expect(Number.isFinite(result.crashRiskScore)).toBe(true);
      expect(Number.isFinite(result.bodyFatMultiplier)).toBe(true);
      expect(Number.isFinite(result.compoundAromatizationRate)).toBe(true);
      expect(Number.isFinite(result.aiSuppressionFactor)).toBe(true);
      
      for (const point of result.timeline) {
        expect(Number.isFinite(point.estradiolPgml)).toBe(true);
        expect(Number.isFinite(point.aromataseActivityPct)).toBe(true);
        expect(Number.isFinite(point.aiSuppressionPct)).toBe(true);
      }
    });

    it('handles hostile inputs without NaN', () => {
      const hostile = {
        weeksOnCycle: NaN,
        weeklyDoseMg: Infinity,
        bodyFatPct: -Infinity,
        compoundType: 'invalid' as any,
        aiProtocol: 'invalid' as any,
      };
      
      const result = calculateAromatizationRisk(hostile as any);
      expect(Number.isFinite(result.steadyStateE2)).toBe(true);
      expect(Number.isFinite(result.peakE2)).toBe(true);
      expect(Number.isFinite(result.finalE2)).toBe(true);
    });

    it('empty input object produces valid results', () => {
      const result = calculateAromatizationRisk({} as any);
      expect(Number.isFinite(result.steadyStateE2)).toBe(true);
      expect(result.steadyStateE2).toBe(130);
    });

    it('string numbers are coerced', () => {
      const result = calculateAromatizationRisk({
        ...DEFAULT_AROMATIZATION_INPUT,
        weeklyDoseMg: '600' as any,
        bodyFatPct: {} as any,
      });
      expect(Number.isFinite(result.steadyStateE2)).toBe(true);
    });
  });
});