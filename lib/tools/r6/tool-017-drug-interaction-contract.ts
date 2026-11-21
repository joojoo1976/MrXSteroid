/**
 * lib/tools/r6/tool-017-drug-interaction-contract.ts
 */
import type { DrugInteractionResult } from '@/lib/tools/schemas/tool-017-drug-interaction';

export type { DrugInteractionResult };

export type Tool017UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export interface Tool017Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: { field: 'result'; code: 'schema_mismatch' }[];
  input: DrugInteractionResult | null;
}

export function evaluateDrugInteractionDraft(): Tool017Evaluation {
  const input: DrugInteractionResult = { status: 'NOT_AVAILABLE', reason: 'NO_VERIFIED_INTERACTION_SOURCE' };
  return { state: 'READY', issues: [], input };
}

export interface Tool017SourceRef { id: string; titleKey: string; publisher: string; reviewedOn: string; evidenceLevel: 'E1'|'E2'|'E3'; url: string; }
export const TOOL_017_SOURCES: readonly Tool017SourceRef[] = [];

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildDrugInteractionCsv(result: DrugInteractionResult, calculatedAt: string): string {
  const rows: string[][] = [
    ['tool', 'tool-017-drug-interaction'],
    ['calculated_at', calculatedAt],
    [],
    ['status', result.status],
    ['reason', result.reason],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
