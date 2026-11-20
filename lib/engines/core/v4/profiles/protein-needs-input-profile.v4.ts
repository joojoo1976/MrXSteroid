/**
 * lib/engines/core/v4/profiles/protein-needs-input-profile.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  R5 First Batch — Tool 2: mrx.tool.protein-needs — Additive Input Profile
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Metadata for the three required inputs. It calculates and persists nothing;
 *  the engine (`lib/tools/engines/protein-needs.v6.ts`) remains the sole
 *  numeric authority. Bounds mirror the engine and the schema.
 */

import type { FieldDefinition } from '../contracts.v4';

export const PROTEIN_NEEDS_INPUT_PROFILE_VERSION = '1.0.0' as const;
export const PROTEIN_NEEDS_REQUIRED_FIELDS = ['weightKg', 'goal', 'activityLevel'] as const;
export type ProteinNeedsRequiredFieldV4 = (typeof PROTEIN_NEEDS_REQUIRED_FIELDS)[number];

export const PROTEIN_NEEDS_INPUT_FIELD_PROFILE: readonly FieldDefinition[] = [
  {
    fieldId: 'weightKg',
    labelKey: 'protein-needs.input.weightKg',
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
    fieldId: 'goal',
    labelKey: 'protein-needs.input.goal',
    dataType: 'enum',
    required: true,
    constraints: { enumValues: ['maintain', 'bulk', 'cut'] },
    fieldState: 'MISSING',
    provenance: 'USER_ENTERED',
    sensitivityClass: 'personal',
  },
  {
    fieldId: 'activityLevel',
    labelKey: 'protein-needs.input.activityLevel',
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
export function countProvidedProteinNeedsFields(
  values: Partial<Record<ProteinNeedsRequiredFieldV4, unknown>>
): { provided: number; required: number; missing: ProteinNeedsRequiredFieldV4[] } {
  const missing = PROTEIN_NEEDS_REQUIRED_FIELDS.filter(
    (field) => values[field] === undefined || values[field] === null
  );
  return {
    provided: PROTEIN_NEEDS_REQUIRED_FIELDS.length - missing.length,
    required: PROTEIN_NEEDS_REQUIRED_FIELDS.length,
    missing,
  };
}
