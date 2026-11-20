/**
 * lib/engines/core/v4/profiles/protein-needs-evidence-record.v4.test.ts
 *
 * R5 first batch, Tool 2 (mrx.tool.protein-needs).
 * The 1.6 / 2.0 / 2.2 g/kg per-goal heuristic is an application-designed
 * SPEC v3 convention. It is NOT externally validated and carries no review
 * date. This record is documentation, not evidence of clinical validity.
 */

import { describe, expect, it } from 'vitest';
import { PROTEIN_NEEDS_SPEC_RECORD } from './protein-needs-evidence-record.v4';

describe('protein needs SPEC v3 documentation record', () => {
  it('registers a stable documentation record with no clinical review', () => {
    expect(PROTEIN_NEEDS_SPEC_RECORD.sourceType).toBe('documentation');
    expect(PROTEIN_NEEDS_SPEC_RECORD.evidenceId).toBe('mrx-spec-v3-protein-needs');
    expect(PROTEIN_NEEDS_SPEC_RECORD.reviewStatus).toBe('NOT_REVIEWED');
    expect(PROTEIN_NEEDS_SPEC_RECORD.reviewedAt).toBeNull();
    expect(PROTEIN_NEEDS_SPEC_RECORD.version).toBe('3.0.0');
  });

  it('states the heuristic and that it is not externally validated', () => {
    expect(PROTEIN_NEEDS_SPEC_RECORD.title.toLowerCase()).toContain('heuristic');
    expect(
      PROTEIN_NEEDS_SPEC_RECORD.applicability.toLowerCase()
    ).not.toMatch(/recommend|prescri/i);
    expect(
      PROTEIN_NEEDS_SPEC_RECORD.limitations.join(' ')
    ).toMatch(/not clinically validated/i);
  });

  it('explicitly excludes medical advice', () => {
    expect(
      PROTEIN_NEEDS_SPEC_RECORD.limitations.join(' ')
    ).toMatch(/not medical advice/i);
  });
});
