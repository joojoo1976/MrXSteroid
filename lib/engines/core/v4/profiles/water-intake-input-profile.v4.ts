/**
 * lib/engines/core/v4/profiles/water-intake-input-profile.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  R5 First Batch — Tool 3: mrx.tool.water-intake — Additive Input Profile
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Metadata for the two required inputs. Calculates and persists nothing; the
 *  engine (`lib/tools/engines/water-intake.v6.ts`) remains the sole authority.
 *  Bounds mirror the engine and the schema.
 */

import type { FieldDefinition } from '../contracts.v4';

export const WATER_INTAKE_INPUT_PROFILE_VERSION = '1.0.0' as const;
export const WATER_INTAKE_REQUIRED_FIELDS = ['weightKg', 'activityLevel'] as const;
export type WaterIntakeRequiredFieldV4 = (typeof WATER_INTAKE_REQUIRED_FIELDS)[number];

export const WATER_INTAKE_INPUT_FIELD_PROFILE: readonly FieldDefinition[] = [
  {
    fieldId: 'weightKg',
    labelKey: 'water-intake.input.weightKg',
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
    labelKey: 'water-intake.input.activityLevel',
    dataType: 'number',
    required: true,
    unit: 'factor',
    canonicalUnit: 'factor',
    constraints: { min: 1, max: 1.4 },
    fieldState: 'MISSING',
    provenance: 'USER_ENTERED',
    sensitivityClass: 'personal',
  },
];

/** Count provided values; nullish entries are never provided. */
export function countProvidedWaterIntakeFields(
  values: Partial<Record<WaterIntakeRequiredFieldV4, unknown>>
): { provided: number; required: number; missing: WaterIntakeRequiredFieldV4[] } {
  const missing = WATER_INTAKE_REQUIRED_FIELDS.filter(
    (field) => values[field] === undefined || values[field] === null
  );
  return {
    provided: WATER_INTAKE_REQUIRED_FIELDS.length - missing.length,
    required: WATER_INTAKE_REQUIRED_FIELDS.length,
    missing,
  };
}
