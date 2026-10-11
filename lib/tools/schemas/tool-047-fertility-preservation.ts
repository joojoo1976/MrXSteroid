/** Tool #047 — Fertility Preservation Guide — input schema (zod). */
import { z } from 'zod';

export const FertilitySpermSchema = z.object({
  concentration_million_ml: z.number().min(0).max(400),
  motility_pct: z.number().min(0).max(100),
  morphology_pct: z.number().min(0).max(100),
});

export const FertilityInputSchema = z.object({
  age: z.number().int().min(16).max(80),
  suppressive_weeks: z.number().min(0).max(520),
  used_hcg: z.boolean(),
  sperm: FertilitySpermSchema.nullable(),
});

export type FertilityInput = z.infer<typeof FertilityInputSchema>;
