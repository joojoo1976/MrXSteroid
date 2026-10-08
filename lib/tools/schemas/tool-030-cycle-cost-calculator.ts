/**
 * Tool #030 — Cycle Cost Calculator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const CompoundCostSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  family: z.string(),
  concentration_mg_ml: z.number().min(1).max(500),
  weekly_dose_mg: z.number().min(1).max(1000),
  cycle_weeks: z.number().min(1).max(52),
  total_mg: z.number().min(1).max(52000),
  total_cost_usd: z.number().min(0).max(10000),
});

export type CompoundCost = z.infer<typeof CompoundCostSchema>;

export const CycleCostInputSchema = z.object({
  goal: z.enum(['bulk', 'cut', 'recomp', 'strength']),
  cycle_weeks: z.number().min(1).max(52),
  compounds: z.array(CompoundCostSchema).min(1).max(6),
  pct_duration_weeks: z.number().min(1).max(26),
  ancillary_compounds: z.array(CompoundCostSchema).min(0).max(10),
  user_weight_kg: z.number().min(40).max(300),
});

export type CycleCostInput = z.infer<typeof CycleCostInputSchema>;

export const CycleCostResultSchema = z.object({
  total_compound_cost_usd: z.number().min(0).max(50000),
  total_ancillary_cost_usd: z.number().min(0).max(30000),
  total_pct_cost_usd: z.number().min(0).max(5000),
  grand_total_usd: z.number().min(0).max(100000),
  cost_breakdown: z.object({
    compounds: z.array(z.object({ name: z.string(), cost: z.number() })).min(0).max(6),
    ancillaries: z.array(z.object({ name: z.string(), cost: z.number() })).min(0).max(10),
    pct: z.array(z.object({ name: z.string(), cost: z.number() })).min(0).max(5),
  }),
  cost_per_week_usd: z.number().min(0).max(5000),
  most_expensive_compound: z.string(),
  budget_savings_tips: z.array(z.string()).min(0).max(10),
});

export type CycleCostResult = z.infer<typeof CycleCostResultSchema>;
