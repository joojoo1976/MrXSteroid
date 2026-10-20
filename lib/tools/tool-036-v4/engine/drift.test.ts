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
    expect(s2.reasonEn).toContain('after schedule');
    expect(s2.reasonAr).toContain('بعد الموعد');
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
    expect(s1.reasonEn).toContain('different site');
    expect(s1.reasonAr).toContain('موقع مختلف');
  });

  it('no actual in the window is missed — with the window stated in the reason', () => {
    const report = buildDriftReport(PROPOSAL, [], PREFS, NOW);
    expect(report.items).toHaveLength(2);
    expect(report.items.every((i) => i.status === 'missed')).toBe(true);
    expect(report.items[0].reasonEn).toContain(`${MATCHING_WINDOW_HOURS}h`);
    expect(report.items[0].reasonAr).toContain(`${MATCHING_WINDOW_HOURS} ساعة`);
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
    // An extra fact has NO scheduled counterpart. It must not borrow the
    // window start (or any other time) and present it as a planned slot.
    expect(extra[0].scheduledAt).toBeNull();
    expect(extra[0].deltaHours).toBeUndefined();
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
    expect(s1.reasonEn).toContain('before schedule');
    expect(s1.reasonAr).toContain('قبل الموعد');
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

describe('V4 drift — matching is order-independent and nearest-wins (acceptance P0-2)', () => {
  // Every judging window has closed in this frame, so nothing is deferred.
  const ALL_CLOSED = '2026-10-19T20:00:00.000Z';

  const tenHoursApart: Proposal = {
    shots: [
      { ...PROPOSAL.shots[0], id: 's1', occurredAt: '2026-10-18T05:00:00.000Z' },
      { ...PROPOSAL.shots[1], id: 's2', occurredAt: '2026-10-18T15:00:00.000Z' },
    ],
    windowStart: '2026-10-18T05:00:00.000Z',
    windowEnd: '2026-10-18T15:00:00.000Z',
    tz: 'Asia/Riyadh',
  };

  it('an actual between two slots is credited to the NEARER slot, not the earlier one', () => {
    const report = buildDriftReport(
      tenHoursApart,
      [actual('2026-10-18T11:00:00.000Z', 'dorso-r', 'a1')], // +6h from s1, -4h from s2
      PREFS,
      ALL_CLOSED,
    );
    const s1 = report.items.find((i) => i.scheduledAt === tenHoursApart.shots[0].occurredAt)!;
    const s2 = report.items.find((i) => i.scheduledAt === tenHoursApart.shots[1].occurredAt)!;
    expect(s2.status).toBe('matched');
    expect(s2.deltaHours).toBe(-4);
    expect(s1.status).toBe('missed');
  });

  it('two overlapping windows claim two actuals without double-assignment', () => {
    const overlap: Proposal = {
      shots: [
        { ...PROPOSAL.shots[0], id: 's1', occurredAt: '2026-10-18T05:00:00.000Z' },
        { ...PROPOSAL.shots[1], id: 's2', occurredAt: '2026-10-18T09:00:00.000Z' },
      ],
      windowStart: '2026-10-18T05:00:00.000Z',
      windowEnd: '2026-10-18T09:00:00.000Z',
      tz: 'Asia/Riyadh',
    };
    const report = buildDriftReport(
      overlap,
      [
        actual('2026-10-18T09:30:00.000Z', 'dorso-r', 'a2'), // 0.5h after s2
        actual('2026-10-18T04:00:00.000Z', 'dorso-l', 'a1'), // 1h before s1
      ],
      PREFS,
      ALL_CLOSED,
    );
    const s1 = report.items.find((i) => i.scheduledAt === overlap.shots[0].occurredAt)!;
    const s2 = report.items.find((i) => i.scheduledAt === overlap.shots[1].occurredAt)!;
    expect(s1.actual?.occurredAt).toBe('2026-10-18T04:00:00.000Z');
    expect(s2.actual?.occurredAt).toBe('2026-10-18T09:30:00.000Z');
    expect(report.summary.extra).toBe(0);
  });

  it('the result does not depend on the order of the events array', () => {
    const events = [
      actual('2026-10-18T11:00:00.000Z', 'dorso-r', 'a1'),
      actual('2026-10-18T03:00:00.000Z', 'dorso-l', 'a2'),
      actual('2026-10-20T23:00:00.000Z', 'ventro-l', 'a3'),
    ];
    const forward = buildDriftReport(PROPOSAL, events, PREFS, NOW);
    const reversed = buildDriftReport(PROPOSAL, [...events].reverse(), PREFS, NOW);
    const shuffled = buildDriftReport(PROPOSAL, [events[2], events[0], events[1]], PREFS, NOW);
    expect(reversed).toEqual(forward);
    expect(shuffled).toEqual(forward);
  });

  it('the result does not depend on the order of the scheduled shots', () => {
    const events = [actual('2026-10-18T11:00:00.000Z', 'dorso-r', 'a1')];
    const forward = buildDriftReport(tenHoursApart, events, PREFS, ALL_CLOSED);
    const reversedShots: Proposal = { ...tenHoursApart, shots: [...tenHoursApart.shots].reverse() };
    expect(buildDriftReport(reversedShots, events, PREFS, ALL_CLOSED)).toEqual(forward);
  });

  it('an exact midpoint tie resolves deterministically to the earlier slot', () => {
    const tie: Proposal = {
      shots: [
        { ...PROPOSAL.shots[0], id: 's1', occurredAt: '2026-10-18T05:00:00.000Z' },
        { ...PROPOSAL.shots[1], id: 's2', occurredAt: '2026-10-18T07:00:00.000Z' },
      ],
      windowStart: '2026-10-18T05:00:00.000Z',
      windowEnd: '2026-10-18T07:00:00.000Z',
      tz: 'Asia/Riyadh',
    };
    const report = buildDriftReport(
      tie,
      [actual('2026-10-18T06:00:00.000Z', 'dorso-l', 'a1')], // 1h from each
      PREFS,
      ALL_CLOSED,
    );
    const claimed = report.items.find((i) => i.actual)!;
    expect(claimed.scheduledAt).toBe('2026-10-18T05:00:00.000Z');
    expect(report.summary.missed).toBe(1);
  });

  it('an actual more than 24h from both nearby slots leaves both missed and is extra', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [actual('2026-10-20T12:00:00.000Z', 'dorso-l', 'a1')], // 55h from s1, 41h from s2
      PREFS,
      NOW,
    );
    expect(report.summary.missed).toBe(2);
    expect(report.summary.extra).toBe(1);
  });
});

describe('V4 drift — the window spans the whole planning horizon (acceptance P1-4)', () => {
  it('reports over the full 12-week window and judges an actual at the far end', () => {
    const proposal: Proposal = {
      shots: [
        { ...PROPOSAL.shots[0], id: 'first', occurredAt: '2026-10-18T05:00:00.000Z' },
        { ...PROPOSAL.shots[1], id: 'last', occurredAt: '2027-01-07T05:00:00.000Z' },
      ],
      windowStart: '2026-10-18T05:00:00.000Z',
      windowEnd: '2027-01-07T05:00:00.000Z',
      tz: 'Asia/Riyadh',
    };
    const report = buildDriftReport(
      proposal,
      [actual('2027-01-07T06:00:00.000Z', 'dorso-r', 'far')],
      PREFS,
      '2027-01-08T10:00:00+03:00',
    );
    expect(report.windowStart).toBe(proposal.windowStart);
    expect(report.windowEnd).toBe(proposal.windowEnd);
    const last = report.items.find((i) => i.scheduledAt === proposal.shots[1].occurredAt)!;
    expect(last.status).toBe('matched');
    expect(last.deltaHours).toBe(1);
  });
});

describe('V4 drift — global optimum: maximise matches, then minimise total |delta| (acceptance P0-2b)', () => {
  // Every judging window has closed in this frame.
  const ALL_CLOSED = '2026-10-21T00:00:00.000Z';

  // Two slots exactly 24h apart (Sun 08:00 and Mon 08:00, Riyadh wall time).
  const twoSlots: Proposal = {
    shots: [
      { ...PROPOSAL.shots[0], id: 's1', occurredAt: '2026-10-18T05:00:00.000Z' },
      { ...PROPOSAL.shots[1], id: 's2', occurredAt: '2026-10-19T05:00:00.000Z' },
    ],
    windowStart: '2026-10-18T05:00:00.000Z',
    windowEnd: '2026-10-19T05:00:00.000Z',
    tz: 'Asia/Riyadh',
  };

  // a1 is reachable ONLY by s1 (23h; 47h from s2); a2 sits between them
  // (10h after s1, 14h before s2) and is nearer to s1.
  const a1 = () => actual('2026-10-17T06:00:00.000Z', 'dorso-l', 'a1');
  const a2 = () => actual('2026-10-18T15:00:00.000Z', 'dorso-r', 'a2');

  it('does not strand a match: two reachable slots and two actuals both match', () => {
    const report = buildDriftReport(twoSlots, [a1(), a2()], PREFS, ALL_CLOSED);

    // Cheapest-first greedy claims a2 for s1 (10h) and strands a1 as "extra"
    // while s2 is reported "missed" — one match where two are possible.
    // The optimum reserves a1 for s1 and gives a2 to s2: two matches.
    expect(report.summary.matched).toBe(2);
    expect(report.summary.missed).toBe(0);
    expect(report.summary.extra).toBe(0);

    const s1 = report.items.find((i) => i.scheduledAt === twoSlots.shots[0].occurredAt)!;
    const s2 = report.items.find((i) => i.scheduledAt === twoSlots.shots[1].occurredAt)!;
    expect(s1.actual?.occurredAt).toBe('2026-10-17T06:00:00.000Z');
    expect(s2.actual?.occurredAt).toBe('2026-10-18T15:00:00.000Z');
  });

  it('among equal-cardinality matchings, the smaller total |delta| wins', () => {
    const twoSlotsHalf: Proposal = {
      shots: [
        { ...PROPOSAL.shots[0], id: 's1', occurredAt: '2026-10-18T05:00:00.000Z' },
        { ...PROPOSAL.shots[1], id: 's2', occurredAt: '2026-10-18T15:00:00.000Z' },
      ],
      windowStart: '2026-10-18T05:00:00.000Z',
      windowEnd: '2026-10-18T15:00:00.000Z',
      tz: 'Asia/Riyadh',
    };
    const report = buildDriftReport(
      twoSlotsHalf,
      [
        actual('2026-10-18T04:00:00.000Z', 'dorso-l', 'a1'), // 1h from s1, 11h from s2
        actual('2026-10-18T16:00:00.000Z', 'dorso-r', 'a2'), // 11h from s1, 1h from s2
      ],
      PREFS,
      ALL_CLOSED,
    );

    // Both assignments reach cardinality 2; 1h + 1h (=2h) beats 11h + 11h.
    const s1 = report.items.find((i) => i.scheduledAt === twoSlotsHalf.shots[0].occurredAt)!;
    const s2 = report.items.find((i) => i.scheduledAt === twoSlotsHalf.shots[1].occurredAt)!;
    expect(s1.actual?.occurredAt).toBe('2026-10-18T04:00:00.000Z');
    expect(s2.actual?.occurredAt).toBe('2026-10-18T16:00:00.000Z');
    expect(report.summary.extra).toBe(0);
  });

  it('the optimum is independent of the order of shots and events', () => {
    const forward = buildDriftReport(twoSlots, [a1(), a2()], PREFS, ALL_CLOSED);
    expect(buildDriftReport(twoSlots, [a2(), a1()], PREFS, ALL_CLOSED)).toEqual(forward);
    const reversedShots: Proposal = { ...twoSlots, shots: [...twoSlots.shots].reverse() };
    expect(buildDriftReport(reversedShots, [a1(), a2()], PREFS, ALL_CLOSED)).toEqual(forward);
  });
});

describe('V4 drift — the tolerance boundary is judged on the RAW delta (acceptance: rounding must not reclassify)', () => {
  // PREFS declares lateToleranceHours = 6. These three cases pin the edge of
  // that declared rule: the classification must follow the exact elapsed time,
  // not a value that was first rounded to a tenth of an hour (which turned
  // +6h02m into 6.0 and silently reported a late injection as "matched").
  const minute = 60_000;
  const at = (offsetMs: number) => new Date(Date.parse(SCHEDULED_S1) + offsetMs).toISOString();

  it('an actual exactly AT the tolerance (+6h) is matched at the same site', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [actual(at(6 * hour), 'dorso-l', 'a1')],
      PREFS,
      NOW,
    );
    const s1 = report.items.find((i) => i.scheduledAt === SCHEDULED_S1)!;
    expect(s1.status).toBe('matched');
    expect(s1.deltaHours).toBe(6);
  });

  it('an actual 2 minutes PAST the tolerance (+6h02m) is late, δ = 6.03, chip and reason agree', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [actual(at(6 * hour + 2 * minute), 'dorso-l', 'a1')],
      PREFS,
      NOW,
    );
    const s1 = report.items.find((i) => i.scheduledAt === SCHEDULED_S1)!;

    expect(s1.status).toBe('late');
    // The published delta is reported at two decimals (≈36 s), so a value a
    // hair past the tolerance cannot round back onto it.
    expect(s1.deltaHours).toBeCloseTo(6.03, 2);
    expect(s1.deltaHours).toBe(6.03);
    expect(s1.deltaHours!).toBeGreaterThan(PREFS.lateToleranceHours);

    // The delta chip renders `deltaHours` verbatim and the stated reason quotes
    // the same distance, so the number, the wording and the `late` status all
    // say one thing. At one decimal the chip read "6" beside a 6.03h reason.
    expect(s1.reasonEn).toContain(String(s1.deltaHours));
    expect(s1.reasonAr).toContain(String(s1.deltaHours));
    expect(s1.reasonEn).toContain('6.03');
    expect(s1.reasonAr).toContain('6.03');
  });

  it('an actual 2 minutes BEFORE the tolerance (−6h02m), inside the window, stays matched', () => {
    const report = buildDriftReport(
      PROPOSAL,
      [actual(at(-(6 * hour + 2 * minute)), 'dorso-l', 'a1')],
      PREFS,
      NOW,
    );
    const s1 = report.items.find((i) => i.scheduledAt === SCHEDULED_S1)!;
    expect(s1.status).toBe('matched');
    // Two decimals, sign preserved.
    expect(s1.deltaHours).toBe(-6.03);
    expect(s1.reasonEn).toContain('6.03');
    expect(s1.reasonEn).toContain('before schedule');
    expect(s1.reasonAr).toContain('قبل الموعد');
  });
});
