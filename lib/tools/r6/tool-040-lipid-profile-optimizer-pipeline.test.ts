// lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-040 (lipid profile optimizer).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runLipidProfileOptimizer,
  calculateLipidProfileOptimizerOutput,
  buildLipidProfileOptimizerOutput,
  lipidProfileOptimizerInputSchema,
  type LipidOptimizerInput,
  type LipidOptimizerResult,
} from './tool-040-lipid-profile-optimizer-pipeline';
import { optimizeLipidProfile } from '@/lib/tools/engines/tool-040-lipid-profile-optimizer';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: LipidOptimizerInput = {
  panel: {
    ldl_mg_dl: 130,
    hdl_mg_dl: 45,
    triglycerides_mg_dl: 180,
  },
  age: 30,
  smoker: false,
  systolic_bp: 120,
  on_cycle: true,
  weeks_remaining: 8,
};

describe('Slice C — tool-040 lipid profile optimizer end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runLipidProfileOptimizer(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-040-lipid-profile-optimizer').toolId);
    expect(output.toolSlug).toBe('tool-040-lipid-profile-optimizer');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.ldl_status).toBeDefined();
    expect(output.result.hdl_status).toBeDefined();
    expect(output.result.tg_status).toBeDefined();
    expect(output.result.overall_band).toBeDefined();
    expect(output.result.non_hdl).toBeGreaterThan(0);
    expect(Array.isArray(output.result.interventions)).toBe(true);

    expect(output.provenance.unit).toBe('mg/dL');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'OVERALL_BAND')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = optimizeLipidProfile(validInput);
    const output = calculateLipidProfileOptimizerOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runLipidProfileOptimizer(null as unknown as LipidOptimizerInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = lipidProfileOptimizerInputSchema.tryParse({ ...validInput, age: 17 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-040-lipid-profile-optimizer');
    const engineResult = optimizeLipidProfile(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildLipidProfileOptimizerOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});

// Appended to lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts
//
// The R6.1 contract MIRRORS the engine's band thresholds so the UI can draw
// the band the engine produced. If the mirror ever disagrees with the engine,
// the tool would show a band the calculation did not produce â€” so the two are
// asserted to agree here.
import { describe, expect, it } from 'vitest';
import { optimizeLipidProfile } from '@/lib/tools/engines/tool-040-lipid-profile-optimizer';
import { TOOL_040_BANDS, type Tool040Band } from './tool-040-lipid-profile-optimizer-contract';

const bandOf = (marker: 'LDL' | 'HDL' | 'TG', value: number): Tool040Band => {
  const steps = TOOL_040_BANDS[marker];
  for (const step of steps) {
    const aboveLower = step.lowerInclusive === null || value >= step.lowerInclusive;
    const belowUpper = step.upperExclusive === null || value < step.upperExclusive;
    if (aboveLower && belowUpper) return step.band;
  }
  throw new Error(`no band matched ${marker}=${value}`);
};

describe('Tool 040 â€” the contract band mirror agrees with the V6 engine', () => {
  it('produces the same LDL band as the engine across the whole range', () => {
    for (const value of [0, 50, 99, 100, 129, 130, 159, 160, 300, 600]) {
      const engine = optimizeLipidProfile({
        panel: { ldl_mg_dl: value, hdl_mg_dl: 60, triglycerides_mg_dl: 100 },
        age: 30, smoker: false, systolic_bp: 120, on_cycle: false, weeks_remaining: 0,
      }).ldl_status;
      expect(bandOf('LDL', value)).toBe(engine);
    }
  });

  it('produces the same HDL band as the engine across the whole range', () => {
    for (const value of [0, 20, 39, 40, 59, 60, 100, 200]) {
      const engine = optimizeLipidProfile({
        panel: { ldl_mg_dl: 100, hdl_mg_dl: value, triglycerides_mg_dl: 100 },
        age: 30, smoker: false, systolic_bp: 120, on_cycle: false, weeks_remaining: 0,
      }).hdl_status;
      expect(bandOf('HDL', value)).toBe(engine);
    }
  });

  it('produces the same triglyceride band as the engine across the whole range', () => {
    for (const value of [0, 100, 149, 150, 199, 200, 499, 500, 1000, 2000]) {
      const engine = optimizeLipidProfile({
        panel: { ldl_mg_dl: 100, hdl_mg_dl: 60, triglycerides_mg_dl: value },
        age: 30, smoker: false, systolic_bp: 120, on_cycle: false, weeks_remaining: 0,
      }).tg_status;
      expect(bandOf('TG', value)).toBe(engine);
    }
  });
});

// Appended to lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts
//
// SPEC-R6.1-2.k — units: the engine performs NO conversion at all, so the
// tool must prove that the entered value is passed through untouched. This is
// the NEGATIVE double-conversion test: the same number must not be converted
// twice (or once) anywhere between the input and the output.
import { describe, expect, it } from 'vitest';
import { runLipidProfileOptimizer } from './tool-040-lipid-profile-optimizer-pipeline';
import { TOOL_040_LIPID_UNIT } from './tool-040-lipid-profile-optimizer-contract';

const conversionOptions = {
  calculatedAt: '2026-11-13T10:00:00.000Z',
  recordedAt: '2026-11-13T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

describe('Tool 040 — units are passed through untouched', () => {
  it('applies no unit conversion: the entered mg/dL value is returned unchanged', () => {
    const outcome = runLipidProfileOptimizer(
      {
        panel: { ldl_mg_dl: 160, hdl_mg_dl: 38, triglycerides_mg_dl: 210 },
        age: 45,
        smoker: true,
        systolic_bp: 145,
        on_cycle: true,
        weeks_remaining: 8,
      },
      conversionOptions,
    );
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error('expected ok');
    // The unit is recorded once, and the value is not multiplied or divided.
    expect(outcome.output.provenance.unit).toBe(TOOL_040_LIPID_UNIT);
    expect(outcome.output.provenance.unit).toBe('mg/dL');
    // The band of 160 mg/dL is the "very-high" band — a converted 160 (for
    // example to mmol/L) would land in a different band, so the band itself
    // is the proof that no conversion happened.
    expect(outcome.output.result.ldl_status).toBe('very-high');
    expect(outcome.output.result.hdl_status).toBe('high');
    expect(outcome.output.result.tg_status).toBe('high');
  });

  it('keeps the non-HDL arithmetic in the same unit (total - HDL, in mg/dL)', () => {
    const withTotal = runLipidProfileOptimizer(
      {
        panel: { ldl_mg_dl: 160, hdl_mg_dl: 38, triglycerides_mg_dl: 210, total_cholesterol_mg_dl: 250 },
        age: 45, smoker: false, systolic_bp: 120, on_cycle: false, weeks_remaining: 0,
      },
      conversionOptions,
    );
    expect(withTotal.ok).toBe(true);
    if (!withTotal.ok) throw new Error('expected ok');
    expect(withTotal.output.result.non_hdl).toBe(250 - 38);
  });

  it('is deterministic: the same input always produces the same output', () => {
    const input = {
      panel: { ldl_mg_dl: 130, hdl_mg_dl: 45, triglycerides_mg_dl: 180 },
      age: 30, smoker: false, systolic_bp: 120, on_cycle: true, weeks_remaining: 8,
    };
    const first = runLipidProfileOptimizer(input, conversionOptions);
    const second = runLipidProfileOptimizer(input, conversionOptions);
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) throw new Error('expected ok');
    expect(first.output.result).toEqual(second.output.result);
    expect(first.output.keyFindings).toEqual(second.output.keyFindings);
  });
});
