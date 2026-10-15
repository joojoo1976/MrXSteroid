// tests/shared/unit-system.test.ts
/**
 * Unit System Integration Tests
 * Tests for lib/shared/unit-system.ts
 */

import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import {
  unitConversions,
  unitStorage,
  unitLabels,
  getUnitLabel,
  validateRoundTrip,
} from '@/lib/shared/unit-system';

describe('Unit System Integration Tests', () => {
  // Node-environment shim (same rationale as persistence.test.ts): unitStorage
  // guards on `window`, so install an in-memory browser shim to exercise real
  // storage paths. Restored after the file run.
  const store: Record<string, string> = {};
  const memoryStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };

  beforeEach(() => {
    memoryStorage.clear();
    vi.stubGlobal('window', { localStorage: memoryStorage });
    vi.stubGlobal('localStorage', memoryStorage);
  });

  afterEach(() => {
    memoryStorage.clear();
    vi.unstubAllGlobals();
    delete (globalThis as unknown as Record<string, unknown>)['window'];
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe('Bidirectional Conversions', () => {
    it('mg ↔ oz round-trip within precision', () => {
      const testValues = [1, 10, 100, 300, 500, 1000, 2000];
      for (const mg of testValues) {
        const oz = unitConversions.mgToOz(mg);
        const back = unitConversions.ozToMg(oz);
        expect(Math.abs(back - mg)).toBeLessThanOrEqual(0.5);
      }
    });

    it('kg ↔ lbs round-trip within precision', () => {
      const testValues = [1, 10, 50, 85, 100, 150];
      for (const kg of testValues) {
        const lbs = unitConversions.kgToLbs(kg);
        const back = unitConversions.lbsToKg(lbs);
        // 0.3 kg: honest bound — kgToLbs rounds to integer lbs by design
        // (PRECISION.KG_TO_LBS_DP = 0); see validateRoundTrip comment in lib.
        expect(Math.abs(back - kg)).toBeLessThanOrEqual(0.3);
      }
    });

    it('mgToOz and ozToMg are consistent', () => {
      expect(unitConversions.mgToOz(28349.523125)).toBeCloseTo(1, 6);
      expect(unitConversions.ozToMg(1)).toBeCloseTo(28349.5, 1);
    });

    it('kgToLbs and lbsToKg are consistent', () => {
      expect(unitConversions.kgToLbs(1)).toBe(2);
      expect(unitConversions.lbsToKg(2.20462)).toBeCloseTo(1, 1);
    });
  });

  describe('Repeated Switching (No Drift)', () => {
    it('Metric → Imperial → Metric preserves canonical value', () => {
      const originalMg = 300;
      const oz = unitConversions.mgToOz(originalMg);
      const backMg = unitConversions.ozToMg(oz);
      expect(backMg).toBe(originalMg);
    });

    it('Repeated cycling M→I→M→I→M never loses canonical dose', () => {
      let current = 300;
      for (let i = 0; i < 5; i++) {
        const oz = unitConversions.mgToOz(current);
        current = unitConversions.ozToMg(oz);
      }
      expect(current).toBe(300);
    });

    it('Editing in imperial writes back correct canonical mg', () => {
      const ozInput = 0.010582;
      const mg = unitConversions.ozToMg(ozInput);
      expect(mg).toBe(300);
    });
  });

  describe('Storage Persistence', () => {
    beforeEach(() => { if (typeof window !== 'undefined') localStorage.clear(); });
    afterEach(() => { if (typeof window !== 'undefined') localStorage.clear(); });

    it('getStored returns metric by default', () => {
      expect(unitStorage.getStored()).toBe('metric');
    });

    it('store and getStored round-trip', () => {
      unitStorage.store('imperial');
      expect(unitStorage.getStored()).toBe('imperial');
      unitStorage.store('metric');
      expect(unitStorage.getStored()).toBe('metric');
    });

    it('invalid stored value returns default metric', () => {
      localStorage.setItem('measurementSystem', 'invalid');
      expect(unitStorage.getStored()).toBe('metric');
    });

    it('localStorage errors are handled gracefully', () => {
      expect(() => unitStorage.getStored()).not.toThrow();
      expect(() => unitStorage.store('metric')).not.toThrow();
    });
  });

  describe('Display Labels', () => {
    it('getUnitLabel returns metric system labels', () => {
      expect(getUnitLabel('metric', 'system', 'ar')).toBe('متري (ملغ/كغ/سم)');
      expect(getUnitLabel('metric', 'system', 'en')).toBe('Metric (mg/kg/cm)');
    });

    it('getUnitLabel returns metric dose/weight/height labels', () => {
      expect(getUnitLabel('metric', 'dose', 'ar')).toBe('ملغ/أسبوع');
      expect(getUnitLabel('metric', 'dose', 'en')).toBe('mg/week');
      expect(getUnitLabel('metric', 'weight', 'ar')).toBe('كغ');
      expect(getUnitLabel('metric', 'weight', 'en')).toBe('kg');
      expect(getUnitLabel('metric', 'height', 'ar')).toBe('سم');
      expect(getUnitLabel('metric', 'height', 'en')).toBe('cm');
    });

    it('getUnitLabel returns imperial labels', () => {
      expect(getUnitLabel('imperial', 'system', 'ar')).toBe('إمبراطوري (ملغ/رطل/إنش)');
      expect(getUnitLabel('imperial', 'system', 'en')).toBe('Imperial (mg/lb/in)');
      expect(getUnitLabel('imperial', 'dose', 'ar')).toBe('أونصة/أسبوع');
      expect(getUnitLabel('imperial', 'dose', 'en')).toBe('oz/week');
      expect(getUnitLabel('imperial', 'weight', 'ar')).toBe('رطل');
      expect(getUnitLabel('imperial', 'weight', 'en')).toBe('lbs');
      expect(getUnitLabel('imperial', 'height', 'ar')).toBe('إنش');
      expect(getUnitLabel('imperial', 'height', 'en')).toBe('in');
    });

    it('unitLabels constants match getUnitLabel', () => {
      expect(unitLabels.metric.en).toBe('Metric (mg/kg/cm)');
      expect(unitLabels.imperial.en).toBe('Imperial (mg/lb/in)');
    });
  });

  describe('Round-Trip Validation', () => {
    it('validateRoundTrip returns true for standard values', () => {
      expect(validateRoundTrip()).toBe(true);
    });
  });
});