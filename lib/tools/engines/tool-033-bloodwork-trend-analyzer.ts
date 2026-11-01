/**
 * Tool #033 — descriptive trend arithmetic for user-entered lab readings.
 * No clinical ranges, advice, inference, storage, or network access.
 */
import {
  TrendAnalyzerInputSchema,
  type TrendAnalyzerInput,
  type TrendAnalyzerResult,
} from '../schemas/tool-033-bloodwork-trend-analyzer';
export type { TrendAnalyzerInput, TrendAnalyzerResult } from '../schemas/tool-033-bloodwork-trend-analyzer';

export type LabReading = TrendAnalyzerInput['readings'][number];
export type TrendDirection = 'rising' | 'falling' | 'stable' | 'insufficient_data';
export type MarkerTrend = TrendAnalyzerResult['markers'][number];

const DAY_MS = 86_400_000;

function leastSquaresSlopePerDay(xs: number[], ys: number[]): number | null {
  if (xs.length < 2 || new Set(xs).size < 2) return null;
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let numerator = 0;
  let denominator = 0;
  for (let index = 0; index < xs.length; index += 1) {
    numerator += (xs[index] - meanX) * (ys[index] - meanY);
    denominator += (xs[index] - meanX) ** 2;
  }
  return denominator > 0 ? numerator / denominator : null;
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Calculates a least-squares slope over entered dates. Repeated same-day
 * readings are retained as separate observations; at least two distinct dates
 * are required. Direction is based only on the rounded displayed slope.
 */
export function analyzeBloodworkTrends(rawInput: TrendAnalyzerInput): TrendAnalyzerResult {
  const { readings } = TrendAnalyzerInputSchema.parse(rawInput);
  const groups = new Map<string, typeof readings>();
  for (const reading of readings) {
    const group = groups.get(reading.marker) ?? [];
    group.push(reading);
    groups.set(reading.marker, group);
  }

  const markers: MarkerTrend[] = [];
  for (const [marker, group] of groups) {
    const sorted = [...group].sort((left, right) => compareStrings(left.date, right.date));
    const firstDay = Date.parse(`${sorted[0].date}T00:00:00.000Z`);
    const xs = sorted.map((reading) => (Date.parse(`${reading.date}T00:00:00.000Z`) - firstDay) / DAY_MS);
    const ys = sorted.map((reading) => reading.value);
    const distinctDates = new Set(sorted.map((reading) => reading.date)).size;
    const rawSlopePerDay = leastSquaresSlopePerDay(xs, ys);
    const slopePer30Days = rawSlopePerDay === null
      ? null
      : Math.round(rawSlopePerDay * 30 * 100) / 100;
    const direction: TrendDirection = slopePer30Days === null
      ? 'insufficient_data'
      : slopePer30Days > 0 ? 'rising' : slopePer30Days < 0 ? 'falling' : 'stable';
    const latest = sorted[sorted.length - 1];

    markers.push({
      marker,
      unit: latest.unit,
      latest_value: latest.value,
      latest_date: latest.date,
      slope_per_30d: slopePer30Days,
      direction,
      points: sorted.length,
      distinct_dates: distinctDates,
    });
  }

  markers.sort((left, right) => compareStrings(left.marker, right.marker));
  return { markers };
}
