// lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-042 (estrogen management).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runEstrogenManagement,
  calculateEstrogenManagementOutput,
  buildEstrogenManagementOutput,
  estrogenManagementInputSchema,
  type EstrogenInput,
  type EstrogenResult,
} from './tool-042-estrogen-management-pipeline';
import { manageEstrogen } from '@/lib/tools/engines/tool-042-estrogen-management';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: EstrogenInput = {
  e2_pg_ml: 55,
  weekly_testosterone_mg: 500,
  taking_ai: false,
  weekly_ai_dose_mg: 0,
  symptoms: ['nipple_sensitivity', 'water_retention'],
  body_fat_pct: 18,
};

describe('Slice C — tool-042 estrogen management end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runEstrogenManagement(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-042-estrogen-management').toolId);
    expect(output.toolSlug).toBe('tool-042-estrogen-management');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.band).toBeDefined();
    expect(output.result.optimal_range).toBeDefined();
    expect(output.result.ai_delta_mg).toBeDefined();
    expect(output.result.action).toBeDefined();
    expect(Array.isArray(output.result.warnings)).toBe(true);

    expect(output.provenance.unit).toBe('pg/mL');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'ESTROGEN_BAND')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = manageEstrogen(validInput);
    const output = calculateEstrogenManagementOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runEstrogenManagement(null as unknown as EstrogenInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = estrogenManagementInputSchema.tryParse({ ...validInput, e2_pg_ml: 4 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-042-estrogen-management');
    const engineResult = manageEstrogen(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildEstrogenManagementOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
