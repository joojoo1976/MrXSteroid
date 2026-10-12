import { describe, it, expect } from 'vitest';
import { buildReadinessChecklist, type ReadinessInput } from './tool-109-competition-readiness-posing-os';

const base: ReadinessInput = {
  gender: 'male',
  show_type: 'bodybuilding',
  experience_years: 4,
  prep_phase: 'peak_week',
  tan_maintenance: 'auto',
  has_stage_photo_session: true,
};

describe('Tool #109 - Competition Readiness & Stage Posing OS', () => {
  it('builds a non-empty checklist with unique keys', () => {
    const r = buildReadinessChecklist(base);
    expect(r.checklist.length).toBeGreaterThan(0);
    const keys = r.checklist.map((i) => i.item_key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('appends the stage-photo item only when a session was held', () => {
    const withSession = buildReadinessChecklist(base);
    const without = buildReadinessChecklist({ ...base, has_stage_photo_session: false });
    expect(withSession.checklist.find((i) => i.item_key === 'show_day_selfie_and_props_reference')?.done).toBe(true);
    expect(without.checklist.find((i) => i.item_key === 'show_day_selfie_and_props_reference')?.done).toBe(false);
  });

  it('counts checklist items by category consistently', () => {
    const r = buildReadinessChecklist(base);
    const summed = Object.values(r.count_by_category).reduce((a, b) => a + b, 0);
    expect(summed).toBe(r.checklist.length);
    expect(Object.keys(r.count_by_category).length).toBeGreaterThan(0);
  });

  it('filters bikini-specific items out of the physique show type', () => {
    const physique = buildReadinessChecklist({ ...base, show_type: 'physique' });
    expect(physique.checklist.some((i) => i.item_key.includes('bikini'))).toBe(false);
    // Bodybuilding keeps every base item.
    const bb = buildReadinessChecklist({ ...base, show_type: 'bodybuilding' });
    expect(bb.checklist.some((i) => i.item_key.includes('bikini'))).toBe(false);
  });

  it('tiers readiness by years of stage experience', () => {
    expect(buildReadinessChecklist({ ...base, experience_years: 0 }).readiness_tier).toBe('requires_planning');
    expect(buildReadinessChecklist({ ...base, experience_years: 1 }).readiness_tier).toBe('needs_review');
    expect(buildReadinessChecklist({ ...base, experience_years: 2 }).readiness_tier).toBe('needs_review');
    expect(buildReadinessChecklist({ ...base, experience_years: 3 }).readiness_tier).toBe('ready_reference');
    expect(buildReadinessChecklist({ ...base, experience_years: 9 }).readiness_tier).toBe('ready_reference');
  });

  it('defaults every checklist item to not-done', () => {
    const r = buildReadinessChecklist({ ...base, has_stage_photo_session: false });
    expect(r.checklist.every((i) => i.done === false)).toBe(true);
  });

  it('never presents the checklist as a stage directive or prescription', () => {
    const r = buildReadinessChecklist(base);
    expect(r.scope_notice).toBe('educational_competition_readiness_checklist_not_a_stage_directive_or_prescription');
    expect(r.education_flags).toContain('checklist_is_reference_only_not_a_custom_stage_directive');
  });
});
