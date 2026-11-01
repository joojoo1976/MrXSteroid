/**
 * Genetic Potential Calculator — v6 engine (pure TS)
 * Heuristic estimate of training potential from age, history, body type, goal.
 * Not medical advice. All inputs validated (finite/positive).
 */

export interface GeneticPotentialV6Input {
  age: number;
  trainingYears: number;
  priorCycles: number;
  familyHistory: 'none' | 'heart_disease' | 'liver_disease' | 'other';
  bodyType: 'ectomorph' | 'mesomorph' | 'endomorph';
  goal: 'bulk' | 'cut' | 'recomp';
  currentWeightKg: number;
  heightCm: number;
}

export interface GeneticPotentialV6Result {
  potentialScore: number; // 0..100
  bmi: number;
  bodyTypeAssessment: string;
  recommendedCycleLengthWeeks: number;
  dosageMultiplier: number;
  riskFactors: string[];
  recommendedCompounds: string[];
  avoidedCompounds: string[];
  personalizedTips: string[];
}

function finitePositive(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

export function calculateGeneticPotentialV6(input: GeneticPotentialV6Input): GeneticPotentialV6Result {
  if (!finitePositive(input.age) || !finitePositive(input.currentWeightKg) || !finitePositive(input.heightCm)) {
    throw new Error('age, currentWeightKg, heightCm must be finite and positive');
  }
  if (!Number.isFinite(input.trainingYears) || input.trainingYears < 0) throw new Error('trainingYears must be finite and >= 0');
  if (!Number.isFinite(input.priorCycles) || input.priorCycles < 0) throw new Error('priorCycles must be finite and >= 0');

  const bmi = input.currentWeightKg / Math.pow(input.heightCm / 100, 2);
  let score = 60;
  score += Math.min(15, input.trainingYears * 2);
  score -= Math.min(10, input.priorCycles * 2);
  if (input.age < 25) score -= 5;
  if (input.age > 45) score -= 5;
  if (input.bodyType === 'mesomorph') score += 8;
  if (input.bodyType === 'ectomorph' && input.goal === 'bulk') score -= 3;
  if (input.bodyType === 'endomorph' && input.goal === 'cut') score -= 3;
  if (bmi >= 18.5 && bmi <= 25) score += 5;
  else score -= 4;

  const riskFactors: string[] = [];
  if (input.familyHistory !== 'none') riskFactors.push(`Family history: ${input.familyHistory.replace(/_/g, ' ')} — screen relevant markers before cycling.`);
  if (bmi > 28) riskFactors.push('BMI above athletic range — prioritize body-composition phase first.');
  if (input.priorCycles >= 3) riskFactors.push('Multiple prior cycles — extended recovery and bloodwork strongly advised.');

  const recommendedCompounds =
    input.goal === 'bulk'
      ? ['Testosterone base', 'Progressive overload program', 'Caloric surplus plan']
      : input.goal === 'cut'
        ? ['Testosterone base', 'High-protein deficit plan', 'Conditioning protocol']
        : ['Testosterone base', 'Balanced recomposition plan', 'Sleep/recovery protocol'];

  const avoidedCompounds =
    input.familyHistory === 'heart_disease'
      ? ['High-dose stimulants', 'Unmonitored oral stacks']
      : input.familyHistory === 'liver_disease'
        ? ['Oral 17-alpha-alkylated compounds', 'Alcohol during cycle']
        : ['Unsupervised polypharmacy'];

  const potentialScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    potentialScore,
    bmi: Math.round(bmi * 10) / 10,
    bodyTypeAssessment: `${input.bodyType} profile (BMI ${Math.round(bmi * 10) / 10})`,
    recommendedCycleLengthWeeks: input.priorCycles > 0 ? 10 : 8,
    dosageMultiplier: Math.max(0.5, Math.min(2, Math.round((score / 60) * 100) / 100)),
    riskFactors,
    recommendedCompounds,
    avoidedCompounds,
    personalizedTips: [
      'Use bloodwork before, mid-cycle, and post-PCT.',
      'Track progressive overload weekly.',
      'Keep protein high and sleep consistent.',
    ],
  };
}