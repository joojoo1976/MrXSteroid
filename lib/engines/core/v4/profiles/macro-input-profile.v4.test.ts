/**
 * lib/engines/core/v4/profiles/macro-input-profile.v4.test.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  M4-IN-01 — Versioned Macro Input Field Profile (contract evidence only)
 * ═══════════════════════════════════════════════════════════════════════════════
 *  These tests bind the standalone profile to:
 *    - the accepted `FieldDefinition` shape and runtime validators;
 *    - the existing Macro V6 input schema bounds/enums;
 *    - the explicit semantic distinction between static profile metadata and
 *      values actually submitted at runtime.
 *
 *  No runtime wiring, no engine call, no UI, no persistence.
 */
import { describe, expect, it } from 'vitest';

import { MacroInputV6Schema } from '@/lib/tools/schemas/macro.v6';
import type { FieldDefinition } from '../contracts.v4';
import { validateFieldDefinition, validateFieldValue } from '../runtime.v4';
import {
  MACRO_INPUT_FIELD_PROFILE,
  MACRO_INPUT_PROFILE_VERSION,
} from './macro-input-profile.v4';

const EXPECTED_FIELD_IDS = [
  'age',
  'sex',
  'heightCm',
  'weightKg',
  'activityLevel',
  'phase',
] as const;

const BASE_INPUT = {
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 80,
  activityLevel: 1.55,
  phase: 'maintenance',
} as const;

interface ExpectedField {
  dataType: FieldDefinition['dataType'];
  unit?: string;
  canonicalUnit?: string;
  constraints: Record<string, unknown>;
}

const EXPECTED_FIELDS: Record<(typeof EXPECTED_FIELD_IDS)[number], ExpectedField> = {
  age: {
    dataType: 'integer',
    unit: 'years',
    canonicalUnit: 'years',
    constraints: { min: 19, max: 100 },
  },
  sex: {
    dataType: 'enum',
    constraints: { enumValues: ['male', 'female'] },
  },
  heightCm: {
    dataType: 'number',
    unit: 'cm',
    canonicalUnit: 'cm',
    constraints: { min: 100, max: 250 },
  },
  weightKg: {
    dataType: 'number',
    unit: 'kg',
    canonicalUnit: 'kg',
    constraints: { min: 30, max: 300 },
  },
  activityLevel: {
    dataType: 'number',
    unit: 'factor',
    canonicalUnit: 'factor',
    constraints: { min: 1.2, max: 1.9 },
  },
  phase: {
    dataType: 'enum',
    constraints: { enumValues: ['bulk', 'cut', 'maintenance'] },
  },
};

const NUMERIC_BOUNDARIES = [
  { fieldId: 'age', accepted: [19, 100], rejected: [18, 101] },
  { fieldId: 'heightCm', accepted: [100, 250], rejected: [99.9, 250.1] },
  { fieldId: 'weightKg', accepted: [30, 300], rejected: [29.9, 300.1] },
  { fieldId: 'activityLevel', accepted: [1.2, 1.9], rejected: [1.19, 1.91] },
] as const;

const ENUM_BOUNDARIES = [
  { fieldId: 'sex', accepted: ['male', 'female'], rejected: ['other', 'unknown'] },
  { fieldId: 'phase', accepted: ['bulk', 'cut', 'maintenance'], rejected: ['recomp', 'maintain'] },
] as const;

function getField(fieldId: string): FieldDefinition {
  const field = MACRO_INPUT_FIELD_PROFILE.find((candidate) => candidate.fieldId === fieldId);
  if (!field) {
    throw new Error(`Missing authorized Macro input field: ${fieldId}`);
  }
  return field;
}

function expectValid(field: FieldDefinition, value: unknown): void {
  const result = validateFieldValue(field, value);
  expect(result.errors, `${field.fieldId} should accept ${String(value)}`).toEqual([]);
  expect(result.state, `${field.fieldId}=${String(value)} should be VALID`).toBe('VALID');
}

function expectInvalid(field: FieldDefinition, value: unknown): void {
  const result = validateFieldValue(field, value);
  expect(
    result.errors.length,
    `${field.fieldId} should reject ${String(value)}`,
  ).toBeGreaterThan(0);
  expect(result.state, `${field.fieldId}=${String(value)} should not be VALID`).not.toBe('VALID');
}

describe('M4-IN-01 — Macro input field profile', () => {
  it('exposes a semver profile version', () => {
    expect(MACRO_INPUT_PROFILE_VERSION).toBe('1.0.0');
    expect(MACRO_INPUT_PROFILE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('defines exactly the six approved required fields in order', () => {
    expect(MACRO_INPUT_FIELD_PROFILE.map((field) => field.fieldId)).toEqual([
      ...EXPECTED_FIELD_IDS,
    ]);
    expect(new Set(MACRO_INPUT_FIELD_PROFILE.map((field) => field.fieldId)).size).toBe(6);
    expect(MACRO_INPUT_FIELD_PROFILE.every((field) => field.required)).toBe(true);
  });

  it('passes accepted FieldDefinition validation for every field', () => {
    for (const field of MACRO_INPUT_FIELD_PROFILE) {
      const result = validateFieldDefinition(field);
      expect(
        result.valid,
        `${field.fieldId}: ${JSON.stringify(result.errors)}`,
      ).toBe(true);
    }
  });

  it('declares the approved type, unit, bounds, enum, and label metadata', () => {
    for (const fieldId of EXPECTED_FIELD_IDS) {
      const field = getField(fieldId);
      const expected = EXPECTED_FIELDS[fieldId];

      expect(field.labelKey, `${fieldId} labelKey`).toBe(`macro.input.${fieldId}`);
      expect(field.dataType, `${fieldId} dataType`).toBe(expected.dataType);
      expect(field.unit, `${fieldId} unit`).toBe(expected.unit);
      expect(field.canonicalUnit, `${fieldId} canonicalUnit`).toBe(expected.canonicalUnit);
      expect(field.constraints, `${fieldId} constraints`).toEqual(expected.constraints);
    }
  });

  it('marks every field personal and user-entered with a static missing state', () => {
    for (const field of MACRO_INPUT_FIELD_PROFILE) {
      expect(field.sensitivityClass, `${field.fieldId} sensitivityClass`).toBe('personal');
      expect(field.provenance, `${field.fieldId} provenance`).toBe('USER_ENTERED');
      expect(field.fieldState, `${field.fieldId} fieldState`).toBe('MISSING');
    }
  });

  it('does not claim observation, consent, freshness, or normalization evidence', () => {
    for (const field of MACRO_INPUT_FIELD_PROFILE) {
      expect(field.observedAt, `${field.fieldId} observedAt`).toBeUndefined();
      expect(field.recordedAt, `${field.fieldId} recordedAt`).toBeUndefined();
      expect(field.freshnessPolicyId, `${field.fieldId} freshnessPolicyId`).toBeUndefined();
      expect(field.consentScope, `${field.fieldId} consentScope`).toBeUndefined();
      expect(field.normalizationVersion, `${field.fieldId} normalizationVersion`).toBeUndefined();
    }
  });

  it('computes MISSING for absent values instead of trusting static fieldState', () => {
    for (const field of MACRO_INPUT_FIELD_PROFILE) {
      const result = validateFieldValue(field, undefined);
      expect(result.state, `${field.fieldId} absent state`).toBe('MISSING');
      expect(result.errors, `${field.fieldId} absent errors`).toContain(
        `${field.fieldId} is required`,
      );
    }
  });

  it('computes VALID for supplied values without treating static metadata as submission evidence', () => {
    const submitted = {
      age: 30,
      sex: 'male',
      heightCm: 175,
      weightKg: 80,
      activityLevel: 1.55,
      phase: 'cut',
    } as const;

    for (const fieldId of EXPECTED_FIELD_IDS) {
      const field = getField(fieldId);
      expect(field.fieldState, `${fieldId} static declaration`).toBe('MISSING');
      expectValid(field, submitted[fieldId]);
    }
  });

  it('accepts numeric boundary values and rejects values just outside the range', () => {
    for (const { fieldId, accepted, rejected } of NUMERIC_BOUNDARIES) {
      const field = getField(fieldId);
      for (const value of accepted) {
        expectValid(field, value);
      }
      for (const value of rejected) {
        expectInvalid(field, value);
      }
    }
  });

  it('accepts only the approved enum values', () => {
    for (const { fieldId, accepted, rejected } of ENUM_BOUNDARIES) {
      const field = getField(fieldId);
      for (const value of accepted) {
        expectValid(field, value);
      }
      for (const value of rejected) {
        expectInvalid(field, value);
      }
    }
  });

  it('rejects non-integer age and non-finite numeric values', () => {
    const age = getField('age');
    const height = getField('heightCm');
    const weight = getField('weightKg');
    const activity = getField('activityLevel');

    expectInvalid(age, 30.5);
    expectInvalid(age, Number.NaN);
    expectInvalid(age, Number.POSITIVE_INFINITY);
    expectInvalid(height, Number.NaN);
    expectInvalid(weight, Number.POSITIVE_INFINITY);
    expectInvalid(activity, Number.NaN);
    expectInvalid(height, '175');
  });

  it('matches Macro V6 schema bounds and enums at accepted and rejected boundaries', () => {
    for (const { fieldId, accepted, rejected } of NUMERIC_BOUNDARIES) {
      for (const value of accepted) {
        const parsed = MacroInputV6Schema.safeParse({ ...BASE_INPUT, [fieldId]: value });
        expect(parsed.success, `Macro V6 should accept ${fieldId}=${String(value)}`).toBe(true);
      }
      for (const value of rejected) {
        const parsed = MacroInputV6Schema.safeParse({ ...BASE_INPUT, [fieldId]: value });
        expect(parsed.success, `Macro V6 should reject ${fieldId}=${String(value)}`).toBe(false);
      }
    }

    for (const { fieldId, accepted, rejected } of ENUM_BOUNDARIES) {
      for (const value of accepted) {
        const parsed = MacroInputV6Schema.safeParse({ ...BASE_INPUT, [fieldId]: value });
        expect(parsed.success, `Macro V6 should accept ${fieldId}=${String(value)}`).toBe(true);
      }
      for (const value of rejected) {
        const parsed = MacroInputV6Schema.safeParse({ ...BASE_INPUT, [fieldId]: value });
        expect(parsed.success, `Macro V6 should reject ${fieldId}=${String(value)}`).toBe(false);
      }
    }
  });

  it('contains no prohibited runtime, AI, privacy, or persistence keys', () => {
    const allowedFieldKeys = new Set([
      'fieldId',
      'labelKey',
      'dataType',
      'required',
      'unit',
      'canonicalUnit',
      'constraints',
      'fieldState',
      'provenance',
      'sensitivityClass',
    ]);
    const allowedConstraintKeys = new Set(['min', 'max', 'enumValues']);

    for (const field of MACRO_INPUT_FIELD_PROFILE) {
      for (const key of Object.keys(field)) {
        expect(allowedFieldKeys.has(key), `${field.fieldId} unexpected key: ${key}`).toBe(true);
      }
      for (const key of Object.keys(field.constraints ?? {})) {
        expect(
          allowedConstraintKeys.has(key),
          `${field.fieldId} unexpected constraint key: ${key}`,
        ).toBe(true);
      }
    }
  });
});
