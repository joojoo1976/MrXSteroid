/**
 * Tool-036 V4 — absolute-time helpers (design-v4-ar.md §3, gate C3.3).
 *
 * Every stored timestamp carries an offset (enforced by contracts.ts), and
 * every *planned* occurrence is resolved from a local wall-time in a named
 * IANA zone — so a schedule compiled before a DST transition still lands at
 * the same local hour after it. No fixed `+ 24h * n` arithmetic is ever used
 * to walk calendar days (that is exactly how V3's day maths drifted).
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export interface LocalParts {
  y: number;
  m: number; // 1..12
  d: number; // 1..31
  /** 0 = Sunday, matching the tool's week layout. */
  weekdayIndex: number;
  minutesOfDay: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/** Decompose an instant into local calendar fields for a named zone. */
export function getLocalParts(instant: Date, timeZone: string): LocalParts {
  const parts = getFormatter(timeZone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): string => {
    const found = parts.find((p) => p.type === type);
    return found ? found.value : '0';
  };
  const weekday = read('weekday') as (typeof WEEKDAYS)[number];
  const weekdayIndex = WEEKDAYS.indexOf(weekday);
  const h = Number(read('hour'));
  const m = Number(read('minute'));
  return {
    y: Number(read('year')),
    m: Number(read('month')),
    d: Number(read('day')),
    weekdayIndex: weekdayIndex >= 0 ? weekdayIndex : 0,
    minutesOfDay: h * 60 + m,
  };
}

/** UTC offset of an instant in a zone, in minutes (positive east). */
export function offsetMinutes(instant: Date, timeZone: string): number {
  const p = getLocalParts(instant, timeZone);
  const wall = Date.UTC(p.y, p.m - 1, p.d, Math.floor(p.minutesOfDay / 60), p.minutesOfDay % 60, 0);
  return Math.round((wall - instant.getTime()) / 60_000);
}

/**
 * Resolve a local wall-time in `timeZone` to the absolute instant it names.
 * Two-pass offset correction: pass 1 guesses the offset from the naive UTC
 * reading; pass 2 re-reads the offset at the corrected instant, which is what
 * makes spring-forward/fall-back days resolve correctly.
 */
export function zonedWallTimeToInstant(
  y: number,
  m: number,
  d: number,
  hh: number,
  mm: number,
  timeZone: string,
): Date {
  const naive = Date.UTC(y, m - 1, d, hh, mm);
  const off1 = offsetMinutes(new Date(naive), timeZone);
  const first = naive - off1 * 60_000;
  const off2 = offsetMinutes(new Date(first), timeZone);
  const candidate = off2 === off1 ? first : naive - off2 * 60_000;
  // Verify: if the candidate's offset disagrees (pathological gaps around a
  // transition), fall back to the pass-1 result rather than drift a whole hour.
  const verified = offsetMinutes(new Date(candidate), timeZone) === off2 ? candidate : first;
  return new Date(verified);
}

/** Calendar-day addition done in pure UTC date space — DST never affects it. */
export function addLocalDays(
  y: number,
  m: number,
  d: number,
  days: number,
): { y: number; m: number; d: number } {
  const t = Date.UTC(y, m - 1, d + days);
  const date = new Date(t);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

/** Whole calendar days from a to b (independent of time-of-day and DST). */
export function calendarDaysBetween(from: Date, to: Date, timeZone: string): number {
  const a = getLocalParts(from, timeZone);
  const b = getLocalParts(to, timeZone);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}
