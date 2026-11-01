/**
 * Tool #074 — Blood Pressure Tracker
 * Zod input/output contract.
 */
import { z } from 'zod';

export const BloodPressureInputSchema = z.object({
  systolic_mmhg: z.number().finite().min(70).max(240),
  diastolic_mmhg: z.number().finite().min(40).max(150),
  heart_rate_bpm: z.number().finite().min(40).max(200).optional(),
}).superRefine((input, ctx) => {
  if (input.systolic_mmhg <= input.diastolic_mmhg) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['systolic_mmhg'], message: 'Systolic pressure must be greater than diastolic pressure' });
  }
});

export type BloodPressureInput = z.infer<typeof BloodPressureInputSchema>;

export const BloodPressureResultSchema = z.object({
  category: z.enum(['normal', 'elevated', 'stage-1-hypertension', 'stage-2-hypertension', 'severe-range']),
  mean_arterial_pressure: z.number().finite().min(30).max(200),
  pulse_pressure: z.number().finite().min(1).max(200),
  follow_up_needed: z.boolean(),
  warnings: z.array(z.string().max(64)).max(8),
});

export const BloodPressureOutputSchema = z.object({
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
  result: BloodPressureResultSchema,
});
