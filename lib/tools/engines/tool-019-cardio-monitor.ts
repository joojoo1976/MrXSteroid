/**
 * Tool #019 — Cardiovascular Health Monitor
 * Layer 19: Cardiac Risk & Cholesterol Monitoring
 * Platform: MrXSteroid.com | Core: Heart Health & Cardiovascular Risk
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Track blood pressure, cholesterol markers over time
 * - Calculate cardiovascular risk score based on compounds & metrics
 * - Identify compound-specific cardiac risks
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface CardioInput {
  systolic_bp: number;    // mmHg
  diastolic_bp: number;   // mmHg
  heart_rate: number;     // bpm
  cholesterol_total: number; // mg/dL
  hdl_cholesterol: number; // mg/dL
  ldl_cholesterol?: number; // mg/dL (calculated if not provided)
  triglycerides?: number; // mg/dL
  compounds: any[];       // Compound items from DB
  cycle_length_weeks: number;
}

export interface CardioRisk {
  overall_risk: 'low' | 'moderate' | 'high';
  risk_score: number; // 0-100
  cholesterol_ratio: number; // Total/HDL ratio
  risk_factors: string[];
  compound_warnings: string[];
  recommendations: string[];
}

export function calculateCardioRisk(input: CardioInput): CardioRisk {
  const { systolic_bp, diastolic_bp, heart_rate, cholesterol_total, hdl_cholesterol, ldl_cholesterol, triglycerides, compounds, cycle_length_weeks } = input;
  
  // Calculate total cholesterol if LDL not provided
  const calculatedLDL = ldl_cholesterol || Math.max(0, cholesterol_total - hdl_cholesterol - (triglycerides || 0) / 5);
  
  // Calculate cholesterol ratio
  const cholesterolRatio = cholesterol_total / hdl_cholesterol;
  
  // Blood pressure risk
  let systolicRisk = 0;
  if (systolic_bp >= 180) systolicRisk = 25;
  else if (systolic_bp >= 140) systolicRisk = 15;
  else if (systolic_bp >= 120) systolicRisk = 5;
  
  const diastolicRisk = diastolic_bp >= 90 ? 10 : diastolic_bp >= 80 ? 5 : 0;
  
  // Cholesterol risk
  let cholesterolRisk = 0;
  if (cholesterolRatio > 5) cholesterolRisk = 20;
  else if (cholesterolRatio > 4) cholesterolRisk = 15;
  else if (cholesterolRatio > 3) cholesterolRisk = 5;
  
  // Lipophilic compound risk
  let compoundRisk = 0;
  const lipophilicCount = compounds.filter(c => c.is_lipophilic).length;
  compoundRisk = lipophilicCount * 10;
  
  // Heart rate risk
  let hrRisk = 0;
  if (heart_rate > 100) hrRisk = 10;
  else if (heart_rate > 90) hrRisk = 5;
  
  // Total risk score
  const riskScore = systolicRisk + diastolicRisk + cholesterolRisk + compoundRisk + hrRisk;
  const overallRisk = riskScore > 60 ? 'high' : riskScore > 30 ? 'moderate' : 'low';
  
  // Generate risk factors
  const riskFactors: string[] = [];
  if (systolicRisk > 0) riskFactors.push(`Blood pressure ${systolic_bp}/${diastolic_bp} mmHg elevated`);
  if (cholesterolRisk > 0) riskFactors.push(`Cholesterol ratio ${cholesterolRatio.toFixed(1)} (Total/HDL)`);
  if (compoundRisk > 0) riskFactors.push(`${lipophilicCount} lipophilic compound(s) - may affect lipids`);
  if (hrRisk > 0) riskFactors.push(`Heart rate ${heart_rate} bpm ${heart_rate > 100 ? 'tachycardia' : 'elevated'}`);
  
  // Generate compound warnings
  const compoundWarnings: string[] = [];
  for (const compound of compounds) {
    if (compound.is_lipophilic) {
      compoundWarnings.push(`${compound.name_en} (lipocratic) - monitor liver enzymes & lipids`);
    }
    if (compound.aromatization_factor && compound.aromatization_factor > 0.5) {
      compoundWarnings.push(`${compound.name_en} - may elevate estrogen, affecting cardiovascular health`);
    }
  }
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (overallRisk === 'high') {
    recommendations.push('HIGH cardiovascular risk - consult physician immediately');
    recommendations.push('Consider cycle cessation or significant dosage reduction');
    recommendations.push('Comprehensive cardiac panel bloodwork');
  }
  
  if (overallRisk === 'moderate') {
    recommendations.push('Moderate risk - monitor closely');
    recommendations.push('Quarterly lipid panels');
    recommendations.push('Cardio support: Omega-3, garlic extract, CoQ10');
  }
  
  if (overallRisk === 'low') {
    recommendations.push('Low risk - maintain current protocol');
    recommendations.push('Annual cardiovascular screening');
    recommendations.push('Continue cardio exercise & healthy diet');
  }
  
  if (lipophilicCount > 2) {
    recommendations.push('Multiple lipophilic compounds - consider cycle support supplements');
    recommendations.push('TUDCA or liver protectant recommended');
  }
  
  return {
    overall_risk: overallRisk,
    risk_score: riskScore,
    cholesterol_ratio: Math.round(cholesterolRatio * 10) / 10,
    risk_factors,
    compound_warnings,
    recommendations,
  };
}