/**
 * lib/engines/core/v4/profiles/bmi-input-profile.v4.test.ts
 *
 * R5 first batch, Tool 1: additive input profile for the two required inputs
 * (weightKg, heightCm). Macro/V6 remains the numeric authority; this profile
 * is metadata only and is not wired into any runtime outside the pilot.
 */

import { describe, expect, it } from 'vitest';
import {
  BMI_INPUT_FIELD_PROFILE,
  BMI_REQUIRED_FIELDS,
  countProvidedBmiFields,
} from './bmi-input-profile.v4';

describe('BMI input profile', () => {
  it('declares exactly the two required fields with canonical kg/cm units', () => {
    expect(BMI_REQUIRED_FIELDS).toEqual(['weightKg', 'heightCm']);
    expect(BMI_INPUT_FIELD_PROFILE.map((field) => field.fieldId)).toEqual([
      'weightKg',
      'heightCm',
    ]);
    const weight = BMI_INPUT_FIELD_PROFILE.find((field) => field.fieldId === 'weightKg');
    const height = BMI_INPUT_FIELD_PROFILE.find((field) => field.fieldId === 'heightCm');
    expect(weight?.canonicalUnit).toBe('kg');
    expect(weight?.constraints).toEqual({ min: 30, max: 300 });
    expect(height?.canonicalUnit).toBe('cm');
    expect(height?.constraints).toEqual({ min: 100, max: 250 });
    expect(weight?.sensitivityClass).toBe('personal');
    expect(height?.sensitivityClass).toBe('personal');
  });

  it('declares required status, USER_ENTERED provenance and personal sensitivity', () => {
    for (const field of BMI_INPUT_FIELD_PROFILE) {
      expect(field.required).toBe(true);
      expect(field.provenance).toBe('USER_ENTERED');
      expect(field.sensitivityClass).toBe('personal');
      expect(field.fieldState).toBe('MISSING');
    }
  });

  it('counts only provided values', () => {
    expect(countProvidedBmiFields({ weightKg: 75, heightCm: 175 })).toEqual({
      provided: 2,
      required: 2,
      missing: [],
    });
    expect(countProvidedBmiFields({ weightKg: 75 })).toEqual({
      provided: 1,
      required: 2,
      missing: ['heightCm'],
    });
    expect(countProvidedBmiFields({})).toEqual({
      provided: 0,
      required: 2,
      missing: ['weightKg', 'heightCm'],
    });
  });
});
