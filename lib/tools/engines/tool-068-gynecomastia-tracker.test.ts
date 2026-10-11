import { describe, it, expect } from 'vitest';
import { trackGynecomastia } from './tool-068-gynecomastia-tracker';

describe('Tool #068 — Gynecomastia Tracker Engine', () => {
  it('reports none when no symptoms are present', () => {
    const res = trackGynecomastia({
      has_tenderness_or_itching: false,
      has_palpable_lump: false,
      duration_weeks: 0,
      prolactin_involved: false,
    });
    expect(res.progression_stage).toBe('none');
    expect(res.fibrosis_risk).toBe('reversible-early');
    expect(res.escalation_needed).toBe(false);
  });

  it('tracks early budding with high reversibility within 4 weeks', () => {
    const res = trackGynecomastia({
      has_tenderness_or_itching: true,
      has_palpable_lump: true,
      lump_size_cm: 1.0,
      duration_weeks: 4,
      prolactin_involved: true,
    });
    expect(res.progression_stage).toBe('early-budding');
    expect(res.fibrosis_risk).toBe('reversible-early');
    expect(res.escalation_needed).toBe(false);
    expect(res.warnings).toContain('prolactin_co_factor_requires_prl_e2_evaluation');
  });

  it('identifies mature fibrotic stage requiring clinical examination', () => {
    const res = trackGynecomastia({
      has_tenderness_or_itching: false,
      has_palpable_lump: true,
      lump_size_cm: 3.5,
      duration_weeks: 26,
      prolactin_involved: false,
    });
    expect(res.progression_stage).toBe('progressive-glandular');
    expect(res.fibrosis_risk).toBe('established-fibrotic');
    expect(res.escalation_needed).toBe(true);
    expect(res.warnings).toContain('clinical_examination_recommended');
    expect(res.warnings).toContain('fibrotic_tissue_rarely_resolves_pharmacologically');
  });
});
