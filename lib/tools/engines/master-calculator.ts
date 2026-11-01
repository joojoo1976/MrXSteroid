/**
 * lib/tools/engines/master-calculator.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #9 — Master Calculator (Layer 1).
 * ════════════════════════════════════════════════════════════════════════════════
 * All-in-one nutrition and cycle calculator combining multiple tools.
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 */

export type UnitSystem = 'metric' | 'imperial';
export type Sex = 'male' | 'female';
export type Phase = 'bulk' | 'cut' | 'maintenance' | 'recomp';

export interface MasterCalculatorInput {
  // Basic info
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: number;
  phase: Phase;

  // Optional body composition
  bodyFatPercentage?: number;

  // Optional cycle parameters
  compounds?: Array<{
    name: string;
    doseMgPerWeek: number;
    halfLifeDays: number;
  }>;

  unitSystem?: UnitSystem;
}

export interface MasterCalculatorOutput {
  // Nutrition
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;

  // Body composition (if provided)
  ffmi?: number;
  leanMassKg?: number;

  // Cycle (if provided)
  weeklyMg?: number;
  estimatedPeakMg?: number;

  // Health markers
  bmi: number;
  bmiCategory: string;
}

function calculateBMR(input: MasterCalculatorInput): number {
  const { weightKg, heightCm, age, sex } = input;
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function adjustCaloriesForPhase(tdee: number, phase: Phase): number {
  switch (phase) {
    case 'bulk': return Math.round(tdee * 1.1);
    case 'cut': return Math.round(tdee * 0.85);
    case 'recomp': return Math.round(tdee * 0.95);
    default: return Math.round(tdee);
  }
}

function getMacroSplit(phase: Phase) {
  switch (phase) {
    case 'bulk': return { proteinPct: 0.3, fatPct: 0.25, carbsPct: 0.45 };
    case 'cut': return { proteinPct: 0.35, fatPct: 0.3, carbsPct: 0.35 };
    case 'recomp': return { proteinPct: 0.32, fatPct: 0.28, carbsPct: 0.4 };
    default: return { proteinPct: 0.28, fatPct: 0.28, carbsPct: 0.44 };
  }
}

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obese_class_1';
  if (bmi < 40) return 'obese_class_2';
  return 'obese_class_3';
}

export function calculateMaster(input: MasterCalculatorInput): MasterCalculatorOutput {
  // Validate
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

  const heightM = input.heightCm / 100;
  const bmi = input.weightKg / (heightM * heightM);

  const output: MasterCalculatorOutput = {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: getBMICategory(bmi),
  };

  // Body composition if body fat provided
  if (input.bodyFatPercentage !== undefined && input.bodyFatPercentage > 0 && input.bodyFatPercentage < 50) {
    const leanMassKg = input.weightKg * (1 - input.bodyFatPercentage / 100);
    output.leanMassKg = Math.round(leanMassKg * 10) / 10;
    output.ffmi = Math.round((leanMassKg / (heightM * heightM)) * 10) / 10;
  }

  // Cycle estimation if compounds provided
  if (input.compounds && input.compounds.length > 0) {
    output.weeklyMg = input.compounds.reduce((sum, c) => sum + c.doseMgPerWeek, 0);
    // Simple peak estimation assuming daily dosing
    output.estimatedPeakMg = output.weeklyMg * 2; // rough estimate
  }

  return output;
}