import { describe, expect, it } from 'vitest';
import { BloodworkComparisonInputSchema, BloodworkComparisonRecordSchema } from './tool-024-bloodwork-interpreter';

const record = {
  id: 'f5203a27-2b50-4022-afc4-c238a2df3ae1',
  markerName: 'Example marker',
  value: 15,
  unit: 'unit/L',
  referenceLow: 10,
  referenceHigh: 20,
  sourceLabel: 'User-entered report label',
  sampleDate: '2026-10-25',
};

describe('Tool 024 interval comparison schema', () => {
  it('accepts sourced user values with a valid interval and date', () => {
    expect(BloodworkComparisonRecordSchema.safeParse(record).success).toBe(true);
    expect(BloodworkComparisonInputSchema.safeParse({ records: [record] }).success).toBe(true);
  });

  it('rejects missing provenance, non-finite values, invalid intervals, and invalid dates', () => {
    expect(BloodworkComparisonRecordSchema.safeParse({ ...record, sourceLabel: '' }).success).toBe(false);
    expect(BloodworkComparisonRecordSchema.safeParse({ ...record, value: Number.POSITIVE_INFINITY }).success).toBe(false);
    expect(BloodworkComparisonRecordSchema.safeParse({ ...record, referenceLow: 20, referenceHigh: 10 }).success).toBe(false);
    expect(BloodworkComparisonRecordSchema.safeParse({ ...record, sampleDate: '2026-02-30' }).success).toBe(false);
  });

  it('bounds session size to thirty rows', () => {
    expect(BloodworkComparisonInputSchema.safeParse({ records: Array(31).fill(record) }).success).toBe(false);
  });
});
