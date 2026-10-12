import { z } from 'zod';

export const GlycogenInputSchema = z.object({
  body_weight_kg: z.number().min(35).max(220),
  lean_mass_kg: z.number().min(18).max(160),
  training_load: z.enum(['low', 'medium', 'high']),
  target_carbs_g_per_kg: z.number().min(4).max(16),
  days: z.number().min(1).max(7),
  baseline_glycogen_g: z.number().min(0).max(200),
});

export type GlycogenInput = z.infer<typeof GlycogenInputSchema>;
