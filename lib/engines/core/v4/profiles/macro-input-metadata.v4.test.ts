/**
 * lib/engines/core/v4/profiles/macro-input-metadata.v4.test.ts
 *
 * Batch A coverage for the additive Macro V4 input metadata profile:
 * unit metadata/normalization, provenance policy, timestamp semantics,
 * sensitivity/consent/freshness metadata, and completeness/validation
 * integration. No adapter, engine, runtime, UI or persistence is exercised
 * beyond the accepted read-only profile inputs.
 */

import { describe, expect, it } from 'vitest';
import {
  CM_PER_IN,
  KG_PER_LB,
  MACRO_INPUT_GOVERNANCE,
  MACRO_INPUT_UNIT_METADATA,
  MACRO_PROVENANCE_POLICY,
  MACRO_TIMESTAMP_POLICY,
  assessMacroInputCompletenessV4,
  getMacroMissingFields,
  getMacroProvidedFields,
  macroToCanonicalValue,
  macroToDisplayValue,
  validateMacroInputField,
} from './macro-input-metadata.v4';
import { MACRO_INPUT_FIELD_PROFILE } from './macro-input-profile.v4';
import {
  adaptMacroV6ToV4,
  adaptMacroV6UnavailableToV4,
} from '../adapter.macro.v4';
import { calculateMacrosV6, type MacroInputV6 } from '@/lib/tools/engines/macro.v6';

const VALID_INPUT: MacroInputV6 = {
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 75,
  activityLevel: 1.55,
  phase: 'maintenance',
};

const CREATED_AT = '2026-11-05T12:00:00.000Z';

const FIELD_IDS = ['age', 'sex', 'heightCm', 'weightKg', 'activityLevel', 'phase'] as const;

describe('M4-IN-02 unit metadata and conversion boundary', () => {
  it('publishes unit metadata for exactly the six M4-IN-01 fields', () => {
    expect(MACRO_INPUT_UNIT_METADATA.map((entry) => entry.fieldId)).toEqual([...FIELD_IDS]);
    expect(MACRO_INPUT_UNIT_METADATA.map((entry) => entry.fieldId)).toEqual(
      MACRO_INPUT_FIELD_PROFILE.map((field) => field.fieldId)
    );
  });

  it('keeps engine canonical units as kg/cm and never changes canonical math', () => {
    const weight = MACRO_INPUT_UNIT_METADATA.find((entry) => entry.fieldId === 'weightKg');
    const height = MACRO_INPUT_UNIT_METADATA.find((entry) => entry.fieldId === 'heightCm');
    const age = MACRO_INPUT_UNIT_METADATA.find((entry) => entry.fieldId === 'age');

    expect(weight?.canonicalUnit).toBe('kg');
    expect(weight?.displayUnits).toEqual(['kg', 'lb']);
    expect(height?.canonicalUnit).toBe('cm');
    expect(height?.displayUnits).toEqual(['cm', 'in']);
    expect(age?.canonicalUnit).toBe('years');
    expect(age?.displayUnits).toEqual(['years']);
  });

  it('converts imperially exactly before display rounding and never double converts', () => {
    expect(macroToCanonicalValue('weightKg', 75 / KG_PER_LB, 'imperial')).toBeCloseTo(75, 9);
    expect(macroToCanonicalValue('heightCm', 175 / CM_PER_IN, 'imperial')).toBeCloseTo(175, 9);

    // The display value is rounded to one decimal, so a display round-trip is
    // bounded by half of that displayed precision (0.05 kg / 0.05 in).
    const weightLb = macroToDisplayValue('weightKg', 75, 'imperial');
    const heightIn = macroToDisplayValue('heightCm', 175, 'imperial');
    expect(Math.abs(macroToCanonicalValue('weightKg', Number(weightLb), 'imperial') - 75)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(macroToCanonicalValue('heightCm', Number(heightIn), 'imperial') - 175)).toBeLessThanOrEqual(0.05);
    expect(KG_PER_LB).toBe(0.45359237);
    expect(CM_PER_IN).toBe(2.54);
  });

  it('uses the same one-decimal display rounding as the pilot and does not double convert', () => {
    expect(macroToDisplayValue('weightKg', 75, 'imperial')).toBe(165.3);
    expect(macroToDisplayValue('heightCm', 175, 'imperial')).toBe(68.9);
    expect(macroToDisplayValue('weightKg', 75, 'metric')).toBe(75);
    expect(macroToDisplayValue('age', 30, 'imperial')).toBe(30);
    expect(macroToCanonicalValue('weightKg', 75, 'metric')).toBe(75);
  });
});

describe('M4-IN-03 provenance policy', () => {
  it('declares USER_ENTERED as the only current Macro input source', () => {
    expect(MACRO_PROVENANCE_POLICY.currentSource).toBe('USER_ENTERED');
    expect(MACRO_PROVENANCE_POLICY.allowedSources).toEqual(['USER_ENTERED']);
    expect(MACRO_PROVENANCE_POLICY.forbiddenSources).toEqual([
      'IMPORTED',
      'CROSS_TOOL',
      'ESTIMATED',
      'SYSTEM_DERIVED',
    ]);
  });

  it('does not claim submission evidence for fields with no value', () => {
    expect(MACRO_PROVENANCE_POLICY.missingFieldProvenance).toBeNull();
    expect(MACRO_PROVENANCE_POLICY.impliesSubmission).toBe(false);
  });
});

describe('M4-IN-04 timestamp semantics', () => {
  it('defines recordedAt as envelope-creation time with no observation claim', () => {
    expect(MACRO_TIMESTAMP_POLICY.recordedAt).toBe(
      'ENVELOPE_CREATION_TIME_INJECTED_BY_CALLER'
    );
    expect(MACRO_TIMESTAMP_POLICY.observedAt).toBe(
      'ABSENT_UNLESS_A_REAL_OBSERVATION_EXISTS'
    );
    expect(MACRO_TIMESTAMP_POLICY.impliesPersistence).toBe(false);
    expect(MACRO_TIMESTAMP_POLICY.impliesMeasurement).toBe(false);
  });
});

describe('M4-IN-05 sensitivity, consent and freshness metadata', () => {
  it('classifies all six fields personal with no inferred sensitive traits', () => {
    expect(MACRO_INPUT_GOVERNANCE).toHaveLength(6);
    expect(MACRO_INPUT_GOVERNANCE.map((entry) => entry.fieldId)).toEqual([...FIELD_IDS]);
    expect(MACRO_INPUT_GOVERNANCE.every((entry) => entry.sensitivityClass === 'personal')).toBe(
      true
    );
    expect(
      MACRO_INPUT_GOVERNANCE.every(
        (entry) => entry.sensitivityClass !== 'sensitive' && entry.sensitivityClass !== 'highly_sensitive'
      )
    ).toBe(true);
    expect(
      MACRO_INPUT_GOVERNANCE.every(
        (entry) => entry.inferredTraits === undefined || entry.inferredTraits.length === 0
      )
    ).toBe(true);
  });

  it('does not default consent or freshness before an approved policy exists', () => {
    expect(MACRO_INPUT_GOVERNANCE.every((entry) => entry.consentScope === null)).toBe(true);
    expect(MACRO_INPUT_GOVERNANCE.every((entry) => entry.freshnessPolicyId === null)).toBe(true);
    expect(MACRO_INPUT_GOVERNANCE.every((entry) => entry.retention === 'NONE')).toBe(true);
  });
});

describe('M4-IN-03 per-field provenance (adapter conformance)', () => {
  it('marks every provided field USER_ENTERED and no other source is emitted', async () => {
    const response = await calculateMacrosV6(VALID_INPUT);
    if (!('result' in response)) throw new Error('Expected a complete Macro V6 result.');

    const envelope = adaptMacroV6ToV4(
      VALID_INPUT,
      response.result,
      CREATED_AT,
      response.intelligence.warnings
    );

    expect(envelope.inputSnapshot.provenance).toEqual({
      age: 'USER_ENTERED',
      sex: 'USER_ENTERED',
      heightCm: 'USER_ENTERED',
      weightKg: 'USER_ENTERED',
      activityLevel: 'USER_ENTERED',
      phase: 'USER_ENTERED',
    });
  });

  it('omits provenance for missing fields instead of inventing a source', () => {
    const envelope = adaptMacroV6UnavailableToV4(
      { age: 30, sex: 'male' },
      'partial',
      ['heightCm', 'weightKg', 'activityLevel', 'phase'],
      CREATED_AT
    );

    expect(envelope.inputSnapshot.provenance).toEqual({
      age: 'USER_ENTERED',
      sex: 'USER_ENTERED',
    });
    expect(Object.values(envelope.inputSnapshot.provenance)).not.toContain('IMPORTED');
    expect(Object.values(envelope.inputSnapshot.provenance)).not.toContain('CROSS_TOOL');
    expect(Object.values(envelope.inputSnapshot.provenance)).not.toContain('ESTIMATED');
    expect(Object.values(envelope.inputSnapshot.provenance)).not.toContain('SYSTEM_DERIVED');
  });
});

describe('M4-IN-04 timestamp semantics (adapter conformance)', () => {
  it('sets recordedAt to the injected envelope-creation time and observedAt absent', async () => {
    const response = await calculateMacrosV6(VALID_INPUT);
    if (!('result' in response)) throw new Error('Expected a complete Macro V6 result.');

    const envelope = adaptMacroV6ToV4(
      VALID_INPUT,
      response.result,
      CREATED_AT,
      response.intelligence.warnings
    );

    expect(envelope.inputSnapshot.recordedAt).toBe(CREATED_AT);
    expect(envelope.createdAt).toBe(CREATED_AT);
    expect(envelope.inputSnapshot.observedAt).toBeUndefined();
  });
});

describe('M4-IN-05 completeness and validation integration', () => {
  it('reports all six fields missing for empty input', () => {
    expect(getMacroMissingFields({})).toEqual([...FIELD_IDS]);
    expect(getMacroProvidedFields({})).toEqual([]);
    expect(assessMacroInputCompletenessV4({})).toBe('INSUFFICIENT_FOR_SAFE_RESULT');
  });

  it('reports a partial input without inventing values', () => {
    const values = { age: 30 };
    expect(getMacroMissingFields(values)).toEqual([
      'sex',
      'heightCm',
      'weightKg',
      'activityLevel',
      'phase',
    ]);
    expect(getMacroProvidedFields(values)).toEqual(['age']);
    expect(assessMacroInputCompletenessV4(values)).toBe('INCOMPLETE');
  });

  it('reports a complete input as sufficient for a basic result', () => {
    const values = {
      age: 30,
      sex: 'male',
      heightCm: 175,
      weightKg: 75,
      activityLevel: 1.55,
      phase: 'maintenance',
    } as const;
    expect(getMacroMissingFields(values)).toEqual([]);
    expect(getMacroProvidedFields(values)).toEqual([...FIELD_IDS]);
    expect(assessMacroInputCompletenessV4(values)).toBe('SUFFICIENT_FOR_BASIC_RESULT');
  });

  it('validates a single field against the accepted M4-IN-01 definition', () => {
    expect(validateMacroInputField('age', 30)).toEqual({ state: 'VALID', errors: [] });
    expect(validateMacroInputField('age', 18).state).toBe('INVALID');
    expect(validateMacroInputField('age', undefined).state).toBe('MISSING');
    expect(validateMacroInputField('sex', 'other').state).toBe('INVALID');
    expect(validateMacroInputField('sex', 'female')).toEqual({ state: 'VALID', errors: [] });
    expect(validateMacroInputField('activityLevel', Number.POSITIVE_INFINITY).state).toBe(
      'INVALID'
    );
  });
});
