// lib/tools/r6/tool-046-trt-lifetime-contract.test.ts
//
// The contract + sync test for Tool 046. It proves three things that a
// screenshot cannot:
//
//   1. the mirrored, non-clinical constants still describe what the unchanged
//      V6 engine (`projectTrtLifetime`) actually does — the monitoring cadence,
//      the per-method dosing interval, the age bands, the cost arithmetic, the
//      warning triggers and the input bounds;
//   2. the draft evaluation cannot drift from the canonical Zod input contract
//      (EMPTY → INVALID → PARTIAL → READY), and a typed zero is never treated
//      as an empty field;
//   3. nothing is invented: no source, no clinical referral wording and no
//      dosing or cost "reference range".
import { describe, expect, it } from 'vitest';
import { TrtLifetimeInputSchema } from '@/lib/tools/schemas/tool-046-trt-lifetime';
import { projectTrtLifetime } from '@/lib/tools/engines/tool-046-trt-lifetime';
import { requireTool } from '@/lib/tools/registry';
import {
  TOOL_046_CROSS_TOOL_LINKS,
  TOOL_046_LIMITS,
  TOOL_046_SOURCES,
  ageBandLabelKey,
  annualPanels,
  buildTrtLifetimeCsv,
  clamp,
  dosingIntervalDays,
  evaluateTrtLifetimeDraft,
  formatCount,
  formatInterval,
  formatUsd,
  horizonCost,
  warningLabelKey,
  type Tool046Draft,
} from './tool-046-trt-lifetime-contract';

const baseInput = {
  age: 42,
  method: 'injection' as const,
  weekly_testosterone_mg: 150,
  years_on_trt: 3.5,
  monthly_med_cost_usd: 40,
  monitoring_annual_cost_usd: 300,
};

const emptyDraft: Tool046Draft = {
  age: '',
  method: '',
  weeklyMg: '',
  yearsOnTrt: '',
  monthlyCost: '',
  monitoringCost: '',
};

const readyDraft: Tool046Draft = {
  age: '42',
  method: 'injection',
  weeklyMg: '150',
  yearsOnTrt: '3.5',
  monthlyCost: '40',
  monitoringCost: '300',
};

describe('Tool 046 contract — mirrored constants match the frozen engine', () => {
  it('reproduces the monitoring cadence boundaries', () => {
    const panels = (years: number) =>
      projectTrtLifetime({ ...baseInput, years_on_trt: years }).annual_bloodwork_panels;

    expect(panels(0)).toBe(3);
    expect(panels(0.5)).toBe(3);
    expect(panels(1)).toBe(2);
    expect(panels(2.9)).toBe(2);
    expect(panels(3)).toBe(1);
    expect(panels(60)).toBe(1);

    expect(annualPanels(0)).toBe(3);
    expect(annualPanels(1)).toBe(2);
    expect(annualPanels(3)).toBe(1);
  });

  it('reproduces the per-method dosing interval', () => {
    for (const method of ['injection', 'gel', 'cream'] as const) {
      expect(projectTrtLifetime({ ...baseInput, method }).injection_interval_days).toBe(
        dosingIntervalDays(method),
      );
    }
    expect(projectTrtLifetime({ ...baseInput, method: 'injection' }).injection_interval_days).toBe(3.5);
    expect(projectTrtLifetime({ ...baseInput, method: 'gel' }).injection_interval_days).toBe(1);
    expect(projectTrtLifetime({ ...baseInput, method: 'cream' }).injection_interval_days).toBe(1);
  });

  it('reproduces the age-band boundaries', () => {
    const band = (age: number) => projectTrtLifetime({ ...baseInput, age }).age_band;
    expect(band(18)).toBe('under-40');
    expect(band(39)).toBe('under-40');
    expect(band(40)).toBe('40-55');
    expect(band(54)).toBe('40-55');
    expect(band(55)).toBe('55-plus');
    expect(band(90)).toBe('55-plus');
  });

  it('reproduces the horizon cost arithmetic for all three horizons', () => {
    const result = projectTrtLifetime(baseInput);
    expect(result.cost_projection.horizon10.total_cost_usd).toBe(horizonCost(40, 300, 10));
    expect(result.cost_projection.horizon20.total_cost_usd).toBe(horizonCost(40, 300, 20));
    expect(result.cost_projection.horizon30.total_cost_usd).toBe(horizonCost(40, 300, 30));
    expect(horizonCost(40, 300, 10)).toBe(7800);
    expect(horizonCost(90, 400, 10)).toBe(14800);
    expect(horizonCost(0, 0, 10)).toBe(0);
  });

  it('reproduces the three warning triggers and only those', () => {
    const clean = projectTrtLifetime({ ...baseInput, age: 30, weekly_testosterone_mg: 100 });
    expect(clean.warnings).toEqual([]);

    expect(projectTrtLifetime({ ...baseInput, age: 40 }).warnings).toContain(
      'age_40_plus_cardio_monitoring',
    );
    expect(projectTrtLifetime({ ...baseInput, years_on_trt: 5 }).warnings).toContain(
      'long_term_annual_full_panel',
    );
    expect(projectTrtLifetime({ ...baseInput, weekly_testosterone_mg: 250 }).warnings).toContain(
      'high_dose_not_trt_range',
    );

    expect(TOOL_046_LIMITS.warningAgeAtLeast).toBe(40);
    expect(TOOL_046_LIMITS.warningYearsOnTrtAtLeast).toBe(5);
    expect(TOOL_046_LIMITS.warningWeeklyMgAbove).toBe(200);
  });

  it('mirrors the input bounds of the canonical schema', () => {
    const parse = (patch: Record<string, unknown>) =>
      TrtLifetimeInputSchema.safeParse({ ...baseInput, ...patch }).success;

    expect(parse({ age: TOOL_046_LIMITS.ageMin })).toBe(true);
    expect(parse({ age: TOOL_046_LIMITS.ageMax })).toBe(true);
    expect(parse({ age: TOOL_046_LIMITS.ageMin - 1 })).toBe(false);
    expect(parse({ age: TOOL_046_LIMITS.ageMax + 1 })).toBe(false);

    expect(parse({ weekly_testosterone_mg: TOOL_046_LIMITS.weeklyMgMin })).toBe(true);
    expect(parse({ weekly_testosterone_mg: TOOL_046_LIMITS.weeklyMgMax })).toBe(true);
    expect(parse({ weekly_testosterone_mg: TOOL_046_LIMITS.weeklyMgMin - 1 })).toBe(false);
    expect(parse({ weekly_testosterone_mg: TOOL_046_LIMITS.weeklyMgMax + 1 })).toBe(false);

    expect(parse({ years_on_trt: TOOL_046_LIMITS.yearsOnTrtMin })).toBe(true);
    expect(parse({ years_on_trt: TOOL_046_LIMITS.yearsOnTrtMax })).toBe(true);
    expect(parse({ years_on_trt: TOOL_046_LIMITS.yearsOnTrtMax + 1 })).toBe(false);

    expect(parse({ monthly_med_cost_usd: TOOL_046_LIMITS.monthlyCostMax })).toBe(true);
    expect(parse({ monthly_med_cost_usd: TOOL_046_LIMITS.monthlyCostMax + 1 })).toBe(false);
    expect(parse({ monitoring_annual_cost_usd: TOOL_046_LIMITS.monitoringCostMax })).toBe(true);
    expect(parse({ monitoring_annual_cost_usd: TOOL_046_LIMITS.monitoringCostMax + 1 })).toBe(false);
    expect(parse({ method: 'tablet' })).toBe(false);
    expect(TOOL_046_LIMITS.unit).toBe('USD');
    expect(TOOL_046_LIMITS.horizons).toEqual([10, 20, 30]);
  });

  it('maps every warning the engine can emit, and never prints a raw code', () => {
    const surfaced = new Set<string>();
    for (const patch of [
      { age: 40 },
      { years_on_trt: 5 },
      { weekly_testosterone_mg: 250 },
    ]) {
      for (const warning of projectTrtLifetime({ ...baseInput, ...patch }).warnings) {
        surfaced.add(warning);
      }
    }

    expect(surfaced.size).toBe(3);
    for (const code of surfaced) {
      const key = warningLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('warning_')).toBe(true);
    }
    expect(warningLabelKey('a_code_that_does_not_exist')).toBe('warning_unknown');
  });

  it('maps every age band the engine can emit', () => {
    for (const band of ['under-40', '40-55', '55-plus']) {
      const key = ageBandLabelKey(band);
      expect(key).not.toBe(band);
      expect(key.startsWith('age_band_')).toBe(true);
    }
    expect(ageBandLabelKey('unknown-band')).toBe('age_band_unknown');
  });

  it('formats dollars, counts and intervals without inventing precision', () => {
    expect(formatUsd(7800)).toBe('$7,800');
    expect(formatUsd(0)).toBe('$0');
    expect(formatUsd(Number.NaN)).toBe('—');
    expect(formatCount(3)).toBe('3');
    expect(formatCount(Number.NaN)).toBe('—');
    expect(formatInterval(3.5)).toBe('3.5');
    expect(formatInterval(1)).toBe('1');
    expect(formatInterval(Number.NaN)).toBe('—');
    expect(clamp(10, 18, 90)).toBe(18);
    expect(clamp(100, 18, 90)).toBe(90);
    expect(clamp(42, 18, 90)).toBe(42);
  });
});

describe('Tool 046 contract — draft evaluation', () => {
  it('starts EMPTY with no input and no issue', () => {
    const evaluation = evaluateTrtLifetimeDraft(emptyDraft);
    expect(evaluation.state).toBe('EMPTY');
    expect(evaluation.input).toBeNull();
    expect(evaluation.issues).toEqual([]);
  });

  it('stays PARTIAL until every required field is answered', () => {
    for (const patch of [
      { age: '' },
      { method: '' as const },
      { weeklyMg: '' },
      { yearsOnTrt: '' },
      { monthlyCost: '' },
      { monitoringCost: '' },
    ]) {
      expect(evaluateTrtLifetimeDraft({ ...readyDraft, ...patch }).state).toBe('PARTIAL');
    }
  });

  it('treats a typed zero as a real value, not as "not answered"', () => {
    const evaluation = evaluateTrtLifetimeDraft({
      ...readyDraft,
      yearsOnTrt: '0',
      monthlyCost: '0',
      monitoringCost: '0',
    });
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input).toEqual({
      age: 42,
      method: 'injection',
      weekly_testosterone_mg: 150,
      years_on_trt: 0,
      monthly_med_cost_usd: 0,
      monitoring_annual_cost_usd: 0,
    });
  });

  it('rejects out-of-range values with an out_of_range issue', () => {
    expect(evaluateTrtLifetimeDraft({ ...readyDraft, age: '17' }).issues).toContainEqual({
      field: 'age',
      code: 'out_of_range',
    });
    expect(evaluateTrtLifetimeDraft({ ...readyDraft, age: '91' }).issues).toContainEqual({
      field: 'age',
      code: 'out_of_range',
    });
    expect(evaluateTrtLifetimeDraft({ ...readyDraft, weeklyMg: '301' }).issues).toContainEqual({
      field: 'weeklyMg',
      code: 'out_of_range',
    });
    expect(evaluateTrtLifetimeDraft({ ...readyDraft, yearsOnTrt: '61' }).issues).toContainEqual({
      field: 'yearsOnTrt',
      code: 'out_of_range',
    });
    expect(evaluateTrtLifetimeDraft({ ...readyDraft, monthlyCost: '1001' }).issues).toContainEqual({
      field: 'monthlyCost',
      code: 'out_of_range',
    });
    expect(
      evaluateTrtLifetimeDraft({ ...readyDraft, monitoringCost: '5001' }).issues,
    ).toContainEqual({ field: 'monitoringCost', code: 'out_of_range' });
  });

  it('rejects non-numeric text in a hand-typed field', () => {
    expect(evaluateTrtLifetimeDraft({ ...readyDraft, age: 'abc' }).issues).toContainEqual({
      field: 'age',
      code: 'invalid_number',
    });
    expect(evaluateTrtLifetimeDraft({ ...readyDraft, monthlyCost: 'x' }).issues).toContainEqual({
      field: 'monthlyCost',
      code: 'invalid_number',
    });
  });

  it('keeps the order EMPTY → INVALID → PARTIAL → READY', () => {
    // An out-of-range value wins over the fact that other fields are missing.
    expect(evaluateTrtLifetimeDraft({ ...emptyDraft, age: '999' }).state).toBe('INVALID');
    // One field is not enough to calculate.
    expect(evaluateTrtLifetimeDraft({ ...emptyDraft, age: '42' }).state).toBe('PARTIAL');
  });

  it('produces a READY input that the canonical schema accepts', () => {
    const evaluation = evaluateTrtLifetimeDraft(readyDraft);
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input).not.toBeNull();
    expect(TrtLifetimeInputSchema.safeParse(evaluation.input).success).toBe(true);
    expect(evaluation.input).toEqual(baseInput);
  });
});

describe('Tool 046 contract — content invariants and CSV', () => {
  it('records no approved source and therefore no citation', () => {
    expect(TOOL_046_SOURCES).toEqual([]);
  });

  it('links only to real registered tools and transfers nothing automatically', () => {
    expect(TOOL_046_CROSS_TOOL_LINKS.length).toBeGreaterThan(0);
    for (const link of TOOL_046_CROSS_TOOL_LINKS) {
      expect(() => requireTool(link.targetToolId)).not.toThrow();
      expect(link.transfer).toBe('manual-reentry');
      expect(link.freshnessRule).toMatch(/protocol start date|last-dose date/i);
      expect(link.mappedFields.length).toBeGreaterThan(0);
    }
  });

  it('builds a CSV with the inputs, the result and no session identifier', () => {
    const result = projectTrtLifetime(baseInput);
    const csv = buildTrtLifetimeCsv(baseInput, result, '2026-11-16T10:00:00.000Z');
    expect(csv).toContain('tool,tool-046-trt-lifetime');
    expect(csv).toContain('age,42');
    expect(csv).toContain('method,injection');
    expect(csv).toContain('weekly_testosterone_mg,150');
    expect(csv).toContain('injection_interval_days,3.5');
    expect(csv).toContain('annual_bloodwork_panels,1');
    expect(csv).toContain('age_band,40-55');
    expect(csv).toContain('10,7800');
    expect(csv).toContain('20,15600');
    expect(csv).toContain('30,23400');
    expect(csv).not.toMatch(/session|user|token|email/i);
  });
});
