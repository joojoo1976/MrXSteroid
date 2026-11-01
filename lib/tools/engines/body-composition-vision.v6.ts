/**
 * Body Composition Vision — v6 engine (pure TS, manual fallback)
 * Estimates body fat % from circumference measurements using Navy method.
 * Clearly marked as heuristic; not a medical diagnosis.
 */

export interface BodyCompositionVisionV6Input {
  sex: 'male' | 'female';
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number; // required for female
  weightKg: number;
}

export interface BodyCompositionVisionV6Result {
  bodyFatPercent: number;
  leanMassKg: number;
  fatMassKg: number;
  bmi: number;
  category: string;
  disclaimer: string;
  clamped: boolean;
}

function finitePositive(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

export function calculateBodyCompositionVisionV6(input: BodyCompositionVisionV6Input): BodyCompositionVisionV6Result {
  if (!finitePositive(input.heightCm) || !finitePositive(input.neckCm) || !finitePositive(input.waistCm) || !finitePositive(input.weightKg)) {
    throw new Error('heightCm, neckCm, waistCm, weightKg must be finite and positive');
  }
  if (input.sex === 'female' && (!input.hipCm || !finitePositive(input.hipCm))) {
    throw new Error('hipCm required for female');
  }

  if (input.sex === 'male' && input.waistCm <= input.neckCm) {
    throw new Error('waistCm must be greater than neckCm');
  }
  if (input.sex === 'female' && (input.waistCm + (input.hipCm as number)) <= input.neckCm) {
    throw new Error('waistCm + hipCm must be greater than neckCm');
  }

  let bf: number;
  if (input.sex === 'male') {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(input.waistCm - input.neckCm) + 0.15456 * Math.log10(input.heightCm)) - 450;
  } else {
    bf = 495 / (1.29579 - 0.35004 * Math.log10(input.waistCm + (input.hipCm as number) - input.neckCm) + 0.22100 * Math.log10(input.heightCm)) - 450;
  }
  const rawBf = bf;
  const clamped = rawBf < 3 || rawBf > 60;
  bf = Math.max(3, Math.min(60, bf));

  const fatMassKg = input.weightKg * (bf / 100);
  const leanMassKg = input.weightKg - fatMassKg;
  const bmi = input.weightKg / Math.pow(input.heightCm / 100, 2);

  let category = 'average';
  if (bf < 6) category = 'essential';
  else if (bf < 14) category = 'athletic';
  else if (bf < 18) category = 'fitness';
  else if (bf < 25) category = 'average';
  else category = 'obese';

  return {
    bodyFatPercent: Math.round(bf * 10) / 10,
    leanMassKg: Math.round(leanMassKg * 10) / 10,
    fatMassKg: Math.round(fatMassKg * 10) / 10,
    bmi: Math.round(bmi * 10) / 10,
    category,
    disclaimer: 'Heuristic estimate from circumference measurements (Navy method). Not medical advice or imaging.',
    clamped,
  };
}