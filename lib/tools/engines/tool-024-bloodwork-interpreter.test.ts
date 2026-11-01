import { describe, expect, it } from 'vitest';
import type { BloodworkComparisonRecord } from '../schemas/tool-024-bloodwork-interpreter';
import { compareBloodworkToEnteredIntervalsV7 } from './tool-024-bloodwork-interpreter';

const record = (value: number): BloodworkComparisonRecord => ({
  id: `f5203a27-2b50-4022-afc4-c238a2df3ae${value.toString(16).padStart(1, '0')}`,
  markerName: 'Example marker',
  value,
  unit: 'unit/L',
  referenceLow: 10,
  referenceHigh: 20,
  sourceLabel: 'User-entered report label',
  sampleDate: '2026-10-25',
});

describe('Tool 024 entered-reference interval arithmetic', () => {
  it('classifies below, on-boundary, within, and above values deterministically', () => {
    const result = compareBloodworkToEnteredIntervalsV7([record(9), record(10), record(15), record(20), record(21)]);
    expect(result.resultOrigin).toBe('CALCULATED');
    expect(result.comparisons.map((item) => item.relation)).toEqual([
      'BELOW_ENTERED_INTERVAL',
      'WITHIN_ENTERED_INTERVAL',
      'WITHIN_ENTERED_INTERVAL',
      'WITHIN_ENTERED_INTERVAL',
      'ABOVE_ENTERED_INTERVAL',
    ]);
  });

  it('does not emit clinical assessments or recommendations', () => {
    const result = compareBloodworkToEnteredIntervalsV7([record(15)]);
    expect(result.comparisons[0]).not.toHaveProperty('recommendations');
    expect(result.comparisons[0]).not.toHaveProperty('recoveryStatus');
    expect(Object.keys(result)).toEqual(['resultOrigin', 'comparisons']);
  });
});
