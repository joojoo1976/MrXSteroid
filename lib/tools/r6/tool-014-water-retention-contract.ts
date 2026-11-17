/**
 * lib/tools/r6/tool-014-water-retention-contract.ts
 */
import type { WaterRetentionResult } from '@/lib/tools/schemas/tool-014-water-retention';

export type { WaterRetentionResult };

export interface Tool014Draft {
  acknowledged: boolean;
}

export type Tool014UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export interface Tool014Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: { field: 'acknowledged'; code: 'required' }[];
  input: WaterRetentionResult | null;
}

export function evaluateWaterRetentionDraft(_draft: Tool014Draft): Tool014Evaluation {
  // No user-entered inputs: the engine has no validated model. READY produces the
  // only honest result (NOT_AVAILABLE) through the frozen pipeline.
  const input: WaterRetentionResult = { status: 'NOT_AVAILABLE', reason: 'NO_VALIDATED_MODEL' };
  return { state: 'READY', issues: [], input };
}

export interface Tool014SourceRef { id: string; titleKey: string; publisher: string; reviewedOn: string; evidenceLevel: 'E1'|'E2'|'E3'; url: string; }
export const TOOL_014_SOURCES: readonly Tool014SourceRef[] = [];

export interface Tool014CrossToolLink { targetToolId: string; mappedFields: { targetField: string; note: string }[]; freshnessRule: string; transfer: 'manual-reentry'; }
export const TOOL_014_CROSS_TOOL_LINKS: readonly Tool014CrossToolLink[] = [];

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildWaterRetentionCsv(result: WaterRetentionResult, calculatedAt: string): string {
  const rows: string[][] = [
    ['tool', 'tool-014-water-retention'],
    ['calculated_at', calculatedAt],
    [],
    ['status', result.status],
    ['reason', result.reason],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
