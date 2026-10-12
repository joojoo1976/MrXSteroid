import { z } from 'zod';

export const ReadinessInputSchema = z.object({
  gender: z.enum(['male', 'female']),
  show_type: z.enum(['bodybuilding', 'physique', 'figure', 'bikini']),
  experience_years: z.number().min(0).max(50),
  prep_phase: z.enum(['early', 'late', 'peak_week']),
  tan_maintenance: z.enum(['none', 'auto', 'manual']),
  has_stage_photo_session: z.boolean(),
});

export type ReadinessInput = z.infer<typeof ReadinessInputSchema>;
