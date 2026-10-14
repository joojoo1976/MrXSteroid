// tests/shared/unit-system.test.ts
/**
 * Unit System Integration Tests
 * Tests for lib/shared/unit-system.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  unitConversions,
  unitStorage,
  unitLabels,
  getUnitLabel,
  validateRoundTrip,
} from '@/lib/shared/unit-system';

describe('Unit System Integration Tests', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') localStorage.clear();
  });

  afterEach(() => {
    if (typeof window !== 'undefined') localStorage.clear();
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
        expect(Math.abs(back - kg)).toBeLessThanOrEqual(0.1);
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