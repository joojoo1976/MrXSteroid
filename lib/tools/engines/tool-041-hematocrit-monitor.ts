/**
 * Tool #041 — Hematocrit Monitor
 * RBC/hematocrit trend tracking with threshold projection. Documented
 * reference bands (adult male upper ~50%, female ~44.5%; intervention line
 * at the standard therapeutic-donation trigger zone). Pure engine, no I/O.
 */

export interface HctReading {
  hct_pct: number; // 20..70
  date: string; // ISO-8601 draw date
}

export interface HematocritInput {
  readings: HctReading[]; // 2..24 readings, any order (sorted internally)
  sex: 'male' | 'female';
  on_cycle: boolean;
  weeks_remaining: number; // 0..52
}

export type HctBand = 'normal' | 'borderline' | 'high' | 'very-high';

export interface HematocritResult {
  latest_hct_pct: number;
  baseline_hct_pct: number;
  slope_per_30d: number; // percentage points per 30 days (least squares)
  band: HctBand;
  projected_threshold_date: string | null; // ISO date crossing the intervention line
  donate_eligible: boolean;
  warnings: string[];
}

/** Intervention line: standard therapeutic-donation trigger zone. */
const INTERVENE: Record<HematocritInput['sex'], number> = { male: 54, female: 48 };
/** Lab upper reference (athletes monitored on-cycle widen via bands below). */
const UPPER: Record<HematocritInput['sex'], number> = { male: 50, female: 44.5 };
const MS_PER_30D = 30 * 24 * 3600 * 1000;

export function monitorHematocrit(input: HematocritInput): HematocritResult {
  const { readings, sex, on_cycle } = input;
  const warnings: string[] = [];
  const pts = readings
    .map((r) => ({ t: Date.parse(r.date), v: r.hct_pct }))
    .filter((p) => !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);

  if (pts.length === 0) {
    return {
      latest_hct_pct: 0, baseline_hct_pct: 0, slope_per_30d: 0,
      band: 'normal', projected_threshold_date: null, donate_eligible: false,
      warnings: ['no_valid_readings'],
    };
  }

  const baseline = pts[0].v;
  const latest = pts[pts.length - 1].v;

  // Least-squares slope expressed in percentage points per 30 days.
  let slope = 0;
  if (pts.length >= 2) {
    const n = pts.length;
    const mx = pts.reduce((s, p) => s + p.t, 0) / n;
    const my = pts.reduce((s, p) => s + p.v, 0) / n;
    const cov = pts.reduce((s, p) => s + (p.t - mx) * (p.v - my), 0);
    const varx = pts.reduce((s, p) => s + (p.t - mx) * (p.t - mx), 0);
    slope = varx === 0 ? 0 : (cov / varx) * MS_PER_30D;
  }

  const upper = UPPER[sex];
  const intervene = INTERVENE[sex];
  const band: HctBand =
    latest > intervene ? 'very-high'
    : latest > upper + 2 ? 'high'
    : latest > upper ? 'borderline'
    : 'normal';

  // Projection: linear trend crossing the intervention line — only when the
  // crossing lands within a 180-day monitoring horizon (beyond that the
  // linear extrapolation is noise, not guidance).
  let projected: string | null = null;
  if (pts.length >= 2 && slope > 0 && latest < intervene) {
    const ms = ((intervene - latest) / slope) * MS_PER_30D;
    if (ms <= 180 * 24 * 3600 * 1000) {
      projected = new Date(pts[pts.length - 1].t + ms).toISOString().slice(0, 10);
    }
  }

  if (on_cycle && band !== 'normal') warnings.push('on_cycle_elevated_hct');
  if (slope > 1.5) warnings.push('rising_trend_30d');
  if (latest > intervene) warnings.push('above_intervention_line_seek_physician');

  return {
    latest_hct_pct: latest,
    baseline_hct_pct: baseline,
    slope_per_30d: Math.round(slope * 100) / 100,
    band,
    projected_threshold_date: projected,
    donate_eligible: latest >= intervene - 1,
    warnings: [...new Set(warnings)].slice(0, 8),
  };
}
