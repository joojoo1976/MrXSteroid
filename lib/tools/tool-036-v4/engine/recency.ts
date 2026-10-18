/**
 * Tool-036 V4 — recorded site usage (design-v4-ar.md §4, decision R2).
 *
 * The tool may state *when a site was last recorded* — nothing more. Sites
 * with no recorded events are ABSENT from the result on purpose: the UI must
 * render them as «لا توجد بيانات استخدام مسجّلة», never as "ready" or
 * "safe". There is no threshold here (the legacy 7/14 inference is a
 * disabled registry rule, not code).
 */
import type { InjectionEvent, SiteId } from '../contracts';

export interface SiteRecency {
  lastUsedAt: string;
  /** Whole days elapsed between `lastUsedAt` and `nowIso` — a fact, not a verdict. */
  daysSince: number;
}

export function siteRecencyFromEvents(
  events: readonly InjectionEvent[],
  nowIso: string,
): Partial<Record<SiteId, SiteRecency>> {
  const nowMs = Date.parse(nowIso);
  const result: Partial<Record<SiteId, SiteRecency>> = {};
  for (const event of events) {
    const t = Date.parse(event.occurredAt);
    if (!Number.isFinite(t)) continue;
    const prev = result[event.siteId];
    if (!prev || t > Date.parse(prev.lastUsedAt)) {
      const daysSince = Math.max(0, Math.floor((nowMs - t) / 86_400_000));
      result[event.siteId] = { lastUsedAt: event.occurredAt, daysSince };
    }
  }
  return result;
}
