import { z } from 'zod';

export const oneRepMaxInputSchema = z.object({
  weightKg: z.number().finite().positive(),
  reps: z.number().finite().int().positive(),
});

export type OneRepMaxSchemaInput = z.infer<typeof oneRepMaxInputSchema>;
