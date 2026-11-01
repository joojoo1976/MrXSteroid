import { z } from 'zod';

export const restTimerInputSchema = z.object({
  sets: z.number().finite().int().positive(),
  intensity: z.enum(['low', 'moderate', 'high']),
});

export type RestTimerSchemaInput = z.infer<typeof restTimerInputSchema>;
