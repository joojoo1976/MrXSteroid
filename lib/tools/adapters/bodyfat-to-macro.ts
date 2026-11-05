// lib/tools/adapters/bodyfat-to-macro.ts
// §28.4 Unified adapter: Body Fat → Macro
// Pure module: no React, no DOM, no Supabase, no Date, no I/O.

import type { MacroInputV6 } from '../engines/macro.v6';
import type { LinkedDataResult, ValidationOutcome } from '@/lib/shared/cross-tool-link';
import { BODYFAT_TO_MACRO_POLICY, validateLinkedData } from '@/lib/shared/cross-tool-link';

export interface BodyFatImportedFields {
  weight?: number; // kg
  bodyFatPercent?: number; // percent
}

export function extractBodyFatFields(linked: LinkedDataResult): BodyFatImportedFields {
  const v = (linked.value ?? {}) as Record<string, unknown>;
  const f = linked.fields ?? {};
  const weight = (f.weight ?? v.weight ?? v.weightKg) as number | undefined;
  const bodyFatPercent = (f.bodyFatPercent ?? v.bodyFatPercent ?? v.bodyFat) as number | undefined;
  return { weight, bodyFatPercent };
}

export function adaptBodyFatToMacro(linked: LinkedDataResult): Partial<MacroInputV6> {
  const { weight } = extractBodyFatFields(linked);
  const out: Partial<MacroInputV6> = {};
  if (typeof weight === 'number' && Number.isFinite(weight)) out.weightKg = weight;
  // Current body-fat percentage is not a target percentage or a Macro v6
  // equation input. Do not relabel or carry it into unused optional fields.
  return out;
}

export function validateBodyFatForMacro(
  linked: LinkedDataResult,
  now: number = Date.now()
): ValidationOutcome<Partial<MacroInputV6>> {
  if (linked.sourceToolId !== 'mrx.tool.bodyfat') {
    return { ok: false, stale: false, unitMismatch: false, lowConfidence: false, insufficient: true, reason: 'source_tool_mismatch' };
  }
  if (linked.unit !== BODYFAT_TO_MACRO_POLICY.requiredUnit) {
    return { ok: false, stale: false, unitMismatch: true, lowConfidence: false, insufficient: false, reason: 'unit_missing_or_mismatched' };
  }
  const computedMs = Date.parse(linked.computedAt);
  if (!Number.isFinite(computedMs) || computedMs > now + 60_000) {
    return { ok: false, stale: true, unitMismatch: false, lowConfidence: false, insufficient: false, reason: 'invalid_or_future_timestamp' };
  }
  if (typeof linked.confidence === 'number' && (!Number.isFinite(linked.confidence) || linked.confidence < 0 || linked.confidence > 1)) {
    return { ok: false, stale: false, unitMismatch: false, lowConfidence: true, insufficient: false, reason: 'invalid_confidence' };
  }
  const { weight, bodyFatPercent } = extractBodyFatFields(linked);
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 30 || weight > 300) {
    return { ok: false, stale: false, unitMismatch: false, lowConfidence: false, insufficient: true, reason: 'invalid_weight' };
  }
  if (typeof bodyFatPercent !== 'number' || !Number.isFinite(bodyFatPercent) || bodyFatPercent < 0 || bodyFatPercent > 100) {
    return { ok: false, stale: false, unitMismatch: false, lowConfidence: false, insufficient: true, reason: 'invalid_body_fat_percent' };
  }
  const base = validateLinkedData(BODYFAT_TO_MACRO_POLICY, linked, now) as ValidationOutcome<Partial<MacroInputV6>>;
  if (!base.ok) return base;
  const converted = adaptBodyFatToMacro(linked);
  return { ...base, convertedValue: converted };
}

export const BODYFAT_TO_MACRO_CONTINUE: { sourceToolId: string; targetToolId: string } = {
  sourceToolId: 'mrx.tool.bodyfat',
  targetToolId: 'mrx.tool.macro',
};

export const BODYFAT_TO_MACRO_CARRY_FORWARD: { sourceToolId: string; targetToolId: string; fields: string[] } = {
  sourceToolId: 'mrx.tool.bodyfat',
  targetToolId: 'mrx.tool.macro',
  fields: ['weight', 'bodyFatPercent'],
};
