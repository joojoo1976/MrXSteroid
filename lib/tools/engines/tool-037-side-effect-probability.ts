/**
 * Tool #037 — Side Effect Probability Calculator
 * Additive risk model: dose load × harshness × modifiers → per-effect probabilities.
 * Documented heuristic (population averages, not personal medical prediction).
 * Pure calculation engine (no I/O, no DB).
 */

export interface RiskCompound {
  name_en: string;
  family: 'testosterone' | 'nandrolone' | 'trenbolone' | 'dht' | 'oral' | 'other';
  weekly_dose_mg: number;
  reference_dose_mg: number; // dose at which base rates apply
}

export interface SideEffectRiskInput {
  compounds: RiskCompound[];
  age: number;
  body_fat_pct: number;
  cycle_weeks: number;
  uses_ai: boolean;
  uses_liver_support: boolean;
}

/** Base weekly probability (0..1) per family at reference dose. */
const BASE_RATES: Record<RiskCompound['family'], RiskRates> = {
  testosterone: { acne: 0.12, gyno: 0.10, hairloss: 0.06, liver: 0.01, lipids: 0.05, mood: 0.05 },
  nandrolone: { acne: 0.10, gyno: 0.08, hairloss: 0.02, liver: 0.01, lipids: 0.08, mood: 0.09 },
  trenbolone: { acne: 0.18, gyno: 0.06, hairloss: 0.08, liver: 0.05, lipids: 0.12, mood: 0.16 },
  dht: { acne: 0.14, gyno: 0.01, hairloss: 0.12, liver: 0.02, lipids: 0.10, mood: 0.04 },
  oral: { acne: 0.08, gyno: 0.04, hairloss: 0.03, liver: 0.15, lipids: 0.12, mood: 0.03 },
  other: { acne: 0.05, gyno: 0.03, hairloss: 0.03, liver: 0.03, lipids: 0.05, mood: 0.03 },
};

export interface SideEffectRisk {
  effect: string;
  probability_pct: number;
  level: 'low' | 'moderate' | 'high';
}

export interface SideEffectRiskResult {
  risks: SideEffectRisk[];
  overall_burden_pct: number;
  mitigations: string[];
}

type RiskKey = 'acne' | 'gyno' | 'hairloss' | 'liver' | 'lipids' | 'mood';
const RISK_KEYS: readonly RiskKey[] = ['acne', 'gyno', 'hairloss', 'liver', 'lipids', 'mood'];
type RiskRates = Record<RiskKey, number>;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function calculateSideEffectProbability(input: SideEffectRiskInput): SideEffectRiskResult {
  const { compounds, age, body_fat_pct, cycle_weeks, uses_ai, uses_liver_support } = input;
  const mitigations: string[] = [];

  // 37.1 Independent-risk combination: P(any) = 1 - Π(1 - p_i), p scaled by dose ratio
  const acc: Record<RiskKey, number> = { acne: 0, gyno: 0, hairloss: 0, liver: 0, lipids: 0, mood: 0 };
  for (const c of compounds) {
    const base: RiskRates = BASE_RATES[c.family];
    const ratio = c.weekly_dose_mg / Math.max(1, c.reference_dose_mg);
    for (const k of RISK_KEYS) {
      const p = clamp01(base[k] * ratio);
      acc[k] = 1 - (1 - acc[k]) * (1 - p);
    }
  }

  // 37.2 Modifiers
  if (uses_ai) acc.gyno *= 0.4;
  if (uses_liver_support) acc.liver *= 0.6;
  if (body_fat_pct > 25) { acc.gyno *= 1.5; acc.acne *= 1.2; }
  if (age >= 40) { acc.lipids *= 1.3; acc.liver *= 1.2; }
  const durationFactor = 1 + Math.max(0, cycle_weeks - 8) * 0.03;
  for (const k of RISK_KEYS) acc[k] = clamp01(acc[k] * durationFactor);

  const risks: SideEffectRisk[] = (Object.keys(acc) as Array<keyof typeof acc>).map((effect) => {
    const pct = Math.round(acc[effect] * 1000) / 10;
    return { effect, probability_pct: pct, level: pct >= 30 ? 'high' : pct >= 12 ? 'moderate' : 'low' };
  });
  risks.sort((a, b) => b.probability_pct - a.probability_pct);

  const overall = Math.round((1 - risks.reduce((p, r) => p * (1 - r.probability_pct / 100), 1)) * 1000) / 10;

  if (!uses_ai && acc.gyno > 0.08) mitigations.push('Gyno risk elevated — keep an AI on hand and confirm E2 with labs');
  if (!uses_liver_support && acc.liver > 0.08) mitigations.push('Liver risk elevated — add TUDCA/NAC and limit orals/alcohol');
  if (acc.lipids > 0.15) mitigations.push('Lipid risk elevated — cardio 150+ min/week, omega-3, retest lipids mid-cycle');
  if (acc.mood > 0.12) mitigations.push('Mood risk elevated — sleep 7-9h, monitor irritability, shorten cycle if needed');
  if (mitigations.length === 0) mitigations.push('Risk profile moderate — maintain standard monitoring (BP, labs at weeks 4-6)');
  mitigations.push('Heuristic population estimates — not a personal medical prediction');

  return { risks, overall_burden_pct: overall, mitigations };
}
