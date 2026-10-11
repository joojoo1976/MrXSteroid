/** Tool #053 — Insulin Conversion Calculator — input schema (zod). */
import { z } from 'zod';

export const InsulinConversionInputSchema = z.object({
  concentration: z.enum(['U-100', 'U-40', 'U-500']),
  volume_ml: z.number().min(0).max(100).optional(),
  units: z.number().min(0).max(10000).optional(),
  hypoglycaemia_symptoms: z.boolean(),
});

export type InsulinConversionInput = z.infer<typeof InsulinConversionInputSchema>;
