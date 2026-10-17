/**
 * Tool #036 v2 — CHRONO-INJECT OS engine contract tests (TDD, written BEFORE implementation).
 * Maps to docs/tool-036-v2-spec.md §6 test cases T01–T23 (T24 deferred: validation out of P1 scope;
 * T25 is a build/bundle gate, not a unit test).
 *
 * Pure engine only — no I/O, no Date.now(), deterministic.
 */
import { describe, it, expect } from 'vitest';
import {
  classifyVolumeZone,
  siteCeilingMl,
  recommendCadence,
  planChronoInjectionSchedule,
  simulatePk,
  simulateAccumulation,
  detectRedFlags,
  reflowMissedDose,
  buildRotationPlan,
  collectProvenance,
  ESTER_PROFILES,
  type ChronoPlanInput,
  type EsterProfile,
} from './tool-036-injection-schedule';
import {
  ChronoPlanInputSchema,
  ChronoResultSchema,
} from '../schemas/tool-036-injection-schedule';

const ENANTHATE: EsterProfile = ESTER_PROFILES['testosterone-enanthate'];
const UNDECANOATE: EsterProfile = ESTER_PROFILES['testosterone-undecanoate'];

const baseInput: ChronoPlanInput = {
  compounds: [
    { compoundId: 'testosterone-enanthate', name_en: 'Testosterone Enanthate', weekly_dose_mg: 200, concentration_mg_ml: 250, injections_per_week: 2 },
  ],
  rotation_sites: ['gluteal-L', 'gluteal-R', 'deltoid-L', 'deltoid-R'],
};

describe('T01–T02 scheduling', () => {
  it('T01: a 2x/week compound yields exactly 2 shots', () => {
    const r = planChronoInjectionSchedule(baseInput);
    expect(r.shots).toHaveLength(2);
  });

  it('T02: dose is split evenly and volume = dose / concentration', () => {
    const r = planChronoInjectionSchedule(baseInput);
    for (const s of r.shots) {
      expect(s.dose_mg).toBe(100);
      expect(s.volume_ml).toBe(0.4);
    }
  });
});

describe('T03–T06, T21–T22 volume guard zones', () => {
  it('T03: 1.0 mL in deltoid is green', () => {
    expect(classifyVolumeZone(1.0, 'deltoid-L').zone).toBe('green');
  });
  it('T04: 2.5 mL in gluteal is yellow with a Limited-Evidence reference', () => {
    const r = classifyVolumeZone(2.5, 'gluteal-L');
    expect(r.zone).toBe('yellow');
    expect(r.evidence.evidenceId).toBeTruthy();
    expect(r.evidence.confidence).toBe('Moderate');
  });
  it('T05: 6.0 mL is red', () => {
    expect(classifyVolumeZone(6.0, 'gluteal-L').zone).toBe('red');
  });
  it('T06: deltoid above its ~1 mL ceiling raises a site-ceiling warning', () => {
    const r = planChronoInjectionSchedule({
      compounds: [{ compoundId: 'testosterone-enanthate', name_en: 'Test E', weekly_dose_mg: 300, concentration_mg_ml: 200, injections_per_week: 1 }],
      rotation_sites: ['deltoid-L'],
    });
    expect(r.warnings.some((w) => w.kind === 'site-ceiling')).toBe(true);
  });
  it('T21: exactly 2.0 mL is green (boundary)', () => {
    expect(classifyVolumeZone(2.0, 'gluteal-L').zone).toBe('green');
  });
  it('T22: exactly 5.0 mL is yellow (boundary)', () => {
    expect(classifyVolumeZone(5.0, 'gluteal-L').zone).toBe('yellow');
  });
  it('site ceiling: deltoid is lower than gluteal', () => {
    expect(siteCeilingMl('deltoid-L').ceilingMl).toBeLessThan(siteCeilingMl('gluteal-L').ceilingMl);
  });
});

describe('T07 weekly per-site cap', () => {
  it('T07: two 2 mL shots into the same site exceed the weekly cap', () => {
    const r = planChronoInjectionSchedule({
      compounds: [{ compoundId: 'testosterone-enanthate', name_en: 'Test E', weekly_dose_mg: 1000, concentration_mg_ml: 250, injections_per_week: 2 }],
      rotation_sites: ['gluteal-L'],
    });
    expect(r.warnings.some((w) => w.kind === 'weekly-cap')).toBe(true);
  });
});

describe('T08–T09 half-life aware cadence', () => {
  it('T08: propionate (short t1/2) recommends every-other-day', () => {
    const c = recommendCadence(0.8);
    expect(c.label).toBe('EOD');
    expect(c.injectionsPerWeek).toBe(4);
  });
  it('T09: enanthate recommends 2x/week', () => {
    const c = recommendCadence(4.5);
    expect(c.label).toBe('2x/week');
    expect(c.injectionsPerWeek).toBe(2);
  });
});

describe('T10–T12 PK & accumulation', () => {
  it('T10: PK levels are non-negative and decay between doses', () => {
    const pk = simulatePk(ENANTHATE, { weeklyDoseMg: 200, injectionsPerWeek: 2 }, 14);
    expect(pk.length).toBeGreaterThan(0);
    for (const p of pk) expect(p.levelRel).toBeGreaterThanOrEqual(0);
    // doses on day 0 and day 3 => days 1 and 2 must decay
    expect(pk[1].levelRel).toBeGreaterThan(pk[2].levelRel);
  });
  it('T11: enanthate reaches steady state within 8 weeks', () => {
    const acc = simulateAccumulation(ENANTHATE, { weeklyDoseMg: 200, injectionsPerWeek: 2 }, 8);
    expect(acc.some((p) => p.steadyStateReached)).toBe(true);
  });
  it('T12: undecanoate (long t1/2) accumulates higher and is not yet at steady state in 8 weeks', () => {
    const enan = simulateAccumulation(ENANTHATE, { weeklyDoseMg: 200, injectionsPerWeek: 2 }, 8);
    const unde = simulateAccumulation(UNDECANOATE, { weeklyDoseMg: 200, injectionsPerWeek: 2 }, 8);
    const enanLast = enan[enan.length - 1];
    const undeLast = unde[unde.length - 1];
    expect(undeLast.levelRel).toBeGreaterThan(enanLast.levelRel);
    expect(undeLast.steadyStateReached).toBe(false);
  });
});

describe('T13–T16 red flags & non-clinical', () => {
  it('T13: a high weekly total volume raises a red flag', () => {
    const flags = detectRedFlags({ shots: [], total_volume_ml_per_week: 12, perSite: {}, nonClinicalCompounds: [] });
    expect(flags.some((f) => f.code === 'high-total-volume')).toBe(true);
  });
  it('T14: reusing one site within a week raises a rotation red flag', () => {
    const r = planChronoInjectionSchedule({
      compounds: [{ compoundId: 'testosterone-enanthate', name_en: 'Test E', weekly_dose_mg: 400, concentration_mg_ml: 250, injections_per_week: 2 }],
      rotation_sites: ['gluteal-L'],
    });
    expect(r.redFlags.some((f) => f.code === 'site-reuse-under-7d')).toBe(true);
  });
  it('T16: a non-clinical ester is flagged and never label-backed', () => {
    const r = planChronoInjectionSchedule({
      compounds: [{ compoundId: 'trenbolone-acetate', name_en: 'Trenbolone Acetate', weekly_dose_mg: 300, concentration_mg_ml: 100, injections_per_week: 3 }],
      rotation_sites: ['gluteal-L', 'gluteal-R'],
    });
    expect(r.nonClinicalCompounds).toContain('Trenbolone Acetate');
    expect(r.warnings.some((w) => w.kind === 'non-clinical')).toBe(true);
  });
});

describe('T15, T17–T18 missed dose, provenance, determinism', () => {
  it('T15: reflowing a missed dose is deterministic and removes the missed day', () => {
    const r = planChronoInjectionSchedule(baseInput);
    const a = reflowMissedDose(r, r.shots[0].day, ENANTHATE);
    const b = reflowMissedDose(r, r.shots[0].day, ENANTHATE);
    expect(a.shots.some((s) => s.day === r.shots[0].day)).toBe(false);
    expect(a.total_volume_ml_per_week).toBe(r.total_volume_ml_per_week);
    expect(a).toEqual(b);
  });
  it('T17: every result carries non-empty provenance', () => {
    const r = planChronoInjectionSchedule(baseInput);
    expect(collectProvenance(r).length).toBeGreaterThan(0);
  });
  it('T18: identical input yields deep-equal output', () => {
    expect(planChronoInjectionSchedule(baseInput)).toEqual(planChronoInjectionSchedule(baseInput));
  });
});

describe('T23 rotation plan', () => {
  it('T23: no site is reused within 7 days', () => {
    const plan = buildRotationPlan(['gluteal-L', 'gluteal-R'], [], 12);
    const lastUse: Record<string, number> = {};
    for (const week of plan) {
      for (const entry of week.entries) {
        const day = week.weekIndex * 7 + entry.day;
        if (lastUse[entry.site] !== undefined) expect(day - lastUse[entry.site]).toBeGreaterThanOrEqual(7);
        lastUse[entry.site] = day;
      }
    }
  });
});

describe('T19–T20 Zod schemas', () => {
  it('T19: rejects negative dose and injections_per_week > 7', () => {
    const bad = { compounds: [{ name_en: 'X', weekly_dose_mg: -10, concentration_mg_ml: 250, injections_per_week: 9 }], rotation_sites: ['gluteal-L'] };
    expect(ChronoPlanInputSchema.safeParse(bad).success).toBe(false);
  });
  it('T20: rejects a shot with an empty evidenceId', () => {
    const bad = {
      shots: [{ day: 0, compound_name: 'X', dose_mg: 1, volume_ml: 0.4, site: 'gluteal-L', zone: 'green', evidenceId: '', non_clinical: false }],
      total_volume_ml_per_week: 0.4, busiest_day: 0, perSite: {}, warnings: [], redFlags: [],
      provenance: [{ evidenceId: 'A04', confidence: 'High' }], nonClinicalCompounds: [],
    };
    expect(ChronoResultSchema.safeParse(bad).success).toBe(false);
  });
});
