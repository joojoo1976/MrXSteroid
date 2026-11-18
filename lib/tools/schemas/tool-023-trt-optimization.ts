import { z } from 'zod';

export const TrtInputSchema = z.object({
  age: z.number().int().min(18).max(80),
  current_total_test_ng_dL: z.number().finite().nonnegative().optional(),
  current_free_test_pg_mL: z.number().finite().nonnegative().optional(),
  symptoms: z.enum(['none', 'mild', 'moderate', 'severe']),
  hematocrit_current: z.number().finite().min(20).max(70).optional(),
  e2_current_pg_mL: z.number().finite().nonnegative().optional(),
  trt_duration_months: z.number().finite().int().min(0).max(600),
  administration: z.enum(['intramuscular', 'subcutaneous', 'transdermal', 'pellets']),
}).strict();

export type TrtInput = z.infer<typeof TrtInputSchema>;

export const TrtResultSchema = z.object({
  recommended_total_test_ng_dL: z.number().finite().nonnegative(),
  estimated_free_test_ratio: z.number().finite().nonnegative(),
  recommended_dose_mg_weekly: z.number().finite().nonnegative(),
  expected_hematocrit: z.number().finite().nonnegative().optional(),
  e2_management: z.enum(['monitor', 'aromatase_inhibitor', 'dosage_adjustment']),
  monitoring_schedule: z.enum(['biweekly', 'monthly', 'quarterly']),
  risk_factors: z.array(z.string()),
  protocol_tips: z.array(z.string()),
}).strict();

export type TrtResult = z.infer<typeof TrtResultSchema>;
