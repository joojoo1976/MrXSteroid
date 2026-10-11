/**
 * Tool #063 — Testicular Suppression Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const SuppressionInputSchema = z.object({
  weeks_on_cycle: z.number().int().min(0).max(104),
  suppression_tier: z.enum(['mild', 'moderate', 'severe']),
  age: z.number().int().min(18).max(70),
});

export type SuppressionInput = z.infer<typeof SuppressionInputSchema>;

export const SuppressionResultSchema = z.object({
  suppression_depth_pct: z.number().finite().min(0).max(95),
  estimated_recovery_months: z.number().finite().min(0).max(24),
  band: z.enum(['shallow-suppression', 'moderate-suppression', 'deep-suppression']),
  warnings: z.array(z.string().max(64)).max(8),
});

export const SuppressionOutputSchema = z.object({
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
  result: SuppressionResultSchema,
});
