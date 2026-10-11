/** Tool #063 — Testicular Suppression Calculator — input schema (zod). */
import { z } from 'zod';

export const TesticularSuppressionInputSchema = z.object({
  baseline_volume_ml: z.number().min(3).max(40),
  exposure_weeks: z.number().min(0).max(520),
  exposure: z.enum(['none', 'exogenous_androgen', 'serm', 'hcg', 'mixed']),
  fertility_intent: z.boolean(),
  testicular_pain: z.boolean(),
  age: z.number().int().min(16).max(100),
});

export type TesticularSuppressionInput = z.infer<typeof TesticularSuppressionInputSchema>;
