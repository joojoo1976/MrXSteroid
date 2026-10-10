/**
 * Tool #046 — TRT Lifetime Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const TrtLifetimeInputSchema = z.object({
  age: z.number().finite().min(18).max(90),
  method: z.enum(['injection', 'gel', 'cream']),
  weekly_testosterone_mg: z.number().finite().min(25).max(300),
  years_on_trt: z.number().finite().min(0).max(60),
  monthly_med_cost_usd: z.number().finite().min(0).max(1000),
  monitoring_annual_cost_usd: z.number().finite().min(0).max(5000),
});

export type TrtLifetimeInput = z.infer<typeof TrtLifetimeInputSchema>;

const horizon = z.object({
  horizon_years: z.number().finite(),
  total_cost_usd: z.number().finite(),
});

export const TrtLifetimeResultSchema = z.object({
  injection_interval_days: z.number().finite().min(0).max(30),
  annual_bloodwork_panels: z.number().int().min(0).max(6),
  age_band: z.enum(['under-40', '40-55', '55-plus']),
  cost_projection: z.object({ horizon10: horizon, horizon20: horizon, horizon30: horizon }),
  lifetime_bloodwork_panels_10y: z.number().finite().min(0).max(200),
  warnings: z.array(z.string().max(64)).max(8),
});

export const TrtLifetimeOutputSchema = z.object({
  toolId: z.string(),
  toolSlug: z.string(),
  locale: z.string(),
  unitSystem: z.string(),
  snapshotType: z.string(),
  calculatedAt: z.string(),
  recordedAt: z.string(),
  timezone: z.string(),
  accessTier: z.string(),
  keyFindings: z.array(z.any()),
  provenance: z.any(),
  seoLinks: z.any(),
  result: TrtLifetimeResultSchema,
});
