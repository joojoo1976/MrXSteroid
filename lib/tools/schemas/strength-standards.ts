import { z } from 'zod';

export const strengthStandardsInputSchema = z.object({
  liftKg: z.number().finite().positive(),
  bodyWeightKg: z.number().finite().positive(),
  sex: z.enum(['male', 'female']),
});

export type StrengthStandardsSchemaInput = z.infer<typeof strengthStandardsInputSchema>;
