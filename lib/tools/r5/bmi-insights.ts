import { calculateBmi, type BmiOutput } from '@/lib/tools/engines/bmi.v6';

export type BmiCategory = BmiOutput['category'];

export interface BmiScenario {
  weightKg: number;
  bmi: number;
  category: BmiCategory;
}

export interface BmiWeightBounds {
  min: number;
  max: number;
}

export interface BmiBoundaryGap {
  lower: number | null;
  upper: number | null;
}

const DEFAULT_BOUNDS: BmiWeightBounds = { min: 30, max: 300 };

/**
 * Build a deterministic weight what-if table by calling the real BMI engine.
 * The engine remains the only source of the BMI values and categories.
 */
export function buildBmiScenarios(
  weightKg: number,
  heightCm: number,
  bounds: BmiWeightBounds = DEFAULT_BOUNDS
): BmiScenario[] {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm)) {
    throw new Error('Weight and height must be finite numbers');
  }

  const candidates = [weightKg - 5, weightKg, weightKg + 5]
    .map((value) => Math.min(bounds.max, Math.max(bounds.min, value)))
    .map((value) => Math.round(value * 10) / 10);

  return [...new Set(candidates)].map((candidate) => {
    const output = calculateBmi({ weightKg: candidate, heightCm });
    return { weightKg: candidate, bmi: output.bmi, category: output.category };
  });
}

/**
 * Return the adult screening boundaries adjacent to a BMI value.
 * This is arithmetic on the published cut-offs, not a new formula.
 */
export function bmiBoundaryGap(bmi: number): BmiBoundaryGap {
  if (!Number.isFinite(bmi) || bmi <= 0) {
    throw new Error('BMI must be a positive finite number');
  }
  if (bmi < 18.5) return { lower: null, upper: 18.5 };
  if (bmi < 25) return { lower: 18.5, upper: 25 };
  if (bmi < 30) return { lower: 25, upper: 30 };
  return { lower: 30, upper: null };
}

/** Return the category whose advice copy must be shown. */
export function bmiCategoryAdviceKey(category: BmiCategory): BmiCategory {
  return category;
}
