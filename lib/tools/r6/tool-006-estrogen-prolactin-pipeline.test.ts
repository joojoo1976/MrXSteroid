// lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-006 (estrogen/prolactin record).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { createToolOutput, isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runEstrogenProlactin,
  calculateEstrogenProlactinOutput,
  buildEstrogenProlactinOutput,
  estrogenProlactinInputSchema,
  type AromatizationScore,
} from './tool-006-estrogen-prolactin-pipeline';
import { calculateAromatizationRisk } from '@/lib/tools/engines/tool-006-estrogen-prolactin';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput = {
  e2Level: 100,
  e2Unit: 'pg/mL' as const,
  prolactinLevel: 50,
  prolactinUnit: 'ng/mL' as const,
};

describe('Slice C — tool-006 estrogen/prolactin end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runEstrogenProlactin(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-006-estrogen-prolactin').toolId);
    expect(output.toolSlug).toBe('tool-006-estrogen-prolactin');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.status).toBe('NOT_ASSESSED');
    expect(output.result.reasonCode).toBe('UNVALIDATED_RULES');
    expect(output.result.riskLevel).toBeNull();
    expect(output.result.riskPercentage).toBeNull();

    expect(output.provenance.unit).toBe('pg/mL');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateAromatizationRisk(validInput);
    const output = calculateEstrogenProlactinOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      { ...validInput, e2Level: -1 },
      { ...validInput, e2Level: Number.NaN },
      { ...validInput, prolactinLevel: -50 },
      { ...validInput, prolactinLevel: Number.NaN },
      { unexpected: true },
    ];

    for (const bad of badInputs) {
      const result = runEstrogenProlactin(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = estrogenProlactinInputSchema.tryParse({ e2Level: 'not-a-number' as never });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-006-estrogen-prolactin');
    const engineResult = calculateAromatizationRisk(validInput);
    expect(() =>
      createToolOutput<AromatizationScore>({
        toolId: tool.toolId,
        toolSlug: 'Invalid Slug!' as never,
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        accessTier: tool.accessTier,
        snapshotType: options.snapshotType,
        result: engineResult,
        provenance: {
          source: 'manual',
          recordedAt: options.recordedAt,
          timezone: 'UTC',
          unit: 'pg/mL',
          confidence: null,
          dataQuality: 'not_assessed',
        },
        keyFindings: [],
        seoLinks: {
          prevTool: { titleAr: 'سابق', titleEn: 'Previous', slug: 'macro' },
          nextTool: { titleAr: 'التالي', titleEn: 'Next', slug: 'bodyfat' },
        },
      }),
    ).toThrow();
  });
});
