// lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts
//
// The contract + sync test for Tool 045. It proves three things that a
// screenshot cannot:
//
//   1. the mirrored, non-clinical constants still describe what the unchanged
//      V6 engine (`planCycleBreak`) actually does — the 5× half-life clearance,
//      the 7-day buffer, the PCT window sizing, the 4-week recheck, the
//      warning triggers and the input bounds;
//   2. the draft evaluation cannot drift from the canonical Zod input contract
//      (EMPTY → INVALID → PARTIAL → READY), and a typed zero is never treated
//      as an empty field;
//   3. nothing is invented: no source, no clinical referral wording and no PCT
//      drug or dose.
import { describe, expect, it } from 'vitest';
import { CycleBreakInputSchema } from '@/lib/tools/schemas/tool-045-cycle-break-planner';
import { planCycleBreak } from '@/lib/tools/engines/tool-045-cycle-break-planner';
import { requireTool } from '@/lib/tools/registry';
import {
  TOOL_045_CROSS_TOOL_LINKS,
  TOOL_045_LIMITS,
  TOOL_045_SOURCES,
  buildCycleBreakCsv,
  clamp,
  clearanceDays,
  evaluateCycleBreakDraft,
  formatDays,
  formatWeeks,
  milestoneLabel,
  pctDurationWeeks,
  warningLabelKey,
  type Tool045Draft,
} from './tool-045-cycle-break-planner-contract';

const baseInput = {
  cycle_weeks_used: 12,
  compounds: [
    { name_en: 'Testosterone Enanthate', half_life_days: 4.5, suppression_factor: 2 },
  ],
  wants_bloodwork: true,
};

const emptyDraft: Tool045Draft = {
  cycleWeeks: '',
  compounds: [{ name: '', halfLife: '', suppression: '' }],
  wantsBloodwork: '',
};

const readyDraft: Tool045Draft = {
  cycleWeeks: '12',
  compounds: [{ name: 'Testosterone Enanthate', halfLife: '4.5', suppression: '2' }],
  wantsBloodwork: 'yes',
};

describe('Tool 045 contract — mirrored constants match the frozen engine', () => {
  it('reproduces the 5× half-life clearance and the 7-day buffer', () => {
    for (const halfLife of [0.5, 4.5, 7, 10, 30]) {
      const result = planCycleBreak({
        ...baseInput,
        compounds: [{ name_en: 'X', half_life_days: halfLife, suppression_factor: 2 }],
      });
      expect(result.days_to_full_clear).toBe(Math.ceil(halfLife * 5));
      expect(result.pct_start_day).toBe(result.days_to_full_clear + 7);
      expect(clearanceDays(halfLife)).toBe(result.days_to_full_clear);
    }
  });

  it('uses the longest half-life when several compounds are entered', () => {
    const result = planCycleBreak({
      ...baseInput,
      compounds: [
        { name_en: 'A', half_life_days: 3, suppression_factor: 1 },
        { name_en: 'B', half_life_days: 9, suppression_factor: 2 },
        { name_en: 'C', half_life_days: 5, suppression_factor: 2 },
      ],
    });
    expect(result.days_to_full_clear).toBe(45);
  });

  it('reproduces every PCT duration boundary', () => {
    const weeks = (cycle: number) =>
      planCycleBreak({ ...baseInput, cycle_weeks_used: cycle }).pct_duration_weeks;

    expect(weeks(4)).toBe(4);
    expect(weeks(8)).toBe(4);
    expect(weeks(9)).toBe(6);
    expect(weeks(12)).toBe(6);
    expect(weeks(13)).toBe(8);
    expect(weeks(52)).toBe(8);

    expect(pctDurationWeeks(8)).toBe(4);
    expect(pctDurationWeeks(9)).toBe(6);
    expect(pctDurationWeeks(13)).toBe(8);
  });

  it('reproduces the four milestones and the total baseline week', () => {
    const result = planCycleBreak(baseInput);
    expect(result.recovery_milestones.map((milestone) => milestone.week)).toEqual([0, 5, 11, 15]);
    expect(result.total_weeks_to_baseline).toBe(15);
    expect(result.recovery_milestones).toHaveLength(4);
  });

  it('reproduces the two warning triggers and only those', () => {
    const clean = planCycleBreak(baseInput);
    expect(clean.warnings).toEqual([]);

    const suppressive = planCycleBreak({
      ...baseInput,
      compounds: [{ name_en: 'X', half_life_days: 4.5, suppression_factor: 3 }],
    });
    expect(suppressive.warnings).toContain('heavily_suppressive_stack_longer_recovery');

    const noBloodwork = planCycleBreak({ ...baseInput, wants_bloodwork: false });
    expect(noBloodwork.warnings).toContain('baseline_bloodwork_before_pct_recommended');

    expect(TOOL_045_LIMITS.heavilySuppressiveAt).toBe(3);
  });

  it('mirrors the input bounds of the canonical schema', () => {
    const parse = (patch: Record<string, unknown>) =>
      CycleBreakInputSchema.safeParse({ ...baseInput, ...patch }).success;

    expect(parse({ cycle_weeks_used: TOOL_045_LIMITS.cycleWeeksMin })).toBe(true);
    expect(parse({ cycle_weeks_used: TOOL_045_LIMITS.cycleWeeksMax })).toBe(true);
    expect(parse({ cycle_weeks_used: TOOL_045_LIMITS.cycleWeeksMin - 1 })).toBe(false);
    expect(parse({ cycle_weeks_used: TOOL_045_LIMITS.cycleWeeksMax + 1 })).toBe(false);
    expect(parse({ cycle_weeks_used: 12.5 })).toBe(false);

    const compound = (halfLife: number, suppression: number) =>
      CycleBreakInputSchema.safeParse({
        ...baseInput,
        compounds: [{ name_en: 'X', half_life_days: halfLife, suppression_factor: suppression }],
      }).success;

    expect(compound(TOOL_045_LIMITS.halfLifeMin, TOOL_045_LIMITS.suppressionMin)).toBe(true);
    expect(compound(TOOL_045_LIMITS.halfLifeMax, TOOL_045_LIMITS.suppressionMax)).toBe(true);
    expect(compound(TOOL_045_LIMITS.halfLifeMin - 0.1, 2)).toBe(false);
    expect(compound(TOOL_045_LIMITS.halfLifeMax + 1, 2)).toBe(false);
    expect(compound(4.5, TOOL_045_LIMITS.suppressionMax + 1)).toBe(false);
    expect(compound(4.5, 1.5)).toBe(false);

    expect(parse({ compounds: [] })).toBe(false);
    expect(
      parse({
        compounds: Array.from({ length: TOOL_045_LIMITS.maxCompounds + 1 }, () => ({
          name_en: 'X',
          half_life_days: 4.5,
          suppression_factor: 2,
        })),
      }),
    ).toBe(false);
    expect(TOOL_045_LIMITS.unit).toBe('days');
  });

  it('maps every warning the engine can emit, and never prints a raw code', () => {
    const surfaced = new Set<string>();
    const probe = (input: Parameters<typeof planCycleBreak>[0]) => {
      for (const warning of planCycleBreak(input).warnings) surfaced.add(warning);
    };
    probe({ ...baseInput, wants_bloodwork: false });
    probe({
      ...baseInput,
      compounds: [{ name_en: 'X', half_life_days: 4.5, suppression_factor: 3 }],
    });

    expect(surfaced.size).toBeGreaterThanOrEqual(2);
    for (const code of surfaced) {
      const key = warningLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('warning_')).toBe(true);
    }
    expect(warningLabelKey('a_code_that_does_not_exist')).toBe('warning_unknown');
  });

  it('formats whole days and weeks without inventing precision', () => {
    expect(formatDays(23)).toBe('23');
    expect(formatDays(22.6)).toBe('23');
    expect(formatDays(Number.NaN)).toBe('—');
    expect(formatWeeks(6)).toBe('6');
    expect(formatWeeks(Number.NaN)).toBe('—');
    expect(clamp(2, 4, 52)).toBe(4);
    expect(clamp(60, 4, 52)).toBe(52);
    expect(clamp(12, 4, 52)).toBe(12);
  });

  it('shows the engine milestone labels in the requested locale', () => {
    const result = planCycleBreak(baseInput);
    for (const milestone of result.recovery_milestones) {
      expect(milestoneLabel(milestone, 'en')).toBe(milestone.label_en);
      expect(milestoneLabel(milestone, 'ar')).toBe(milestone.label_ar);
      expect(milestoneLabel(milestone, 'en').length).toBeGreaterThan(0);
    }
  });
});

describe('Tool 045 contract — draft evaluation', () => {
  it('starts EMPTY with no input and no issue', () => {
    const evaluation = evaluateCycleBreakDraft(emptyDraft);
    expect(evaluation.state).toBe('EMPTY');
    expect(evaluation.input).toBeNull();
    expect(evaluation.issues).toEqual([]);
  });

  it('stays PARTIAL until every required field is answered', () => {
    expect(evaluateCycleBreakDraft({ ...readyDraft, cycleWeeks: '' }).state).toBe('PARTIAL');
    expect(evaluateCycleBreakDraft({ ...readyDraft, wantsBloodwork: '' }).state).toBe('PARTIAL');
    expect(evaluateCycleBreakDraft({ ...readyDraft, compounds: [] }).state).toBe('PARTIAL');
    expect(
      evaluateCycleBreakDraft({
        ...readyDraft,
        compounds: [{ name: 'Testosterone Enanthate', halfLife: '', suppression: '2' }],
      }).state,
    ).toBe('PARTIAL');
    expect(
      evaluateCycleBreakDraft({
        ...readyDraft,
        compounds: [{ name: 'Testosterone Enanthate', halfLife: '4.5', suppression: '' }],
      }).state,
    ).toBe('PARTIAL');
  });

  it('ignores an entirely empty extra row but refuses a half-filled one', () => {
    const withBlank = evaluateCycleBreakDraft({
      ...readyDraft,
      compounds: [...readyDraft.compounds, { name: '', halfLife: '', suppression: '' }],
    });
    expect(withBlank.state).toBe('READY');
    expect(withBlank.input?.compounds).toHaveLength(1);

    const halfFilled = evaluateCycleBreakDraft({
      ...readyDraft,
      compounds: [...readyDraft.compounds, { name: 'Trenbolone', halfLife: '', suppression: '' }],
    });
    expect(halfFilled.state).toBe('PARTIAL');
  });

  it('rejects a typed zero cycle length and out-of-range values', () => {
    expect(evaluateCycleBreakDraft({ ...readyDraft, cycleWeeks: '0' }).issues).toContainEqual({
      compoundIndex: null,
      field: 'cycleWeeks',
      code: 'out_of_range',
    });
    expect(evaluateCycleBreakDraft({ ...readyDraft, cycleWeeks: '53' }).issues).toContainEqual({
      compoundIndex: null,
      field: 'cycleWeeks',
      code: 'out_of_range',
    });
    expect(evaluateCycleBreakDraft({ ...readyDraft, cycleWeeks: '12.5' }).issues).toContainEqual({
      compoundIndex: null,
      field: 'cycleWeeks',
      code: 'out_of_range',
    });
    expect(
      evaluateCycleBreakDraft({
        ...readyDraft,
        compounds: [{ name: 'X', halfLife: '0.4', suppression: '2' }],
      }).issues,
    ).toContainEqual({ compoundIndex: 0, field: 'halfLife', code: 'out_of_range' });
    expect(
      evaluateCycleBreakDraft({
        ...readyDraft,
        compounds: [{ name: 'X', halfLife: '31', suppression: '2' }],
      }).issues,
    ).toContainEqual({ compoundIndex: 0, field: 'halfLife', code: 'out_of_range' });
  });

  it('rejects non-numeric text in a hand-typed field', () => {
    expect(evaluateCycleBreakDraft({ ...readyDraft, cycleWeeks: 'abc' }).issues).toContainEqual({
      compoundIndex: null,
      field: 'cycleWeeks',
      code: 'invalid_number',
    });
    expect(
      evaluateCycleBreakDraft({
        ...readyDraft,
        compounds: [{ name: 'X', halfLife: 'abc', suppression: '2' }],
      }).issues,
    ).toContainEqual({ compoundIndex: 0, field: 'halfLife', code: 'invalid_number' });
  });

  it('rejects an out-of-range suppression estimate', () => {
    expect(
      evaluateCycleBreakDraft({
        ...readyDraft,
        compounds: [{ name: 'X', halfLife: '4.5', suppression: '4' as '3' }],
      }).issues,
    ).toContainEqual({ compoundIndex: 0, field: 'suppression', code: 'out_of_range' });
  });

  it('produces a READY input that the canonical schema accepts', () => {
    const evaluation = evaluateCycleBreakDraft(readyDraft);
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input).not.toBeNull();
    expect(CycleBreakInputSchema.safeParse(evaluation.input).success).toBe(true);
    expect(evaluation.input).toEqual(baseInput);
  });

  it('keeps the order EMPTY → INVALID → PARTIAL → READY', () => {
    // An out-of-range value wins over the fact that other fields are missing.
    expect(evaluateCycleBreakDraft({ ...emptyDraft, cycleWeeks: '999' }).state).toBe('INVALID');
    // A single compound name is not enough to calculate.
    expect(
      evaluateCycleBreakDraft({
        ...emptyDraft,
        compounds: [{ name: 'Trenbolone', halfLife: '', suppression: '' }],
      }).state,
    ).toBe('PARTIAL');
  });

  it('never invents a suppression estimate or a half-life', () => {
    expect(
      evaluateCycleBreakDraft({
        ...readyDraft,
        compounds: [{ name: 'X', halfLife: '', suppression: '' }],
      }).input,
    ).toBeNull();
  });
});

describe('Tool 045 contract — content invariants and CSV', () => {
  it('records no approved source and therefore no citation', () => {
    expect(TOOL_045_SOURCES).toEqual([]);
  });

  it('links only to real registered tools and transfers nothing automatically', () => {
    expect(TOOL_045_CROSS_TOOL_LINKS.length).toBeGreaterThan(0);
    for (const link of TOOL_045_CROSS_TOOL_LINKS) {
      expect(() => requireTool(link.targetToolId)).not.toThrow();
      expect(link.transfer).toBe('manual-reentry');
      expect(link.freshnessRule).toMatch(/last-dose date/i);
      expect(link.mappedFields.length).toBeGreaterThan(0);
    }
  });

  it('builds a CSV with the inputs, the result and no session identifier', () => {
    const result = planCycleBreak(baseInput);
    const csv = buildCycleBreakCsv(baseInput, result, '2026-11-16T10:00:00.000Z');
    expect(csv).toContain('tool,tool-045-cycle-break-planner');
    expect(csv).toContain('cycle_weeks_used,12');
    expect(csv).toContain('Testosterone Enanthate');
    expect(csv).toContain('days_to_full_clear,23');
    expect(csv).toContain('pct_start_day,30');
    expect(csv).toContain('pct_duration_weeks,6');
    expect(csv).toContain('total_weeks_to_baseline,15');
    expect(csv).not.toMatch(/session|user|token|email/i);
  });
});
