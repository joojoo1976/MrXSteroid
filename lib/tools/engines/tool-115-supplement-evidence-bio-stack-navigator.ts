/**
 * Tool #115 - Supplement Evidence & Bio-Stack Navigator
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool grades supplement evidence from user-provided
 * study data. It does not access PubMed, generate medical advice, recommend
 * dosages, or assess safety for individuals. It is an educational framework
 * for evaluating evidence quality.
 *
 * Model
 * -----
 * Evidence Grade (A-D):
 * A: Multiple RCTs, meta-analyses, consistent large effects
 * B: Some RCTs, consistent moderate effects
 * C: Limited RCTs, observational data, small effects
 * D: Theoretical, mechanistic only, conflicting or no human data
 *
 * Interaction Risk: Theoretical pharmacological interaction assessment
 * Bio-Stack Compatibility: Synergy/antagonism scoring from user inputs
 */

export type EvidenceGrade = 'A' | 'B' | 'C' | 'D';
export type StudyType = 'rct' | 'meta_analysis' | 'observational' | 'animal' | 'in_vitro' | 'theoretical';
export type InteractionRisk = 'none' | 'theoretical' | 'moderate' | 'high';
export type StackEffect = 'synergistic' | 'additive' | 'neutral' | 'antagonistic' | 'unknown';

export interface Supplement {
  id: string;
  name: string;
  category: 'vitamin' | 'mineral' | 'amino_acid' | 'herbal' | 'prohormone' | 'peptide' | 'other';
  // User-provided evidence
  studies: Array<{
    type: StudyType;
    sample_size?: number;
    effect_size?: number; // Cohen's d or similar
    p_value?: number;
    quality_score?: number; // 0-10 (Jadad, Cochrane risk of bias, etc.)
    outcome: string;
    year: number;
  }>;
  claimed_benefits: string[];
  typical_dose: string;
  safety_notes?: string;
}

export interface SupplementStackInput {
  supplements: Supplement[];
  goals: string[]; // e.g., ['muscle_growth', 'fat_loss', 'recovery']
}

export interface SupplementResult {
  supplements: Array<{
    id: string;
    name: string;
    evidence_grade: EvidenceGrade;
    evidence_summary: string;
    total_studies: number;
    rct_count: number;
    meta_analysis_count: number;
    avg_quality_score: number | null;
    primary_outcomes: string[];
    interaction_risk: InteractionRisk;
    theoretical_interactions: string[];
  }>;
  stack_analysis: {
    overall_synergy: StackEffect;
    pairwise_interactions: Array<{
      supplement_a: string;
      supplement_b: string;
      effect: StackEffect;
      mechanism: string;
      risk: InteractionRisk;
    }>;
    goal_alignment: Record<string, number>; // goal -> 0-100 alignment score
  };
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

function gradeEvidence(supp: Supplement): { grade: EvidenceGrade; summary: string; avgQuality: number | null } {
  const { studies } = supp;
  if (studies.length === 0) {
    return { grade: 'D', summary: 'No studies provided', avgQuality: null };
  }

  const rcts = studies.filter((s) => s.type === 'rct');
  const metaAnalyses = studies.filter((s) => s.type === 'meta_analysis');
  const hasLargeRCT = rcts.some((s) => (s.sample_size ?? 0) >= 100);
  const hasMetaAnalysis = metaAnalyses.length > 0;
  const avgQuality = studies.filter((s) => s.quality_score !== undefined).reduce((sum, s) => sum + (s.quality_score ?? 0), 0) /
    Math.max(1, studies.filter((s) => s.quality_score !== undefined).length);

  let grade: EvidenceGrade = 'D';
  let summary = '';

  if (hasMetaAnalysis && (hasLargeRCT || metaAnalyses.length >= 2)) {
    grade = 'A';
    summary = 'Multiple high-quality RCTs and/or meta-analyses support efficacy';
  } else if (rcts.length >= 2 && rcts.every((s) => (s.p_value ?? 1) < 0.05)) {
    grade = 'B';
    summary = 'Multiple RCTs with significant effects';
  } else if (rcts.length >= 1 || studies.some((s) => s.type === 'observational')) {
    grade = 'C';
    summary = 'Limited RCT or observational evidence';
  } else {
    grade = 'D';
    summary = 'Theoretical, mechanistic, or animal/in-vitro data only';
  }

  if (avgQuality !== null && avgQuality < 4) {
    if (grade === 'A') grade = 'B';
    else if (grade === 'B') grade = 'C';
    else if (grade === 'C') grade = 'D';
    summary += '; quality concerns noted';
  }

  return { grade, summary, avgQuality: avgQuality === null ? null : Math.round(avgQuality * 10) / 10 };
}

// Intentionally empty until each interaction has a reviewed, cited source.
const INTERACTION_MATRIX: Record<string, Record<string, { effect: StackEffect; risk: InteractionRisk; mechanism: string }>> = {};

function assessPairwiseInteraction(suppA: string, suppB: string): { effect: StackEffect; risk: InteractionRisk; mechanism: string } {
  const keyA = suppA.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const keyB = suppB.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (INTERACTION_MATRIX[keyA]?.[keyB]) {
    return INTERACTION_MATRIX[keyA][keyB];
  }
  if (INTERACTION_MATRIX[keyB]?.[keyA]) {
    return INTERACTION_MATRIX[keyB][keyA];
  }
  return { effect: 'unknown', risk: 'none', mechanism: 'Interaction not assessed: this tool has no reviewed source for this pair' };
}

function assessStackSynergy(supplements: Supplement[], requestedGoals: string[]): SupplementResult['stack_analysis'] {
  const names = supplements.map((s) => s.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  const pairwise: SupplementResult['stack_analysis']['pairwise_interactions'] = [];

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const interaction = assessPairwiseInteraction(names[i], names[j]);
      pairwise.push({
        supplement_a: supplements[i].name,
        supplement_b: supplements[j].name,
        ...interaction,
      });
    }
  }

  // Overall synergy: if any high-risk antagonistic, mark antagonistic
  // Else if any synergistic, mark synergistic
  // Else if any additive, mark additive
  // Else unknown
  let overall: StackEffect = 'unknown';
  const hasAntagonistic = pairwise.some((p) => p.effect === 'antagonistic' && p.risk !== 'none');
  const hasSynergistic = pairwise.some((p) => p.effect === 'synergistic');
  const hasAdditive = pairwise.some((p) => p.effect === 'additive');

  if (hasAntagonistic) overall = 'antagonistic';
  else if (hasSynergistic) overall = 'synergistic';
  else if (hasAdditive) overall = 'additive';
  else if (pairwise.length > 0 && pairwise.every((p) => p.effect === 'unknown')) overall = 'unknown';
  else overall = 'neutral';

  // Goal alignment (simplified heuristic)
  const goals = requestedGoals.length > 0
    ? requestedGoals
    : ['muscle_growth', 'fat_loss', 'recovery', 'strength', 'endurance', 'health'];
  const goalAlignment: Record<string, number> = {};
  for (const goal of goals) {
    let score = 50; // baseline
    for (const supp of supplements) {
      const claimed = supp.claimed_benefits.map((b) => b.toLowerCase());
      if (claimed.some((c) => c.includes(goal.replace('_', ' ')) || goal.includes(c))) {
        score += 15;
      }
      // Category bonuses
      if (goal === 'muscle_growth' && ['amino_acid', 'prohormone', 'peptide'].includes(supp.category)) score += 10;
      if (goal === 'recovery' && ['amino_acid', 'vitamin', 'mineral'].includes(supp.category)) score += 10;
      if (goal === 'fat_loss' && ['herbal', 'other'].includes(supp.category)) score += 5;
    }
    goalAlignment[goal] = Math.min(100, score);
  }

  return {
    overall_synergy: overall,
    pairwise_interactions: pairwise,
    goal_alignment: goalAlignment,
  };
}

export function calcSupplementStack(input: SupplementStackInput): SupplementResult {
  const { supplements, goals } = input;

  if (supplements.length === 0) {
    return {
      supplements: [],
      stack_analysis: {
        overall_synergy: 'unknown',
        pairwise_interactions: [],
        goal_alignment: {},
      },
      flags: ['no_supplements_provided'],
      education_flags: ['insufficient_data_for_analysis'],
      scope_notice: 'educational_evidence_grader_not_medical_advice',
    };
  }

  const processedSupps = supplements.map((supp) => {
    const { grade, summary, avgQuality } = gradeEvidence(supp);
    const theoreticalInteractions: string[] = [];

    // Check theoretical interactions with other supplements in stack
    for (const other of supplements) {
      if (other.id === supp.id) continue;
      const interaction = assessPairwiseInteraction(supp.name, other.name);
      if (interaction.risk !== 'none') {
        theoreticalInteractions.push(`${other.name}: ${interaction.mechanism} (${interaction.risk} risk)`);
      }
    }

    let interactionRisk: InteractionRisk = 'none';
    if (theoreticalInteractions.some((t) => t.includes('high risk'))) interactionRisk = 'high';
    else if (theoreticalInteractions.some((t) => t.includes('moderate risk'))) interactionRisk = 'moderate';
    else if (theoreticalInteractions.length > 0) interactionRisk = 'theoretical';

    return {
      id: supp.id,
      name: supp.name,
      evidence_grade: grade,
      evidence_summary: summary,
      total_studies: supp.studies.length,
      rct_count: supp.studies.filter((s) => s.type === 'rct').length,
      meta_analysis_count: supp.studies.filter((s) => s.type === 'meta_analysis').length,
      avg_quality_score: avgQuality,
      primary_outcomes: [...new Set(supp.studies.map((s) => s.outcome))],
      interaction_risk: interactionRisk,
      theoretical_interactions: theoreticalInteractions,
    };
  });

  const stackAnalysis = assessStackSynergy(supplements, goals);

  const flags: string[] = [];
  if (processedSupps.some((s) => s.evidence_grade === 'D')) flags.push('contains_supplements_with_grade_D_evidence');
  if (processedSupps.some((s) => s.interaction_risk === 'high')) flags.push('high_risk_interaction_detected');
  if (processedSupps.some((s) => s.interaction_risk === 'moderate')) flags.push('moderate_risk_interaction_detected');
  if (stackAnalysis.overall_synergy === 'antagonistic') flags.push('stack_may_have_antagonistic_interactions');
  if (supplements.length > 10) flags.push('large_stack_polypharmacy_concern');

  return {
    supplements: processedSupps,
    stack_analysis: stackAnalysis,
    flags,
    education_flags: [
      'evidence_grades_based_on_user_provided_studies_not_systematic_review',
      'supplement_interactions_are_not_assessed_without_reviewed_sources',
      'not_a_safety_assessment_or_dosage_recommendation',
      'consult_qualified_healthcare_provider_before_supplementation',
      'evidence_quality_assessment_simplified_for_educational_use',
    ],
    scope_notice: 'educational_evidence_grader_not_medical_advice_or_safety_assessment',
  };
}
