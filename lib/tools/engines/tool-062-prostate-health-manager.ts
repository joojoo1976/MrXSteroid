/**
 * Tool #062 — Prostate Health Manager
 * PSA trend and age-specific screening guide. Published age-specific ceilings
 * (educational): <40 → 2.0, 40–49 → 2.5, 50–59 → 3.5, 60–69 → 4.5, ≥70 → 6.5.
 * Screening context only — PSA is not a diagnosis. Pure engine, no I/O.
 */

export interface ProstateHealthInput {
  age: number; // 30..90
  psa_ng_ml: number; // 0..50
  psa_prev_1y_ng_ml?: number; // optional, treated as the value one year ago
}

export interface ProstateHealthResult {
  psa_ceiling: number;
  psa_delta_1y: number | null;
  band: 'age-normal' | 'above-age-ceiling' | 'notably-elevated';
  warnings: string[];
}

export function assessProstateHealth(input: ProstateHealthInput): ProstateHealthResult {
  const { age, psa_ng_ml, psa_prev_1y_ng_ml } = input;
  const warnings: string[] = ['educational_screening_not_diagnosis'];

  const ceiling = agePsaCeiling(age);
  const delta = typeof psa_prev_1y_ng_ml === 'number' ? Math.round((psa_ng_ml - psa_prev_1y_ng_ml) * 100) / 100 : null;

  if (psa_ng_ml > ceiling) warnings.push('psa_above_age_reference');
  if (delta !== null && delta > 0.75) warnings.push('rapid_psa_rise_see_urologist');

  const band: ProstateHealthResult['band'] =
    psa_ng_ml <= ceiling ? 'age-normal' : psa_ng_ml <= ceiling * 2 ? 'above-age-ceiling' : 'notably-elevated';

  return {
    psa_ceiling: ceiling,
    psa_delta_1y: delta,
    band,
    warnings: [...new Set(warnings)],
  };
}

function agePsaCeiling(age: number): number {
  if (age < 40) return 2;
  if (age < 50) return 2.5;
  if (age < 60) return 3.5;
  if (age < 70) return 4.5;
  return 6.5;
}
