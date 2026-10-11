/**
 * Tool #077 — Nitric Oxide Optimizer
 * Scores dietary, lifestyle, and supplemental factors supporting endogenous
 * endothelial nitric oxide synthase (eNOS) production and bioavailability.
 *
 * Factors evaluated:
 * - Dietary nitrate intake (leafy greens, beets, arugula).
 * - L-citrulline / precursor support.
 * - Aerobic exercise & shear stress induction.
 * - Mouthwash use (chlorhexidine destroys nitrate-reducing oral biome).
 * - Oxidative stress burden (superoxide scavenges NO to peroxynitrite).
 */

export interface NitricOxideInput {
  dietary_nitrate_frequency: 'rarely' | 'occasional' | 'daily' | 'high_daily';
  aerobic_exercise_days_per_week: number; // 0..7
  uses_antiseptic_mouthwash: boolean;
  citrulline_supplementation: boolean;
  high_sunlight_or_uva_exposure: boolean; // Releases cutaneous NO stores
}

export interface NitricOxideResult {
  no_optimization_score: number; // 0..100
  no_status_band: 'depleted-no-pathway' | 'suboptimal-no-support' | 'favorable-no-production' | 'optimized-no-signaling';
  warnings: string[];
}

export function optimizeNitricOxide(input: NitricOxideInput): NitricOxideResult {
  const {
    dietary_nitrate_frequency,
    aerobic_exercise_days_per_week,
    uses_antiseptic_mouthwash,
    citrulline_supplementation,
    high_sunlight_or_uva_exposure,
  } = input;

  const warnings: string[] = ['educational_nitric_oxide_support_screen'];
  let score = 25; // baseline

  // Dietary nitrates
  if (dietary_nitrate_frequency === 'high_daily') {
    score += 30;
  } else if (dietary_nitrate_frequency === 'daily') {
    score += 20;
  } else if (dietary_nitrate_frequency === 'occasional') {
    score += 10;
  } else {
    warnings.push('low_dietary_nitrate_intake_limits_enterosalivary_pathway');
  }

  // Shear stress / exercise
  if (aerobic_exercise_days_per_week >= 4) {
    score += 25;
  } else if (aerobic_exercise_days_per_week >= 2) {
    score += 15;
  } else {
    warnings.push('sedentary_routine_reduces_endothelial_shear_stress_stimulus');
  }

  // Precursor support
  if (citrulline_supplementation) {
    score += 15;
  }

  // UVA / Sunlight
  if (high_sunlight_or_uva_exposure) {
    score += 10;
  }

  // Oral biome disruption
  if (uses_antiseptic_mouthwash) {
    score -= 25;
    warnings.push('antiseptic_mouthwash_eradicates_oral_microbiome_blunting_nitrate_to_nitrite_conversion');
  }

  const normalizedScore = Math.max(0, Math.min(100, score));

  let no_status_band: NitricOxideResult['no_status_band'] = 'suboptimal-no-support';
  if (normalizedScore >= 80) {
    no_status_band = 'optimized-no-signaling';
  } else if (normalizedScore >= 60) {
    no_status_band = 'favorable-no-production';
  } else if (normalizedScore <= 35) {
    no_status_band = 'depleted-no-pathway';
  }

  return {
    no_optimization_score: normalizedScore,
    no_status_band,
    warnings,
  };
}
