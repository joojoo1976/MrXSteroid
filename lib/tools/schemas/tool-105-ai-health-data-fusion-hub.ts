import { z } from 'zod';

const HealthEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum(['lab', 'medication', 'symptom', 'blood-pressure']),
  code: z.string().min(1).max(64),
  value: z.number().optional(),
  note: z.string().max(300).optional(),
  unit: z.string().max(24).optional(),
});

export const HealthFusionInputSchema = z.object({
  events: z.array(HealthEventSchema).min(1).max(500),
  consent_given: z.boolean(),
  authenticated: z.boolean(),
});

export type HealthFusionInput = z.infer<typeof HealthFusionInputSchema>;

