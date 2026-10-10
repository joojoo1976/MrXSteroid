/**
 * Tool #040 — Lipid Profile Optimizer
 * LDL/HDL/triglycerides vs targets + ASCVD-proxy risk band + intervention ladder.
 * Pure calculation engine (no I/O, no DB).
 */

export interface LipidPanel {
  ldl_mg_dl: number;
  hdl_mg_dl: number;
  triglycerides_mg_dl: number;
  total_cholesterol_mg_dl?: number;
}

export interface LipidOptimizerInput {
  panel: LipidPanel;
  age: number;
  smoker: boolean;
  systolic_bp: number;
  on_cycle: boolean;
  weeks_remaining: number;
}

export type LipidRiskBand = 'optimal' | 'borderline' | 'high' | 'very-high';

export interface LipidOptimizerResult {
  ldl_status: LipidRiskBand;
  hdl_status: LipidRiskBand;
  tg_status: LipidRiskBand;
  non_hdl: number;
  overall_band: LipidRiskBand;
  interventions: string[];
}

const bandRank: Record<LipidRiskBand, number> = { optimal: 0, borderline: 1, high: 2, 'very-high': 3 };

export function optimizeLipidProfile(input: LipidOptimizerInput): LipidOptimizerResult {
  const { panel, age, smoker, systolic_bp, on_cycle, weeks_remaining } = input;
  const interventions: string[] = [];

  // 40.1 NCEP-ATP III style bands (mg/dL)
  const ldl: LipidRiskBand = panel.ldl_mg_dl < 100 ? 'optimal' : panel.ldl_mg_dl < 130 ? 'borderline' : panel.ldl_mg_dl < 160 ? 'high' : 'very-high';
  const hdl: LipidRiskBand = panel.hdl_mg_dl >= 60 ? 'optimal' : panel.hdl_mg_dl >= 40 ? 'borderline' : 'high';
  const tg: LipidRiskBand = panel.triglycerides_mg_dl < 150 ? 'optimal' : panel.triglycerides_mg_dl < 200 ? 'borderline' : panel.triglycerides_mg_dl < 500 ? 'high' : 'very-high';

  const total = panel.total_cholesterol_mg_dl ?? panel.ldl_mg_dl + panel.hdl_mg_dl + panel.triglycerides_mg_dl / 5;
  const nonHdl = Math.round((total - panel.hdl_mg_dl) * 10) / 10;

  let overall = ldl;
  for (const b of [hdl, tg]) if (bandRank[b] > bandRank[overall]) overall = b;

  // 40.2 Cycle + age/BP/smoking escalation
  if (on_cycle && overall === 'optimal') {
    overall = 'borderline';
    interventions.push('On-cycle lipids always drift — retest at week 6 even from an optimal baseline');
  }
  if (on_cycle && overall === 'borderline' && weeks_remaining > 6) {
    interventions.push(`Long cycle tail (${weeks_remaining}w left) with borderline lipids — add cardio + omega-3 now, consider shortening`);
  }
  if (overall === 'high' || overall === 'very-high') {
    interventions.push('Cardio 150+ min/week (zone 2), omega-3 2-4g EPA+DHA/day, soluble fiber 10g+/day');
    interventions.push('Cut saturated fat <7% calories, eliminate trans fats, limit alcohol');
  }
  if (overall === 'very-high') {
    interventions.push('Very-high band — discuss statin/ezetimibe options with a physician; do not start a new cycle');
  }
  if (smoker) interventions.push('Smoking multiplies ASCVD risk with dyslipidemia — cessation is the highest-yield intervention');
  if (systolic_bp >= 140) interventions.push(`SBP ${systolic_bp} hypertensive — address BP alongside lipids (sodium, cardio, sleep)`);
  else if (systolic_bp >= 130) interventions.push(`SBP ${systolic_bp} elevated — monitor twice weekly`);
  if (panel.hdl_mg_dl < 40) interventions.push('HDL < 40 — niacin-free approach: cardio + fat loss + olive oil/fish over refined carbs');
  if (panel.triglycerides_mg_dl >= 500) interventions.push('TG ≥ 500 pancreatitis threshold — urgent medical review, very-low-fat diet interim');
  if (age >= 45 && bandRank[overall] >= bandRank.high) interventions.push('Age 45+ with high lipids — formal ASCVD risk calculator + physician review before continuing');
  if (interventions.length === 0) interventions.push('Lipids optimal — maintain diet/cardio baseline, retest post-cycle');

  return { ldl_status: ldl, hdl_status: hdl, tg_status: tg, non_hdl: nonHdl, overall_band: overall, interventions };
}
