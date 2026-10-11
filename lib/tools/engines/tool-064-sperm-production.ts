/**
 * Tool #064 — Sperm Production Optimizer (Educational)
 * Layer 64: spermatogenesis-factor scoring (lifestyle/heat/exposures).
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational lifestyle index; NOT a semen analysis.
 *  - Never recommends hCG, antioxidants, hormones or any dose.
 *  - Exogenous androgen + fertility intent escalates to clinical referral.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface SpermProductionInput {
  age: number;
  /** Body-mass index (kg/m²). */
  bmi: number;
  /** Average nightly sleep (hours). */
  sleep_hours: number;
  /** Weekly hours of heat exposure (sauna, hot tub, laptop-on-lap). */
  heat_exposure_hours: number;
  /** Moderate exercise sessions per week. */
  exercise_days: number;
  smoker: boolean;
  /** Standard alcoholic drinks per week. */
  alcohol_units: number;
  /** Perceived stress (1 = calm, 10 = extreme). */
  stress_level: number;
  /** Days of abstinence before a hypothetical sample. */
  abstinence_days: number;
  /** Currently using exogenous androgens/AAS. */
  exogenous_androgen: boolean;
  /** Currently trying to conceive. */
  fertility_intent: boolean;
}

export interface SpermProductionResult {
  /** 0–100 spermatogenesis-factor index (higher = more favourable). */
  spermatogenesis_index: number;
  band: 'unfavourable' | 'moderate' | 'favourable';
  contributing_factors: string[];
  education: string[];
  clinical_referral_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export function assessSpermProduction(input: SpermProductionInput): SpermProductionResult {
  let score = 60;
  const factors: string[] = [];
  const education: string[] = [];
  const flags: string[] = [];

  const bmi = clamp(input.bmi, 12, 60);
  if (bmi >= 18.5 && bmi <= 25) {
    score += 8;
    factors.push('BMI is in a favourable range.');
  } else if (bmi > 30) {
    score -= clamp((bmi - 30) * 1.2, 0, 14);
    factors.push('Obesity is associated with lower semen quality and altered hormones.');
  } else if (bmi < 18.5) {
    score -= 6;
    factors.push('Low BMI may reflect inadequate energy availability.');
  }

  const sleep = clamp(input.sleep_hours, 0, 14);
  if (sleep >= 7 && sleep <= 9) score += 8;
  else if (sleep < 6) {
    score -= 8;
    factors.push('Short sleep is associated with reduced semen parameters.');
  }

  const heat = clamp(input.heat_exposure_hours, 0, 40);
  if (heat <= 2) score += 6;
  else {
    score -= clamp(heat * 1.5, 0, 16);
    factors.push('Regular heat exposure raises scrotal temperature, which impairs spermatogenesis.');
  }

  const exercise = clamp(input.exercise_days, 0, 7);
  if (exercise >= 3 && exercise <= 6) score += 6;
  else if (exercise === 0) {
    score -= 4;
    factors.push('No regular exercise reported.');
  }

  if (input.smoker) {
    score -= 12;
    factors.push('Smoking is associated with reduced sperm count and motility.');
    education.push('Smoking cessation is the single most evidence-supported lifestyle change here.');
  }

  const alcohol = clamp(input.alcohol_units, 0, 100);
  if (alcohol > 14) {
    score -= clamp((alcohol - 14) * 0.8, 0, 14);
    factors.push('High alcohol intake is associated with poorer semen quality.');
  } else if (alcohol <= 5) {
    score += 4;
  }

  const stress = clamp(input.stress_level, 1, 10);
  score -= (stress - 1) * 1.2;
  if (stress >= 7) factors.push('High perceived stress is included as a negative modifier.');

  const abstinence = clamp(input.abstinence_days, 0, 30);
  if (abstinence >= 2 && abstinence <= 5) {
    score += 6;
    factors.push('Abstinence of 2–5 days matches common semen-analysis recommendations.');
  } else if (abstinence > 7) {
    score -= 5;
    factors.push('Prolonged abstinence can increase DNA fragmentation despite higher volume.');
  }

  const age = clamp(input.age, 16, 100);
  if (age >= 45) {
    score -= clamp((age - 45) * 0.5, 0, 12);
    factors.push('Age ≥45 is associated with a gradual decline in semen parameters.');
  }

  let referral = false;
  if (input.exogenous_androgen) {
    score -= 20;
    flags.push('exogenous_androgen');
    factors.push('Exogenous androgens suppress LH/FSH and can reduce sperm production markedly.');
    education.push('Exogenous androgens are a common, usually reversible cause of low sperm production.');
    if (input.fertility_intent) {
      referral = true;
      flags.push('fertility_intent_with_androgen');
      education.push('If you are trying to conceive, arrange a clinical fertility review promptly.');
    }
  }

  if (bmi > 40) flags.push('severe_obesity');
  if (heat > 10) flags.push('high_heat_exposure');

  const index = round(clamp(score, 0, 100), 0);
  const band: SpermProductionResult['band'] =
    index >= 70 ? 'favourable' : index >= 45 ? 'moderate' : 'unfavourable';

  education.push('Semen quality is only reliably assessed by a laboratory semen analysis.');
  education.push('This tool never recommends hormones, hCG, antioxidants or any dose.');

  return {
    spermatogenesis_index: index,
    band,
    contributing_factors: factors,
    education,
    clinical_referral_advised: referral,
    safety_flags: flags,
    educational_notice:
      'Educational lifestyle index only. It is not a semen analysis and never prescribes fertility treatment or doses.',
  };
}
