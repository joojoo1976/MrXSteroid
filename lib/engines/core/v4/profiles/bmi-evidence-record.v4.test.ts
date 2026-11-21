/**
 * lib/engines/core/v4/profiles/bmi-evidence-record.v4.test.ts
 *
 * R5 first batch, Tool 1 (mrx.tool.bmi).
 * The body-composition category cut-offs are documented by the CDC. This
 * record cites that guidance as documentation; it is not a validated
 * screening service and claims no clinical review.
 */

import { describe, expect, it } from 'vitest';
import { BMI_DOCUMENTATION_RECORD } from './bmi-evidence-record.v4';

describe('BMI documentation evidence record', () => {
  it('registers a stable documentation record with the real CDC URL', () => {
    expect(BMI_DOCUMENTATION_RECORD.sourceType).toBe('documentation');
    expect(BMI_DOCUMENTATION_RECORD.url).toBe('https://www.cdc.gov/bmi/');
    expect(BMI_DOCUMENTATION_RECORD.evidenceId).toBe('cdc-adult-bmi-categories');
    expect(BMI_DOCUMENTATION_RECORD.version).toBe('2023-12-11');
  });

  it('states the category boundaries used by the engine', () => {
    const applicability = BMI_DOCUMENTATION_RECORD.applicability;
    expect(applicability).toContain('18.5');
    expect(applicability).toContain('25');
    expect(applicability).toContain('30');
  });

  it('claims no clinical review and no measurement authority', () => {
    expect(BMI_DOCUMENTATION_RECORD.reviewStatus).toBe('NOT_REVIEWED');
    expect(BMI_DOCUMENTATION_RECORD.reviewedAt).toBeNull();
    expect(
      BMI_DOCUMENTATION_RECORD.limitations.join(' ')
    ).toMatch(/not a diagnosis/i);
  });
});
