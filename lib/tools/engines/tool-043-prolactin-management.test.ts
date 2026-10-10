import { describe, it, expect } from 'vitest';
import { manageProlactin } from './tool-043-prolactin-management';

describe('tool-043 prolactin management engine', () => {
  it('high prolactin with no current cabergoline suggests starting low', () => {
    const r = manageProlactin({ prolactin_ng_ml: 30, uses_19_nor: true, weekly_cabergoline_mcg: 0, symptoms: ['libido_loss'] });
    expect(r.band).toBe('high');
    expect(r.suggested_weekly_mcg).toBe(250);
    expect(r.action).toBe('start_low');
    expect(r.warnings).toContain('19nor_compounds_raise_prolactin');
  });

  it('normal prolactin on an existing dose below 8 ng/mL is a pause candidate', () => {
    const r = manageProlactin({ prolactin_ng_ml: 6, uses_19_nor: false, weekly_cabergoline_mcg: 250, symptoms: [] });
    expect(r.band).toBe('normal');
    expect(r.action).toBe('pause');
    expect(r.suggested_weekly_mcg).toBe(0);
  });

  it('extreme prolactin escalates to physician', () => {
    const r = manageProlactin({ prolactin_ng_ml: 120, uses_19_nor: false, weekly_cabergoline_mcg: 500, symptoms: ['galactorrhea'] });
    expect(r.band).toBe('very-high');
    expect(r.action).toBe('adjust');
    expect(r.warnings).toContain('prolactin_extreme_imaging_discussed_with_physician');
  });
});
