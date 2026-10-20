/**
 * Tool-036 V4 — timezone helper tests (gate C3.3: DST correctness).
 */
import { describe, it, expect } from 'vitest';
import {
  addLocalDays,
  calendarDaysBetween,
  getLocalParts,
  offsetMinutes,
  zonedWallTimeToInstant,
} from './tz';

const RIYADH = 'Asia/Riyadh';
const NEW_YORK = 'America/New_York';

describe('V4 tz — local decomposition', () => {
  it('reads Asia/Riyadh local fields (UTC+3, no DST)', () => {
    const parts = getLocalParts(new Date('2026-01-01T00:00:00Z'), RIYADH);
    expect(parts).toEqual({ y: 2026, m: 1, d: 1, weekdayIndex: 4, minutesOfDay: 180 }); // Thursday 03:00
  });

  it('reports zone offsets per instant (EST vs EDT vs permanent AST)', () => {
    expect(offsetMinutes(new Date('2026-01-15T12:00:00Z'), NEW_YORK)).toBe(-300);
    expect(offsetMinutes(new Date('2026-07-01T12:00:00Z'), NEW_YORK)).toBe(-240);
    expect(offsetMinutes(new Date('2026-07-01T12:00:00Z'), RIYADH)).toBe(180);
  });
});

describe('V4 tz — wall-time resolution across DST (gate C3.3)', () => {
  it('keeps 08:00 local on both sides of the 2026 spring-forward (Mar 8, New York)', () => {
    // 2026-03-08 02:00 EST -> 03:00 EDT: the instant gap between 08:00 shots
    // is 23h, yet the local hour must stay 8.
    const before = zonedWallTimeToInstant(2026, 3, 7, 8, 0, NEW_YORK);
    const after = zonedWallTimeToInstant(2026, 3, 8, 8, 0, NEW_YORK);
    expect(getLocalParts(before, NEW_YORK).minutesOfDay).toBe(8 * 60);
    expect(getLocalParts(after, NEW_YORK).minutesOfDay).toBe(8 * 60);
    expect(after.getTime() - before.getTime()).toBe(23 * 3_600_000);
  });

  it('keeps 08:00 local across the 2026 fall-back (Nov 1, New York)', () => {
    const before = zonedWallTimeToInstant(2026, 10, 31, 8, 0, NEW_YORK);
    const after = zonedWallTimeToInstant(2026, 11, 1, 8, 0, NEW_YORK);
    expect(getLocalParts(before, NEW_YORK).minutesOfDay).toBe(8 * 60);
    expect(getLocalParts(after, NEW_YORK).minutesOfDay).toBe(8 * 60);
    expect(after.getTime() - before.getTime()).toBe(25 * 3_600_000);
  });

  it('round-trips a known wall time in both zones', () => {
    const riyadh = zonedWallTimeToInstant(2026, 6, 15, 8, 0, RIYADH);
    expect(riyadh.toISOString()).toBe('2026-06-15T05:00:00.000Z');
    const ny = zonedWallTimeToInstant(2026, 1, 15, 8, 0, NEW_YORK);
    expect(ny.toISOString()).toBe('2026-01-15T13:00:00.000Z'); // EST = UTC-5
  });
});

describe('V4 tz — calendar arithmetic', () => {
  it('addLocalDays crosses month and year boundaries', () => {
    expect(addLocalDays(2026, 12, 30, 3)).toEqual({ y: 2027, m: 1, d: 2 });
    expect(addLocalDays(2026, 2, 28, 1)).toEqual({ y: 2026, m: 3, d: 1 }); // 2026 not a leap year
  });

  it('calendarDaysBetween ignores DST hour shifts', () => {
    const a = zonedWallTimeToInstant(2026, 3, 1, 8, 0, NEW_YORK);
    const b = zonedWallTimeToInstant(2026, 3, 8, 8, 0, NEW_YORK);
    expect(b.getTime() - a.getTime()).toBe(167 * 3_600_000); // 7d minus the DST hour
    expect(calendarDaysBetween(a, b, NEW_YORK)).toBe(7); // the calendar truth
  });
});
