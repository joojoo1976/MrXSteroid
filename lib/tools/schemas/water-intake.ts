import { z } from 'zod';

export const waterIntakeInputSchema = z.object({
  weightKg: z.number().finite().positive(),
  activityLevel: z.number().finite().min(1).max(1.4),
});

export type WaterIntakeSchemaInput = z.infer<typeof waterIntakeInputSchema>;
