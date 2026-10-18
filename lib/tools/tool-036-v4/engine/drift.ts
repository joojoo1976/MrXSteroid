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
 *    candidate pairs form a bipartite graph, and the assignment MAXIMISES the
 *    number of matched pairs first, then MINIMISES the total |delta| across
 *    those pairs (a maximum-cardinality, minimum-cost matching). Ties are
 *    broken by a fixed rule — earlier shot, then earlier actual, then id — so
 *    the result depends only on the set of pairs, never on the order shots or
 *    events are supplied in, and an actual between two slots is credited to
 *    the nearer one. Greedy "nearest-first" is NOT used: it can strand a
 *    match by consuming an actual a different slot needed;
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

/**
 * Maximum-cardinality, minimum-total-cost bipartite matching, computed with
 * successive shortest augmenting paths on the residual graph.
 *
 * Cardinality is maximised first for a structural reason: each augmentation
 * adds exactly one matched pair, and the loop stops only when no augmenting
 * path is left — which, by max-flow/min-cut, means the matching is maximum.
 * Among maximum matchings, Bellman–Ford on the residual graph (which follows
 * reverse edges of negative cost) keeps the total cost minimal. Costs are
 * integer milliseconds, so there is no floating-point tie ambiguity.
 *
 * Determinism: shots are supplied already sorted, nodes are iterated 0..N-1
 * and edges in insertion order, and relaxation uses a strict `<` — so an
 * equal-cost path is won by the first one found (the earlier shot). The result
 * is therefore a pure function of the (shot, actual) pair set.
 */
function optimalPairs(
  shotCount: number,
  actualCount: number,
  costAt: (shot: number, actual: number) => number | null,
): Array<{ shot: number; actual: number }> {
  const SOURCE = 0;
  const shotNode = (i: number) => 1 + i;
  const actualNode = (j: number) => 1 + shotCount + j;
  const SINK = 1 + shotCount + actualCount;
  const nodeCount = SINK + 1;

  // Flat edge arrays; `e ^ 1` is always the reverse of edge `e`.
  const to: number[] = [];
  const cap: number[] = [];
  const cost: number[] = [];
  const adj: number[][] = Array.from({ length: nodeCount }, () => []);
  const addEdge = (u: number, v: number, c: number, w: number) => {
    adj[u].push(to.length);
    to.push(v);
    cap.push(c);
    cost.push(w);
    adj[v].push(to.length);
    to.push(u);
    cap.push(0);
    cost.push(-w);
  };

  for (let i = 0; i < shotCount; i++) addEdge(SOURCE, shotNode(i), 1, 0);
  for (let j = 0; j < actualCount; j++) addEdge(actualNode(j), SINK, 1, 0);

  const pairEdge = new Map<string, number>();
  for (let i = 0; i < shotCount; i++) {
    for (let j = 0; j < actualCount; j++) {
      const c = costAt(i, j);
      if (c === null) continue;
      pairEdge.set(`${i}:${j}`, to.length);
      addEdge(shotNode(i), actualNode(j), 1, c);
    }
  }

  for (;;) {
    const dist = new Array<number>(nodeCount).fill(Infinity);
    const prevEdge = new Array<number>(nodeCount).fill(-1);
    dist[SOURCE] = 0;
    let changed = true;
    for (let iter = 0; iter < nodeCount - 1 && changed; iter++) {
      changed = false;
      for (let u = 0; u < nodeCount; u++) {
        if (dist[u] === Infinity) continue;
        for (const e of adj[u]) {
          if (cap[e] <= 0) continue;
          const next = dist[u] + cost[e];
          if (next < dist[to[e]]) {
            dist[to[e]] = next;
            prevEdge[to[e]] = e;
            changed = true;
          }
        }
      }
    }
    if (dist[SINK] === Infinity) break;
    // Every source/sink edge has capacity 1, so the bottleneck is always 1.
    for (let v = SINK; v !== SOURCE; v = to[prevEdge[v] ^ 1]) {
      cap[prevEdge[v]] -= 1;
      cap[prevEdge[v] ^ 1] += 1;
    }
  }

  const matched: Array<{ shot: number; actual: number }> = [];
  for (const [key, e] of pairEdge) {
    if (cap[e] === 0) {
      const [shot, actual] = key.split(':').map(Number);
      matched.push({ shot, actual });
    }
  }
  return matched;
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

  const shots: ProposalShot[] = [...proposal.shots].sort(
    (a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id),
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
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id));

  const nowMs = Date.parse(nowIso);

  // Order-independent assignment: shot/actual indices line up with the two
  // sorted arrays above, so the matching is a pure function of the pair set.
  const windowMs = MATCHING_WINDOW_HOURS * 3_600_000;
  const pairCost = (shotIndex: number, actualIndex: number): number | null => {
    const deltaMs = Math.abs(
      Date.parse(candidatePool[actualIndex].occurredAt) - Date.parse(shots[shotIndex].occurredAt),
    );
    return deltaMs <= windowMs ? deltaMs : null;
  };
  const matched = optimalPairs(shots.length, candidatePool.length, pairCost);
  const matchByShot = new Map<number, InjectionEvent>();
  const usedActuals = new Set<string>();
  for (const { shot: shotIndex, actual: actualIndex } of matched) {
    matchByShot.set(shotIndex, candidatePool[actualIndex]);
    usedActuals.add(candidatePool[actualIndex].id);
  }

  const items: DriftItem[] = [];

  for (let shotIndex = 0; shotIndex < shots.length; shotIndex++) {
    const shot = shots[shotIndex];
    const scheduledMs = Date.parse(shot.occurredAt);

    // Declared rule: a shot is only judged once its window has closed or an
    // actual already claims it. Future shots are preview material, not facts.
    const windowClosed = scheduledMs + MATCHING_WINDOW_HOURS * 3_600_000 < nowMs;
    const match = matchByShot.get(shotIndex);

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

    const deltaHours =
      Math.round(((Date.parse(match.occurredAt) - scheduledMs) / 3_600_000) * 10) / 10;

    let status: DriftItem['status'];
    if (Math.abs(deltaHours) <= tolerance) {
      status = match.siteId === shot.siteId ? 'matched' : 'site-changed';
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
      actual: { occurredAt: match.occurredAt, siteId: match.siteId },
      deltaHours,
      reason: reasonFor(status, deltaHours, tolerance, match.siteId),
      ruleId: DRIFT_RULE_ID,
    });
  }

  // Leftover actuals in the (extended) window are "extra" — recorded facts
  // the plan does not account for.
  for (const candidate of candidatePool) {
    if (usedActuals.has(candidate.id)) continue;
    items.push({
      // No scheduled counterpart exists — never borrow windowStart as if it
      // were a planned slot for this fact.
      scheduledAt: null,
      status: 'extra',
      actual: { occurredAt: candidate.occurredAt, siteId: candidate.siteId },
      reason: reasonFor('extra', undefined, tolerance),
      ruleId: DRIFT_RULE_ID,
    });
  }

  items.sort((a, b) => {
    // Extras have no scheduledAt; order by whichever fact exists.
    const at = a.actual?.occurredAt ?? a.scheduledAt ?? '';
    const bt = b.actual?.occurredAt ?? b.scheduledAt ?? '';
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
