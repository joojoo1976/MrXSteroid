/**
 * Tool #030 — Cycle Cost Calculator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const CompoundCostSchema = z.object({
  id: z.number().int().positive(),
  name_en: z.string().trim().min(1).max(100),
  name_ar: z.string().trim().min(1).max(100),
  total_cost_usd: z.number().finite().min(0).max(10000),
});

export type CompoundCost = z.infer<typeof CompoundCostSchema>;

export const CycleCostInputSchema = z.object({
  cycle_weeks: z.number().min(1).max(52),
  compounds: z.array(CompoundCostSchema).min(1).max(6),
  pct_duration_weeks: z.number().min(1).max(26),
  ancillary_compounds: z.array(CompoundCostSchema).min(0).max(10),
});

export type CycleCostInput = z.infer<typeof CycleCostInputSchema>;

export const CycleCostResultSchema = z.object({
  total_compound_cost_usd: z.number().min(0).max(60000),
  total_ancillary_cost_usd: z.number().min(0).max(100000),
  total_pct_cost_usd: z.number().min(0).max(5000),
  grand_total_usd: z.number().min(0).max(162860),
  cost_breakdown: z.object({
    compounds: z.array(z.object({ name: z.string(), cost: z.number() })).min(0).max(6),
    ancillaries: z.array(z.object({ name: z.string(), cost: z.number() })).min(0).max(10),
    pct: z.array(z.object({ name: z.string(), cost: z.number() })).min(0).max(5),
  }),
  cost_per_week_usd: z.number().min(0).max(81430),
  most_expensive_compound: z.string(),
  budget_savings_tips: z.array(z.string()).min(0).max(10),
});

export type CycleCostResult = z.infer<typeof CycleCostResultSchema>;
