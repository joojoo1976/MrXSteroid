import { describe, it, expect } from 'vitest';
import { calculateNeuromuscularV6 } from '@/lib/tools/engines/tool-126-neuromuscular-explosiveness-modeler.v6';

describe('neuromuscular', () => {
  it('partial inputs', () => {
    const r = calculateNeuromuscularV6({ body_weight_kg: 80, vertical_jump_cm: 60 });
    expect(r.explosivenessScore).toBeGreaterThan(0);
  });
  it('NaN throws', () => {
    expect(() => calculateNeuromuscularV6({ body_weight_kg: NaN })).toThrow();
  });
  it('negative throws', () => {
    expect(() => calculateNeuromuscularV6({ body_weight_kg: 80, vertical_jump_cm: -1 })).toThrow();
  });
  it('sensitivity', () => {
    const a = calculateNeuromuscularV6({ body_weight_kg: 80, vertical_jump_cm: 50 });
    const b = calculateNeuromuscularV6({ body_weight_kg: 80, vertical_jump_cm: 70 });
    expect(b.explosivenessScore).toBeGreaterThan(a.explosivenessScore);
  });
});
