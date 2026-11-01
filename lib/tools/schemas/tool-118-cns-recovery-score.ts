import { z } from 'zod';

export const CNSRecoveryInputSchema = z.object({
  hrv_ms: z.number().finite().positive().max(300).optional(),
  hrv_baseline_ms: z.number().finite().positive().max(300).optional(),
  resting_hr_bpm: z.number().finite().min(30).max(150).optional(),
  resting_hr_baseline_bpm: z.number().finite().min(30).max(150).optional(),
  sleep_hours: z.number().finite().min(0).max(24).optional(),
  sleep_quality: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  body_temp_c: z.number().finite().min(34).max(42).optional(),
  body_temp_baseline_c: z.number().finite().min(34).max(42).optional(),
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  energy_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  motivation: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  muscle_soreness: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  joint_pain: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  recent_performance_trend: z.enum(['improving', 'stable', 'declining']).optional(),
  training_load_change_pct: z.number().finite().min(-100).max(200).optional(),
  days_since_deload: z.number().finite().min(0).max(365).optional(),
  illness_recent: z.boolean().optional(),
  stress_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
}).strict();

export type CNSRecoveryInput = z.infer<typeof CNSRecoveryInputSchema>;

