/**
 * Tool #075 — Arterial Health Manager
 * Evaluates markers of vascular compliance and cardiovascular arterial health:
 * - Pulse Pressure (PP = SBP - DBP)
 * - Total Cholesterol to HDL ratio (optimal <3.5, high risk >5.0)
 * - Triglyceride to HDL ratio (marker of small dense LDL / insulin resistance: optimal <2.0, high risk >3.5)
 * - Age and smoking factors.
 * Pure deterministic cardiovascular screening index — not diagnostic of coronary artery disease.
 */

export interface ArterialHealthInput {
  age: number; // 20..90
  systolic_mmhg: number; // 70..240
  diastolic_mmhg: number; // 40..150
  total_cholesterol_mg_dl?: number; // 100..500
  hdl_mg_dl?: number; // 10..150
  triglycerides_mg_dl?: number; // 30..1000
  smoker: boolean;
}

export interface ArterialHealthResult {
  arterial_risk_score: number; // 0..100
  stiffness_risk_band: 'low-stiffness-risk' | 'moderate-stiffness-risk' | 'elevated-stiffness-risk';
  tg_to_hdl_ratio: number | null;
  tc_to_hdl_ratio: number | null;
  warnings: string[];
}

export function manageArterialHealth(input: ArterialHealthInput): ArterialHealthResult {
  const {
    age,
    systolic_mmhg,
    diastolic_mmhg,
    total_cholesterol_mg_dl,
    hdl_mg_dl,
    triglycerides_mg_dl,
    smoker,
  } = input;

  const warnings: string[] = ['educational_arterial_health_screen'];

  const pulse_pressure = systolic_mmhg - diastolic_mmhg;
  let score = 10; // baseline

  // Pulse pressure stiffness indicator
  if (pulse_pressure >= 65) {
    score += 30;
    warnings.push('wide_pulse_pressure_correlates_with_central_aortic_stiffness');
  } else if (pulse_pressure >= 50) {
    score += 15;
  }

  // Age vascular remodeling factor
  if (age >= 55) {
    score += 20;
  } else if (age >= 40) {
    score += 10;
  }

  // Smoking endotoxicity
  if (smoker) {
    score += 25;
    warnings.push('smoking_impairs_endothelial_nitric_oxide_and_stiffens_vessels');
  }

  // Lipid atherogenic ratios
  let tc_to_hdl_ratio: number | null = null;
  if (typeof total_cholesterol_mg_dl === 'number' && typeof hdl_mg_dl === 'number' && hdl_mg_dl > 0) {
    tc_to_hdl_ratio = Math.round((total_cholesterol_mg_dl / hdl_mg_dl) * 10) / 10;
    if (tc_to_hdl_ratio >= 5.0) {
      score += 20;
      warnings.push('elevated_total_cholesterol_to_hdl_ratio_atherogenic_risk');
    } else if (tc_to_hdl_ratio >= 3.8) {
      score += 10;
    }
  }

  let tg_to_hdl_ratio: number | null = null;
  if (typeof triglycerides_mg_dl === 'number' && typeof hdl_mg_dl === 'number' && hdl_mg_dl > 0) {
    tg_to_hdl_ratio = Math.round((triglycerides_mg_dl / hdl_mg_dl) * 10) / 10;
    if (tg_to_hdl_ratio >= 3.5) {
      score += 20;
      warnings.push('high_tg_to_hdl_ratio_indicates_atherogenic_dyslipidemia');
    } else if (tg_to_hdl_ratio >= 2.0) {
      score += 10;
    }
  }

  score = Math.max(0, Math.min(100, score));

  let stiffness_risk_band: ArterialHealthResult['stiffness_risk_band'];
  if (score <= 30) {
    stiffness_risk_band = 'low-stiffness-risk';
  } else if (score <= 65) {
    stiffness_risk_band = 'moderate-stiffness-risk';
  } else {
    stiffness_risk_band = 'elevated-stiffness-risk';
    warnings.push('vascular_stiffness_and_atherogenic_markers_warrant_cardiology_review');
  }

  return {
    arterial_risk_score: score,
    stiffness_risk_band,
    tg_to_hdl_ratio,
    tc_to_hdl_ratio,
    warnings: [...new Set(warnings)],
  };
}
