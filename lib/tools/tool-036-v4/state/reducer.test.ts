/**
 * Tool-036 V4 — reducer tests (design-v4-ar.md gate C2.1).
 * The reducer is the only mutation path; these tests pin purity,
 * determinism and the schema invariant.
 */
import { describe, it, expect } from 'vitest';
import { applyAction, initialState, type ReducerContext } from './reducer';
import type { AppState, NewEventInput } from '../contracts';

const CTX: ReducerContext = { now: '2026-10-18T10:00:00+03:00', idGen: () => 'fixed-id-1' };

const INPUT: NewEventInput = {
  occurredAt: '2026-10-18T08:00:00+03:00',
  siteId: 'dorso-l',
  volumeMl: 1,
  doseMg: 125,
  compoundIds: ['testosterone-enanthate'],
  painScore: 4,
};

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}

describe('V4 reducer — C2.1 purity and determinism', () => {
  it('does not mutate its input state', () => {
    const state = deepFreeze(initialState('ar', 'Asia/Riyadh'));
    const before = structuredClone(state);
    const next = applyAction(state, { type: 'event/add', event: INPUT }, CTX);
    expect(state).toEqual(before);
    expect(next).not.toBe(state);
  });

  it('is deterministic: same state + action + ctx -> identical result', () => {
    const state = initialState('ar', 'Asia/Riyadh');
    const a = applyAction(state, { type: 'event/add', event: INPUT }, CTX);
    const b = applyAction(state, { type: 'event/add', event: INPUT }, CTX);
    expect(a).toEqual(b);
  });

  it('assigns id, createdAt and source from the injected context — never the clock', () => {
    const next = applyAction(initialState('ar', 'UTC'), { type: 'event/add', event: INPUT }, CTX);
    const [event] = next.events;
    expect(event.id).toBe('fixed-id-1');
    expect(event.createdAt).toBe(CTX.now);
    expect(event.source).toBe('logged');
  });

  it('normalises notes to NFC at the boundary', () => {
    const decomposed = 'é'.normalize('NFD'); // same grapheme, decomposed form
    const next = applyAction(
      initialState('ar', 'UTC'),
      { type: 'event/add', event: { ...INPUT, note: decomposed } },
      CTX,
    );
    expect(next.events[0].note).toBe(decomposed.normalize('NFC'));
    expect(next.events[0].note).toBe('é'); // precomposed é
  });
});

describe('V4 reducer — schema invariant', () => {
  it('throws instead of producing an invalid state (bypassing types on purpose)', () => {
    const state = initialState('ar', 'UTC');
    const forged = { type: 'event/add', event: { ...INPUT, painScore: 42 } } as never;
    expect(() => applyAction(state, forged, CTX)).toThrow(/invariant violated/);
  });

  it('keeps prefs valid when acknowledging', () => {
    const next = applyAction(initialState('en', 'UTC'), { type: 'ack/set', at: CTX.now }, CTX);
    expect(next.prefs.acknowledgedAt).toBe(CTX.now);
  });
});

describe('V4 reducer — plan / import / reset', () => {
  it('replaces the plan atomically', () => {
    const state = initialState('ar', 'UTC');
    const plan = {
      compounds: [
        { compoundId: 'testosterone-cypionate', weeklyDoseMg: 200, concentrationMgMl: 100, injectionsPerWeek: 3 },
      ],
      preferredSites: ['ventro-l', 'ventro-r'],
      rotationMode: 'fixed-order' as const,
    };
    const next = applyAction(state, { type: 'plan/replace', plan }, CTX);
    expect(next.plan.compounds[0].compoundId).toBe('testosterone-cypionate');
  });

  it('import/merge dedupes by id and sorts by occurredAt', () => {
    const state = applyAction(initialState('ar', 'UTC'), { type: 'event/add', event: INPUT }, CTX);
    const imported = [
      { ...INPUT, id: 'fixed-id-1', createdAt: CTX.now, source: 'imported' as const },
      {
        ...INPUT,
        id: 'evt-2',
        occurredAt: '2026-10-11T08:00:00+03:00',
        createdAt: CTX.now,
        source: 'imported' as const,
      },
    ];
    const next = applyAction(state, { type: 'import/merge', events: imported }, CTX);
    expect(next.events.map((e) => e.id)).toEqual(['evt-2', 'fixed-id-1']);
  });

  it('data/reset clears events but preserves locale and timezone', () => {
    const state = applyAction(initialState('ar', 'Asia/Riyadh'), { type: 'event/add', event: INPUT }, CTX);
    const next: AppState = applyAction(state, { type: 'data/reset' }, CTX);
    expect(next.events).toHaveLength(0);
    expect(next.prefs.locale).toBe('ar');
    expect(next.prefs.tz).toBe('Asia/Riyadh');
  });
});
