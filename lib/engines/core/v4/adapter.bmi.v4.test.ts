/**
 * lib/engines/core/v4/adapter.bmi.v4.test.ts
 *
 * R5 first batch, Tool 1: adapter conformance against the unchanged BMI
 * engine and the accepted V4 runtime validator. No engine, schema, registry,
 * contract or runtime file is modified.
 */

import { describe, expect, it } from 'vitest';
import {
  adaptBmiV6InvalidToV4,
  adaptBmiV6ToV4,
  adaptBmiV6UnavailableToV4,
} from './adapter.bmi.v4';
import { BMI_DOCUMENTATION_RECORD } from './profiles/bmi-evidence-record.v4';
import { validateToolResultEnvelope } from './runtime.v4';
import { calculateBmi, type BmiInput } from '@/lib/tools/engines/bmi.v6';

const CREATED_AT = '2026-11-05T12:00:00.000Z';
const VALID_INPUT: BmiInput = { weightKg: 75, heightCm: 175 };

describe('BMI V4 adapter', () => {
  it('produces a VALID envelope that passes the accepted runtime validator', () => {
    const output = calculateBmi(VALID_INPUT);
    const envelope = adaptBmiV6ToV4(VALID_INPUT, output, CREATED_AT);

    expect(envelope.status).toBe('VALID');
    expect(envelope.resultType).toBe('CALCULATED');
    expect(envelope.contractVersion).toBe('4.0');
    expect(envelope.schemaVersion).toBe('4.0.0');
    expect(envelope.engineVersion).toBe('6.0.0');
    expect(envelope.privacyClass).toBe('PERSONAL');
    expect(envelope.contextUsed).toEqual([]);
    expect(envelope.nextActions).toEqual([]);
    expect(envelope.auditRef).toBeUndefined();
    expect(envelope.result).toEqual(output);

    const validation = validateToolResultEnvelope(envelope);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
  });

  it('emits the documentation evidence record and CURRENT validity for a calculated result', () => {
    const output = calculateBmi(VALID_INPUT);
    const envelope = adaptBmiV6ToV4(VALID_INPUT, output, CREATED_AT);

    expect(envelope.evidence).toHaveLength(1);
    expect(envelope.evidence[0]).toMatchObject({
      evidenceId: BMI_DOCUMENTATION_RECORD.evidenceId,
      sourceType: 'documentation',
      url: BMI_DOCUMENTATION_RECORD.url,
      applicability: BMI_DOCUMENTATION_RECORD.applicability,
      limitations: [...BMI_DOCUMENTATION_RECORD.limitations],
      version: BMI_DOCUMENTATION_RECORD.version,
    });
    expect(envelope.evidence[0].reviewedAt).toBeUndefined();
    expect(envelope.validity).toEqual({
      status: 'CURRENT',
      invalidationTriggers: ['input_changed', 'engine_version_changed'],
    });
    expect(envelope.warnings.map((warning) => warning.code)).toContain('NOT_A_DIAGNOSIS');
    expect(envelope.uncertainty.level).toBe('NOT_ASSESSED');
    expect(envelope.resultType).not.toBe('MODEL_PREDICTION');
  });

  it('marks an empty/partial envelope NOT_AVAILABLE with no evidence and no result', () => {
    const empty = adaptBmiV6UnavailableToV4({}, 'empty', ['weightKg', 'heightCm'], CREATED_AT);
    const partial = adaptBmiV6UnavailableToV4({ weightKg: 75 }, 'partial', ['heightCm'], CREATED_AT);

    for (const envelope of [empty, partial]) {
      expect(envelope.status).toBe('NOT_AVAILABLE');
      expect(envelope.result).toBeNull();
      expect(envelope.evidence).toEqual([]);
      expect(validateToolResultEnvelope(envelope).valid).toBe(true);
    }

    expect(empty.inputSnapshot.completeness).toBe('INSUFFICIENT_FOR_SAFE_RESULT');
    expect(partial.inputSnapshot.completeness).toBe('INCOMPLETE');
    expect(partial.inputSnapshot.provenance).toEqual({ weightKg: 'USER_ENTERED' });
    expect(empty.warnings.map((warning) => warning.code)).toEqual(['MISSING_INPUTS']);
  });

  it('produces an INVALID envelope that passes the accepted runtime validator', () => {
    const envelope = adaptBmiV6InvalidToV4(
      { weightKg: 75, heightCm: 0 },
      'Invalid input: weight and height must be positive finite numbers',
      CREATED_AT,
    );

    expect(envelope.status).toBe('INVALID');
    expect(envelope.result).toBeNull();
    expect(envelope.resultType).toBe('NOT_AVAILABLE');
    expect(envelope.validity.status).toBe('INVALIDATED');
    expect(envelope.warnings.map((warning) => warning.code)).toContain('INVALID_INPUT');

    const validation = validateToolResultEnvelope(envelope);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
  });

  it('uses provenance entries only for provided fields and preserves USER_ENTERED', () => {
    const output = calculateBmi(VALID_INPUT);
    const envelope = adaptBmiV6ToV4(VALID_INPUT, output, CREATED_AT);

    expect(envelope.inputSnapshot.provenance).toEqual({
      weightKg: 'USER_ENTERED',
      heightCm: 'USER_ENTERED',
    });
    expect(envelope.inputSnapshot.fieldStates).toEqual({
      weightKg: 'VALID',
      heightCm: 'VALID',
    });
  });
});
