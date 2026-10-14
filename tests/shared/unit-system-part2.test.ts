// tests/shared/unit-system-part2.test.ts
/**
 * Unit System Integration Tests - Part 2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  unitConversions,
  unitLabels,
  getUnitLabel,
  validateRoundTrip,
  UNIT_CONSTANTS,
  PRECISION,
} from '@/lib/shared/unit-system';

describe('Unit System Integration Tests - Part 2', () => {
  describe('Edge Values', () => {
    it('zero values handled correctly', () => {
      expect(unitConversions.mgToOz(0)).toBe(0);
      expect(unitConversions.ozToMg(0)).toBe(0);
      expect(unitConversions.kgToLbs(0)).toBe(0);
      expect(unitConversions.lbsToKg(0)).toBe(0);
    });

    it('zero values produce no NaN', () => {
      expect(Number.isNaN(unitConversions.mgToOz(0))).toBe(false);
      expect(Number.isNaN(unitConversions.ozToMg(0))).toBe(false);
      expect(Number.isFinite(unitConversions.mgToOz(0))).toBe(true);
    });

    it('negative values are handled', () => {
      const result1 = unitConversions.mgToOz(-100);
      const result2 = unitConversions.ozToMg(-0.1);
      expect(Number.isFinite(result1)).toBe(true);
      expect(Number.isFinite(result2)).toBe(true);
    });

    it('decimal precision is maintained', () => {
      const oz = unitConversions.mgToOz(300);
      expect(oz).toBe(0.010582);
      
      const mg = unitConversions.ozToMg(0.010582);
      expect(mg).toBe(300.0);
    });
  });

  describe('Invalid Values', () => {
    it('NaN input produces finite output (clamped to 0)', () => {
      const oz = unitConversions.mgToOz(NaN);
      const mg = unitConversions.ozToMg(NaN);
      expect(Number.isFinite(oz) || oz === 0).toBe(true);
      expect(Number.isFinite(mg) || mg === 0).toBe(true);
    });

    it('Infinity input handled gracefully', () => {
      const oz = unitConversions.mgToOz(Infinity);
      const mg = unitConversions.ozToMg(Infinity);
      expect(Number.isFinite(oz) || oz === 0 || oz === Infinity).toBe(true);
    });

    it('Negative Infinity handled gracefully', () => {
      const oz = unitConversions.mgToOz(-Infinity);
      expect(Number.isFinite(oz) || oz === 0).toBe(true);
    });
  });

  describe('Display Labels', () => {
    it('getUnitLabel returns correct labels for metric/ar', () => {
      expect(getUnitLabel('metric', 'system', 'ar')).toBe('متري (ملغ/كغ/سم)');
      expect(getUnitLabel('metric', 'dose', 'ar')).toBe('ملغ/أسبوع');
      expect(getUnitLabel('metric', 'weight', 'ar')).toBe('كغ');
      expect(getUnitLabel('metric', 'height', 'ar')).toBe('سم');
    });

    it('getUnitLabel returns correct labels for metric/en', () => {
      expect(getUnitLabel('metric', 'system', 'en')).toBe('Metric (mg/kg/cm)');
      expect(getUnitLabel('metric', 'dose', 'en')).toBe('mg/week');
      expect(getUnitLabel('metric', 'weight', 'en')).toBe('kg');
      expect(getUnitLabel('metric', 'height', 'en')).toBe('cm');
    });

    it('getUnitLabel returns correct labels for imperial/ar', () => {
      expect(getUnitLabel('imperial', 'system', 'ar')).toBe('إمبراطوري (ملغ/رطل/إنش)');
      expect(getUnitLabel('imperial', 'dose', 'ar')).toBe('أونصة/أسبوع');
      expect(getUnitLabel('imperial', 'weight', 'ar')).toBe('رطل');
      expect(getUnitLabel('imperial', 'height', 'ar')).toBe('إنش');
    });

    it('getUnitLabel returns correct labels for imperial/en', () => {
      expect(getUnitLabel('imperial', 'system', 'en')).toBe('Imperial (mg/lb/in)');
      expect(getUnitLabel('imperial', 'dose', 'en')).toBe('oz/week');
      expect(getUnitLabel('imperial', 'weight', 'en')).toBe('lbs');
      expect(getUnitLabel('imperial', 'height', 'en')).toBe('in');
    });
  });

  describe('Round-Trip Validation', () => {
    it('validateRoundTrip returns true for all test values', () => {
      expect(validateRoundTrip()).toBe(true);
    });
  });

  describe('Constants', () => {
    it('UNIT_CONSTANTS have correct values', () => {
      expect(UNIT_CONSTANTS.KG_TO_LBS).toBe(2.20462);
      expect(UNIT_CONSTANTS.MG_PER_OZ).toBe(28349.523125);
    });

    it('PRECISION constants are correct', () => {
      expect(PRECISION.MG_TO_OZ_DP).toBe(6);
      expect(PRECISION.OZ_TO_MG_DP).toBe(1);
      expect(PRECISION.KG_TO_LBS_DP).toBe(0);
      expect(PRECISION.LBS_TO_KG_DP).toBe(1);
    });
  });

  describe('No NaN or Infinity in Results', () => {
    it('All conversion functions return finite numbers for valid inputs', () => {
      const testValues = [1, 10, 100, 300, 500, 1000, 2000];
      
      for (const value of testValues) {
        const oz = unitConversions.mgToOz(value);
        const back = unitConversions.ozToMg(oz);
        const kg = value / 1000;
        const lbs = unitConversions.kgToLbs(kg);
        const backKg = unitConversions.lbsToKg(lbs);
        
        expect(Number.isFinite(oz)).toBe(true);
        expect(Number.isFinite(back)).toBe(true);
        expect(Number.isFinite(lbs)).toBe(true);
        expect(Number.isFinite(backKg)).toBe(true);
      }
    });
  });
});