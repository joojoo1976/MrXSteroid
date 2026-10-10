/**
 * Tool #050 — Mental Health Monitor
 * Zod input/output contract.
 */
import { z } from 'zod';

export const MoodScoreSchema = z.object({
  score: z.number().finite().min(1).max(10),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'must be an ISO-8601 date' }),
});

export const MentalHealthInputSchema = z.object({
  mood_scores: z.array(MoodScoreSchema).min(3).max(30),
  sleep_hours_avg: z.number().finite().min(0).max(14),
  irritability_episodes: z.number().int().min(0).max(28),
  aggression_episodes: z.number().int().min(0).max(28),
  uses_19_nor: z.boolean(),
  red_flags: z.array(z.enum(['self_harm_thoughts', 'rage_episodes', 'hopelessness'])).max(3),
});

export type MentalHealthInput = z.infer<typeof MentalHealthInputSchema>;

const band = z.enum(['stable', 'watch', 'concern', 'critical']);
const trend = z.enum(['improving', 'stable', 'declining']);

export const MentalHealthResultSchema = z.object({
  avg_mood: z.number().finite().min(0).max(10),
  trend,
  band,
  escalation: z.boolean(),
  sleep_flag: z.boolean(),
  irritability_flag: z.boolean(),
  warnings: z.array(z.string().max(64)).max(8),
});

export const MentalHealthOutputSchema = z.object({
  toolId: z.string(),
  toolSlug: z.string(),
  locale: z.string(),
  unitSystem: z.string(),
  snapshotType: z.string(),
  calculatedAt: z.string(),
  recordedAt: z.string(),
  timezone: z.string(),
  accessTier: z.string(),
  keyFindings: z.array(z.any()),
  provenance: z.any(),
  seoLinks: z.any(),
  result: MentalHealthResultSchema,
});
