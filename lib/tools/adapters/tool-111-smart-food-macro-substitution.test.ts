/**
 * lib/tools/adapters/tool-111-smart-food-macro-substitution.test.ts
 * Tool #111 — Layer 2 + Layer 3 tests: schema boundary, canonical envelope,
 * severity findings and registry-driven SEO links.
 */
import { describe, it, expect } from 'vitest';
import {
  type AdherenceLevel,
  type EngineInput,
  type SubstitutionResult,
} from '../engines/staging/tool-111-smart-food-macro-substitution-engine';
import { Tool111InputSchema, tryParseTool111Input, parseTool111Input, DEFAULT_TOOL_111_INPUT } from '../schemas/tool-111-smart-food-macro-substitution';
import {
  buildTool111KeyFindings,
  buildTool111Output,
  buildTool111Provenance,
  MACRO_REFERENCE_UNIT,
  tool111Adapter,
} from './tool-111-smart-food-macro-substitution';

const validInput: EngineInput = { ...DEFAULT_TOOL_111_INPUT };

const buildOutput = (snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection' = 'dashboard_projection') =>
  buildTool111Output(validInput, {
    locale: 'ar',
    unitSystem: 'metric',
    snapshotType,
    calculatedAt: '2026-10-16T10:00:00.000Z',
    recordedAt: '2026-10-16T08:00:00.000Z',
  });
describe('Tool #111 — Layer 2 schema boundary', () => {
  it('accepts the canonical default input', () => {
    const result = tryParseTool111Input(DEFAULT_TOOL_111_INPUT);
    if (!result.ok) {
      console.log('Validation errors:', JSON.stringify(result.error.issues, null, 2));
    }
    expect(result.ok).toBe(true);
  });

  it('rejects out-of-range quantity', () => {
    expect(tryParseTool111Input({ ...validInput, originalQuantity: 0 }).ok).toBe(false);
    expect(tryParseTool111Input({ ...validInput, originalQuantity: -10 }).ok).toBe(false);
    expect(tryParseTool111Input({ ...validInput, originalQuantity: 10001 }).ok).toBe(false);
  });

  it('rejects invalid unit', () => {
    expect(tryParseTool111Input({ ...validInput, originalUnit: 'invalid' as never }).ok).toBe(false);
  });

  it('rejects unknown enum values and unknown keys, with Arabic messages on numeric fields', () => {
    expect(Tool111InputSchema.safeParse({ ...validInput, hacker: true }).success).toBe(false);

    const arabic = tryParseTool111Input({ ...validInput, originalQuantity: 0 });
    expect(arabic.ok).toBe(false);
    if (!arabic.ok) expect(arabic.error.issues[0].message).toContain('موجب');
  });

  it('validates FoodItem structure', () => {
    const invalidFood = { ...validInput, originalFood: { ...validInput.originalFood, id: '' } };
    expect(tryParseTool111Input(invalidFood).ok).toBe(false);

    const invalidMacros = { ...validInput, originalFood: { ...validInput.originalFood, macrosPer100g: { protein: -1, carbs: 0, fat: 0, calories: 0 } } };
    expect(tryParseTool111Input(invalidMacros).ok).toBe(false);
  });

  it('accepts optional targetMacros', () => {
    const withTargets = tryParseTool111Input({ ...validInput, targetMacros: { protein: 50, carbs: 100, fat: 30, calories: 900 } });
    expect(withTargets.ok).toBe(true);

    const withoutTargets = tryParseTool111Input({ ...validInput });
    expect(withoutTargets.ok).toBe(true);
  });

  it('validates locale and unitSystem', () => {
    expect(tryParseTool111Input({ ...validInput, locale: 'ar' }).ok).toBe(true);
    expect(tryParseTool111Input({ ...validInput, locale: 'en' }).ok).toBe(true);
    expect(tryParseTool111Input({ ...validInput, locale: 'fr' as never }).ok).toBe(false);

    expect(tryParseTool111Input({ ...validInput, unitSystem: 'metric' }).ok).toBe(true);
    expect(tryParseTool111Input({ ...validInput, unitSystem: 'imperial' }).ok).toBe(true);
    expect(tryParseTool111Input({ ...validInput, unitSystem: 'custom' as never }).ok).toBe(false);
  });
});
describe('Tool #111 — Layer 3 canonical envelope', () => {
  it('wraps the engine result in the registry-derived envelope', () => {
    const output = buildOutput();

    expect(output.toolId).toBe('mrx.tool.smart-food-macro-substitution');
    expect(output.toolSlug).toBe('smart-food-macro-substitution');
    expect(output.accessTier).toBe('free');
    // neighbors: tool-110-ai-meal-vision-scanner (1260) <-> smart-food-macro-substitution (1270)
    expect(output.seoLinks.prevTool.slug).toBe('tool-110-ai-meal-vision-scanner');
    expect(output.result.substituteQuantity).toBeGreaterThan(0);
    expect(output.calculatedAt).toBe('2026-10-16T10:00:00.000Z');
    expect(output.locale).toBe('ar');
    expect(output.unitSystem).toBe('metric');
  });

  it('supports all three snapshot types', () => {
    const draft = buildOutput('draft');
    const submitted = buildOutput('submitted_snapshot');
    const projection = buildOutput('dashboard_projection');

    expect(draft.snapshotType).toBe('draft');
    expect(submitted.snapshotType).toBe('submitted_snapshot');
    expect(projection.snapshotType).toBe('dashboard_projection');
  });

  it('severity-ranks findings correctly', () => {
    const baseResult: SubstitutionResult = {
      substituteQuantity: 150,
      substituteUnit: 'g',
      equivalenceRatio: 1.5,
      originalMacros: { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
      substituteMacros: { protein: 20, carbs: 5, fat: 10, calories: 180 },
      macroDeltas: { protein: -11, carbs: 5, fat: 6.4, calories: 15, proteinPct: -35, carbsPct: 0, fatPct: 178, caloriesPct: 9 },
      equivalenceScore: 45,
      equivalenceLevel: 'poor',
      calorieDifference: 15,
      proteinDifference: -11,
      carbsDifference: 5,
      fatDifference: 6.4,
      targetAdherence: undefined,
      warnings: [],
      limitations: [],
      metadata: {
        calculationTimestamp: '2026-10-16T10:00:00.000Z',
        engineVersion: '1.0.0',
        dataSources: ['USDA', 'USDA'],
        calculationTimeMs: 1,
        unitSystem: 'metric',
        locale: 'en',
      },
    };

    const findings = buildTool111KeyFindings(baseResult, validInput);
    const equivalenceFinding = findings.find((f) => f.code === 'EQUIVALENCE_SCORE');
    expect(equivalenceFinding?.severity).toBe('important');
  });

  it('carries the reference range and injected timezone in provenance', () => {
    const provenance = buildTool111Provenance({
      locale: 'ar',
      unitSystem: 'metric',
      snapshotType: 'draft',
      calculatedAt: '2026-10-16T10:00:00.000Z',
      recordedAt: '2026-10-16T10:00:00.000Z',
      timezone: 'Africa/Cairo',
      provenanceSource: 'manual',
      originalFoodSource: 'USDA',
      substituteFoodSource: 'USDA',
    });

    expect(provenance.referenceRange?.low).toBe(0);
    expect(provenance.referenceRange?.high).toBe(100);
    expect(provenance.referenceRange?.unit).toBe('%');
    expect(provenance.confidence).toBe(0.9);
    expect(provenance.measurementMethod).toBe('simulated model estimate');
    expect(provenance.timezone).toBe('Africa/Cairo');
    expect(provenance.originalUnit).toBe(MACRO_REFERENCE_UNIT);
  });

  it('includes target adherence finding when targets provided', () => {
    const inputWithTargets: EngineInput = {
      ...validInput,
      targetMacros: { protein: 30, carbs: 10, fat: 5, calories: 200 },
    };
    const output = buildTool111Output(inputWithTargets, {
      locale: 'en',
      unitSystem: 'metric',
      snapshotType: 'dashboard_projection',
      calculatedAt: '2026-10-16T10:00:00.000Z',
      recordedAt: '2026-10-16T08:00:00.000Z',
    });

    const adherenceFinding = output.keyFindings.find((f) => f.code === 'TARGET_ADHERENCE');
    expect(adherenceFinding).toBeDefined();
    expect(['on_target', 'slightly_off', 'moderately_off', 'significantly_off']).toContain(adherenceFinding?.value);
  });
});
describe('Tool #111 — Warnings & Limitations findings', () => {
  it('includes warnings as findings when severity is high', () => {
    const baseResult: SubstitutionResult = {
      substituteQuantity: 150,
      substituteUnit: 'g',
      equivalenceRatio: 1.5,
      originalMacros: { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
      substituteMacros: { protein: 20, carbs: 5, fat: 10, calories: 500 },
      macroDeltas: { protein: -11, carbs: 5, fat: 6.4, calories: 335, proteinPct: -35, carbsPct: 0, fatPct: 178, caloriesPct: 203 },
      equivalenceScore: 45,
      equivalenceLevel: 'poor',
      calorieDifference: 335,
      proteinDifference: -11,
      carbsDifference: 5,
      fatDifference: 6.4,
      targetAdherence: undefined,
      warnings: [
        { code: 'HIGH_CALORIE_DIFF', message: 'High calorie difference' },
      ],
      limitations: [],
      metadata: {
        calculationTimestamp: '2026-10-16T10:00:00.000Z',
        engineVersion: '1.0.0',
        dataSources: ['USDA', 'USDA'],
        calculationTimeMs: 1,
        unitSystem: 'metric',
        locale: 'en',
      },
    };

    const findings = buildTool111KeyFindings(baseResult, validInput);
    const warningFinding = findings.find((f) => f.code === 'WARNING_HIGH_CALORIE_DIFF');
    expect(warningFinding).toBeDefined();
    expect(warningFinding?.severity).toBe('important');
  });

  it('includes limitations as findings', () => {
    const baseResult: SubstitutionResult = {
      substituteQuantity: 150,
      substituteUnit: 'g',
      equivalenceRatio: 1.5,
      originalMacros: { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
      substituteMacros: { protein: 20, carbs: 5, fat: 10, calories: 180 },
      macroDeltas: { protein: -11, carbs: 5, fat: 6.4, calories: 15, proteinPct: -35, carbsPct: 0, fatPct: 178, caloriesPct: 9 },
      equivalenceScore: 80,
      equivalenceLevel: 'good',
      calorieDifference: 15,
      proteinDifference: -11,
      carbsDifference: 5,
      fatDifference: 6.4,
      targetAdherence: undefined,
      warnings: [],
      limitations: [
        { code: 'ESTIMATED_VALUES', message: 'Estimated values' },
      ],
      metadata: {
        calculationTimestamp: '2026-10-16T10:00:00.000Z',
        engineVersion: '1.0.0',
        dataSources: ['USDA', 'USDA'],
        calculationTimeMs: 1,
        unitSystem: 'metric',
        locale: 'en',
      },
    };

    const findings = buildTool111KeyFindings(baseResult, validInput);
    const limitationFinding = findings.find((f) => f.code === 'LIMITATION_ESTIMATED_VALUES');
    expect(limitationFinding).toBeDefined();
    expect(limitationFinding?.severity).toBe('info');
  });

  it('includes data quality finding when quality is low', () => {
    const baseResult: SubstitutionResult = {
      substituteQuantity: 150,
      substituteUnit: 'g',
      equivalenceRatio: 1.5,
      originalMacros: { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
      substituteMacros: { protein: 20, carbs: 5, fat: 10, calories: 180 },
      macroDeltas: { protein: -11, carbs: 5, fat: 6.4, calories: 15, proteinPct: -35, carbsPct: 0, fatPct: 178, caloriesPct: 9 },
      equivalenceScore: 80,
      equivalenceLevel: 'good',
      calorieDifference: 15,
      proteinDifference: -11,
      carbsDifference: 5,
      fatDifference: 6.4,
      targetAdherence: undefined,
      warnings: [],
      limitations: [],
      metadata: {
        calculationTimestamp: '2026-10-16T10:00:00.000Z',
        engineVersion: '1.0.0',
        dataSources: ['USDA', 'USDA'],
        calculationTimeMs: 1,
        unitSystem: 'metric',
        locale: 'en',
      },
    };

    const lowQualityInput: EngineInput = {
      ...validInput,
      substituteFood: { ...validInput.substituteFood, dataQuality: 'low' },
    };

    const findings = buildTool111KeyFindings(baseResult, lowQualityInput);
    const dataQualityFinding = findings.find((f) => f.code === 'DATA_QUALITY_LOW');
    expect(dataQualityFinding).toBeDefined();
    expect(dataQualityFinding?.severity).toBe('monitor');
  });
});

describe('Tool #111 — Adapter pipeline', () => {
  it('tool111Adapter.parseInput validates correctly', () => {
    const result = tool111Adapter.parseInput(validInput);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.originalQuantity).toBe(100);
  });

  it('tool111Adapter.parseInput rejects invalid input', () => {
    const result = tool111Adapter.parseInput({ ...validInput, originalQuantity: 0 });
    expect(result.ok).toBe(false);
  });

  it('tool111Adapter.execute runs full pipeline', () => {
    const result = tool111Adapter.execute(validInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output.toolSlug).toBe('smart-food-macro-substitution');
      expect(result.output.result.substituteQuantity).toBeGreaterThan(0);
    }
  });

  it('tool111Adapter.execute rejects invalid input', () => {
    const result = tool111Adapter.execute({ ...validInput, originalQuantity: 0 });
    expect(result.ok).toBe(false);
  });
});

describe('Tool #111 — TARGET_ADHERENCE labels (BR-1)', () => {
  const adherenceResult = (overall: AdherenceLevel): SubstitutionResult => ({
    substituteQuantity: 150,
    substituteUnit: 'g',
    equivalenceRatio: 1.5,
    originalMacros: { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
    substituteMacros: { protein: 20, carbs: 5, fat: 10, calories: 180 },
    macroDeltas: { protein: -11, carbs: 5, fat: 6.4, calories: 15, proteinPct: -35, carbsPct: 0, fatPct: 178, caloriesPct: 9 },
    equivalenceScore: 80,
    equivalenceLevel: 'good',
    calorieDifference: 15,
    proteinDifference: -11,
    carbsDifference: 5,
    fatDifference: 6.4,
    targetAdherence: { protein: overall, carbs: overall, fat: overall, calories: overall, overall },
    warnings: [],
    limitations: [],
    metadata: {
      calculationTimestamp: '2026-10-16T10:00:00.000Z',
      engineVersion: '1.0.0',
      dataSources: ['USDA', 'USDA'],
      calculationTimeMs: 1,
      unitSystem: 'metric',
      locale: 'en',
    },
  });

  const ADHERENCE_CASES: Array<{ level: AdherenceLevel; ar: string; en: string }> = [
    { level: 'on_target', ar: 'ضمن الهدف', en: 'On target' },
    { level: 'slightly_off', ar: 'بعيد قليلاً', en: 'Slightly off' },
    { level: 'moderately_off', ar: 'بعيد بدرجة متوسطة', en: 'Moderately off' },
    { level: 'significantly_off', ar: 'بعيد بشكل كبير', en: 'Significantly off' },
  ];

  it.each(ADHERENCE_CASES)(
    'localizes $level in AR/EN and preserves the raw value',
    ({ level, ar, en }) => {
      const findings = buildTool111KeyFindings(adherenceResult(level), validInput);
      const finding = findings.find((f) => f.code === 'TARGET_ADHERENCE');
      expect(finding).toBeDefined();
      expect(finding?.value).toBe(level);
      expect(finding?.labelEn).toBe(`Target adherence: ${en}`);
      expect(finding?.labelAr).toBe(`تحقيق المستهدفات: ${ar}`);
      expect(finding?.labelEn).not.toContain(level);
      expect(finding?.labelAr).not.toContain(level);
    },
  );

  it('never leaks a raw adherence value into any finding label', () => {
    const rawValues: AdherenceLevel[] = ['on_target', 'slightly_off', 'moderately_off', 'significantly_off'];
    const findings = buildTool111KeyFindings(adherenceResult('significantly_off'), validInput);
    const labels = findings.flatMap((f) => [f.labelAr, f.labelEn]);
    for (const raw of rawValues) {
      expect(labels.some((label) => label.includes(raw))).toBe(false);
    }
  });

  it('keeps the engine result and severity mapping unchanged', () => {
    const severityFor = (level: AdherenceLevel) =>
      buildTool111KeyFindings(adherenceResult(level), validInput)
        .find((f) => f.code === 'TARGET_ADHERENCE')?.severity;
    expect(severityFor('on_target')).toBe('info');
    expect(severityFor('slightly_off')).toBe('monitor');
    expect(severityFor('moderately_off')).toBe('important');
    expect(severityFor('significantly_off')).toBe('important');
  });
});