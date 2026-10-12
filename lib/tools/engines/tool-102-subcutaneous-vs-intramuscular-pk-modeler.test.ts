import { describe, it, expect } from 'vitest';
import {
  batemanConcentration,
  calculateSubqVsIm,
  estimatePeakTime,
  ROUTE_KA,
  SITE_PROFILES,
  type SubqVsImInput,
} from './tool-102-subcutaneous-vs-intramuscular-pk-modeler';

const baseInput: SubqVsImInput = {
  dose_mg: 250,
  concentration_mg_ml: 250,
  site_anatomy: 'ventrogluteal',
  elimination_half_life_days: 4.5,
  injection_interval_days: 7,
};

describe('Tool #102 - Subcutaneous vs. Intramuscular PK Modeler', () => {
  it('models Bateman absorption: zero at t=0, positive and peaking later for subQ', () => {
    expect(batemanConcentration(250, 'intramuscular', Math.LN2 / 4.5, 0)).toBe(0);
    const imPeakT = estimatePeakTime(250, 'intramuscular', Math.LN2 / 4.5);
    const subqPeakT = estimatePeakTime(250, 'subcutaneous', Math.LN2 / 4.5);
    expect(imPeakT).toBeGreaterThan(0);
    expect(subqPeakT).toBeGreaterThan(imPeakT);
    expect(ROUTE_KA.subcutaneous).toBeLessThan(ROUTE_KA.intramuscular);
  });

  it('derives injection volume from dose / concentration and compares both routes', () => {
    const r = calculateSubqVsIm(baseInput);
    expect(r.volume_ml).toBe(1);
    expect(r.faster_peak_route).toBe('intramuscular');
    expect(r.higher_peak_route).toBe('intramuscular');
    expect(r.intramuscular.peak_absorption_hours).toBeLessThan(r.subcutaneous.peak_absorption_hours);
    expect(r.intramuscular.peak_concentration).toBeGreaterThan(r.subcutaneous.peak_concentration);
    expect(r.subcutaneous.site_volume_limit_ml).toBe(SITE_PROFILES.ventrogluteal.max_subq_ml);
    expect(r.intramuscular.site_volume_limit_ml).toBe(SITE_PROFILES.ventrogluteal.max_im_ml);
  });

  it('flags a volume above the site geometric limit', () => {
    const r = calculateSubqVsIm({ ...baseInput, dose_mg: 500 }); // 2 mL > 1 mL subQ limit
    expect(r.subcutaneous.volume_within_limit).toBe(false);
    expect(r.subcutaneous.education_flags).toContain('volume_exceeds_site_geometric_limit_reduce_or_split_site');
    expect(r.intramuscular.volume_within_limit).toBe(true);
  });

  it('computes steady-state accumulation and flags intervals below the half-life', () => {
    const r = calculateSubqVsIm({ ...baseInput, injection_interval_days: 3 }); // 3 d < 4.5 d
    const expected = Math.round((1 / (1 - Math.pow(2, -3 / 4.5))) * 1000) / 1000;
    expect(r.subcutaneous.steady_state_accumulation_factor).toBe(expected);
    expect(r.subcutaneous.education_flags).toContain('interval_shorter_than_half_life_causes_steady_state_accumulation');
  });

  it('flags high-concentration subcutaneous preparations', () => {
    const r = calculateSubqVsIm({ ...baseInput, concentration_mg_ml: 200, dose_mg: 100 });
    expect(r.subcutaneous.education_flags).toContain('high_concentration_subq_more_common_local_tissue_reaction_reported');
    expect(r.intramuscular.education_flags).not.toContain('high_concentration_subq_more_common_local_tissue_reaction_reported');
  });

  it('ALWAYS stamps the scope notice - never emits a dosing protocol', () => {
    const r = calculateSubqVsIm(baseInput);
    expect(r.scope_notice).toBe(
      'educational_absorption_and_site_geometry_model_only_not_a_dosing_protocol_or_prescription',
    );
    const keys = Object.keys(r).join(' ');
    expect(keys).not.toMatch(/recommendation|prescription|protocol_dose/i);
  });
});
