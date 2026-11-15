// lib/tools/r6/tool-039-liver-enzyme-tracker-history.test.ts
//
// RED phase for the Tool 039 local history / rating data layer.
//
// The module under test is PURE: no React, no DOM, no I/O, no clock. The clock
// is always injected, so "stale at read time" and the 365-day TTL are testable
// without pretending the current date is something else.
//
// Owner decision D-08 (Option A): local device-only storage inside Tool 039.
import { describe, expect, it } from 'vitest';
import {
  TOOL_039_COMMENT_MAX_LENGTH,
  TOOL_039_HISTORY_MAX_ENTRIES,
  TOOL_039_HISTORY_RETENTION_DAYS,
  applyRatingToEntry,
  buildHistoryCsv,
  buildHistoryEntry,
  clearRatingFromEntry,
  historyEntryFreshness,
  isValidRating,
  pruneHistoryEntries,
  sanitizeComment,
  validateHistoryEnvelope,
  type Tool039HistoryEntry,
} from './tool-039-liver-enzyme-tracker-history';

const RESULT = {
  overall_status: 'elevated' as const,
  stop_orals: false,
  markers: [
    {
      marker: 'ALT',
      latest_value: 112,
      unit: 'U/L',
      uln_multiple: 2,
      status: 'elevated' as const,
      trend_per_30d: 0,
    },
  ],
  recommendations: ['LFTs mildly elevated on orals'],
};

const INPUT = {
  readings: [{ marker: 'ALT', value: 112, unit: 'U/L', date: '2026-02-01' }],
  oral_steroids: true,
  alcohol_drinks_per_week: 0,
  uses_tudca: false,
};

const NOW = '2026-03-01T00:00:00.000Z';

describe('Tool 039 local history — pure data layer', () => {
  it('stores the engine result as produced, without recomputing any value', () => {
    const entry = buildHistoryEntry({
      id: 'entry-1',
      recordedAt: NOW,
      input: INPUT,
      result: RESULT,
    });

    expect(entry.id).toBe('entry-1');
    expect(entry.overallStatus).toBe('elevated');
    expect(entry.stopOrals).toBe(false);
    expect(entry.markers).toEqual([
      { marker: 'ALT', latestValue: 112, unit: 'U/L', ulnMultiple: 2, status: 'elevated', trendPer30d: 0 },
    ]);
    expect(entry.readings).toEqual(INPUT.readings);
    // The freshness anchor is the blood-draw date, not the moment of saving.
    expect(entry.drawDate).toBe('2026-02-01');
    expect(entry.rating).toBeNull();
    expect(entry.comment).toBeNull();
  });

  it('never stores a value the engine did not produce', () => {
    const entry = buildHistoryEntry({
      id: 'entry-1',
      recordedAt: NOW,
      input: INPUT,
      result: RESULT,
    });
    // Only the engine's own fields exist on the entry.
    expect(Object.keys(entry).sort()).toEqual(
      ['comment', 'drawDate', 'id', 'markers', 'overallStatus', 'rating', 'readings', 'recordedAt', 'schemaVersion', 'stopOrals'].sort(),
    );
  });

  it('computes staleness at READ time, so a freshly saved old result is already stale', () => {
    const entry = buildHistoryEntry({
      id: 'entry-1',
      recordedAt: NOW, // saved today
      input: INPUT,     // but drawn 200 days ago
      result: RESULT,
    });

    const freshness = historyEntryFreshness(entry, NOW);
    expect(freshness.ageDays).toBe(28); // 2026-02-01 -> 2026-03-01
    expect(freshness.stale).toBe(false);

    const later = historyEntryFreshness(entry, '2026-09-01T00:00:00.000Z');
    expect(later.stale).toBe(true);
    expect(later.ageDays).toBeGreaterThan(90);
  });

  it('prunes entries older than the 365 day retention window, measured from the save time', () => {
    const old = buildHistoryEntry({
      id: 'old',
      recordedAt: '2024-01-01T00:00:00.000Z', // saved long ago
      input: { ...INPUT, readings: [{ marker: 'ALT', value: 80, unit: 'U/L', date: '2023-12-01' }] },
      result: RESULT,
    });
    const recent = buildHistoryEntry({
      id: 'recent',
      recordedAt: NOW,
      input: INPUT,
      result: RESULT,
    });

    const pruned = pruneHistoryEntries([old, recent], NOW);
    expect(pruned.map((entry) => entry.id)).toEqual(['recent']);
    expect(TOOL_039_HISTORY_RETENTION_DAYS).toBe(365);
  });

  it('keeps an old draw date that was saved today, and marks it stale instead of dropping it', () => {
    // The two clocks are independent: retention counts from the save time,
    // staleness counts from the blood-draw date.
    const entry = buildHistoryEntry({
      id: 'old-draw',
      recordedAt: NOW,
      input: { ...INPUT, readings: [{ marker: 'ALT', value: 80, unit: 'U/L', date: '2024-01-01' }] },
      result: RESULT,
    });

    const pruned = pruneHistoryEntries([entry], NOW);
    expect(pruned).toHaveLength(1);
    expect(historyEntryFreshness(pruned[0], NOW).stale).toBe(true);
  });

  it('keeps at most the maximum number of entries, newest first', () => {
    const entries: Tool039HistoryEntry[] = Array.from({ length: TOOL_039_HISTORY_MAX_ENTRIES + 5 }, (_, index) =>
      buildHistoryEntry({
        id: `entry-${index}`,
        recordedAt: '2026-03-01T00:00:00.000Z',
        input: { ...INPUT, readings: [{ marker: 'ALT', value: 100 + index, unit: 'U/L', date: `2026-02-${String((index % 28) + 1).padStart(2, '0')}` }] },
        result: RESULT,
      }),
    );

    const pruned = pruneHistoryEntries(entries, NOW);
    expect(pruned.length).toBe(TOOL_039_HISTORY_MAX_ENTRIES);
  });

  it('accepts only a rating from 1 to 5', () => {
    expect(isValidRating(1)).toBe(true);
    expect(isValidRating(5)).toBe(true);
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(3.5)).toBe(false);
    expect(isValidRating('3')).toBe(false);
    expect(isValidRating(null)).toBe(false);
    expect(isValidRating(undefined)).toBe(false);
  });

  it('clamps the comment to the declared maximum length', () => {
    const long = 'x'.repeat(TOOL_039_COMMENT_MAX_LENGTH + 250);
    const sanitized = sanitizeComment(long);
    expect(sanitized.value?.length).toBe(TOOL_039_COMMENT_MAX_LENGTH);
    expect(sanitized.truncated).toBe(true);

    expect(sanitizeComment('  hello  ').value).toBe('hello');
    expect(sanitizeComment('   ').value).toBeNull();
    expect(sanitizeComment(null).value).toBeNull();
  });

  it('binds a rating to exactly one result and leaves the others untouched', () => {
    const first = buildHistoryEntry({ id: 'a', recordedAt: NOW, input: INPUT, result: RESULT });
    const second = buildHistoryEntry({
      id: 'b',
      recordedAt: NOW,
      input: { ...INPUT, readings: [{ marker: 'AST', value: 30, unit: 'U/L', date: '2026-02-02' }] },
      result: RESULT,
    });

    const rated = applyRatingToEntry([first, second], 'a', 4, '  good  ');
    expect(rated[0].rating).toBe(4);
    expect(rated[0].comment).toBe('good');
    expect(rated[1].rating).toBeNull();
    expect(rated[1].comment).toBeNull();
  });

  it('clears a rating and its comment', () => {
    const entry = buildHistoryEntry({ id: 'a', recordedAt: NOW, input: INPUT, result: RESULT });
    const rated = applyRatingToEntry([entry], 'a', 2, 'ok');
    const cleared = clearRatingFromEntry(rated, 'a');
    expect(cleared[0].rating).toBeNull();
    expect(cleared[0].comment).toBeNull();
  });

  it('rejects a rating that is out of range instead of storing it', () => {
    const entry = buildHistoryEntry({ id: 'a', recordedAt: NOW, input: INPUT, result: RESULT });
    expect(applyRatingToEntry([entry], 'a', 9, 'x')[0].rating).toBeNull();
    expect(applyRatingToEntry([entry], 'missing-id', 3, 'x')[0].rating).toBeNull();
  });

  it('exports the stored entries as CSV', () => {
    const entry = buildHistoryEntry({ id: 'a', recordedAt: NOW, input: INPUT, result: RESULT });
    const rated = applyRatingToEntry([entry], 'a', 5, 'excellent');
    const csv = buildHistoryCsv(rated, NOW);

    expect(csv).toContain('draw_date');
    expect(csv).toContain('2026-02-01');
    expect(csv).toContain('112');
    expect(csv).toContain('U/L');
    expect(csv).toContain('2.00');
    expect(csv).toContain('excellent');
  });

  it('fails closed on a malformed envelope', () => {
    expect(validateHistoryEnvelope(null).ok).toBe(false);
    expect(validateHistoryEnvelope({ schemaVersion: 1 }).ok).toBe(false);
    expect(validateHistoryEnvelope({ schemaVersion: 1, consented: true, entries: 'nope' }).ok).toBe(false);
    expect(validateHistoryEnvelope({ schemaVersion: 1, consented: true, entries: [] }).ok).toBe(true);
  });
});
