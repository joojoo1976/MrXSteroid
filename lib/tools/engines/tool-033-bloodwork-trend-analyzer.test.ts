import { describe, expect, it } from 'vitest';
import { analyzeBloodworkTrends } from './tool-033-bloodwork-trend-analyzer';
import { TrendAnalyzerInputSchema, TrendAnalyzerResultSchema } from '../schemas/tool-033-bloodwork-trend-analyzer';

const reading = (value: number, date: string, unit = 'ng/dL', marker = 'Total T') => ({ marker, value, unit, date });

describe('tool-033 descriptive trend engine', () => {
  it('calculates a deterministic least-squares slope per 30 days and validates the result', () => {
    const input = { readings: [reading(400, '2026-01-01'), reading(500, '2026-01-31'), reading(600, '2026-03-02')] };
    expect(TrendAnalyzerInputSchema.safeParse(input).success).toBe(true);
    const result = analyzeBloodworkTrends(input);
    expect(TrendAnalyzerResultSchema.safeParse(result).success).toBe(true);
    expect(result.markers[0]).toMatchObject({ slope_per_30d: 100, direction: 'rising', points: 3, distinct_dates: 3 });
  });

  it('reports falling and zero displayed slopes without interpreting health significance', () => {
    expect(analyzeBloodworkTrends({ readings: [reading(10, '2026-01-01'), reading(8, '2026-01-31')] }).markers[0])
      .toMatchObject({ direction: 'falling', slope_per_30d: -2 });
    expect(analyzeBloodworkTrends({ readings: [reading(10, '2026-01-01'), reading(10, '2026-02-01')] }).markers[0])
      .toMatchObject({ direction: 'stable', slope_per_30d: 0 });
  });

  it('returns insufficient_data and a null slope with one distinct date, even for duplicate same-day readings', () => {
    const result = analyzeBloodworkTrends({ readings: [reading(10, '2026-01-01'), reading(12, '2026-01-01')] });
    expect(result.markers[0]).toMatchObject({ direction: 'insufficient_data', slope_per_30d: null, points: 2, distinct_dates: 1 });
  });

  it('returns an empty summary for no readings and accepts it as an intentional empty state', () => {
    expect(TrendAnalyzerInputSchema.safeParse({ readings: [] }).success).toBe(true);
    expect(analyzeBloodworkTrends({ readings: [] })).toEqual({ markers: [] });
  });

  it('rejects mixed units for the same marker rather than comparing incompatible values', () => {
    const mixed = { readings: [reading(10, '2026-01-01', 'mg/dL'), reading(20, '2026-02-01', 'mmol/L')] };
    expect(TrendAnalyzerInputSchema.safeParse(mixed).success).toBe(false);
    expect(() => analyzeBloodworkTrends(mixed)).toThrow();
  });

  it.each(['not-a-date', '2026-02-30', '2026-1-02', '2026-01-01T00:00:00Z'])('rejects malformed or non-calendar dates (%s)', (date) => {
    expect(TrendAnalyzerInputSchema.safeParse({ readings: [reading(10, date)] }).success).toBe(false);
  });

  it('rejects missing units, non-finite values, and unsupported marker counts', () => {
    expect(TrendAnalyzerInputSchema.safeParse({ readings: [{ ...reading(10, '2026-01-01'), unit: ' ' }] }).success).toBe(false);
    expect(TrendAnalyzerInputSchema.safeParse({ readings: [reading(Number.POSITIVE_INFINITY, '2026-01-01')] }).success).toBe(false);
    expect(TrendAnalyzerInputSchema.safeParse({ readings: [reading(-1, '2026-01-01')] }).success).toBe(false);
    const tooMany = Array.from({ length: 41 }, (_, index) => reading(1, '2026-01-01', 'u', `marker-${index}`));
    expect(TrendAnalyzerInputSchema.safeParse({ readings: tooMany }).success).toBe(false);
  });
});
