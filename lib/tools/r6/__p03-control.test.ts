import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/shared/schema-contract', () => ({
  createToolSchema: () => ({
    schema: {},
    parse: (raw: unknown) => raw,
    tryParse: (raw: unknown) => ({ ok: true, data: raw }),
  }),
}));

const opts = {
  calculatedAt: '2026-11-18T10:00:00.000Z',
  recordedAt: '2026-11-18T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

describe('P-03 control: an ungated pipeline is detected by the same assertion', () => {
  it('tool-007 (no P-03 gate) accepts a mismatched engine result - control must fail if read as a gate test', async () => {
    const engine = (await import('@/lib/tools/engines/tool-007-bloodwork-analyzer')) as Record<string, any>;
    const pipe = (await import('@/lib/tools/r6/tool-007-bloodwork-analyzer-pipeline')) as Record<string, any>;
    const fn = typeof engine.buildBloodworkSessionV7 === 'function' ? 'buildBloodworkSessionV7' : null;
    expect(fn).not.toBeNull();
    vi.spyOn(engine, fn as string).mockReturnValue({ records: [], __p03_mismatched_engine_result: true } as any);
    const result = pipe.runBloodworkAnalyzer({}, opts);
    // Deliberately expect the UNGATED outcome so the control documents the method's sensitivity.
    expect(result.ok).toBe(true);
    expect(result).toHaveProperty('output');
  });
});

