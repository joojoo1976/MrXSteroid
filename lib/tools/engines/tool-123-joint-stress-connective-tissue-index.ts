/**
 * Tool #123 - Joint Stress & Connective Tissue Load Risk Index
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates joint stress and connective tissue
 * load risk from training parameters. It does not diagnose injuries,
 * replace medical imaging, or guarantee injury prevention.
 * Results are educational references only.
 *
 * Model
 * -----
 * Joint Stress Index = Σ (Exercise_Stress × Volume × Intensity × Biomechanical_Factor)
 * Connective Tissue Risk = f(Joint_Stress, Recovery_Time, Nutrition, Age, History)
 * Risk Levels: Low/Moderate/High/Critical
 */

export type JointStressInput = {
  exercises: Array<{
    name: string;
    joint: 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'spine';
    sets: number;
    reps: number;
    weight_kg: number;
    rpe?: number;
    range_of_motion: 'partial' | 'full' | 'extended';
  }>;
  age: number;
  training_age_years: number;
  sleep_hours: number;
  protein_g_per_kg: number;
  collagen_intake_g?: number;
  omega3_g?: number;
  previous_injuries: string[];
  chronic_pain_joints: string[];
};

export interface JointStressResult {
  overall_stress_index: number; // 0-100
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  joint_breakdown: Record<string, {
    stress_score: number;
    risk_level: 'low' | 'moderate' | 'high' | 'critical';
    cumulative_load_kg: number;
    biomechanical_factor: number;
  }>;
  connective_tissue_risk: number; // 0-100
  risk_factors: string[];
  protective_factors: string[];
  recommendations: string[];
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

const JOINT_BIOMECHANICAL_FACTORS: Record<string, number> = {
  shoulder: 1.3,
  elbow: 1.1,
  wrist: 1.0,
  hip: 1.0,
  knee: 1.2,
  ankle: 1.0,
  spine: 1.2,
};

function calcJointStress(input: JointStressInput): JointStressResult {
  const { exercises, age, training_age_years, sleep_hours, protein_g_per_kg, collagen_intake_g, omega3_g, previous_injuries, chronic_pain_joints } = input;

  if (exercises.length === 0) {
    return {
      overall_stress_index: 0,
      risk_level: 'low',
      joint_breakdown: {},
      connective_tissue_risk: 0,
      risk_factors: [],
      protective_factors: [],
      recommendations: ['No exercises provided'],
      flags: ['no_exercises_provided'],
      education_flags: ['insufficient_data'],
      scope_notice: 'educational_joint_stress_reference_not_medical_assessment',
    };
  }

  const jointBreakdown: JointStressResult['joint_breakdown'] = {};
  let totalStress = 0;

  for (const ex of exercises) {
    const joint = ex.joint;
    const bioFactor = JOINT_BIOMECHANICAL_FACTORS[joint] ?? 1.0;
    const volumeLoad = ex.sets * ex.reps * ex.weight_kg;
    const intensityFactor = 1 + Math.max(0, (ex.rpe ?? 7) - 7) * 0.15;
    const romFactor = ex.range_of_motion === 'extended' ? 1.2 : ex.range_of_motion === 'partial' ? 0.8 : 1.0;

    const stressScore = Math.min(100, volumeLoad * bioFactor * intensityFactor * romFactor * 0.001);

    let riskLevel: JointStressResult['joint_breakdown'][string]['risk_level'] = 'low';
    if (stressScore > 70) riskLevel = 'critical';
    else if (stressScore > 50) riskLevel = 'high';
    else if (stressScore > 30) riskLevel = 'moderate';

    if (!jointBreakdown[joint]) {
      jointBreakdown[joint] = {
        stress_score: 0,
        risk_level: 'low',
        cumulative_load_kg: 0,
        biomechanical_factor: bioFactor,
      };
    }

    jointBreakdown[joint].stress_score = Math.max(jointBreakdown[joint].stress_score, stressScore);
    jointBreakdown[joint].risk_level = riskLevel;
    jointBreakdown[joint].cumulative_load_kg += ex.sets * ex.reps * ex.weight_kg;

    totalStress += stressScore;
  }

  // Overall risk level
  let overallRiskLevel: JointStressResult['risk_level'] = 'low';
  if (totalStress > 200) overallRiskLevel = 'critical';
  else if (totalStress > 120) overallRiskLevel = 'high';
  else if (totalStress > 60) overallRiskLevel = 'moderate';

  // Connective tissue risk
  let ctRisk = Math.min(100, totalStress * 0.5);
  if (age > 40) ctRisk *= 1.2;
  if (input.sleep_hours < 7) ctRisk *= 1.2;
  if (input.protein_g_per_kg < 1.6) ctRisk *= 1.15;
  if (input.collagen_intake_g === undefined || (input.collagen_intake_g ?? 0) < 5) ctRisk *= 1.1;
  if (input.omega3_g === undefined || (input.omega3_g ?? 0) < 1) ctRisk *= 1.1;
  if (input.previous_injuries.length > 0) ctRisk *= 1.3;
  if (input.chronic_pain_joints.length > 0) ctRisk *= 1.5;
  ctRisk = Math.min(100, ctRisk);

  // Risk factors
  const riskFactors: string[] = [];
  if (totalStress > 150) riskFactors.push('high_overall_joint_load');
  if (input.age > 40) riskFactors.push('age_related_tissue_stiffness');
  if (input.sleep_hours < 7) riskFactors.push('insufficient_sleep_for_recovery');
  if (input.protein_g_per_kg < 1.6) riskFactors.push('suboptimal_protein_for_tissue_repair');
  if (input.previous_injuries.length > 0) riskFactors.push('history_of_joint_injuries');
  if (input.chronic_pain_joints.length > 0) riskFactors.push('chronic_joint_pain_present');
  if (input.collagen_intake_g === undefined || (input.collagen_intake_g ?? 0) < 5) riskFactors.push('low_collagen_intake');
  if (input.omega3_g === undefined || (input.omega3_g ?? 0) < 1) riskFactors.push('low_omega3_intake');

  // Protective factors
  const protectiveFactors: string[] = [];
  if (input.sleep_hours >= 8) protectiveFactors.push('adequate_sleep');
  if (input.protein_g_per_kg >= 2.0) protectiveFactors.push('high_protein_intake');
  if ((input.collagen_intake_g ?? 0) >= 10) protectiveFactors.push('high_collagen_intake');
  if ((input.omega3_g ?? 0) >= 2) protectiveFactors.push('high_omega3_intake');
  if (input.training_age_years > 5) protectiveFactors.push('experienced_lifter_tissue_adaptation');

  // Recommendations
  const recommendations: string[] = [];
  if (totalStress > 100) recommendations.push('Consider reducing volume or intensity for high-stress joints');
  if (input.age > 35) recommendations.push('Include joint mobility and warm-up routines');
  if (input.sleep_hours < 7) recommendations.push('Prioritize 7-9 hours sleep for tissue recovery');
  if (input.protein_g_per_kg < 1.6) recommendations.push('Increase protein to 1.6-2.2 g/kg for tissue repair');
  if ((input.collagen_intake_g ?? 0) < 10) recommendations.push('Consider 10-15g collagen daily for connective tissue');
  if ((input.omega3_g ?? 0) < 2) recommendations.push('Consider 2-3g EPA/DHA daily for anti-inflammatory effects');

  const flags: string[] = [];
  if (totalStress > 200) flags.push('critical_joint_load_detected');
  if (Object.values(jointBreakdown).some(j => j.risk_level === 'critical')) flags.push('critical_risk_joint_detected');
  if (input.chronic_pain_joints.length > 0) flags.push('training_through_pain_detected');

  return {
    overall_stress_index: Math.round(totalStress),
    risk_level: overallRiskLevel,
    joint_breakdown: Object.fromEntries(
      Object.entries(jointBreakdown).map(([k, v]) => [k, {
        stress_score: Math.round(v.stress_score),
        risk_level: v.risk_level,
        cumulative_load_kg: Math.round(v.cumulative_load_kg),
        biomechanical_factor: Math.round(v.biomechanical_factor * 100) / 100,
      }])
    ),
    connective_tissue_risk: Math.round(ctRisk),
    risk_factors: riskFactors,
    protective_factors: protectiveFactors,
    recommendations,
    flags,
    education_flags: [
      'estimates_based_on_biomechanical_models_not_imaging',
      'does_not_replace_medical_evaluation_or_imaging',
      'individual_joint_tolerance_varies_significantly',
      'pain_is_a_warning_signal_not_a_metric_to_push_through',
    ],
    scope_notice: 'educational_joint_stress_reference_not_medical_diagnosis',
  };
}

export { calcJointStress as calcJointStressConnectiveTissue };