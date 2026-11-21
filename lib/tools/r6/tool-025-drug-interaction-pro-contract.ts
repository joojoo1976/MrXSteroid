/**
 * lib/tools/r6/tool-025-drug-interaction-pro-contract.ts
 */
import {
  MedicationSessionInputSchema,
  type MedicationSessionInput,
  type MedicationSessionResult,
  type MedicationSessionEntry,
} from '@/lib/tools/schemas/tool-025-drug-interaction-pro';

export type { MedicationSessionInput, MedicationSessionResult, MedicationSessionEntry };

export type Tool025ItemType = '' | MedicationSessionEntry['itemType'];

export interface Tool025Draft {
  itemName: string;
  itemType: Tool025ItemType;
  doseDescription: string;
  sourceLabel: string;
  notes: string;
}

export interface Tool025SessionState {
  entries: MedicationSessionEntry[];
}

export type Tool025UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool025FieldId = 'itemName' | 'itemType' | 'doseDescription' | 'sourceLabel' | 'notes';

export type Tool025IssueCode = 'invalid_number' | 'out_of_range' | 'required' | 'schema_mismatch';

export interface Tool025Issue {
  field: Tool025FieldId;
  code: Tool025IssueCode;
}

export interface Tool025Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool025Issue[];
  input: MedicationSessionInput | null;
}

export const TOOL_025_ITEM_TYPES = ['prescription', 'over_the_counter', 'supplement', 'hormone_or_compound', 'other'] as const;

export function evaluateDraftEntry(draft: Tool025Draft): { valid: boolean; issues: Tool025Issue[] } {
  const issues: Tool025Issue[] = [];
  if (draft.itemName.trim() !== '' && draft.itemName.trim().length > 120) issues.push({ field: 'itemName', code: 'out_of_range' });
  if (draft.doseDescription.trim().length > 80) issues.push({ field: 'doseDescription', code: 'out_of_range' });
  if (draft.sourceLabel.trim().length > 160) issues.push({ field: 'sourceLabel', code: 'out_of_range' });
  if (draft.notes.trim().length > 240) issues.push({ field: 'notes', code: 'out_of_range' });
  if (draft.itemType !== '' && !TOOL_025_ITEM_TYPES.includes(draft.itemType as typeof TOOL_025_ITEM_TYPES[number])) issues.push({ field: 'itemType', code: 'out_of_range' });

  const anyEntered = draft.itemName.trim() !== '' || draft.itemType !== '' || draft.doseDescription.trim() !== '' || draft.sourceLabel.trim() !== '' || draft.notes.trim() !== '';
  if (!anyEntered) return { valid: false, issues };
  if (issues.length > 0) return { valid: false, issues };
  const hasName = draft.itemName.trim().length >= 1;
  const hasType = draft.itemType !== '';
  if (!hasName || !hasType) return { valid: false, issues };
  return { valid: true, issues };
}

export function evaluateSession(entries: MedicationSessionEntry[], draft: Tool025Draft): Tool025Evaluation {
  const draftEval = evaluateDraftEntry(draft);
  const draftAny = draft.itemName.trim() !== '' || draft.itemType !== '' || draft.doseDescription.trim() !== '' || draft.sourceLabel.trim() !== '' || draft.notes.trim() !== '';

  if (entries.length === 0 && !draftAny) return { state: 'EMPTY', issues: draftEval.issues, input: null };
  if (draftEval.issues.length > 0) return { state: 'INVALID', issues: draftEval.issues, input: null };
  if (entries.length === 0 && draftAny) return { state: 'PARTIAL', issues: [], input: null };

  const candidate: MedicationSessionInput = { entries };
  const parsed = MedicationSessionInputSchema.safeParse(candidate);
  if (!parsed.success) return { state: 'INVALID', issues: [{ field: 'itemName', code: 'schema_mismatch' }], input: null };
  return { state: 'READY', issues: [], input: parsed.data };
}

export const TOOL_025_SOURCES: readonly { id: string; titleKey: string; publisher: string; reviewedOn: string; evidenceLevel: 'E1'|'E2'|'E3'; url: string }[] = [];

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildMedicationSessionCsv(result: MedicationSessionResult, calculatedAt: string): string {
  const rows: string[][] = [
    ['tool', 'tool-025-drug-interaction-pro'],
    ['calculated_at', calculatedAt],
    ['result_origin', result.resultOrigin],
    ['interaction_assessment', result.interactionAssessment],
    ['reason', result.reason],
    [],
    ['id', 'item_name', 'item_type', 'dose_description', 'source_label', 'notes'],
  ];
  for (const e of result.entries) {
    rows.push([e.id, e.itemName, e.itemType, e.doseDescription ?? '', e.sourceLabel ?? '', e.notes ?? '']);
  }
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
