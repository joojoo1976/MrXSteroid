/**
 * Tool-036 V4 — rotation preference check (design-v4-ar.md §4, gate C3.4,
 * decision R3).
 *
 * Checks the user's *personal rest-spacing preference* — never a clinical
 * safety rule. Every finding carries `ruleId: 'rotation-rest-preference'` so
 * the UI can label it as a preference breach, not a warning.
 *
 * Two deliberate correctness choices:
 *  - Recorded events and planned shots are checked as SEPARATE sequences and
 *    merged. Mixing them would count a plan/actual pair as a zero-day gap and
 *    report phantom breaches.
 *  - Gaps are counted in CALENDAR days in the user's zone, not as raw instant
 *    differences — otherwise a spring-forward day (23h between 08:00 shots)
 *    would falsely breach a 7-day preference.
 *
 * Scope note (decision R2): there is deliberately NO upper "not optimal yet"
 * band here. The legacy 7/14 structure implied a 14-day healing optimum;
 * that claim is a disabled registry rule, and re-introducing a 2× warning
 * band would smuggle it back in through a scheduling path. A gap longer than
 * the preference is simply compliant.
 */
import type { InjectionEvent, SiteId } from '../contracts';
import type { Proposal } from './proposal';
import { calendarDaysBetween } from './tz';

export const REST_RULE_ID = 'rotation-rest-preference';

export interface RotationFinding {
  kind: 'preference-breach';
  siteId: SiteId;
  /** The later use of the pair. */
  atIso: string;
  prevIso: string;
  prevOrigin: 'actual' | 'planned';
  origin: 'actual' | 'planned';
  gapDays: number;
  ruleId: typeof REST_RULE_ID;
}

interface Use {
  siteId: SiteId;
  atMs: number;
  atIso: string;
  origin: 'actual' | 'planned';
}

function checkSequence(
  uses: readonly Use[],
  restPreferenceDays: number,
  tz: string,
): RotationFinding[] {
  const sorted = [...uses].sort((a, b) => a.atMs - b.atMs);
  const findings: RotationFinding[] = [];
  const previousBySite = new Map<SiteId, Use>();

  for (const use of sorted) {
    const prev = previousBySite.get(use.siteId);
    if (prev) {
      const gapDays = calendarDaysBetween(new Date(prev.atMs), new Date(use.atMs), tz);
      if (gapDays < restPreferenceDays) {
        findings.push({
          kind: 'preference-breach',
          siteId: use.siteId,
          atIso: use.atIso,
          prevIso: prev.atIso,
          prevOrigin: prev.origin,
          origin: use.origin,
          gapDays,
          ruleId: REST_RULE_ID,
        });
      }
      // Gaps at or above the preference are compliant — no band, by design (R2).
    }
    previousBySite.set(use.siteId, use);
  }
  return findings;
}

export function checkRotation(
  events: readonly InjectionEvent[],
  proposal: Proposal,
  restPreferenceDays: number,
): RotationFinding[] {
  const actualUses: Use[] = events.map((e) => ({
    siteId: e.siteId,
    atMs: Date.parse(e.occurredAt),
    atIso: e.occurredAt,
    origin: 'actual' as const,
  }));
  const plannedUses: Use[] = proposal.shots.map((s) => ({
    siteId: s.siteId,
    atMs: Date.parse(s.occurredAt),
    atIso: s.occurredAt,
    origin: 'planned' as const,
  }));

  const findings = [
    ...checkSequence(actualUses, restPreferenceDays, proposal.tz),
    ...checkSequence(plannedUses, restPreferenceDays, proposal.tz),
  ];
  findings.sort((a, b) => a.atIso.localeCompare(b.atIso) || a.siteId.localeCompare(b.siteId));
  return findings;
}
