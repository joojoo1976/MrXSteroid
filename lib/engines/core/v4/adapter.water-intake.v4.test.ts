/**
 * lib/engines/core/v4/adapter.water-intake.v4.test.ts
 *
 * R5 first batch, Tool 3: adapter conformance. The unchanged engine remains
 * the sole numeric authority; this adapter is read-only.
 */

import { describe, expect, it } from 'vitest';
import {
  adaptWaterIntakeV6InvalidToV4,
  adaptWaterIntakeV6ToV4,
  adaptWaterIntakeV6UnavailableToV4,
} from './adapter.water-intake.v4';
import { WATER_INTAKE_SPEC_RECORD } from './profiles/water-intake-evidence-record.v4';
import { validateToolResultEnvelope } from './runtime.v4';
import { calculateWaterIntakeV6, type WaterIntakeInput } from '@/lib/tools/engines/water-intake.v6';

const CREATED_AT = '2026-11-05T12:00:00.000Z';
const VALID_INPUT: WaterIntakeInput = { weightKg: 70, activityLevel: 1.2 };

describe('water intake V4 adapter', () => {
  it('produces a VALID envelope that passes the accepted runtime validator', () => {
    const output = calculateWaterIntakeV6(VALID_INPUT);
    const envelope = adaptWaterIntakeV6ToV4(VALID_INPUT, output, CREATED_AT);

    expect(envelope.status).toBe('VALID');
    expect(envelope.resultType).toBe('CALCULATED');
    expect(envelope.contractVersion).toBe('4.0');
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

  it('emits the SPEC v3 documentation record and no review date', () => {
    const output = calculateWaterIntakeV6(VALID_INPUT);
    const envelope = adaptWaterIntakeV6ToV4(VALID_INPUT, output, CREATED_AT);

    expect(envelope.evidence).toHaveLength(1);
    expect(envelope.evidence[0]).toMatchObject({
      evidenceId: WATER_INTAKE_SPEC_RECORD.evidenceId,
      sourceType: 'documentation',
      applicability: WATER_INTAKE_SPEC_RECORD.applicability,
    });
    expect('reviewStatus' in envelope.evidence[0]).toBe(false);
    expect(envelope.evidence[0].reviewedAt).toBeUndefined();
    expect(envelope.validity.status).toBe('CURRENT');
    expect(envelope.warnings.map((warning) => warning.code)).toContain('NOT_MEDICAL_ADVICE');
    expect(envelope.uncertainty.level).toBe('NOT_ASSESSED');
  });

  it('marks empty/partial envelopes NOT_AVAILABLE with no evidence', () => {
    const empty = adaptWaterIntakeV6UnavailableToV4(
      { activityLevel: 1.2 },
      'empty',
      ['weightKg'],
      CREATED_AT,
    );
    const partial = adaptWaterIntakeV6UnavailableToV4(
      {},
      'partial',
      ['weightKg', 'activityLevel'],
      CREATED_AT,
    );

    for (const envelope of [empty, partial]) {
      expect(envelope.status).toBe('NOT_AVAILABLE');
      expect(envelope.result).toBeNull();
      expect(envelope.evidence).toEqual([]);
      expect(validateToolResultEnvelope(envelope).valid).toBe(true);
    }
  });

  it('keeps provenance limited to provided fields', () => {
    const output = calculateWaterIntakeV6(VALID_INPUT);
    const envelope = adaptWaterIntakeV6ToV4(VALID_INPUT, output, CREATED_AT);

    expect(envelope.inputSnapshot.provenance).toEqual({
      weightKg: 'USER_ENTERED',
      activityLevel: 'USER_ENTERED',
    });
  });

  it('passes the runtime validator for a rejected attempt', () => {
    const envelope = adaptWaterIntakeV6InvalidToV4(
      { weightKg: 0, activityLevel: 1.2 },
      'Weight must be positive',
      CREATED_AT,
    );

    expect(envelope.status).toBe('INVALID');
    expect(envelope.result).toBeNull();
    expect(envelope.validity.status).toBe('INVALIDATED');
    expect(validateToolResultEnvelope(envelope).valid).toBe(true);
  });
});
