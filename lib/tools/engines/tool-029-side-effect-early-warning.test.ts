import { describe, expect, it } from 'vitest';
import { summarizeMeasurementReadingsV7 } from './tool-029-side-effect-early-warning';

const readings = [
  { id: '00000000-0000-4000-8000-000000000029', date: '2026-10-20', metric: 'blood_pressure' as const, systolicMmHg: 120, diastolicMmHg: 80 },
  { id: '00000000-0000-4000-8000-000000000030', date: '2026-10-21', metric: 'blood_pressure' as const, systolicMmHg: 140, diastolicMmHg: 90 },
  { id: '00000000-0000-4000-8000-000000000031', date: '2026-10-22', metric: 'pulse' as const, beatsPerMinute: 70 },
  { id: '00000000-0000-4000-8000-000000000032', date: '2026-10-23', metric: 'pulse' as const, beatsPerMinute: 90 },
];

describe('Tool 029 descriptive measurement summary engine', () => {
  it('calculates count, minimum, maximum, and arithmetic mean independently by metric', () => {
    const result = summarizeMeasurementReadingsV7(readings);
    expect(result.resultOrigin).toBe('CALCULATED');
    expect(result.method).toBe('DESCRIPTIVE_ARITHMETIC_ONLY');
    expect(result.clinicalAssessment).toBe('NOT_AVAILABLE');
    expect(result.summaries).toEqual([
      { metric: 'blood_pressure_systolic', count: 2, minimum: 120, maximum: 140, arithmeticMean: 130, unit: 'mmHg' },
      { metric: 'blood_pressure_diastolic', count: 2, minimum: 80, maximum: 90, arithmeticMean: 85, unit: 'mmHg' },
      { metric: 'pulse', count: 2, minimum: 70, maximum: 90, arithmeticMean: 80, unit: 'beats/min' },
    ]);
    expect(result).not.toHaveProperty('riskScore');
    expect(result).not.toHaveProperty('recommendations');
  });

  it('summarizes only the metric groups present in input', () => {
    const result = summarizeMeasurementReadingsV7([readings[0]]);
    expect(result.summaries).toHaveLength(2);
    expect(result.summaries.every((summary) => summary.count === 1)).toBe(true);
  });

  it('rejects duplicate IDs and malformed direct engine inputs', () => {
    expect(() => summarizeMeasurementReadingsV7([readings[0], readings[0]])).toThrow();
    expect(() => summarizeMeasurementReadingsV7([{ ...readings[0], systolicMmHg: Number.NaN } as never])).toThrow();
  });

  it('is deterministic for the same complete session input', () => {
    expect(summarizeMeasurementReadingsV7(readings)).toEqual(summarizeMeasurementReadingsV7(readings));
  });
});
