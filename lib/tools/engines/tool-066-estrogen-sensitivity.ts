/**
 * Tool #066 — Estrogen Sensitivity Manager (Educational)
 * Layer 66: symptom-weighted estrogen-sensitivity index.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational symptom index; NOT a diagnosis.
 *  - Never recommends aromatase inhibitors, SERMs or any dose.
 *  - Painful breast changes / severe symptoms escalate to clinical review.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface EstrogenSensitivityInput {
  /** Each symptom scored 0–3. */
  water_retention: number;
  nipple_sensitivity: number;
  mood_swings: number;
  libido_change: number;
  bloating: number;
  joint_aches: number;
  /** Estradiol (pg/mL). */
  estradiol_pg_ml: number;
  /** Body-fat percentage (context for aromatisation). */
  body_fat_pct: number;
  /** Breast tissue is painful/tender on palpation. */
  painful_breast_changes: boolean;
}

export interface EstrogenSensitivityResult {
  /** 0–100 symptom-weighted sensitivity index. */
  estrogen_sensitivity_index: number;
  symptom_burden: number; // 0–18
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  education: string[];
  clinical_review_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clampItem = (v: number) => Math.min(3, Math.max(0, Math.round(v)));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export function assessEstrogenSensitivity(input: EstrogenSensitivityInput): EstrogenSensitivityResult {
  const items = [
    input.water_retention,
    input.nipple_sensitivity,
    input.mood_swings,
    input.libido_change,
    input.bloating,
    input.joint_aches,
  ].map(clampItem);

  const burden = items.reduce((a, b) => a + b, 0); // 0–18
  const factors: string[] = [`Symptom burden ${burden}/18 across six estrogen-associated domains.`];
  const education: string[] = [];
  const flags: string[] = [];

  // Symptom component (0–70) + lab/context component (0–30).
  let score = (burden / 18) * 70;

  const e2 = clamp(input.estradiol_pg_ml, 0, 500);
  if (e2 > 60) {
    score += 15;
    factors.push('Estradiol is above the common male reference band.');
  } else if (e2 >= 15 && e2 <= 40) {
    score += 8;
    factors.push('Estradiol is within a common reference band.');
  } else if (e2 < 10 && e2 > 0) {
    score += 3;
    factors.push('Estradiol is low; low-estrogen symptoms are also possible.');
  }

  const bf = clamp(input.body_fat_pct, 3, 60);
  if (bf > 25) {
    score += clamp((bf - 25) * 0.4, 0, 12);
    factors.push('Higher body fat raises the aromatisation context.');
  }

  const index = round(clamp(score, 0, 100), 0);
  const band: EstrogenSensitivityResult['band'] = index >= 65 ? 'high' : index >= 35 ? 'moderate' : 'low';

  if (band === 'high') flags.push('high_symptom_burden');
  if (clampItem(input.nipple_sensitivity) >= 2) flags.push('nipple_sensitivity');
  if (clampItem(input.joint_aches) >= 2) flags.push('joint_symptoms');

  let advised = band === 'high' || clampItem(input.nipple_sensitivity) >= 3;
  if (input.painful_breast_changes) {
    advised = true;
    flags.push('painful_breast_changes');
    education.push('Painful or rapidly enlarging breast tissue needs a clinical assessment — seek care promptly.');
  }

  education.push('Estrogen sensitivity is a symptom pattern; it is not measured by a single lab value.');
  education.push('Water retention, nipple sensitivity and mood shifts overlap with many other causes.');
  education.push('This tool never recommends an aromatase inhibitor, SERM or dose.');

  return {
    estrogen_sensitivity_index: index,
    symptom_burden: burden,
    band,
    contributing_factors: factors,
    education,
    clinical_review_advised: advised,
    safety_flags: flags,
    educational_notice:
      'Educational symptom index only. It is not a diagnosis and never recommends medication or doses; persistent or painful symptoms need clinical review.',
  };
}
