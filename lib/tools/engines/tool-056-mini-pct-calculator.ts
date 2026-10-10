/**
 * Tool #056 — Mini PCT Calculator
 * Short PCT window estimator. Deterministic scheduling math over documented
 * washout windows (19-nor 21d / aromatizing 14d / oral 7d, +7d long-cycle
 * extension), never a prescription. Pure engine, no I/O.
 */

export interface MiniPctInput {
  compound_class: '19nor' | 'aromatizing' | 'oral';
  cycle_weeks: number; // 1..52
  last_dose_days_ago: number; // 0..365
}

export interface MiniPctResult {
  washout_days: number; // days from last dose until PCT start
  pct_duration_days: number;
  start_in_days: number; // 0 = window already open
  band: 'window-pending' | 'window-open';
  warnings: string[];
}

const BASE_WASHOUT: Record<MiniPctInput['compound_class'], number> = {
  '19nor': 21,
  aromatizing: 14,
  oral: 7,
};

export function planMiniPct(input: MiniPctInput): MiniPctResult {
  const { compound_class, cycle_weeks, last_dose_days_ago } = input;
  const warnings: string[] = ['educational_not_a_prescription'];

  const long_cycle = cycle_weeks > 8;
  if (long_cycle) warnings.push('long_cycle_extended_washout');

  const washout_days = BASE_WASHOUT[compound_class] + (long_cycle ? 7 : 0);
  const pct_duration_days = 28 + (cycle_weeks >= 12 ? 14 : 0);
  const start_in_days = Math.max(0, washout_days - last_dose_days_ago);

  return {
    washout_days,
    pct_duration_days,
    start_in_days,
    band: start_in_days === 0 ? 'window-open' : 'window-pending',
    warnings: [...new Set(warnings)],
  };
}
