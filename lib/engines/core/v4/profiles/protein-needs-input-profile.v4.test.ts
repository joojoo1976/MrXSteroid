/**
 * lib/engines/core/v4/profiles/protein-needs-input-profile.v4.test.ts
 *
 * R5 first batch, Tool 2: additive input profile for weightKg, goal,
 * activityLevel. Metadata only; it calculates and persists nothing.
 */

import { describe, expect, it } from 'vitest';
import {
  PROTEIN_NEEDS_INPUT_FIELD_PROFILE,
  PROTEIN_NEEDS_REQUIRED_FIELDS,
  countProvidedProteinNeedsFields,
} from './protein-needs-input-profile.v4';

describe('protein needs input profile', () => {
  it('declares exactly the three required fields', () => {
    expect(PROTEIN_NEEDS_REQUIRED_FIELDS).toEqual(['weightKg', 'goal', 'activityLevel']);
    expect(PROTEIN_NEEDS_INPUT_FIELD_PROFILE.map((field) => field.fieldId)).toEqual([
      'weightKg',
      'goal',
      'activityLevel',
    ]);
  });

  it('declares canonical kg unit, goal enum and activity bounds', () => {
    const weight = PROTEIN_NEEDS_INPUT_FIELD_PROFILE.find((f) => f.fieldId === 'weightKg');
    const goal = PROTEIN_NEEDS_INPUT_FIELD_PROFILE.find((f) => f.fieldId === 'goal');
    const activity = PROTEIN_NEEDS_INPUT_FIELD_PROFILE.find((f) => f.fieldId === 'activityLevel');

    expect(weight?.canonicalUnit).toBe('kg');
    expect(weight?.constraints).toEqual({ min: 30, max: 300 });
    expect(goal?.constraints?.enumValues).toEqual(['maintain', 'bulk', 'cut']);
    expect(activity?.constraints).toEqual({ min: 1, max: 1.4 });
    for (const field of PROTEIN_NEEDS_INPUT_FIELD_PROFILE) {
      expect(field.required).toBe(true);
      expect(field.sensitivityClass).toBe('personal');
      expect(field.provenance).toBe('USER_ENTERED');
      expect(field.fieldState).toBe('MISSING');
    }
  });

  it('counts provided values via the provided progress helper', () => {
    expect(countProvidedProteinNeedsFields({})).toEqual({
      provided: 0,
      required: 3,
      missing: ['weightKg', 'goal', 'activityLevel'],
    });
    expect(countProvidedProteinNeedsFields({ goal: 'maintain', activityLevel: 1.2 })).toEqual({
      provided: 2,
      required: 3,
      missing: ['weightKg'],
    });
    expect(
      countProvidedProteinNeedsFields({ weightKg: 70, goal: 'maintain', activityLevel: 1.2 })
    ).toEqual({ provided: 3, required: 3, missing: [] });
  });
});
