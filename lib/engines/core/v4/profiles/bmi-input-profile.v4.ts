/**
 * lib/engines/core/v4/profiles/bmi-input-profile.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  R5 First Batch — Tool 1: mrx.tool.bmi — Additive Input Field Profile
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Metadata for the two required inputs. Metadata only: it calculates nothing,
 *  persists nothing and is not wired into the engine or the runtime. Canonical
 *  units are kg/cm; display conversion is a display-boundary concern.
 *
 *  Bounds mirror the pilot's upper/lower UI guards (30–300 kg, 100–250 cm).
 *  Bounds are NOT enforced by editing the engine or the schema; the adapter and
 *  the pilot enforce them at the boundary instead.
 */

import type { FieldDefinition } from '../contracts.v4';

export const BMI_INPUT_PROFILE_VERSION = '1.0.0' as const;
export const BMI_REQUIRED_FIELDS = ['weightKg', 'heightCm'] as const;
export type BmiRequiredFieldV4 = (typeof BMI_REQUIRED_FIELDS)[number];

export const BMI_INPUT_FIELD_PROFILE: readonly FieldDefinition[] = [
  {
    fieldId: 'weightKg',
    labelKey: 'bmi.input.weightKg',
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
    fieldId: 'heightCm',
    labelKey: 'bmi.input.heightCm',
    dataType: 'number',
    required: true,
    unit: 'cm',
    canonicalUnit: 'cm',
    constraints: { min: 100, max: 250 },
    fieldState: 'MISSING',
    provenance: 'USER_ENTERED',
    sensitivityClass: 'personal',
  },
];

/** Count provided values among the two required fields; no fabrication. */
export function countProvidedBmiFields(
  values: Partial<Record<BmiRequiredFieldV4, unknown>>
): { provided: number; required: number; missing: BmiRequiredFieldV4[] } {
  const missing = BMI_REQUIRED_FIELDS.filter(
    (field) => values[field] === undefined || values[field] === null
  );
  return { provided: BMI_REQUIRED_FIELDS.length - missing.length, required: BMI_REQUIRED_FIELDS.length, missing };
}
