/**
 * Tool #046 — TRT Lifetime Calculator (Educational)
 * Layer 46: long-horizon testosterone replacement therapy modelling.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational model only. It does NOT prescribe, adjust or recommend a dose.
 *  - Outputs are *exposure/risk indices*, not clinical serum predictions.
 *  - Red-flag findings escalate to "seek clinician review".
 * ════════════════════════════════════════════════════════════════════════════
 */

export type TrtEster = 'cypionate' | 'enanthate' | 'propionate' | 'undecanoate';

export interface TrtEsterProfile {
  /** Fraction of the ester mass that is active testosterone (0–1). */
  activeFraction: number;
  /** Terminal elimination half-life in days. */
  halfLifeDays: number;
}

export const TRT_ESTER_PROFILES: Readonly<Record<TrtEster, TrtEsterProfile>> = {
  propionate: { activeFraction: 0.805, halfLifeDays: 0.8 },
  enanthate: { activeFraction: 0.717, halfLifeDays: 4.5 },
  cypionate: { activeFraction: 0.699, halfLifeDays: 5.0 },
  undecanoate: { activeFraction: 0.629, halfLifeDays: 20.9 },
};

export interface TrtLifetimeInput {
  weekly_dose_mg: number;
  ester: TrtEster;
  injection_interval_days: number;
  planned_years: number;
  age: number;
  baseline_hematocrit_pct: number;
  cardiovascular_risk_factors?: number;
}

export interface TrtLifetimeResult {
  /** Weekly active-testosterone equivalent (mg). */
  weekly_active_mg: number;
  /** Cumulative active-testosterone exposure over the horizon (grams). */
  cumulative_active_g: number;
  /** Steady-state accumulation ratio vs a single dose (peak multiplier). */
  accumulation_ratio: number;
  /** Fraction of peak remaining at end of the dosing interval (trough). */
  trough_fraction: number;
  /** 0–100 composite exposure index (educational). */
  exposure_index: number;
  /** Projected hematocrit drift (percentage points) over the horizon. */
  hematocrit_drift_pct: number;
  projected_hematocrit_pct: number;
  /** Monitoring cadence in months. */
  monitoring: {
    hematocrit_months: number;
    lipids_months: number;
    estradiol_months: number;
    psa_months: number | null;
  };
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/**
 * Deterministic, unit-testable TRT exposure model.
 * accumulation_ratio = 1 / (1 − 2^(−interval/halfLife))
 * trough_fraction    = 2^(−interval/halfLife)
 */
export function calculateTrtLifetime(input: TrtLifetimeInput): TrtLifetimeResult {
  const profile = TRT_ESTER_PROFILES[input.ester];
  const interval = Math.max(0.5, input.injection_interval_days);
  const halfLife = profile.halfLifeDays;

  const decay = Math.pow(2, -interval / halfLife);
  const accumulation = 1 / (1 - decay);
  const troughFraction = decay;

  const weeklyActive = input.weekly_dose_mg * profile.activeFraction;
  const weeks = Math.max(1, input.planned_years * 52);
  const cumulativeG = round((weeklyActive * weeks) / 1000, 3);

  // Educational exposure index: normalise to a 100 mg/week active reference.
  const exposureIndex = round(clamp((weeklyActive / 100) * 50 + (accumulation - 1) * 20, 0, 100), 1);

  // Hematocrit drift: dose- and duration-dependent, saturating.
  const years = Math.max(0, input.planned_years);
  const driftRaw = 0.9 * (weeklyActive / 100) * Math.log1p(years) * (1 + (input.cardiovascular_risk_factors ?? 0) * 0.05);
  const drift = round(clamp(driftRaw, 0, 12), 2);
  const projectedHct = round(clamp(input.baseline_hematocrit_pct + drift, 30, 65), 1);

  const flags: string[] = [];
  if (projectedHct >= 54) {
    flags.push('Projected hematocrit ≥54% — erythrocytosis risk; clinician review and possible therapeutic phlebotomy discussion.');
  } else if (projectedHct >= 52) {
    flags.push('Projected hematocrit 52–53.9% — monitor closely, discuss with a clinician.');
  }
  if (input.age >= 40) flags.push('Age ≥40 — include PSA and prostate monitoring in the review plan.');
  if ((input.cardiovascular_risk_factors ?? 0) >= 2) {
    flags.push('Multiple cardiovascular risk factors — prioritise lipid/BP optimisation with a clinician.');
  }
  if (input.injection_interval_days > halfLife * 6) {
    flags.push('Dosing interval is long relative to the ester half-life — expect wide peak/trough swings; discuss with a clinician.');
  }
  flags.push('This is an educational model, not a prescription or a substitute for clinical care.');

  return {
    weekly_active_mg: round(weeklyActive, 2),
    cumulative_active_g: cumulativeG,
    accumulation_ratio: round(accumulation, 3),
    trough_fraction: round(troughFraction, 4),
    exposure_index: exposureIndex,
    hematocrit_drift_pct: drift,
    projected_hematocrit_pct: projectedHct,
    monitoring: {
      hematocrit_months: projectedHct >= 52 ? 3 : 6,
      lipids_months: 6,
      estradiol_months: 6,
      psa_months: input.age >= 40 ? 12 : null,
    },
    safety_flags: flags,
    educational_notice:
      'Educational model for informed discussion with a qualified clinician. Not medical advice.',
  };
}
