/**
 * Tool-036 V4 — proposal engine tests (gates C3.1 determinism, C3.2 dose
 * maths, C3.3 DST, plus rotator/recency/rotation-preference behaviour).
 */
import { describe, it, expect } from 'vitest';
import { compileProposal, LOCAL_SHOT_HOUR, SHOT_DAYS_BY_COUNT } from './proposal';
import { assignSitesToShots } from './rotator';
import { siteRecencyFromEvents } from './recency';
import { checkRotation } from './rotation-check';
import { getLocalParts } from './tz';
import { DEFAULT_PLAN } from '../state/reducer';
import type { InjectionEvent, PlanSpec } from '../contracts';

const RIYADH = 'Asia/Riyadh';
const NEW_YORK = 'America/New_York';
const FROM = '2026-10-18T10:00:00+03:00'; // a Sunday in Riyadh

function enanthatePlan(overrides: Partial<PlanSpec> = {}): PlanSpec {
  return { ...DEFAULT_PLAN, ...overrides };
}

function event(occurredAt: string, siteId: InjectionEvent['siteId'], id: string): InjectionEvent {
  return {
    id,
    occurredAt,
    siteId,
    volumeMl: 1,
    doseMg: 125,
    compoundIds: ['testosterone-enanthate'],
    source: 'logged',
    createdAt: occurredAt,
  };
}

describe('V4 proposal — gate C3.1 determinism', () => {
  it('compiling the same plan twice yields identical output', () => {
    const opts = { fromIso: FROM, weeks: 4, tz: RIYADH, events: [] as InjectionEvent[] };
    expect(compileProposal(enanthatePlan(), opts)).toEqual(compileProposal(enanthatePlan(), opts));
  });

  it('event history affects site choice but never timing or ids', () => {
    const opts = { fromIso: FROM, weeks: 2, tz: RIYADH, events: [] as InjectionEvent[] };
    const withHistory = {
      ...opts,
      events: [event('2026-10-17T08:00:00+03:00', 'dorso-l', 'e1')],
    };
    const bare = compileProposal(enanthatePlan(), opts);
    const fed = compileProposal(enanthatePlan(), withHistory);
    expect(fed.shots.map((s) => s.occurredAt)).toEqual(bare.shots.map((s) => s.occurredAt));
    expect(fed.shots.map((s) => s.id)).toEqual(bare.shots.map((s) => s.id));
  });
});

describe('V4 proposal — gate C3.2 declared dose maths', () => {
  it('250 mg/wk split over 2 injections at 250 mg/mL => 125 mg / 0.5 mL', () => {
    const proposal = compileProposal(enanthatePlan(), {
      fromIso: FROM,
      weeks: 1,
      tz: RIYADH,
      events: [],
    });
    expect(proposal.shots).toHaveLength(2);
    for (const shot of proposal.shots) {
      expect(shot.doseMg).toBe(125);
      expect(shot.volumeMl).toBe(0.5);
    }
  });

  it('respects the per-week injection count day patterns', () => {
    for (const [count, days] of Object.entries(SHOT_DAYS_BY_COUNT)) {
      const plan = enanthatePlan({
        compounds: [{ ...DEFAULT_PLAN.compounds[0], injectionsPerWeek: Number(count) }],
      });
      const proposal = compileProposal(plan, {
        fromIso: FROM,
        weeks: 1,
        tz: RIYADH,
        events: [],
      });
      expect(proposal.shots.map((s) => s.dayIndex).sort(), `count ${count}`).toEqual(
        [...days].sort((a, b) => a - b),
      );
    }
  });

  it('multi-compound plans schedule both compounds with unique ids', () => {
    const plan = enanthatePlan({
      compounds: [
        { compoundId: 'testosterone-enanthate', weeklyDoseMg: 250, concentrationMgMl: 250, injectionsPerWeek: 2 },
        { compoundId: 'testosterone-cypionate', weeklyDoseMg: 100, concentrationMgMl: 100, injectionsPerWeek: 1 },
      ],
    });
    const proposal = compileProposal(plan, { fromIso: FROM, weeks: 2, tz: RIYADH, events: [] });
    expect(proposal.shots).toHaveLength(6);
    expect(new Set(proposal.shots.map((s) => s.id)).size).toBe(6);
    const cypionate = proposal.shots.filter((s) => s.compoundId === 'testosterone-cypionate');
    expect(cypionate).toHaveLength(2);
    expect(cypionate[0].doseMg).toBe(100);
    expect(cypionate[0].volumeMl).toBe(1);
  });
});

describe('V4 proposal — gate C3.3 DST (shots stay at local 08:00)', () => {
  it('a 4-week New York plan spanning spring-forward keeps every shot at 08:00 local', () => {
    const proposal = compileProposal(enanthatePlan(), {
      fromIso: '2026-03-01T12:00:00-05:00',
      weeks: 4,
      tz: NEW_YORK,
      events: [],
    });
    expect(proposal.shots.length).toBe(8);
    for (const shot of proposal.shots) {
      const parts = getLocalParts(new Date(shot.occurredAt), NEW_YORK);
      expect(parts.minutesOfDay, shot.occurredAt).toBe(LOCAL_SHOT_HOUR * 60);
    }
    // Week 2 begins on the DST-transition Sunday; the gap must be 23h, proving
    // the calendar walk really crossed the transition.
    const week1Sunday = proposal.shots.find((s) => s.weekIndex === 0 && s.dayIndex === 0)!;
    const week2Sunday = proposal.shots.find((s) => s.weekIndex === 1 && s.dayIndex === 0)!;
    expect(Date.parse(week2Sunday.occurredAt) - Date.parse(week1Sunday.occurredAt)).toBe(
      167 * 3_600_000,
    );
  });

  it('windowStart/windowEnd bracket the shots exactly', () => {
    const proposal = compileProposal(enanthatePlan(), {
      fromIso: FROM,
      weeks: 2,
      tz: RIYADH,
      events: [],
    });
    expect(proposal.windowStart).toBe(proposal.shots[0].occurredAt);
    expect(proposal.windowEnd).toBe(proposal.shots[proposal.shots.length - 1].occurredAt);
  });
});

describe('V4 rotator — scheduling only, never medical', () => {
  it('LRU prefers never-used sites, then rotates back to the oldest', () => {
    const events = [event('2026-10-17T08:00:00+03:00', 'dorso-l', 'e1')];
    const proposal = compileProposal(enanthatePlan(), {
      fromIso: FROM,
      weeks: 2,
      tz: RIYADH,
      events,
    });
    // dorso-l was used yesterday; every other site is untouched. LRU fills
    // the window with never-used sites in declared preference order (it only
    // rotates back to dorso-l once all eight preferred sites have been used).
    expect(proposal.shots.map((s) => s.siteId)).toEqual([
      'dorso-r',
      'ventro-l',
      'ventro-r',
      'deltoid-l',
    ]);
    expect(proposal.shots.every((s) => s.assignedBy === 'lru')).toBe(true);
  });

  it('fixed-order mode round-robins the declared order verbatim', () => {
    const plan = enanthatePlan({
      rotationMode: 'fixed-order',
      preferredSites: ['ventro-l', 'ventro-r'],
    });
    const proposal = compileProposal(plan, { fromIso: FROM, weeks: 2, tz: RIYADH, events: [] });
    expect(proposal.shots.map((s) => s.siteId)).toEqual([
      'ventro-l',
      'ventro-r',
      'ventro-l',
      'ventro-r',
    ]);
  });

  it('assignSitesToShots is pure (no input mutation)', () => {
    const drafts = [{ compoundId: 'x', occurredAtMs: Date.parse(FROM) }];
    const events = [event('2026-10-17T08:00:00+03:00', 'dorso-l', 'e1')];
    const before = structuredClone(events);
    assignSitesToShots(drafts, events, DEFAULT_PLAN);
    expect(events).toEqual(before);
  });
});

describe('V4 recency — decision R2 (absence is a first-class state)', () => {
  it('reports recorded facts only; unrecorded sites are absent, never "ready"', () => {
    const recency = siteRecencyFromEvents(
      [event('2026-10-10T08:00:00+03:00', 'vastus-l', 'e1')],
      '2026-10-30T12:00:00+03:00',
    );
    expect(recency['vastus-l']).toEqual({
      lastUsedAt: '2026-10-10T08:00:00+03:00',
      daysSince: 20,
    });
    expect(recency['dorso-l']).toBeUndefined();
    expect(Object.keys(recency)).toHaveLength(1);
  });

  it('keeps the latest use per site and floors same-day usage at zero', () => {
    const recency = siteRecencyFromEvents(
      [
        event('2026-10-18T08:00:00+03:00', 'dorso-l', 'e2'),
        event('2026-10-17T08:00:00+03:00', 'dorso-l', 'e1'),
      ],
      '2026-10-18T10:00:00+03:00',
    );
    expect(recency['dorso-l']?.lastUsedAt).toBe('2026-10-18T08:00:00+03:00');
    expect(recency['dorso-l']?.daysSince).toBe(0);
  });
});

describe('V4 rotation preference check — gate C3.4 (R3: preference, not safety)', () => {
  it('flags a same-site actual pair closer than the preference', () => {
    const proposal = compileProposal(enanthatePlan(), {
      fromIso: FROM,
      weeks: 1,
      tz: RIYADH,
      events: [],
    });
    const events = [
      event('2026-10-15T08:00:00+03:00', 'ventro-l', 'e1'),
      event('2026-10-18T08:00:00+03:00', 'ventro-l', 'e2'),
    ];
    const findings = checkRotation(events, proposal, 7);
    const ventro = findings.filter((f) => f.siteId === 'ventro-l');
    expect(ventro).toHaveLength(1);
    expect(ventro[0]).toMatchObject({
      kind: 'preference-breach',
      gapDays: 3,
      origin: 'actual',
      ruleId: 'rotation-rest-preference',
    });
  });

  it('does NOT count a plan/actual pair as a zero-day phantom breach', () => {
    const events = [event('2026-10-17T08:00:00+03:00', 'dorso-l', 'e1')];
    const proposal = compileProposal(enanthatePlan(), {
      fromIso: FROM,
      weeks: 2,
      tz: RIYADH,
      events,
    });
    // dorso-l: one actual, then LRU-rotated planned uses a week apart.
    const findings = checkRotation(events, proposal, 7);
    expect(findings.filter((f) => f.kind === 'preference-breach')).toHaveLength(0);
  });

  it('a calendar week across DST is 7 days, not 6 — no false breach', () => {
    const proposal = compileProposal(enanthatePlan(), {
      fromIso: '2026-03-01T12:00:00-05:00',
      weeks: 1,
      tz: NEW_YORK,
      events: [],
    });
    const events = [
      event('2026-03-01T08:00:00-05:00', 'vastus-l', 'e1'),
      event('2026-03-08T08:00:00-04:00', 'vastus-l', 'e2'), // 167h later
    ];
    expect(Date.parse(events[1].occurredAt) - Date.parse(events[0].occurredAt)).toBe(
      167 * 3_600_000,
    );
    expect(checkRotation(events, proposal, 7).filter((f) => f.siteId === 'vastus-l')).toHaveLength(0);
  });

  it('an 8-site LRU plan over 4 weeks produces no preference findings', () => {
    const proposal = compileProposal(enanthatePlan(), {
      fromIso: FROM,
      weeks: 4,
      tz: RIYADH,
      events: [],
    });
    expect(checkRotation([], proposal, 7)).toHaveLength(0);
  });

  it('a single-site fixed-order plan breaches the preference and says so', () => {
    const plan = enanthatePlan({
      rotationMode: 'fixed-order',
      preferredSites: ['ventro-l'],
    });
    const proposal = compileProposal(plan, { fromIso: FROM, weeks: 2, tz: RIYADH, events: [] });
    const findings = checkRotation([], proposal, 7);
    // Sunday->Thursday on one site = 4- and 3-day gaps: both breach a 7-day
    // preference, and every finding names the preference rule — never safety.
    expect(findings).toHaveLength(3);
    expect(findings.every((f) => f.kind === 'preference-breach')).toBe(true);
    expect(findings.every((f) => f.ruleId === 'rotation-rest-preference')).toBe(true);
    expect(findings.every((f) => f.origin === 'planned')).toBe(true);
    expect(findings.map((f) => f.gapDays).sort()).toEqual([3, 4, 4]);
  });

  it('two-site Sunday/Thursday alternation IS compliant (7-day spacing per site)', () => {
    const plan = enanthatePlan({
      rotationMode: 'fixed-order',
      preferredSites: ['ventro-l', 'ventro-r'],
    });
    const proposal = compileProposal(plan, { fromIso: FROM, weeks: 2, tz: RIYADH, events: [] });
    expect(checkRotation([], proposal, 7)).toHaveLength(0);
  });
});
