/**
 * Tool #044 — DHT Side Effect Predictor
 * DHT-load side-effect heuristics (hair loss, prostate symptoms). All weights
 * are documented, deterministic, and clamped to [0,1] before % conversion.
 * 5-alpha-reductase inhibitors reduce DHT-mediated effects at the tissue level;
 * DHT-derivative AAS still bind the androgen receptor directly (documented).
 */

export interface DhtInput {
  dht_ng_dl: number; // 5..300 (reference ~30-85; 50 used as the load anchor)
  uses_dht_derivative: boolean; // mast/winstrol/dht-class compounds
  five_ari: 'none' | 'finasteride' | 'dutasteride';
  family_history_hairloss: boolean;
  age: number; // 18..90
}

export type DhtBand = 'low' | 'moderate' | 'high';

export interface DhtResult {
  hair_loss_risk_pct: number;
  prostate_symptom_risk_pct: number;
  overall_burden_pct: number;
  band: DhtBand;
  mitigations: string[];
}

const ANCHOR = 50; // ng/dL — typical upper-male baseline

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function predictDhtEffects(input: DhtInput): DhtResult {
  const { dht_ng_dl, uses_dht_derivative, five_ari, family_history_hairloss, age } = input;
  const dhtFactor = clamp01(dht_ng_dl / ANCHOR); // saturates at anchor for risk weighting
  const derFactor = uses_dht_derivative ? 1 : 0;
  const famFactor = family_history_hairloss ? 1 : 0;
  const ariFin = five_ari === 'finasteride' ? 1 : 0;
  const ariDut = five_ari === 'dutasteride' ? 1 : 0;
  const ageFactor = age >= 45 ? 1 : 0;

  const hair = clamp01(
    0.30 * dhtFactor + 0.25 * famFactor + 0.25 * derFactor - 0.35 * ariFin - 0.50 * ariDut + 0.05 * ageFactor,
  );
  const prostate = clamp01(
    0.25 * dhtFactor + 0.20 * ageFactor + 0.15 * derFactor - 0.35 * ariFin - 0.50 * ariDut,
  );

  const overall = (hair + prostate) / 2;
  const band: DhtBand = overall < 1 / 3 ? 'low' : overall < 2 / 3 ? 'moderate' : 'high';

  const mitigations: string[] = [];
  if (family_history_hairloss && !ariFin && !ariDut) mitigations.push('family_history_discuss_5ari_with_prescriber');
  if (uses_dht_derivative && !ariFin && !ariDut) mitigations.push('dht_derivative_effects_not_fully_blocked_by_5ari');
  if (ageFactor === 1) mitigations.push('age_45_plus_baseline_prostate_screening');
  if (hair > 0.5) mitigations.push('monitor_hairline_photos_every_8_weeks');

  return {
    hair_loss_risk_pct: Math.round(hair * 1000) / 10,
    prostate_symptom_risk_pct: Math.round(prostate * 1000) / 10,
    overall_burden_pct: Math.round(overall * 1000) / 10,
    band,
    mitigations: mitigations.slice(0, 6),
  };
}
