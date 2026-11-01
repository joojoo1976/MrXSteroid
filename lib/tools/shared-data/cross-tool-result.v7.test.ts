import { describe, expect, it } from 'vitest';
import {
  CrossToolResultEnvelopeV7Schema,
  grantCrossToolResultToTargetV7,
  revokeCrossToolResultTargetV7,
  validateCrossToolImportV7,
} from './cross-tool-result.v7';

const NOW = Date.parse('2026-10-25T12:00:00.000Z');
const base = {
  schemaVersion: 1 as const,
  resultId: 'result-001',
  sourceToolId: 'tool-149-physique-trajectory-simulator',
  sourceToolVersion: '6.0.0',
  createdAt: '2026-10-25T11:00:00.000Z',
  privacyClass: 'SENSITIVE' as const,
  fields: [
    { key: 'scenario_weight_kg', value: 76.5, unit: 'kg', origin: 'CALCULATED' as const, sourceLabel: 'Tool 149 scenario' },
    { key: 'scenario_duration_weeks', value: 12, unit: 'week', origin: 'CALCULATED' as const, sourceLabel: 'Tool 149 scenario' },
  ],
  consent: { grantedAt: '2026-10-25T11:30:00.000Z', targetToolIds: ['tool-150-ai-performance-command-center'] },
};

describe('Cross-tool result contract v7', () => {
  it('accepts a valid scalar-only result envelope', () => {
    expect(CrossToolResultEnvelopeV7Schema.safeParse(base).success).toBe(true);
  });

  it('requires explicit per-target consent before import', () => {
    expect(validateCrossToolImportV7({ ...base, consent: { ...base.consent, targetToolIds: [] } }, 'tool-150-ai-performance-command-center', [], { now: NOW, maxAgeMs: 86_400_000 }))
      .toMatchObject({ status: 'NOT_AVAILABLE', reason: 'CONSENT_NOT_GRANTED' });
  });

  it('rejects importing a result into its source tool', () => {
    expect(validateCrossToolImportV7(base, base.sourceToolId, [], { now: NOW, maxAgeMs: 86_400_000 }))
      .toMatchObject({ status: 'NOT_AVAILABLE', reason: 'SOURCE_TARGET_MISMATCH' });
  });

  it('returns only fields declared by the target contract', () => {
    const result = validateCrossToolImportV7(base, 'tool-150-ai-performance-command-center', [
      { key: 'scenario_weight_kg', unit: 'kg' },
    ], { now: NOW, maxAgeMs: 86_400_000 });
    expect(result).toMatchObject({ status: 'READY', fields: [{ key: 'scenario_weight_kg', value: 76.5, unit: 'kg' }] });
  });

  it('returns PARTIAL when a required field is missing', () => {
    expect(validateCrossToolImportV7(base, 'tool-150-ai-performance-command-center', [
      { key: 'missing_result', required: true },
    ], { now: NOW, maxAgeMs: 86_400_000 })).toMatchObject({ status: 'PARTIAL', missingFields: ['missing_result'] });
  });

  it('does not require optional fields', () => {
    expect(validateCrossToolImportV7(base, 'tool-150-ai-performance-command-center', [
      { key: 'optional', required: false },
    ], { now: NOW, maxAgeMs: 86_400_000 })).toMatchObject({ status: 'READY', fields: [] });
  });

  it('rejects unit mismatches instead of converting implicitly', () => {
    expect(validateCrossToolImportV7(base, 'tool-150-ai-performance-command-center', [
      { key: 'scenario_weight_kg', unit: 'lb' },
    ], { now: NOW, maxAgeMs: 86_400_000 })).toMatchObject({ status: 'NOT_AVAILABLE', reason: 'UNIT_MISMATCH', field: 'scenario_weight_kg' });
  });

  it('rejects stale results using the consumer-provided freshness policy', () => {
    expect(validateCrossToolImportV7(base, 'tool-150-ai-performance-command-center', [], { now: NOW, maxAgeMs: 1_000 }))
      .toMatchObject({ status: 'NOT_AVAILABLE', reason: 'STALE_RESULT' });
  });

  it('does not impose a universal freshness period and supports field-specific age rules', () => {
    const olderObservation = {
      ...base,
      fields: [{ ...base.fields[0], recordedAt: '2026-10-20T12:00:00.000Z' }],
    };
    expect(validateCrossToolImportV7(olderObservation, 'tool-150-ai-performance-command-center', [], { now: NOW }).status)
      .toBe('READY');
    expect(validateCrossToolImportV7(olderObservation, 'tool-150-ai-performance-command-center', [
      { key: 'scenario_weight_kg', maxAgeMs: 86_400_000 },
    ], { now: NOW })).toMatchObject({ status: 'NOT_AVAILABLE', reason: 'STALE_RESULT', field: 'scenario_weight_kg' });
  });

  it('rejects results from the future unless an explicit clock skew allowance covers them', () => {
    const future = {
      ...base,
      createdAt: '2026-10-25T12:00:10.000Z',
      consent: { ...base.consent, grantedAt: '2026-10-25T12:00:10.000Z' },
    };
    expect(validateCrossToolImportV7(future, 'tool-150-ai-performance-command-center', [], { now: NOW, maxAgeMs: 86_400_000 }))
      .toMatchObject({ status: 'NOT_AVAILABLE', reason: 'FUTURE_RESULT' });
    expect(validateCrossToolImportV7(future, 'tool-150-ai-performance-command-center', [], { now: NOW, maxAgeMs: 86_400_000, maxFutureSkewMs: 15_000 }).status)
      .toBe('READY');
  });

  it('rejects future consent and consent timestamps that predate the result', () => {
    const futureConsent = { ...base, consent: { grantedAt: '2026-10-25T12:00:10.000Z', targetToolIds: base.consent.targetToolIds } };
    expect(validateCrossToolImportV7(futureConsent, 'tool-150-ai-performance-command-center', [], { now: NOW }))
      .toMatchObject({ status: 'NOT_AVAILABLE', reason: 'FUTURE_CONSENT' });
    const consentBeforeResult = { ...base, createdAt: '2026-10-25T11:45:00.000Z' };
    expect(CrossToolResultEnvelopeV7Schema.safeParse(consentBeforeResult).success).toBe(false);
  });

  it('rejects malformed options and malformed payloads', () => {
    expect(validateCrossToolImportV7(base, 'tool-150-ai-performance-command-center', [], { now: Number.NaN, maxAgeMs: 10 }).status)
      .toBe('INVALID_INPUT');
    expect(validateCrossToolImportV7({ ...base, fields: [{ ...base.fields[0], value: Number.POSITIVE_INFINITY }] }, 'tool-150-ai-performance-command-center', [], { now: NOW, maxAgeMs: 10 }).status)
      .toBe('INVALID_INPUT');
  });

  it('rejects duplicate fields and consent targets', () => {
    expect(CrossToolResultEnvelopeV7Schema.safeParse({ ...base, fields: [base.fields[0], base.fields[0]] }).success).toBe(false);
    expect(CrossToolResultEnvelopeV7Schema.safeParse({ ...base, consent: { ...base.consent, targetToolIds: [base.consent.targetToolIds[0], base.consent.targetToolIds[0]] } }).success).toBe(false);
  });

  it('rejects a consent target equal to the source tool', () => {
    expect(CrossToolResultEnvelopeV7Schema.safeParse({ ...base, consent: { ...base.consent, targetToolIds: [base.sourceToolId] } }).success).toBe(false);
  });

  it('grants access only for a valid explicit target and timestamp', () => {
    const privateResult = { ...base, consent: { grantedAt: base.createdAt, targetToolIds: [] } };
    expect(grantCrossToolResultToTargetV7(privateResult, 'tool-150-ai-performance-command-center', base.consent.grantedAt)?.consent.targetToolIds)
      .toEqual(['tool-150-ai-performance-command-center']);
    expect(grantCrossToolResultToTargetV7(privateResult, base.sourceToolId, base.consent.grantedAt)).toBeNull();
    expect(grantCrossToolResultToTargetV7(privateResult, 'bad id', base.consent.grantedAt)).toBeNull();
  });

  it('revokes one target without affecting another and discards when none remain', () => {
    const multiTarget = { ...base, consent: { ...base.consent, targetToolIds: ['tool-150-ai-performance-command-center', 'tool-149-other'] } };
    expect(revokeCrossToolResultTargetV7(multiTarget, 'tool-150-ai-performance-command-center')?.consent.targetToolIds).toEqual(['tool-149-other']);
    expect(revokeCrossToolResultTargetV7(base, 'tool-150-ai-performance-command-center')).toBeNull();
  });
});
