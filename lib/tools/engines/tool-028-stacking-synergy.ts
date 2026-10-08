/**
 * Tool #028 — Compound Stacking Synergy (engine)
 * Scores compound combinations against the existing schema contract.
 */

import type {
  StackingCompound,
  StackingSynergyInput,
  StackingSynergyResult,
} from '../schemas/tool-028-stacking-synergy';

function pairScore(a: StackingCompound, b: StackingCompound): number {
  let score = 50;
  if (a.primary_action !== b.primary_action) score += 15;
  else score -= 10;
  if (a.liver_toxicity === 'high' && b.liver_toxicity === 'high') score -= 20;
  if (a.estrogenic !== 'none' && b.estrogenic !== 'none') score -= 10;
  if (a.family === b.family) score -= 5;
  return Math.max(0, Math.min(100, score));
}

export function calculateStackingSynergy(input: StackingSynergyInput): StackingSynergyResult {
  const { compounds, goal } = input;

  const pairs: string[] = [];
  let total = 0;
  let count = 0;
  for (let i = 0; i < compounds.length; i++) {
    for (let j = i + 1; j < compounds.length; j++) {
      const s = pairScore(compounds[i], compounds[j]);
      total += s;
      count++;
      pairs.push(`${compounds[i].name_en} + ${compounds[j].name_en}: synergy ${Math.round(s)}/100`);
    }
  }

  const synergy_score = count > 0 ? Math.round(total / count) : 50;
  const overall_assessment: StackingSynergyResult['overall_assessment'] =
    synergy_score >= 75 ? 'excellent' : synergy_score >= 60 ? 'good' : synergy_score >= 40 ? 'fair' : 'poor';

  return {
    synergy_score,
    overall_assessment,
    compound_pair_interactions: pairs,
    recommended_additions: [`Goal-aligned base: prioritize compounds supporting ${goal}.`],
    avoided_pairs: synergy_score < 40 ? ['Review overlapping hepatotoxic or estrogenic pairs.'] : [],
    protocol_tips: [
      'Keep testosterone as the cycle base unless contraindicated.',
      'Limit overlapping liver-toxic orals.',
      'Re-check synergy after any dose change.',
    ],
    best_for_goal: goal,
  };
}