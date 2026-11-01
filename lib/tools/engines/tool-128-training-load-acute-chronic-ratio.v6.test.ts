import { describe, it, expect } from 'vitest';
import { calculateTrainingLoadAcwrV6 } from '@/lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6';

describe('acwr', () => {
  it('normal sufficient data', () => {
    const sessions = Array.from({length:28}, (_,i)=>({ date: new Date(Date.now() - (27-i)*86400000).toISOString().slice(0,10), load: 50 }));
    const r = calculateTrainingLoadAcwrV6({ sessions });
    expect(r.sufficientData).toBe(true);
    expect(r.band).toBe('optimal');
  });
  it('insufficient data', () => {
    const sessions = Array.from({length:7}, (_,i)=>({ date: new Date(Date.now() - (6-i)*86400000).toISOString().slice(0,10), load: 50 }));
    const r = calculateTrainingLoadAcwrV6({ sessions });
    expect(r.sufficientData).toBe(false);
  });
  it('returns an unavailable ratio when the chronic window has zero load', () => {
    const sessions = Array.from({length:28}, (_,i)=>({ date: new Date(Date.now() - (27-i)*86400000).toISOString().slice(0,10), load: 0 }));
    const result = calculateTrainingLoadAcwrV6({ sessions });
    expect(result.sufficientData).toBe(true);
    expect(result.chronicLoad).toBe(0);
    expect(result.acwr).toBeNull();
    expect(result.band).toBe('undertraining');
  });
  it('invalid date throws', () => {
    expect(() => calculateTrainingLoadAcwrV6({ sessions: [{ date: 'bad', load: 10 }] })).toThrow();
  });
});
