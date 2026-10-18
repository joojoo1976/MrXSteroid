/**
 * Tool-036 V4 — drift report tests (gate C5, decisions D4/R5).
 * Each test handcrafts the plan side so the matching logic is exercised
 * without rotator coupling.
 */
import { describe, it, expect } from 'vitest';
import { buildDriftReport, DRIFT_RULE_ID, MATCHING_WINDOW_HOURS } from './drift';
import { driftReportSchema, type InjectionEvent, type Prefs, type Proposal } from '../contracts';

const SCHEDULED_S1 = '2026-10-18T05:00:00.000Z'; // 08:00 Riyadh
const SCHEDULED_S2 = '2026-10-22T05:00:00.000Z';
const NOW = '2026-10-23T10:00:00+03:00';

const PREFS: Prefs = { locale: 'ar', tz: 'Asia/Riyadh', lateToleranceHours: 6, restPreferenceDays: 7 };

const PROPOSAL: Proposal = {
  shots: [
    {
      id: 's1',
      occurredAt: SCHEDULED_S1,
      siteId: 'dorso-l',
      assignedBy: 'lru',
      volumeMl: 0.5,
      doseMg: 125,
      compoundId: 'testosterone-enanthate',
      weekIndex: 0,
      dayIndex: 0,
    },
    {
      id: 's2',
      occurredAt: SCHEDULED_S2,
      siteId: 'dorso-r',
      assignedBy: 'lru',
      volumeMl: 0.5,
      doseMg: 125,
      compoundId: 'testosterone-enanthate',
      weekIndex: 0,
      dayIndex: 4,
    },
  ],
  windowStart: SCHEDULED_S1,
  windowEnd: SCHEDULED_S2,
  tz: 'Asia/Riyadh',
};

function actual(occurredAt: string, siteId: InjectionEvent['siteId'], id: string): InjectionEvent {
  return {
    id,
    occurredAt,
    siteId,
    volumeMl: 0.5,
    doseMg: 125,
    compoundIds: ['testosterone-enanthate'],
    source: 'logged',
    createdAt: occurredAt,
  };
}

const hour = 3_600_000;

describe('V4 drift — declared matching rules', () => {
  it('an actual within tolerance at the planned site is matched with a signed delta', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [actual('2026-10-18T06:00:00.000Z', 'dorso-l', 'a1')],
      PREFS,
      NOW,
    );
    const s1 = report.items.find((i) => i.scheduledAt === SCHEDULED_S1)!;
    expect(s1.status).toBe('matched');
    expect(s1.deltaHours).toBe(1);
    expect(s1.actual?.siteId).toBe('dorso-l');
    expect(s1.ruleId).toBe(DRIFT_RULE_ID);
  });

  it('an actual later than tolerance but within 24h is late', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [actual(new Date(Date.parse(SCHEDULED_S2) + 7 * hour).toISOString(), 'dorso-r', 'a1')],
      PREFS,
      NOW,
    );
    const s2 = report.items.find((i) => i.scheduledAt === SCHEDULED_S2)!;
    expect(s2.status).toBe('late');
    expect(s2.deltaHours).toBe(7);
    expect(s2.reason).toContain('after schedule');
  });

  it('an on-time actual at a different site is site-changed', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [actual('2026-10-18T06:00:00.000Z', 'ventro-r', 'a1')],
      PREFS,
      NOW,
    );
    const s1 = report.items.find((i) => i.scheduledAt === SCHEDULED_S1)!;
    expect(s1.status).toBe('site-changed');
    expect(s1.actual?.siteId).toBe('ventro-r');
    expect(s1.reason).toContain('different site');
  });

  it('no actual in the window is missed — with the window stated in the reason', () => {
    const report = buildDriftReport(PROPOSAL, [], PREFS, NOW);
    expect(report.items).toHaveLength(2);
    expect(report.items.every((i) => i.status === 'missed')).toBe(true);
    expect(report.items[0].reason).toContain(`${MATCHING_WINDOW_HOURS}h`);
    expect(report.items[0].actual).toBeUndefined();
  });

  it('an actual with no scheduled counterpart is extra', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [
        actual('2026-10-18T06:00:00.000Z', 'dorso-l', 'a1'),
        actual('2026-10-22T06:00:00.000Z', 'dorso-r', 'a2'),
        actual('2026-10-20T09:00:00.000Z', 'ventro-l', 'a3'), // unscheduled
      ],
      PREFS,
      NOW,
    );
    const extra = report.items.filter((i) => i.status === 'extra');
    expect(extra).toHaveLength(1);
    expect(extra[0].actual?.siteId).toBe('ventro-l');
    expect(extra[0].actual?.occurredAt).toBe('2026-10-20T09:00:00.000Z');
    expect(report.summary.extra).toBe(1);
  });

  it('an actual well before tolerance but inside the window is still matched — earliness stated', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [actual(new Date(Date.parse(SCHEDULED_S1) - 10 * hour).toISOString(), 'dorso-l', 'a1')],
      PREFS,
      NOW,
    );
    const s1 = report.items.find((i) => i.scheduledAt === SCHEDULED_S1)!;
    expect(s1.status).toBe('matched');
    expect(s1.deltaHours).toBe(-10);
    expect(s1.reason).toContain('before schedule');
  });

  it('the nearest actual wins; a second nearby actual becomes extra', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [
        actual('2026-10-18T03:00:00.000Z', 'dorso-l', 'near'), // -2h
        actual('2026-10-18T10:00:00.000Z', 'dorso-l', 'far'), // +5h
      ],
      PREFS,
      NOW,
    );
    const s1 = report.items.find((i) => i.scheduledAt === SCHEDULED_S1)!;
    // The nearest candidate (-2h) is claimed; the +5h one has no other shot
    // in range, so it surfaces as an extra rather than being silently eaten.
    expect(s1.actual?.occurredAt).toBe('2026-10-18T03:00:00.000Z');
    expect(s1.deltaHours).toBe(-2);
    expect(report.summary.extra).toBe(1);
  });

  it('actuals outside the matching half-window do not steal a shot', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [actual(new Date(Date.parse(SCHEDULED_S1) + 25 * hour).toISOString(), 'dorso-l', 'a1')],
      PREFS,
      NOW,
    );
    // +25h is beyond both the tolerance and the 24h window: shot is missed
    // and the actual is extra.
    expect(report.items.filter((i) => i.status === 'missed')).toHaveLength(2);
    expect(report.items.filter((i) => i.status === 'extra')).toHaveLength(1);
  });

  it('a shot whose judging window has not closed is not judged', () => {
    // asOf sits inside S2's +24h window: S2 must not be called "missed" —
    // its window is still open. S1 (older) is judged.
    const asOf = new Date(Date.parse(SCHEDULED_S2) + 2 * hour).toISOString();
    const report = buildDriftReport(PROPOSAL, [], PREFS, asOf);
    expect(report.items).toHaveLength(1);
    expect(report.items[0].scheduledAt).toBe(SCHEDULED_S1);
    expect(report.items[0].status).toBe('missed');
  });

  it('a future shot WITH a matching actual is still judged (the actual is a fact)', () => {
    const asOf = new Date(Date.parse(SCHEDULED_S2) - 1 * hour).toISOString();
    const report = buildDriftReport(
      PROPOSAL,
      [actual(new Date(Date.parse(SCHEDULED_S2) - 1 * hour).toISOString(), 'dorso-r', 'a1')],
      PREFS,
      asOf,
    );
    const s2 = report.items.find((i) => i.scheduledAt === SCHEDULED_S2)!;
    expect(s2.status).toBe('matched');
    expect(s2.deltaHours).toBe(-1);
  });
});

describe('V4 drift — summary, determinism, contract', () => {
  it('summary counts match the items', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [
        actual('2026-10-18T06:00:00.000Z', 'dorso-l', 'a1'), // matched
        actual(new Date(Date.parse(SCHEDULED_S2) + 7 * hour).toISOString(), 'dorso-r', 'a2'), // late
      ],
      PREFS,
      NOW,
    );
    expect(report.summary).toEqual({ matched: 1, late: 1, missed: 0, extra: 0, siteChanged: 0 });
  });

  it('is deterministic for identical inputs', () => {
    const events = [actual('2026-10-18T06:00:00.000Z', 'dorso-l', 'a1')];
    expect(buildDriftReport(PROPOSAL, events, PREFS, NOW)).toEqual(
      buildDriftReport(PROPOSAL, events, PREFS, NOW),
    );
  });

  it('validates against driftReportSchema (contract) and carries no score', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [
        actual('2026-10-18T06:00:00.000Z', 'ventro-r', 'a1'),
        actual('2026-10-20T09:00:00.000Z', 'ventro-l', 'a2'),
      ],
      PREFS,
      NOW,
    );
    expect(driftReportSchema.safeParse(report).success).toBe(true);
    expect(Object.keys(report)).not.toContain('score');
    expect(JSON.stringify(report)).not.toMatch(/"score"|"rating"|"percent"/);
  });

  it('changing the declared tolerance changes only classifications, never numbers', () => {
    const lateActual = [
      actual(new Date(Date.parse(SCHEDULED_S1) + 7 * hour).toISOString(), 'dorso-l', 'a1'),
    ];
    const strict = buildDriftReport(PROPOSAL, lateActual, PREFS, NOW);
    const relaxed = buildDriftReport(
      PROPOSAL,
      lateActual,
      { ...PREFS, lateToleranceHours: 8 },
      NOW,
    );
    expect(strict.items[0].status).toBe('late');
    expect(relaxed.items[0].status).toBe('matched');
    // Same underlying facts, same deltas — only the declared rule moved the label.
    expect(relaxed.items[0].deltaHours).toBe(strict.items[0].deltaHours);
  });
});
