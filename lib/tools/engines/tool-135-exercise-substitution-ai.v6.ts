import { z } from 'zod';

export const ExerciseSubstitutionSchema = z.object({
  movement_pattern: z.enum(['squat', 'hinge', 'push', 'pull', 'carry']),
  available_equipment: z.array(z.enum(['bodyweight', 'dumbbell', 'cable', 'machine', 'band'])).min(1),
  avoid_movements: z.array(z.enum(['squat', 'hinge', 'push', 'pull', 'carry', 'overhead', 'impact'])),
  pain_reported: z.boolean(),
});
export type ExerciseSubstitutionInput = z.infer<typeof ExerciseSubstitutionSchema>;
export interface ExerciseSubstitutionResult {
  alternatives: string[];
  status: 'suggestions_available' | 'pain_requires_stop';
  message: string;
  disclaimer: string;
}

const EXERCISE_RULES: Record<ExerciseSubstitutionInput['movement_pattern'], Array<{ name: string; equipment: ExerciseSubstitutionInput['available_equipment'][number]; movement: ExerciseSubstitutionInput['movement_pattern'] | 'overhead' | 'impact' }>> = {
  squat: [{ name: 'box_squat', equipment: 'bodyweight', movement: 'squat' }, { name: 'goblet_squat', equipment: 'dumbbell', movement: 'squat' }, { name: 'machine_leg_press', equipment: 'machine', movement: 'squat' }],
  hinge: [{ name: 'hip_bridge', equipment: 'bodyweight', movement: 'hinge' }, { name: 'dumbbell_romanian_deadlift', equipment: 'dumbbell', movement: 'hinge' }, { name: 'cable_pull_through', equipment: 'cable', movement: 'hinge' }],
  push: [{ name: 'incline_push_up', equipment: 'bodyweight', movement: 'push' }, { name: 'dumbbell_floor_press', equipment: 'dumbbell', movement: 'push' }, { name: 'machine_chest_press', equipment: 'machine', movement: 'push' }],
  pull: [{ name: 'band_row', equipment: 'band', movement: 'pull' }, { name: 'one_arm_dumbbell_row', equipment: 'dumbbell', movement: 'pull' }, { name: 'cable_row', equipment: 'cable', movement: 'pull' }],
  carry: [{ name: 'bodyweight_march', equipment: 'bodyweight', movement: 'carry' }, { name: 'farmer_carry', equipment: 'dumbbell', movement: 'carry' }],
};

export function calculateExerciseSubstitutions(input: ExerciseSubstitutionInput): ExerciseSubstitutionResult {
  if (input.pain_reported) return {
    alternatives: [], status: 'pain_requires_stop',
    message: 'Do not use this rule list to train through pain. Stop the movement and seek assessment from a qualified professional.',
    disclaimer: 'No injury diagnosis or rehabilitation advice is provided.',
  };
  const alternatives = EXERCISE_RULES[input.movement_pattern]
    .filter((exercise) => input.available_equipment.includes(exercise.equipment) && !input.avoid_movements.includes(exercise.movement))
    .map((exercise) => exercise.name);
  return {
    alternatives,
    status: 'suggestions_available',
    message: alternatives.length ? 'Alternatives match only the selected movement and equipment filters; verify personal comfort and technique.' : 'No listed alternative matches the selected filters.',
    disclaimer: 'Static rule-based movement options only; not AI, injury-aware clearance or individualized medical advice.',
  };
}

