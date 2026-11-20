// lib/tools/r6/tool-010-compound-stack-builder-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-010 (compound stack builder).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> Output
// Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runCompoundStackBuilder,
  calculateCompoundStackBuilderOutput,
  buildCompoundStackBuilderOutput,
  compoundStackInputSchema,
  type CompoundStack,
} from './tool-010-compound-stack-builder-pipeline';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: CompoundStack = {
  name: 'Test Stack',
  compounds: [
    {
      id: 1,
      name_en: 'Testosterone Enanthate',
      name_ar: 'التستوستيرون إينانتات',
      family: 'testosterone',
      weekly_dose_mg: 250,
      duration_weeks: 12,
      synergy_score: 10,
      aromatization_factor: 1,
      primary_effect: 'mass',
    },
  ],
  total_weekly_dose: 250,
  estimated_suppression: 25,
  synergy_rating: 'positive',
  recommendations: [],
};

describe('Slice C — tool-010 compound stack builder end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput', () => {
    const result = runCompoundStackBuilder(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-010-compound-stack-builder').toolId);
    expect(output.toolSlug).toBe('tool-010-compound-stack-builder');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.name).toBe(validInput.name);
    expect(output.result.compounds).toHaveLength(1);
    expect(output.result.total_weekly_dose).toBe(250);
    expect(output.result.synergy_rating).toBe('positive');

    expect(output.provenance.unit).toBe('stack');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the input exactly (no calculation engine to delegate to)', () => {
    const output = calculateCompoundStackBuilderOutput(validInput, options);
    expect(output.result).toEqual(validInput);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      { ...validInput, compounds: [{ ...validInput.compounds[0], weekly_dose_mg: -1 }] },
      { ...validInput, synergy_rating: 'invalid' as never },
      { unexpected: true as never },
    ];

    for (const bad of badInputs) {
      const result = runCompoundStackBuilder(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before building output', () => {
    const parsed = compoundStackInputSchema.tryParse({ ...validInput, total_weekly_dose: 'not-a-number' as never });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    // Passing only 2 args (missing options) causes options.calculatedAt to throw.
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildCompoundStackBuilderOutput as any)(validInput, validInput),
    ).toThrow();
  });
});
