/**
 * lib/tools/engines/lab.ts
 * ═════════════════════════════════════════════════════════════════════════════
 *  Tool #??? — Lab Analyzer (Layer 1).
 * ═════════════════════════════════════════════════════════════════════════════
 * Simple lab analyzer that computes a basic metabolic score from key biomarkers.
 *
 *   Metabolic Score = (Glucose_mg/dL / 100) + (TotalCholesterol_mg/dL / 200) +
 *                     (Triglycerides_mg/dL / 150) - (HDL_mg/dL / 50)
 *
 *   Interpretation:
 *     Score < 0  -> Optimal
 *     0 ≤ Score < 1 -> Borderline
 *     Score ≥ 1 -> High Risk
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 * Runs identically on server (RSC / route handlers) and client.
 */

/** Input lab values in conventional units (mg/dL unless noted). */
export interface LabInput {
  /** Fasting glucose concentration (mg/dL). */
  glucose: number;
  /** Total cholesterol (mg/dL). */
  totalCholesterol: number;
  /** HDL cholesterol (mg/dL). */
  hdl: number;
  /** LDL cholesterol (mg/dL). */
  ldl: number;
  /** Triglycerides (mg/dL). */
  triglycerides: number;
}

/** Output of the lab analysis. */
export interface LabOutput {
  /** The computed metabolic score (unitless). */
  metabolicScore: number;
  /** Interpretation category. */
  category: 'optimal' | 'borderline' | 'highRisk';
  /** Optional: detailed findings for UI. */
  findings: {
    glucoseStatus: 'normal' | 'elevated' | 'high';
    hdlStatus: 'low' | 'normal' | 'high';
    triglyceridesStatus: 'normal' | 'borderline' | 'high';
  };
}

/**
 * Compute the metabolic score and categorize risk.
 * @param input - Lab input values (all in mg/dL).
 * @returns LabOutput with score, category, and findings.
 */
export function calculateLab(input: LabInput): LabOutput {
  // Reference ranges (simplified, based on common guidelines)
  const GLUCOSE_NORMAL_MAX = 99; // mg/dL, fasting
  const GLUCOSE_HIGH_MIN = 126;  // mg/dL, fasting

  const HDL_LOW_THRESHOLD = 40;  // mg/dL for men, 50 for women -> using 40 as conservative
  const HDL_HIGH_THRESHOLD = 60; // mg/dL

  const TRIGLYCERIDES_NORMAL_MAX = 149; // mg/dL
  const TRIGLYCERIDES_BORDERLINE_MAX = 199; // mg/dL

  // Compute metabolic score (formula is illustrative)
  const metabolicScore =
    input.glucose / 100 +
    input.totalCholesterol / 200 +
    input.triglycerides / 150 -
    input.hdl / 50;

  // Determine category
  let category: 'optimal' | 'borderline' | 'highRisk';
  if (metabolicScore < 0) {
    category = 'optimal';
  } else if (metabolicScore < 1) {
    category = 'borderline';
  } else {
    category = 'highRisk';
  }

  // Determine individual findings (simplified)
  const glucoseStatus =
    input.glucose <= GLUCOSE_NORMAL_MAX
      ? 'normal'
      : input.glucose < GLUCOSE_HIGH_MIN
      ? 'elevated'
      : 'high';

  const hdlStatus =
    input.hdl < HDL_LOW_THRESHOLD
      ? 'low'
      : input.hdl > HDL_HIGH_THRESHOLD
      ? 'high'
      : 'normal';

  const triglyceridesStatus =
    input.triglycerides <= TRIGLYCERIDES_NORMAL_MAX
      ? 'normal'
      : input.triglycerides <= TRIGLYCERIDES_BORDERLINE_MAX
      ? 'borderline'
      : 'high';

  return {
    metabolicScore,
    category,
    findings: {
      glucoseStatus,
      hdlStatus,
      triglyceridesStatus
    }
  };
}