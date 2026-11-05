/**
 * lib/tools/engines/macro.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #1 — Adaptive Macro Calculator (Layer 1).
 * ════════════════════════════════════════════════════════════════════════════════
 * Dynamic macro calculator with phase-based adjustment using Mifflin-St Jeor BMR
 * and activity multipliers. Supports bulking, cutting, maintenance, and recomposition.
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 * Runs identically on server (RSC / route handlers) and client.
 */

export type Phase = 'bulk' | 'cut' | 'maintenance' | 'recomp';
export type UnitSystem = 'metric' | 'imperial';
export type Sex = 'male' | 'female';

export interface MacroInput {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: number; // 1.2 - 1.9
  phase: Phase;
  targetWeightKg?: number;
  unitSystem?: UnitSystem;
}

export interface MacroOutput {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  phase: Phase;
  macros: {
    protein: { grams: number; calories: number; pct: number };
    carbs: { grams: number; calories: number; pct: number };
    fat: { grams: number; calories: number; pct: number };
  };
}

/** Mifflin-St Jeor BMR equation */
function calculateBMR(input: MacroInput): number {
  const { weightKg, heightCm, age, sex } = input;
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

/** Phase-based calorie adjustment */
function adjustCaloriesForPhase(tdee: number, phase: Phase): number {
  switch (phase) {
    case 'bulk':
      return Math.round(tdee * 1.1); // +10%
    case 'cut':
      return Math.round(tdee * 0.85); // -15%
    case 'recomp':
      return Math.round(tdee * 0.95); // -5%
    case 'maintenance':
    default:
      return Math.round(tdee);
  }
}

/** Macro splits by phase (protein prioritized) */
function getMacroSplit(phase: Phase): { proteinPct: number; fatPct: number; carbsPct: number } {
  switch (phase) {
    case 'bulk':
      return { proteinPct: 0.3, fatPct: 0.25, carbsPct: 0.45 };
    case 'cut':
      return { proteinPct: 0.35, fatPct: 0.3, carbsPct: 0.35 };
    case 'recomp':
      return { proteinPct: 0.32, fatPct: 0.28, carbsPct: 0.4 };
    case 'maintenance':
    default:
      return { proteinPct: 0.28, fatPct: 0.28, carbsPct: 0.44 };
  }
}

export function calculateMacros(input: MacroInput): MacroOutput {
  // Validate inputs
  if (input.age < 13 || input.age > 100) throw new Error('Age must be between 13 and 100');
  if (input.heightCm < 100 || input.heightCm > 250) throw new Error('Height must be between 100 and 250 cm');
  if (input.weightKg < 30 || input.weightKg > 300) throw new Error('Weight must be between 30 and 300 kg');
  if (input.activityLevel < 1.2 || input.activityLevel > 1.9) throw new Error('Activity level must be between 1.2 and 1.9');

  const bmr = calculateBMR(input);
  const tdee = Math.round(bmr * input.activityLevel);
  const targetCalories = adjustCaloriesForPhase(tdee, input.phase);

  const { proteinPct, fatPct, carbsPct } = getMacroSplit(input.phase);

  const proteinGrams = Math.round((targetCalories * proteinPct) / 4);
  const fatGrams = Math.round((targetCalories * fatPct) / 9);
  const carbsGrams = Math.round((targetCalories * carbsPct) / 4);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    phase: input.phase,
    macros: {
      protein: { grams: proteinGrams, calories: proteinGrams * 4, pct: Math.round(proteinPct * 100) },
      carbs: { grams: carbsGrams, calories: carbsGrams * 4, pct: Math.round(carbsPct * 100) },
      fat: { grams: fatGrams, calories: fatGrams * 9, pct: Math.round(fatPct * 100) },
    },
  };
}