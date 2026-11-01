import { describe, expect, it } from 'vitest';
import { calculateHalfLife } from '../engines/tool-016-half-life-calculator';
import { buildHalfLifeOutput } from './tool-016-half-life-calculator';

describe('buildHalfLifeOutput', () => {
  it('does not publish user substance names or source text to the assistant context', () => {
    const input = { compounds: [{ name: 'Sensitive substance name', half_life_days: 5, source: 'Sensitive private source detail' }], remaining_percent: 5 };
    const output = buildHalfLifeOutput(input, calculateHalfLife(input), {
      locale: 'en', unitSystem: 'metric', snapshotType: 'draft',
      calculatedAt: '2026-10-25T00:00:00.000Z', recordedAt: '2026-10-25T00:00:00.000Z',
    });
    expect(output.toolSlug).toBe('tool-016-half-life-calculator');
    expect(output.provenance.confidence).toBeNull();
    expect(output.keyFindings).toHaveLength(2);
    expect(JSON.stringify(output.keyFindings)).not.toContain('Sensitive');
    expect(JSON.stringify(output.keyFindings)).toMatch(/not a clinical clearance/i);
  });
});
