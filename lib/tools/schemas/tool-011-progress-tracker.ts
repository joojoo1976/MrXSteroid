import { z } from 'zod';

export const ProgressEntrySchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime(),
  weight_kg: z.number().finite().nonnegative().max(500).optional(),
  weight_lbs: z.number().finite().nonnegative().max(1100).optional(),
  strength_kg: z.number().finite().nonnegative().max(500).optional(),
  strength_lbs: z.number().finite().nonnegative().max(1100).optional(),
  body_fat_pct: z.number().finite().min(0).max(80).optional(),
  notes: z.string().max(500).optional(),
  cycle_id: z.string().uuid().optional(),
}).strict();

export type ProgressEntry = z.infer<typeof ProgressEntrySchema>;

export const ProgressTrendSchema = z.object({
  metric: z.enum(['weight', 'strength', 'body_fat']),
  label: z.string(),
  dataPoints: z.array(ProgressEntrySchema),
  trendDirection: z.enum(['up', 'down', 'stable', 'unknown']),
  avgChangePerWeek: z.number().finite(),
}).strict();

export type ProgressTrend = z.infer<typeof ProgressTrendSchema>;
