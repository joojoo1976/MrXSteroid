/**
 * Tool #068 — Gynecomastia Tracker (Educational)
 * Layer 68: longitudinal gynecomastia stage/size tracking + escalation.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Tracking aid only; NOT a diagnosis (true gynecomastia vs pseudogynecomastia
 *    requires clinical examination).
 *  - Rapid or painful growth escalates to prompt clinical review.
 *  - Never recommends SERMs, aromatase inhibitors or any dose.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface GynecomastiaEntry {
  /** Months since the first entry (0 = baseline). */
  month: number;
  /** Simon-style stage 1–4 (educational orientation). */
  stage: number;
  /** Diameter of glandular tissue (mm). */
  size_mm: number;
  /** Tender/painful on palpation. */
  tender: boolean;
}

export interface GynecomastiaInput {
  entries: GynecomastiaEntry[];
  /** Unilateral vs bilateral (context only). */
  unilateral: boolean;
  /** Nipple discharge present. */
  nipple_discharge: boolean;
  /** Exogenous androgen/AAS exposure reported. */
  androgen_exposure: boolean;
}

export interface GynecomastiaResult {
  baseline_size_mm: number;
  latest_size_mm: number;
  /** Size change in mm/month (least-squares slope). */
  size_slope_mm_per_month: number;
  stage_change: number;
  current_stage: number;
  trend: 'regressing' | 'stable' | 'slow-progression' | 'rapid-progression';
  contributing_factors: string[];
  education: string[];
  urgent_review_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

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

export function assessGynecomastia(input: GynecomastiaInput): GynecomastiaResult {
  const entries = [...input.entries].sort((a, b) => a.month - b.month);
  const factors: string[] = [];
  const education: string[] = [];
  const flags: string[] = [];

  const baseline = entries.length ? entries[0].size_mm : 0;
  const latest = entries.length ? entries[entries.length - 1].size_mm : 0;
  const stageChange = entries.length ? entries[entries.length - 1].stage - entries[0].stage : 0;
  const currentStage = entries.length ? clamp(entries[entries.length - 1].stage, 1, 4) : 1;

  const slope = linearSlope(entries.map((e) => ({ x: e.month, y: e.size_mm })));

  let trend: GynecomastiaResult['trend'];
  if (slope <= -1) trend = 'regressing';
  else if (slope < 1) trend = 'stable';
  else if (slope < 10) trend = 'slow-progression';
  else trend = 'rapid-progression';

  factors.push(`Size changed from ${round(baseline, 0)} mm to ${round(latest, 0)} mm.`);
  factors.push(`Estimated growth rate ${round(slope, 1)} mm/month; stage change ${round(stageChange, 0)}.`);
  if (input.unilateral) factors.push('Unilateral presentation is reported.');

  const latestTender = entries.length ? entries[entries.length - 1].tender : false;
  const anyTender = entries.some((e) => e.tender);

  let urgent = false;
  if (trend === 'rapid-progression') {
    urgent = true;
    flags.push('rapid_growth');
  }
  if (latestTender && !anyTenderBefore(entries)) {
    flags.push('new_tenderness');
  }
  if (latestTender) {
    urgent = true;
    flags.push('tender_tissue');
  }
  if (input.nipple_discharge) {
    urgent = true;
    flags.push('nipple_discharge');
    education.push('Nipple discharge requires prompt clinical assessment — seek care without delay.');
  }
  if (currentStage >= 3) {
    urgent = true;
    flags.push('advanced_stage');
  }
  if (input.androgen_exposure) {
    flags.push('androgen_exposure');
    education.push('Exogenous androgen exposure is a common reversible driver of gynecomastia.');
  }

  education.push('True gynecomastia is glandular tissue; pseudogynecomastia is adipose tissue — only examination distinguishes them.');
  education.push('Early glandular gynecomastia is more likely to resolve; longstanding fibrous tissue less so.');
  education.push('This tool never recommends a SERM, aromatase inhibitor or dose.');

  return {
    baseline_size_mm: round(baseline, 0),
    latest_size_mm: round(latest, 0),
    size_slope_mm_per_month: round(slope, 1),
    stage_change: round(stageChange, 0),
    current_stage: round(currentStage, 0),
    trend,
    contributing_factors: factors,
    education,
    urgent_review_advised: urgent,
    safety_flags: flags,
    educational_notice:
      'Educational tracking aid only. Gynecomastia requires clinical examination and investigation; this tool does not diagnose and never prescribes treatment.',
  };
}

/** True when tenderness is newly present at the last entry (previous entries were not tender). */
function anyTenderBefore(entries: GynecomastiaEntry[]): boolean {
  return entries.slice(0, -1).some((e) => e.tender);
}
