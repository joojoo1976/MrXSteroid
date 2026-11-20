/**
 * lib/engines/core/v4/profiles/macro-input-metadata.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Batch A — Additive Macro V4 Input Metadata Profile
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Extends the completed M4-IN-01 field profile with the remaining eligible
 *  input requirements without modifying M4-IN-01, the accepted V4 contracts,
 *  the runtime, the adapter, Macro V6, the schema, the registry, or the pilot's
 *  numeric behavior.
 *
 *  Covered requirements:
 *  - M4-IN-02: unit metadata and the display/canonical conversion boundary.
 *  - M4-IN-03: per-field provenance policy (declaration only).
 *  - M4-IN-04: observedAt vs recordedAt timestamp semantics.
 *  - M4-IN-05: sensitivity, consent and freshness metadata (no defaults).
 *  - Input completeness and validation integration using accepted runtime
 *    validators.
 *
 *  This module is pure: no React, DOM, clock, storage, network, AI, provider,
 *  fingerprint, hash, HMAC, salt, secret, or persistence behavior. Units are
 *  display-only; Macro V6 remains the sole numeric authority in kg/cm.
 */

import type {
  FieldDefinition,
  FieldState,
  InputCompleteness,
  Provenance,
  SensitivityClass,
} from '../contracts.v4';
import { assessInputCompleteness, validateFieldValue } from '../runtime.v4';
import { MACRO_INPUT_FIELD_PROFILE } from './macro-input-profile.v4';

/** The six required Macro inputs, in canonical order. */
export type MacroInputFieldIdV4 =
  | 'age'
  | 'sex'
  | 'heightCm'
  | 'weightKg'
  | 'activityLevel'
  | 'phase';

export type MacroDisplayUnitSystemV4 = 'metric' | 'imperial';

/** Exact conversion constants already used by the pilot; math is unchanged. */
export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

export interface MacroInputUnitMetadataV4 {
  fieldId: MacroInputFieldIdV4;
  canonicalUnit: string;
  displayUnits: readonly string[];
  displayPrecision: number;
  convertsDisplayUnits: boolean;
}

/**
 * Display metadata only. The canonical units are the engine's kg/cm inputs;
 * `sex`, `phase` and `activityLevel` are dimensionless.
 */
export const MACRO_INPUT_UNIT_METADATA: readonly MacroInputUnitMetadataV4[] = [
  {
    fieldId: 'age',
    canonicalUnit: 'years',
    displayUnits: ['years'],
    displayPrecision: 0,
    convertsDisplayUnits: false,
  },
  {
    fieldId: 'sex',
    canonicalUnit: 'enum',
    displayUnits: [],
    displayPrecision: 0,
    convertsDisplayUnits: false,
  },
  {
    fieldId: 'heightCm',
    canonicalUnit: 'cm',
    displayUnits: ['cm', 'in'],
    displayPrecision: 1,
    convertsDisplayUnits: true,
  },
  {
    fieldId: 'weightKg',
    canonicalUnit: 'kg',
    displayUnits: ['kg', 'lb'],
    displayPrecision: 1,
    convertsDisplayUnits: true,
  },
  {
    fieldId: 'activityLevel',
    canonicalUnit: 'factor',
    displayUnits: ['factor'],
    displayPrecision: 2,
    convertsDisplayUnits: false,
  },
  {
    fieldId: 'phase',
    canonicalUnit: 'enum',
    displayUnits: [],
    displayPrecision: 0,
    convertsDisplayUnits: false,
  },
];

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Convert a canonical engine value into its display value.
 * Only weight (kg→lb) and height (cm→in) convert; all other fields pass through.
 */
export function macroToDisplayValue(
  fieldId: MacroInputFieldIdV4,
  canonicalValue: number,
  units: MacroDisplayUnitSystemV4
): number {
  if (fieldId === 'weightKg') {
    return roundToOneDecimal(units === 'imperial' ? canonicalValue / KG_PER_LB : canonicalValue);
  }
  if (fieldId === 'heightCm') {
    return roundToOneDecimal(units === 'imperial' ? canonicalValue / CM_PER_IN : canonicalValue);
  }
  return canonicalValue;
}

/**
 * Convert a display value back to the canonical engine value.
 * Applying this to an already-canonical metric value is a no-op.
 */
export function macroToCanonicalValue(
  fieldId: MacroInputFieldIdV4,
  displayedValue: number,
  units: MacroDisplayUnitSystemV4
): number {
  if (units === 'imperial' && fieldId === 'weightKg') return displayedValue * KG_PER_LB;
  if (units === 'imperial' && fieldId === 'heightCm') return displayedValue * CM_PER_IN;
  return displayedValue;
}

export interface MacroProvenancePolicyV4 {
  currentSource: Provenance;
  allowedSources: readonly Provenance[];
  forbiddenSources: readonly Provenance[];
  missingFieldProvenance: null;
  impliesSubmission: false;
}

/**
 * Declaration only. Runtime provenance is still produced by the adapter's
 * input snapshot; this policy records that the current path accepts only
 * user-entered values and never infers a source for a missing field.
 */
export const MACRO_PROVENANCE_POLICY: MacroProvenancePolicyV4 = {
  currentSource: 'USER_ENTERED',
  allowedSources: ['USER_ENTERED'],
  forbiddenSources: ['IMPORTED', 'CROSS_TOOL', 'ESTIMATED', 'SYSTEM_DERIVED'],
  missingFieldProvenance: null,
  impliesSubmission: false,
};

export interface MacroTimestampPolicyV4 {
  recordedAt: 'ENVELOPE_CREATION_TIME_INJECTED_BY_CALLER';
  observedAt: 'ABSENT_UNLESS_A_REAL_OBSERVATION_EXISTS';
  impliesPersistence: false;
  impliesMeasurement: false;
}

/**
 * `recordedAt` records when the envelope was produced. `observedAt` is absent
 * because the current Macro path does not observe or measure a user value.
 * Neither timestamp implies that anything was stored.
 */
export const MACRO_TIMESTAMP_POLICY: MacroTimestampPolicyV4 = {
  recordedAt: 'ENVELOPE_CREATION_TIME_INJECTED_BY_CALLER',
  observedAt: 'ABSENT_UNLESS_A_REAL_OBSERVATION_EXISTS',
  impliesPersistence: false,
  impliesMeasurement: false,
};

export interface MacroInputGovernanceV4 {
  fieldId: MacroInputFieldIdV4;
  sensitivityClass: SensitivityClass;
  consentScope: null;
  freshnessPolicyId: null;
  retention: 'NONE';
  inferredTraits?: readonly string[];
}

/**
 * M4-IN-05 classification. All six fields are `personal`; no consent scope or
 * freshness policy is defaulted, and no inferred sensitive trait is declared.
 */
export const MACRO_INPUT_GOVERNANCE: readonly MacroInputGovernanceV4[] = [
  { fieldId: 'age', sensitivityClass: 'personal', consentScope: null, freshnessPolicyId: null, retention: 'NONE' },
  { fieldId: 'sex', sensitivityClass: 'personal', consentScope: null, freshnessPolicyId: null, retention: 'NONE' },
  { fieldId: 'heightCm', sensitivityClass: 'personal', consentScope: null, freshnessPolicyId: null, retention: 'NONE' },
  { fieldId: 'weightKg', sensitivityClass: 'personal', consentScope: null, freshnessPolicyId: null, retention: 'NONE' },
  { fieldId: 'activityLevel', sensitivityClass: 'personal', consentScope: null, freshnessPolicyId: null, retention: 'NONE' },
  { fieldId: 'phase', sensitivityClass: 'personal', consentScope: null, freshnessPolicyId: null, retention: 'NONE' },
];

const MACRO_FIELD_IDS = MACRO_INPUT_FIELD_PROFILE.map((field) => field.fieldId) as MacroInputFieldIdV4[];

function isProvided(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/** Fields with a supplied value; it never invents a value or provenance. */
export function getMacroProvidedFields(
  values: Partial<Record<MacroInputFieldIdV4, unknown>>
): MacroInputFieldIdV4[] {
  return MACRO_FIELD_IDS.filter((fieldId) => isProvided(values[fieldId]));
}

/** Required fields with no supplied value. */
export function getMacroMissingFields(
  values: Partial<Record<MacroInputFieldIdV4, unknown>>
): MacroInputFieldIdV4[] {
  return MACRO_FIELD_IDS.filter((fieldId) => !isProvided(values[fieldId]));
}

/**
 * Delegates to the accepted runtime completeness assessment over the completed
 * M4-IN-01 field definitions. It does not calculate or modify an engine result.
 */
export function assessMacroInputCompletenessV4(
  values: Partial<Record<MacroInputFieldIdV4, unknown>>
): InputCompleteness {
  return assessInputCompleteness(
    [...MACRO_INPUT_FIELD_PROFILE] as FieldDefinition[],
    values as Record<string, unknown>
  );
}

/** Validate one field against its accepted M4-IN-01 definition. */
export function validateMacroInputField(
  fieldId: MacroInputFieldIdV4,
  value: unknown
): { state: FieldState; errors: string[] } {
  const field = MACRO_INPUT_FIELD_PROFILE.find((entry) => entry.fieldId === fieldId);
  if (!field) {
    return { state: 'INVALID', errors: [`Unknown Macro input field: ${fieldId}`] };
  }
  return validateFieldValue(field, value);
}
