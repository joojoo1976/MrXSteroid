/**
 * Tool #025 — Drug Interaction Checker Pro (engine)
 * Pairwise interaction scoring matching the existing schema contract.
 */

import type {
  DrugCompound,
  DrugInteraction,
  DrugInteractionInput,
  DrugInteractionResult,
} from '../schemas/tool-025-drug-interaction-pro';

function pairInteraction(a: DrugCompound, b: DrugCompound): DrugInteraction {
  const sameFamily = a.family === b.family;
  const bothLipo = a.is_lipophilic && b.is_lipophilic;
  const sameTarget = a.primary_target !== 'other' && a.primary_target === b.primary_target;

  if (sameFamily && bothLipo) {
    return {
      compound1: a.name_en,
      compound2: b.name_en,
      interaction_type: 'contraindicated',
      severity: 'critical',
      description: `Duplicate ${a.family} family with dual lipophilic load — compounded liver and lipid strain.`,
      recommendation: 'Do not stack together; pick one and re-evaluate.',
    };
  }
  if (sameTarget) {
    return {
      compound1: a.name_en,
      compound2: b.name_en,
      interaction_type: 'enhanced_side_effect',
      severity: 'moderate',
      description: `Both compounds drive ${a.primary_target} signaling — amplified target effects.`,
      recommendation: 'Monitor target-related side effects and consider dose reduction.',
    };
  }
  if (sameFamily || bothLipo) {
    return {
      compound1: a.name_en,
      compound2: b.name_en,
      interaction_type: 'additive',
      severity: 'moderate',
      description: `${a.name_en} + ${b.name_en} show additive load — monitor closely.`,
      recommendation: 'Standard monitoring with tighter bloodwork cadence.',
    };
  }
  return {
    compound1: a.name_en,
    compound2: b.name_en,
    interaction_type: 'additive',
    severity: 'mild',
    description: `${a.name_en} + ${b.name_en}: no major interaction signal.`,
    recommendation: 'Standard monitoring.',
  };
}

export function checkDrugInteractions(input: DrugInteractionInput): DrugInteractionResult {
  const { compounds, user_age, health_conditions } = input;

  const interactions: DrugInteraction[] = [];
  for (let i = 0; i < compounds.length; i++) {
    for (let j = i + 1; j < compounds.length; j++) {
      interactions.push(pairInteraction(compounds[i], compounds[j]));
    }
  }

  const critical_interactions = interactions.filter((x) => x.severity === 'critical').length;
  const moderate_interactions = interactions.filter((x) => x.severity === 'moderate').length;

  let safety_score = 100 - critical_interactions * 30 - moderate_interactions * 10;
  if (user_age >= 45) safety_score -= 5;
  if (health_conditions.includes('liver') || health_conditions.includes('heart')) safety_score -= 10;
  safety_score = Math.max(0, Math.min(100, safety_score));

  const recommendations: string[] = [];
  if (critical_interactions > 0) recommendations.push('Critical interaction present — revise the stack before starting.');
  else if (moderate_interactions > 0) recommendations.push('Moderate interactions present — tighten monitoring cadence.');
  else recommendations.push('No major interaction signal — proceed with standard monitoring.');
  if (health_conditions.length > 0) {
    recommendations.push(`Pre-existing conditions (${health_conditions.join(', ')}) require medical clearance.`);
  }

  return {
    total_interactions: interactions.length,
    critical_interactions,
    moderate_interactions,
    interactions,
    safety_score,
    recommendations,
  };
}