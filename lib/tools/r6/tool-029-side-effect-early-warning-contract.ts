/**
 * lib/tools/r6/tool-029-side-effect-early-warning-contract.ts
 */
import {
  MeasurementSummaryInputSchema,
  type MeasurementSummaryInput,
  type MeasurementSummaryResult,
  type MeasurementReading,
} from '@/lib/tools/schemas/tool-029-side-effect-early-warning';

export type { MeasurementSummaryInput, MeasurementSummaryResult, MeasurementReading };

export interface Tool029Draft {
  date: string;
  metric: 'blood_pressure' | 'pulse';
  systolicMmHg: string;
  diastolicMmHg: string;
  beatsPerMinute: string;
  sourceLabel: string;
}

export type Tool029UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool029FieldId = 'date' | 'metric' | 'systolicMmHg' | 'diastolicMmHg' | 'beatsPerMinute' | 'sourceLabel';

export type Tool029IssueCode = 'invalid_number' | 'out_of_range' | 'required' | 'schema_mismatch';

export interface Tool029Issue { field: Tool029FieldId; code: Tool029IssueCode; }

export interface Tool029Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool029Issue[];
  input: MeasurementSummaryInput | null;
}

function isoDate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text.trim())) return false;
  const d = new Date(`${text.trim()}T12:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === text.trim();
}

function num(text: string): number | null {
  const t = text.trim(); if (t === '') return null; const v = Number(t); return Number.isFinite(v) ? v : null;
}

export function evaluateDraftReading(draft: Tool029Draft): { valid: boolean; issues: Tool029Issue[] } {
  const issues: Tool029Issue[] = [];
  if (draft.date.trim() !== '' && !isoDate(draft.date)) issues.push({ field: 'date', code: 'invalid_number' });
  if (draft.sourceLabel.trim().length > 160) issues.push({ field: 'sourceLabel', code: 'out_of_range' });

  if (draft.metric === 'blood_pressure') {
    const s = num(draft.systolicMmHg); const d = num(draft.diastolicMmHg);
    if (draft.systolicMmHg.trim() !== '' && s === null) issues.push({ field: 'systolicMmHg', code: 'invalid_number' });
    if (draft.diastolicMmHg.trim() !== '' && d === null) issues.push({ field: 'diastolicMmHg', code: 'invalid_number' });
    if (s !== null && (s <= 0 || s > 1000)) issues.push({ field: 'systolicMmHg', code: 'out_of_range' });
    if (d !== null && (d <= 0 || d > 1000)) issues.push({ field: 'diastolicMmHg', code: 'out_of_range' });
  } else {
    const p = num(draft.beatsPerMinute);
    if (draft.beatsPerMinute.trim() !== '' && p === null) issues.push({ field: 'beatsPerMinute', code: 'invalid_number' });
    if (p !== null && (p <= 0 || p > 1000)) issues.push({ field: 'beatsPerMinute', code: 'out_of_range' });
  }

  const anyEntered = draft.date.trim() !== '' || draft.systolicMmHg.trim() !== '' || draft.diastolicMmHg.trim() !== '' || draft.beatsPerMinute.trim() !== '' || draft.sourceLabel.trim() !== '';
  if (!anyEntered) return { valid: false, issues };
  if (issues.length > 0) return { valid: false, issues };

  if (!isoDate(draft.date)) return { valid: false, issues };
  if (draft.metric === 'blood_pressure') {
    const s = num(draft.systolicMmHg); const d = num(draft.diastolicMmHg);
    if (s === null || d === null || s <= 0 || s > 1000 || d <= 0 || d > 1000) return { valid: false, issues };
  } else {
    const p = num(draft.beatsPerMinute);
    if (p === null || p <= 0 || p > 1000) return { valid: false, issues };
  }
  return { valid: true, issues };
}

export function buildReadingFromDraft(draft: Tool029Draft): MeasurementReading | null {
  const ev = evaluateDraftReading(draft);
  if (!ev.valid) return null;
  if (draft.metric === 'blood_pressure') {
    return {
      id: crypto.randomUUID(),
      date: draft.date.trim(),
      metric: 'blood_pressure',
      systolicMmHg: Number(draft.systolicMmHg),
      diastolicMmHg: Number(draft.diastolicMmHg),
      ...(draft.sourceLabel.trim() ? { sourceLabel: draft.sourceLabel.trim() } : {}),
    };
  }
  return {
    id: crypto.randomUUID(),
    date: draft.date.trim(),
    metric: 'pulse',
    beatsPerMinute: Number(draft.beatsPerMinute),
    ...(draft.sourceLabel.trim() ? { sourceLabel: draft.sourceLabel.trim() } : {}),
  };
}

export function evaluateSession(readings: MeasurementReading[], draft: Tool029Draft): Tool029Evaluation {
  const draftEval = evaluateDraftReading(draft);
  const draftAny = draft.date.trim() !== '' || draft.systolicMmHg.trim() !== '' || draft.diastolicMmHg.trim() !== '' || draft.beatsPerMinute.trim() !== '' || draft.sourceLabel.trim() !== '';

  if (readings.length === 0 && !draftAny) return { state: 'EMPTY', issues: draftEval.issues, input: null };
  if (draftEval.issues.length > 0) return { state: 'INVALID', issues: draftEval.issues, input: null };
  if (readings.length === 0 && draftAny) return { state: 'PARTIAL', issues: [], input: null };

  const candidate: MeasurementSummaryInput = { readings };
  const parsed = MeasurementSummaryInputSchema.safeParse(candidate);
  if (!parsed.success) return { state: 'INVALID', issues: [{ field: 'date', code: 'schema_mismatch' }], input: null };
  return { state: 'READY', issues: [], input: parsed.data };
}

export const TOOL_029_SOURCES: readonly { id: string; titleKey: string; publisher: string; reviewedOn: string; evidenceLevel: 'E1'|'E2'|'E3'; url: string }[] = [];

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildMeasurementSummaryCsv(result: MeasurementSummaryResult, calculatedAt: string): string {
  const rows: string[][] = [
    ['tool', 'tool-029-side-effect-early-warning'],
    ['calculated_at', calculatedAt],
    ['result_origin', result.resultOrigin],
    ['method', result.method],
    ['clinical_assessment', result.clinicalAssessment],
    [],
    ['metric', 'count', 'minimum', 'maximum', 'arithmetic_mean', 'unit'],
  ];
  for (const s of result.summaries) {
    rows.push([s.metric, String(s.count), String(s.minimum), String(s.maximum), String(s.arithmeticMean), s.unit]);
  }
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
