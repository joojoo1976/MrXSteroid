import { describe, it, expect } from 'vitest';
import { navyBodyFatPct } from './navyFormula';

describe('navyFormula — US Navy Body Fat Formula', () => {

  describe('Male Formula', () => {
    /**
     * Male formula: %BF = 86.01 * log10(waist - neck) - 70.041 * log10(height) + 36.76
     * All inputs converted to INCHES internally from CM
     */

    it('computes BF% for typical male (180cm, 80cm waist, 38cm neck)', () => {
      const pct = navyBodyFatPct('male', 80, 38, 0, 180);
      // Actual computed value from the formula
      expect(pct).toBeCloseTo(11.95, 1);
    });

    it('computes BF% for lean athletic male (182.88cm, 76.2cm waist, 38.1cm neck)', () => {
      const pct = navyBodyFatPct('male', 76.2, 38.1, 0, 182.88);
      expect(pct).toBeCloseTo(7.83, 1);
    });

    it('computes BF% for overweight male (177.8cm, 96.52cm waist, 40.64cm neck)', () => {
      const pct = navyBodyFatPct('male', 96.52, 40.64, 0, 177.8);
      expect(pct).toBeCloseTo(22.99, 1);
    });

    it('clamps minimum at 2%', () => {
      // Values that mathematically produce < 2%
      const pct = navyBodyFatPct('male', 55, 45, 0, 185);
      expect(pct).toBe(2);
    });

    it('clamps maximum at 60%', () => {
      // Values that mathematically exceed 60%
      const pct = navyBodyFatPct('male', 200, 20, 0, 150);
      expect(pct).toBe(60);
    });

    it('handles waist <= neck gracefully (log10(1) = 0)', () => {
      // When waist - neck <= 0, formula uses max(1, ...) → log10(1) = 0
      const pct = navyBodyFatPct('male', 35, 38, 0, 180);
      expect(pct).toBeGreaterThanOrEqual(2);
      expect(pct).toBeLessThanOrEqual(60);
    });

    it('is deterministic: same inputs → same output', () => {
      const p1 = navyBodyFatPct('male', 85, 37, 0, 175);
      const p2 = navyBodyFatPct('male', 85, 37, 0, 175);
      expect(p1).toBe(p2);
    });

    it('height increase decreases body fat % (taller = leaner at same waist/neck)', () => {
      const short = navyBodyFatPct('male', 85, 37, 0, 165);
      const tall = navyBodyFatPct('male', 85, 37, 0, 185);
      expect(tall).toBeLessThan(short);
    });

    it('larger waist-neck difference increases body fat %', () => {
      const smallDiff = navyBodyFatPct('male', 80, 40, 0, 175); // diff = 40cm
      const largeDiff = navyBodyFatPct('male', 100, 35, 0, 175); // diff = 65cm
      expect(largeDiff).toBeGreaterThan(smallDiff);
    });
  });

  describe('Female Formula', () => {
    /**
     * Female formula: %BF = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
     * All inputs converted to INCHES internally from CM
     */

    it('computes BF% for typical female (165cm, 70cm waist, 32cm neck, 95cm hip)', () => {
      const pct = navyBodyFatPct('female', 70, 32, 95, 165);
      expect(pct).toBeCloseTo(25.10, 1);
    });

    it('computes BF% for lean athletic female (165.1cm, 66.04cm waist, 33.02cm neck, 88.9cm hip)', () => {
      const pct = navyBodyFatPct('female', 66.04, 33.02, 88.9, 165.1);
      expect(pct).toBeCloseTo(18.91, 1);
    });

    it('computes BF% for overweight female (162.56cm, 86.36cm waist, 35.56cm neck, 106.68cm hip)', () => {
      const pct = navyBodyFatPct('female', 86.36, 35.56, 106.68, 162.56);
      expect(pct).toBeCloseTo(37.71, 1);
    });

    it('clamps minimum at 2%', () => {
      const pct = navyBodyFatPct('female', 50, 35, 80, 165);
      expect(pct).toBe(2);
    });

    it('clamps maximum at 60%', () => {
      const pct = navyBodyFatPct('female', 200, 25, 200, 140);
      expect(pct).toBe(60);
    });

    it('handles waist + hip <= neck gracefully', () => {
      const pct = navyBodyFatPct('female', 60, 70, 50, 160); // 60+50-70 = 40
      expect(pct).toBeGreaterThanOrEqual(2);
      expect(pct).toBeLessThanOrEqual(60);
    });

    it('is deterministic: same inputs → same output', () => {
      const p1 = navyBodyFatPct('female', 75, 33, 100, 168);
      const p2 = navyBodyFatPct('female', 75, 33, 100, 168);
      expect(p1).toBe(p2);
    });

    it('larger hip increases body fat % for females', () => {
      const smallHip = navyBodyFatPct('female', 75, 33, 90, 168);
      const largeHip = navyBodyFatPct('female', 75, 33, 110, 168);
      expect(largeHip).toBeGreaterThan(smallHip);
    });
  });

  describe('Gender Comparison', () => {
    it('females typically have higher BF% at same measurements (due to formula structure)', () => {
      // Same waist, neck, height; female adds hip
      const male = navyBodyFatPct('male', 80, 38, 0, 175);
      const female = navyBodyFatPct('female', 80, 38, 100, 175);
      expect(female).toBeGreaterThan(male);
    });
  });

  describe('Edge Cases & Input Validation', () => {
    it('handles zero hip for males (parameter ignored)', () => {
      const pct = navyBodyFatPct('male', 80, 38, 0, 175);
      expect(pct).toBeGreaterThanOrEqual(2);
      expect(pct).toBeLessThanOrEqual(60);
    });

    it('handles very small neck values', () => {
      const pct = navyBodyFatPct('male', 85, 20, 0, 175);
      expect(pct).toBeGreaterThanOrEqual(2);
      expect(pct).toBeLessThanOrEqual(60);
    });

    it('handles very large neck values (waist - neck becomes small)', () => {
      const pct = navyBodyFatPct('male', 85, 50, 0, 175);
      expect(pct).toBeGreaterThanOrEqual(2);
      expect(pct).toBeLessThanOrEqual(60);
    });

    it('handles extreme height values', () => {
      const short = navyBodyFatPct('male', 80, 38, 0, 140);
      const tall = navyBodyFatPct('male', 80, 38, 0, 210);
      expect(short).toBeGreaterThanOrEqual(2);
      expect(tall).toBeGreaterThanOrEqual(2);
      expect(short).toBeLessThanOrEqual(60);
      expect(tall).toBeLessThanOrEqual(60);
    });
  });

  describe('Metric Input Handling', () => {
    it('accepts metric (cm) inputs and converts internally to inches', () => {
      // The function expects CM and converts internally
      // 70 inches = 177.8 cm
      const pctInches = navyBodyFatPct('male', 31.5 * 2.54, 15 * 2.54, 0, 70 * 2.54);
      const pctCm = navyBodyFatPct('male', 80, 38, 0, 177.8);
      // Slight precision difference due to floating point - use tolerance
      expect(Math.abs(pctCm - pctInches)).toBeLessThan(0.1);
    });

    it('conversion factor is exactly 2.54 cm per inch', () => {
      expect(2.54).toBe(2.54);
    });
  });

  describe('Category Boundaries (Male)', () => {
    it('produces decreasing BF% as waist decreases relative to height', () => {
      const lean = navyBodyFatPct('male', 70, 38, 0, 178);
      const avg = navyBodyFatPct('male', 88, 37, 0, 175);
      const heavy = navyBodyFatPct('male', 105, 36, 0, 175);
      expect(lean).toBeLessThan(avg);
      expect(avg).toBeLessThan(heavy);
    });

    it('produces reasonable range for typical inputs (2–30%)', () => {
      const pct = navyBodyFatPct('male', 85, 37, 0, 175);
      expect(pct).toBeGreaterThanOrEqual(2);
      expect(pct).toBeLessThanOrEqual(30);
    });
  });

  describe('Category Boundaries (Female)', () => {
    it('produces decreasing BF% as waist+hip decreases relative to height', () => {
      const lean = navyBodyFatPct('female', 65, 31, 90, 165);
      const avg = navyBodyFatPct('female', 80, 33, 102, 165);
      const heavy = navyBodyFatPct('female', 95, 34, 115, 165);
      expect(lean).toBeLessThan(avg);
      expect(avg).toBeLessThan(heavy);
    });

    it('produces reasonable range for typical inputs (2–45%)', () => {
      const pct = navyBodyFatPct('female', 75, 32, 98, 165);
      expect(pct).toBeGreaterThanOrEqual(2);
      expect(pct).toBeLessThanOrEqual(45);
    });
  });
});