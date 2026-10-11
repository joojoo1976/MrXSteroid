/**
 * Tool #061 — Hair Loss Tracker (Educational)
 * Layer 61: longitudinal hair-density tracking & progression-rate education.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Tracking aid only; NOT a diagnosis of androgenetic alopecia.
 *  - Never recommends minoxidil/finasteride/doses.
 *  - Rapid diffuse shedding escalates to clinical review.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface HairLossEntry {
  /** Months since the first entry (0 = baseline). */
  month: number;
  /** Density/quality score 0–100 (higher = more hair). */
  density_score: number;
}

export interface HairLossInput {
  entries: HairLossEntry[];
  /** Visible recession stage (Norwood-style 1–7, educational orientation). */
  norwood_stage: number;
  /** Reported daily shedding (strands/day, approximate). */
  daily_shed_strands: number;
  /** Recent major stressor/illness in the last 3 months. */
  recent_stressor: boolean;
  /** Scalp itching/inflammation reported. */
  scalp_inflammation: boolean;
}

export interface HairLossResult {
  baseline_score: number;
  latest_score: number;
  /** Absolute change (latest − baseline). Negative = loss. */
  absolute_change: number;
  /** Percentage change vs baseline. */
  percent_change: number;
  /** Least-squares slope in score points per month. */
  slope_per_month: number;
  trend: 'improving' | 'stable' | 'slow-progression' | 'rapid-progression';
  contributing_factors: string[];
  education: string[];
  clinical_review_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** Least-squares slope of y over x; returns 0 when under-determined. */
export function linearSlope(points: { x: number; y: number }[]): number {
  const n = points.length;
  if (n < 2) return 0;
  const meanX = points.reduce((a, p) => a + p.x, 0) / n;
  const meanY = points.reduce((a, p) => a + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.x - meanX) * (p.y - meanY);
    den += (p.x - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

export function assessHairLoss(input: HairLossInput): HairLossResult {
  const entries = [...input.entries].sort((a, b) => a.month - b.month);
  const factors: string[] = [];
  const education: string[] = [];
  const flags: string[] = [];

  const baseline = entries.length ? entries[0].density_score : 0;
  const latest = entries.length ? entries[entries.length - 1].density_score : 0;
  const absolute = latest - baseline;
  const percent = baseline > 0 ? (absolute / baseline) * 100 : 0;

  const slope = linearSlope(entries.map((e) => ({ x: e.month, y: e.density_score })));

  let trend: HairLossResult['trend'];
  if (slope >= 0.5) trend = 'improving';
  else if (slope > -0.75) trend = 'stable';
  else if (slope > -2.5) trend = 'slow-progression';
  else trend = 'rapid-progression';

  factors.push(`Density changed by ${round(absolute, 1)} points (${round(percent, 1)}%) from baseline to latest.`);
  factors.push(`Estimated slope: ${round(slope, 2)} density points per month.`);
  factors.push(`Norwood-style stage entered: ${round(clamp(input.norwood_stage, 1, 7), 0)}/7.`);

  if (input.daily_shed_strands > 100) {
    factors.push('Shedding above ~100 strands/day is often considered increased.');
  }
  if (input.recent_stressor) {
    factors.push('A major stressor/illness 2–3 months ago can cause temporary telogen shedding.');
    education.push('Telogen effluvium is usually temporary and often reverses once the trigger resolves.');
  }
  if (input.scalp_inflammation) {
    factors.push('Scalp itching/inflammation was reported.');
    flags.push('scalp_inflammation');
  }

  let advised = false;
  if (trend === 'rapid-progression') {
    advised = true;
    flags.push('rapid_progression');
  }
  if (input.daily_shed_strands > 150 && input.recent_stressor === false) {
    advised = true;
    flags.push('high_unexplained_shedding');
  }
  if (input.scalp_inflammation) advised = true;

  education.push('Androgenetic alopecia is progressive; patterns matter more than a single measurement.');
  education.push('Consistent monthly photos and the same lighting improve tracking reliability.');
  education.push('This tool never recommends minoxidil, finasteride or any dose.');

  return {
    baseline_score: round(baseline, 1),
    latest_score: round(latest, 1),
    absolute_change: round(absolute, 1),
    percent_change: round(percent, 1),
    slope_per_month: round(slope, 2),
    trend,
    contributing_factors: factors,
    education,
    clinical_review_advised: advised,
    safety_flags: flags,
    educational_notice:
      'Educational tracking aid only. Hair-loss diagnosis requires clinical examination and, when relevant, trichoscopy; this tool does not diagnose or treat.',
  };
}
