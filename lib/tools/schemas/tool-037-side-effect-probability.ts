/**
 * Tool #037 — Side Effect Probability Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const RiskCompoundSchema = z.object({
  name_en: z.string().min(1).max(80),
  family: z.enum(['testosterone', 'nandrolone', 'trenbolone', 'dht', 'oral', 'other']),
  weekly_dose_mg: z.number().finite().min(1).max(5000),
  reference_dose_mg: z.number().finite().min(1).max(5000),
});

export const SideEffectRiskInputSchema = z.object({
  compounds: z.array(RiskCompoundSchema).min(1).max(8),
  age: z.number().int().min(18).max(90),
  body_fat_pct: z.number().finite().min(5).max(60),
  cycle_weeks: z.number().int().min(1).max(52),
  uses_ai: z.boolean(),
  uses_liver_support: z.boolean(),
});

export type SideEffectRiskInput = z.infer<typeof SideEffectRiskInputSchema>;

export const SideEffectRiskSchema = z.object({
  effect: z.string().min(1).max(40),
  probability_pct: z.number().finite().min(0).max(100),
  level: z.enum(['low', 'moderate', 'high']),
});

export const SideEffectRiskResultSchema = z.object({
  risks: z.array(SideEffectRiskSchema).max(10),
  overall_burden_pct: z.number().finite().min(0).max(100),
  mitigations: z.array(z.string()).max(16),
});

export type SideEffectRiskResult = z.infer<typeof SideEffectRiskResultSchema>;

