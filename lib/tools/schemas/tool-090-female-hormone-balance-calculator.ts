/**
 * Tool #090 — Female Hormone Balance Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const FemaleHormoneBalanceInputSchema = z.object({
  cycle_length_days: z.number().finite().min(21).max(45),
  pms_symptom_severity: z.enum(['none_mild', 'moderate', 'severe']),
  androgenic_signs_present: z.boolean(),
  cycle_regularity: z.enum(['strictly_regular', 'mildly_variable', 'highly_irregular_or_absent']),
  high_stress_or_rapid_weight_loss: z.boolean(),
});

export type FemaleHormoneBalanceInput = z.infer<typeof FemaleHormoneBalanceInputSchema>;

export const FemaleHormoneBalanceResultSchema = z.object({
  hormone_harmony_score: z.number().finite().min(0).max(100),
  estrogen_progesterone_balance_tier: z.enum(['harmonious-baseline', 'estrogen-dominance-leaning', 'ovulatory-disruption-risk']),
  androgenic_virilization_risk: z.enum(['low', 'moderate', 'elevated']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const FemaleHormoneBalanceOutputSchema = z.object({
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
  result: FemaleHormoneBalanceResultSchema,
});
