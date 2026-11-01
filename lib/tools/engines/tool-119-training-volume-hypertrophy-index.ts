/**
 * Tool #119 - Training Volume Load & Hypertrophy Index
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates training volume load and hypertrophy
 * potential from set/rep/weight data. It does not predict actual muscle
 * growth, replace periodized programming, or guarantee hypertrophic outcomes.
 * Results are educational references only.
 *
 * Model
 * -----
 * Volume Load = Sets × Reps × Weight (per exercise, summed)
 * Hypertrophy Index = Volume Load × Intensity Factor × Frequency Factor
 * Intensity Factor based on %1RM or RPE
 * Frequency Factor based on weekly frequency per muscle group
 */

export type VolumeExerciseInput = {
  exercise: string;
  muscle_group: string;
  sets: number;
  reps: number;
  weight_kg: number;
  rpe?: number; // 1-10
  percent_1rm?: number; // 0-100
  frequency_per_week: number;
};

export interface VolumeInput {
  exercises: VolumeExerciseInput[];
}

export interface VolumeResult {
  total_volume_load_kg: number;
  volume_by_muscle: Record<string, number>;
  hypertrophy_index: number; // 0-100
  muscle_group_scores: Record<string, { volume_load: number; hypertrophy_score: number }>;
  frequency_analysis: Record<string, { frequency: number; adequacy: 'low' | 'moderate' | 'high' }>;
  intensity_distribution: { low: number; moderate: number; high: number };
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

function intensityFactorFromRPE(rpe?: number): number {
  if (!rpe) return 0.7;
  // RPE 6=0.55, 7=0.65, 8=0.75, 9=0.88, 10=1.0
  const map: Record<number, number> = { 6: 0.55, 7: 0.65, 8: 0.75, 9: 0.88, 10: 1.0 };
  return map[rpe] ?? 0.7;
}

function intensityFactorFromPercent(pct?: number): number {
  if (!pct) return 0.7;
  return clamp(pct / 100, 0.3, 1.0);
}

function frequencyFactor(freq: number): number {
  if (freq <= 1) return 0.7;
  if (freq === 2) return 1.0;
  if (freq === 3) return 1.1;
  if (freq >= 4) return 1.15;
  return 0.7;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calcVolumeHypertrophy(input: VolumeInput): VolumeResult {
  const { exercises } = input;

  if (exercises.length === 0) {
    return {
      total_volume_load_kg: 0,
      volume_by_muscle: {},
      hypertrophy_index: 0,
      muscle_group_scores: {},
      frequency_analysis: {},
      intensity_distribution: { low: 0, moderate: 0, high: 0 },
      flags: ['no_exercises_provided'],
      education_flags: ['insufficient_data_for_analysis'],
      scope_notice: 'educational_volume_hypertrophy_reference_not_training_prescription',
    };
  }

  let totalVolumeLoad = 0;
  const volumeByMuscle: Record<string, number> = {};
  const muscleGroupDetails: Record<string, { volume_load: number; hypertrophy_score: number }> = {};
  const frequencyGroups = new Set<string>();
  let lowInt = 0, modInt = 0, highInt = 0;

  for (const ex of exercises) {
    const volumeLoad = ex.sets * ex.reps * ex.weight_kg;
    totalVolumeLoad += volumeLoad;

    // Volume by muscle group
    volumeByMuscle[ex.muscle_group] = (volumeByMuscle[ex.muscle_group] ?? 0) + volumeLoad;

    // Track frequency per muscle group per week
    frequencyGroups.add(ex.muscle_group);

    // Intensity factor
    let intFactor = 0.7;
    if (ex.rpe !== undefined) intFactor = intensityFactorFromRPE(ex.rpe);
    else if (ex.percent_1rm !== undefined) intFactor = intensityFactorFromPercent(ex.percent_1rm);

    // Classify intensity
    if (intFactor < 0.6) lowInt++;
    else if (intFactor < 0.8) modInt++;
    else highInt++;

    // Hypertrophy score for this exercise
    const freqFactor = frequencyFactor(ex.frequency_per_week);
    const hypertrophyScore = volumeLoad * intFactor * freqFactor;

    muscleGroupDetails[ex.muscle_group] = {
      volume_load: (muscleGroupDetails[ex.muscle_group]?.volume_load ?? 0) + volumeLoad,
      hypertrophy_score: (muscleGroupDetails[ex.muscle_group]?.hypertrophy_score ?? 0) + hypertrophyScore,
    };
  }

  // Frequency analysis
  const frequency_analysis: Record<string, { frequency: number; adequacy: 'low' | 'moderate' | 'high' }> = {};
  for (const muscle of frequencyGroups) {
    // Since we don't track individual sessions, use first exercise's frequency
    const ex = exercises.find((e) => e.muscle_group === muscle);
    const freq = ex?.frequency_per_week ?? 1;
    let adequacy: 'low' | 'moderate' | 'high' = 'low';
    if (freq >= 3) adequacy = 'high';
    else if (freq >= 2) adequacy = 'moderate';
    frequency_analysis[muscle] = { frequency: freq, adequacy };
  }

  // Overall hypertrophy index (normalized 0-100)
  const totalHypertrophyScore = Object.values(muscleGroupDetails).reduce((sum, m) => sum + m.hypertrophy_score, 0);
  // Normalize: assume 100k volume-load * intensity * freq = 100 index
  const hypertrophy_index = Math.min(100, Math.round(totalHypertrophyScore / 1000));

  const flags: string[] = [];
  const muscleGroups = Object.keys(volumeByMuscle);
  if (muscleGroups.length < 3) flags.push('few_muscle_groups_trained');
  const lowFreqMuscles = Object.entries(frequency_analysis).filter(([, v]) => v.adequacy === 'low');
  if (lowFreqMuscles.length > 0) flags.push('some_muscle_groups_low_frequency');
  if (highInt / exercises.length > 0.5) flags.push('high_proportion_high_intensity_sets');

  return {
    total_volume_load_kg: Math.round(totalVolumeLoad),
    volume_by_muscle: Object.fromEntries(
      Object.entries(volumeByMuscle).map(([k, v]) => [k, Math.round(v)])
    ),
    hypertrophy_index,
    muscle_group_scores: Object.fromEntries(
      Object.entries(muscleGroupDetails).map(([k, v]) => [
        k,
        { volume_load: Math.round(v.volume_load), hypertrophy_score: Math.round(v.hypertrophy_score) },
      ])
    ),
    frequency_analysis,
    intensity_distribution: {
      low: lowInt,
      moderate: modInt,
      high: highInt,
    },
    flags,
    education_flags: [
      'volume_load_and_hypertrophy_index_are_estimates_not_measurements',
      'hypertrophy_depends_on_nutrition_sleep_genetics_and_consistency',
      'individual_response_to_volume_varies_significantly',
      'not_a_substitute_for_periodized_program_design',
      'consult_qualified_coach_for_individualized_programming',
    ],
    scope_notice: 'educational_volume_load_hypertrophy_reference_not_training_prescription',
  };
}
