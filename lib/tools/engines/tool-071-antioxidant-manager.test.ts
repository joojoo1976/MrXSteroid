import { describe, it, expect } from 'vitest';
import {
  assessAntioxidantDiversity,
  ANTIOXIDANT_CATEGORIES,
  type AntioxidantInput,
} from './tool-071-antioxidant-manager';

const none: AntioxidantInput = {
  berries: false,
  citrus: false,
  leafy_greens: false,
  cruciferous: false,
  nuts_seeds: false,
  olive_oil: false,
  spices_herbs: false,
  green_tea: false,
  dark_chocolate: false,
  legumes: false,
  whole_grains: false,
  fatty_fish: false,
};

const all = Object.fromEntries(ANTIOXIDANT_CATEGORIES.map((k) => [k, true])) as unknown as AntioxidantInput;

describe('tool-071 Antioxidant Manager', () => {
  it('zero categories gives a low score', () => {
    const r = assessAntioxidantDiversity(none);
    expect(r.diversity_score).toBe(0);
    expect(r.band).toBe('low');
    expect(r.categories_met).toBe(0);
  });

  it('all categories gives a full score', () => {
    const r = assessAntioxidantDiversity(all);
    expect(r.diversity_score).toBe(100);
    expect(r.band).toBe('high');
    expect(r.categories_total).toBe(12);
  });

  it('half the categories yields a moderate score', () => {
    const half = { ...none };
    ANTIOXIDANT_CATEGORIES.slice(0, 6).forEach((k) => (half[k] = true));
    const r = assessAntioxidantDiversity(half);
    expect(r.diversity_score).toBe(50);
    expect(r.band).toBe('moderate');
  });

  it('always carries an educational notice and empty safety flags by default', () => {
    const r = assessAntioxidantDiversity(none);
    expect(r.educational_notice.length).toBeGreaterThan(0);
    expect(r.safety_flags).toEqual([]);
  });

  it('never recommends a supplement dose', () => {
    const text = assessAntioxidantDiversity(none).recommendations.join(' ');
    expect(text).not.toMatch(/\b\d+\s?(iu|mg|mcg)\b/i);
  });
});
