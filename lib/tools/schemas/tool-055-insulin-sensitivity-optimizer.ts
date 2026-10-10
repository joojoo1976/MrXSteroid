/**
 * Tool #055 — Insulin Sensitivity Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const InsulinSensitivityInputSchema = z.object({
  fasting_glucose: z.number().finite().min(40).max(400),
  fasting_insulin: z.number().finite().min(0.5).max(100),
  weekly_training_sessions: z.number().finite().min(0).max(14),
  sleep_hours: z.number().finite().min(0).max(14),
});

export type InsulinSensitivityInput = z.infer<typeof InsulinSensitivityInputSchema>;

const band = z.enum(['optimal', 'average', 'early-insulin-resistance', 'significant-insulin-resistance']);

export const InsulinSensitivityResultSchema = z.object({
  homa_ir: z.number().finite().min(0).max(100),
  band,
  interventions: z.array(z.string().max(64)).max(8),
  warnings: z.array(z.string().max(64)).max(8),
});

export const InsulinSensitivityOutputSchema = z.object({
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
  result: InsulinSensitivityResultSchema,
});
