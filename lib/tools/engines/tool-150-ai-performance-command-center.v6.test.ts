import { describe, expect, it } from 'vitest';
import {
  assembleManualToolResults,
  inspectManualAggregationDraft,
  ManualAggregationInputSchema,
  type ManualAggregationEntry,
} from './tool-150-ai-performance-command-center.v6';

const entry = (overrides: Partial<ManualAggregationEntry> = {}): ManualAggregationEntry => ({
  id: 'row-1', metric: 'Body weight', value: '80.0', unit: 'kg', source: 'Tool 149', recordedOn: '2026-10-20', status: 'current', ...overrides,
});

describe('Tool 150 manual results organizer', () => {
  it('returns NOT_AVAILABLE for an empty selection', () => {
    expect(assembleManualToolResults({ entries: [] })).toMatchObject({ status: 'NOT_AVAILABLE', entries: [], conflicts: [] });
    expect(inspectManualAggregationDraft({ entries: [] }).status).toBe('NOT_AVAILABLE');
  });

  it('preserves manually selected values, units, source, date and explicit status without calculating a score', () => {
    const result = assembleManualToolResults({ entries: [entry()] });
    expect(result).toMatchObject({ status: 'ASSEMBLED', calculationType: 'MANUAL_AGGREGATION', conflicts: [] });
    if (result.status !== 'ASSEMBLED') throw new Error('Expected assembled records');
    expect(result.entries[0]).toMatchObject({ metric: 'Body weight', value: '80.0', unit: 'kg', source: 'Tool 149', recordedOn: '2026-10-20', status: 'current' });
    expect(result.entries[0].disclosure).toContain('Marked current by the user; not independently verified.');
    expect(result.assumptions).toContain('No overall score, recommendation, or automated tool execution is produced.');
  });

  it('reports missing values and incomplete/unknown records as PARTIAL without filling gaps', () => {
    const incomplete = entry({ id: 'row-incomplete', metric: 'Blood pressure', value: undefined, unit: 'mmHg', source: undefined, status: 'incomplete' });
    expect(inspectManualAggregationDraft({ entries: [incomplete] })).toMatchObject({ status: 'PARTIAL', incompleteEntryIds: ['row-incomplete'] });
    const result = assembleManualToolResults({ entries: [incomplete] });
    expect(result).toMatchObject({ status: 'PARTIAL', entries: [{ value: undefined, source: undefined, missingFields: ['value', 'source'] }] });
  });

  it('discloses old and unknown status as user-reported, without independently inferring freshness', () => {
    const result = assembleManualToolResults({ entries: [entry({ status: 'old' }), entry({ id: 'row-2', status: 'unknown' })] });
    expect(result.status).toBe('PARTIAL');
    if (result.status !== 'PARTIAL') throw new Error('Expected partial records');
    expect(result.entries[0].disclosure[0]).toContain('Marked old by the user');
    expect(result.entries[1].disclosure[0]).toContain('Status is unknown');
  });

  it('flags different values with the same metric and unit as a conflict', () => {
    const result = assembleManualToolResults({ entries: [entry(), entry({ id: 'row-2', value: '82', source: 'Tool 145' })] });
    expect(result).toMatchObject({ status: 'CONFLICTED', conflicts: [{ metric: 'Body weight', entryIds: ['row-1', 'row-2'], kind: 'VALUE_CONFLICT' }] });
  });

  it('flags unit mismatches without converting or numerically comparing them', () => {
    const result = assembleManualToolResults({ entries: [entry(), entry({ id: 'row-2', value: '176', unit: 'lb', source: 'Manual note' })] });
    expect(result).toMatchObject({ status: 'CONFLICTED', conflicts: [{ kind: 'UNIT_MISMATCH' }] });
  });

  it('does not flag numerically equivalent formatting as conflicting', () => {
    const result = assembleManualToolResults({ entries: [entry({ value: '80.0' }), entry({ id: 'row-2', value: '80', source: 'Manual note' })] });
    expect(result.status).toBe('ASSEMBLED');
    expect(result.conflicts).toEqual([]);
  });

  it('rejects duplicate IDs, invalid dates, extra fields and more than twenty records', () => {
    expect(ManualAggregationInputSchema.safeParse({ entries: [entry(), entry()] }).success).toBe(false);
    expect(ManualAggregationInputSchema.safeParse({ entries: [entry({ recordedOn: '2026-02-30' })] }).success).toBe(false);
    expect(ManualAggregationInputSchema.safeParse({ entries: [{ ...entry(), extra: true }] }).success).toBe(false);
    expect(ManualAggregationInputSchema.safeParse({ entries: Array.from({ length: 21 }, (_, index) => entry({ id: `row-${index}` })) }).success).toBe(false);
    expect(assembleManualToolResults({ entries: [{ ...entry(), id: undefined }] }).status).toBe('INVALID_INPUT');
  });

  it('does not treat a calculated-result timestamp as the original measurement date', () => {
    const timestamp = '2026-10-25T12:30:00.000Z';
    const result = assembleManualToolResults({ entries: [entry({ recordedOn: undefined, derivedAt: timestamp, status: 'unknown' })] });
    expect(result.status).toBe('PARTIAL');
    if (result.status !== 'PARTIAL') throw new Error('Expected missing measurement date to remain partial');
    expect(result.entries[0]).toMatchObject({ derivedAt: timestamp, recordedOn: undefined, missingFields: ['recordedOn'] });
    expect(result.entries[0].disclosure.join(' ')).toContain('Missing fields: recordedOn.');
  });
});
