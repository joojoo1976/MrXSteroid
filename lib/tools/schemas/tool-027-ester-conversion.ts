/**
 * Tool #027 — Ester Conversion Calculator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const EsterCompoundSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  ester_type: z.enum(['acetate', 'phenylpropionate', 'propionate', 'decanoate', 'undecanoate', 'enanthate', 'cypionate', 'heptanoate', 'other']),
  ester_ratio: z.number().min(0.1).max(1),
  description_text: z.string(),
});

export type EsterCompound = z.infer<typeof EsterCompoundSchema>;

export const EsterConversionInputSchema = z.object({
  compound_name: z.string(),
  ester_type: z.enum(['acetate', 'phenylpropionate', 'propionate', 'decanoate', 'undecanoate', 'enanthate', 'cypionate', 'heptanoate', 'other']),
  ester_mg: z.number().min(1).max(1000),
  target_ester: z.enum(['acetate', 'phenylpropionate', 'propionate', 'decanoate', 'undecanoate', 'enanthate', 'cypionate', 'heptanoate', 'other']).optional(),
});

export type EsterConversionInput = z.infer<typeof EsterConversionInputSchema>;

export const EsterConversionResultSchema = z.object({
  ester_mg: z.number().min(1).max(1000),
  base_hormone_mg: z.number().min(0.1).max(1000),
  conversion_to_target: z.number().min(0.1).max(1000),
  potency_factor: z.number().min(0.1).max(1),
  molecular_weight_adjustment: z.number().min(0.1).max(1),
  notes: z.array(z.string()).min(0).max(10),
});

export type EsterConversionResult = z.infer<typeof EsterConversionResultSchema>;