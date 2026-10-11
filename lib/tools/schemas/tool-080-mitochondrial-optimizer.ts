/**
 * Tool #080 — Mitochondrial Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const MitochondrialInputSchema = z.object({
  zone2_weekly_hours: z.number().finite().min(0).max(20),
  hiit_sessions_per_week: z.number().int().min(0).max(7),
  coq10_or_nad_support: z.boolean(),
  cold_heat_exposure: z.boolean(),
  sleep_quality_score: z.number().finite().min(1).max(10),
  statin_use: z.boolean(),
});

export type MitochondrialInput = z.infer<typeof MitochondrialInputSchema>;

export const MitochondrialResultSchema = z.object({
  mitochondrial_efficiency_score: z.number().finite().min(0).max(100),
  mitochondrial_status_band: z.enum(['impaired-biogenesis', 'adequate-baseline', 'robust-density', 'peak-mitochondrial-capacity']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const MitochondrialOutputSchema = z.object({
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
  result: MitochondrialResultSchema,
});
