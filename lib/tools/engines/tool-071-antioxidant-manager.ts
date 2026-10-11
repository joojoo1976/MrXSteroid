/**
 * Tool #071 — Antioxidant Manager
 * Evaluates dietary and supplemental antioxidant status against physiological oxidative demand.
 * Focuses on evidence-based nutrient groups: Vitamins C & E, Zinc, Selenium, CoQ10, and polyphenols.
 * Educational scoring index — not a prescription.
 */

export interface AntioxidantInput {
  daily_fruit_veg_servings: number; // 0..15
  takes_coq10: boolean;
  takes_vitamin_c_e: boolean;
  takes_zinc_selenium: boolean;
  high_oxidative_lifestyle: boolean; // e.g. smoking, heavy training, high AAS
}

export interface AntioxidantResult {
  antioxidant_defense_score: number; // 0..100
  defense_tier: 'depleted-defense' | 'adequate-defense' | 'robust-defense';
  key_recommendations: string[];
  warnings: string[];
}

export function manageAntioxidants(input: AntioxidantInput): AntioxidantResult {
  const {
    daily_fruit_veg_servings,
    takes_coq10,
    takes_vitamin_c_e,
    takes_zinc_selenium,
    high_oxidative_lifestyle,
  } = input;

  const warnings: string[] = ['educational_antioxidant_evaluation'];
  const key_recommendations: string[] = [];

  let score = 15; // baseline

  // Whole foods polyphenol & micronutrient foundation (max +40)
  if (daily_fruit_veg_servings >= 7) {
    score += 40;
  } else if (daily_fruit_veg_servings >= 4) {
    score += 25;
  } else {
    score += daily_fruit_veg_servings * 5;
    key_recommendations.push('aim_for_minimum_5_servings_colorful_plants');
  }

  // Targeted mitochondrial antioxidant (CoQ10) (+15)
  if (takes_coq10) {
    score += 15;
  } else if (high_oxidative_lifestyle) {
    key_recommendations.push('consider_coq10_ubiquinol_for_mitochondrial_support');
  }

  // Classical antioxidant vitamins (+15)
  if (takes_vitamin_c_e) {
    score += 15;
  }

  // Trace mineral cofactors for SOD & Glutathione Peroxidase (+15)
  if (takes_zinc_selenium) {
    score += 15;
  }

  // Oxidative stress burden drain (-15 to score if defense challenged without enough plants)
  if (high_oxidative_lifestyle && daily_fruit_veg_servings < 4) {
    score -= 15;
    warnings.push('high_oxidative_strain_outstripping_low_antioxidant_intake');
  }

  score = Math.max(0, Math.min(100, score));

  let defense_tier: AntioxidantResult['defense_tier'];
  if (score < 40) {
    defense_tier = 'depleted-defense';
  } else if (score < 75) {
    defense_tier = 'adequate-defense';
  } else {
    defense_tier = 'robust-defense';
  }

  return {
    antioxidant_defense_score: score,
    defense_tier,
    key_recommendations,
    warnings: [...new Set(warnings)],
  };
}
