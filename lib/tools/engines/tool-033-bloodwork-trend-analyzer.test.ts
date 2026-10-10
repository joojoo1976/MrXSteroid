/**
 * Tool #033 — Bloodwork Trend Analyzer: engine + schema verification.
 * Proves least-squares slopes, range flags and velocity alerts.
 */
import { describe, it, expect } from 'vitest';
import { analyzeBloodworkTrends } from './tool-033-bloodwork-trend-analyzer';
import { TrendAnalyzerInputSchema, TrendAnalyzerResultSchema } from '../schemas/tool-033-bloodwork-trend-analyzer';

const RANGES = { 'Total T': { low: 300, high: 1000, unit: 'ng/dL' } };

describe('tool-033 trend engine', () => {
  it('detects a rising in-range trend', () => {
    const input = {
      readings: [
        { marker: 'Total T', value: 400, unit: 'ng/dL', date: '2026-01-01' },
        { marker: 'Total T', value: 500, unit: 'ng/dL', date: '2026-02-01' },
        { marker: 'Total T', value: 600, unit: 'ng/dL', date: '2026-03-01' },
      ],
      ranges: RANGES,
    };
    expect(TrendAnalyzerInputSchema.safeParse(input).success).toBe(true);
    const r = analyzeBloodworkTrends(input);
    expect(TrendAnalyzerResultSchema.safeParse(r).success).toBe(true);
    expect(r.markers).toHaveLength(1);
    expect(r.markers[0].direction).toBe('rising');
    expect(r.markers[0].slope_per_30d).toBeGreaterThan(0);
    expect(r.markers[0].in_range).toBe(true);
    expect(r.markers[0].points).toBe(3);
  });

  it('flags out-of-range latest values', () => {
    const r = analyzeBloodworkTrends({
      readings: [
        { marker: 'Total T', value: 900, unit: 'ng/dL', date: '2026-01-01' },
        { marker: 'Total T', value: 1200, unit: 'ng/dL', date: '2026-02-01' },
      ],
      ranges: RANGES,
    });
    expect(r.markers[0].in_range).toBe(false);
    expect(r.summary.some((s) => s.includes('OUT of range'))).toBe(true);
  });

  it('raises velocity alerts on rapid moves', () => {
    const r = analyzeBloodworkTrends({
      readings: [
        { marker: 'Total T', value: 400, unit: 'ng/dL', date: '2026-01-01' },
        { marker: 'Total T', value: 950, unit: 'ng/dL', date: '2026-01-15' },
      ],
      ranges: RANGES,
    });
    // ~+1178/30d > 25% of 700 range width (175) -> alert
    expect(r.markers[0].velocity_alert).toBe(true);
  });

  it('reports stable direction for flat series', () => {
    const r = analyzeBloodworkTrends({
      readings: [
        { marker: 'Total T', value: 500, unit: 'ng/dL', date: '2026-01-01' },
        { marker: 'Total T', value: 502, unit: 'ng/dL', date: '2026-02-01' },
      ],
      ranges: RANGES,
    });
    expect(r.markers[0].direction).toBe('stable');
  });

  it('skips malformed rows and rejects empty input', () => {
    const r = analyzeBloodworkTrends({
      readings: [{ marker: 'Total T', value: 500, unit: 'ng/dL', date: 'not-a-date' }],
      ranges: RANGES,
    });
    expect(r.markers).toHaveLength(0);
    expect(TrendAnalyzerInputSchema.safeParse({ readings: [], ranges: {} }).success).toBe(false);
  });
});
