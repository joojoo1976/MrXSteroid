/**
 * Tool #033 — Bloodwork Trend Analyzer
 * Least-squares trend slopes per marker + range flags + velocity alerts.
 * Pure calculation engine (no I/O, no DB).
 */

export interface LabReading {
  marker: string;
  value: number;
  unit: string;
  /** ISO-8601 date of the draw. */
  date: string;
}

export interface MarkerRange {
  low: number;
  high: number;
  unit: string;
}

export interface TrendAnalyzerInput {
  readings: LabReading[];
  ranges: Record<string, MarkerRange>;
}

export type TrendDirection = 'rising' | 'falling' | 'stable';

export interface MarkerTrend {
  marker: string;
  unit: string;
  latest_value: number;
  latest_date: string;
  slope_per_30d: number;
  direction: TrendDirection;
  in_range: boolean;
  velocity_alert: boolean;
  points: number;
}

export interface TrendAnalyzerResult {
  markers: MarkerTrend[];
  summary: string[];
}

const DAY_MS = 86400000;

function leastSquaresSlope(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) * (xs[i] - meanX);
  }
  return den === 0 ? 0 : num / den;
}

export function analyzeBloodworkTrends(input: TrendAnalyzerInput): TrendAnalyzerResult {
  const { readings, ranges } = input;
  const summary: string[] = [];

  // 33.1 Group readings per marker, sorted by date
  const groups = new Map<string, LabReading[]>();
  for (const r of readings) {
    if (!Number.isFinite(r.value)) continue;
    const t = Date.parse(r.date);
    if (Number.isNaN(t)) continue;
    const list = groups.get(r.marker) ?? [];
    list.push(r);
    groups.set(r.marker, list);
  }

  const markers: MarkerTrend[] = [];
  for (const [marker, list] of groups) {
    const sorted = [...list].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const t0 = Date.parse(sorted[0].date);
    const xs = sorted.map((r) => (Date.parse(r.date) - t0) / DAY_MS);
    const ys = sorted.map((r) => r.value);
    const slopePerDay = leastSquaresSlope(xs, ys);
    const slopePer30d = Math.round(slopePerDay * 30 * 100) / 100;

    const range = ranges[marker];
    const latest = sorted[sorted.length - 1];
    const inRange = range ? latest.value >= range.low && latest.value <= range.high : true;

    // 33.2 Direction: slope must exceed 2% of range width (or 2% of value) per 30d
    const scale = range ? range.high - range.low : Math.abs(latest.value) || 1;
    const threshold = Math.max(scale * 0.02, 1e-9);
    const direction: TrendDirection =
      slopePer30d > threshold ? 'rising' : slopePer30d < -threshold ? 'falling' : 'stable';

    // 33.3 Velocity alert: 30-day move larger than 25% of range width
    const velocityAlert = range ? Math.abs(slopePer30d) > (range.high - range.low) * 0.25 : false;

    markers.push({
      marker,
      unit: latest.unit,
      latest_value: latest.value,
      latest_date: latest.date.slice(0, 10),
      slope_per_30d: slopePer30d,
      direction,
      in_range: inRange,
      velocity_alert: velocityAlert,
      points: sorted.length,
    });

    if (!inRange) summary.push(`${marker}: latest ${latest.value} ${latest.unit} is OUT of range`);
    if (velocityAlert) summary.push(`${marker}: rapid ${direction} move (${slopePer30d}/30d) — retest soon`);
  }

  markers.sort((a, b) => a.marker.localeCompare(b.marker));
  if (markers.length === 0) summary.push('No valid readings — add marker, value and date');
  else if (summary.length === 0) summary.push('All tracked markers stable and within range');

  return { markers, summary };
}
