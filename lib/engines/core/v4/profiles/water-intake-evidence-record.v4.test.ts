/**
 * lib/engines/core/v4/profiles/water-intake-evidence-record.v4.test.ts
 *
 * R5 first batch, Tool 3 (mrx.tool.water-intake).
 * The 35 mL/kg plus coarse activity adjustment is an application-designed
 * SPEC v3 convention. It is NOT externally validated, carries NO review date,
 * and must never be presented as medical advice.
 */

import { describe, expect, it } from 'vitest';
import { WATER_INTAKE_SPEC_RECORD } from './water-intake-evidence-record.v4';

describe('water intake SPEC v3 documentation record', () => {
  it('registers a stable documentation record with no clinical review', () => {
    expect(WATER_INTAKE_SPEC_RECORD.sourceType).toBe('documentation');
    expect(WATER_INTAKE_SPEC_RECORD.evidenceId).toBe('mrx-spec-v3-water-intake');
    expect(WATER_INTAKE_SPEC_RECORD.reviewStatus).toBe('NOT_REVIEWED');
    expect(WATER_INTAKE_SPEC_RECORD.reviewedAt).toBeNull();
    expect(WATER_INTAKE_SPEC_RECORD.version).toBe('3.0.0');
  });

  it('states the heuristic and excludes medical advice and guarantees', () => {
    expect(
      WATER_INTAKE_SPEC_RECORD.limitations.join(' ')
    ).toMatch(/not clinically validated/i);
    expect(
      WATER_INTAKE_SPEC_RECORD.limitations.join(' ')
    ).toMatch(/not medical advice/i);
    expect(
      WATER_INTAKE_SPEC_RECORD.limitations.join(' ')
    ).toMatch(/climate/i);
  });
});
