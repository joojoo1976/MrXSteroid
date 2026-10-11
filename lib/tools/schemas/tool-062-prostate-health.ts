/** Tool #062 — Prostate Health Manager — input schema (zod). */
import { z } from 'zod';

const ipssItem = z.number().int().min(0).max(5);

export const ProstateInputSchema = z.object({
  incomplete_emptying: ipssItem,
  frequency: ipssItem,
  intermittency: ipssItem,
  urgency: ipssItem,
  weak_stream: ipssItem,
  straining: ipssItem,
  nocturia: ipssItem,
  quality_of_life: z.number().int().min(0).max(6),
  acute_retention: z.boolean(),
  hematuria: z.boolean(),
  fever_pelvic_pain: z.boolean(),
});

export type ProstateInput = z.infer<typeof ProstateInputSchema>;
