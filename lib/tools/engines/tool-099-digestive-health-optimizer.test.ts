import { describe, expect, it } from 'vitest';
import { optimizeDigestiveHealth } from './tool-099-digestive-health-optimizer';

const INPUT = { daily_protein_intake_grams: 150, bloating_or_reflux_frequency: 'rare' as const, bowel_regularity_bristol_score: 4, using_oral_17aa_or_nsaids: false, fermented_food_or_probiotic_intake: true };

describe('Tool #099 — digestive observation log', () => {
  it('records observations without generating a health score or tier', () => {
    expect(optimizeDigestiveHealth(INPUT)).toEqual({ status: 'RECORDED', resultType: 'USER_PROVIDED', ...INPUT });
  });
  it('preserves observations regardless of their combination', () => {
    expect(optimizeDigestiveHealth({ ...INPUT, daily_protein_intake_grams: 280, bloating_or_reflux_frequency: 'severe_daily', bowel_regularity_bristol_score: 1, using_oral_17aa_or_nsaids: true, fermented_food_or_probiotic_intake: false })).toMatchObject({ status: 'RECORDED', resultType: 'USER_PROVIDED', daily_protein_intake_grams: 280, bowel_regularity_bristol_score: 1 });
  });
  it.each([{ ...INPUT, daily_protein_intake_grams: -1 }, { ...INPUT, bowel_regularity_bristol_score: 8 }, { ...INPUT, bowel_regularity_bristol_score: 2.5 }, { ...INPUT, extra: true }])('rejects malformed observations', (value) => { expect(() => optimizeDigestiveHealth(value as never)).toThrow(); });
  it('is deterministic', () => expect(optimizeDigestiveHealth(INPUT)).toEqual(optimizeDigestiveHealth(INPUT)));
});
