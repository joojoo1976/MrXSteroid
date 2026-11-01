import { z } from 'zod';

export const bmiInputSchema = z.object({
  weightKg: z.number().finite().positive(),
  heightCm: z.number().finite().positive(),
});

export type BmiSchemaInput = z.infer<typeof bmiInputSchema>;
