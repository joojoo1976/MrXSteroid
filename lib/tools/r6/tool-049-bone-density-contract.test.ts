// lib/tools/r6/tool-049-bone-density-contract.test.ts
import { describe, expect, it } from 'vitest';
import { BoneDensityInputSchema } from '@/lib/tools/schemas/tool-049-bone-density';
import { assessBoneDensity } from '@/lib/tools/engines/tool-049-bone-density';
import { requireTool } from '@/lib/tools/registry';
import {
  TOOL_049_CROSS_TOOL_LINKS,
  TOOL_049_LIMITS,
  TOOL_049_SOURCES,
  bandForScore,
  bandLabelKey,
  buildBoneDensityCsv,
  clamp,
  evaluateBoneDensityDraft,
  formatScore,
  interventionLabelKey,
  mirroredInterventions,
  mirroredRiskFactors,
  mirroredScore,
  mirroredWarnings,
  riskFactorLabelKey,
  scoreContributions,
  warningLabelKey,
  type Tool049Draft,
} from './tool-049-bone-density-contract';

const baseInput = {
  age: 30,
  sex: 'male' as const,
  uses_ai_years: 2,
  weekly_resistance_sessions: 4,
  calcium_mg_daily: 1200,
  vitamin_d_iu_daily: 2000,
  smoker: false,
};

const emptyDraft: Tool049Draft = {
  age: '',
  sex: '',
  usesAiYears: '',
  weeklyResistance: '',
  calciumMg: '',
  vitaminD: '',
  smoker: '',
};

const readyDraft: Tool049Draft = {
  age: '30',
  sex: 'male',
  usesAiYears: '2',
  weeklyResistance: '4',
  calciumMg: '1200',
  vitaminD: '2000',
  smoker: 'no',
};

const SAMPLES = [
  baseInput,
  { ...baseInput, age: 68, sex: 'female' as const, uses_ai_years: 4, weekly_resistance_sessions: 0, calcium_mg_daily: 300, vitamin_d_iu_daily: 200, smoker: true },
  { ...baseInput, age: 90, sex: 'female' as const, uses_ai_years: 30, weekly_resistance_sessions: 0, calcium_mg_daily: 0, vitamin_d_iu_daily: 0, smoker: true },
  { ...baseInput, age: 25, sex: 'female' as const, uses_ai_years: 0, weekly_resistance_sessions: 5, calcium_mg_daily: 1000, vitamin_d_iu_daily: 1200, smoker: false },
  { ...baseInput, age: 55, sex: 'female' as const, uses_ai_years: 1, weekly_resistance_sessions: 2, calcium_mg_daily: 900, vitamin_d_iu_daily: 900, smoker: false },
  { ...baseInput, age: 70, sex: 'male' as const, uses_ai_years: 0, weekly_resistance_sessions: 1, calcium_mg_daily: 700, vitamin_d_iu_daily: 700, smoker: true },
  { ...baseInput, age: 40, sex: 'male' as const, uses_ai_years: 3, weekly_resistance_sessions: 0, calcium_mg_daily: 500, vitamin_d_iu_daily: 500, smoker: false },
];

describe('Tool 049 contract — mirrored constants match the frozen engine', () => {
  it('reproduces the score on every representative input', () => {
    for (const sample of SAMPLES) {
      expect(mirroredScore(sample)).toBe(assessBoneDensity(sample).bone_health_score);
    }
    expect(mirroredScore(baseInput)).toBe(84);
  });

  it('reproduces every individual contribution the engine adds', () => {
    const contributions = scoreContributions(baseInput);
    expect(contributions.map((item) => item.code)).toEqual([
      'base', 'resistance', 'calcium', 'vitamin_d', 'ai', 'smoking', 'postmenopausal', 'advanced_age',
    ]);
    const points = Object.fromEntries(contributions.map((item) => [item.code, item.points]));
    expect(points.base).toBe(60);
    expect(points.resistance).toBe(12);
    expect(points.calcium).toBe(12);
    expect(points.vitamin_d).toBe(5);
    expect(points.ai).toBe(-5);
    expect(points.smoking).toBe(0);
    expect(points.postmenopausal).toBe(0);
    expect(points.advanced_age).toBe(0);

    for (const sample of SAMPLES) {
      const sum = scoreContributions(sample).reduce((total, item) => total + item.points, 0);
      const expected = Math.min(
        TOOL_049_LIMITS.scoreCeiling,
        Math.max(TOOL_049_LIMITS.scoreFloor, Math.round(sum)),
      );
      expect(expected).toBe(assessBoneDensity(sample).bone_health_score);
    }
  });

  it('caps the resistance, calcium and vitamin D terms as the engine does', () => {
    const big = { ...baseInput, weekly_resistance_sessions: 14, calcium_mg_daily: 3000, vitamin_d_iu_daily: 10000 };
    const contributions = scoreContributions(big);
    const points = Object.fromEntries(contributions.map((item) => [item.code, item.points]));
    expect(points.resistance).toBe(20);
    expect(points.calcium).toBe(15);
    expect(points.vitamin_d).toBe(15);
    expect(points.base + points.resistance + points.calcium + points.vitamin_d).toBe(110);
    // Clamped to 100.
    expect(mirroredScore(big)).toBe(100);
    expect(assessBoneDensity(big).bone_health_score).toBe(100);
  });

  it('reproduces the clamp window, including the floor', () => {
    const worst = { ...baseInput, age: 90, sex: 'female' as const, uses_ai_years: 30, weekly_resistance_sessions: 0, calcium_mg_daily: 0, vitamin_d_iu_daily: 0, smoker: true };
    const raw = scoreContributions(worst).reduce((total, item) => total + item.points, 0);
    expect(raw).toBeLessThan(0);
    expect(mirroredScore(worst)).toBe(0);
    expect(assessBoneDensity(worst).bone_health_score).toBe(0);
    expect(TOOL_049_LIMITS.scoreCeiling).toBe(100);
    expect(TOOL_049_LIMITS.scoreFloor).toBe(0);
  });

  it('reproduces the four band cut-offs exactly', () => {
    for (const score of [0, 39, 40, 59, 60, 79, 80, 100]) {
      expect(bandForScore(score)).toBe(
        score >= 80 ? 'optimal' : score >= 60 ? 'good' : score >= 40 ? 'at-risk' : 'high-risk',
      );
    }
    for (const sample of SAMPLES) {
      const engine = assessBoneDensity(sample);
      expect(bandForScore(engine.bone_health_score)).toBe(engine.band);
    }
    expect(TOOL_049_LIMITS.bandOptimalAtLeast).toBe(80);
    expect(TOOL_049_LIMITS.bandGoodAtLeast).toBe(60);
    expect(TOOL_049_LIMITS.bandAtRiskAtLeast).toBe(40);
  });

  it('reproduces every risk factor the engine can emit, in order', () => {
    for (const sample of SAMPLES) {
      expect(mirroredRiskFactors(sample)).toEqual(assessBoneDensity(sample).risk_factors);
    }

    const factorsFor = (patch: Partial<typeof baseInput>) =>
      assessBoneDensity({ ...baseInput, ...patch }).risk_factors;

    // Each trigger is inclusive/exclusive exactly as the engine documents it.
    expect(factorsFor({ uses_ai_years: 0 })).not.toContain('ai_exposure');
    expect(factorsFor({ uses_ai_years: 0.5 })).toContain('ai_exposure');
    expect(factorsFor({ weekly_resistance_sessions: 2 })).not.toContain('low_resistance_training');
    expect(factorsFor({ weekly_resistance_sessions: 1 })).toContain('low_resistance_training');
    expect(factorsFor({ calcium_mg_daily: 800 })).not.toContain('low_calcium');
    expect(factorsFor({ calcium_mg_daily: 799 })).toContain('low_calcium');
    expect(factorsFor({ vitamin_d_iu_daily: 800 })).not.toContain('low_vitamin_d');
    expect(factorsFor({ vitamin_d_iu_daily: 799 })).toContain('low_vitamin_d');
    expect(factorsFor({ smoker: false })).not.toContain('smoking');
    expect(factorsFor({ smoker: true })).toContain('smoking');
    expect(factorsFor({ age: 50, sex: 'female' })).not.toContain('postmenopausal_proxy');
    expect(factorsFor({ age: 51, sex: 'female' })).toContain('postmenopausal_proxy');
    expect(factorsFor({ age: 65 })).not.toContain('advanced_age');
    expect(factorsFor({ age: 66 })).toContain('advanced_age');

    expect(TOOL_049_LIMITS.resistanceTrainingLowBelow).toBe(2);
    expect(TOOL_049_LIMITS.calciumLowBelow).toBe(800);
    expect(TOOL_049_LIMITS.vitaminDLowBelow).toBe(800);
    expect(TOOL_049_LIMITS.postmenopausalAgeAbove).toBe(50);
    expect(TOOL_049_LIMITS.advancedAgeAbove).toBe(65);
  });

  it('reproduces every intervention the engine can emit, in order', () => {
    for (const sample of SAMPLES) {
      const score = assessBoneDensity(sample).bone_health_score;
      expect(mirroredInterventions(sample, score)).toEqual(assessBoneDensity(sample).interventions);
    }

    const worst = { ...baseInput, age: 90, sex: 'female' as const, uses_ai_years: 30, weekly_resistance_sessions: 0, calcium_mg_daily: 0, vitamin_d_iu_daily: 0, smoker: true };
    const engine = assessBoneDensity(worst);
    expect(engine.interventions).toContain('dxa_scan_discussion');
    expect(engine.interventions).toContain('progressive_resistance_program');
    expect(engine.interventions).toContain('calcium_intake_1000mg');
    expect(engine.interventions).toContain('vitamin_d_1000_2000iu');
    expect(engine.interventions).toContain('smoking_cessation');
    expect(engine.interventions).toContain('review_ai_use_with_physician');

    expect(TOOL_049_LIMITS.resistanceProgramBelow).toBe(3);
    expect(TOOL_049_LIMITS.calciumIntakeBelow).toBe(1000);
    expect(TOOL_049_LIMITS.vitaminDIntakeBelow).toBe(1000);
    expect(TOOL_049_LIMITS.dxaScanBelowScore).toBe(80);
  });

  it('always emits the educational warning and adds the fracture warning below 40', () => {
    for (const sample of SAMPLES) {
      const engine = assessBoneDensity(sample);
      expect(engine.warnings[0]).toBe('educational_screening_not_diagnosis');
      const hasFracture = engine.warnings.includes('high_fracture_risk_consult_physician');
      expect(hasFracture).toBe(engine.bone_health_score < 40);
      expect(engine.warnings.length).toBe(hasFracture ? 2 : 1);
    }
    expect(mirroredWarnings(39)).toEqual(['educational_screening_not_diagnosis', 'high_fracture_risk_consult_physician']);
    expect(mirroredWarnings(40)).toEqual(['educational_screening_not_diagnosis']);
    expect(TOOL_049_LIMITS.highFractureBelowScore).toBe(40);
  });

  it('mirrors the input bounds of the canonical schema', () => {
    const parse = (patch: Record<string, unknown>) =>
      BoneDensityInputSchema.safeParse({ ...baseInput, ...patch }).success;

    expect(parse({ age: TOOL_049_LIMITS.ageMin })).toBe(true);
    expect(parse({ age: TOOL_049_LIMITS.ageMax })).toBe(true);
    expect(parse({ age: TOOL_049_LIMITS.ageMin - 1 })).toBe(false);
    expect(parse({ age: TOOL_049_LIMITS.ageMax + 1 })).toBe(false);

    expect(parse({ uses_ai_years: TOOL_049_LIMITS.usesAiYearsMin })).toBe(true);
    expect(parse({ uses_ai_years: TOOL_049_LIMITS.usesAiYearsMax })).toBe(true);
    expect(parse({ uses_ai_years: TOOL_049_LIMITS.usesAiYearsMin - 1 })).toBe(false);
    expect(parse({ uses_ai_years: TOOL_049_LIMITS.usesAiYearsMax + 1 })).toBe(false);

    expect(parse({ weekly_resistance_sessions: TOOL_049_LIMITS.weeklyResistanceMin })).toBe(true);
    expect(parse({ weekly_resistance_sessions: TOOL_049_LIMITS.weeklyResistanceMax })).toBe(true);
    expect(parse({ weekly_resistance_sessions: TOOL_049_LIMITS.weeklyResistanceMin - 1 })).toBe(false);
    expect(parse({ weekly_resistance_sessions: TOOL_049_LIMITS.weeklyResistanceMax + 1 })).toBe(false);

    expect(parse({ calcium_mg_daily: TOOL_049_LIMITS.calciumMgMin })).toBe(true);
    expect(parse({ calcium_mg_daily: TOOL_049_LIMITS.calciumMgMax })).toBe(true);
    expect(parse({ calcium_mg_daily: TOOL_049_LIMITS.calciumMgMin - 1 })).toBe(false);
    expect(parse({ calcium_mg_daily: TOOL_049_LIMITS.calciumMgMax + 1 })).toBe(false);

    expect(parse({ vitamin_d_iu_daily: TOOL_049_LIMITS.vitaminDMin })).toBe(true);
    expect(parse({ vitamin_d_iu_daily: TOOL_049_LIMITS.vitaminDMax })).toBe(true);
    expect(parse({ vitamin_d_iu_daily: TOOL_049_LIMITS.vitaminDMin - 1 })).toBe(false);
    expect(parse({ vitamin_d_iu_daily: TOOL_049_LIMITS.vitaminDMax + 1 })).toBe(false);

    expect(parse({ sex: 'male' })).toBe(true);
    expect(parse({ sex: 'female' })).toBe(true);
    expect(parse({ sex: 'other' })).toBe(false);
    expect(parse({ smoker: true })).toBe(true);
    expect(parse({ smoker: 'yes' })).toBe(false);
    expect(TOOL_049_LIMITS.unit).toBe('score');
  });

  it('maps every band, risk factor, intervention and warning the engine can emit', () => {
    const bands = new Set<string>();
    const riskFactors = new Set<string>();
    const interventions = new Set<string>();
    const warnings = new Set<string>();

    for (const sample of SAMPLES) {
      const engine = assessBoneDensity(sample);
      bands.add(engine.band);
      engine.risk_factors.forEach((code) => riskFactors.add(code));
      engine.interventions.forEach((code) => interventions.add(code));
      engine.warnings.forEach((code) => warnings.add(code));
    }

    // Add the worst case to cover high-risk + fracture warning.
    const worst = { ...baseInput, age: 90, sex: 'female' as const, uses_ai_years: 30, weekly_resistance_sessions: 0, calcium_mg_daily: 0, vitamin_d_iu_daily: 0, smoker: true };
    const worstEngine = assessBoneDensity(worst);
    bands.add(worstEngine.band);
    worstEngine.risk_factors.forEach((code) => riskFactors.add(code));
    worstEngine.interventions.forEach((code) => interventions.add(code));
    worstEngine.warnings.forEach((code) => warnings.add(code));

    expect(bands.size).toBe(4);
    expect(riskFactors.size).toBe(7);
    expect(interventions.size).toBe(6);
    expect(warnings.size).toBe(2);

    for (const band of bands) {
      const key = bandLabelKey(band);
      expect(key).not.toBe(band);
      expect(key.startsWith('band_')).toBe(true);
    }
    for (const code of riskFactors) {
      const key = riskFactorLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('rf_')).toBe(true);
    }
    for (const code of interventions) {
      const key = interventionLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('iv_')).toBe(true);
    }
    for (const code of warnings) {
      const key = warningLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('warning_')).toBe(true);
    }

    expect(bandLabelKey('unknown')).toBe('band_unknown');
    expect(riskFactorLabelKey('unknown')).toBe('rf_unknown');
    expect(interventionLabelKey('unknown')).toBe('iv_unknown');
    expect(warningLabelKey('unknown')).toBe('warning_unknown');
  });

  it('formats scores without inventing precision', () => {
    expect(formatScore(84)).toBe('84');
    expect(formatScore(0)).toBe('0');
    expect(formatScore(Number.NaN)).toBe('—');
    expect(clamp(10, 0, 100)).toBe(10);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(200, 0, 100)).toBe(100);
  });
});

describe('Tool 049 contract — draft evaluation', () => {
  it('starts EMPTY with no input and no issue', () => {
    const evaluation = evaluateBoneDensityDraft(emptyDraft);
    expect(evaluation.state).toBe('EMPTY');
    expect(evaluation.input).toBeNull();
    expect(evaluation.issues).toEqual([]);
  });

  it('stays PARTIAL until every required field is answered', () => {
    for (const patch of [
      { age: '' },
      { sex: '' as const },
      { usesAiYears: '' },
      { weeklyResistance: '' },
      { calciumMg: '' },
      { vitaminD: '' },
      { smoker: '' as const },
    ]) {
      expect(evaluateBoneDensityDraft({ ...readyDraft, ...patch }).state).toBe('PARTIAL');
    }
  });

  it('treats a typed zero as a real value for the zero-valid fields', () => {
    for (const field of ['usesAiYears', 'weeklyResistance', 'calciumMg', 'vitaminD'] as const) {
      const evaluation = evaluateBoneDensityDraft({ ...readyDraft, [field]: '0' });
      expect(evaluation.state).toBe('READY');
      expect(evaluation.input).not.toBeNull();
    }
    // Age 0 is out of range, not "not answered".
    const ageZero = evaluateBoneDensityDraft({ ...readyDraft, age: '0' });
    expect(ageZero.state).toBe('INVALID');
    expect(ageZero.issues).toContainEqual({ field: 'age', code: 'out_of_range' });
  });

  it('rejects out-of-range values with an out_of_range issue', () => {
    expect(evaluateBoneDensityDraft({ ...readyDraft, age: '17' }).issues).toContainEqual({
      field: 'age',
      code: 'out_of_range',
    });
    expect(evaluateBoneDensityDraft({ ...readyDraft, age: '91' }).issues).toContainEqual({
      field: 'age',
      code: 'out_of_range',
    });
    expect(evaluateBoneDensityDraft({ ...readyDraft, usesAiYears: '31' }).issues).toContainEqual({
      field: 'usesAiYears',
      code: 'out_of_range',
    });
    expect(evaluateBoneDensityDraft({ ...readyDraft, usesAiYears: '-1' }).issues).toContainEqual({
      field: 'usesAiYears',
      code: 'out_of_range',
    });
    expect(evaluateBoneDensityDraft({ ...readyDraft, weeklyResistance: '15' }).issues).toContainEqual({
      field: 'weeklyResistance',
      code: 'out_of_range',
    });
    expect(evaluateBoneDensityDraft({ ...readyDraft, calciumMg: '3001' }).issues).toContainEqual({
      field: 'calciumMg',
      code: 'out_of_range',
    });
    expect(evaluateBoneDensityDraft({ ...readyDraft, vitaminD: '10001' }).issues).toContainEqual({
      field: 'vitaminD',
      code: 'out_of_range',
    });
    expect(evaluateBoneDensityDraft({ ...readyDraft, sex: 'other' as 'male' }).issues).toContainEqual({
      field: 'sex',
      code: 'out_of_range',
    });
    expect(evaluateBoneDensityDraft({ ...readyDraft, smoker: 'maybe' as 'yes' }).issues).toContainEqual({
      field: 'smoker',
      code: 'out_of_range',
    });
  });

  it('rejects non-numeric text in a hand-typed field', () => {
    for (const field of ['age', 'usesAiYears', 'weeklyResistance', 'calciumMg', 'vitaminD'] as const) {
      expect(evaluateBoneDensityDraft({ ...readyDraft, [field]: 'abc' }).issues).toContainEqual({
        field,
        code: 'invalid_number',
      });
    }
  });

  it('keeps the order EMPTY → INVALID → PARTIAL → READY', () => {
    expect(evaluateBoneDensityDraft({ ...emptyDraft, age: '999' }).state).toBe('INVALID');
    expect(evaluateBoneDensityDraft({ ...emptyDraft, age: '30' }).state).toBe('PARTIAL');
  });

  it('produces a READY input that the canonical schema accepts', () => {
    const evaluation = evaluateBoneDensityDraft(readyDraft);
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input).not.toBeNull();
    if (!evaluation.input) throw new Error('expected a ready input');
    expect(BoneDensityInputSchema.safeParse(evaluation.input).success).toBe(true);
    expect(evaluation.input).toEqual(baseInput);
  });
});

describe('Tool 049 contract — content invariants and CSV', () => {
  it('records no approved source and therefore no citation', () => {
    expect(TOOL_049_SOURCES).toEqual([]);
  });

  it('links only to real registered tools and transfers nothing automatically', () => {
    expect(TOOL_049_CROSS_TOOL_LINKS.length).toBeGreaterThan(0);
    for (const link of TOOL_049_CROSS_TOOL_LINKS) {
      expect(() => requireTool(link.targetToolId)).not.toThrow();
      expect(link.transfer).toBe('manual-reentry');
      expect(link.freshnessRule).toMatch(/protocol start date/i);
      expect(link.mappedFields.length).toBeGreaterThan(0);
    }
  });

  it('builds a CSV with the inputs, the result and no session identifier', () => {
    const result = assessBoneDensity(baseInput);
    const csv = buildBoneDensityCsv(baseInput, result, '2026-11-16T10:00:00.000Z');
    expect(csv).toContain('tool,tool-049-bone-density');
    expect(csv).toContain('age,30');
    expect(csv).toContain('sex,male');
    expect(csv).toContain('uses_ai_years,2');
    expect(csv).toContain('weekly_resistance_sessions,4');
    expect(csv).toContain('calcium_mg_daily,1200');
    expect(csv).toContain('vitamin_d_iu_daily,2000');
    expect(csv).toContain('smoker,false');
    expect(csv).toContain('bone_health_score,84');
    expect(csv).toContain('band,optimal');
    expect(csv).toContain('risk_factors,ai_exposure');
    expect(csv).not.toMatch(/sessionid|session_id|userid|user_id|token|email/i);
    expect(csv).not.toContain('0.9');
    expect(csv).not.toMatch(/reference/i);
  });
});
