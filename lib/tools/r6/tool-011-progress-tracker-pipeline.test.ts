// lib/tools/r6/tool-011-progress-tracker-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-011 (progress tracker).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runProgressTracker,
  calculateProgressTrackerOutput,
  progressTrackerInputSchema,
  type ProgressEntry,
  type ProgressTrend,
} from './tool-011-progress-tracker-pipeline';
import { calculateProgress } from '@/lib/tools/engines/tool-011-progress-tracker';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: ProgressEntry[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    date: '2026-09-01T00:00:00.000Z',
    weight_kg: 80,
    strength_kg: 60,
    body_fat_pct: 15,
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    date: '2026-09-15T00:00:00.000Z',
    weight_kg: 82,
    strength_kg: 65,
    body_fat_pct: 14,
  },
];

describe('Slice C — tool-011 progress tracker end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runProgressTracker(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-011-progress-tracker').toolId);
    expect(output.toolSlug).toBe('tool-011-progress-tracker');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result).toHaveLength(3);
    expect(output.provenance.unit).toBe('trend');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateProgress(validInput);
    const output = calculateProgressTrackerOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runProgressTracker(null as unknown as ProgressEntry[], options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = progressTrackerInputSchema.tryParse([{ date: 'not-a-date' as never }]);
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-011-progress-tracker');
    const engineResult = calculateProgress(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildProgressTrackerOutput as any)(validInput, {
        ...options,
        toolSlug: 'Invalid Slug!' as never,
      }),
    ).toThrow();
  });
});
