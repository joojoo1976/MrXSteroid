/**
 * lib/tools/r6/tool-008-side-effect-tracker-contract.ts
 */
import {
  SideEffectLogSchema,
  type SideEffectLog,
} from '@/lib/tools/schemas/tool-008-side-effect-tracker';

export type { SideEffectLog };

export type Tool008Severity = '' | 'mild' | 'moderate' | 'severe';
export type Tool008Category = '' | 'estrogenic' | 'androgenic' | 'cardiovascular' | 'hepatotoxic' | 'psychological' | 'other';

export interface Tool008Draft {
  symptom: string;
  severity: Tool008Severity;
  category: Tool008Category;
  notes: string;
  compoundRelated: string;
  date: string; // YYYY-MM-DD or empty
}

export type Tool008UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool008FieldId = 'symptom' | 'severity' | 'category' | 'notes' | 'compoundRelated' | 'date';

export type Tool008IssueCode = 'invalid_number' | 'out_of_range' | 'required' | 'schema_mismatch';

export interface Tool008Issue {
  field: Tool008FieldId;
  code: Tool008IssueCode;
}

export interface Tool008Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool008Issue[];
  input: SideEffectLog | null;
}

export const TOOL_008_LIMITS = {
  symptomMin: 1,
  symptomMax: 240,
  notesMax: 1000,
  compoundMax: 120,
} as const;

export const TOOL_008_SEVERITIES = ['mild', 'moderate', 'severe'] as const;
export const TOOL_008_CATEGORIES = ['estrogenic', 'androgenic', 'cardiovascular', 'hepatotoxic', 'psychological', 'other'] as const;

function isoDate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text.trim())) return false;
  const d = new Date(`${text.trim()}T12:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === text.trim();
}

export function evaluateSideEffectDraft(draft: Tool008Draft): Tool008Evaluation {
  const issues: Tool008Issue[] = [];

  if (draft.symptom.trim() !== '' && (draft.symptom.trim().length < 1 || draft.symptom.trim().length > 240)) {
    issues.push({ field: 'symptom', code: 'out_of_range' });
  }
  if (draft.notes.trim().length > 1000) {
    issues.push({ field: 'notes', code: 'out_of_range' });
  }
  if (draft.compoundRelated.trim().length > 120) {
    issues.push({ field: 'compoundRelated', code: 'out_of_range' });
  }
  if (draft.severity !== '' && !TOOL_008_SEVERITIES.includes(draft.severity as typeof TOOL_008_SEVERITIES[number])) {
    issues.push({ field: 'severity', code: 'out_of_range' });
  }
  if (draft.category !== '' && !TOOL_008_CATEGORIES.includes(draft.category as typeof TOOL_008_CATEGORIES[number])) {
    issues.push({ field: 'category', code: 'out_of_range' });
  }
  if (draft.date.trim() !== '' && !isoDate(draft.date)) {
    issues.push({ field: 'date', code: 'invalid_number' });
  }

  const anyEntered =
    draft.symptom.trim() !== '' ||
    draft.severity !== '' ||
    draft.category !== '' ||
    draft.notes.trim() !== '' ||
    draft.compoundRelated.trim() !== '' ||
    draft.date.trim() !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const hasSymptom = draft.symptom.trim().length >= 1 && draft.symptom.trim().length <= 240;
  const hasSeverity = draft.severity !== '';
  const hasCategory = draft.category !== '';
  const hasDate = draft.date.trim() !== '' && isoDate(draft.date);

  if (!hasSymptom || !hasSeverity || !hasCategory || !hasDate) {
    return { state: 'PARTIAL', issues, input: null };
  }

  const candidate: SideEffectLog = {
    id: '00000000-0000-4000-8000-000000000000',
    date: `${draft.date.trim()}T12:00:00.000Z`,
    symptom: draft.symptom.trim(),
    severity: draft.severity as SideEffectLog['severity'],
    category: draft.category as SideEffectLog['category'],
    ...(draft.notes.trim() !== '' ? { notes: draft.notes.trim() } : {}),
    ...(draft.compoundRelated.trim() !== '' ? { compound_related: draft.compoundRelated.trim() } : {}),
  };

  const parsed = SideEffectLogSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'symptom', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Sources (C4) ─────────────────────────────────────────────────────────── */

export interface Tool008SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

export const TOOL_008_SOURCES: readonly Tool008SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool008MappedField {
  targetField: string;
  note: string;
}

export interface Tool008CrossToolLink {
  targetToolId: string;
  mappedFields: Tool008MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

export const TOOL_008_CROSS_TOOL_LINKS: readonly Tool008CrossToolLink[] = [];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildSideEffectCsv(
  input: SideEffectLog,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-008-side-effect-tracker'],
    ['calculated_at', calculatedAt],
    [],
    ['date', input.date],
    ['symptom', input.symptom],
    ['severity', input.severity],
    ['category', input.category],
    ['notes', input.notes ?? ''],
    ['compound_related', input.compound_related ?? ''],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
