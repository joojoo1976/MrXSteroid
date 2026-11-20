/**
 * lib/engines/core/v4/profiles/water-intake-input-profile.v4.test.ts
 *
 * R5 first batch, Tool 3: additive input profile for weightKg and
 * activityLevel. Metadata only; calculates and persists nothing.
 */

import { describe, expect, it } from 'vitest';
import {
  WATER_INTAKE_INPUT_FIELD_PROFILE,
  WATER_INTAKE_REQUIRED_FIELDS,
  countProvidedWaterIntakeFields,
} from './water-intake-input-profile.v4';

describe('water intake input profile', () => {
  it('declares exactly the two required fields', () => {
    expect(WATER_INTAKE_REQUIRED_FIELDS).toEqual(['weightKg', 'activityLevel']);
    expect(WATER_INTAKE_INPUT_FIELD_PROFILE.map((field) => field.fieldId)).toEqual([
      'weightKg',
      'activityLevel',
    ]);
  });

  it('declares canonical kg unit, activity bounds and personal sensitivity', () => {
    const weight = WATER_INTAKE_INPUT_FIELD_PROFILE.find((f) => f.fieldId === 'weightKg');
    const activity = WATER_INTAKE_INPUT_FIELD_PROFILE.find((f) => f.fieldId === 'activityLevel');

    expect(weight?.canonicalUnit).toBe('kg');
    expect(weight?.constraints).toEqual({ min: 30, max: 300 });
    expect(activity?.constraints).toEqual({ min: 1, max: 1.4 });
    for (const field of WATER_INTAKE_INPUT_FIELD_PROFILE) {
      expect(field.required).toBe(true);
      expect(field.sensitivityClass).toBe('personal');
      expect(field.provenance).toBe('USER_ENTERED');
      expect(field.fieldState).toBe('MISSING');
    }
  });

  it('counts provided values', () => {
    expect(countProvidedWaterIntakeFields({})).toEqual({
      provided: 0,
      required: 2,
      missing: ['weightKg', 'activityLevel'],
    });
    expect(countProvidedWaterIntakeFields({ activityLevel: 1.2 })).toEqual({
      provided: 1,
      required: 2,
      missing: ['weightKg'],
    });
    expect(countProvidedWaterIntakeFields({ weightKg: 70, activityLevel: 1.2 })).toEqual({
      provided: 2,
      required: 2,
      missing: [],
    });
  });
});
