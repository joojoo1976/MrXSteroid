import { z } from 'zod';

export const proteinNeedsInputSchema = z.object({
  weightKg: z.number().finite().positive(),
  goal: z.enum(['maintain', 'bulk', 'cut']),
  activityLevel: z.number().finite().min(1).max(1.4),
});

export type ProteinNeedsSchemaInput = z.infer<typeof proteinNeedsInputSchema>;
