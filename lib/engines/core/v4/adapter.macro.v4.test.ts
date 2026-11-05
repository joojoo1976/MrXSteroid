/**
 * lib/engines/core/v4/adapter.macro.v4.test.ts
 * V4 Macro Adapter — contract, state-mapping, guard and equivalence tests.
 */

import { describe, it, expect } from 'vitest';
import {
  adaptMacroV6ToV4,
  adaptMacroV6UnavailableToV4,
  adaptMacroV6InvalidToV4,
  assertValidMacroOutput,
  mapMacroStateToV4,
  resolveMacroV4State,
  type MacroV4State,
} from './adapter.macro.v4';
import type {
  MacroInputV6,
  MacroOutputV6,
  SafetyWarningV6,
} from '@/lib/tools/engines/macro.v6';
import { validateToolResultEnvelope } from './runtime.v4';

const CREATED_AT = '2026-11-05T00:00:00.000Z';

const validInput: MacroInputV6 = {
  age: 30,
  sex: 'male',
  heightCm: 180,
  weightKg: 80,
  activityLevel: 1.55,
  phase: 'maintenance',
};

const validOutput: MacroOutputV6 = {
  bmr: 1780,
  tdee: 2759,
  targetCalories: 2759,
  proteinGrams: 176,
  carbsGrams: 323,
  fatGrams: 72,
  phase: 'maintenance',
  macros: {
    protein: { grams: 176, calories: 704, pct: 26 },
    carbs: { grams: 323, calories: 1292, pct: 47 },
    fat: { grams: 72, calories: 648, pct: 27 },
  },
  resultType: 'CALCULATED',
  caloriesPerKg: 34.5,
  proteinPerKg: 2.2,
  fatPerKg: 0.9,
  carbsPerKg: 4,
  weeklyWeightChangeKg: null,
  dietAdherenceScore: null,
  mealTimingSuggestions: [],
  assumptions: ['Mifflin-St Jeor equation used', 'Activity factor 1.55'],
};

describe('Approved Macro → V4 state mapping', () => {
  const cases: Array<[MacroV4State, string, string]> = [
    ['EMPTY', 'NOT_AVAILABLE', 'INSUFFICIENT_FOR_SAFE_RESULT'],
    ['PARTIAL', 'NOT_AVAILABLE', 'INCOMPLETE'],
    ['FULL_VALID', 'VALID', 'SUFFICIENT_FOR_BASIC_RESULT'],
    ['FULL_INVALID', 'INVALID', 'INCOMPLETE'],
    ['FULL_DEGRADED', 'DEGRADED', 'INSUFFICIENT_FOR_SAFE_RESULT'],
  ];

  it.each(cases)('maps %s to %s / %s', (state, status, completeness) => {
    expect(mapMacroStateToV4(state)).toEqual({ status, completeness });
  });

  it('resolves engine completeness and outcome to the extended state', () => {
    expect(resolveMacroV4State('empty')).toBe('EMPTY');
    expect(resolveMacroV4State('partial')).toBe('PARTIAL');
    expect(resolveMacroV4State('full', 'result')).toBe('FULL_VALID');
    expect(resolveMacroV4State('full', 'invalid')).toBe('FULL_INVALID');
    expect(resolveMacroV4State('full', 'degraded')).toBe('FULL_DEGRADED');
  });
});

describe('adaptMacroV6ToV4 — FULL valid', () => {
  it('creates a validated V4 envelope', () => {
    const envelope = adaptMacroV6ToV4(validInput, validOutput, CREATED_AT);
    expect(envelope.contractVersion).toBe('4.0');
    expect(envelope.schemaVersion).toBe('4.0.0');
    expect(envelope.toolId).toBe('mrx.tool.macro');
    expect(envelope.canonicalSlug).toBe('macro');
    expect(envelope.status).toBe('VALID');
    expect(envelope.resultType).toBe('CALCULATED');
    expect(envelope.inputSnapshot.completeness).toBe('SUFFICIENT_FOR_BASIC_RESULT');
    expect(validateToolResultEnvelope(envelope).valid).toBe(true);
  });

  it('passes the engine result through by reference without recalculation', () => {
    const envelope = adaptMacroV6ToV4(validInput, validOutput, CREATED_AT);
    expect(envelope.result).toBe(validOutput);
  });

  it('preserves every numeric output and macro distribution exactly', () => {
    const envelope = adaptMacroV6ToV4(validInput, validOutput, CREATED_AT);
    const result = envelope.result!;

    expect(result.bmr).toBe(validOutput.bmr);
    expect(result.tdee).toBe(validOutput.tdee);
    expect(result.targetCalories).toBe(validOutput.targetCalories);
    expect(result.proteinGrams).toBe(validOutput.proteinGrams);
    expect(result.carbsGrams).toBe(validOutput.carbsGrams);
    expect(result.fatGrams).toBe(validOutput.fatGrams);
    expect(result.caloriesPerKg).toBe(validOutput.caloriesPerKg);
    expect(result.proteinPerKg).toBe(validOutput.proteinPerKg);
    expect(result.fatPerKg).toBe(validOutput.fatPerKg);
    expect(result.carbsPerKg).toBe(validOutput.carbsPerKg);
    expect(result.macros).toEqual(validOutput.macros);
    expect(result.resultType).toBe('CALCULATED');
  });

  it('records provenance, units, evidence and honesty fields', () => {
    const envelope = adaptMacroV6ToV4(validInput, validOutput, CREATED_AT);
    expect(envelope.provenance).toHaveLength(1);
    expect(envelope.provenance[0].source).toBe('user_input');
    expect(envelope.provenance[0].confidence).toBeNull();
    expect(envelope.units).toEqual({
      weight: 'kg',
      height: 'cm',
      calories: 'kcal',
      protein: 'g',
      fat: 'g',
      carbs: 'g',
    });
    expect(envelope.evidence).toHaveLength(1);
    expect(envelope.evidence[0].evidenceId).toBe('mifflin-st-jeor-1990');
    expect(envelope.uncertainty.level).toBe('NOT_ASSESSED');
    expect(envelope.uncertainty.basis[0]).toContain('No calibrated confidence model');
    expect(envelope.validity.status).toBe('CURRENT');
    expect(envelope.privacyClass).toBe('PERSONAL');
  });

  it('preserves the existing deterministic Macro V6 warnings', () => {
    const engineWarnings: SafetyWarningV6[] = [
      {
        level: 'caution',
        code: 'TARGET_BELOW_ESTIMATED_BMR',
        message: 'Target calories are below estimated BMR.',
      },
      {
        level: 'info',
        code: 'AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE',
        message: 'Age is outside the original equation sample.',
      },
    ];

    const envelope = adaptMacroV6ToV4(validInput, validOutput, CREATED_AT, engineWarnings);
    expect(envelope.warnings.map((warning) => warning.code)).toContain(
      'DETERMINISTIC_CALCULATION'
    );
    expect(envelope.warnings.map((warning) => warning.code)).toContain(
      'TARGET_BELOW_ESTIMATED_BMR'
    );
    expect(envelope.warnings.map((warning) => warning.code)).toContain(
      'AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE'
    );
    expect(
      envelope.warnings.find((warning) => warning.code === 'TARGET_BELOW_ESTIMATED_BMR')?.severity
    ).toBe('medium');
  });

  it('keeps the envelope shape stable for the same inputs', () => {
    const first = adaptMacroV6ToV4(validInput, validOutput, CREATED_AT);
    const second = adaptMacroV6ToV4(validInput, validOutput, CREATED_AT);

    expect({ ...first, calculationId: 'stable' }).toEqual({
      ...second,
      calculationId: 'stable',
    });
  });
});

describe('adaptMacroV6UnavailableToV4 — EMPTY and PARTIAL', () => {
  it('maps EMPTY to NOT_AVAILABLE / INSUFFICIENT_FOR_SAFE_RESULT', () => {
    const envelope = adaptMacroV6UnavailableToV4(
      {},
      'empty',
      ['age', 'sex', 'heightCm', 'weightKg', 'activityLevel', 'phase'],
      CREATED_AT
    );

    expect(envelope.status).toBe('NOT_AVAILABLE');
    expect(envelope.resultType).toBe('NOT_AVAILABLE');
    expect(envelope.result).toBeNull();
    expect(envelope.inputSnapshot.completeness).toBe('INSUFFICIENT_FOR_SAFE_RESULT');
    expect(validateToolResultEnvelope(envelope).valid).toBe(true);
  });

  it('maps PARTIAL to NOT_AVAILABLE / INCOMPLETE', () => {
    const envelope = adaptMacroV6UnavailableToV4(
      { age: 30, sex: 'male' },
      'partial',
      ['heightCm', 'weightKg', 'activityLevel', 'phase'],
      CREATED_AT
    );

    expect(envelope.status).toBe('NOT_AVAILABLE');
    expect(envelope.result).toBeNull();
    expect(envelope.inputSnapshot.completeness).toBe('INCOMPLETE');
    expect(validateToolResultEnvelope(envelope).valid).toBe(true);
  });

  it('records every required field state and documents missing fields', () => {
    const envelope = adaptMacroV6UnavailableToV4(
      { age: 30 },
      'partial',
      ['sex', 'heightCm', 'weightKg', 'activityLevel', 'phase'],
      CREATED_AT
    );

    expect(envelope.inputSnapshot.fieldStates).toEqual({
      age: 'VALID',
      sex: 'MISSING',
      heightCm: 'MISSING',
      weightKg: 'MISSING',
      activityLevel: 'MISSING',
      phase: 'MISSING',
    });
    expect(envelope.uncertainty.level).toBe('INSUFFICIENT_EVIDENCE');
    expect(envelope.uncertainty.basis[0]).toContain('Missing required fields');
    expect(envelope.warnings[0].code).toBe('MISSING_INPUTS');
    expect(envelope.nextActions).toEqual([]);
    expect(envelope.validity.status).toBe('NOT_ASSESSED');
  });
});

describe('adaptMacroV6InvalidToV4 — FULL invalid', () => {
  it('maps a rejected calculation to INVALID / INCOMPLETE', () => {
    const envelope = adaptMacroV6InvalidToV4(
      { ...validInput, weightKg: 0 },
      'Weight is outside the supported range.',
      CREATED_AT
    );

    expect(envelope.status).toBe('INVALID');
    expect(envelope.resultType).toBe('NOT_AVAILABLE');
    expect(envelope.result).toBeNull();
    expect(envelope.inputSnapshot.completeness).toBe('INCOMPLETE');
    expect(envelope.validity.status).toBe('INVALIDATED');
    expect(envelope.warnings[0].code).toBe('INVALID_INPUT');
    expect(validateToolResultEnvelope(envelope).valid).toBe(true);
  });
});

describe('Output boundary guards', () => {
  it.each([
    ['NaN targetCalories', { ...validOutput, targetCalories: Number.NaN }],
    ['Infinity tdee', { ...validOutput, tdee: Number.POSITIVE_INFINITY }],
    [
      'NaN macro grams',
      {
        ...validOutput,
        macros: {
          ...validOutput.macros,
          protein: { ...validOutput.macros.protein, grams: Number.NaN },
        },
      },
    ],
  ])('rejects %s without producing an envelope', (_label, malformed) => {
    expect(() =>
      adaptMacroV6ToV4(validInput, malformed as MacroOutputV6, CREATED_AT)
    ).toThrow(RangeError);
    expect(() => assertValidMacroOutput(malformed as MacroOutputV6)).toThrow(RangeError);
  });

  it('rejects a null/malformed output object', () => {
    expect(() =>
      adaptMacroV6ToV4(validInput, null as unknown as MacroOutputV6, CREATED_AT)
    ).toThrow(TypeError);
  });

  it('rejects malformed assumptions', () => {
    const malformed = {
      ...validOutput,
      assumptions: [42],
    } as unknown as MacroOutputV6;

    expect(() => assertValidMacroOutput(malformed)).toThrow(TypeError);
  });
});
