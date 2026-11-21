/**
 * lib/tools/r6/tool-026-injection-pain-contract.ts
 */
import {
  InjectionExperienceInputSchema,
  type InjectionExperienceInput,
  type InjectionExperienceResult,
  type InjectionExperienceEntry,
} from '@/lib/tools/schemas/tool-026-injection-pain';

export type { InjectionExperienceInput, InjectionExperienceResult, InjectionExperienceEntry };

export interface Tool026Draft {
  eventDate: string;
  siteLabel: string;
  notes: string;
}

export type Tool026UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool026FieldId = 'eventDate' | 'siteLabel' | 'notes';

export type Tool026IssueCode = 'invalid_number' | 'out_of_range' | 'required' | 'schema_mismatch';

export interface Tool026Issue {
  field: Tool026FieldId;
  code: Tool026IssueCode;
}

export interface Tool026Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool026Issue[];
  input: InjectionExperienceInput | null;
}

function isoDate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text.trim())) return false;
  const d = new Date(`${text.trim()}T12:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === text.trim();
}

export function evaluateDraftEntry(draft: Tool026Draft): { valid: boolean; issues: Tool026Issue[] } {
  const issues: Tool026Issue[] = [];
  if (draft.siteLabel.trim().length > 120) issues.push({ field: 'siteLabel', code: 'out_of_range' });
  if (draft.notes.trim().length > 500) issues.push({ field: 'notes', code: 'out_of_range' });
  if (draft.eventDate.trim() !== '' && !isoDate(draft.eventDate)) issues.push({ field: 'eventDate', code: 'invalid_number' });

  const anyEntered = draft.eventDate.trim() !== '' || draft.siteLabel.trim() !== '' || draft.notes.trim() !== '';
  if (!anyEntered) return { valid: false, issues };
  if (issues.length > 0) return { valid: false, issues };
  if (!isoDate(draft.eventDate) || draft.notes.trim().length < 1) return { valid: false, issues };
  return { valid: true, issues };
}

export function evaluateSession(entries: InjectionExperienceEntry[], draft: Tool026Draft): Tool026Evaluation {
  const draftEval = evaluateDraftEntry(draft);
  const draftAny = draft.eventDate.trim() !== '' || draft.siteLabel.trim() !== '' || draft.notes.trim() !== '';

  if (entries.length === 0 && !draftAny) return { state: 'EMPTY', issues: draftEval.issues, input: null };
  if (draftEval.issues.length > 0) return { state: 'INVALID', issues: draftEval.issues, input: null };
  if (entries.length === 0 && draftAny) return { state: 'PARTIAL', issues: [], input: null };

  const candidate: InjectionExperienceInput = { entries };
  const parsed = InjectionExperienceInputSchema.safeParse(candidate);
  if (!parsed.success) return { state: 'INVALID', issues: [{ field: 'notes', code: 'schema_mismatch' }], input: null };
  return { state: 'READY', issues: [], input: parsed.data };
}

export const TOOL_026_SOURCES: readonly { id: string; titleKey: string; publisher: string; reviewedOn: string; evidenceLevel: 'E1'|'E2'|'E3'; url: string }[] = [];

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildInjectionExperienceCsv(result: InjectionExperienceResult, calculatedAt: string): string {
  const rows: string[][] = [
    ['tool', 'tool-026-injection-pain'],
    ['calculated_at', calculatedAt],
    ['result_origin', result.resultOrigin],
    ['assessment', result.assessment],
    ['reason', result.reason],
    [],
    ['id', 'event_date', 'site_label', 'notes'],
  ];
  for (const e of result.entries) {
    rows.push([e.id, e.eventDate, e.siteLabel ?? '', e.notes]);
  }
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
