/**
 * Tool #020 — Genetic Potential Calculator (engine)
 * Estimates training potential from age, history, body type and goal.
 */

import type {
  GeneticPotentialInput,
  GeneticPotentialResult,
} from '../schemas/tool-020-genetic-potential';

export function calculateGeneticPotential(input: GeneticPotentialInput): GeneticPotentialResult {
  const { age, trainingYears, priorCycles, familyHistory, bodyType, goal, currentWeight, height } = input;

  const bmi = currentWeight / Math.pow(height / 100, 2);
  let score = 60;
  score += Math.min(15, trainingYears * 2);
  score -= Math.min(10, priorCycles * 2);
  if (age < 25) score -= 5;
  if (age > 45) score -= 5;
  if (bodyType === 'mesomorph') score += 8;
  if (bodyType === 'ectomorph' && goal === 'bulk') score -= 3;
  if (bodyType === 'endomorph' && goal === 'cut') score -= 3;
  if (bmi >= 18.5 && bmi <= 25) score += 5;
  else score -= 4;

  const risk_factors: string[] = [];
  if (familyHistory !== 'none') risk_factors.push(`Family history: ${familyHistory.replace(/_/g, ' ')} — screen relevant markers before cycling.`);
  if (bmi > 28) risk_factors.push('BMI above athletic range — prioritize body-composition phase first.');
  if (priorCycles >= 3) risk_factors.push('Multiple prior cycles — extended recovery and bloodwork strongly advised.');

  const recommended_compounds =
    goal === 'bulk'
      ? ['Testosterone base', 'Progressive overload program', 'Caloric surplus plan']
      : goal === 'cut'
        ? ['Testosterone base', 'High-protein deficit plan', 'Conditioning protocol']
        : ['Testosterone base', 'Balanced recomposition plan', 'Sleep/recovery protocol'];

  const avoided_compounds =
    familyHistory === 'heart_disease'
      ? ['High-dose stimulants', 'Unmonitored oral stacks']
      : familyHistory === 'liver_disease'
        ? ['Oral 17-alpha-alkylated compounds', 'Alcohol during cycle']
        : ['Unsupervised polypharmacy'];

  return {
    potential_score: Math.max(0, Math.min(100, Math.round(score))),
    body_type_assessment: `${bodyType} profile (BMI ${Math.round(bmi * 10) / 10})`,
    recommended_cycle_length: priorCycles > 0 ? 10 : 8,
    recommended_dosage_multiplier: Math.max(0.5, Math.min(2, Math.round((score / 60) * 100) / 100)),
    risk_factors,
    recommended_compounds,
    avoided_compounds,
    personalized_tips: [
      'Use bloodwork before, mid-cycle, and post-PCT.',
      'Track progressive overload weekly.',
      'Keep protein high and sleep consistent.',
    ],
  };
}