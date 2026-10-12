import { z } from 'zod';

export const ContestPrepInputSchema = z.object({
  days_until_show: z.number().min(1).max(90),
  sex: z.enum(['male', 'female']),
  weight_kg: z.number().min(40).max(200),
  hydration_status: z.enum(['normal', 'mild', 'severe']),
  tan_stability: z.enum(['low', 'medium', 'high']),
  show_stage_format: z.enum(['bodybuilding', 'physique', 'figure', 'bikini']),
});

export type ContestPrepInput = z.infer<typeof ContestPrepInputSchema>;
