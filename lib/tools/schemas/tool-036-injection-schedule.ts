/**
 * Tool #036 — Injection Schedule Planner
 * Zod input/output contract.
 */
import { z } from 'zod';

export const ScheduledCompoundSchema = z.object({
  name_en: z.string().min(1).max(80),
  weekly_dose_mg: z.number().finite().min(1).max(5000),
  concentration_mg_ml: z.number().finite().min(1).max(500),
  injections_per_week: z.number().int().min(1).max(7),
  max_ml_per_site: z.number().finite().min(0.5).max(10).default(3),
});

export const InjectionScheduleInputSchema = z.object({
  compounds: z.array(ScheduledCompoundSchema).min(1).max(8),
  rotation_sites: z.array(z.string().min(1).max(40)).min(1).max(12),
});

export type InjectionScheduleInput = z.infer<typeof InjectionScheduleInputSchema>;

export const ScheduledShotSchema = z.object({
  day: z.number().int().min(0).max(6),
  compound_name: z.string().min(1).max(80),
  dose_mg: z.number().finite().min(0),
  volume_ml: z.number().finite().min(0),
  site: z.string().min(1).max(40),
  split_warning: z.boolean(),
});

export const InjectionScheduleResultSchema = z.object({
  shots: z.array(ScheduledShotSchema).max(56),
  total_volume_ml_per_week: z.number().finite().min(0),
  busiest_day: z.number().int().min(0).max(6),
  warnings: z.array(z.string()).max(16),
});

/* ==========================================================================
 * v2 — CHRONO-INJECT OS contract (additive; v1 above unchanged)
 * ========================================================================== */

import type { Zone, Confidence } from '../engines/tool-036-injection-schedule';

export const EvidenceRefSchema = z.object({
  evidenceId: z.string().min(1),
  confidence: z.enum(['High', 'Moderate', 'Low']),
  note: z.string().optional(),
});

export const ChronoPlanInputSchema = z.object({
  compounds: z
    .array(
      z.object({
        compoundId: z.string().min(1).max(80).optional(),
        name_en: z.string().min(1).max(80),
        weekly_dose_mg: z.number().finite().min(1).max(5000),
        concentration_mg_ml: z.number().finite().min(1).max(500),
        injections_per_week: z.number().int().min(1).max(7),
      }),
    )
    .min(1)
    .max(8),
  rotation_sites: z.array(z.string().min(1).max(40)).min(1).max(12),
  startDateISO: z.string().min(4).max(40).optional(),
});

export type ChronoPlanInputParsed = z.infer<typeof ChronoPlanInputSchema>;

export const ChronoShotSchema = z.object({
  day: z.number().int().min(0).max(6),
  compound_name: z.string().min(1).max(80),
  dose_mg: z.number().finite().min(0),
  volume_ml: z.number().finite().min(0),
  site: z.string().min(1).max(40),
  zone: z.enum(['green', 'yellow', 'red']) as unknown as z.ZodType<Zone>,
  evidenceId: z.string().min(1),
  non_clinical: z.boolean(),
});

export const GuardWarningSchema = z.object({
  siteId: z.string().min(1).max(40),
  kind: z.enum(['zone-yellow', 'zone-red', 'weekly-cap', 'site-ceiling', 'non-clinical']),
  evidence: EvidenceRefSchema,
  message: z.string().min(1).max(300),
});

export const RedFlagSchema = z.object({
  code: z.string().min(1).max(60),
  messageEn: z.string().min(1).max(300),
  messageAr: z.string().min(1).max(300),
  evidence: EvidenceRefSchema.optional(),
});

export const ChronoResultSchema = z.object({
  shots: z.array(ChronoShotSchema).max(56),
  total_volume_ml_per_week: z.number().finite().min(0),
  busiest_day: z.number().int().min(0).max(6),
  perSite: z.record(z.string(), z.number().finite().min(0)),
  warnings: z.array(GuardWarningSchema).max(64),
  redFlags: z.array(RedFlagSchema).max(16),
  provenance: z.array(EvidenceRefSchema).min(1),
  nonClinicalCompounds: z.array(z.string()).max(8),
});

export type { Confidence };

/* ==========================================================================
 * LEVEL 2 / LEVEL 3 contracts (additive; nothing above is modified)
 * ========================================================================== */

export const BadgeLevelSchema = z.enum(['Low', 'Medium', 'High']);
export const PainBandSchema = z.enum(['none', 'mild', 'moderate', 'severe']);

export const BodySiteSchema = z.object({
  siteId: z.string().min(1).max(40),
  labelEn: z.string().min(1).max(60),
  labelAr: z.string().min(1).max(60),
  region: z.enum(['ventro', 'dorso', 'deltoid', 'vastus']),
  side: z.enum(['left', 'right']),
  ceilingMl: z.number().finite().min(0.1).max(10),
});

export const ComfortAssessmentSchema = z.object({
  zone: z.enum(['green', 'yellow', 'red']),
  volumeBadge: BadgeLevelSchema,
  painBand: PainBandSchema,
  painBadge: BadgeLevelSchema,
  advisories: z.array(z.string().min(1).max(300)).max(8),
  evidence: z.array(EvidenceRefSchema).min(1),
});

export const HealingStatusSchema = z.object({
  state: z.enum(['too-soon', 'minimum-met', 'optimal']),
  daysSince: z.number().finite(),
  minDays: z.number().int().min(1).max(60),
  optimalDays: z.number().int().min(1).max(120),
  messageEn: z.string().min(1).max(300),
  messageAr: z.string().min(1).max(300),
});

export const RotationViolationSchema = z.object({
  siteId: z.string().min(1).max(40),
  dayIndex: z.number().int(),
  daysSincePrev: z.number().int(),
  severity: z.enum(['error', 'warning']),
  messageEn: z.string().min(1).max(300),
  messageAr: z.string().min(1).max(300),
});

export const FhirResourceSchema = z
  .object({ resourceType: z.string().min(1).max(60) })
  .catchall(z.unknown());

export const FhirBundleSchema = z.object({
  resourceType: z.literal('Bundle'),
  type: z.literal('collection'),
  entry: z.array(z.object({ resource: FhirResourceSchema })).max(64),
});

