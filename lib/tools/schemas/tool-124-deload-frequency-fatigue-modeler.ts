import { z } from 'zod';

export const DeloadInputSchema = z.object({
  training_age_years: z.number().finite().min(0).max(30),
  weekly_volume_sets: z.number().finite().int().min(0).max(300),
  avg_weekly_rpe: z.number().finite().min(1).max(10),
  frequency_per_week: z.number().finite().int().positive().max(7),
  age: z.number().finite().min(13).max(100),
  sleep_hours: z.number().finite().min(4).max(12),
  stress_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  hrv_trend: z.enum(['improving', 'stable', 'declining']),
  rhr_trend: z.enum(['improving', 'stable', 'declining']),
  sleep_quality_trend: z.enum(['improving', 'stable', 'declining']),
  performance_trend: z.enum(['improving', 'stable', 'declining']),
  mood_trend: z.enum(['improving', 'stable', 'declining']),
  soreness_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  joint_pain: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  last_deload_weeks_ago: z.number().finite().min(0).max(52),
  planned_deload_frequency_weeks: z.number().finite().int().positive().max(12),
}).strict();

export type DeloadInput = z.infer<typeof DeloadInputSchema>;

