/**
 * Tool #074 — Blood Pressure Tracker (Educational)
 * Layer 74: AHA-style blood-pressure banding over time + mandatory escalation.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational tracking aid; NOT a diagnosis of hypertension/hypotension.
 *  - A reading ≥180/120, chest pain, breathing difficulty, or symptomatic
 *    hypotension escalates to urgent/emergency care.
 *  - Never advises starting or stopping any blood-pressure medication.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type BpCategory = 'normal' | 'elevated' | 'stage-1' | 'stage-2' | 'crisis' | 'hypotension';

export interface BpReading {
  systolic: number;
  diastolic: number;
  /** Optional heart rate (bpm). */
  pulse: number | null;
}

export interface BpInput {
  readings: BpReading[];
  /** Chest pain, pressure or tightness. */
  chest_pain: boolean;
  /** Shortness of breath / breathing difficulty. */
  breathing_difficulty: boolean;
  /** Severe headache. */
  severe_headache: boolean;
  /** Blurred vision or visual changes. */
  vision_changes: boolean;
  /** Dizziness or fainting on standing. */
  dizziness_on_standing: boolean;
}

export interface BpResult {
  average_systolic: number;
  average_diastolic: number;
  average_pulse: number | null;
  readings_count: number;
  overall_category: BpCategory;
  max_systolic: number;
  max_diastolic: number;
  contributing_factors: string[];
  recommendations: string[];
  emergency: boolean;
  emergency_message: string | null;
  safety_flags: string[];
  educational_notice: string;
}

const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

/** AHA-style category for a single systolic/diastolic pair. */
export function classifyReading(systolic: number, diastolic: number): BpCategory {
  if (systolic < 90 || diastolic < 60) return 'hypotension';
  if (systolic >= 180 || diastolic >= 120) return 'crisis';
  if (systolic >= 140 || diastolic >= 90) return 'stage-2';
  if (systolic >= 130 || diastolic >= 80) return 'stage-1';
  if (systolic >= 120) return 'elevated';
  return 'normal';
}

const CATEGORY_RANK: Record<BpCategory, number> = {
  normal: 0,
  elevated: 1,
  'stage-1': 2,
  'stage-2': 3,
  hypotension: 3,
  crisis: 4,
};

export const EMERGENCY_MESSAGE =
  'A red-flag blood-pressure finding or symptom was reported (reading ≥180/120, chest pain, breathing difficulty, or symptomatic low blood pressure). Seek emergency/urgent medical care now — call your local emergency number. Do not wait and do not try to self-treat. This tool cannot provide emergency care.';


export function assessBloodPressure(input: BpInput): BpResult {
  const readings = input.readings.length ? input.readings : [{ systolic: 120, diastolic: 80, pulse: null }];
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const n = readings.length;
  const avgSys = round(readings.reduce((a, r) => a + r.systolic, 0) / n, 0);
  const avgDia = round(readings.reduce((a, r) => a + r.diastolic, 0) / n, 0);
  const pulses = readings.filter((r) => typeof r.pulse === 'number') as { pulse: number }[];
  const avgPulse = pulses.length ? round(pulses.reduce((a, r) => a + r.pulse, 0) / pulses.length, 0) : null;

  const maxSys = Math.max(...readings.map((r) => r.systolic));
  const maxDia = Math.max(...readings.map((r) => r.diastolic));

  const perReading = readings.map((r) => classifyReading(r.systolic, r.diastolic));
  const overall = perReading.reduce(
    (worst, c) => (CATEGORY_RANK[c] > CATEGORY_RANK[worst] ? c : worst),
    'normal' as BpCategory,
  );

  factors.push(`Average reading: ${avgSys}/${avgDia} mmHg across ${n} measurement(s).`);
  factors.push(`Overall category (worst reading): ${overall}.`);

  const crisisReading = perReading.includes('crisis');
  const hypotensionReading = perReading.includes('hypotension');
  const symptomaticHypotension = hypotensionReading && input.dizziness_on_standing;
  const symptomRedFlag = input.chest_pain || input.breathing_difficulty;

  const emergency = crisisReading || symptomRedFlag || symptomaticHypotension;

  if (crisisReading) {
    flags.push('hypertensive_crisis');
    factors.push('At least one reading reached the hypertensive-crisis range (≥180/120 mmHg).');
  }
  if (symptomaticHypotension) {
    flags.push('symptomatic_hypotension');
    factors.push('A low reading (<90/60 mmHg) was reported together with dizziness/fainting.');
  }
  if (input.chest_pain) flags.push('chest_pain');
  if (input.breathing_difficulty) flags.push('breathing_difficulty');
  if (input.severe_headache) flags.push('severe_headache');
  if (input.vision_changes) flags.push('vision_changes');

  if (emergency) {
    recommendations.push('Seek emergency/urgent care immediately.');
  } else if (overall === 'stage-2' || overall === 'stage-1' || overall === 'elevated') {
    recommendations.push('Persistent elevated readings should be reviewed by a clinician.');
    flags.push('persistent_elevation');
  } else if (overall === 'hypotension') {
    recommendations.push('Low readings without symptoms should still be reviewed if persistent.');
  } else {
    recommendations.push('Readings are in the normal range — keep monitoring as advised.');
  }

  if (input.severe_headache || input.vision_changes) {
    recommendations.push('Severe headache or vision changes with abnormal blood pressure need prompt assessment.');
  }

  recommendations.push('Never start or stop any blood-pressure medication without your clinician.');
  recommendations.push('Educational tracker only — it does not diagnose hypertension or hypotension.');

  return {
    average_systolic: avgSys,
    average_diastolic: avgDia,
    average_pulse: avgPulse,
    readings_count: n,
    overall_category: overall,
    max_systolic: maxSys,
    max_diastolic: maxDia,
    contributing_factors: factors,
    recommendations,
    emergency,
    emergency_message: emergency ? EMERGENCY_MESSAGE : null,
    safety_flags: flags,
    educational_notice:
      'Educational blood-pressure tracking aid only. It does not diagnose hypertension or hypotension and never advises starting or stopping medication.',
  };
}
