/**
 * Tool #023 — TRT Optimization Engine
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const TrtInputSchema = z.object({
  age: z.number().min(18).max(80),
  body_weight_kg: z.number().min(40).max(300),
  current_total_test_ng_dL: z.number().optional().min(100).max(2000),
  current_free_test_pg_mL: z.number().optional().min(1).max(100),
  symptoms: z.enum(['none', 'mild', 'moderate', 'severe']),
  hematocrit_current: z.number().optional().min(20).max(60),
  e2_current_pg_mL: z.number().optional().min(5).max(200),
  trt_duration_months: z.number().min(0).max(60),
  administration: z.enum(['intramuscular', 'subcutaneous', 'transdermal', 'pellets']),
});

export type TrtInput = z.infer<typeof TrtInputSchema>;

export const TrtResultSchema = z.object({
  recommended_total_test_ng_dL: z.number().min(300).max(1500),
  estimated_free_test_ratio: z.number().min(0).max(5),
  recommended_dose_mg_weekly: z.number().min(20).max(250),
  expected_hematocrit: z.number().optional().min(30).max(55),
  e2_management: z.enum(['monitor', 'aromatase_inhibitor', 'dosage_adjustment']),
  monitoring_schedule: z.enum(['biweekly', 'monthly', 'quarterly']),
  risk_factors: z.array(z.string()),
  protocol_tips: z.array(z.string()),
});

export type TrtResult = z.infer<typeof TrtResultSchema>;