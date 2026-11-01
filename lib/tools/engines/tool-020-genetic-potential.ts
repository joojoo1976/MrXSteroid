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
  if (familyHistory !== 'none') risk_factors.push(`Recorded family-history category: ${familyHistory.replace(/_/g, ' ')}.`);
  if (bmi > 28) risk_factors.push('BMI-derived value is above 28; BMI does not distinguish fat from lean mass.');
  if (priorCycles >= 3) risk_factors.push('Three or more prior cycles were reported; this score does not assess health or recovery.');

  return {
    potential_score: Math.max(0, Math.min(100, Math.round(score))),
    body_type_assessment: `${bodyType} profile (BMI ${Math.round(bmi * 10) / 10})`,
    risk_factors,
  };
}
