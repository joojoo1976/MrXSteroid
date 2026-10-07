/**
 * Tool #014 — Water Retention Calculator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const WaterRetentionInputSchema = z.object({
  e2_level: z.number().min(0).max(500),
  weight_kg: z.number().min(30).max(200),
  compound_stack: z.array(z.object({
    default_dose_mg: z.number(),
    aromatization_factor: z.number(),
  })).min(1),
  sodium_intake_mg: z.number().optional().min(0).max(10000),
  carb_intake_g: z.number().optional().min(0).max(1000),
  potassium_intake_mg: z.number().optional().min(0).max(10000),
});

export type WaterRetentionInput = z.infer<typeof WaterRetentionInputSchema>;

export const WaterRetentionResultSchema = z.object({
  estimated_retention_liters: z.number(),
  retention_severity: z.enum(['low', 'moderate', 'high']),
  recommendations: z.array(z.string()),
  diuretic_suggestions: z.array(z.string()),
  target_weight_loss_kg: z.number(),
});

export type WaterRetentionResult = z.infer<typeof WaterRetentionResultSchema>;