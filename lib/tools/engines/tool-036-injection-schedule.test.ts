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
/**
 * G-05 / G-06 / G-07 (audit remediation): the tool must never infer site
 * healing, readiness or medical suitability from elapsed time, and must never
 * treat a *planned* date as a *recorded* use. The guards at the bottom of this
 * file fail if the healing/readiness helpers ever come back.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as engineModule from './tool-036-injection-schedule';
import {
  BODY_SITES,
  bodySiteById,
  siteCeilingMl,
  classifyPain,
  toBadgeLevel,
  assessComfort,
  averageRecent,
  validateRotation,
  accumulationChartSeries,
  ganttRows,
  buildFhirBundle,
  planChronoInjectionSchedule,
  buildRotationPlan,
  ESTER_PROFILES,
  totalWeeklyMg,
  siteRecency,
  nextInjection,
  DEFAULT_ROTATION_SITES,
  type ChronoPlanInput,
  type EsterProfile,
  type InjectionLog,
} from './tool-036-injection-schedule';
import {
  ComfortAssessmentSchema,
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

describe('T34–T36 (replaced) — no readiness/healing inference from elapsed time (G-05, G-07)', () => {
  it('the engine exports no healing-status or 7/14-day recency tone helper', () => {
    expect(Object.keys(engineModule)).not.toContain('healingStatus');
    expect(Object.keys(engineModule)).not.toContain('recencyTone');
    expect(Object.keys(engineModule)).not.toContain('HealingStatus');
  });

  it('the engine source makes no healing-window / healing-readiness claim', () => {
    const raw = readFileSync(
      path.join(process.cwd(), 'lib/tools/engines/tool-036-injection-schedule.ts'),
      'utf8',
    );
    // Strip block and line comments first: the audit-trail comment above is
    // allowed to *name* the removed helpers, the implementation is not.
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    expect(src).not.toMatch(/التعافي|نافذة الالتئام|healing window|healing-window|optimal healing|HealingStatus|healingStatus|recencyTone/i);
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
  it('T50: comfort is a total function across the input domain', () => {
    for (const v of [0, 0.5, 2, 5, 5.01, 12]) {
      for (const p of [0, 5, 10]) {
        expect(() => assessComfort(v, 'vastus-l', p)).not.toThrow();
      }
    }
  });
});

/* ------------------------------------------------------------ Zod contracts */

describe('LEVEL 2/3 Zod schemas', () => {
  it('comfort assessment schema accepts a real assessment', () => {
    expect(ComfortAssessmentSchema.safeParse(assessComfort(1.0, 'deltoid-l', 0)).success).toBe(true);
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

describe('V3 engine — weekly calendar helpers', () => {
  const DAY = 864e5;

  it('totalWeeklyMg sums every compound weekly dose', () => {
    expect(totalWeeklyMg([{ weeklyDoseMg: 500 }, { weeklyDoseMg: 250 }])).toBe(750);
    expect(totalWeeklyMg([])).toBe(0);
  });

  it('siteRecency reports days since each site was used', () => {
    const logs: InjectionLog[] = [{ siteId: 'ventro-l', dayIndex: 4 }];
    expect(siteRecency(logs, 7)).toEqual({ 'ventro-l': 3 });
    expect(siteRecency([], 7)).toEqual({});
  });

  it('siteRecency keeps the most recent use and clamps negatives to 0', () => {
    const logs: InjectionLog[] = [
      { siteId: 'ventro-l', dayIndex: 1 },
      { siteId: 'ventro-l', dayIndex: 6 },
      { siteId: 'deltoid-l', dayIndex: 9 },
    ];
    expect(siteRecency(logs, 7)).toEqual({ 'ventro-l': 1, 'deltoid-l': 0 });
  });

  it('recency is a recorded-fact lookup: no logs means no recency at all (G-06)', () => {
    // The tool renders this with an empty list of *recorded* uses, so every
    // site is simply unknown — never "ready", "healing" or "used".
    expect(siteRecency([], 3)).toEqual({});
    expect(siteRecency([], 0)).toEqual({});
  });

  it('nextInjection counts down to the next shot day', () => {
    expect(nextInjection(0, [0, 4])).toEqual({ msRemaining: 4 * DAY, dayIndex: 4, overdue: false });
  });

  it('nextInjection wraps into the following week', () => {
    expect(nextInjection(5 * DAY, [0, 4])).toEqual({ msRemaining: 2 * DAY, dayIndex: 0, overdue: false });
  });

  it('nextInjection flags overdue when nothing is scheduled', () => {
    expect(nextInjection(0, [])).toEqual({ msRemaining: 0, dayIndex: 0, overdue: true });
  });

  it('DEFAULT_ROTATION_SITES starts L glute -> R glute -> Ventro', () => {
    expect(DEFAULT_ROTATION_SITES).toHaveLength(8);
    expect(DEFAULT_ROTATION_SITES[0]).toBe('dorso-l');
    expect(DEFAULT_ROTATION_SITES[1]).toBe('dorso-r');
    expect(DEFAULT_ROTATION_SITES[2]).toBe('ventro-l');
  });

  it('rotation engine auto-advances through the default order', () => {
    const plan = buildRotationPlan([...DEFAULT_ROTATION_SITES], [], 1);
    expect(plan[0].entries.map((e) => e.site)).toEqual(['dorso-l', 'dorso-r']);
  });
});
