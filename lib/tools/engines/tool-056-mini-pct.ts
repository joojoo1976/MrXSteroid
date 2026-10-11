/**
 * Tool #056 — Mini PCT Calculator (Educational, non-prescriptive)
 * Layer 56: washout timing & monitoring for short/suppressive cycles.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15.2, §19, §40):
 *  - Computes *timing windows* from pharmacokinetics; it does NOT prescribe
 *    SERM doses. Ranges are educational and require clinical review.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface MiniPctInput {
  last_injection_iso: string;
  /** Terminal half-life of the longest ester used (days). */
  longest_half_life_days: number;
  cycle_weeks: number;
  /** Age for recovery-speed orientation. */
  age: number;
  used_hcg: boolean;
}

export interface MiniPctResult {
  washout_days: number;
  pct_start_earliest_iso: string;
  pct_start_latest_iso: string;
  pct_window_weeks: number;
  monitoring: string[];
  safety_flags: string[];
  educational_notice: string;
}

const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function planMiniPct(input: MiniPctInput): MiniPctResult {
  // ~5 half-lives → ~97% clearance (standard pharmacokinetic convention).
  const washout = round(input.longest_half_life_days * 5, 0);
  const earliest = addDays(input.last_injection_iso, washout);
  const latest = addDays(input.last_injection_iso, washout + 7);

  const flags: string[] = [];
  if (input.cycle_weeks > 12) {
    flags.push('Cycles longer than 12 weeks typically need a fuller recovery plan — clinical review advised.');
  }
  if (input.age >= 40) {
    flags.push('Age ≥40 may slow natural recovery — consider clinician-guided assessment.');
  }
  if (!input.used_hcg) {
    flags.push('No gonadotropin support recorded — discuss recovery options with a clinician.');
  }
  flags.push('This tool provides timing education only and does not prescribe SERM doses.');

  return {
    washout_days: washout,
    pct_start_earliest_iso: earliest,
    pct_start_latest_iso: latest,
    pct_window_weeks: 4,
    monitoring: ['LH', 'FSH', 'Total testosterone', 'Estradiol', 'Semen analysis (if fertility is a goal)'],
    safety_flags: flags,
    educational_notice: 'Educational timing model. This tool does not prescribe SERM doses; recovery protocols must be clinician-supervised.',
  };
}
