// lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-048 (cardiovascular risk).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked engine, schema or adapter file.
import { describe, it, expect } from 'vitest';
import { isToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runCardioRisk,
  calculateCardioRiskOutput,
  buildCardioRiskOutput,
  cardioRiskInputSchema,
  CARDIO_RISK_RESULT_UNIT,
  type CardioRiskInput,
  type CardioRiskResult,
} from './tool-048-cardiovascular-risk-pipeline';
import { assessCardiovascularRisk } from '@/lib/tools/engines/tool-048-cardiovascular-risk';

const options = {
  calculatedAt: '2026-11-16T10:00:00.000Z',
  recordedAt: '2026-11-16T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: CardioRiskInput = {
  age: 42,
  sex: 'male',
  smoker: true,
  systolic_bp: 145,
  total_cholesterol: 220,
  hdl: 35,
  on_cycle: true,
};

describe('Slice C — tool-048 cardiovascular risk end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runCardioRisk(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-048-cardiovascular-risk').toolId);
    expect(output.toolSlug).toBe('tool-048-cardiovascular-risk');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    // (42-18)*0.35 + (145-120)*0.08 + (220-180)*0.04 + (45-35)*0.1
    // + smoker 4 + on-cycle 3 + male 1 = 21.0 -> 21
    expect(output.result.risk_pct_10yr).toBe(21);
    expect(output.result.band).toBe('high');
    expect(output.result.drivers).toEqual([
      'blood_pressure',
      'total_cholesterol',
      'low_hdl',
      'smoking',
      'on_cycle_burden',
    ]);
    expect(output.result.mitigations).toEqual([
      'bp_management',
      'lipid_optimization',
      'raise_hdl_cardio',
      'smoking_cessation',
      'cycle_responsibility_bp_lipid_monitoring',
    ]);
    expect(output.result.warnings).toEqual(['educational_not_clinical_ascvd', 'consult_physician']);

    expect(output.provenance.unit).toBe(CARDIO_RISK_RESULT_UNIT);
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((finding) => finding.code === 'RISK_10YR')).toBe(true);
    expect(output.keyFindings.some((finding) => finding.code === 'BAND')).toBe(true);
  });

  it('does not reuse the legacy adapter’s invented confidence or reference range', () => {
    const result = runCardioRisk(validInput, options);
    if (!result.ok) throw new Error('expected ok');
    expect(result.output.provenance.confidence).toBeNull();
    expect(result.output.provenance.referenceRange).toBeUndefined();
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = assessCardiovascularRisk(validInput);
    const output = calculateCardioRiskOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('keeps a low-risk input low and emits only the educational warning', () => {
    const lowInput: CardioRiskInput = {
      age: 25,
      sex: 'female',
      smoker: false,
      systolic_bp: 110,
      total_cholesterol: 150,
      hdl: 60,
      on_cycle: false,
    };
    const result = runCardioRisk(lowInput, options);
    if (!result.ok) throw new Error('expected ok');
    // (25-18)*0.35 = 2.45 -> 2
    expect(result.output.result.risk_pct_10yr).toBe(2);
    expect(result.output.result.band).toBe('low');
    expect(result.output.result.drivers).toEqual([]);
    expect(result.output.result.mitigations).toEqual([]);
    expect(result.output.result.warnings).toEqual(['educational_not_clinical_ascvd']);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runCardioRisk(null, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    expect(cardioRiskInputSchema.tryParse({ ...validInput, age: 17 }).ok).toBe(false);
    expect(cardioRiskInputSchema.tryParse({ ...validInput, systolic_bp: 79 }).ok).toBe(false);
    expect(cardioRiskInputSchema.tryParse({ ...validInput, total_cholesterol: 401 }).ok).toBe(false);
    expect(cardioRiskInputSchema.tryParse({ ...validInput, hdl: 111 }).ok).toBe(false);
    expect(cardioRiskInputSchema.tryParse({ ...validInput, sex: 'other' }).ok).toBe(false);
    expect(cardioRiskInputSchema.tryParse({ ...validInput, smoker: 'yes' }).ok).toBe(false);
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const engineResult = assessCardiovascularRisk(validInput);
    expect(() =>
      buildCardioRiskOutput(validInput, engineResult, {
        ...options,
        calculatedAt: 'not-an-iso-timestamp',
      }),
    ).toThrow();
    expect(() =>
      buildCardioRiskOutput(validInput, engineResult, {
        ...options,
        locale: 'fr' as 'en',
      }),
    ).toThrow();
  });

  it('keeps the engine result type stable for the pipeline export', () => {
    const engineResult: CardioRiskResult = assessCardiovascularRisk(validInput);
    expect(engineResult.risk_pct_10yr).toBe(21);
    expect(engineResult.band).toBe('high');
    expect(engineResult.warnings).toContain('educational_not_clinical_ascvd');
  });
});
