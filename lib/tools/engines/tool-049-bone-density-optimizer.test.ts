import { describe, it, expect } from 'vitest';
import {
  assessBoneHealth,
  recommendedCalcium,
  type BoneInput,
} from './tool-049-bone-density-optimizer';

const base: BoneInput = {
  age: 30,
  sex: 'male',
  weight_kg: 80,
  calcium_intake_mg: 1200,
  vitamin_d_ng_ml: 35,
  resistance_training_days: 3,
  smoker: false,
  androgen_exposure: false,
  prior_fracture: false,
  family_history_osteoporosis: false,
};

describe('tool-049 Bone Density Optimizer', () => {
  it('healthy young profile scores in the low-risk band', () => {
    const r = assessBoneHealth(base);
    expect(r.risk_band).toBe('low');
    expect(r.clinical_assessment_advised).toBe(false);
  });

  it('deficiency, smoking and prior fracture lower the index and raise the band', () => {
    const r = assessBoneHealth({
      ...base,
      age: 70,
      sex: 'female',
      weight_kg: 50,
      calcium_intake_mg: 300,
      vitamin_d_ng_ml: 12,
      resistance_training_days: 0,
      smoker: true,
      prior_fracture: true,
      family_history_osteoporosis: true,
    });
    expect(r.bone_health_index).toBeLessThan(assessBoneHealth(base).bone_health_index);
    expect(r.risk_band).toBe('high');
    expect(r.clinical_assessment_advised).toBe(true);
  });

  it('recommendedCalcium follows age/sex reference bands', () => {
    expect(recommendedCalcium(30, 'male')).toBe(1000);
    expect(recommendedCalcium(60, 'female')).toBe(1200);
    expect(recommendedCalcium(75, 'male')).toBe(1200);
  });

  it('index stays within 0–100', () => {
    const r = assessBoneHealth(base);
    expect(r.bone_health_index).toBeGreaterThanOrEqual(0);
    expect(r.bone_health_index).toBeLessThanOrEqual(100);
  });

  it('never prescribes supplement doses', () => {
    const r = assessBoneHealth(base);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(iu|mg)\b/i);
  });
});
