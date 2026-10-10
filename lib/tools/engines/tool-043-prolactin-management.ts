/**
 * Tool #043 — Prolactin Management Pro
 * Prolactin banding with 19-nor awareness and cabergoline titration hints.
 * Reference: adult male normal < 15 ng/mL (athlete labs tolerate ~20).
 * Deterministic + documented; cabergoline hints are for prescriber review only.
 */

export interface ProlactinInput {
  prolactin_ng_ml: number; // 0.5..200
  uses_19_nor: boolean; // nandrolone/trenbolone raise prolactin
  weekly_cabergoline_mcg: number; // 0..1000 current dose
  symptoms: Array<'libido_loss' | 'edema' | 'galactorrhea' | 'mood_low'>; // 0..8
}

export type ProlactinBand = 'normal' | 'borderline' | 'high' | 'very-high';
export type ProlactinAction = 'none' | 'monitor' | 'start_low' | 'adjust' | 'pause' | 'seek_physician';

export interface ProlactinResult {
  band: ProlactinBand;
  suggested_weekly_mcg: number;
  action: ProlactinAction;
  warnings: string[];
}

export function manageProlactin(input: ProlactinInput): ProlactinResult {
  const { prolactin_ng_ml, uses_19_nor, weekly_cabergoline_mcg, symptoms } = input;
  const warnings: string[] = [];

  const band: ProlactinBand =
    prolactin_ng_ml > 50 ? 'very-high'
    : prolactin_ng_ml > 25 ? 'high'
    : prolactin_ng_ml > 20 ? 'borderline'
    : 'normal';

  if (uses_19_nor) warnings.push('19nor_compounds_raise_prolactin');
  if (prolactin_ng_ml > 100) warnings.push('prolactin_extreme_imaging_discussed_with_physician');

  let suggested = 0;
  let action: ProlactinAction = 'none';

  if (band === 'very-high') {
    suggested = 375;
    action = weekly_cabergoline_mcg === 0 ? 'start_low' : 'adjust';
    if (symptoms.length >= 2) warnings.push('symptomatic_hyperprolactinemia');
  } else if (band === 'high') {
    suggested = 250;
    action = weekly_cabergoline_mcg === 0 ? 'start_low' : 'adjust';
  } else if (band === 'borderline') {
    suggested = 0;
    action = 'monitor';
    if (uses_19_nor && symptoms.length >= 1) warnings.push('symptoms_with_borderline_prolactin');
  } else {
    // normal
    if (weekly_cabergoline_mcg > 0 && prolactin_ng_ml < 8) {
      suggested = 0;
      action = 'pause';
      warnings.push('cabergoline_pause_candidate_prescriber_review');
    } else if (symptoms.length >= 2) {
      action = 'monitor';
      warnings.push('symptoms_with_normal_prolactin_check_e2');
    }
  }

  return {
    band,
    suggested_weekly_mcg: suggested,
    action,
    warnings: [...new Set(warnings)].slice(0, 8),
  };
}
