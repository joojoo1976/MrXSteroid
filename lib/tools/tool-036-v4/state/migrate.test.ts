/**
 * Tool-036 V4 — migration tests (gate C2.5).
 */
import { describe, it, expect } from 'vitest';
import { migrate } from './migrate';
import { applyAction, initialState } from './reducer';
import type { NewEventInput } from '../contracts';

const CTX = { now: '2026-10-18T10:00:00+03:00', idGen: () => 'fixed-id-1' };
const INPUT: NewEventInput = {
  occurredAt: '2026-10-18T08:00:00+03:00',
  siteId: 'dorso-l',
  volumeMl: 1,
  doseMg: 125,
  compoundIds: ['testosterone-enanthate'],
};

const V1_FIXTURE = {
  schemaVersion: 1,
  events: [
    {
      id: 'legacy-1',
      occurredAt: '2026-10-04T09:00:00Z',
      siteId: 'ventro-r',
      volumeMl: 2,
      doseMg: 250,
      compoundIds: ['testosterone-cypionate'],
      painScore: 5,
      note: 'بيانات قديمة',
    },
  ],
  plan: {
    compounds: [
      { compoundId: 'testosterone-cypionate', weeklyDoseMg: 250, concentrationMgMl: 125, injectionsPerWeek: 2 },
    ],
    preferredSites: ['ventro-r', 'ventro-l'],
    rotationMode: 'least-recently-used',
  },
  prefs: { locale: 'ar' },
};

describe('V4 migration — C2.5', () => {
  it('passes current v2 state straight through', async () => {
    const state = applyAction(initialState('en', 'UTC'), { type: 'event/add', event: INPUT }, CTX);
    const result = migrate(JSON.parse(JSON.stringify(state)));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state).toEqual(state);
  });

  it('upgrades synthetic v1 data: events become imported, prefs defaults fill in', () => {
    const result = migrate(V1_FIXTURE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.schemaVersion).toBe(2);
    expect(result.state.events[0].source).toBe('imported');
    expect(result.state.events[0].createdAt).toBe('2026-10-04T09:00:00Z');
    expect(result.state.events[0].note).toBe('بيانات قديمة');
    expect(result.state.prefs).toEqual({
      locale: 'ar',
      tz: 'UTC',
      lateToleranceHours: 6,
      restPreferenceDays: 7,
    });
  });

  it('refuses unknown versions with an explicit error', () => {
    const result = migrate({ schemaVersion: 3, events: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('version-unsupported');
  });

  it('refuses non-objects', () => {
    for (const garbage of [null, 42, 'text', []]) {
      const result = migrate(garbage);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].code).toBe('not-an-object');
    }
  });

  it('refuses malformed v1 with a path-qualified schema-mismatch', () => {
    const result = migrate({ ...V1_FIXTURE, events: [{ ...V1_FIXTURE.events[0], siteId: 'neck' }] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].code).toBe('schema-mismatch');
  });
});
