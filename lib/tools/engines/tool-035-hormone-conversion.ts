/**
 * Tool #035 — Hormone Conversion Calculator
 * Testosterone → estradiol aromatization estimate + free-T band + AI guidance.
 * Documented heuristic model (clearly labeled estimates, not lab values).
 * Pure calculation engine (no I/O, no DB).
 */

export interface ConversionInput {
  weekly_test_mg: number;
  body_fat_pct: number;
  age: number;
  /** Current AI dose in mg/week (aromatase inhibitor), 0 if none. */
  ai_dose_mg_per_week?: number;
}

export type E2Status = 'low' | 'optimal' | 'high' | 'very-high';

export interface ConversionResult {
  estimated_total_t_ng_dl: number;
  estimated_e2_pg_ml: number;
  e2_status: E2Status;
  test_to_e2_ratio: number;
  ai_suggestion_mg_per_week: number;
  warnings: string[];
}

export function calculateHormoneConversion(input: ConversionInput): ConversionResult {
  const { weekly_test_mg, body_fat_pct, age, ai_dose_mg_per_week = 0 } = input;
  const warnings: string[] = [];

  // 35.1 Total-T response: ~4.5 ng/dL per mg/week (population average, documented estimate)
  const estimatedTotalT = Math.round(weekly_test_mg * 4.5 + 250);

  // 35.2 Aromatization: base rate scaled by adiposity, reduced by AI
  // e2 = base + dose*rate*bfFactor - aiEffect, clamped to plausible range
  const bfFactor = 1 + Math.max(-0.3, (body_fat_pct - 15) * 0.03);
  const rawE2 = 12 + weekly_test_mg * 0.045 * bfFactor - ai_dose_mg_per_week * 2.5;
  const estimatedE2 = Math.round(Math.max(5, Math.min(120, rawE2)) * 10) / 10;

  // 35.3 Status bands (male reference, pg/mL)
  let e2Status: E2Status;
  if (estimatedE2 < 20) e2Status = 'low';
  else if (estimatedE2 <= 40) e2Status = 'optimal';
  else if (estimatedE2 <= 60) e2Status = 'high';
  else e2Status = 'very-high';

  const ratio = Math.round((estimatedTotalT / Math.max(1, estimatedE2)) * 10) / 10;

  // 35.4 AI suggestion: proportional correction toward 30 pg/mL, capped
  let aiSuggestion = 0;
  if (estimatedE2 > 40) {
    aiSuggestion = Math.round(Math.min(7, (estimatedE2 - 30) * 0.08) * 2) / 2;
    warnings.push(`E2 ${estimatedE2} pg/mL is elevated — suggested AI start ~${aiSuggestion} mg/week, confirm with bloodwork in 2-3 weeks`);
  } else if (estimatedE2 < 20 && ai_dose_mg_per_week > 0) {
    warnings.push(`E2 ${estimatedE2} pg/mL is low while on AI (${ai_dose_mg_per_week} mg/wk) — consider reducing AI to protect lipids and mood`);
  } else {
    warnings.push(`E2 ${estimatedE2} pg/mL in range — maintain current protocol`);
  }

  if (body_fat_pct > 25) {
    warnings.push('Body fat > 25% amplifies aromatization — fat loss is the highest-leverage E2 intervention');
  }
  if (age >= 40 && weekly_test_mg > 200) {
    warnings.push('Age 40+ on supra-physiological dose — monitor hematocrit, PSA and blood pressure');
  }
  warnings.push('Heuristic estimates only — always confirm with serum labs before changing medication');

  return {
    estimated_total_t_ng_dl: estimatedTotalT,
    estimated_e2_pg_ml: estimatedE2,
    e2_status: e2Status,
    test_to_e2_ratio: ratio,
    ai_suggestion_mg_per_week: aiSuggestion,
    warnings,
  };
}
