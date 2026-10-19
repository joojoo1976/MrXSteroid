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

/**
 * The declared reason for a classification, in both interface languages
 * (F7.5). Returning the pair here — rather than a single string — keeps the
 * wording next to the rule that produces it and mirrors the `messageEn`/
 * `messageAr` convention already used by import errors.
 */
function reasonsFor(
  status: DriftItem['status'],
  deltaHours: number | undefined,
  tolerance: number,
): { reasonEn: string; reasonAr: string } {
  // Two decimals of an hour (≈36 s): fine enough that a delta just past the
  // declared tolerance is never printed as if it sat exactly on the boundary
  // (e.g. 6 h 02 m → 6.033 → "6.03"), which would read as a contradiction
  // ("6h after schedule, beyond the ±6h tolerance").
  const h = deltaHours === undefined ? undefined : Math.round(deltaHours * 100) / 100;
  const abs = h === undefined ? undefined : Math.abs(h);
  switch (status) {
    case 'matched':
      if (h !== undefined && h < -tolerance) {
        return {
          reasonEn: `actual recorded ${abs}h before schedule (inside the ${MATCHING_WINDOW_HOURS}h matching window)`,
          reasonAr: `سُجِّل الفعلي قبل الموعد بـ${abs} ساعة (داخل نافذة المطابقة ${MATCHING_WINDOW_HOURS} ساعة)`,
        };
      }
      return {
        reasonEn: `actual within ±${tolerance}h of schedule`,
        reasonAr: `فعلي ضمن ±${tolerance} ساعة من الموعد`,
      };
    case 'site-changed':
      return {
        reasonEn: `actual within ±${tolerance}h of schedule but at a different site`,
        reasonAr: `فعلي ضمن ±${tolerance} ساعة من الموعد لكن في موقع مختلف`,
      };
    case 'late':
      return {
        reasonEn: `actual ${h}h after schedule (beyond ±${tolerance}h tolerance, inside ${MATCHING_WINDOW_HOURS}h)`,
        reasonAr: `فعلي بعد الموعد بـ${h} ساعة (تجاوز التسامح ±${tolerance} ساعة، وداخل ${MATCHING_WINDOW_HOURS} ساعة)`,
      };
    case 'missed':
      return {
        reasonEn: `no actual event inside [−${MATCHING_WINDOW_HOURS}h, +${MATCHING_WINDOW_HOURS}h] of schedule`,
        reasonAr: `لا يوجد حدث فعلي ضمن [−${MATCHING_WINDOW_HOURS} ساعة، +${MATCHING_WINDOW_HOURS} ساعة] من الموعد`,
      };
    case 'extra':
      return {
        reasonEn: 'actual event has no scheduled counterpart in this window',
        reasonAr: 'حدث فعلي بلا موعد مقابل في هذه النافذة',
      };
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
        ...reasonsFor('missed', undefined, tolerance),
        ruleId: DRIFT_RULE_ID,
      });
      continue;
    }

    // The classification must use the RAW elapsed time. Rounding to a tenth of
    // an hour first turned +6 h 02 m (6.033) into 6.0 and labelled an injection
    // that overran the declared tolerance as `matched`.
    const rawDeltaHours = (Date.parse(match.occurredAt) - scheduledMs) / 3_600_000;
    // The published delta carries two decimals (≈36 s) and keeps the sign of the
    // elapsed time. At one decimal a delta of +6 h 02 m rounded to 6.0, so the
    // delta chip and the stated reason disagreed with the `late` classification
    // ("فرق 6 ساعة" next to a reason reading "6.03h after schedule"); two
    // decimals keep the number, the wording and the status saying one thing.
    const deltaHours = Math.round(rawDeltaHours * 100) / 100;

    let status: DriftItem['status'];
    if (Math.abs(rawDeltaHours) <= tolerance) {
      status = match.siteId === shot.siteId ? 'matched' : 'site-changed';
    } else if (rawDeltaHours > tolerance) {
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
      // The exact delta feeds the wording, so a value just past the tolerance is
      // described by its true distance rather than the rounded value.
      ...reasonsFor(status, rawDeltaHours, tolerance),
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
      ...reasonsFor('extra', undefined, tolerance),
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
