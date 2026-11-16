/**
 * lib/tools/r6/tool-051-peptide-dosage-contract.ts
 */
import {
  PeptideDoseInputSchema,
  PeptideDoseResultSchema,
  type PeptideDoseInput,
} from '@/lib/tools/schemas/tool-051-peptide-dosage-calculator';

export type PeptideDoseResult = ReturnType<typeof PeptideDoseResultSchema.parse>;

export type Tool051Bool = '' | 'yes' | 'no';

export interface Tool051Draft {
  vialMg: string;
  bacWaterMl: string;
  desiredDoseMg: string;
}

export type Tool051UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool051FieldId = 'vialMg' | 'bacWaterMl' | 'desiredDoseMg';

export type Tool051IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool051Issue {
  field: Tool051FieldId;
  code: Tool051IssueCode;
}

export interface Tool051Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool051Issue[];
  input: PeptideDoseInput | null;
}

export const TOOL_051_LIMITS = {
  vialMgMin: 0.1,
  vialMgMax: 100,
  bacWaterMlMin: 0.1,
  bacWaterMlMax: 10,
  desiredDoseMgMin: 0.01,
  desiredDoseMgMax: 10,
  minDrawUnits: 2,
  unit: 'mg_per_ml',
} as const;

const WARNING_KEYS: Record<string, string> = {
  verify_peptide_identity_and_lab: 'warning_verify',
  dose_below_syringe_resolution: 'warning_below_resolution',
};

export function warningLabelKey(code: string): string {
  return WARNING_KEYS[code] ?? 'warning_unknown';
}

export function mirroredConcentration(input: PeptideDoseInput): number {
  return Math.round((input.vial_mg / input.bac_water_ml) * 1000) / 1000;
}

export function mirroredDoseVolume(input: PeptideDoseInput): number {
  const concentration = input.vial_mg / input.bac_water_ml;
  return Math.round((input.desired_dose_mg / concentration) * 1000) / 1000;
}

export function mirroredDrawUnits(input: PeptideDoseInput): { units: number; clamped: boolean } {
  const concentration = input.vial_mg / input.bac_water_ml;
  const doseVolume = input.desired_dose_mg / concentration;
  const rawUnits = doseVolume * 100;
  const clamped = rawUnits < TOOL_051_LIMITS.minDrawUnits;
  const units = clamped ? TOOL_051_LIMITS.minDrawUnits : Math.round(rawUnits * 10) / 10;
  return { units, clamped };
}

export function mirroredDosesPerVial(input: PeptideDoseInput): number {
  return Math.floor(input.vial_mg / input.desired_dose_mg);
}

export function mirroredWarnings(clamped: boolean): string[] {
  const warnings: string[] = ['verify_peptide_identity_and_lab'];
  if (clamped) warnings.push('dose_below_syringe_resolution');
  return [...new Set(warnings)];
}

export function formatMl(value: number): string {
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

function rangeIssue(
  text: string,
  field: Tool051FieldId,
  min: number,
  max: number,
  issues: Tool051Issue[],
): number | null {
  if (text.trim() === '') return null;
  const value = numeric(text);
  if (value === null) {
    issues.push({ field, code: 'invalid_number' });
    return null;
  }
  if (value < min || value > max) {
    issues.push({ field, code: 'out_of_range' });
    return null;
  }
  return value;
}

export function evaluatePeptideDoseDraft(draft: Tool051Draft): Tool051Evaluation {
  const issues: Tool051Issue[] = [];

  const vialMg = rangeIssue(draft.vialMg, 'vialMg', TOOL_051_LIMITS.vialMgMin, TOOL_051_LIMITS.vialMgMax, issues);
  const bacWaterMl = rangeIssue(draft.bacWaterMl, 'bacWaterMl', TOOL_051_LIMITS.bacWaterMlMin, TOOL_051_LIMITS.bacWaterMlMax, issues);
  const desiredDoseMg = rangeIssue(draft.desiredDoseMg, 'desiredDoseMg', TOOL_051_LIMITS.desiredDoseMgMin, TOOL_051_LIMITS.desiredDoseMgMax, issues);

  const anyEntered =
    draft.vialMg.trim() !== '' ||
    draft.bacWaterMl.trim() !== '' ||
    draft.desiredDoseMg.trim() !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const complete = vialMg !== null && bacWaterMl !== null && desiredDoseMg !== null;
  if (!complete) return { state: 'PARTIAL', issues, input: null };

  const candidate: PeptideDoseInput = {
    vial_mg: vialMg as number,
    bac_water_ml: bacWaterMl as number,
    desired_dose_mg: desiredDoseMg as number,
  };

  const parsed = PeptideDoseInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'vialMg', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

export interface Tool051SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

export const TOOL_051_SOURCES: readonly Tool051SourceRef[] = [];

export interface Tool051MappedField {
  targetField: string;
  note: string;
}

export interface Tool051CrossToolLink {
  targetToolId: string;
  mappedFields: Tool051MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

export const TOOL_051_CROSS_TOOL_LINKS: readonly Tool051CrossToolLink[] = [
  {
    targetToolId: 'tool-046-trt-lifetime',
    mappedFields: [
      {
        targetField: 'protocol_start_date',
        note: 're-enter the protocol start date by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same protocol start date',
    transfer: 'manual-reentry',
  },
];

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildPeptideDoseCsv(
  input: PeptideDoseInput,
  result: PeptideDoseResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-051-peptide-dosage-calculator'],
    ['calculated_at', calculatedAt],
    [],
    ['vial_mg', String(input.vial_mg)],
    ['bac_water_ml', String(input.bac_water_ml)],
    ['desired_dose_mg', String(input.desired_dose_mg)],
    [],
    ['concentration_mg_per_ml', String(result.concentration_mg_per_ml)],
    ['dose_volume_ml', String(result.dose_volume_ml)],
    ['draw_units_u100', String(result.draw_units_u100)],
    ['doses_per_vial', String(result.doses_per_vial)],
    ['clamped', String(result.clamped)],
    ['warnings', result.warnings.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
