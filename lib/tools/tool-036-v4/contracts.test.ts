/**
 * Tool-036 V4 — contract tests (design-v4-ar.md §2, gate C1.1).
 * zod schemas are normative; every type that crosses a boundary (storage,
 * import file, engine output) must parse here.
 */
import { describe, it, expect } from 'vitest';
import {
  appStateSchema,
  driftReportSchema,
  exportEnvelopeSchema,
  injectionEventSchema,
  isoDateTimeSchema,
  medicalRuleSchema,
  planSpecSchema,
  prefsSchema,
  type AppState,
} from './contracts';

const EVENT = {
  id: 'evt-1',
  occurredAt: '2026-10-18T08:00:00+03:00',
  siteId: 'dorso-l',
  volumeMl: 1,
  doseMg: 125,
  compoundIds: ['testosterone-enanthate'],
  painScore: 3,
  note: 'ألم خفيف',
  source: 'logged' as const,
  createdAt: '2026-10-18T09:10:00+03:00',
};

const STATE: AppState = {
  schemaVersion: 2,
  events: [EVENT],
  plan: {
    compounds: [
      { compoundId: 'testosterone-enanthate', weeklyDoseMg: 250, concentrationMgMl: 250, injectionsPerWeek: 2 },
    ],
    preferredSites: ['dorso-l', 'dorso-r', 'ventro-l'],
    rotationMode: 'least-recently-used',
  },
  prefs: { locale: 'ar', tz: 'Asia/Riyadh', lateToleranceHours: 6, restPreferenceDays: 7 },
};

describe('V4 contracts — acceptance C1.1 round-trips', () => {
  it('parses a valid injection event (Arabic note, explicit offset)', () => {
    expect(injectionEventSchema.safeParse(EVENT).success).toBe(true);
  });

  it('parses a valid full app state', () => {
    expect(appStateSchema.safeParse(STATE).success).toBe(true);
  });

  it('parses a valid plan and prefs', () => {
    expect(planSpecSchema.safeParse(STATE.plan).success).toBe(true);
    expect(prefsSchema.safeParse(STATE.prefs).success).toBe(true);
  });

  it('parses a valid export envelope', () => {
    const envelope = {
      format: 'tool-036-export',
      schemaVersion: 2,
      exportedAt: '2026-10-18T12:00:00Z',
      checksum: 'a'.repeat(64),
      payload: { events: [EVENT], plan: STATE.plan, locale: 'ar' },
    };
    expect(exportEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });
});

describe('V4 contracts — boundary rejections', () => {
  it('rejects naive local timestamps (no offset)', () => {
    expect(isoDateTimeSchema.safeParse('2026-10-18T08:00:00').success).toBe(false);
    expect(isoDateTimeSchema.safeParse('2026-10-18T08:00:00+03:00').success).toBe(true);
    expect(isoDateTimeSchema.safeParse('2026-10-18T08:00:00Z').success).toBe(true);
  });

  it('rejects out-of-range or fractional pain scores', () => {
    expect(injectionEventSchema.safeParse({ ...EVENT, painScore: 11 }).success).toBe(false);
    expect(injectionEventSchema.safeParse({ ...EVENT, painScore: -1 }).success).toBe(false);
    expect(injectionEventSchema.safeParse({ ...EVENT, painScore: 4.5 }).success).toBe(false);
  });

  it('rejects unknown site ids', () => {
    expect(injectionEventSchema.safeParse({ ...EVENT, siteId: 'neck-left' }).success).toBe(false);
  });

  it('rejects non-positive volumes and doses', () => {
    expect(injectionEventSchema.safeParse({ ...EVENT, volumeMl: 0 }).success).toBe(false);
    expect(injectionEventSchema.safeParse({ ...EVENT, doseMg: -5 }).success).toBe(false);
  });

  it('rejects a wrong schema version', () => {
    expect(appStateSchema.safeParse({ ...STATE, schemaVersion: 1 }).success).toBe(false);
  });

  it('rejects a malformed checksum', () => {
    const envelope = {
      format: 'tool-036-export',
      schemaVersion: 2,
      exportedAt: '2026-10-18T12:00:00Z',
      checksum: 'not-a-sha',
      payload: { events: [EVENT], plan: STATE.plan, locale: 'ar' },
    };
    expect(exportEnvelopeSchema.safeParse(envelope).success).toBe(false);
  });

  it('rejects an injections-per-week outside 1..4', () => {
    const bad = { ...STATE.plan, compounds: [{ ...STATE.plan.compounds[0], injectionsPerWeek: 5 }] };
    expect(planSpecSchema.safeParse(bad).success).toBe(false);
  });
});

describe('V4 contracts — decision R5 (no composite score)', () => {
  it('driftReportSchema exposes itemised fields only — no score/rating key', () => {
    const keys = Object.keys(driftReportSchema.shape);
    expect(keys.sort()).toEqual(['computedAt', 'items', 'summary', 'windowEnd', 'windowStart']);
    const summaryKeys = Object.keys(driftReportSchema.shape.summary.shape).sort();
    expect(summaryKeys).toEqual(['extra', 'late', 'matched', 'missed', 'siteChanged']);
    expect(keys.concat(summaryKeys).some((k) => /score|rating|index|percent/i.test(k))).toBe(false);
  });

  it('a well-formed medical rule parses with all provenance fields', () => {
    const rule = {
      ruleId: 'x',
      kind: 'medical',
      claimEn: 'c',
      claimAr: 'c',
      source: { type: 'secondary', ref: 'r', confidence: 'Low' },
      applicabilityEn: 'a',
      applicabilityAr: 'a',
      status: 'active',
    };
    expect(medicalRuleSchema.safeParse(rule).success).toBe(true);
  });
});
