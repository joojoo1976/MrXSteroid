/**
 * lib/engines/core/v4/adapter.protein-needs.v4.test.ts
 *
 * R5 first batch, Tool 2: adapter conformance. The unchanged engine remains
 * the sole numeric authority; this adapter is read-only.
 */

import { describe, expect, it } from 'vitest';
import {
  adaptProteinNeedsV6InvalidToV4,
  adaptProteinNeedsV6ToV4,
  adaptProteinNeedsV6UnavailableToV4,
} from './adapter.protein-needs.v4';
import { PROTEIN_NEEDS_SPEC_RECORD } from './profiles/protein-needs-evidence-record.v4';
import { validateToolResultEnvelope } from './runtime.v4';
import { calculateProteinNeedsV6, type ProteinNeedsInput } from '@/lib/tools/engines/protein-needs.v6';

const CREATED_AT = '2026-11-05T12:00:00.000Z';
const VALID_INPUT: ProteinNeedsInput = { weightKg: 70, goal: 'maintain', activityLevel: 1.2 };

describe('protein needs V4 adapter', () => {
  it('produces a VALID envelope that passes the accepted runtime validator', () => {
    const output = calculateProteinNeedsV6(VALID_INPUT);
    const envelope = adaptProteinNeedsV6ToV4(VALID_INPUT, output, CREATED_AT);

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

  it('emits the SPEC v3 documentation record and CURRENT validity and no fake review', () => {
    const output = calculateProteinNeedsV6(VALID_INPUT);
    const envelope = adaptProteinNeedsV6ToV4(VALID_INPUT, output, CREATED_AT);

    expect(envelope.evidence).toHaveLength(1);
    expect(envelope.evidence[0]).toMatchObject({
      evidenceId: PROTEIN_NEEDS_SPEC_RECORD.evidenceId,
      sourceType: 'documentation',
      applicability: PROTEIN_NEEDS_SPEC_RECORD.applicability,
    });
    expect('reviewStatus' in envelope.evidence[0]).toBe(false);
    expect(envelope.evidence[0].reviewedAt).toBeUndefined();
    expect(envelope.validity.status).toBe('CURRENT');
    expect(envelope.warnings.map((warning) => warning.code)).toContain('NOT_MEDICAL_ADVICE');
    expect(envelope.uncertainty.level).toBe('NOT_ASSESSED');
  });

  it('marks empty/partial envelopes NOT_AVAILABLE and emits no evidence', () => {
    const empty = adaptProteinNeedsV6UnavailableToV4(
      { goal: 'maintain', activityLevel: 1.2 },
      'empty',
      ['weightKg'],
      CREATED_AT,
    );
    const partial = adaptProteinNeedsV6UnavailableToV4(
      { goal: 'maintain' },
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
    const output = calculateProteinNeedsV6(VALID_INPUT);
    const envelope = adaptProteinNeedsV6ToV4(VALID_INPUT, output, CREATED_AT);

    expect(envelope.inputSnapshot.provenance).toEqual({
      weightKg: 'USER_ENTERED',
      goal: 'USER_ENTERED',
      activityLevel: 'USER_ENTERED',
    });
  });

  it('passes the runtime validator for a rejected attempt', () => {
    const envelope = adaptProteinNeedsV6InvalidToV4(
      { weightKg: 0, goal: 'maintain', activityLevel: 1.2 },
      'Weight must be positive',
      CREATED_AT,
    );

    expect(envelope.status).toBe('INVALID');
    expect(envelope.result).toBeNull();
    expect(envelope.validity.status).toBe('INVALIDATED');
    expect(validateToolResultEnvelope(envelope).valid).toBe(true);
  });
});
