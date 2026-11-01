import { describe, expect, it } from 'vitest';
import { assessStorageExcursionV6, normalizeDailyMedReference, StorageExcursionInputSchema } from './tool-143-storage-stability-thermal-degradation-estimator.v6';

const complete = {
  productName: 'Example product', productState: 'unopened' as const, queriedAt: '2026-10-25T10:00:00.000Z',
  labelReference: 'bee5b358-c863-420b-be73-ced2e920c499', labelRangeMinC: 2, labelRangeMaxC: 8,
  observedMinC: 3, observedMaxC: 7,
};

describe('tool 143 label-range comparison', () => {
  it('compares only complete, referenced values and records DailyMed Set ID', () => {
    const result = assessStorageExcursionV6(complete);
    expect(result.status).toBe('within_entered_range');
    expect(result.labelReference).toBe('https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=bee5b358-c863-420b-be73-ced2e920c499');
    expect(result.reviewInstruction).toBeNull();
  });

  it('returns not evaluable without a source or complete ranges and assumes no range', () => {
    const result = assessStorageExcursionV6({ productName: 'Example product', observedMinC: 2 });
    expect(result.status).toBe('not_evaluable');
    expect(result.labelRangeC).toBeNull();
    expect(result.evaluation).toContain('No storage range was assumed');
  });

  it('flags out-of-range readings for review without judging product condition', () => {
    const result = assessStorageExcursionV6({ ...complete, observedMaxC: 9 });
    expect(result.status).toBe('outside_entered_range');
    expect(result.reviewInstruction).toContain('contact a pharmacist or manufacturer');
    expect(result.evaluation).toContain('does not determine product condition');
  });

  it('rejects non-DailyMed references and reversed ranges', () => {
    expect(normalizeDailyMedReference('https://example.com/label')).toBeNull();
    expect(StorageExcursionInputSchema.safeParse({ ...complete, labelRangeMinC: 9 }).success).toBe(false);
  });
});
