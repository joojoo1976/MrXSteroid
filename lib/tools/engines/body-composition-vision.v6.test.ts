import { describe, it, expect } from 'vitest';
import { calculateBodyCompositionVisionV6 } from './body-composition-vision.v6';

describe('body-composition-vision.v6', () => {
  const base = { sex: 'male' as const, heightCm: 180, neckCm: 38, waistCm: 85, weightKg: 80 };

  it('returns bf in range', () => {
    const r = calculateBodyCompositionVisionV6(base);
    expect(r.bodyFatPercent).toBeGreaterThanOrEqual(3);
    expect(r.bodyFatPercent).toBeLessThanOrEqual(60);
  });

  it('rejects invalid height', () => {
    expect(() => calculateBodyCompositionVisionV6({ ...base, heightCm: 0 })).toThrow();
  });

  it('female requires hip', () => {
    expect(() => calculateBodyCompositionVisionV6({ sex: 'female', heightCm: 165, neckCm: 32, waistCm: 75, weightKg: 60 })).toThrow();
  });

  it('female works with hip', () => {
    const r = calculateBodyCompositionVisionV6({ sex: 'female', heightCm: 165, neckCm: 32, waistCm: 75, hipCm: 95, weightKg: 60 });
    expect(r.bodyFatPercent).toBeGreaterThan(0);
  });
});