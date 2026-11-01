import { describe, it, expect } from 'vitest';
import { calculatePlateauDetectiveV6 } from '@/lib/tools/engines/tool-130-ai-plateau-detective.v6';

describe('plateau', () => {
  it('real plateau', () => {
    const pts = [
      { date: '2026-01-01', weight_kg: 80 },
      { date: '2026-01-08', weight_kg: 80 },
      { date: '2026-01-15', weight_kg: 80 },
      { date: '2026-01-22', weight_kg: 80 },
    ];
    const r = calculatePlateauDetectiveV6({ points: pts });
    expect(r.isPlateau).toBe(true);
  });
  it('fluctuation', () => {
    const pts = [
      { date: '2026-01-01', weight_kg: 80 },
      { date: '2026-01-08', weight_kg: 82 },
      { date: '2026-01-15', weight_kg: 79 },
      { date: '2026-01-22', weight_kg: 81 },
    ];
    const r = calculatePlateauDetectiveV6({ points: pts });
    expect(typeof r.isPlateau).toBe('boolean');
  });
  it('insufficient data', () => {
    const pts = [{ date: '2026-01-01', weight_kg: 80 }];
    const r = calculatePlateauDetectiveV6({ points: pts });
    expect(r.isPlateau).toBe(false);
  });
  it('NaN date throws', () => {
    expect(() => calculatePlateauDetectiveV6({ points: [{ date: 'bad', weight_kg: 80 }] })).toThrow();
  });
});
