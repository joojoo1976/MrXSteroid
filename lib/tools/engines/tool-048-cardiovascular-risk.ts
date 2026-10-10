/**
 * Tool #048 — Cardiovascular Risk Assessor
 * Educational additive risk model (documented heuristic inspired by the
 * Framingham-style factor families; explicitly NOT the clinical ASCVD PCE).
 * Factor weights are fixed and disclosed. Pure engine, no I/O.
 */

export interface CardioRiskInput {
  age: number; // 18..90
  sex: 'male' | 'female';
  smoker: boolean;
  systolic_bp: number; // 80..220 mmHg
  total_cholesterol: number; // 100..400 mg/dL
  hdl: number; // 20..110 mg/dL
  on_cycle: boolean;
}

export type CardioRiskBand = 'low' | 'moderate' | 'elevated' | 'high';

export interface CardioRiskResult {
  risk_pct_10yr: number; // 0..60 (educational ceiling)
  band: CardioRiskBand;
  drivers: string[];
  mitigations: string[];
  warnings: string[];
}

/** Driver detection thresholds + 1:1 mitigation mapping (order = output order). */
const DRIVERS: Array<{ code: string; hit: (i: CardioRiskInput) => boolean; mitigation: string }> = [
  { code: 'age', hit: (i) => i.age >= 45, mitigation: 'annual_bp_lipid_panels' },
  { code: 'blood_pressure', hit: (i) => i.systolic_bp > 130, mitigation: 'bp_management' },
  { code: 'total_cholesterol', hit: (i) => i.total_cholesterol > 200, mitigation: 'lipid_optimization' },
  { code: 'low_hdl', hit: (i) => i.hdl < 40, mitigation: 'raise_hdl_cardio' },
  { code: 'smoking', hit: (i) => i.smoker, mitigation: 'smoking_cessation' },
  { code: 'on_cycle_burden', hit: (i) => i.on_cycle, mitigation: 'cycle_responsibility_bp_lipid_monitoring' },
];

export function assessCardiovascularRisk(input: CardioRiskInput): CardioRiskResult {
  const { age, sex, smoker, systolic_bp, total_cholesterol, hdl, on_cycle } = input;

  // Fixed disclosed weights (percentage points).
  const raw =
    (age - 18) * 0.35 + // age accrual
    Math.max(0, systolic_bp - 120) * 0.08 +
    Math.max(0, total_cholesterol - 180) * 0.04 +
    Math.max(0, 45 - hdl) * 0.1 +
    (smoker ? 4 : 0) +
    (on_cycle ? 3 : 0) +
    (sex === 'male' ? 1 : 0);

  const risk_pct_10yr = Math.min(60, Math.max(0, Math.round(raw)));
  const band: CardioRiskBand = risk_pct_10yr < 5 ? 'low' : risk_pct_10yr < 10 ? 'moderate' : risk_pct_10yr < 20 ? 'elevated' : 'high';

  const active = DRIVERS.filter((d) => d.hit(input));
  const warnings: string[] = ['educational_not_clinical_ascvd'];
  if (risk_pct_10yr >= 20) warnings.push('consult_physician');

  return {
    risk_pct_10yr,
    band,
    drivers: active.map((d) => d.code),
    mitigations: active.map((d) => d.mitigation),
    warnings,
  };
}
