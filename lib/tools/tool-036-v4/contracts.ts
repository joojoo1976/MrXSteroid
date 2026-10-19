/**
 * Tool-036 V4 — data contracts (single source of truth for persisted state
 * and the wire format).
 *
 * The zod schemas are normative; the TypeScript types are inferred from them
 * so the runtime validator and the compile-time types can never drift.
 *
 * Design doc: .superpowers/sdd/tool-036-complete/design-v4-ar.md (§2, R1–R7)
 *
 * Decisions encoded in these contracts:
 *  - R2: absence of data is a first-class state; nothing here can express a
 *        "readiness" or "safety" inference — only recorded facts.
 *  - R3: `restPreferenceDays` is a scheduling *preference*, never a rule.
 *  - R4: FHIR is export-only; the ONLY import format is this envelope.
 *  - R5: there is deliberately no composite score field anywhere (see
 *        driftReportSchema — itemised differences only).
 *  - Time is always absolute with an explicit UTC offset. Naive local
 *        timestamps are rejected at the schema boundary.
 */
import { z } from 'zod';
import { BODY_SITES } from '@/lib/tools/engines/tool-036-injection-schedule';

/* ------------------------------------------------------------------ *
 * Site identity — single registry shared with the V3 engine.
 * ------------------------------------------------------------------ */

export const SITE_ID_VALUES: readonly string[] = BODY_SITES.map((s) => s.siteId);
export type SiteId = (typeof BODY_SITES)[number]['siteId'];

const siteIdSchema = z.string().refine(
  (v): v is SiteId => SITE_ID_VALUES.includes(v),
  { message: `unknown siteId — must be one of: ${SITE_ID_VALUES.join(', ')}` },
);

/* ------------------------------------------------------------------ *
 * Time — ISO-8601 with an explicit offset. Local-naive strings are
 * rejected so that stored history survives DST and timezone moves.
 * ------------------------------------------------------------------ */

const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

export const isoDateTimeSchema = z
  .string()
  .regex(ISO_WITH_OFFSET, 'ISO-8601 with explicit UTC offset required (naive local time is rejected)');

/* ------------------------------------------------------------------ *
 * Ground truth — a recorded injection.
 * ------------------------------------------------------------------ */

export const injectionEventSchema = z.object({
  id: z.string().min(1).max(64),
  occurredAt: isoDateTimeSchema,
  siteId: siteIdSchema,
  volumeMl: z.number().positive().finite(),
  doseMg: z.number().positive().finite(),
  compoundIds: z.array(z.string().min(1)).min(1),
  /** Optional self-reported pain, integer 0..10. Informational only. */
  painScore: z.number().int().min(0).max(10).optional(),
  note: z.string().max(2000).optional(),
  source: z.enum(['planned', 'logged', 'imported']),
  createdAt: isoDateTimeSchema,
});
export type InjectionEvent = z.infer<typeof injectionEventSchema>;
/** What a user supplies when logging; ids/timestamps/source are assigned by the reducer. */
export type NewEventInput = Omit<InjectionEvent, 'id' | 'createdAt' | 'source'>;

/* ------------------------------------------------------------------ *
 * Plan — what the user intends, kept strictly separate from events.
 * ------------------------------------------------------------------ */

export const planCompoundSchema = z.object({
  compoundId: z.string().min(1),
  weeklyDoseMg: z.number().positive().finite(),
  concentrationMgMl: z.number().positive().finite(),
  injectionsPerWeek: z.number().int().min(1).max(4),
});
export type PlanCompound = z.infer<typeof planCompoundSchema>;

export const planSpecSchema = z.object({
  compounds: z.array(planCompoundSchema).min(1),
  /** Ordered preference; the rotator may deviate (LRU mode) but records why. */
  preferredSites: z.array(siteIdSchema).min(1),
  rotationMode: z.enum(['least-recently-used', 'fixed-order']),
});
export type PlanSpec = z.infer<typeof planSpecSchema>;

/* ------------------------------------------------------------------ *
 * Preferences — local-only except `locale` (which travels in exports).
 * R5/privacy: `acknowledgedAt`, tolerances and rest preference never
 * leave the device.
 * ------------------------------------------------------------------ */

export const prefsSchema = z.object({
  locale: z.enum(['ar', 'en']),
  /** IANA zone captured at creation; occurrences store resolved offsets. */
  tz: z.string().min(1),
  /** User-declared tolerance for classifying an actual as on-time. */
  lateToleranceHours: z.number().int().min(0).max(72),
  /** R3: personal scheduling preference, NOT a clinical safety rule. */
  restPreferenceDays: z.number().int().min(3).max(60),
  acknowledgedAt: isoDateTimeSchema.optional(),
});
export type Prefs = z.infer<typeof prefsSchema>;

export const APP_SCHEMA_VERSION = 2;

export const appStateSchema = z.object({
  schemaVersion: z.literal(APP_SCHEMA_VERSION),
  events: z.array(injectionEventSchema),
  plan: planSpecSchema,
  prefs: prefsSchema,
});
export type AppState = z.infer<typeof appStateSchema>;

/* ------------------------------------------------------------------ *
 * Export envelope — the only supported import format (R4: FHIR is
 * export-only and is not accepted back in).
 * ------------------------------------------------------------------ */

export const exportEnvelopeSchema = z.object({
  format: z.literal('tool-036-export'),
  schemaVersion: z.literal(APP_SCHEMA_VERSION),
  exportedAt: isoDateTimeSchema,
  checksum: z.string().regex(/^[a-f0-9]{64}$/, 'checksum must be a lowercase hex sha-256'),
  payload: z.object({
    events: z.array(injectionEventSchema),
    plan: planSpecSchema,
    locale: z.enum(['ar', 'en']),
  }),
});
export type ExportEnvelope = z.infer<typeof exportEnvelopeSchema>;

export const importErrorCode = z.enum([
  'not-json',
  'not-an-object',
  'wrong-format',
  'version-unsupported',
  'schema-mismatch',
  'checksum-mismatch',
  'conflict-id',
]);
export type ImportErrorCode = z.infer<typeof importErrorCode>;

export interface ImportError {
  code: ImportErrorCode;
  /** zod path or payload path, e.g. "payload.events[3].painScore". */
  path: string;
  messageEn: string;
  messageAr: string;
}

export type ImportResult =
  | { ok: true; envelope: ExportEnvelope; added: number; skippedDuplicates: number }
  | { ok: false; errors: ImportError[] };

/* ------------------------------------------------------------------ *
 * Plan vs Actual — itemised differences only (R5: no composite score).
 * ------------------------------------------------------------------ */

export const driftStatus = z.enum(['matched', 'late', 'missed', 'extra', 'site-changed']);

export const driftItemSchema = z.object({
  /**
   * The planned slot this item judges. `null` means "no scheduled
   * counterpart" — used by `extra` facts, which are real recordings the plan
   * does not account for. It must never be filled with an unrelated time
   * (e.g. the window start) presented as if a shot had been planned there.
   */
  scheduledAt: isoDateTimeSchema.nullable(),
  status: driftStatus,
  actual: z.object({ occurredAt: isoDateTimeSchema, siteId: siteIdSchema }).optional(),
  deltaHours: z.number().optional(),
  /**
   * Human-readable explanation generated from the declared comparison rules,
   * in both interface languages (F7.5) — the UI picks one, mirroring
   * `ImportError.messageEn/messageAr`.
   */
  reasonEn: z.string().min(1),
  reasonAr: z.string().min(1),
  /** Which declared rule produced this classification (traceable in the registry). */
  ruleId: z.string().min(1),
});
export type DriftItem = z.infer<typeof driftItemSchema>;

export const driftReportSchema = z.object({
  windowStart: isoDateTimeSchema,
  windowEnd: isoDateTimeSchema,
  computedAt: isoDateTimeSchema,
  items: z.array(driftItemSchema),
  summary: z.object({
    matched: z.number().int().min(0),
    late: z.number().int().min(0),
    missed: z.number().int().min(0),
    extra: z.number().int().min(0),
    siteChanged: z.number().int().min(0),
  }),
});
export type DriftReport = z.infer<typeof driftReportSchema>;

/* ------------------------------------------------------------------ *
 * Rule registry — every health or comparison claim that reaches the UI
 * must resolve to one of these (R2/R3/R7). `kind` separates medical
 * claims (need a real source) from product/scheduling rules (need an
 * explicit, human-readable basis).
 * ------------------------------------------------------------------ */

export const medicalRuleSchema = z.object({
  ruleId: z.string().min(1),
  kind: z.enum(['medical', 'product']),
  claimEn: z.string().min(1),
  claimAr: z.string().min(1),
  source: z.object({
    type: z.enum(['label', 'secondary', 'consensus', 'unverified']),
    ref: z.string().min(1),
    confidence: z.enum(['High', 'Moderate', 'Low', 'None']),
  }),
  applicabilityEn: z.string().min(1),
  applicabilityAr: z.string().min(1),
  status: z.enum(['active', 'display-unverified', 'disabled']),
});
export type MedicalRule = z.infer<typeof medicalRuleSchema>;

/* ------------------------------------------------------------------ *
 * Actions — the only ways state may change (single reducer, D1).
 * ------------------------------------------------------------------ */

export type Tool036Action =
  | { type: 'event/add'; event: NewEventInput }
  | { type: 'event/remove'; id: string }
  | { type: 'plan/replace'; plan: PlanSpec }
  | { type: 'prefs/update'; patch: Partial<Prefs> }
  | { type: 'ack/set'; at: string }
  | { type: 'import/merge'; events: InjectionEvent[]; plan?: PlanSpec; locale?: 'ar' | 'en' }
  | { type: 'data/reset' };
