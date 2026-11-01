/**
 * Tool #074 — Blood Pressure Tracker
 * Evaluates resting blood pressure readings according to AHA/ACC guidelines:
 * - Normal: <120 and <80
 * - Elevated: 120–129 and <80
 * - Stage 1 HTN: 130–139 or 80–89
 * - Stage 2 HTN: >=140 or >=90
 * - Hypertensive Crisis: >180 or >120 (immediate emergency medical evaluation)
 * Computes mean arterial pressure (MAP = DBP + (SBP - DBP)/3) and pulse pressure (PP = SBP - DBP).
 * Pure deterministic screening engine.
 */

export interface BloodPressureInput {
  systolic_mmhg: number; // 70..240
  diastolic_mmhg: number; // 40..150
  heart_rate_bpm?: number; // 40..200
}

export interface BloodPressureResult {
  category: 'normal' | 'elevated' | 'stage-1-hypertension' | 'stage-2-hypertension' | 'severe-range';
  mean_arterial_pressure: number;
  pulse_pressure: number;
  follow_up_needed: boolean;
  warnings: string[];
}

export function trackBloodPressure(input: BloodPressureInput): BloodPressureResult {
  const { systolic_mmhg, diastolic_mmhg } = input;

  if (!Number.isFinite(systolic_mmhg) || !Number.isFinite(diastolic_mmhg)) {
    throw new RangeError('Blood pressure values must be finite numbers');
  }
  if (systolic_mmhg <= diastolic_mmhg) {
    throw new RangeError('Systolic pressure must be greater than diastolic pressure');
  }

  const warnings: string[] = ['educational_bp_tracking_screen'];

  const pulse_pressure = Math.round(systolic_mmhg - diastolic_mmhg);
  const mean_arterial_pressure = Math.round((diastolic_mmhg + (systolic_mmhg - diastolic_mmhg) / 3) * 10) / 10;

  let category: BloodPressureResult['category'];
  let follow_up_needed = false;

  if (systolic_mmhg > 180 || diastolic_mmhg > 120) {
    category = 'severe-range';
    follow_up_needed = true;
    warnings.push('severe_range_repeat_after_1min_and_check_symptoms');
  } else if (systolic_mmhg >= 140 || diastolic_mmhg >= 90) {
    category = 'stage-2-hypertension';
    warnings.push('stage_2_hypertension_physician_consultation_indicated');
  } else if (systolic_mmhg >= 130 || diastolic_mmhg >= 80) {
    category = 'stage-1-hypertension';
    warnings.push('stage_1_hypertension_lifestyle_or_medical_review');
  } else if (systolic_mmhg >= 120 && diastolic_mmhg < 80) {
    category = 'elevated';
  } else {
    category = 'normal';
  }

  return {
    category,
    mean_arterial_pressure,
    pulse_pressure,
    follow_up_needed,
    warnings: [...new Set(warnings)],
  };
}
