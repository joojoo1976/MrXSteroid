import { z } from 'zod';

/** Values deliberately stay scalar at the sharing boundary. A consumer must
 * declare every field and unit it accepts; nested objects are not forwarded. */
export const CrossToolScalarSchema = z.union([
  z.string().max(500),
  z.number().finite(),
  z.boolean(),
]);

const ToolIdSchema = z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9._-]+$/);
const TimestampSchema = z.string().datetime({ offset: true });

export const CrossToolResultFieldSchema = z.object({
  key: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9._-]+$/),
  value: CrossToolScalarSchema,
  unit: z.string().trim().min(1).max(32).optional(),
  recordedAt: TimestampSchema.optional(),
  origin: z.enum(['USER_PROVIDED', 'CALCULATED', 'RULE_BASED', 'STATISTICAL_ESTIMATE', 'MODEL_PREDICTION', 'CROSS_TOOL_DERIVED']),
  sourceLabel: z.string().trim().min(1).max(160),
}).strict();

export const CrossToolResultEnvelopeV7Schema = z.object({
  schemaVersion: z.literal(1),
  resultId: z.string().trim().min(1).max(120),
  sourceToolId: ToolIdSchema,
  sourceToolVersion: z.string().trim().min(1).max(40),
  createdAt: TimestampSchema,
  privacyClass: z.enum(['PUBLIC', 'PERSONAL', 'SENSITIVE']),
  fields: z.array(CrossToolResultFieldSchema).min(1).max(40),
  consent: z.object({
    grantedAt: TimestampSchema,
    targetToolIds: z.array(ToolIdSchema).max(20),
  }).strict(),
}).strict().superRefine((envelope, context) => {
  const keys = envelope.fields.map((field) => field.key);
  if (new Set(keys).size !== keys.length) {
    context.addIssue({ code: 'custom', path: ['fields'], message: 'Shared result field keys must be unique.' });
  }
  if (new Set(envelope.consent.targetToolIds).size !== envelope.consent.targetToolIds.length) {
    context.addIssue({ code: 'custom', path: ['consent', 'targetToolIds'], message: 'Consent targets must be unique.' });
  }
  if (envelope.consent.targetToolIds.includes(envelope.sourceToolId)) {
    context.addIssue({ code: 'custom', path: ['consent', 'targetToolIds'], message: 'A result cannot be shared back to its source tool.' });
  }
  if (Date.parse(envelope.consent.grantedAt) < Date.parse(envelope.createdAt)) {
    context.addIssue({ code: 'custom', path: ['consent', 'grantedAt'], message: 'Consent cannot predate the shared result.' });
  }
});

export type CrossToolResultFieldV7 = z.infer<typeof CrossToolResultFieldSchema>;
export type CrossToolResultEnvelopeV7 = z.infer<typeof CrossToolResultEnvelopeV7Schema>;

export interface CrossToolFieldRequirementV7 {
  key: string;
  unit?: string;
  required?: boolean;
  maxAgeMs?: number;
}

export type CrossToolImportDecisionV7 =
  | { status: 'READY'; sourceToolId: string; createdAt: string; privacyClass: CrossToolResultEnvelopeV7['privacyClass']; fields: CrossToolResultFieldV7[] }
  | { status: 'PARTIAL'; reason: 'REQUIRED_FIELD_MISSING'; missingFields: string[] }
  | { status: 'NOT_AVAILABLE'; reason: 'CONSENT_NOT_GRANTED' | 'SOURCE_TARGET_MISMATCH' | 'INVALID_TIMESTAMP' | 'FUTURE_RESULT' | 'FUTURE_CONSENT' | 'STALE_RESULT' | 'UNIT_MISMATCH'; field?: string }
  | { status: 'INVALID_INPUT'; issues: string[] };

/** Grant is deliberately target-specific. Call only from an explicit user action. */
export function grantCrossToolResultToTargetV7(
  raw: unknown,
  targetToolId: string,
  grantedAt: string,
): CrossToolResultEnvelopeV7 | null {
  const parsed = CrossToolResultEnvelopeV7Schema.safeParse(raw);
  const target = ToolIdSchema.safeParse(targetToolId);
  const timestamp = TimestampSchema.safeParse(grantedAt);
  if (!parsed.success || !target.success || !timestamp.success || target.data === parsed.data.sourceToolId) return null;
  const targetToolIds = [...new Set([...parsed.data.consent.targetToolIds, target.data])];
  const granted = CrossToolResultEnvelopeV7Schema.safeParse({
    ...parsed.data,
    consent: { grantedAt: timestamp.data, targetToolIds },
  });
  return granted.success ? granted.data : null;
}

/** Revocation removes access immediately; if no recipient remains, discard the envelope. */
export function revokeCrossToolResultTargetV7(
  envelope: CrossToolResultEnvelopeV7,
  targetToolId: string,
): CrossToolResultEnvelopeV7 | null {
  const remaining = envelope.consent.targetToolIds.filter((id) => id !== targetToolId);
  if (remaining.length === 0) return null;
  return { ...envelope, consent: { ...envelope.consent, targetToolIds: remaining } };
}

/**
 * Validate at the consumer boundary. No implicit unit conversion, freshness
 * default, input forwarding, or source trust is applied here.
 */
export function validateCrossToolImportV7(
  raw: unknown,
  targetToolId: string,
  requirements: readonly CrossToolFieldRequirementV7[],
  options: { now: number; maxAgeMs?: number; maxFutureSkewMs?: number },
): CrossToolImportDecisionV7 {
  const parsed = CrossToolResultEnvelopeV7Schema.safeParse(raw);
  if (!parsed.success) {
    return { status: 'INVALID_INPUT', issues: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'result'}: ${issue.message}`) };
  }
  const target = ToolIdSchema.safeParse(targetToolId);
  if (!target.success) return { status: 'INVALID_INPUT', issues: ['targetToolId: invalid tool identifier'] };
  if (parsed.data.sourceToolId === target.data) return { status: 'NOT_AVAILABLE', reason: 'SOURCE_TARGET_MISMATCH' };
  if (!parsed.data.consent.targetToolIds.includes(target.data)) return { status: 'NOT_AVAILABLE', reason: 'CONSENT_NOT_GRANTED' };
  if (!Number.isFinite(options.now) || (options.maxAgeMs !== undefined && (!Number.isFinite(options.maxAgeMs) || options.maxAgeMs < 0)) ||
      (options.maxFutureSkewMs !== undefined && (!Number.isFinite(options.maxFutureSkewMs) || options.maxFutureSkewMs < 0))) {
    return { status: 'INVALID_INPUT', issues: ['validation options must use finite time values and non-negative freshness windows'] };
  }

  const createdAt = Date.parse(parsed.data.createdAt);
  if (!Number.isFinite(createdAt)) return { status: 'NOT_AVAILABLE', reason: 'INVALID_TIMESTAMP' };
  if (createdAt > options.now + (options.maxFutureSkewMs ?? 0)) return { status: 'NOT_AVAILABLE', reason: 'FUTURE_RESULT' };
  const grantedAt = Date.parse(parsed.data.consent.grantedAt);
  if (!Number.isFinite(grantedAt)) return { status: 'NOT_AVAILABLE', reason: 'INVALID_TIMESTAMP' };
  if (grantedAt > options.now + (options.maxFutureSkewMs ?? 0)) return { status: 'NOT_AVAILABLE', reason: 'FUTURE_CONSENT' };
  if (options.maxAgeMs !== undefined && options.now - createdAt > options.maxAgeMs) {
    return { status: 'NOT_AVAILABLE', reason: 'STALE_RESULT' };
  }

  const byKey = new Map(parsed.data.fields.map((field) => [field.key, field]));
  const missingFields = requirements.filter((requirement) => requirement.required !== false && !byKey.has(requirement.key)).map((requirement) => requirement.key);
  if (missingFields.length > 0) return { status: 'PARTIAL', reason: 'REQUIRED_FIELD_MISSING', missingFields };

  const selected: CrossToolResultFieldV7[] = [];
  for (const requirement of requirements) {
    const field = byKey.get(requirement.key);
    if (!field) continue;
    const fieldAt = Date.parse(field.recordedAt ?? parsed.data.createdAt);
    if (!Number.isFinite(fieldAt)) return { status: 'NOT_AVAILABLE', reason: 'INVALID_TIMESTAMP', field: requirement.key };
    if (fieldAt > options.now + (options.maxFutureSkewMs ?? 0)) return { status: 'NOT_AVAILABLE', reason: 'FUTURE_RESULT', field: requirement.key };
    const maxAgeMs = requirement.maxAgeMs ?? options.maxAgeMs;
    if (maxAgeMs !== undefined && options.now - fieldAt > maxAgeMs) return { status: 'NOT_AVAILABLE', reason: 'STALE_RESULT', field: requirement.key };
    if (requirement.unit !== undefined && field.unit !== requirement.unit) {
      return { status: 'NOT_AVAILABLE', reason: 'UNIT_MISMATCH', field: requirement.key };
    }
    selected.push(field);
  }

  return {
    status: 'READY',
    sourceToolId: parsed.data.sourceToolId,
    createdAt: parsed.data.createdAt,
    privacyClass: parsed.data.privacyClass,
    fields: selected,
  };
}
