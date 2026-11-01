import { z } from 'zod';

export const AdaptivePlannerInputSchema = z.object({
  goal: z.enum(['strength', 'hypertrophy', 'endurance', 'general']),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
  sessions_per_week: z.number().finite().int().min(1).max(7),
  session_duration: z.number().finite().min(15).max(180),
  available_equipment: z.array(z.string().trim().min(1)).min(1),
  readiness: z.enum(['low', 'moderate', 'high']).optional(),
  limitations: z.array(z.string()).optional(),
}).strict();

export type AdaptivePlannerInput = z.infer<typeof AdaptivePlannerInputSchema>;

export interface PlanDay {
  day: number;
  exerciseType: string;
  volume: number;
  intensity: string;
  focus: 'foundational' | 'progressive' | 'specialized';
}

export interface AdaptivePlannerResult {
  weeklyPlan: PlanDay[];
  disclaimer: string;
}

const EQUIPMENT_DEFAULT = ['barbell', 'dumbbell', 'bodyweight'];

export function calculateAdaptivePlannerV6(input: AdaptivePlannerInput): AdaptivePlannerResult {
  const { goal, experience_level, sessions_per_week, session_duration, available_equipment, readiness = 'moderate', limitations = [] } = input;
  if (!Number.isFinite(sessions_per_week) || !Number.isFinite(session_duration)) throw new Error('invalid input');

  const equipment = available_equipment.length ? available_equipment : EQUIPMENT_DEFAULT;
  const hasBarbell = equipment.includes('barbell');
  const hasDumbbell = equipment.includes('dumbbell');

  const volumeFactor = readiness === 'high' ? 1.2 : readiness === 'low' ? 0.7 : 1.0;
  const intensityLabel = readiness === 'high' ? 'high' : readiness === 'low' ? 'low' : 'moderate';

  const baseExercise = goal === 'strength' ? (hasBarbell ? 'compound_strength' : 'dumbbell_strength') :
    goal === 'hypertrophy' ? (hasDumbbell ? 'hypertrophy_volume' : 'bodyweight_hypertrophy') :
    goal === 'endurance' ? 'conditioning' : 'general_fitness';

  // limitations remove certain types
  const limitationSuffix = [
    limitations.includes('no_squat') ? 'modified' : '',
    limitations.includes('no_overhead') ? 'shoulder_friendly' : '',
    limitations.includes('no_impact') && goal === 'endurance' ? 'low_impact' : '',
  ].filter(Boolean).join('_');
  const allowed = limitationSuffix ? `${baseExercise}_${limitationSuffix}` : baseExercise;
  const focus: PlanDay['focus'] = experience_level === 'beginner' ? 'foundational' : experience_level === 'advanced' ? 'specialized' : 'progressive';

  const weeklyPlan: PlanDay[] = [];
  for (let i = 1; i <= sessions_per_week; i++) {
    weeklyPlan.push({
      day: i,
      exerciseType: allowed,
      volume: Math.round(session_duration * volumeFactor),
      intensity: intensityLabel,
      focus,
    });
  }

  return { weeklyPlan, disclaimer: 'تقدير تدريبي وليس تشخيصًا طبيًا' };
}

