/**
 * lib/tools/engines/bodyfat.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #2 — FFMI & Body Fat Analyzer (Layer 1).
 * ════════════════════════════════════════════════════════════════════════════════
 * Computes body fat percentage via US Navy method and FFMI (Fat-Free Mass Index).
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 */

export type UnitSystem = 'metric' | 'imperial';
export type Sex = 'male' | 'female';

export interface BodyFatInput {
  sex: Sex;
  heightCm: number;
  weightKg: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number; // Required for females
  unitSystem?: UnitSystem;
}

export interface BodyFatOutput {
  bodyFatPercentage: number;
  ffmi: number;
  normalizedFFMI: number;
  leanBodyMassKg: number;
  fatMassKg: number;
  category: 'essential' | 'athletic' | 'fitness' | 'average' | 'obese';
}

/** US Navy body fat formula */
function calculateBodyFatPercentage(input: BodyFatInput): number {
  const { sex, heightCm, neckCm, waistCm, hipCm } = input;

  if (sex === 'male') {
    // Male: %BF = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    const waistNeck = waistCm - neckCm;
    if (waistNeck <= 0) throw new Error('Waist must be greater than neck');
    const logTerm = 1.0324 - 0.19077 * Math.log10(waistNeck) + 0.15456 * Math.log10(heightCm);
    return 495 / logTerm - 450;
  } else {
    // Female: %BF = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    if (!hipCm) throw new Error('Hip measurement required for females');
    const waistHipNeck = waistCm + hipCm - neckCm;
    if (waistHipNeck <= 0) throw new Error('Waist + hip must be greater than neck');
    const logTerm = 1.29579 - 0.35004 * Math.log10(waistHipNeck) + 0.22100 * Math.log10(heightCm);
    return 495 / logTerm - 450;
  }
}

function calculateFFMI(weightKg: number, heightCm: number, bodyFatPct: number): { ffmi: number; normalizedFFMI: number } {
  const heightM = heightCm / 100;
  const leanMassKg = weightKg * (1 - bodyFatPct / 100);
  const ffmi = leanMassKg / (heightM * heightM);
  // Normalized FFMI to 1.8m height
  const normalizedFFMI = ffmi + 6.1 * (1.8 - heightM);
  return { ffmi: Math.round(ffmi * 10) / 10, normalizedFFMI: Math.round(normalizedFFMI * 10) / 10 };
}

function getCategory(sex: Sex, bodyFatPct: number): BodyFatOutput['category'] {
  if (sex === 'male') {
    if (bodyFatPct <= 5) return 'essential';
    if (bodyFatPct <= 13) return 'athletic';
    if (bodyFatPct <= 17) return 'fitness';
    if (bodyFatPct <= 24) return 'average';
    return 'obese';
  } else {
    if (bodyFatPct <= 13) return 'essential';
    if (bodyFatPct <= 20) return 'athletic';
    if (bodyFatPct <= 24) return 'fitness';
    if (bodyFatPct <= 31) return 'average';
    return 'obese';
  }
}

export function calculateBodyFat(input: BodyFatInput): BodyFatOutput {
  // Validate inputs
  if (input.heightCm < 100 || input.heightCm > 250) throw new Error('Height must be between 100 and 250 cm');
  if (input.weightKg < 30 || input.weightKg > 300) throw new Error('Weight must be between 30 and 300 kg');
  if (input.neckCm < 20 || input.neckCm > 60) throw new Error('Neck must be between 20 and 60 cm');
  if (input.waistCm < 40 || input.waistCm > 200) throw new Error('Waist must be between 40 and 200 cm');
  if (input.sex === 'female' && (!input.hipCm || input.hipCm < 50 || input.hipCm > 200)) {
    throw new Error('Hip must be between 50 and 200 cm for females');
  }

  const bodyFatPercentage = Math.max(0, Math.min(50, calculateBodyFatPercentage(input)));
  const leanBodyMassKg = input.weightKg * (1 - bodyFatPercentage / 100);
  const fatMassKg = input.weightKg - leanBodyMassKg;
  const { ffmi, normalizedFFMI } = calculateFFMI(input.weightKg, input.heightCm, bodyFatPercentage);
  const category = getCategory(input.sex, bodyFatPercentage);

  return {
    bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
    ffmi,
    normalizedFFMI,
    leanBodyMassKg: Math.round(leanBodyMassKg * 10) / 10,
    fatMassKg: Math.round(fatMassKg * 10) / 10,
    category,
  };
}