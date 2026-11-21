// lib/tools/r6/one-rep-max-pipeline.test.ts
// Slice C pilot — second V6 engine integration (one-rep-max).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runOrm,
  calculateOrmOutput,
  buildOrmOutput,
  ormInputSchema,
  type OneRepMaxOutput,
} from './one-rep-max-pipeline';
import { calculateOneRepMax } from '@/lib/tools/engines/one-rep-max.v6';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput = { weightKg: 100, reps: 5 };

describe('Slice C — one-rep-max end-to-end integration (second V6 engine)', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runOrm(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('one-rep-max').toolId);
    expect(output.toolSlug).toBe('one-rep-max');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    // V6 engine result is authoritative and preserved.
    expect(output.result.oneRepMaxKg).toBeGreaterThan(100);
    expect(output.result.oneRepMaxKg).toBe(116.7); // 100 * (1 + 5/30) = 116.666... → 116.7 (1 dp)

    // Unit metadata + provenance (traceability).
    expect(output.provenance.unit).toBe('kg');
    expect(output.provenance.dataQuality).toBe('medium');
    expect(output.provenance.confidence).toBe(0.85);
    expect(output.provenance.source).toBe('manual');

    // Result-status semantics carried as key finding.
    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateOneRepMax(validInput);
    const output = calculateOrmOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('reps=1 returns the weight unchanged', () => {
    const result = runOrm({ weightKg: 100, reps: 1 }, options);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.output.result.oneRepMaxKg).toBe(100);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      { ...validInput, weightKg: 0 },
      { ...validInput, weightKg: -50 },
      { ...validInput, weightKg: Number.NaN },
      { ...validInput, reps: 0 },
      { ...validInput, reps: 2.5 },
      { ...validInput, reps: 101 },
      { ...validInput, weightKg: 2000 },
      { unexpected: true },
    ];

    for (const bad of badInputs) {
      const result = runOrm(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = ormInputSchema.tryParse({ weightKg: 'not-a-number' as never, reps: 5 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('one-rep-max');
    const engineResult = calculateOneRepMax(validInput);
    expect(() =>
      createToolOutput<OneRepMaxOutput>({
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
          unit: 'kg',
          confidence: 0.85,
          dataQuality: 'medium',
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
