import { describe, expect, it } from 'vitest';
import { calculateSHBG } from '../engines/tool-015-shbg-modulator';
import { buildSHBGOutput } from './tool-015-shbg-modulator';

describe('buildSHBGOutput', () => {
  it('publishes the calculation with explicit nonclinical provenance and no raw lab inputs', () => {
    const input = { total_testosterone_ng_dL: 500, shbg_nmol_L: 30, albumin_g_dL: 4.3 };
    const result = calculateSHBG(input);
    const output = buildSHBGOutput(input, result, {
      locale: 'en',
      unitSystem: 'metric',
      snapshotType: 'draft',
      calculatedAt: '2026-10-25T00:00:00.000Z',
      recordedAt: '2026-10-25T00:00:00.000Z',
    });

    expect(output.toolSlug).toBe('tool-015-shbg-modulator');
    expect(output.result).toEqual(result);
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.keyFindings.map((finding) => finding.code)).toEqual(expect.arrayContaining([
      'CALCULATED_FREE_TESTOSTERONE',
      'CALCULATED_BIOAVAILABLE_TESTOSTERONE',
      'FREE_TESTOSTERONE_PERCENTAGE',
      'FORMULA_AND_SCOPE',
    ]));
    expect(output.keyFindings).toHaveLength(4);
    expect(JSON.stringify(output.keyFindings)).not.toContain('500');
    expect(JSON.stringify(output.keyFindings)).not.toMatch(/recommend|dosage/i);
  });
});
