/**
 * Tool #100 — Comprehensive Report Generator
 * Layer 1: Pure TypeScript calculation engine.
 * Synthesizes multi-pillar biomarker metrics (Cardiovascular, Hepatic, Endocrine, Metabolic)
 * into a single unified health index and audit trail score.
 */

export interface ComprehensiveReportGeneratorInput {
  cardiovascular_risk_score: number; // 0..100
  hepatic_stress_score: number; // 0..100
  endocrine_suppression_score: number; // 0..100
  metabolic_vitality_score: number; // 0..100
  active_red_flag_symptoms_count: number;
}

export interface ComprehensiveReportGeneratorResult {
  unified_health_index: number; // 0..100
  overall_governance_tier: 'harmonious-optimal' | 'moderate-vigilance' | 'clinical-escalation-required';
  flagged_domains: string[];
  action_plan_summary: string[];
}

export function generateComprehensiveReport(input: ComprehensiveReportGeneratorInput): ComprehensiveReportGeneratorResult {
  const {
    cardiovascular_risk_score,
    hepatic_stress_score,
    endocrine_suppression_score,
    metabolic_vitality_score,
    active_red_flag_symptoms_count,
  } = input;

  const flagged_domains: string[] = [];
  const action_plan_summary: string[] = ['educational_multi_pillar_health_synthesis'];

  if (cardiovascular_risk_score > 60) {
    flagged_domains.push('Cardiovascular Strain');
    action_plan_summary.push('prioritize_lipid_and_blood_pressure_monitoring');
  }
  if (hepatic_stress_score > 60) {
    flagged_domains.push('Hepatic / Biliary Strain');
    action_plan_summary.push('assess_alt_ast_ggt_and_discontinue_hepatotoxic_agents');
  }
  if (endocrine_suppression_score > 60) {
    flagged_domains.push('Endocrine HPTA Suppression');
    action_plan_summary.push('evaluate_lh_fsh_and_total_testosterone_recovery_pathways');
  }
  if (metabolic_vitality_score < 40) {
    flagged_domains.push('Metabolic / Glycemic Strain');
    action_plan_summary.push('optimize_insulin_sensitivity_and_cardiorespiratory_fitness');
  }

  // Weight average of pillars (inverting risk metrics where lower is better)
  const cardioHealth = 100 - cardiovascular_risk_score;
  const liverHealth = 100 - hepatic_stress_score;
  const endocrineHealth = 100 - endocrine_suppression_score;
  const metabolicHealth = metabolic_vitality_score;

  let average = (cardioHealth + liverHealth + endocrineHealth + metabolicHealth) / 4;
  average -= active_red_flag_symptoms_count * 10;

  const unified_health_index = Math.min(100, Math.max(0, Math.round(average)));

  let overall_governance_tier: 'harmonious-optimal' | 'moderate-vigilance' | 'clinical-escalation-required';
  if (active_red_flag_symptoms_count >= 2 || unified_health_index < 45) {
    overall_governance_tier = 'clinical-escalation-required';
    action_plan_summary.push('multiple_biomarker_alarms_mandate_physician_directed_comprehensive_bloodwork');
  } else if (unified_health_index < 75) {
    overall_governance_tier = 'moderate-vigilance';
  } else {
    overall_governance_tier = 'harmonious-optimal';
  }

  return {
    unified_health_index,
    overall_governance_tier,
    flagged_domains,
    action_plan_summary,
  };
}
