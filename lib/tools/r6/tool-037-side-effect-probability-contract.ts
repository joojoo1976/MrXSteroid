/**
 * lib/tools/r6/tool-037-side-effect-probability-contract.ts
 */
import {
  SideEffectRiskInputSchema,
  type SideEffectRiskInput,
  type SideEffectRiskResult,
} from '@/lib/tools/schemas/tool-037-side-effect-probability';

export type { SideEffectRiskInput, SideEffectRiskResult };

export type Tool037Family = '' | 'testosterone' | 'nandrolone' | 'trenbolone' | 'dht' | 'oral' | 'other';

export interface Tool037CompoundDraft {
  nameEn: string;
  family: Tool037Family;
  weeklyDoseMg: string;
  referenceDoseMg: string;
}

export interface Tool037Draft {
  age: string;
  bodyFatPct: string;
  cycleWeeks: string;
  usesAi: boolean;
  usesLiverSupport: boolean;
  compounds: Tool037CompoundDraft[];
}

export type Tool037UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';
export type Tool037FieldId = 'age' | 'bodyFatPct' | 'cycleWeeks' | 'usesAi' | 'usesLiverSupport' | 'compounds';
export type Tool037IssueCode = 'invalid_number' | 'out_of_range' | 'required' | 'schema_mismatch';
export interface Tool037Issue { field: Tool037FieldId; code: Tool037IssueCode; }
export interface Tool037Evaluation { state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY'; issues: Tool037Issue[]; input: SideEffectRiskInput | null; }

export const TOOL_037_FAMILIES = ['testosterone', 'nandrolone', 'trenbolone', 'dht', 'oral', 'other'] as const;

function num(text: string): number | null { const t = text.trim(); if (t === '') return null; const v = Number(t); return Number.isFinite(v) ? v : null; }

export function evaluateSideEffectProbabilityDraft(draft: Tool037Draft): Tool037Evaluation {
  const issues: Tool037Issue[] = [];
  const age = num(draft.age);
  const bf = num(draft.bodyFatPct);
  const cw = num(draft.cycleWeeks);

  if (draft.age.trim() !== '' && age === null) issues.push({ field: 'age', code: 'invalid_number' });
  else if (age !== null && (!Number.isInteger(age) || age < 18 || age > 90)) issues.push({ field: 'age', code: 'out_of_range' });
  if (draft.bodyFatPct.trim() !== '' && bf === null) issues.push({ field: 'bodyFatPct', code: 'invalid_number' });
  else if (bf !== null && (bf < 5 || bf > 60)) issues.push({ field: 'bodyFatPct', code: 'out_of_range' });
  if (draft.cycleWeeks.trim() !== '' && cw === null) issues.push({ field: 'cycleWeeks', code: 'invalid_number' });
  else if (cw !== null && (!Number.isInteger(cw) || cw < 1 || cw > 52)) issues.push({ field: 'cycleWeeks', code: 'out_of_range' });

  const validCompounds: SideEffectRiskInput['compounds'] = [];
  const anyCompoundEntered = draft.compounds.some(c => c.nameEn.trim() !== '' || c.family !== '' || c.weeklyDoseMg.trim() !== '' || c.referenceDoseMg.trim() !== '');
  for (const c of draft.compounds) {
    const entered = c.nameEn.trim() !== '' || c.family !== '' || c.weeklyDoseMg.trim() !== '' || c.referenceDoseMg.trim() !== '';
    if (!entered) continue;
    const wd = num(c.weeklyDoseMg); const rd = num(c.referenceDoseMg);
    if (c.weeklyDoseMg.trim() !== '' && wd === null) issues.push({ field: 'compounds', code: 'invalid_number' });
    if (c.referenceDoseMg.trim() !== '' && rd === null) issues.push({ field: 'compounds', code: 'invalid_number' });
    if (wd !== null && (wd < 1 || wd > 5000)) issues.push({ field: 'compounds', code: 'out_of_range' });
    if (rd !== null && (rd < 1 || rd > 5000)) issues.push({ field: 'compounds', code: 'out_of_range' });
    if (c.family !== '' && !TOOL_037_FAMILIES.includes(c.family as typeof TOOL_037_FAMILIES[number])) issues.push({ field: 'compounds', code: 'out_of_range' });
    const ok = c.nameEn.trim().length >= 1 && c.nameEn.trim().length <= 80 && c.family !== '' && wd !== null && wd >= 1 && wd <= 5000 && rd !== null && rd >= 1 && rd <= 5000;
    if (ok) validCompounds.push({ name_en: c.nameEn.trim(), family: c.family as SideEffectRiskInput['compounds'][number]['family'], weekly_dose_mg: wd as number, reference_dose_mg: rd as number });
  }

  const anyEntered = draft.age.trim() !== '' || draft.bodyFatPct.trim() !== '' || draft.cycleWeeks.trim() !== '' || anyCompoundEntered;
  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const complete = age !== null && Number.isInteger(age) && age >= 18 && age <= 90 && bf !== null && bf >= 5 && bf <= 60 && cw !== null && Number.isInteger(cw) && cw >= 1 && cw <= 52 && validCompounds.length >= 1;
  if (!complete) return { state: 'PARTIAL', issues, input: null };

  const candidate: SideEffectRiskInput = { compounds: validCompounds, age: age as number, body_fat_pct: bf as number, cycle_weeks: cw as number, uses_ai: draft.usesAi, uses_liver_support: draft.usesLiverSupport };
  const parsed = SideEffectRiskInputSchema.safeParse(candidate);
  if (!parsed.success) return { state: 'INVALID', issues: [{ field: 'compounds', code: 'schema_mismatch' }], input: null };
  return { state: 'READY', issues, input: parsed.data };
}

export const TOOL_037_SOURCES: readonly { id: string; titleKey: string; publisher: string; reviewedOn: string; evidenceLevel: 'E1'|'E2'|'E3'; url: string }[] = [];

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildSideEffectProbabilityCsv(input: SideEffectRiskInput, result: SideEffectRiskResult, calculatedAt: string): string {
  const rows: string[][] = [
    ['tool', 'tool-037-side-effect-probability'],
    ['calculated_at', calculatedAt],
    ['age', String(input.age)], ['body_fat_pct', String(input.body_fat_pct)], ['cycle_weeks', String(input.cycle_weeks)],
    ['uses_ai', String(input.uses_ai)], ['uses_liver_support', String(input.uses_liver_support)],
    ['overall_burden_pct', String(result.overall_burden_pct)],
    [],
    ['effect', 'probability_pct', 'level'],
  ];
  for (const r of result.risks) rows.push([r.effect, String(r.probability_pct), r.level]);
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
