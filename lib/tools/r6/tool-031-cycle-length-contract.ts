/**
 * lib/tools/r6/tool-031-cycle-length-contract.ts
 */
import {
  CycleLengthInputSchema,
  CycleLengthResultSchema,
  CycleLengthCompoundSchema,
  type CycleLengthInput,
  type CycleLengthResult,
} from '@/lib/tools/schemas/tool-031-cycle-length-optimizer';

export type { CycleLengthInput, CycleLengthResult };

export type Tool031Goal = '' | 'bulk' | 'cut' | 'recomp' | 'strength';
export type Tool031Experience = '' | 'beginner' | 'intermediate' | 'advanced';

export interface Tool031CompoundDraft {
  nameEn: string;
  suppressionFactor: string;
  halfLifeDays: string;
  weeklyDoseMg: string;
}

export interface Tool031Draft {
  goal: Tool031Goal;
  experience: Tool031Experience;
  previousCycles: string;
  compounds: Tool031CompoundDraft[];
}

export type Tool031UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool031FieldId =
  | 'goal'
  | 'experience'
  | 'previousCycles'
  | 'compounds';

export type Tool031IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool031Issue {
  field: Tool031FieldId;
  code: Tool031IssueCode;
}

export interface Tool031Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool031Issue[];
  input: CycleLengthInput | null;
}

export const TOOL_031_LIMITS = {
  previousCyclesMin: 0,
  previousCyclesMax: 30,
  suppressionFactorMin: 0,
  suppressionFactorMax: 5,
  halfLifeDaysMin: 0.5,
  halfLifeDaysMax: 60,
  weeklyDoseMgMin: 1,
  weeklyDoseMgMax: 5000,
  compoundsMin: 1,
  compoundsMax: 8,
  unit: 'week',
} as const;

export const TOOL_031_GOALS = ['bulk', 'cut', 'recomp', 'strength'] as const;
export const TOOL_031_EXPERIENCES = ['beginner', 'intermediate', 'advanced'] as const;

export function formatWeeks(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value)) : '—';
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

export function evaluateCycleLengthDraft(draft: Tool031Draft): Tool031Evaluation {
  const issues: Tool031Issue[] = [];

  // previous_cycles
  const prevCycles = numeric(draft.previousCycles);
  if (draft.previousCycles.trim() !== '' && prevCycles === null) {
    issues.push({ field: 'previousCycles', code: 'invalid_number' });
  } else if (prevCycles !== null && (prevCycles < 0 || prevCycles > 30)) {
    issues.push({ field: 'previousCycles', code: 'out_of_range' });
  }

  // goal
  if (draft.goal !== '' && !TOOL_031_GOALS.includes(draft.goal as any)) {
    issues.push({ field: 'goal', code: 'out_of_range' });
  }

  // experience
  if (draft.experience !== '' && !TOOL_031_EXPERIENCES.includes(draft.experience as any)) {
    issues.push({ field: 'experience', code: 'out_of_range' });
  }

  // compounds
  const validCompounds: CycleLengthInput['compounds'] = [];
  const anyCompoundEntered = draft.compounds.some(
    (c) => c.nameEn.trim() !== '' || c.suppressionFactor.trim() !== '' || c.halfLifeDays.trim() !== '' || c.weeklyDoseMg.trim() !== '',
  );

  for (const c of draft.compounds) {
    const entered = c.nameEn.trim() !== '' || c.suppressionFactor.trim() !== '' || c.halfLifeDays.trim() !== '' || c.weeklyDoseMg.trim() !== '';
    if (!entered) continue;

    const sf = numeric(c.suppressionFactor);
    const hl = numeric(c.halfLifeDays);
    const dose = numeric(c.weeklyDoseMg);

    if (sf === null && c.suppressionFactor.trim() !== '') issues.push({ field: 'compounds', code: 'invalid_number' });
    if (hl === null && c.halfLifeDays.trim() !== '') issues.push({ field: 'compounds', code: 'invalid_number' });
    if (dose === null && c.weeklyDoseMg.trim() !== '') issues.push({ field: 'compounds', code: 'invalid_number' });

    if (sf !== null && (sf < 0 || sf > 5)) issues.push({ field: 'compounds', code: 'out_of_range' });
    if (hl !== null && (hl < 0.5 || hl > 60)) issues.push({ field: 'compounds', code: 'out_of_range' });
    if (dose !== null && (dose < 1 || dose > 5000)) issues.push({ field: 'compounds', code: 'out_of_range' });

    const allValid =
      c.nameEn.trim().length >= 1 && c.nameEn.trim().length <= 80 &&
      sf !== null && sf >= 0 && sf <= 5 &&
      hl !== null && hl >= 0.5 && hl <= 60 &&
      dose !== null && dose >= 1 && dose <= 5000;

    if (allValid) {
      validCompounds.push({
        name_en: c.nameEn.trim(),
        suppression_factor: sf as number,
        half_life_days: hl as number,
        weekly_dose_mg: dose as number,
      });
    }
  }

  const anyEntered =
    draft.goal !== '' ||
    draft.experience !== '' ||
    draft.previousCycles.trim() !== '' ||
    anyCompoundEntered;

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const hasCompounds = validCompounds.length >= 1 && validCompounds.length <= 8;
  const hasGoal = draft.goal !== '';
  const hasExperience = draft.experience !== '';
  const hasPrevCycles = prevCycles !== null && prevCycles >= 0 && prevCycles <= 30;

  if (!hasCompounds || !hasGoal || !hasExperience || !hasPrevCycles) return { state: 'PARTIAL', issues, input: null };

  const candidate: CycleLengthInput = {
    goal: draft.goal as CycleLengthInput['goal'],
    experience: draft.experience as CycleLengthInput['experience'],
    previous_cycles: prevCycles as number,
    compounds: validCompounds,
  };

  const parsed = CycleLengthInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'compounds', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Sources (C4) ─────────────────────────────────────────────────────────── */

export interface Tool031SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

export const TOOL_031_SOURCES: readonly Tool031SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool031MappedField {
  targetField: string;
  note: string;
}

export interface Tool031CrossToolLink {
  targetToolId: string;
  mappedFields: Tool031MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

export const TOOL_031_CROSS_TOOL_LINKS: readonly Tool031CrossToolLink[] = [
  {
    targetToolId: 'tool-016-half-life-calculator',
    mappedFields: [
      {
        targetField: 'half_life_days',
        note: 're-enter the half-life by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same half-life value',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildCycleLengthCsv(
  input: CycleLengthInput,
  result: CycleLengthResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-031-cycle-length-optimizer'],
    ['calculated_at', calculatedAt],
    [],
    ['goal', input.goal],
    ['experience', input.experience],
    ['previous_cycles', String(input.previous_cycles)],
    ['compounds', input.compounds.map((c) => `${c.name_en}:${c.suppression_factor}:${c.half_life_days}:${c.weekly_dose_mg}`).join('|')],
    [],
    ['min_weeks', String(result.min_weeks)],
    ['optimal_weeks', String(result.optimal_weeks)],
    ['max_weeks', String(result.max_weeks)],
    ['suppression_load', String(result.suppression_load)],
    ['ester_bottleneck_days', String(result.ester_bottleneck_days)],
    ['rationale', result.rationale.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
