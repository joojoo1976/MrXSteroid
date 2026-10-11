/**
 * Tool #068 — Gynecomastia Tracker
 * Tracks clinical progression markers of breast tissue development (gynecomastia).
 * Classifies symptoms into staging progression:
 * - 'subclinical-sensitivity' (tenderness/itching, no palpable mass)
 * - 'early-budding' (palpable disk-like subareolar lump, <2cm, early onset)
 * - 'progressive-glandular' (larger lump, visible protrusion, mature tissue)
 * Pure deterministic educational engine — not surgical advice.
 */

export interface GynecomastiaInput {
  has_tenderness_or_itching: boolean;
  has_palpable_lump: boolean;
  lump_size_cm?: number; // 0..10
  duration_weeks: number; // 0..52
  prolactin_involved: boolean;
}

export interface GynecomastiaResult {
  progression_stage: 'none' | 'subclinical-sensitivity' | 'early-budding' | 'progressive-glandular';
  fibrosis_risk: 'reversible-early' | 'moderate-risk' | 'established-fibrotic';
  escalation_needed: boolean;
  warnings: string[];
}

export function trackGynecomastia(input: GynecomastiaInput): GynecomastiaResult {
  const { has_tenderness_or_itching, has_palpable_lump, lump_size_cm, duration_weeks, prolactin_involved } = input;
  const warnings: string[] = ['educational_gyno_tracking_only'];

  let progression_stage: GynecomastiaResult['progression_stage'] = 'none';
  if (has_palpable_lump) {
    if ((lump_size_cm ?? 0) >= 2 || duration_weeks >= 12) {
      progression_stage = 'progressive-glandular';
    } else {
      progression_stage = 'early-budding';
    }
  } else if (has_tenderness_or_itching) {
    progression_stage = 'subclinical-sensitivity';
  }

  let fibrosis_risk: GynecomastiaResult['fibrosis_risk'] = 'reversible-early';
  if (duration_weeks >= 24) {
    fibrosis_risk = 'established-fibrotic';
    warnings.push('fibrotic_tissue_rarely_resolves_pharmacologically');
  } else if (duration_weeks >= 8 || progression_stage === 'progressive-glandular') {
    fibrosis_risk = 'moderate-risk';
  }

  const escalation_needed = progression_stage === 'progressive-glandular' || fibrosis_risk === 'established-fibrotic';
  if (escalation_needed) {
    warnings.push('clinical_examination_recommended');
  }

  if (prolactin_involved) {
    warnings.push('prolactin_co_factor_requires_prl_e2_evaluation');
  }

  return {
    progression_stage,
    fibrosis_risk,
    escalation_needed,
    warnings: [...new Set(warnings)],
  };
}
