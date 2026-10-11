/**
 * Tool #052 — Growth Hormone Protocol Planner (Educational, non-prescriptive)
 * Layer 52: IGF-1 response / monitoring education.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15.2, §19, §40):
 *  - Educational dynamics model. Never recommends a GH dose.
 *  - Surfaces glucose, fluid-retention and thyroid monitoring needs.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface GhProtocolInput {
  weekly_iu: number;
  injections_per_week: number;
  age: number;
  baseline_igf1_ng_ml: number;
  fasting_glucose_mg_dl: number;
  hypothyroid: boolean;
}

export interface GhProtocolResult {
  per_injection_iu: number;
  igf1_response_index: number; // 0–100 educational index
  projected_igf1_ng_ml: number;
  glucose_risk: 'low' | 'moderate' | 'high';
  monitoring: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

export function planGhProtocol(input: GhProtocolInput): GhProtocolResult {
  const perInjection = input.injections_per_week > 0 ? input.weekly_iu / input.injections_per_week : 0;

  // Age attenuates IGF-1 response (educational, monotonic).
  const ageFactor = clamp(1 - (input.age - 20) * 0.012, 0.4, 1);
  const responseIndex = round(clamp((input.weekly_iu / 7) * 20 * ageFactor, 0, 100), 1);
  const projected = round(input.baseline_igf1_ng_ml + responseIndex * 1.4, 1);

  const flags: string[] = [];
  const monitoring: string[] = ['IGF-1 level', 'Fasting glucose / HbA1c', 'Thyroid panel'];

  let glucoseRisk: GhProtocolResult['glucose_risk'] = 'low';
  if (input.fasting_glucose_mg_dl >= 126) {
    glucoseRisk = 'high';
    flags.push('Fasting glucose ≥126 mg/dL — seek clinical assessment before continuing.');
  } else if (input.fasting_glucose_mg_dl >= 100) {
    glucoseRisk = 'moderate';
    flags.push('Impaired fasting glucose (100–125 mg/dL) — monitor closely.');
  }
  if (input.hypothyroid) {
    flags.push('Untreated hypothyroidism can blunt GH response and worsen fatigue — clinical review advised.');
  }
  if (projected > 400) {
    flags.push('Projected IGF-1 exceeds typical reference ranges — clinician review required.');
  }
  flags.push('Educational model only — it does not recommend a GH dose.');

  return {
    per_injection_iu: round(perInjection, 2),
    igf1_response_index: responseIndex,
    projected_igf1_ng_ml: projected,
    glucose_risk: glucoseRisk,
    monitoring,
    safety_flags: flags,
    educational_notice: 'Educational model. GH therapy must be supervised by a clinician.',
  };
}
