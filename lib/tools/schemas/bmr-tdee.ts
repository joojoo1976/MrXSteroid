import { z } from 'zod';

export const bmrTdeeInputSchema = z.object({
  weightKg: z.number().finite().positive(),
  heightCm: z.number().finite().positive(),
  age: z.number().finite().positive(),
  sex: z.enum(['male', 'female']),
  activityLevel: z.number().finite().min(1.2).max(1.9),
});

export type BmrTdeeSchemaInput = z.infer<typeof bmrTdeeInputSchema>;
