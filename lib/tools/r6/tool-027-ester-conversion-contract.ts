/**
 * lib/tools/r6/tool-027-ester-conversion-contract.ts
 */
import {
  MolarMassConversionInputSchema,
  MolarMassConversionResultSchema,
  MassUnitSchema,
  type MolarMassConversionInput,
  type MolarMassConversionResult,
} from '@/lib/tools/schemas/tool-027-ester-conversion';

export type { MolarMassConversionInput, MolarMassConversionResult };

export type Tool027MassUnit = '' | 'mg' | 'g' | 'kg';

export interface Tool027Draft {
  sourceSubstanceLabel: string;
  sourceMass: string;
  sourceMassUnit: Tool027MassUnit;
  sourceMolarMass: string;
  sourceMolarMassSource: string;
  targetSubstanceLabel: string;
  targetMolarMass: string;
  targetMolarMassSource: string;
  targetMassUnit: Tool027MassUnit;
}

export type Tool027UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool027FieldId =
  | 'sourceSubstanceLabel'
  | 'sourceMass'
  | 'sourceMassUnit'
  | 'sourceMolarMass'
  | 'sourceMolarMassSource'
  | 'targetSubstanceLabel'
  | 'targetMolarMass'
  | 'targetMolarMassSource'
  | 'targetMassUnit';

export type Tool027IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool027Issue {
  field: Tool027FieldId;
  code: Tool027IssueCode;
}

export interface Tool027Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool027Issue[];
  input: MolarMassConversionInput | null;
}

export const TOOL_027_LIMITS = {
  sourceMassMin: 0, // exclusive (>0)
  sourceMassMax: 1_000_000_000,
  sourceMolarMassMin: 0, // exclusive
  sourceMolarMassMax: 1_000_000_000,
  targetMolarMassMin: 0,
  targetMolarMassMax: 1_000_000_000,
  labelMin: 1,
  labelMax: 120,
  sourceMin: 1,
  sourceMax: 200,
  unit: 'g',
} as const;

const GRAMS_PER_UNIT: Record<string, number> = { mg: 0.001, g: 1, kg: 1000 };

export function mirroredConcentration(input: MolarMassConversionInput): {
  sourceAmountInGrams: number;
  amountInMoles: number;
  targetAmountInGrams: number;
  targetAmount: number;
} {
  const sourceAmountInGrams = input.sourceMass * (GRAMS_PER_UNIT[input.sourceMassUnit] ?? 1);
  const amountInMoles = sourceAmountInGrams / input.sourceMolarMass;
  const targetAmountInGrams = amountInMoles * input.targetMolarMass;
  const targetAmount = targetAmountInGrams / (GRAMS_PER_UNIT[input.targetMassUnit] ?? 1);
  return { sourceAmountInGrams, amountInMoles, targetAmountInGrams, targetAmount };
}

export function formatAmount(value: number): string {
  return Number.isFinite(value) ? String(value) : '—';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function numeric(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function evaluateEsterConversionDraft(draft: Tool027Draft): Tool027Evaluation {
  const issues: Tool027Issue[] = [];

  const sourceMass = numeric(draft.sourceMass);
  if (draft.sourceMass.trim() !== '' && sourceMass === null) {
    issues.push({ field: 'sourceMass', code: 'invalid_number' });
  } else if (sourceMass !== null && (sourceMass <= 0 || sourceMass > 1_000_000_000)) {
    issues.push({ field: 'sourceMass', code: 'out_of_range' });
  }

  const sourceMolarMass = numeric(draft.sourceMolarMass);
  if (draft.sourceMolarMass.trim() !== '' && sourceMolarMass === null) {
    issues.push({ field: 'sourceMolarMass', code: 'invalid_number' });
  } else if (sourceMolarMass !== null && (sourceMolarMass <= 0 || sourceMolarMass > 1_000_000_000)) {
    issues.push({ field: 'sourceMolarMass', code: 'out_of_range' });
  }

  const targetMolarMass = numeric(draft.targetMolarMass);
  if (draft.targetMolarMass.trim() !== '' && targetMolarMass === null) {
    issues.push({ field: 'targetMolarMass', code: 'invalid_number' });
  } else if (targetMolarMass !== null && (targetMolarMass <= 0 || targetMolarMass > 1_000_000_000)) {
    issues.push({ field: 'targetMolarMass', code: 'out_of_range' });
  }

  if (draft.sourceMassUnit !== '' && !['mg', 'g', 'kg'].includes(draft.sourceMassUnit)) {
    issues.push({ field: 'sourceMassUnit', code: 'out_of_range' });
  }
  if (draft.targetMassUnit !== '' && !['mg', 'g', 'kg'].includes(draft.targetMassUnit)) {
    issues.push({ field: 'targetMassUnit', code: 'out_of_range' });
  }

  const anyEntered =
    draft.sourceSubstanceLabel.trim() !== '' ||
    draft.sourceMass.trim() !== '' ||
    draft.sourceMassUnit !== '' ||
    draft.sourceMolarMass.trim() !== '' ||
    draft.sourceMolarMassSource.trim() !== '' ||
    draft.targetSubstanceLabel.trim() !== '' ||
    draft.targetMolarMass.trim() !== '' ||
    draft.targetMolarMassSource.trim() !== '' ||
    draft.targetMassUnit !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const complete =
    draft.sourceSubstanceLabel.trim().length >= 1 &&
    draft.sourceSubstanceLabel.trim().length <= 120 &&
    sourceMass !== null &&
    sourceMass > 0 &&
    draft.sourceMassUnit !== '' &&
    sourceMolarMass !== null &&
    sourceMolarMass > 0 &&
    draft.sourceMolarMassSource.trim().length >= 1 &&
    draft.sourceMolarMassSource.trim().length <= 200 &&
    draft.targetSubstanceLabel.trim().length >= 1 &&
    draft.targetSubstanceLabel.trim().length <= 120 &&
    targetMolarMass !== null &&
    targetMolarMass > 0 &&
    draft.targetMolarMassSource.trim().length >= 1 &&
    draft.targetMolarMassSource.trim().length <= 200 &&
    draft.targetMassUnit !== '';

  if (!complete) return { state: 'PARTIAL', issues, input: null };

  const candidate: MolarMassConversionInput = {
    sourceSubstanceLabel: draft.sourceSubstanceLabel.trim(),
    sourceMass: sourceMass as number,
    sourceMassUnit: draft.sourceMassUnit as 'mg' | 'g' | 'kg',
    sourceMolarMass: sourceMolarMass as number,
    sourceMolarMassSource: draft.sourceMolarMassSource.trim(),
    targetSubstanceLabel: draft.targetSubstanceLabel.trim(),
    targetMolarMass: targetMolarMass as number,
    targetMolarMassSource: draft.targetMolarMassSource.trim(),
    targetMassUnit: draft.targetMassUnit as 'mg' | 'g' | 'kg',
  };

  const parsed = MolarMassConversionInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'sourceMass', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Sources (C4) ─────────────────────────────────────────────────────────── */

export interface Tool027SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

export const TOOL_027_SOURCES: readonly Tool027SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool027MappedField {
  targetField: string;
  note: string;
}

export interface Tool027CrossToolLink {
  targetToolId: string;
  mappedFields: Tool027MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

export const TOOL_027_CROSS_TOOL_LINKS: readonly Tool027CrossToolLink[] = [
  {
    targetToolId: 'tool-016-half-life-calculator',
    mappedFields: [
      {
        targetField: 'source_mass',
        note: 're-enter the mass and molar mass by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same source substance',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildEsterConversionCsv(
  input: MolarMassConversionInput,
  result: MolarMassConversionResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-027-ester-conversion'],
    ['calculated_at', calculatedAt],
    [],
    ['source_substance', input.sourceSubstanceLabel],
    ['source_mass', String(input.sourceMass)],
    ['source_mass_unit', input.sourceMassUnit],
    ['source_molar_mass', String(input.sourceMolarMass)],
    ['source_molar_mass_source', input.sourceMolarMassSource],
    ['target_substance', input.targetSubstanceLabel],
    ['target_molar_mass', String(input.targetMolarMass)],
    ['target_molar_mass_source', input.targetMolarMassSource],
    ['target_mass_unit', input.targetMassUnit],
    [],
    ['source_amount_in_grams', String(result.sourceAmountInGrams)],
    ['amount_in_moles', String(result.amountInMoles)],
    ['target_amount_in_grams', String(result.targetAmountInGrams)],
    ['target_amount', String(result.targetAmount)],
    ['target_mass_unit', result.targetMassUnit],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
