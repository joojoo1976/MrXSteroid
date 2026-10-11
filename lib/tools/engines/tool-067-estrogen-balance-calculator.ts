/**
 * Tool #067 — Estrogen Balance Calculator
 * Analyzes circulating Estradiol (E2) relative to Total Testosterone (T).
 * Calculates the T:E2 ratio (pg/mL : pg/mL equivalent or ng/dL : pg/mL basis).
 * Standard physiological balance target: Total T (ng/dL) to E2 (pg/mL) ratio between 14:1 and 30:1.
 * Pure deterministic educational engine.
 */

export interface EstrogenBalanceInput {
  total_testosterone_ng_dl: number; // 100..3000
  estradiol_pg_ml: number; // 5..250
}

export interface EstrogenBalanceResult {
  t_to_e2_ratio: number;
  balance_band: 'estrogen-dominant' | 'balanced-optimal' | 'androgen-dominant-low-e2';
  warnings: string[];
}

export function calculateEstrogenBalance(input: EstrogenBalanceInput): EstrogenBalanceResult {
  const { total_testosterone_ng_dl, estradiol_pg_ml } = input;
  const warnings: string[] = ['educational_hormonal_balance_screen'];

  const t_to_e2_ratio = Math.round((total_testosterone_ng_dl / estradiol_pg_ml) * 10) / 10;

  if (estradiol_pg_ml < 15) {
    warnings.push('low_e2_joint_cardio_risk');
  }
  if (estradiol_pg_ml > 60) {
    warnings.push('elevated_e2_monitoring_recommended');
  }

  let balance_band: EstrogenBalanceResult['balance_band'];
  if (t_to_e2_ratio < 14) {
    balance_band = 'estrogen-dominant';
    warnings.push('relative_estrogen_dominance');
  } else if (t_to_e2_ratio <= 30) {
    balance_band = 'balanced-optimal';
  } else {
    balance_band = 'androgen-dominant-low-e2';
    warnings.push('relative_androgen_excess_or_crushed_e2');
  }

  return {
    t_to_e2_ratio,
    balance_band,
    warnings: [...new Set(warnings)],
  };
}
