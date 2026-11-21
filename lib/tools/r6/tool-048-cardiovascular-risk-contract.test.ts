// lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts
//
// The contract + sync test for Tool 048. It proves three things that a
// screenshot cannot:
//
//   1. the mirrored, non-clinical constants still describe what the unchanged
//      V6 engine (`assessCardiovascularRisk`) actually does — the additive
//      weights, the round + clamp window, the four band cut-offs, the driver
//      thresholds, the 1:1 mitigation mapping, the warning trigger and the
//      input bounds;
//   2. the draft evaluation cannot drift from the canonical Zod input contract
//      (EMPTY → INVALID → PARTIAL → READY), and a numeric `0` is rejected as
//      out of range rather than silently ignored;
//   3. nothing is invented: no source, no clinical referral wording, no
//      reference range and no confidence figure.
import { describe, expect, it } from 'vitest';
import {
  CardioRiskInputSchema,
  type CardioRiskInput,
} from '@/lib/tools/schemas/tool-048-cardiovascular-risk';
import { assessCardiovascularRisk } from '@/lib/tools/engines/tool-048-cardiovascular-risk';
import { requireTool } from '@/lib/tools/registry';
import {
  TOOL_048_CROSS_TOOL_LINKS,
  TOOL_048_LIMITS,
  TOOL_048_SOURCES,
  bandForRisk,
  bandLabelKey,
  buildCardioRiskCsv,
  clamp,
  driverLabelKey,
  evaluateCardioRiskDraft,
  formatPoints,
  formatPct,
  mitigationLabelKey,
  mirroredRiskPct,
  riskContributions,
  warningLabelKey,
  type Tool048Draft,
} from './tool-048-cardiovascular-risk-contract';

const baseInput: CardioRiskInput = {
  age: 42,
  sex: 'male',
  smoker: true,
  systolic_bp: 145,
  total_cholesterol: 220,
  hdl: 35,
  on_cycle: true,
};

const emptyDraft: Tool048Draft = {
  age: '',
  sex: '',
  smoker: '',
  systolicBp: '',
  totalCholesterol: '',
  hdl: '',
  onCycle: '',
};

const readyDraft: Tool048Draft = {
  age: '42',
  sex: 'male',
  smoker: 'yes',
  systolicBp: '145',
  totalCholesterol: '220',
  hdl: '35',
  onCycle: 'yes',
};

/** Representative inputs that exercise every weight, floor and driver boundary. */
const SAMPLES: CardioRiskInput[] = [
  baseInput,
  { ...baseInput, age: 18, sex: 'female', smoker: false, systolic_bp: 80, total_cholesterol: 100, hdl: 110, on_cycle: false },
  { ...baseInput, age: 90, systolic_bp: 220, total_cholesterol: 400, hdl: 20 },
  { ...baseInput, age: 44, systolic_bp: 129, total_cholesterol: 199, hdl: 41, smoker: false, on_cycle: false },
  { ...baseInput, age: 45, systolic_bp: 130, total_cholesterol: 200, hdl: 40, smoker: false, on_cycle: false },
  { ...baseInput, age: 46, systolic_bp: 131, total_cholesterol: 201, hdl: 39, smoker: false, on_cycle: false },
  { ...baseInput, age: 30, sex: 'female', smoker: false, systolic_bp: 120, total_cholesterol: 180, hdl: 45, on_cycle: false },
  { ...baseInput, age: 30, sex: 'male', smoker: false, systolic_bp: 120, total_cholesterol: 180, hdl: 45, on_cycle: false },
  { ...baseInput, age: 35, systolic_bp: 126, total_cholesterol: 195, hdl: 45, smoker: false, on_cycle: false },
  { ...baseInput, age: 50, sex: 'female', smoker: false, systolic_bp: 135, total_cholesterol: 210, hdl: 45, on_cycle: false },
  { ...baseInput, age: 60, systolic_bp: 160, total_cholesterol: 260, hdl: 25, smoker: true, on_cycle: true },
];

const DRIVER_MITIGATION_PAIRS: Record<string, string> = {
  age: 'annual_bp_lipid_panels',
  blood_pressure: 'bp_management',
  total_cholesterol: 'lipid_optimization',
  low_hdl: 'raise_hdl_cardio',
  smoking: 'smoking_cessation',
  on_cycle_burden: 'cycle_responsibility_bp_lipid_monitoring',
};

describe('Tool 048 contract — mirrored constants match the frozen engine', () => {
  it('reproduces the additive risk arithmetic on every representative input', () => {
    for (const sample of SAMPLES) {
      expect(mirroredRiskPct(sample)).toBe(
        assessCardiovascularRisk(sample).risk_pct_10yr,
      );
    }

    // The single sample worked by hand in the pipeline test.
    expect(mirroredRiskPct(baseInput)).toBe(21);
  });

  it('reproduces every individual contribution the engine adds', () => {
    const contributions = riskContributions(baseInput);
    expect(contributions.map((item) => item.code)).toEqual([
      'age',
      'systolic',
      'cholesterol',
      'hdl',
      'smoking',
      'cycle',
      'sex',
    ]);
    const points = Object.fromEntries(contributions.map((item) => [item.code, item.points]));
    expect(points.age).toBeCloseTo(8.4, 10);
    expect(points.systolic).toBeCloseTo(2, 10);
    expect(points.cholesterol).toBeCloseTo(1.6, 10);
    expect(points.hdl).toBeCloseTo(1, 10);
    expect(points.smoking).toBe(4);
    expect(points.cycle).toBe(3);
    expect(points.sex).toBe(1);

    // The mirrored total, once rounded and clamped, is the engine's number.
    for (const sample of SAMPLES) {
      const sum = riskContributions(sample).reduce((total, item) => total + item.points, 0);
      const expected = Math.min(
        TOOL_048_LIMITS.riskCeilingPct,
        Math.max(TOOL_048_LIMITS.riskFloorPct, Math.round(sum)),
      );
      expect(expected).toBe(assessCardiovascularRisk(sample).risk_pct_10yr);
    }

    // A contribution is zero, never negative.
    const low = riskContributions({
      ...baseInput,
      systolic_bp: 80,
      total_cholesterol: 100,
      hdl: 110,
    });
    for (const item of low.filter((entry) => entry.code !== 'age')) {
      expect(item.points).toBeGreaterThanOrEqual(0);
    }
  });

  it('never reaches the educational ceiling from schema-valid inputs, and says so', () => {
    const extreme = {
      ...baseInput,
      age: 90,
      systolic_bp: 220,
      total_cholesterol: 400,
      hdl: 20,
      smoker: true,
      on_cycle: true,
    };
    // 25.2 + 8 + 8.8 + 2.5 + 4 + 3 + 1 = 52.5 percentage points.
    const raw = riskContributions(extreme).reduce((total, item) => total + item.points, 0);
    expect(raw).toBeCloseTo(52.5, 10);
    // Rounding half up gives 53, which is still below the declared 60 % ceiling:
    // the clamp is a documented guard, not a reachable value at the schema bounds.
    expect(mirroredRiskPct(extreme)).toBe(53);
    expect(assessCardiovascularRisk(extreme).risk_pct_10yr).toBe(53);
    expect(mirroredRiskPct(extreme)).toBeLessThan(TOOL_048_LIMITS.riskCeilingPct);
    expect(TOOL_048_LIMITS.riskCeilingPct).toBe(60);
    expect(TOOL_048_LIMITS.riskFloorPct).toBe(0);
    // The floor is reachable, the ceiling is not.
    expect(mirroredRiskPct({ ...baseInput, age: 18, smoker: false, on_cycle: false, systolic_bp: 80, total_cholesterol: 100, hdl: 110, sex: 'female' })).toBe(0);
  });

  it('reproduces the four band cut-offs exactly', () => {
    for (const risk of [0, 4, 5, 9, 10, 19, 20, 59, 60]) {
      expect(bandForRisk(risk)).toBe(
        risk < 5 ? 'low' : risk < 10 ? 'moderate' : risk < 20 ? 'elevated' : 'high',
      );
    }
    // And the engine's own band agrees with the mirrored function on every sample.
    for (const sample of SAMPLES) {
      const engine = assessCardiovascularRisk(sample);
      expect(bandForRisk(engine.risk_pct_10yr)).toBe(engine.band);
    }
    expect(TOOL_048_LIMITS.bandLowBelow).toBe(5);
    expect(TOOL_048_LIMITS.bandModerateBelow).toBe(10);
    expect(TOOL_048_LIMITS.bandElevatedBelow).toBe(20);
  });

  it('reproduces every driver threshold and the 1:1 mitigation mapping in order', () => {
    for (const sample of SAMPLES) {
      const engine = assessCardiovascularRisk(sample);
      expect(engine.drivers.length).toBe(engine.mitigations.length);
      engine.drivers.forEach((code, index) => {
        expect(engine.mitigations[index]).toBe(DRIVER_MITIGATION_PAIRS[code]);
      });
    }

    const driversFor = (patch: Partial<typeof baseInput>) =>
      assessCardiovascularRisk({ ...baseInput, ...patch }).drivers;

    // Each threshold is inclusive/exclusive exactly as the engine documents it.
    expect(driversFor({ age: 44 })).not.toContain('age');
    expect(driversFor({ age: 45 })).toContain('age');
    expect(driversFor({ systolic_bp: 130 })).not.toContain('blood_pressure');
    expect(driversFor({ systolic_bp: 131 })).toContain('blood_pressure');
    expect(driversFor({ total_cholesterol: 200 })).not.toContain('total_cholesterol');
    expect(driversFor({ total_cholesterol: 201 })).toContain('total_cholesterol');
    expect(driversFor({ hdl: 40 })).not.toContain('low_hdl');
    expect(driversFor({ hdl: 39 })).toContain('low_hdl');
    expect(driversFor({ smoker: false })).not.toContain('smoking');
    expect(driversFor({ smoker: true })).toContain('smoking');
    expect(driversFor({ on_cycle: false })).not.toContain('on_cycle_burden');
    expect(driversFor({ on_cycle: true })).toContain('on_cycle_burden');

    expect(TOOL_048_LIMITS.driverAgeAtLeast).toBe(45);
    expect(TOOL_048_LIMITS.driverSystolicAbove).toBe(130);
    expect(TOOL_048_LIMITS.driverCholesterolAbove).toBe(200);
    expect(TOOL_048_LIMITS.driverHdlBelow).toBe(40);
  });

  it('always emits the educational warning and adds the consultation warning at 20 %', () => {
    for (const sample of SAMPLES) {
      const engine = assessCardiovascularRisk(sample);
      expect(engine.warnings[0]).toBe('educational_not_clinical_ascvd');
      const hasConsult = engine.warnings.includes('consult_physician');
      expect(hasConsult).toBe(engine.risk_pct_10yr >= 20);
      expect(engine.warnings.length).toBe(hasConsult ? 2 : 1);
    }
    expect(TOOL_048_LIMITS.warningConsultAtLeastPct).toBe(20);
  });

  it('mirrors the input bounds of the canonical schema', () => {
    const parse = (patch: Record<string, unknown>) =>
      CardioRiskInputSchema.safeParse({ ...baseInput, ...patch }).success;

    expect(parse({ age: TOOL_048_LIMITS.ageMin })).toBe(true);
    expect(parse({ age: TOOL_048_LIMITS.ageMax })).toBe(true);
    expect(parse({ age: TOOL_048_LIMITS.ageMin - 1 })).toBe(false);
    expect(parse({ age: TOOL_048_LIMITS.ageMax + 1 })).toBe(false);

    expect(parse({ systolic_bp: TOOL_048_LIMITS.systolicBpMin })).toBe(true);
    expect(parse({ systolic_bp: TOOL_048_LIMITS.systolicBpMax })).toBe(true);
    expect(parse({ systolic_bp: TOOL_048_LIMITS.systolicBpMin - 1 })).toBe(false);
    expect(parse({ systolic_bp: TOOL_048_LIMITS.systolicBpMax + 1 })).toBe(false);

    expect(parse({ total_cholesterol: TOOL_048_LIMITS.totalCholesterolMin })).toBe(true);
    expect(parse({ total_cholesterol: TOOL_048_LIMITS.totalCholesterolMax })).toBe(true);
    expect(parse({ total_cholesterol: TOOL_048_LIMITS.totalCholesterolMin - 1 })).toBe(false);
    expect(parse({ total_cholesterol: TOOL_048_LIMITS.totalCholesterolMax + 1 })).toBe(false);

    expect(parse({ hdl: TOOL_048_LIMITS.hdlMin })).toBe(true);
    expect(parse({ hdl: TOOL_048_LIMITS.hdlMax })).toBe(true);
    expect(parse({ hdl: TOOL_048_LIMITS.hdlMin - 1 })).toBe(false);
    expect(parse({ hdl: TOOL_048_LIMITS.hdlMax + 1 })).toBe(false);

    expect(parse({ sex: 'male' })).toBe(true);
    expect(parse({ sex: 'female' })).toBe(true);
    expect(parse({ sex: 'other' })).toBe(false);
    expect(parse({ smoker: true })).toBe(true);
    expect(parse({ smoker: 'yes' })).toBe(false);
    expect(TOOL_048_LIMITS.unit).toBe('percent_10_year');
  });

  it('maps every band, driver, mitigation and warning the engine can emit', () => {
    const bands = new Set<string>();
    const drivers = new Set<string>();
    const mitigations = new Set<string>();
    const warnings = new Set<string>();

    for (const sample of SAMPLES) {
      const engine = assessCardiovascularRisk(sample);
      bands.add(engine.band);
      engine.drivers.forEach((code) => drivers.add(code));
      engine.mitigations.forEach((code) => mitigations.add(code));
      engine.warnings.forEach((code) => warnings.add(code));
    }

    expect(bands.size).toBe(4);
    expect(drivers.size).toBe(6);
    expect(mitigations.size).toBe(6);
    expect(warnings.size).toBe(2);

    for (const band of bands) {
      const key = bandLabelKey(band);
      expect(key).not.toBe(band);
      expect(key.startsWith('band_')).toBe(true);
    }
    for (const code of drivers) {
      const key = driverLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('driver_')).toBe(true);
    }
    for (const code of mitigations) {
      const key = mitigationLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('mitigation_')).toBe(true);
    }
    for (const code of warnings) {
      const key = warningLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('warning_')).toBe(true);
    }

    expect(bandLabelKey('unknown')).toBe('band_unknown');
    expect(driverLabelKey('unknown')).toBe('driver_unknown');
    expect(mitigationLabelKey('unknown')).toBe('mitigation_unknown');
    expect(warningLabelKey('unknown')).toBe('warning_unknown');
  });

  it('formats percentages and points without inventing precision', () => {
    expect(formatPct(21)).toBe('21%');
    expect(formatPct(0)).toBe('0%');
    expect(formatPct(Number.NaN)).toBe('—');
    expect(formatPoints(8.4)).toBe('8.4');
    expect(formatPoints(2)).toBe('2');
    expect(formatPoints(0)).toBe('0');
    expect(formatPoints(Number.NaN)).toBe('—');
    expect(clamp(10, 18, 90)).toBe(18);
    expect(clamp(200, 18, 90)).toBe(90);
    expect(clamp(42, 18, 90)).toBe(42);
  });
});

describe('Tool 048 contract — draft evaluation', () => {
  it('starts EMPTY with no input and no issue', () => {
    const evaluation = evaluateCardioRiskDraft(emptyDraft);
    expect(evaluation.state).toBe('EMPTY');
    expect(evaluation.input).toBeNull();
    expect(evaluation.issues).toEqual([]);
  });

  it('stays PARTIAL until every required field is answered', () => {
    for (const patch of [
      { age: '' },
      { sex: '' as const },
      { smoker: '' as const },
      { systolicBp: '' },
      { totalCholesterol: '' },
      { hdl: '' },
      { onCycle: '' as const },
    ]) {
      expect(evaluateCardioRiskDraft({ ...readyDraft, ...patch }).state).toBe('PARTIAL');
    }
  });

  it('rejects a typed zero as out of range instead of treating it as unanswered', () => {
    for (const field of ['age', 'systolicBp', 'totalCholesterol', 'hdl'] as const) {
      const evaluation = evaluateCardioRiskDraft({ ...readyDraft, [field]: '0' });
      expect(evaluation.state).toBe('INVALID');
      expect(evaluation.issues).toContainEqual({ field, code: 'out_of_range' });
      expect(evaluation.input).toBeNull();
    }
  });

  it('rejects out-of-range values with an out_of_range issue', () => {
    expect(evaluateCardioRiskDraft({ ...readyDraft, age: '17' }).issues).toContainEqual({
      field: 'age',
      code: 'out_of_range',
    });
    expect(evaluateCardioRiskDraft({ ...readyDraft, age: '91' }).issues).toContainEqual({
      field: 'age',
      code: 'out_of_range',
    });
    expect(evaluateCardioRiskDraft({ ...readyDraft, systolicBp: '79' }).issues).toContainEqual({
      field: 'systolicBp',
      code: 'out_of_range',
    });
    expect(evaluateCardioRiskDraft({ ...readyDraft, totalCholesterol: '99' }).issues).toContainEqual({
      field: 'totalCholesterol',
      code: 'out_of_range',
    });
    expect(evaluateCardioRiskDraft({ ...readyDraft, hdl: '111' }).issues).toContainEqual({
      field: 'hdl',
      code: 'out_of_range',
    });
    expect(evaluateCardioRiskDraft({ ...readyDraft, sex: 'other' as 'male' }).issues).toContainEqual({
      field: 'sex',
      code: 'out_of_range',
    });
    expect(
      evaluateCardioRiskDraft({ ...readyDraft, smoker: 'maybe' as 'yes' }).issues,
    ).toContainEqual({ field: 'smoker', code: 'out_of_range' });
    expect(
      evaluateCardioRiskDraft({ ...readyDraft, onCycle: 'maybe' as 'yes' }).issues,
    ).toContainEqual({ field: 'onCycle', code: 'out_of_range' });
  });

  it('rejects non-numeric text in a hand-typed field', () => {
    for (const field of ['age', 'systolicBp', 'totalCholesterol', 'hdl'] as const) {
      expect(evaluateCardioRiskDraft({ ...readyDraft, [field]: 'abc' }).issues).toContainEqual({
        field,
        code: 'invalid_number',
      });
    }
  });

  it('keeps the order EMPTY → INVALID → PARTIAL → READY', () => {
    expect(evaluateCardioRiskDraft({ ...emptyDraft, age: '999' }).state).toBe('INVALID');
    expect(evaluateCardioRiskDraft({ ...emptyDraft, age: '42' }).state).toBe('PARTIAL');
  });

  it('produces a READY input that the canonical schema accepts', () => {
    const evaluation = evaluateCardioRiskDraft(readyDraft);
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input).not.toBeNull();
    expect(CardioRiskInputSchema.safeParse(evaluation.input).success).toBe(true);
    expect(evaluation.input).toEqual(baseInput);
  });

  it('accepts a female non-smoker off cycle without inventing a driver', () => {
    const evaluation = evaluateCardioRiskDraft({
      ...readyDraft,
      sex: 'female',
      smoker: 'no',
      onCycle: 'no',
    });
    expect(evaluation.state).toBe('READY');
    if (!evaluation.input) throw new Error('expected a ready input');
    const engine = assessCardiovascularRisk(evaluation.input);
    expect(engine.drivers).toEqual(['blood_pressure', 'total_cholesterol', 'low_hdl']);
    expect(engine.risk_pct_10yr).toBe(13);
    expect(engine.band).toBe('elevated');
    // Below 20 %, so the engine adds no consultation warning.
    expect(engine.warnings).toEqual(['educational_not_clinical_ascvd']);
  });
});

describe('Tool 048 contract — content invariants and CSV', () => {
  it('records no approved source and therefore no citation', () => {
    expect(TOOL_048_SOURCES).toEqual([]);
  });

  it('links only to real registered tools and transfers nothing automatically', () => {
    expect(TOOL_048_CROSS_TOOL_LINKS.length).toBeGreaterThan(0);
    for (const link of TOOL_048_CROSS_TOOL_LINKS) {
      expect(() => requireTool(link.targetToolId)).not.toThrow();
      expect(link.transfer).toBe('manual-reentry');
      expect(link.freshnessRule).toMatch(/protocol start date|blood-draw date/i);
      expect(link.mappedFields.length).toBeGreaterThan(0);
    }
  });

  it('builds a CSV with the inputs, the result and no session identifier', () => {
    const result = assessCardiovascularRisk(baseInput);
    const csv = buildCardioRiskCsv(baseInput, result, '2026-11-16T10:00:00.000Z');
    expect(csv).toContain('tool,tool-048-cardiovascular-risk');
    expect(csv).toContain('age,42');
    expect(csv).toContain('sex,male');
    expect(csv).toContain('smoker,true');
    expect(csv).toContain('systolic_bp,145');
    expect(csv).toContain('total_cholesterol,220');
    expect(csv).toContain('hdl,35');
    expect(csv).toContain('on_cycle,true');
    expect(csv).toContain('risk_pct_10yr,21');
    expect(csv).toContain('band,high');
    expect(csv).toContain('drivers,blood_pressure|total_cholesterol|low_hdl|smoking|on_cycle_burden');
    expect(csv).not.toMatch(/session|user|token|email/i);
    expect(csv).not.toContain('0.9');
    expect(csv).not.toMatch(/reference/i);
  });
});
