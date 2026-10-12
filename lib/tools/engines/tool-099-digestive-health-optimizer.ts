/**
 * Tool #099 — Digestive Health Optimizer
 * Layer 1: Pure TypeScript calculation engine.
 * Models gastrointestinal motility, oral 17aa hepatobiliary-GI strain,
 * microbial dysbiosis, and gastric acid sufficiency under high-protein diets.
 */

export interface DigestiveHealthOptimizerInput {
  daily_protein_intake_grams: number;
  bloating_or_reflux_frequency: 'rare' | 'occasional' | 'severe_daily';
  bowel_regularity_bristol_score: number; // 1..7 (3..4 optimal)
  using_oral_17aa_or_nsaids: boolean;
  fermented_food_or_probiotic_intake: boolean;
}

export interface DigestiveHealthOptimizerResult {
  digestive_efficiency_score: number; // 0..100
  gi_barrier_strain_tier: 'healthy-intact' | 'mild-dysbiosis' | 'compromised-mucosal-strain';
  support_priorities: string[];
}

export function optimizeDigestiveHealth(input: DigestiveHealthOptimizerInput): DigestiveHealthOptimizerResult {
  const {
    daily_protein_intake_grams,
    bloating_or_reflux_frequency,
    bowel_regularity_bristol_score,
    using_oral_17aa_or_nsaids,
    fermented_food_or_probiotic_intake,
  } = input;

  const support_priorities: string[] = ['educational_gastrointestinal_metabolic_screen'];
  let score = 55;

  if (daily_protein_intake_grams > 250) {
    score -= 10;
    support_priorities.push('high_protein_density_requires_hydrochloric_acid_and_pancreatic_protease_support');
  } else if (daily_protein_intake_grams > 180) {
    score -= 5;
  } else {
    score += 10;
  }

  if (bloating_or_reflux_frequency === 'rare') {
    score += 20;
  } else if (bloating_or_reflux_frequency === 'occasional') {
    score -= 5;
  } else {
    score -= 25;
    support_priorities.push('frequent_dyspepsia_reflux_suggests_delayed_gastric_emptying_or_low_stomach_acid');
  }

  if (bowel_regularity_bristol_score >= 3 && bowel_regularity_bristol_score <= 4) {
    score += 15;
  } else {
    score -= 10;
    support_priorities.push('suboptimal_bristol_stool_pattern_indicates_dysfunctional_transit_time_adjust_fiber');
  }

  if (using_oral_17aa_or_nsaids) {
    score -= 15;
    support_priorities.push('oral_17aa_androgens_and_nsaids_compromise_gastroduodenal_mucosal_integrity');
  }

  if (fermented_food_or_probiotic_intake) {
    score += 10;
  }

  const boundedScore = Math.min(100, Math.max(0, Math.round(score)));

  let gi_barrier_strain_tier: 'healthy-intact' | 'mild-dysbiosis' | 'compromised-mucosal-strain';
  if (boundedScore >= 75) {
    gi_barrier_strain_tier = 'healthy-intact';
  } else if (boundedScore >= 45) {
    gi_barrier_strain_tier = 'mild-dysbiosis';
  } else {
    gi_barrier_strain_tier = 'compromised-mucosal-strain';
  }

  return {
    digestive_efficiency_score: boundedScore,
    gi_barrier_strain_tier,
    support_priorities,
  };
}
