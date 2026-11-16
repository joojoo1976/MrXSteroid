// lib/tools/r6/tool-042-estrogen-management-contract.test.ts
//
// The contract + sync test for Tool 042. It proves three things that a
// screenshot cannot:
//
//   1. the mirrored, non-clinical constants still describe what the unchanged
//      V6 engine (`manageEstrogen`) actually does — every band edge, the
//      symptom escalation, the AI-delta steps, the ±1 mg/week cap, the warning
//      triggers and the input bounds;
//   2. the draft evaluation cannot drift from the canonical Zod input contract
//      (EMPTY → INVALID → PARTIAL → READY), and a typed zero is never treated
//      as an empty field;
//   3. nothing is invented: no source, no clinical referral wording, no new
//      dose, and no raw engine code is ever returned for display.
import { describe, expect, it } from 'vitest';
import { EstrogenInputSchema, type EstrogenInput } from '@/lib/tools/schemas/tool-042-estrogen-management';
import { manageEstrogen } from '@/lib/tools/engines/tool-042-estrogen-management';
import { requireTool } from '@/lib/tools/registry';
import {
  TOOL_042_ACTIONS,
  TOOL_042_CROSS_TOOL_LINKS,
  TOOL_042_LIMITS,
  TOOL_042_SOURCES,
  TOOL_042_SYMPTOMS,
  actionLabelKey,
  bandLabelKey,
  buildEstrogenCsv,
  evaluateEstrogenDraft,
  formatAiDelta,
  formatE2,
  symptomLabelKey,
  warningLabelKey,
  type Tool042Draft,
  type Tool042Symptom,
} from './tool-042-estrogen-management-contract';

const baseInput: EstrogenInput = {
  e2_pg_ml: 25,
  weekly_testosterone_mg: 500,
  taking_ai: false,
  weekly_ai_dose_mg: 0,
  symptoms: [],
  body_fat_pct: 18,
};

const emptyDraft: Tool042Draft = {
  e2: '',
  weeklyTest: '',
  takingAi: '',
  aiDose: '',
  bodyFat: '',
  symptoms: [],
};

const readyDraft: Tool042Draft = {
  e2: '25',
  weeklyTest: '500',
  takingAi: 'no',
  aiDose: '',
  bodyFat: '18',
  symptoms: [],
};

describe('Tool 042 contract — mirrored constants match the frozen engine', () => {
  it('reproduces every band edge exactly', () => {
    const band = (e2: number) => manageEstrogen({ ...baseInput, e2_pg_ml: e2 }).band;
    expect(band(TOOL_042_LIMITS.optimalLow - 0.1)).toBe('low');
    expect(band(TOOL_042_LIMITS.optimalLow)).toBe('optimal');
    expect(band(TOOL_042_LIMITS.optimalHigh)).toBe('optimal');
    expect(band(TOOL_042_LIMITS.optimalHigh + 0.1)).toBe('elevated');
    expect(band(TOOL_042_LIMITS.elevatedCeiling)).toBe('elevated');
    expect(band(TOOL_042_LIMITS.elevatedCeiling + 0.1)).toBe('high');
  });

  it('reproduces the two-symptom escalation and not one symptom', () => {
    const one = manageEstrogen({ ...baseInput, symptoms: ['nipple_sensitivity'] });
    const two = manageEstrogen({ ...baseInput, symptoms: ['nipple_sensitivity', 'edema'] });
    expect(one.band).toBe('optimal');
    expect(two.band).toBe('elevated');
    expect(two.action).toBe('monitor');
    expect(TOOL_042_LIMITS.symptomEscalationCount).toBe(2);
  });

  it('never escalates a reading that is already out of range', () => {
    const high = manageEstrogen({ ...baseInput, e2_pg_ml: 65, symptoms: ['nipple_sensitivity'] });
    expect(high.band).toBe('high');
  });

  it('reproduces the AI-delta steps and never suggests an AI that is not taken', () => {
    const high = manageEstrogen({ ...baseInput, e2_pg_ml: 65, taking_ai: true, weekly_ai_dose_mg: 1 });
    const elevated = manageEstrogen({ ...baseInput, e2_pg_ml: 45, taking_ai: true, weekly_ai_dose_mg: 1 });
    const low = manageEstrogen({ ...baseInput, e2_pg_ml: 5, taking_ai: true, weekly_ai_dose_mg: 1 });
    const noAi = manageEstrogen({ ...baseInput, e2_pg_ml: 65, taking_ai: false });

    expect(high.ai_delta_mg).toBe(TOOL_042_LIMITS.aiDeltaHigh);
    expect(elevated.ai_delta_mg).toBe(TOOL_042_LIMITS.aiDeltaElevated);
    expect(low.ai_delta_mg).toBe(TOOL_042_LIMITS.aiDeltaLow);
    expect(noAi.ai_delta_mg).toBe(0);
    for (const result of [high, elevated, low, noAi]) {
      expect(Math.abs(result.ai_delta_mg)).toBeLessThanOrEqual(TOOL_042_LIMITS.aiDeltaCap);
    }
  });

  it('does not adjust a zero-dose AI', () => {
    const result = manageEstrogen({ ...baseInput, e2_pg_ml: 65, taking_ai: true, weekly_ai_dose_mg: 0 });
    expect(result.ai_delta_mg).toBe(0);
    expect(result.action).toBe('adjust_ai');
  });

  it('mirrors the input bounds of the canonical schema', () => {
    expect(EstrogenInputSchema.safeParse({ ...baseInput, e2_pg_ml: TOOL_042_LIMITS.e2Min }).success).toBe(true);
    expect(EstrogenInputSchema.safeParse({ ...baseInput, e2_pg_ml: TOOL_042_LIMITS.e2Min - 1 }).success).toBe(false);
    expect(EstrogenInputSchema.safeParse({ ...baseInput, e2_pg_ml: TOOL_042_LIMITS.e2Max }).success).toBe(true);
    expect(EstrogenInputSchema.safeParse({ ...baseInput, e2_pg_ml: TOOL_042_LIMITS.e2Max + 1 }).success).toBe(false);
    expect(
      EstrogenInputSchema.safeParse({ ...baseInput, weekly_testosterone_mg: TOOL_042_LIMITS.weeklyTestMax + 1 })
        .success,
    ).toBe(false);
    expect(
      EstrogenInputSchema.safeParse({ ...baseInput, weekly_ai_dose_mg: TOOL_042_LIMITS.aiDoseMax + 1 }).success,
    ).toBe(false);
    expect(
      EstrogenInputSchema.safeParse({ ...baseInput, body_fat_pct: TOOL_042_LIMITS.bodyFatMin - 1 }).success,
    ).toBe(false);
    expect(TOOL_042_LIMITS.unit).toBe('pg/mL');
  });

  it('maps every warning the engine can emit, and never prints a raw code', () => {
    const surfaced = new Set<string>();
    const probe = (input: Partial<EstrogenInput>) => {
      for (const warning of manageEstrogen({ ...baseInput, ...input }).warnings) surfaced.add(warning);
    };
    probe({ e2_pg_ml: 65, taking_ai: false });
    probe({ e2_pg_ml: 5, taking_ai: true, weekly_ai_dose_mg: 1 });
    probe({ e2_pg_ml: 5, taking_ai: false });
    probe({ e2_pg_ml: 150 });

    expect(surfaced.size).toBeGreaterThanOrEqual(4);
    for (const code of surfaced) {
      const key = warningLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('warning_')).toBe(true);
    }
    expect(warningLabelKey('a_code_that_does_not_exist')).toBe('warning_unknown');
  });

  it('maps every band and action, and falls back for an unknown code', () => {
    const bands = new Set(['low', 'optimal', 'elevated', 'high']);
    for (const e2 of [5, 25, 45, 65]) bands.add(manageEstrogen({ ...baseInput, e2_pg_ml: e2 }).band);
    for (const band of bands) expect(bandLabelKey(band)).not.toBe(band);

    for (const action of TOOL_042_ACTIONS) expect(actionLabelKey(action)).not.toBe(action);
    expect(bandLabelKey('nonsense')).toBe('band_unknown');
    expect(actionLabelKey('nonsense')).toBe('action_unknown');
  });

  it('maps every symptom to a distinct localisation key', () => {
    const keys = TOOL_042_SYMPTOMS.map((symptom: Tool042Symptom) => symptomLabelKey(symptom));
    expect(new Set(keys).size).toBe(TOOL_042_SYMPTOMS.length);
    for (const key of keys) expect(key).not.toBe('');
  });

  it('keeps the extreme-E2 flag at the engine boundary, not one unit either side', () => {
    const below = manageEstrogen({ ...baseInput, e2_pg_ml: TOOL_042_LIMITS.extremeE2 });
    const above = manageEstrogen({ ...baseInput, e2_pg_ml: TOOL_042_LIMITS.extremeE2 + 0.1 });
    expect(below.warnings).not.toContain('e2_extreme_seek_physician');
    expect(above.warnings).toContain('e2_extreme_seek_physician');
  });
});

describe('Tool 042 contract — draft evaluation', () => {
  it('starts EMPTY with no input and no issue', () => {
    const evaluation = evaluateEstrogenDraft(emptyDraft);
    expect(evaluation.state).toBe('EMPTY');
    expect(evaluation.input).toBeNull();
    expect(evaluation.issues).toEqual([]);
  });

  it('stays PARTIAL until every required field is answered', () => {
    expect(evaluateEstrogenDraft({ ...readyDraft, e2: '' }).state).toBe('PARTIAL');
    expect(evaluateEstrogenDraft({ ...readyDraft, weeklyTest: '' }).state).toBe('PARTIAL');
    expect(evaluateEstrogenDraft({ ...readyDraft, bodyFat: '' }).state).toBe('PARTIAL');
    expect(evaluateEstrogenDraft({ ...readyDraft, takingAi: '' }).state).toBe('PARTIAL');
    expect(evaluateEstrogenDraft({ ...readyDraft, takingAi: 'yes', aiDose: '' }).state).toBe('PARTIAL');
  });

  it('treats symptoms as optional', () => {
    const evaluation = evaluateEstrogenDraft({ ...readyDraft, symptoms: ['edema', 'mood_swings'] });
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input?.symptoms).toEqual(['edema', 'mood_swings']);
  });

  it('rejects a typed zero because zero is outside the accepted E2 range', () => {
    const evaluation = evaluateEstrogenDraft({ ...readyDraft, e2: '0' });
    expect(evaluation.state).toBe('INVALID');
    expect(evaluation.issues).toContainEqual({ field: 'e2', code: 'out_of_range' });
    expect(evaluation.input).toBeNull();
  });

  it('rejects non-numeric text, an out-of-range value and an inapplicable AI dose', () => {
    expect(evaluateEstrogenDraft({ ...readyDraft, e2: 'abc' }).issues).toContainEqual({
      field: 'e2',
      code: 'invalid_number',
    });
    expect(evaluateEstrogenDraft({ ...readyDraft, weeklyTest: '1001' }).issues).toContainEqual({
      field: 'weeklyTest',
      code: 'out_of_range',
    });
    expect(evaluateEstrogenDraft({ ...readyDraft, bodyFat: '61' }).issues).toContainEqual({
      field: 'bodyFat',
      code: 'out_of_range',
    });
    expect(
      evaluateEstrogenDraft({ ...readyDraft, takingAi: 'no', aiDose: '0.5' }).issues,
    ).toContainEqual({ field: 'aiDose', code: 'not_applicable' });
  });

  it('produces a READY input that the canonical schema accepts', () => {
    const evaluation = evaluateEstrogenDraft({
      ...readyDraft,
      takingAi: 'yes',
      aiDose: '0.5',
      symptoms: ['nipple_sensitivity'],
    });
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input).not.toBeNull();
    expect(EstrogenInputSchema.safeParse(evaluation.input).success).toBe(true);
    expect(evaluation.input).toEqual({
      e2_pg_ml: 25,
      weekly_testosterone_mg: 500,
      taking_ai: true,
      weekly_ai_dose_mg: 0.5,
      symptoms: ['nipple_sensitivity'],
      body_fat_pct: 18,
    });
  });

  it('keeps the order EMPTY → INVALID → PARTIAL → READY', () => {
    // An out-of-range value wins over the fact that other fields are missing.
    expect(evaluateEstrogenDraft({ ...emptyDraft, e2: '999' }).state).toBe('INVALID');
    // A single optional symptom is not enough to calculate.
    expect(evaluateEstrogenDraft({ ...emptyDraft, symptoms: ['edema'] }).state).toBe('PARTIAL');
  });

  it('never silently invents an AI dose when the user says an AI is taken', () => {
    const evaluation = evaluateEstrogenDraft({ ...readyDraft, takingAi: 'yes' });
    expect(evaluation.state).toBe('PARTIAL');
    expect(evaluation.input).toBeNull();
  });
});

describe('Tool 042 contract — content invariants and CSV', () => {
  it('records no approved source and therefore no citation', () => {
    expect(TOOL_042_SOURCES).toEqual([]);
  });

  it('links only to real registered tools and transfers nothing automatically', () => {
    expect(TOOL_042_CROSS_TOOL_LINKS.length).toBeGreaterThan(0);
    for (const link of TOOL_042_CROSS_TOOL_LINKS) {
      expect(() => requireTool(link.targetToolId)).not.toThrow();
      expect(link.transfer).toBe('manual-reentry');
      expect(link.freshnessRule).toMatch(/blood-draw date/i);
      expect(link.mappedFields.length).toBeGreaterThan(0);
    }
  });

  it('formats E2 and the signed AI delta without inventing precision', () => {
    expect(formatE2(25)).toBe('25.0');
    expect(formatE2(Number.NaN)).toBe('—');
    expect(formatAiDelta(0.5)).toBe('+0.50');
    expect(formatAiDelta(-0.25)).toBe('-0.25');
    expect(formatAiDelta(0)).toBe('0.00');
  });

  it('builds a CSV with the inputs, the result and no session identifier', () => {
    const result = manageEstrogen({ ...baseInput, e2_pg_ml: 65, taking_ai: true, weekly_ai_dose_mg: 1 });
    const csv = buildEstrogenCsv(
      { ...baseInput, e2_pg_ml: 65, taking_ai: true, weekly_ai_dose_mg: 1, symptoms: ['edema'] },
      result,
      '2026-11-16T10:00:00.000Z',
    );
    expect(csv).toContain('tool,tool-042-estrogen-management');
    expect(csv).toContain('e2_pg_ml,65');
    expect(csv).toContain('weekly_ai_dose_mg,1');
    expect(csv).toContain('band,high');
    expect(csv).toContain('ai_delta_mg_per_week,0.5');
    expect(csv).toContain('action,adjust_ai');
    expect(csv).not.toMatch(/session|user|token|email/i);
  });
});
