/**
 * Tool #042 — Estrogen Management Pro
 * Estradiol (E2, sensitive assay) banding + AI dose-delta guidance.
 * Reference: adult male optimal band 10–40 pg/mL (sensitive assay).
 * Heuristic is deterministic and documented; it NEVER prescribes — it
 * suggests only the direction/size of an EXISTING AI titration for clinician
 * review, and flags the prescriber boundary explicitly.
 */

export interface EstrogenInput {
  e2_pg_ml: number; // 5..500
  weekly_testosterone_mg: number; // 0..1000
  taking_ai: boolean;
  weekly_ai_dose_mg: number; // 0..7 (anastrozole-equivalent)
  symptoms: Array<'nipple_sensitivity' | 'water_retention' | 'mood_swings' | 'low_libido' | 'edema'>; // 0..10
  body_fat_pct: number; // 5..60
}

export type EstrogenBand = 'low' | 'optimal' | 'elevated' | 'high';
export type EstrogenAction = 'none' | 'monitor' | 'adjust_ai' | 'reduce_test';

export interface EstrogenResult {
  band: EstrogenBand;
  optimal_range: { low: number; high: number };
  ai_delta_mg: number; // suggested change to the CURRENT weekly AI dose (±0.25 steps, |Δ| ≤ 1)
  action: EstrogenAction;
  warnings: string[];
}

const OPTIMAL_LOW = 10;
const OPTIMAL_HIGH = 40;

export function manageEstrogen(input: EstrogenInput): EstrogenResult {
  const { e2_pg_ml, taking_ai, weekly_ai_dose_mg, symptoms } = input;
  const warnings: string[] = [];
  const symptomLoad = symptoms.length;

  let band: EstrogenBand =
    e2_pg_ml > 60 ? 'high'
    : e2_pg_ml > OPTIMAL_HIGH ? 'elevated'
    : e2_pg_ml < OPTIMAL_LOW ? 'low'
    : 'optimal';
  // Symptom load escalates an in-range reading (lab + clinical picture).
  if (band === 'optimal' && symptomLoad >= 2) band = 'elevated';

  // AI delta guidance — only ever adjusts an EXISTING AI dose, capped ±1 mg/wk
  // in 0.25 mg steps; starting an AI from scratch is never suggested here.
  let aiDelta = 0;
  if (taking_ai && weekly_ai_dose_mg > 0) {
    if (band === 'high') aiDelta = 0.5;
    else if (band === 'elevated') aiDelta = 0.25;
    else if (band === 'low') aiDelta = -0.25;
  }

  let action: EstrogenAction = 'none';
  if (band === 'high') action = taking_ai ? 'adjust_ai' : 'reduce_test';
  else if (band === 'elevated') action = taking_ai ? 'adjust_ai' : 'monitor';
  else if (band === 'low' && taking_ai && weekly_ai_dose_mg > 0) action = 'adjust_ai';
  else if (band === 'optimal' && symptomLoad >= 2) action = 'monitor';

  if (band === 'high' && !taking_ai) warnings.push('elevated_e2_without_ai_discuss_with_prescriber');
  if (band === 'low' && taking_ai && weekly_ai_dose_mg > 0) warnings.push('ai_may_be_overshooting');
  if (band === 'low' && !taking_ai) warnings.push('low_e2_without_ai_check_prolactin_lh');
  if (e2_pg_ml > 100) warnings.push('e2_extreme_seek_physician');

  return {
    band,
    optimal_range: { low: OPTIMAL_LOW, high: 40 },
    ai_delta_mg: aiDelta,
    action,
    warnings: [...new Set(warnings)].slice(0, 8),
  };
}
