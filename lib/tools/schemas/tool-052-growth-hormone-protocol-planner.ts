/**
 * Tool #052 — Growth Hormone Protocol Planner
 * Zod input/output contract.
 */
import { z } from 'zod';

export const GrowthHormoneInputSchema = z.object({
  bodyweight_kg: z.number().finite().min(30).max(200),
  weekly_iu_total: z.number().finite().min(2).max(60),
  protocol_pattern: z.enum(['5on2off', 'daily']),
  months: z.number().int().min(1).max(24),
  cost_per_iu_usd: z.number().finite().min(0).max(100),
});

export type GrowthHormoneInput = z.infer<typeof GrowthHormoneInputSchema>;

export const GrowthHormoneResultSchema = z.object({
  daily_iu_on_days: z.number().finite().min(0).max(60),
  rest_days_per_week: z.number().int().min(0).max(7),
  monthly_iu: z.number().finite().min(0).max(3000),
  cost_projection_3m_usd: z.number().finite().min(0).max(1000000),
  cost_projection_6m_usd: z.number().finite().min(0).max(2000000),
  warnings: z.array(z.string().max(64)).max(8),
});

export const GrowthHormoneOutputSchema = z.object({
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
  result: GrowthHormoneResultSchema,
});
