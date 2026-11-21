// lib/tools/r6/tool-018-hpta-recovery-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-018 (HPTA recovery).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runHPTARecovery,
  calculateHPTARecoveryOutput,
  buildHPTARecoveryOutput,
  hptaRecoveryInputSchema,
  type HPTAMarker,
  type HPTARecoveryState,
} from './tool-018-hpta-recovery-pipeline';
import { assessHPTARecovery } from '@/lib/tools/engines/tool-018-hpta-recovery';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: HPTAMarker[] = [
  {
    date: '2026-09-01T00:00:00.000Z',
    lh_iu_L: 2,
    fsh_iu_L: 1,
    total_test_ng_dL: 150,
    free_test_ng_dL: 5,
    symptoms: 'worsening',
  },
  {
    date: '2026-09-15T00:00:00.000Z',
    lh_iu_L: 12,
    fsh_iu_L: 8,
    total_test_ng_dL: 450,
    free_test_ng_dL: 12,
    symptoms: 'improving',
  },
];

describe('Slice C — tool-018 HPTA recovery end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runHPTARecovery(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-018-hpta-recovery').toolId);
    expect(output.toolSlug).toBe('tool-018-hpta-recovery');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.stage).toBe('fully_recovered');
    expect(output.result.improvement_rate).toBeDefined();
    expect(output.result.markers).toHaveLength(2);

    expect(output.provenance.unit).toBe('marker');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'STAGE')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = assessHPTARecovery(validInput);
    const output = calculateHPTARecoveryOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runHPTARecovery(null as unknown as HPTAMarker[], options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = hptaRecoveryInputSchema.tryParse([{ date: 'not-a-date' as never }]);
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-018-hpta-recovery');
    const engineResult = assessHPTARecovery(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildHPTARecoveryOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
