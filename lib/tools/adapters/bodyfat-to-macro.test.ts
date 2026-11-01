import { describe, it, expect } from 'vitest';
import { BODYFAT_TO_MACRO_POLICY } from '@/lib/shared/cross-tool-link';
import {
  adaptBodyFatToMacro,
  validateBodyFatForMacro,
  extractBodyFatFields,
} from './bodyfat-to-macro';

describe('bodyfat → macro adapter (§28.4)', () => {
  const linked = {
    sourceToolId: 'mrx.tool.bodyfat',
    computedAt: new Date().toISOString(),
    value: { weight: 80, bodyFatPercent: 15 },
    unit: 'kg',
    confidence: 'high' as const,
    fields: { weight: 80, bodyFatPercent: 15 },
  };

  it('extracts fields', () => {
    expect(extractBodyFatFields(linked)).toEqual({ weight: 80, bodyFatPercent: 15 });
  });

  it('adapts to macro input', () => {
    const out = adaptBodyFatToMacro(linked);
    expect(out).toEqual({ weightKg: 80 });
    expect(out.targetBodyFatPct).toBeUndefined();
    expect(out.leanMassKg).toBeUndefined();
  });

  it('validates fresh linked data', () => {
    const v = validateBodyFatForMacro(linked);
    expect(v.ok).toBe(true);
  });

  it('rejects stale data', () => {
    const stale = { ...linked, computedAt: new Date(Date.now() - 10 * 86400000).toISOString() };
    const v = validateBodyFatForMacro(stale);
    expect(v.ok).toBe(false);
    expect(v.stale).toBe(true);
  });

  it('rejects unit mismatch', () => {
    const bad = { ...linked, unit: 'lbs' };
    const v = validateBodyFatForMacro(bad);
    expect(v.ok).toBe(false);
    expect(v.unitMismatch).toBe(true);
  });

  it('rejects linked results from a different source tool', () => {
    const bad = { ...linked, sourceToolId: 'mrx.tool.macro' };
    const result = validateBodyFatForMacro(bad);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('source_tool_mismatch');
  });

  it('requires an explicit canonical kg unit', () => {
    const { unit: _unit, ...missingUnit } = linked;
    const result = validateBodyFatForMacro(missingUnit);
    expect(result.ok).toBe(false);
    expect(result.unitMismatch).toBe(true);
    expect(result.reason).toBe('unit_missing_or_mismatched');
  });

  it('rejects invalid and future computation timestamps', () => {
    const invalidDate = validateBodyFatForMacro({ ...linked, computedAt: 'not-a-date' });
    const futureDate = validateBodyFatForMacro({ ...linked, computedAt: new Date(Date.now() + 120_000).toISOString() });
    expect(invalidDate.ok).toBe(false);
    expect(invalidDate.reason).toBe('invalid_or_future_timestamp');
    expect(futureDate.ok).toBe(false);
    expect(futureDate.reason).toBe('invalid_or_future_timestamp');
  });

  it('rejects numeric confidence values outside the normalized range', () => {
    const result = validateBodyFatForMacro({ ...linked, confidence: Number.POSITIVE_INFINITY });
    expect(result.ok).toBe(false);
    expect(result.lowConfidence).toBe(true);
    expect(result.reason).toBe('invalid_confidence');
  });

  it('rejects non-finite or out-of-range linked measurements', () => {
    const invalidWeight = validateBodyFatForMacro({ ...linked, value: { weight: Number.NaN, bodyFatPercent: 15 }, fields: { weight: Number.NaN, bodyFatPercent: 15 } });
    const invalidBodyFat = validateBodyFatForMacro({ ...linked, value: { weight: 80, bodyFatPercent: 101 }, fields: { weight: 80, bodyFatPercent: 101 } });
    expect(invalidWeight.ok).toBe(false);
    expect(invalidWeight.reason).toBe('invalid_weight');
    expect(invalidBodyFat.ok).toBe(false);
    expect(invalidBodyFat.reason).toBe('invalid_body_fat_percent');
  });

  it('policy fields', () => {
    expect(BODYFAT_TO_MACRO_POLICY.requiredFields).toEqual(['weight', 'bodyFatPercent']);
  });
});
