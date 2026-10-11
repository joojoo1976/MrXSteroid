/**
 * Tool #071 — Antioxidant Manager
 * Zod input/output contract.
 */
import { z } from 'zod';

export const AntioxidantInputSchema = z.object({
  daily_fruit_veg_servings: z.number().finite().min(0).max(15),
  takes_coq10: z.boolean(),
  takes_vitamin_c_e: z.boolean(),
  takes_zinc_selenium: z.boolean(),
  high_oxidative_lifestyle: z.boolean(),
});

export type AntioxidantInput = z.infer<typeof AntioxidantInputSchema>;

export const AntioxidantResultSchema = z.object({
  antioxidant_defense_score: z.number().finite().min(0).max(100),
  defense_tier: z.enum(['depleted-defense', 'adequate-defense', 'robust-defense']),
  key_recommendations: z.array(z.string().max(64)).max(8),
  warnings: z.array(z.string().max(64)).max(8),
});

export const AntioxidantOutputSchema = z.object({
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
  result: AntioxidantResultSchema,
});
