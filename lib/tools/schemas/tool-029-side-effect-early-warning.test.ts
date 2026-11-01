import { describe, expect, it } from 'vitest';
import { MeasurementReadingSchema, MeasurementSummaryInputSchema } from './tool-029-side-effect-early-warning';

const bp = {
  id: '00000000-0000-4000-8000-000000000029',
  date: '2026-10-25',
  metric: 'blood_pressure',
  systolicMmHg: 120,
  diastolicMmHg: 80,
};

describe('Tool 029 measurement summary schema', () => {
  it('accepts supported measurements and rejects impossible calendar dates', () => {
    expect(MeasurementReadingSchema.safeParse(bp).success).toBe(true);
    expect(MeasurementReadingSchema.safeParse({ ...bp, date: '2026-02-30' }).success).toBe(false);
  });

  it('rejects non-finite, non-positive, and over-bound measurement values', () => {
    expect(MeasurementReadingSchema.safeParse({ ...bp, systolicMmHg: 0 }).success).toBe(false);
    expect(MeasurementReadingSchema.safeParse({ ...bp, diastolicMmHg: Number.POSITIVE_INFINITY }).success).toBe(false);
    expect(MeasurementReadingSchema.safeParse({ ...bp, systolicMmHg: 1001 }).success).toBe(false);
  });

  it('requires unique IDs and at least one reading, with a bounded session size', () => {
    expect(MeasurementSummaryInputSchema.safeParse({ readings: [bp] }).success).toBe(true);
    expect(MeasurementSummaryInputSchema.safeParse({ readings: [] }).success).toBe(false);
    expect(MeasurementSummaryInputSchema.safeParse({ readings: [bp, bp] }).success).toBe(false);
    expect(MeasurementSummaryInputSchema.safeParse({ readings: Array.from({ length: 201 }, (_, index) => ({ ...bp, id: `00000000-0000-4000-8000-${String(index + 29).padStart(12, '0')}` })) }).success).toBe(false);
  });

  it('rejects unknown fields that could reintroduce risk predictions', () => {
    expect(MeasurementReadingSchema.safeParse({ ...bp, riskLevel: 'critical' }).success).toBe(false);
  });
});
