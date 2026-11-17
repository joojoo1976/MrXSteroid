/**
 * lib/tools/r6/tool-038-stack-compatibility-contract.ts
 */
import {
  StackCompatibilityInputSchema,
  type StackCompatibilityInput,
  type StackCompatibilityResult,
} from '@/lib/tools/schemas/tool-038-stack-compatibility';

export type { StackCompatibilityInput, StackCompatibilityResult };

export type Tool038Family = '' | 'testosterone' | 'nandrolone' | 'trenbolone' | 'dht' | 'oral' | 'ai' | 'serm' | 'support';

export interface Tool038ItemDraft {
  nameEn: string;
  family: Tool038Family;
  weeklyDoseMg: string;
  hepatotoxic: boolean;
}

export interface Tool038Draft {
  items: Tool038ItemDraft[];
}

export type Tool038UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';
export type Tool038FieldId = 'items';
export type Tool038IssueCode = 'invalid_number' | 'out_of_range' | 'required' | 'schema_mismatch';
export interface Tool038Issue { field: Tool038FieldId; code: Tool038IssueCode; }
export interface Tool038Evaluation { state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY'; issues: Tool038Issue[]; input: StackCompatibilityInput | null; }

export const TOOL_038_FAMILIES = ['testosterone', 'nandrolone', 'trenbolone', 'dht', 'oral', 'ai', 'serm', 'support'] as const;

function num(text: string): number | null { const t = text.trim(); if (t === '') return null; const v = Number(t); return Number.isFinite(v) ? v : null; }

export function evaluateStackCompatibilityDraft(draft: Tool038Draft): Tool038Evaluation {
  const issues: Tool038Issue[] = [];
  const validItems: StackCompatibilityInput['items'] = [];
  const anyItemEntered = draft.items.some(it => it.nameEn.trim() !== '' || it.family !== '' || it.weeklyDoseMg.trim() !== '');

  for (const it of draft.items) {
    const entered = it.nameEn.trim() !== '' || it.family !== '' || it.weeklyDoseMg.trim() !== '';
    if (!entered) continue;
    const wd = num(it.weeklyDoseMg);
    if (it.weeklyDoseMg.trim() !== '' && wd === null) issues.push({ field: 'items', code: 'invalid_number' });
    if (wd !== null && (wd < 0 || wd > 5000)) issues.push({ field: 'items', code: 'out_of_range' });
    if (it.family !== '' && !TOOL_038_FAMILIES.includes(it.family as typeof TOOL_038_FAMILIES[number])) issues.push({ field: 'items', code: 'out_of_range' });

    const ok = it.nameEn.trim().length >= 1 && it.nameEn.trim().length <= 80 && it.family !== '' && wd !== null && wd >= 0 && wd <= 5000;
    if (ok) validItems.push({ name_en: it.nameEn.trim(), family: it.family as StackCompatibilityInput['items'][number]['family'], weekly_dose_mg: wd as number, hepatotoxic: it.hepatotoxic });
  }

  if (!anyItemEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };
  if (validItems.length < 1) return { state: 'PARTIAL', issues, input: null };

  const candidate: StackCompatibilityInput = { items: validItems };
  const parsed = StackCompatibilityInputSchema.safeParse(candidate);
  if (!parsed.success) return { state: 'INVALID', issues: [{ field: 'items', code: 'schema_mismatch' }], input: null };
  return { state: 'READY', issues, input: parsed.data };
}

export const TOOL_038_SOURCES: readonly { id: string; titleKey: string; publisher: string; reviewedOn: string; evidenceLevel: 'E1'|'E2'|'E3'; url: string }[] = [];

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildStackCompatibilityCsv(input: StackCompatibilityInput, result: StackCompatibilityResult, calculatedAt: string): string {
  const rows: string[][] = [
    ['tool', 'tool-038-stack-compatibility'],
    ['calculated_at', calculatedAt],
    ['score_0_100', String(result.score_0_100)],
    ['verdict', result.verdict],
    ['androgen_burden_mg_per_week', String(result.androgen_burden_mg_per_week)],
    [],
    ['name_en', 'family', 'weekly_dose_mg', 'hepatotoxic'],
  ];
  for (const it of input.items) rows.push([it.name_en, it.family, String(it.weekly_dose_mg), String(it.hepatotoxic)]);
  rows.push([]);
  rows.push(['flag_code', 'severity', 'message']);
  for (const f of result.flags) rows.push([f.code, f.severity, f.message]);
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
