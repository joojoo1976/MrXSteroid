// lib/tools/r6/tool-009-injection-site-rotator-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-009 (injection site rotator).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runInjectionSiteRotator,
  buildInjectionSiteRotatorOutput,
  injectionSiteRotatorInputSchema,
  type InjectionSiteLogEntry,
} from './tool-009-injection-site-rotator-pipeline';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  date: '2026-09-21T10:00:00.000Z',
  site: 'Deltoid Left',
  location: 'deltoid' as const,
  oil_based: true,
};

describe('Slice C — tool-009 injection site rotator end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runInjectionSiteRotator(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-009-injection-site-rotator').toolId);
    expect(output.toolSlug).toBe('tool-009-injection-site-rotator');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.id).toBe(validInput.id);
    expect(output.result.date).toBe(validInput.date);
    expect(output.result.site).toBe(validInput.site);
    expect(output.result.location).toBe(validInput.location);
    expect(output.result.oil_based).toBe(validInput.oil_based);

    expect(output.provenance.unit).toBe('log_entry');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = { ...validInput } as InjectionSiteLogEntry;
    const output = buildInjectionSiteRotatorOutput(validInput, engineResult, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      { ...validInput, site: '' },
      [ { ...validInput[0], location: 'invalid-location' as unknown as 'deltoid' | 'glute' | 'quad' | 'pectoral' | 'bicep' | 'other' } ],
      [ { ...validInput[0], date: 'not-a-date' as unknown as string } ],
      [ { unexpected: true as unknown as {} } ],
    ];

    for (const bad of badInputs) {
      const result = runInjectionSiteRotator(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = injectionSiteRotatorInputSchema.tryParse({ ...validInput, date: 'not-a-date' as never });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-009-injection-site-rotator');
    const engineResult = { ...validInput } as InjectionSiteLogEntry;
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildInjectionSiteRotatorOutput as any)(validInput, {
        ...options,
        toolSlug: 'Invalid Slug!' as never,
      }),
    ).toThrow();
  });
});
