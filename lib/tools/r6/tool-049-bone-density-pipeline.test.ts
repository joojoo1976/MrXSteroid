// lib/tools/r6/tool-049-bone-density-pipeline.test.ts
import { describe, it, expect } from 'vitest';
import { isToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runBoneDensity,
  calculateBoneDensityOutput,
  buildBoneDensityOutput,
  boneDensityInputSchema,
  BONE_DENSITY_RESULT_UNIT,
  type BoneDensityInput,
  type BoneDensityResult,
} from './tool-049-bone-density-pipeline';
import { assessBoneDensity } from '@/lib/tools/engines/tool-049-bone-density';

const options = {
  calculatedAt: '2026-11-16T10:00:00.000Z',
  recordedAt: '2026-11-16T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: BoneDensityInput = {
  age: 30,
  sex: 'male',
  uses_ai_years: 2,
  weekly_resistance_sessions: 4,
  calcium_mg_daily: 1200,
  vitamin_d_iu_daily: 2000,
  smoker: false,
};

describe('Slice C — tool-049 bone density end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runBoneDensity(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-049-bone-density').toolId);
    expect(output.toolSlug).toBe('tool-049-bone-density');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    // 60 + min(20,12) + min(15,12) + min(15,5) - 2*2.5 = 60+12+12+5-5 = 84
    expect(output.result.bone_health_score).toBe(84);
    expect(output.result.band).toBe('optimal');
    expect(output.result.risk_factors).toEqual(['ai_exposure']);
    expect(output.result.interventions).toContain('review_ai_use_with_physician');
    expect(output.result.interventions).not.toContain('dxa_scan_discussion');
    expect(output.result.warnings).toEqual(['educational_screening_not_diagnosis']);

    expect(output.provenance.unit).toBe(BONE_DENSITY_RESULT_UNIT);
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((finding) => finding.code === 'BONE_SCORE')).toBe(true);
    expect(output.keyFindings.some((finding) => finding.code === 'BAND')).toBe(true);
  });

  it('does not reuse the legacy adapter’s invented confidence or reference range', () => {
    const result = runBoneDensity(validInput, options);
    if (!result.ok) throw new Error('expected ok');
    expect(result.output.provenance.confidence).toBeNull();
    expect(result.output.provenance.referenceRange).toBeUndefined();
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = assessBoneDensity(validInput);
    const output = calculateBoneDensityOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('clamps a worst-case input to 0 (high-risk)', () => {
    const worst: BoneDensityInput = {
      age: 90,
      sex: 'female',
      uses_ai_years: 30,
      weekly_resistance_sessions: 0,
      calcium_mg_daily: 0,
      vitamin_d_iu_daily: 0,
      smoker: true,
    };
    const result = runBoneDensity(worst, options);
    if (!result.ok) throw new Error('expected ok');
    expect(result.output.result.bone_health_score).toBe(0);
    expect(result.output.result.band).toBe('high-risk');
    expect(result.output.result.warnings).toContain('high_fracture_risk_consult_physician');
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runBoneDensity(null, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    expect(boneDensityInputSchema.tryParse({ ...validInput, age: 17 }).ok).toBe(false);
    expect(boneDensityInputSchema.tryParse({ ...validInput, uses_ai_years: 31 }).ok).toBe(false);
    expect(boneDensityInputSchema.tryParse({ ...validInput, weekly_resistance_sessions: 15 }).ok).toBe(false);
    expect(boneDensityInputSchema.tryParse({ ...validInput, calcium_mg_daily: 3001 }).ok).toBe(false);
    expect(boneDensityInputSchema.tryParse({ ...validInput, vitamin_d_iu_daily: 10001 }).ok).toBe(false);
    expect(boneDensityInputSchema.tryParse({ ...validInput, sex: 'other' }).ok).toBe(false);
    expect(boneDensityInputSchema.tryParse({ ...validInput, smoker: 'yes' }).ok).toBe(false);
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const engineResult = assessBoneDensity(validInput);
    expect(() =>
      buildBoneDensityOutput(validInput, engineResult, {
        ...options,
        calculatedAt: 'not-an-iso-timestamp',
      }),
    ).toThrow();
    expect(() =>
      buildBoneDensityOutput(validInput, engineResult, {
        ...options,
        locale: 'fr' as 'en',
      }),
    ).toThrow();
  });

  it('keeps the engine result type stable for the pipeline export', () => {
    const engineResult: BoneDensityResult = assessBoneDensity(validInput);
    expect(engineResult.bone_health_score).toBe(84);
    expect(engineResult.band).toBe('optimal');
    expect(engineResult.warnings).toContain('educational_screening_not_diagnosis');
  });
});
