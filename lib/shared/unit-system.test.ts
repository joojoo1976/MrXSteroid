// lib/shared/unit-system.test.ts
// Slice B — Centralized Units and Conversion (G-R6.1-1).
// Verifies the shared unit conversion foundation in lib/shared/unit-system.ts:
//   - valid conversions (kg<->lbs, mg<->oz)
//   - round-trip behaviour within documented precision
//   - incompatible dimensions are NOT offered (supported set is fixed at 4)
//   - unsupported/invalid unit input is rejected by the type-safe named API
//   - boundary / precision cases (non-finite inputs clamped to 0)
// No new conversion categories are added (no artificial coverage expansion).
import { describe, it, expect } from 'vitest';
import {
  unitConversions,
  UNIT_CONSTANTS,
  PRECISION,
  validateRoundTrip,
  unitLabels,
  getUnitLabel,
  type UnitSystem,
} from './unit-system';

const SYSTEMS: UnitSystem[] = ['metric', 'imperial'];

describe('Slice B — valid conversions', () => {
  it('kgToLbs converts kilograms to pounds (rounded to integer)', () => {
    expect(unitConversions.kgToLbs(1)).toBe(2); // Math.round(2.20462)
    expect(unitConversions.kgToLbs(10)).toBe(22); // Math.round(22.0462)
    expect(unitConversions.kgToLbs(85)).toBe(187); // Math.round(187.3927)
  });

  it('lbsToKg converts pounds to kilograms (1 decimal place)', () => {
    expect(unitConversions.lbsToKg(2.20462)).toBe(1);
    expect(unitConversions.lbsToKg(22)).toBe(10);
    expect(unitConversions.lbsToKg(187)).toBe(84.8); // Math.round((187/2.20462)*10)/10
  });

  it('mgToOz converts milligrams to ounces (6 decimal places)', () => {
    expect(unitConversions.mgToOz(28349.523125)).toBe(1);
    expect(unitConversions.mgToOz(1000)).toBeCloseTo(0.035274, 6);
  });

  it('ozToMg converts ounces to milligrams (1 decimal place)', () => {
    expect(unitConversions.ozToMg(1)).toBe(28349.5);
    expect(unitConversions.ozToMg(0.035274)).toBeCloseTo(1000, 0);
  });
});

describe('Slice B — round-trip conversion within documented precision', () => {
  it('mg -> oz -> mg round-trips within 0.5 mg', () => {
    for (const mg of [1, 10, 100, 300, 500, 1000, 2000]) {
      const back = unitConversions.ozToMg(unitConversions.mgToOz(mg));
      expect(Math.abs(back - mg)).toBeLessThanOrEqual(0.5);
    }
  });

  it('kg -> lbs -> kg round-trips within 0.3 kg (kgToLbs rounds to integer lbs by design)', () => {
    for (const kg of [1, 10, 50, 85, 100, 150]) {
      const back = unitConversions.lbsToKg(unitConversions.kgToLbs(kg));
      expect(Math.abs(back - kg)).toBeLessThanOrEqual(0.3);
    }
  });

  it('validateRoundTrip reports the shared foundation as consistent', () => {
    expect(validateRoundTrip()).toBe(true);
  });
});

describe('Slice B — boundary and precision cases', () => {
  it('non-finite inputs are clamped to 0 (safety net, never NaN/Infinity downstream)', () => {
    expect(unitConversions.kgToLbs(Number.NaN)).toBe(0);
    expect(unitConversions.kgToLbs(Infinity)).toBe(0);
    expect(unitConversions.kgToLbs(-Infinity)).toBe(0);
    expect(unitConversions.lbsToKg(Number.NaN)).toBe(0);
    expect(unitConversions.mgToOz(Infinity)).toBe(0);
    expect(unitConversions.ozToMg(-Infinity)).toBe(0);
  });

  it('finite negative inputs pass through clampFinite (only non-finite is clamped)', () => {
    // -5 kg -> Math.round(-5 * 2.20462) = Math.round(-11.0231) = -11
    expect(unitConversions.kgToLbs(-5)).toBe(-11);
  });

  it('precision constants are defined and consistent with the constants', () => {
    expect(PRECISION.KG_TO_LBS_DP).toBe(0);
    expect(PRECISION.LBS_TO_KG_DP).toBe(1);
    expect(PRECISION.MG_TO_OZ_DP).toBe(6);
    expect(PRECISION.OZ_TO_MG_DP).toBe(1);
    expect(UNIT_CONSTANTS.KG_TO_LBS).toBe(2.20462);
    expect(UNIT_CONSTANTS.MG_PER_OZ).toBe(28349.523125);
  });
});

describe('Slice B — supported conversion surface (incompatible dimensions not offered)', () => {
  it('exposes exactly the four same-dimension conversions, no silent expansion', () => {
    expect(Object.keys(unitConversions)).toEqual([
      'kgToLbs',
      'lbsToKg',
      'mgToOz',
      'ozToMg',
    ]);
  });

  it('each conversion is a function', () => {
    expect(typeof unitConversions.kgToLbs).toBe('function');
    expect(typeof unitConversions.lbsToKg).toBe('function');
    expect(typeof unitConversions.mgToOz).toBe('function');
    expect(typeof unitConversions.ozToMg).toBe('function');
  });
});

describe('Slice B — unit metadata (bilingual labels)', () => {
  it('provides bilingual unit labels for both unit systems', () => {
    for (const system of SYSTEMS) {
      // `en`/`ar` at the system level ARE the system labels (see getUnitLabel).
      expect(typeof unitLabels[system].en).toBe('string');
      expect(typeof unitLabels[system].ar).toBe('string');
      expect(typeof unitLabels[system].weight.en).toBe('string');
      expect(typeof unitLabels[system].weight.ar).toBe('string');
      expect(typeof unitLabels[system].dose.en).toBe('string');
      expect(typeof unitLabels[system].height.en).toBe('string');
    }
  });

  it('getUnitLabel returns the label for the requested system, category and locale', () => {
    expect(getUnitLabel('metric', 'weight', 'en')).toBe('kg');
    expect(getUnitLabel('metric', 'weight', 'ar')).toBe('كغ');
    expect(getUnitLabel('imperial', 'weight', 'en')).toBe('lbs');
    expect(getUnitLabel('imperial', 'weight', 'ar')).toBe('رطل');
  });
});
