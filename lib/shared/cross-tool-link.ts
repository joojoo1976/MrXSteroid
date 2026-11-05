// lib/shared/cross-tool-link.ts
// §28 Cross-Tool Linking Hard Requirements — foundational contracts & validation

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface UserContext {
  /** Supabase Auth user id when signed in; undefined for guests. */
  userId?: string;
  /** True when browsing as guest (local state only). */
  isGuest: boolean;
  /** Fields actually consumed from context by the tool. */
  usedFields: string[];
}

export interface LinkedDataResult<T = unknown> {
  sourceToolId: string;
  computedAt: string; // ISO 8601
  value: T;
  unit?: string;
  confidence?: ConfidenceLevel | number;
  fields?: Record<string, unknown>;
}

export interface SharedDataPolicy {
  kind: string;
  /** Max acceptable age in ms. */
  maxAgeMs: number;
  /** Reference internal unit required. */
  requiredUnit: string;
  /** Minimum acceptable confidence (0-1 or level). */
  minimumConfidence: number;
  /** Fields that must be present. */
  requiredFields: string[];
}

export interface LinkedDataContext {
  sourceToolId: string;
  sourceToolName?: string;
  computedAt: string;
  value: unknown;
  unit?: string;
  confidence?: ConfidenceLevel | number;
  stale: boolean;
  unitMismatch: boolean;
  lowConfidence: boolean;
  insufficient: boolean;
}

export interface ValidationOutcome<T = unknown> {
  ok: boolean;
  stale: boolean;
  unitMismatch: boolean;
  lowConfidence: boolean;
  insufficient: boolean;
  convertedValue?: T;
  reason?: string;
}

export function confidenceToNumber(c?: ConfidenceLevel | number): number {
  if (typeof c === 'number') return c;
  if (c === 'high') return 0.9;
  if (c === 'medium') return 0.6;
  if (c === 'low') return 0.3;
  return 0;
}

export function validateLinkedData<T = unknown>(
  policy: SharedDataPolicy,
  result: LinkedDataResult<T>,
  now: number = Date.now()
): ValidationOutcome<T> {
  const computedMs = Date.parse(result.computedAt);
  const stale = Number.isFinite(computedMs) ? now - computedMs > policy.maxAgeMs : true;

  const unitMismatch = !!result.unit && result.unit !== policy.requiredUnit;

  const conf = confidenceToNumber(result.confidence);
  const lowConfidence = conf < policy.minimumConfidence;

  const missing = policy.requiredFields.filter(
    (f) => result.fields?.[f] === undefined && (result.value as any)?.[f] === undefined
  );
  // also check top-level value object
  const insufficient =
    missing.length > 0 ||
    policy.requiredFields.some((f) => {
      const v = result.value as Record<string, unknown> | undefined;
      return v && typeof v === 'object' && v[f] === undefined && result.fields?.[f] === undefined;
    });

  // Unit conversion: only accept if already matching; conversion handled by caller via adapter
  const ok = !stale && !unitMismatch && !lowConfidence && !insufficient && missing.length === 0;

  return {
    ok,
    stale,
    unitMismatch,
    lowConfidence,
    insufficient: insufficient || missing.length > 0,
    convertedValue: result.value,
    reason: stale
      ? 'stale'
      : unitMismatch
      ? 'unit_mismatch'
      : lowConfidence
      ? 'low_confidence'
      : missing.length
      ? 'missing_fields'
      : undefined,
  };
}

export interface ContinueWithConfig {
  sourceToolId: string;
  targetToolId: string;
  targetRoute: string; // must exist in registry
  payload: Record<string, unknown>;
  requiresConsent: boolean;
}

export interface CarryForwardConfig extends ContinueWithConfig {
  allowEdit: boolean;
  allowReject: boolean;
}

export const BODYFAT_TO_MACRO_POLICY: SharedDataPolicy = {
  kind: 'body_composition',
  maxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  requiredUnit: 'kg',
  minimumConfidence: 0.6,
  requiredFields: ['weight', 'bodyFatPercent'],
};
// ============================================================
// §30 — Data validity verification (pure layers 2-4; layer 1 is Supabase/RLS runtime)
// ============================================================

export type VerificationStatus =
  | 'fresh'
  | 'stale'
  | 'invalid_date'
  | 'future_date'
  | 'unauthenticated'
  | 'access_denied'
  | 'invalid_payload'
  | 'insufficient_data'
  | 'unsupported_unit'
  | 'invalid_value'
  | 'sync_failed'
  | 'ai_unavailable';

export interface LayerResult {
  ok: boolean;
  status?: VerificationStatus;
  details?: string;
}

export interface ImportedDataVerification {
  ownership: LayerResult; // runtime: Supabase getUser() + RLS
  schema: LayerResult;
  freshness: LayerResult;
  unitValue: LayerResult;
  overallOk: boolean;
}

export interface ValueRange {
  min: number;
  max: number;
}

export const DEFAULT_VALUE_RANGES: Record<string, ValueRange> = {
  weight_kg: { min: 20, max: 300 },
  height_cm: { min: 100, max: 250 },
  body_fat_percent: { min: 3, max: 60 },
  tdee_kcal: { min: 800, max: 6000 },
};

export function verifySchema(record: unknown, requiredFields: string[]): LayerResult {
  if (!record || typeof record !== 'object') return { ok: false, status: 'invalid_payload', details: 'not_object' };
  const r = record as Record<string, unknown>;
  if (typeof r.tool_id !== 'string') return { ok: false, status: 'invalid_payload', details: 'missing_tool_id' };
  if (typeof r.calculated_at !== 'string' || Number.isNaN(Date.parse(r.calculated_at))) {
    return { ok: false, status: 'invalid_date', details: 'bad_calculated_at' };
  }
  const linking = r.linking as Record<string, unknown> | undefined;
  if (!linking || typeof linking !== 'object') return { ok: false, status: 'insufficient_data', details: 'missing_linking' };
  const rf = linking.required_fields;
  if (!Array.isArray(rf)) return { ok: false, status: 'insufficient_data', details: 'bad_required_fields' };
  const outputs = r.outputs as Record<string, unknown> | undefined;
  if (!outputs || typeof outputs !== 'object') return { ok: false, status: 'insufficient_data', details: 'missing_outputs' };
  for (const f of requiredFields) {
    if (outputs[f] === undefined || outputs[f] === null) return { ok: false, status: 'insufficient_data', details: `missing_${f}` };
    if (typeof outputs[f] === 'number' && (!Number.isFinite(outputs[f] as number))) {
      return { ok: false, status: 'invalid_value', details: `non_finite_${f}` };
    }
  }
  return { ok: true };
}

export function verifyFreshness(calculatedAt: string, maxAgeHours: number, now: number = Date.now()): LayerResult {
  const ms = Date.parse(calculatedAt);
  if (Number.isNaN(ms)) return { ok: false, status: 'invalid_date' };
  if (ms > now + 60_000) return { ok: false, status: 'future_date' };
  const ageHours = (now - ms) / 3_600_000;
  if (ageHours > maxAgeHours) return { ok: false, status: 'stale', details: `age_${ageHours.toFixed(1)}h` };
  return { ok: true };
}

export function verifyUnitValue(
  value: unknown,
  unit: string | undefined,
  requiredUnit: string,
  range?: ValueRange
): LayerResult {
  if (typeof value !== 'number' || !Number.isFinite(value)) return { ok: false, status: 'invalid_value' };
  if (unit && unit !== requiredUnit) {
    // conversion expected to be done by caller; if not converted, reject
    return { ok: false, status: 'unsupported_unit', details: `${unit}_vs_${requiredUnit}` };
  }
  if (range && (value < range.min || value > range.max)) {
    return { ok: false, status: 'invalid_value', details: `range_${range.min}_${range.max}` };
  }
  return { ok: true };
}

export function combineVerification(v: ImportedDataVerification): boolean {
  return v.ownership.ok && v.schema.ok && v.freshness.ok && v.unitValue.ok;
}

// ============================================================
// §29 — Record shape, freshness, internal reference units
// ============================================================

export interface LinkableUnits {
  [measurement: string]: string;
}

export interface LinkableLinking {
  shareable: boolean;
  max_age_hours: number;
  required_fields: string[];
  internal_reference_unit: Record<string, string>;
}

export interface LinkableToolResult<TOutputs = Record<string, unknown>> {
  schema_version: 1;
  tool_id: string;
  calculated_at: string; // ISO 8601
  engine_version: string;
  confidence: 'low' | 'medium' | 'high' | number;
  units: LinkableUnits;
  linking: LinkableLinking;
  outputs: TOutputs;
  inputs?: Record<string, unknown>;
  display?: Record<string, unknown>;
}

export const INTERNAL_REFERENCE_UNITS: Record<string, string> = {
  weight: 'kg',
  height: 'cm',
  circumference: 'cm',
  distance: 'm',
  energy: 'kcal',
  protein: 'g',
  carbs: 'g',
  fat: 'g',
  time: 'seconds',
  speed: 'm/s',
  body_fat: 'percent',
};

export const MAX_AGE_HOURS_DEFAULTS: Record<string, number> = {
  body_weight: 168,
  circumference: 336,
  body_fat_measured: 168,
  body_fat_estimated: 168,
  calories_tdee: 168,
  daily_readiness: 24,
  training_load_acwr: 168,
  performance_strength: 336,
  injury_pain: 24,
};

export function isFresh(record: { linking: { max_age_hours: number }; calculated_at: string }, now: number = Date.now()): boolean {
  const ageHours = (now - new Date(record.calculated_at).getTime()) / 3_600_000;
  return ageHours <= record.linking.max_age_hours;
}

export function buildLinkedDataContext(
  sourceToolId: string,
  sourceToolName: string | undefined,
  result: LinkedDataResult,
  policy: SharedDataPolicy,
  now: number = Date.now()
): LinkedDataContext {
  const v = validateLinkedData(policy, result, now);
  return {
    sourceToolId,
    sourceToolName,
    computedAt: result.computedAt,
    value: result.value,
    unit: result.unit,
    confidence: result.confidence,
    stale: v.stale,
    unitMismatch: v.unitMismatch,
    lowConfidence: v.lowConfidence,
    insufficient: v.insufficient,
  };
}


