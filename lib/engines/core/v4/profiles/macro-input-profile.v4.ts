/**
 * lib/engines/core/v4/profiles/macro-input-profile.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  M4-IN-01 — Versioned Macro Input Field Profile
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Standalone, additive profile for the six required Macro input fields.
 *  It consumes the accepted V4 `FieldDefinition` contract and does not modify
 *  it. It is intentionally not imported by the adapter, runtime, pilot, route,
 *  template, registry, catalog, or `index.ts`.
 *
 *  Macro V6 remains the sole numeric authority. This file performs no
 *  calculation, conversion, validation execution, persistence, AI call,
 *  network access, fingerprinting, or hashing.
 *
 *  ── STATIC METADATA SEMANTICS (owner condition) ──────────────────────────────
 *  `fieldState: 'MISSING'` is a static declaration default meaning:
 *  "this field is required and no value is supplied in the definition."
 *  It is NOT evidence that a user submitted a value, and it is NOT a runtime
 *  field state. Actual state must be computed with `validateFieldValue()`.
 *
 *  `provenance: 'USER_ENTERED'` declares the only permitted source class for a
 *  value of this field. It is NOT evidence that runtime provenance has been
 *  established. Actual provenance belongs to the caller/adapter snapshot.
 *
 *  `sensitivityClass: 'personal'` is a classification, not a consent record.
 *  No consent scope, observation timestamp, freshness policy, or normalization
 *  version is asserted by this profile.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import type { FieldDefinition } from '../contracts.v4';

/** Independent semver for this profile; it does not change V4 schema versions. */
export const MACRO_INPUT_PROFILE_VERSION = '1.0.0' as const;

/**
 * The six required Macro inputs, in canonical order.
 *
 * Bounds and enums mirror `lib/tools/schemas/macro.v6.ts`:
 *   age 19–100, height 100–250 cm, weight 30–300 kg,
 *   activity 1.2–1.9, sex male/female, phase bulk/cut/maintenance.
 *
 * `recomp` is deliberately excluded because Macro V6 has no approved formula
 * for it. `age` is declared `integer` because age is supplied in whole years;
 * this is a profile-level type declaration and does not alter the engine or
 * schema.
 */
export const MACRO_INPUT_FIELD_PROFILE: readonly FieldDefinition[] = [
  {
    fieldId: 'age',
    labelKey: 'macro.input.age',
    dataType: 'integer',
    required: true,
    unit: 'years',
    canonicalUnit: 'years',
    constraints: { min: 19, max: 100 },
    fieldState: 'MISSING',
    provenance: 'USER_ENTERED',
    sensitivityClass: 'personal',
  },
  {
    fieldId: 'sex',
    labelKey: 'macro.input.sex',
    dataType: 'enum',
    required: true,
    constraints: { enumValues: ['male', 'female'] },
    fieldState: 'MISSING',
    provenance: 'USER_ENTERED',
    sensitivityClass: 'personal',
  },
  {
    fieldId: 'heightCm',
    labelKey: 'macro.input.heightCm',
    dataType: 'number',
    required: true,
    unit: 'cm',
    canonicalUnit: 'cm',
    constraints: { min: 100, max: 250 },
    fieldState: 'MISSING',
    provenance: 'USER_ENTERED',
    sensitivityClass: 'personal',
  },
  {
    fieldId: 'weightKg',
    labelKey: 'macro.input.weightKg',
    dataType: 'number',
    required: true,
    unit: 'kg',
    canonicalUnit: 'kg',
    constraints: { min: 30, max: 300 },
    fieldState: 'MISSING',
    provenance: 'USER_ENTERED',
    sensitivityClass: 'personal',
  },
  {
    fieldId: 'activityLevel',
    labelKey: 'macro.input.activityLevel',
    dataType: 'number',
    required: true,
    unit: 'factor',
    canonicalUnit: 'factor',
    constraints: { min: 1.2, max: 1.9 },
    fieldState: 'MISSING',
    provenance: 'USER_ENTERED',
    sensitivityClass: 'personal',
  },
  {
    fieldId: 'phase',
    labelKey: 'macro.input.phase',
    dataType: 'enum',
    required: true,
    constraints: { enumValues: ['bulk', 'cut', 'maintenance'] },
    fieldState: 'MISSING',
    provenance: 'USER_ENTERED',
    sensitivityClass: 'personal',
  },
];
