/**
 * Tool-036 V4 — Plan vs Actual drift report (design-v4-ar.md §5, gate C5,
 * decisions D4/R5).
 *
 * Decision R5 (user, written): this module produces NO composite score, NO
 * unified rating, NO 0–100 indicator — only itemised differences, each with
 * a status, the actual value, a signed delta, the rule that produced the
 * classification, and the declared comparison window. A composite figure may
 * only be built after the user has trialled this report and approved a
 * written mathematical definition.
 *
 * Declared comparison rules (ruleId `drift-matching-tolerance`, shown in UI):
 *  - every (scheduled shot, actual) pair inside [−24h, +24h] is a candidate;
 *    candidate pairs are claimed cheapest-|delta|-first, then earlier shot,
 *    then earlier actual, then id — so the result depends only on the set of
 *    pairs, never on the order shots or events are supplied in, and an actual
 *    between two slots is credited to the nearer one;
 *  - |delta| ≤ tolerance (user-declared, default 6 h) → `matched`;
 *    the same, at a different site → `site-changed`;
 *  - actual later than tolerance but within 24 h → `late`;
 *  - an actual earlier than tolerance (but within 24 h) is still `matched`,
 *    with the earliness stated in the reason;
 *  - no actual inside the window → `missed`;
 *  - an actual with no scheduled counterpart → `extra`;
 *  - a scheduled shot whose judging window has NOT closed yet (still inside
 *    the +24h half-window relative to `now`) is not judged at all — calling
 *    a future shot "missed" would be a lie; it stays visible in the proposal.
 *
 * These are bookkeeping rules about adherence, not clinical judgements.
 */
import type {
  DriftItem,
  DriftReport,
  InjectionEvent,
  Prefs,
} from '../contracts';
import type { Proposal, ProposalShot } from './proposal';

export const DRIFT_RULE_ID = 'drift-matching-tolerance';

/** Matching half-window in hours, on both sides of the scheduled time. */
export const MATCHING_WINDOW_HOURS = 24;

function reasonFor(
  status: DriftItem['status'],
  deltaHours: number | undefined,
  tolerance: number,
  actualSite?: string,
): string {
  const h = deltaHours === undefined ? undefined : Math.round(deltaHours * 10) / 10;
  switch (status) {
    case 'matched':
      if (h !== undefined && h < -tolerance) {
        return `actual recorded ${Math.abs(h)}h before schedule (inside the ${MATCHING_WINDOW_HOURS}h matching window)`;
      }
      return `actual within ±${tolerance}h of schedule`;
    case 'site-changed':
      return `actual within ±${tolerance}h of schedule but at a different site (${actualSite ?? 'unknown'})`;
    case 'late':
      return `actual ${h}h after schedule (beyond ±${tolerance}h tolerance, inside ${MATCHING_WINDOW_HOURS}h)`;
    case 'missed':
      return `no actual event inside [−${MATCHING_WINDOW_HOURS}h, +${MATCHING_WINDOW_HOURS}h] of schedule`;
    case 'extra':
      return 'actual event has no scheduled counterpart in this window';
  }
}

export function buildDriftReport(
  proposal: Proposal,
  events: readonly InjectionEvent[],
  prefs: Prefs,
  nowIso: string,
): DriftReport {
  const tolerance = prefs.lateToleranceHours;
  const windowStartMs = Date.parse(proposal.windowStart);
  const windowEndMs = Date.parse(proposal.windowEnd);
  const windowIso = (ms: number) => new Date(ms).toISOString();

  const shots: ProposalShot[] = [...proposal.shots].sort((a, b) =>
    a.occurredAt.localeCompare(b.occurredAt),
  );

  // Actuals that can participate: inside the schedule window extended by the
  // matching half-window on both sides.
  const candidatePool = events
    .filter((e) => {
      const t = Date.parse(e.occurredAt);
      return (
        t >= windowStartMs - MATCHING_WINDOW_HOURS * 3_600_000 &&
        t <= windowEndMs + MATCHING_WINDOW_HOURS * 3_600_000
      );
    })
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

  const nowMs = Date.parse(nowIso);

  // Order-independent assignment. Every (shot, actual) pair inside the matching
  // window is collected first, then claimed from cheapest to dearest. The report
  // is therefore a function of the SET of pairs, never of the order shots or
  // events were supplied in — an actual sitting between two slots goes to the
  // NEARER slot, not to whichever slot the loop happened to reach first.
  interface Pair {
    shot: ProposalShot;
    actual: InjectionEvent;
    deltaHours: number;
    absHours: number;
  }
  const pairs: Pair[] = [];
  for (const shot of shots) {
    const scheduledMs = Date.parse(shot.occurredAt);
    for (const candidate of candidatePool) {
      const deltaHours = (Date.parse(candidate.occurredAt) - scheduledMs) / 3_600_000;
      const absHours = Math.abs(deltaHours);
      if (absHours > MATCHING_WINDOW_HOURS) continue;
      pairs.push({ shot, actual: candidate, deltaHours, absHours });
    }
  }
  pairs.sort(
    (a, b) =>
      a.absHours - b.absHours ||
      Date.parse(a.shot.occurredAt) - Date.parse(b.shot.occurredAt) ||
      Date.parse(a.actual.occurredAt) - Date.parse(b.actual.occurredAt) ||
      a.actual.id.localeCompare(b.actual.id),
  );

  const claimedByShot = new Map<ProposalShot, Pair>();
  const usedActuals = new Set<string>();
  for (const pair of pairs) {
    if (claimedByShot.has(pair.shot) || usedActuals.has(pair.actual.id)) continue;
    claimedByShot.set(pair.shot, pair);
    usedActuals.add(pair.actual.id);
  }

  const items: DriftItem[] = [];

  for (const shot of shots) {
    const scheduledMs = Date.parse(shot.occurredAt);

    // Declared rule: a shot is only judged once its window has closed or an
    // actual already claims it. Future shots are preview material, not facts.
    const windowClosed = scheduledMs + MATCHING_WINDOW_HOURS * 3_600_000 < nowMs;
    const match = claimedByShot.get(shot);

    if (!match) {
      if (!windowClosed) continue; // not yet judgeable — silently skip
      items.push({
        scheduledAt: shot.occurredAt,
        status: 'missed',
        reason: reasonFor('missed', undefined, tolerance),
        ruleId: DRIFT_RULE_ID,
      });
      continue;
    }

    const deltaHours = Math.round(match.deltaHours * 10) / 10;

    let status: DriftItem['status'];
    if (Math.abs(deltaHours) <= tolerance) {
      status = match.actual.siteId === shot.siteId ? 'matched' : 'site-changed';
    } else if (deltaHours > tolerance) {
      status = 'late';
    } else {
      // Early beyond tolerance, but inside the matching window: the injection
      // happened, so it is not "missed" — the reason states the earliness.
      status = 'matched';
    }

    items.push({
      scheduledAt: shot.occurredAt,
      status,
      actual: { occurredAt: match.actual.occurredAt, siteId: match.actual.siteId },
      deltaHours,
      reason: reasonFor(status, deltaHours, tolerance, match.actual.siteId),
      ruleId: DRIFT_RULE_ID,
    });
  }

  // Leftover actuals in the (extended) window are "extra" — recorded facts
  // the plan does not account for.
  for (const candidate of candidatePool) {
    if (usedActuals.has(candidate.id)) continue;
    items.push({
      scheduledAt: proposal.windowStart,
      status: 'extra',
      actual: { occurredAt: candidate.occurredAt, siteId: candidate.siteId },
      reason: reasonFor('extra', undefined, tolerance),
      ruleId: DRIFT_RULE_ID,
    });
  }

  items.sort((a, b) => {
    const at = a.actual?.occurredAt ?? a.scheduledAt;
    const bt = b.actual?.occurredAt ?? b.scheduledAt;
    return at.localeCompare(bt);
  });

  const summary = {
    matched: items.filter((i) => i.status === 'matched').length,
    late: items.filter((i) => i.status === 'late').length,
    missed: items.filter((i) => i.status === 'missed').length,
    extra: items.filter((i) => i.status === 'extra').length,
    siteChanged: items.filter((i) => i.status === 'site-changed').length,
  };

  return {
    windowStart: proposal.windowStart || windowIso(windowStartMs),
    windowEnd: proposal.windowEnd || windowIso(windowEndMs),
    computedAt: nowIso,
    items,
    summary,
  };
}
