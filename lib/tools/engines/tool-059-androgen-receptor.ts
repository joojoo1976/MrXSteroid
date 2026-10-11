/**
 * Tool #059 — Androgen Receptor Optimizer (Educational)
 * Layer 59: lifestyle/genetic contributors to androgen-receptor signalling.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index from lifestyle/genetic inputs only.
 *  - NO drugs, NO supplements, NO doses — ever.
 *  - Index is a heuristic, not a receptor assay.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface AndrogenReceptorInput {
  age: number;
  /** Average nightly sleep (hours). */
  sleep_hours: number;
  /** Resistance-training sessions per week. */
  resistance_training_days: number;
  /** Body-fat percentage. */
  body_fat_pct: number;
  /** Protein intake (g per kg bodyweight per day). */
  protein_g_per_kg: number;
  /** Perceived stress (1 = calm, 10 = extreme). */
  stress_level: number;
  /** Vitamin D (ng/mL). */
  vitamin_d_ng_ml: number;
  /** Optional: AR CAG-repeat length (9–40). Shorter = higher signalling (educational). */
  ar_cag_repeats: number;
}

export interface AndrogenReceptorResult {
  /** 0–100 heuristic index (higher = more favourable signalling context). */
  ar_sensitivity_index: number;
  band: 'suboptimal' | 'moderate' | 'favourable';
  contributing_factors: string[];
  education: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export function assessAndrogenReceptor(input: AndrogenReceptorInput): AndrogenReceptorResult {
  let score = 55;
  const factors: string[] = [];
  const education: string[] = [];
  const flags: string[] = [];

  // Sleep: optimal 7–9 h.
  const sleep = clamp(input.sleep_hours, 0, 14);
  if (sleep >= 7 && sleep <= 9) {
    score += 12;
    factors.push('Sleep duration is in the 7–9 h range associated with normal androgen rhythms.');
  } else if (sleep >= 6) {
    score -= 4;
    factors.push('Sleep is slightly short of the 7–9 h range.');
  } else {
    score -= 12;
    factors.push('Chronic short sleep is associated with lower androgen signalling.');
    education.push('Sleep restriction reduces morning testosterone in controlled studies.');
  }

  // Resistance training.
  const rtd = clamp(input.resistance_training_days, 0, 7);
  if (rtd >= 3 && rtd <= 5) {
    score += 10;
    factors.push('Regular resistance training supports the androgen signalling context.');
  } else if (rtd >= 1) {
    score += 4;
    factors.push('Some resistance training is present.');
  } else {
    score -= 6;
    factors.push('No resistance training reported.');
  }

  // Body fat: optimal 10–20% (male reference orientation).
  const bf = clamp(input.body_fat_pct, 3, 60);
  if (bf >= 10 && bf <= 20) {
    score += 10;
    factors.push('Body fat is in a range associated with favourable hormone metabolism.');
  } else if (bf > 25) {
    score -= clamp((bf - 25) * 1.2, 0, 16);
    factors.push('Higher body fat is associated with lower SHBG and altered androgen metabolism.');
  } else if (bf < 10) {
    score -= 5;
    factors.push('Very low body fat can suppress the reproductive axis.');
  }

  // Protein intake.
  const protein = clamp(input.protein_g_per_kg, 0, 4);
  if (protein >= 1.6) {
    score += 5;
    factors.push('Protein intake meets common training recommendations.');
  } else if (protein < 1.0) {
    score -= 5;
    factors.push('Low protein intake may limit training adaptation.');
  }

  // Stress (inverse).
  const stress = clamp(input.stress_level, 1, 10);
  score -= (stress - 1) * 1.6;
  if (stress >= 7) {
    factors.push('High perceived stress raises cortisol, which antagonises androgen signalling.');
    education.push('Chronic stress management (breathing, sleep hygiene, activity) is a legitimate lever.');
  }

  // Vitamin D.
  const d = clamp(input.vitamin_d_ng_ml, 0, 120);
  if (d >= 30) {
    score += 5;
    factors.push('Vitamin D is in the sufficiency range.');
  } else if (d < 20) {
    score -= 6;
    factors.push('Vitamin D deficiency is present.');
    education.push('Ask a clinician about vitamin D status — deficiency correction is a clinical decision.');
  }

  // Age.
  if (input.age >= 50) {
    score -= clamp((input.age - 50) * 0.4, 0, 10);
    factors.push('Age ≥50 is associated with a gradual decline in androgen signalling.');
  }

  // AR CAG repeats (genetic, educational).
  const cag = clamp(input.ar_cag_repeats, 9, 40);
  if (cag <= 20) {
    score += 4;
    factors.push(`AR CAG-repeat length (${round(cag, 0)}) is in the shorter, higher-signalling range.`);
  } else if (cag >= 28) {
    score -= 4;
    factors.push(`AR CAG-repeat length (${round(cag, 0)}) is longer, associated with lower signalling efficiency.`);
  }
  education.push('AR CAG-repeat length is genetic and cannot be changed by lifestyle or drugs.');

  const index = round(clamp(score, 0, 100), 0);
  const band: AndrogenReceptorResult['band'] =
    index >= 70 ? 'favourable' : index >= 45 ? 'moderate' : 'suboptimal';

  if (band === 'suboptimal') flags.push('suboptimal_signalling_context');
  if (sleep < 5) flags.push('severe_sleep_restriction');

  education.push('This index is heuristic and is not a receptor or hormone measurement.');
  education.push('It never recommends medication, hormones or supplements.');

  return {
    ar_sensitivity_index: index,
    band,
    contributing_factors: factors,
    education,
    safety_flags: flags,
    educational_notice:
      'Educational heuristic only. Androgen-receptor sensitivity cannot be diagnosed or modified by this tool; no drug or dose is ever recommended.',
  };
}
