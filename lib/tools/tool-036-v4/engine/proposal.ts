/**
 * Tool-036 V4 — proposal engine (design-v4-ar.md §3, gates C3.1/C3.2/C3.3).
 *
 * `compileProposal` turns a PlanSpec into an absolute-time schedule:
 *  - each shot's instant is resolved from a LOCAL wall-time (08:00) in the
 *    user's IANA zone, so DST transitions never move a shot off its local
 *    hour and never create or delete a day;
 *  - shot ids are derived from their content — compiling the same plan twice
 *    yields byte-identical output (determinism gate);
 *  - sites come from the rotator (a scheduling decision, never a medical one);
 *  - volumes/doses come from declared plan numbers only. Nothing in this
 *    module reads a "healing" or "readiness" signal — decision R2.
 *
 * The weekly dose maths is exact: per-shot dose = weeklyDose / injections,
 * volume = per-shot dose / concentration.
 */
import type { InjectionEvent, PlanSpec, SiteId } from '../contracts';
import { assignSitesToShots, type ShotDraft } from './rotator';
import { addLocalDays, getLocalParts, zonedWallTimeToInstant } from './tz';

/** Local hour at which planned shots occur (08:00, declared and shown in UI). */
export const LOCAL_SHOT_HOUR = 8;

/** Sunday-anchored shot days by injections-per-week (index 0 = Sunday). */
export const SHOT_DAYS_BY_COUNT: Record<number, readonly number[]> = {
  1: [0],
  2: [0, 4],
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
};

export interface ProposalShot {
  id: string;
  /** ISO-8601 with explicit offset (UTC 'Z' after resolution). */
  occurredAt: string;
  siteId: SiteId;
  assignedBy: 'lru' | 'fixed';
  volumeMl: number;
  doseMg: number;
  compoundId: string;
  weekIndex: number;
  /** Day index within the week (0 = Sunday). */
  dayIndex: number;
}

export interface Proposal {
  shots: ProposalShot[];
  windowStart: string;
  windowEnd: string;
  tz: string;
}

export interface CompileOptions {
  /** Any instant inside the first week of the window. */
  fromIso: string;
  weeks: number;
  tz: string;
  /** Recorded history — feeds the rotator's least-recently-used choice. */
  events: readonly InjectionEvent[];
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

export function compileProposal(plan: PlanSpec, opts: CompileOptions): Proposal {
  const from = new Date(opts.fromIso);
  const fromParts = getLocalParts(from, opts.tz);
  // Week window starts on the Sunday containing `from` (tool weeks are
  // Sunday-first, matching the calendar layout and SHOT_DAYS_BY_COUNT).
  const firstSunday = addLocalDays(fromParts.y, fromParts.m, fromParts.d, -fromParts.weekdayIndex);

  interface Draft extends ShotDraft {
    weekIndex: number;
    dayIndex: number;
    compoundIndex: number;
  }
  const drafts: Draft[] = [];

  for (let weekIndex = 0; weekIndex < opts.weeks; weekIndex += 1) {
    plan.compounds.forEach((compound, compoundIndex) => {
      const days = SHOT_DAYS_BY_COUNT[compound.injectionsPerWeek] ?? SHOT_DAYS_BY_COUNT[1];
      for (const dayIndex of days) {
        const date = addLocalDays(firstSunday.y, firstSunday.m, firstSunday.d, weekIndex * 7 + dayIndex);
        const instant = zonedWallTimeToInstant(
          date.y,
          date.m,
          date.d,
          LOCAL_SHOT_HOUR,
          0,
          opts.tz,
        );
        drafts.push({
          compoundId: compound.compoundId,
          occurredAtMs: instant.getTime(),
          weekIndex,
          dayIndex,
          compoundIndex,
        });
      }
    });
  }

  drafts.sort((a, b) => a.occurredAtMs - b.occurredAtMs || a.compoundIndex - b.compoundIndex);

  const assignments = assignSitesToShots(drafts, opts.events, plan);

  const shots: ProposalShot[] = drafts.map((draft, index) => {
    const compound = plan.compounds[draft.compoundIndex];
    const doseMg = round4(compound.weeklyDoseMg / compound.injectionsPerWeek);
    const volumeMl = round4(doseMg / compound.concentrationMgMl);
    const occurredAt = new Date(draft.occurredAtMs).toISOString();
    return {
      // Content-derived id: stable across recompiles, unique per compound+slot.
      id: `c${draft.compoundIndex}-${draft.compoundId}-${occurredAt}`,
      occurredAt,
      siteId: assignments[index].siteId,
      assignedBy: assignments[index].assignedBy,
      volumeMl,
      doseMg,
      compoundId: compound.compoundId,
      weekIndex: draft.weekIndex,
      dayIndex: draft.dayIndex,
    };
  });

  if (shots.length === 0) {
    const empty = from.toISOString();
    return { shots: [], windowStart: empty, windowEnd: empty, tz: opts.tz };
  }

  return {
    shots,
    windowStart: shots[0].occurredAt,
    windowEnd: shots[shots.length - 1].occurredAt,
    tz: opts.tz,
  };
}
