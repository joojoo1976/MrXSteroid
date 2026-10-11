/**
 * Tool #078 — Endothelial Health Manager
 * Comprehensive multi-factor screening of vascular endothelial integrity,
 * assessing flow-mediated dilation risk markers, glycocalyx stress,
 * and systemic androgen/cardiovascular impact.
 */

export interface EndothelialHealthInput {
  systolic_bp: number; // 80..220 mmHg
  fasting_glucose_mg_dl?: number; // 50..300 mg/dL
  high_sensitivity_crp_mg_l?: number; // 0.1..20 mg/L
  smoker_or_vaper: boolean;
  androgen_therapy_active: boolean;
  daily_aerobic_movement_mins: number; // 0..180
}

export interface EndothelialHealthResult {
  endothelial_dysfunction_risk_score: number; // 0..100 (higher = worse risk)
  endothelial_status_band: 'resilient-intact' | 'mild-endothelial-stress' | 'moderate-dysfunction-risk' | 'pronounced-endothelial-impairment';
  warnings: string[];
}

export function manageEndothelialHealth(input: EndothelialHealthInput): EndothelialHealthResult {
  const {
    systolic_bp,
    fasting_glucose_mg_dl,
    high_sensitivity_crp_mg_l,
    smoker_or_vaper,
    androgen_therapy_active,
    daily_aerobic_movement_mins,
  } = input;

  const warnings: string[] = ['educational_endothelial_health_screen'];
  let riskScore = 15; // baseline healthy risk

  // Blood pressure shear/damage
  if (systolic_bp >= 140) {
    riskScore += 25;
    warnings.push('hypertensive_pressure_damages_endothelial_glycocalyx');
  } else if (systolic_bp >= 130) {
    riskScore += 15;
  }

  // Fasting glucose (glycation/oxidative stress)
  if (fasting_glucose_mg_dl !== undefined) {
    if (fasting_glucose_mg_dl >= 126) {
      riskScore += 25;
      warnings.push('hyperglycemia_impairs_endothelial_nitric_oxide_synthase');
    } else if (fasting_glucose_mg_dl >= 100) {
      riskScore += 12;
    }
  }

  // hs-CRP inflammation
  if (high_sensitivity_crp_mg_l !== undefined) {
    if (high_sensitivity_crp_mg_l >= 3.0) {
      riskScore += 20;
      warnings.push('systemic_vascular_inflammation_indicated_by_elevated_crp');
    } else if (high_sensitivity_crp_mg_l >= 1.0) {
      riskScore += 10;
    }
  }

  // Smoking / vaping
  if (smoker_or_vaper) {
    riskScore += 20;
    warnings.push('nicotine_and_combustion_products_cause_direct_endothelial_apoptosis');
  }

  // Androgen factor
  if (androgen_therapy_active) {
    riskScore += 8;
  }

  // Exercise protective buffer
  if (daily_aerobic_movement_mins >= 45) {
    riskScore = Math.max(5, riskScore - 15);
  } else if (daily_aerobic_movement_mins >= 20) {
    riskScore = Math.max(5, riskScore - 8);
  }

  const finalScore = Math.max(0, Math.min(100, riskScore));

  let status: EndothelialHealthResult['endothelial_status_band'] = 'mild-endothelial-stress';
  if (finalScore >= 70) {
    status = 'pronounced-endothelial-impairment';
  } else if (finalScore >= 45) {
    status = 'moderate-dysfunction-risk';
  } else if (finalScore <= 25) {
    status = 'resilient-intact';
  }

  return {
    endothelial_dysfunction_risk_score: finalScore,
    endothelial_status_band: status,
    warnings,
  };
}
