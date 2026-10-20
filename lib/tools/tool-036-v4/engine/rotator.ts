/**
 * Tool-036 V4 — site rotator (design-v4-ar.md §3).
 *
 * Assigns a site to each planned shot. Two declared strategies:
 *  - 'least-recently-used': pick the preferred site not used for the longest
 *    time (recorded events included), ties broken by declared preference order.
 *  - 'fixed-order': plain round-robin through the declared order — may create
 *    preference gaps, which `rotation-check.ts` then reports honestly rather
 *    than hiding.
 *
 * Decision R3: an assignment produced here is a *scheduling convenience*.
 * Nothing in this module asserts that a site is medically suitable.
 */
import type { InjectionEvent, PlanSpec, SiteId } from '../contracts';

export interface ShotDraft {
  compoundId: string;
  occurredAtMs: number;
}

export interface SiteAssignment {
  siteId: SiteId;
  assignedBy: 'lru' | 'fixed';
}

export function assignSitesToShots(
  drafts: readonly ShotDraft[],
  events: readonly InjectionEvent[],
  plan: PlanSpec,
): SiteAssignment[] {
  const lastUsedMs = new Map<SiteId, number>();
  for (const event of events) {
    const t = Date.parse(event.occurredAt);
    const prev = lastUsedMs.get(event.siteId) ?? Number.NEGATIVE_INFINITY;
    if (t > prev) lastUsedMs.set(event.siteId, t);
  }

  let fixedCursor = 0;
  const order = plan.preferredSites;

  return drafts.map((draft) => {
    if (plan.rotationMode === 'fixed-order') {
      const siteId = order[fixedCursor % order.length];
      fixedCursor += 1;
      lastUsedMs.set(siteId, draft.occurredAtMs);
      return { siteId, assignedBy: 'fixed' as const };
    }

    let best: SiteId = order[0];
    let bestSeen = Number.POSITIVE_INFINITY;
    let bestTieIndex = Number.POSITIVE_INFINITY;
    order.forEach((siteId, index) => {
      const seen = lastUsedMs.get(siteId) ?? Number.NEGATIVE_INFINITY;
      // Strictly-less keeps the earliest preferred site on exact ties.
      if (seen < bestSeen || (seen === bestSeen && index < bestTieIndex)) {
        best = siteId;
        bestSeen = seen;
        bestTieIndex = index;
      }
    });
    lastUsedMs.set(best, draft.occurredAtMs);
    return { siteId: best, assignedBy: 'lru' as const };
  });
}
