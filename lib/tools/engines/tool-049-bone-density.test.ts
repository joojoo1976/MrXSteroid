import { describe, it, expect } from 'vitest';
import { assessBoneDensity } from './tool-049-bone-density';

describe('tool-049 bone density engine', () => {
  it('strong lifestyle offsets mild AI exposure into the optimal band', () => {
    const r = assessBoneDensity({
      age: 30, sex: 'male', uses_ai_years: 2,
      weekly_resistance_sessions: 4, calcium_mg_daily: 1200,
      vitamin_d_iu_daily: 2000, smoker: false,
    });
    expect(r.bone_health_score).toBe(84); // 60+12+12+5-5
    expect(r.band).toBe('optimal');
    expect(r.risk_factors).toEqual(['ai_exposure']);
    expect(r.interventions).toContain('review_ai_use_with_physician');
    expect(r.interventions).not.toContain('dxa_scan_discussion');
    expect(r.warnings).toEqual(['educational_screening_not_diagnosis']);
  });

  it('sedentary smoker with long AI exposure lands high-risk', () => {
    const r = assessBoneDensity({
      age: 68, sex: 'female', uses_ai_years: 4,
      weekly_resistance_sessions: 0, calcium_mg_daily: 300,
      vitamin_d_iu_daily: 200, smoker: true,
    });
    expect(r.bone_health_score).toBe(33); // 60+0+3+0.5-10-8-8-5 -> 32.5 -> 33
    expect(r.band).toBe('high-risk');
    expect(r.risk_factors).toEqual([
      'ai_exposure', 'low_resistance_training', 'low_calcium',
      'low_vitamin_d', 'smoking', 'postmenopausal_proxy', 'advanced_age',
    ]);
    expect(r.interventions).toContain('dxa_scan_discussion');
    expect(r.warnings).toContain('high_fracture_risk_consult_physician');
  });

  it('clamps the score to the 0-100 range', () => {
    const r = assessBoneDensity({
      age: 90, sex: 'female', uses_ai_years: 30,
      weekly_resistance_sessions: 0, calcium_mg_daily: 0,
      vitamin_d_iu_daily: 0, smoker: true,
    });
    expect(r.bone_health_score).toBe(0);
    expect(r.band).toBe('high-risk');
  });
});
