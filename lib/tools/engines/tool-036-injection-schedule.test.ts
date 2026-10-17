/**
 * Tool #036 v2 — SUPREME LEVEL 2 + LEVEL 3 engine contract tests.
 * Written BEFORE implementation (TDD: RED -> GREEN).
 *
 * Maps to docs/tool-036-v2-spec.md continuation, cases T26–T50.
 * Pure engine only — no I/O, no Date.now(), no Math.random(), deterministic.
 *
 * LEVEL 2: body-site registry, comfort factors, personal logger, rotation validation.
 * LEVEL 3: accumulation chart series, Gantt rows, FHIR bundle export.
 */
import { describe, it, expect } from 'vitest';
import {
  BODY_SITES,
  bodySiteById,
  siteCeilingMl,
  classifyPain,
  toBadgeLevel,
  assessComfort,
  healingStatus,
  averageRecent,
  validateRotation,
  accumulationChartSeries,
  ganttRows,
  buildFhirBundle,
  planChronoInjectionSchedule,
  buildRotationPlan,
  ESTER_PROFILES,
  type ChronoPlanInput,
  type EsterProfile,
} from './tool-036-injection-schedule';
import {
  ComfortAssessmentSchema,
  HealingStatusSchema,
  RotationViolationSchema,
  FhirBundleSchema,
} from '../schemas/tool-036-injection-schedule';

const ENANTHATE: EsterProfile = ESTER_PROFILES['testosterone-enanthate'];
const PK_ITEM = { weeklyDoseMg: 200, injectionsPerWeek: 2 };

/* ------------------------------------------------------------------ LEVEL 2 */

describe('T26–T29 body-site registry (8 sites, SVG tap targets)', () => {
  it('T26: exactly 8 injection sites are registered', () => {
    expect(BODY_SITES).toHaveLength(8);
  });

  it('T27: every site id is unique and covers 4 regions x 2 sides', () => {
    const ids = BODY_SITES.map((s) => s.siteId);
    expect(new Set(ids).size).toBe(8);
    for (const region of ['ventro', 'dorso', 'deltoid', 'vastus']) {
      for (const side of ['left', 'right']) {
        expect(BODY_SITES.some((s) => s.region === region && s.side === side)).toBe(true);
      }
    }
  });

  it('T28: deltoid ceiling is the lowest; gluteal-family is the highest', () => {
    const delt = BODY_SITES.find((s) => s.region === 'deltoid')!;
    const ventro = BODY_SITES.find((s) => s.region === 'ventro')!;
    const vastus = BODY_SITES.find((s) => s.region === 'vastus')!;
    expect(delt.ceilingMl).toBeLessThan(vastus.ceilingMl);
    expect(vastus.ceilingMl).toBeLessThan(ventro.ceilingMl);
  });

  it('T29: bodySiteById resolves known ids and rejects unknown ones', () => {
    expect(bodySiteById('deltoid-l')?.labelEn).toBeTruthy();
    expect(bodySiteById('not-a-site')).toBeUndefined();
    // registry ceiling must agree with the P1 site-ceiling helper
    expect(siteCeilingMl('deltoid-l').ceilingMl).toBe(bodySiteById('deltoid-l')!.ceilingMl);
    expect(siteCeilingMl('ventro-l').ceilingMl).toBe(bodySiteById('ventro-l')!.ceilingMl);
  });
});

describe('T30–T33 comfort factors (volume zones + site pain + badge)', () => {
  it('T30: pain bands map 0-10 correctly', () => {
    expect(classifyPain(0).band).toBe('none');
    expect(classifyPain(2).band).toBe('mild');
    expect(classifyPain(5).band).toBe('moderate');
    expect(classifyPain(9).band).toBe('severe');
  });

  it('T31: badge uses Low/Medium/High and maps Confidence accordingly', () => {
    expect(toBadgeLevel('High')).toBe('High');
    expect(toBadgeLevel('Moderate')).toBe('Medium');
    expect(toBadgeLevel('Low')).toBe('Low');
    expect(classifyPain(0).badge).toBe('Low');
    expect(classifyPain(9).badge).toBe('High');
  });

  it('T32: small volume at a fresh site produces a green, low-advisory assessment', () => {
    const c = assessComfort(1.0, 'deltoid-l', 0);
    expect(c.zone).toBe('green');
    expect(c.volumeBadge).toBe('Low');
    expect(c.painBand).toBe('none');
    expect(c.advisories).toHaveLength(0);
    expect(c.evidence.length).toBeGreaterThan(0);
  });

  it('T33: large volume + severe pain raises badges and advisories', () => {
    const c = assessComfort(6.0, 'dorso-l', 9);
    expect(c.zone).toBe('red');
    expect(c.volumeBadge).toBe('High');
    expect(c.painBand).toBe('severe');
    expect(c.painBadge).toBe('High');
    expect(c.advisories.length).toBeGreaterThan(0);
  });
});

describe('T34–T36 personal logger healing window (7d minimum / 14d optimal)', () => {
  it('T34: under the 7-day floor is too-soon', () => {
    expect(healingStatus(3).state).toBe('too-soon');
    expect(healingStatus(6).state).toBe('too-soon');
  });

  it('T35: 7–13 days meets the minimum but is not yet optimal', () => {
    expect(healingStatus(7).state).toBe('minimum-met');
    expect(healingStatus(13).state).toBe('minimum-met');
  });

  it('T36: 14 days or more is optimal', () => {
    expect(healingStatus(14).state).toBe('optimal');
    expect(healingStatus(30).state).toBe('optimal');
    expect(healingStatus(3).messageAr).toBeTruthy();
  });
});

describe('T37–T39 personal logger average (last 5)', () => {
  it('T37: averages only the last 5 entries', () => {
    expect(averageRecent([10, 10, 10, 10, 10, 2])).toBeCloseTo(8.4, 5);
  });

  it('T38: an empty log has no average', () => {
    expect(averageRecent([])).toBeNull();
  });

  it('T39: fewer entries than the window averages what exists', () => {
    expect(averageRecent([4])).toBe(4);
    expect(averageRecent([4, 6])).toBe(5);
  });
});

describe('T40–T43 rotation validation (7-day hard floor, 14-day warning)', () => {
  it('T40: reusing a site under 7 days is a hard error', () => {
    const v = validateRotation([
      { siteId: 'deltoid-l', dayIndex: 0 },
      { siteId: 'deltoid-l', dayIndex: 5 },
    ]);
    expect(v).toHaveLength(1);
    expect(v[0].severity).toBe('error');
    expect(v[0].daysSincePrev).toBe(5);
  });

  it('T41: reuse between 7 and 13 days is a warning', () => {
    const v = validateRotation([
      { siteId: 'deltoid-l', dayIndex: 0 },
      { siteId: 'deltoid-l', dayIndex: 10 },
    ]);
    expect(v).toHaveLength(1);
    expect(v[0].severity).toBe('warning');
  });

  it('T42: 14 days or more produces no violation', () => {
    const v = validateRotation([
      { siteId: 'deltoid-l', dayIndex: 0 },
      { siteId: 'deltoid-l', dayIndex: 14 },
    ]);
    expect(v).toHaveLength(0);
  });

  it('T43: every site in a 2-site 12-week plan satisfies the 7-day floor', () => {
    const plan = buildRotationPlan(['deltoid-l', 'deltoid-r'], [], 12);
    const uses = plan.flatMap((w) => w.entries.map((e) => ({ siteId: e.site, dayIndex: w.weekIndex * 7 + e.day })));
    const violations = validateRotation(uses).filter((x) => x.severity === 'error');
    expect(violations).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ LEVEL 3 */

describe('T44–T46 FHIR bundle export', () => {
  const result = planChronoInjectionSchedule({
    compounds: [
      { compoundId: 'testosterone-enanthate', name_en: 'Testosterone Enanthate', weekly_dose_mg: 200, concentration_mg_ml: 250, injections_per_week: 2 },
    ],
    rotation_sites: ['ventro-l', 'ventro-r'],
  } as ChronoPlanInput);

  it('T44: emits a FHIR collection Bundle', () => {
    const b = buildFhirBundle(result);
    expect(b.resourceType).toBe('Bundle');
    expect(b.type).toBe('collection');
    expect(Array.isArray(b.entry)).toBe(true);
  });

  it('T45: one MedicationAdministration per scheduled shot, each with a resourceType', () => {
    const b = buildFhirBundle(result);
    const admins = b.entry.filter((e) => e.resource.resourceType === 'MedicationAdministration');
    expect(admins).toHaveLength(result.shots.length);
    for (const e of b.entry) expect(e.resource.resourceType).toBeTruthy();
  });

  it('T46: bundle carries the weekly total as an observation value', () => {
    const b = buildFhirBundle(result);
    const obs = b.entry.map((e) => e.resource).find((r) => r.resourceType === 'Observation');
    expect(obs).toBeTruthy();
    expect(String(obs!.valueString ?? obs!.valueQuantity)).toContain(
      String(result.total_volume_ml_per_week),
    );
  });
});

describe('T47–T49 accumulation series + Gantt rows', () => {
  it('T47: chart series has weeks+1 points and rises from start to end', () => {
    const s = accumulationChartSeries(ENANTHATE, PK_ITEM, 8);
    expect(s).toHaveLength(9);
    expect(s[0].weekIndex).toBe(0);
    expect(s[8].level).toBeGreaterThan(s[0].level);
  });

  it('T48: Gantt produces one row per rotation entry', () => {
    const plan = buildRotationPlan(['ventro-l', 'ventro-r'], [], 3);
    const rows = ganttRows(plan);
    expect(rows).toHaveLength(6);
  });

  it('T49: Gantt rows carry week, day and site for mobile arrow navigation', () => {
    const plan = buildRotationPlan(['ventro-l', 'ventro-r'], [], 2);
    const rows = ganttRows(plan);
    for (const r of rows) {
      expect(typeof r.weekIndex).toBe('number');
      expect(typeof r.day).toBe('number');
      expect(r.siteId).toBeTruthy();
    }
  });
});

describe('T50 boundary safety (never throws, deterministic)', () => {
  it('T50: comfort + healing are total functions across the input domain', () => {
    for (const v of [0, 0.5, 2, 5, 5.01, 12]) {
      for (const p of [0, 5, 10]) {
        expect(() => assessComfort(v, 'vastus-l', p)).not.toThrow();
      }
    }
    for (const d of [-1, 0, 7, 14, 1000]) {
      expect(() => healingStatus(d)).not.toThrow();
    }
  });
});

/* ------------------------------------------------------------ Zod contracts */

describe('LEVEL 2/3 Zod schemas', () => {
  it('comfort assessment schema accepts a real assessment', () => {
    expect(ComfortAssessmentSchema.safeParse(assessComfort(1.0, 'deltoid-l', 0)).success).toBe(true);
  });

  it('healing status schema rejects an unknown state', () => {
    const bad = { state: 'instant', daysSince: 1, minDays: 7, optimalDays: 14, messageEn: 'x', messageAr: 'y' };
    expect(HealingStatusSchema.safeParse(bad).success).toBe(false);
  });

  it('rotation violation schema requires a known severity', () => {
    const ok = { siteId: 'a', dayIndex: 1, daysSincePrev: 3, severity: 'error', messageEn: 'e', messageAr: 'a' };
    expect(RotationViolationSchema.safeParse(ok).success).toBe(true);
    expect(RotationViolationSchema.safeParse({ ...ok, severity: 'nope' }).success).toBe(false);
  });

  it('FHIR bundle schema validates the exported bundle', () => {
    const result = planChronoInjectionSchedule({
      compounds: [{ compoundId: 'testosterone-enanthate', name_en: 'Test E', weekly_dose_mg: 200, concentration_mg_ml: 250, injections_per_week: 2 }],
      rotation_sites: ['ventro-l', 'ventro-r'],
    });
    expect(FhirBundleSchema.safeParse(buildFhirBundle(result)).success).toBe(true);
  });
});
