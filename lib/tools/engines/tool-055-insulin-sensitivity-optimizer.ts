/**
 * Tool #055 — Insulin Sensitivity Optimizer
 * HOMA-IR screen from documented fasting glucose/insulin with published
 * banding, plus modifiable-factor guidance. Screening only — insulin dynamics
 * require medical supervision. Pure engine, no I/O.
 */

export interface InsulinSensitivityInput {
  fasting_glucose: number; // 40..400 mg/dL
  fasting_insulin: number; // 0.5..100 µIU/mL
  weekly_training_sessions: number; // 0..14
  sleep_hours: number; // 0..14
}

export type HomaBand = 'optimal' | 'average' | 'early-insulin-resistance' | 'significant-insulin-resistance';

export interface InsulinSensitivityResult {
  homa_ir: number;
  band: HomaBand;
  interventions: string[];
  warnings: string[];
}

export function assessInsulinSensitivity(input: InsulinSensitivityInput): InsulinSensitivityResult {
  const { fasting_glucose, fasting_insulin, weekly_training_sessions, sleep_hours } = input;

  // Documented HOMA-IR: (glucose × insulin) / 405.
  const homa_ir = Math.round(((fasting_glucose * fasting_insulin) / 405) * 100) / 100;
  const band: HomaBand =
    homa_ir < 1 ? 'optimal'
    : homa_ir < 1.9 ? 'average'
    : homa_ir < 2.9 ? 'early-insulin-resistance'
    : 'significant-insulin-resistance';

  const interventions: string[] = [];
  if (weekly_training_sessions < 3) interventions.push('resistance_training_3x');
  if (sleep_hours < 7) interventions.push('sleep_7_to_9h');
  if (fasting_glucose >= 100) interventions.push('fasting_glucose_elevated_see_physician');
  if (interventions.length === 0) interventions.push('maintain_current_habits');

  return {
    homa_ir,
    band,
    interventions,
    warnings: ['medical_supervision_required'],
  };
}
