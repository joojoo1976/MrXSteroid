/**
 * Tool #071 — Antioxidant Manager (Educational)
 * Layer 71: dietary antioxidant diversity score (food-first, no dosing).
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational dietary-diversity score; NOT a nutrient measurement.
 *  - Never recommends an antioxidant supplement or dose.
 *  - High-dose antioxidant supplements can be harmful — always clinician-led.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface AntioxidantInput {
  /** Berries (e.g. blueberry, blackberry). */
  berries: boolean;
  /** Citrus fruits (orange, lemon, grapefruit). */
  citrus: boolean;
  /** Leafy greens (spinach, kale, rocket). */
  leafy_greens: boolean;
  /** Cruciferous vegetables (broccoli, cabbage). */
  cruciferous: boolean;
  /** Nuts and seeds. */
  nuts_seeds: boolean;
  /** Extra-virgin olive oil. */
  olive_oil: boolean;
  /** Herbs and spices (turmeric, oregano, garlic). */
  spices_herbs: boolean;
  /** Green tea. */
  green_tea: boolean;
  /** Dark chocolate (≥70%). */
  dark_chocolate: boolean;
  /** Legumes (beans, lentils). */
  legumes: boolean;
  /** Whole grains. */
  whole_grains: boolean;
  /** Fatty fish (salmon, sardines). */
  fatty_fish: boolean;
}

export interface AntioxidantResult {
  /** 0–100 dietary antioxidant diversity score. */
  diversity_score: number;
  categories_met: number;
  categories_total: number;
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export const ANTIOXIDANT_CATEGORIES: (keyof AntioxidantInput)[] = [
  'berries',
  'citrus',
  'leafy_greens',
  'cruciferous',
  'nuts_seeds',
  'olive_oil',
  'spices_herbs',
  'green_tea',
  'dark_chocolate',
  'legumes',
  'whole_grains',
  'fatty_fish',
];

export function assessAntioxidantDiversity(input: AntioxidantInput): AntioxidantResult {
  const total = ANTIOXIDANT_CATEGORIES.length;
  const met = ANTIOXIDANT_CATEGORIES.filter((k) => input[k]).length;
  const score = round(clamp((met / total) * 100, 0, 100), 0);

  const band: AntioxidantResult['band'] = score >= 67 ? 'high' : score >= 34 ? 'moderate' : 'low';

  const missing = ANTIOXIDANT_CATEGORIES.filter((k) => !input[k]);
  const factors: string[] = [
    `Antioxidant-rich food categories met: ${met}/${total}.`,
  ];
  if (missing.length) {
    factors.push(`Categories not met: ${missing.join(', ')}.`);
  }

  const recommendations: string[] = [];
  if (band === 'low') {
    recommendations.push('Increase the variety of antioxidant-rich whole foods in your diet.');
  } else if (band === 'moderate') {
    recommendations.push('Add a few more antioxidant-rich food categories for greater diversity.');
  } else {
    recommendations.push('Dietary antioxidant diversity is strong — maintain the variety.');
  }
  recommendations.push('Food-first variety is preferred; this tool never recommends antioxidant supplements or doses.');
  recommendations.push('Educational score only — it does not measure nutrient status.');

  return {
    diversity_score: score,
    categories_met: met,
    categories_total: total,
    band,
    contributing_factors: factors,
    recommendations,
    safety_flags: [],
    educational_notice:
      'Educational dietary-diversity score only. It does not measure antioxidant status and never recommends supplement doses.',
  };
}
