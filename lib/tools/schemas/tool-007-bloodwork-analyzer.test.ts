import { describe, expect, it } from 'vitest';
import { BloodworkRecordSchema, BloodworkSessionSchema } from './tool-007-bloodwork-analyzer';
import { buildBloodworkSessionV7 } from '../engines/tool-007-bloodwork-analyzer';

const record = {
  id: 'f5203a27-2b50-4022-afc4-c238a2df3ae5',
  markerName: 'Example marker',
  value: 42,
  unit: 'unit/L',
  sourceLabel: 'Example laboratory report',
  sampleDate: '2026-10-25',
};

describe('Tool 007 user-provided bloodwork record contract', () => {
  it('accepts a sourced finite value and permits an optional transcribed interval', () => {
    expect(BloodworkRecordSchema.safeParse(record).success).toBe(true);
    expect(BloodworkRecordSchema.safeParse({ ...record, referenceInterval: '10-50 unit/L' }).success).toBe(true);
  });

  it('rejects incomplete provenance, non-finite values, and invalid dates', () => {
    expect(BloodworkRecordSchema.safeParse({ ...record, sourceLabel: '' }).success).toBe(false);
    expect(BloodworkRecordSchema.safeParse({ ...record, value: Number.NaN }).success).toBe(false);
    expect(BloodworkRecordSchema.safeParse({ ...record, sampleDate: '2026-02-30' }).success).toBe(false);
  });

  it('bounds the session size and never creates an assessment', () => {
    expect(BloodworkSessionSchema.safeParse(Array(201).fill(record)).success).toBe(false);
    const parsed = BloodworkRecordSchema.parse(record);
    expect(buildBloodworkSessionV7([parsed])).toMatchObject({
      resultOrigin: 'USER_PROVIDED',
      assessment: 'NOT_AVAILABLE',
      reason: 'NO_VALIDATED_INTERPRETATION_RULES',
    });
  });
});
