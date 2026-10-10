/**
 * Tool #043 — Prolactin Management Pro
 * Zod input/output contract.
 */
import { z } from 'zod';

export const ProlactinInputSchema = z.object({
  prolactin_ng_ml: z.number().finite().min(0.5).max(200),
  uses_19_nor: z.boolean(),
  weekly_cabergoline_mcg: z.number().finite().min(0).max(1000),
  symptoms: z.array(z.enum(['libido_loss', 'edema', 'galactorrhea', 'mood_low'])).max(8),
});

export type ProlactinInput = z.infer<typeof ProlactinInputSchema>;

const band = z.enum(['normal', 'borderline', 'high', 'very-high']);

export const ProlactinResultSchema = z.object({
  band,
  suggested_weekly_mcg: z.number().finite().min(0).max(1000),
  action: z.enum(['none', 'monitor', 'start_low', 'adjust', 'pause', 'seek_physician']),
  warnings: z.array(z.string().max(64)).max(8),
});

export const ProlactinOutputSchema = z.object({
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
  result: ProlactinResultSchema,
});
