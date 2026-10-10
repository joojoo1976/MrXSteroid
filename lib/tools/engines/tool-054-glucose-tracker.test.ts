import { describe, it, expect } from 'vitest';
import { analyzeGlucose } from './tool-054-glucose-tracker';

describe('tool-054 glucose tracker engine', () => {
  it('summarizes fasting readings inside the documented normal range', () => {
    const r = analyzeGlucose({
      readings: [
        { mg_dl: 92, date: '2026-01-01', fasting: true },
        { mg_dl: 96, date: '2026-01-02', fasting: true },
        { mg_dl: 98, date: '2026-01-03', fasting: true },
      ],
    });
    expect(r.fasting_avg).toBe(95.3); // round((92+96+98)/3, 1)
    expect(r.band).toBe('normal');
    expect(r.hypo_count).toBe(0);
    expect(r.hyper_fast_count).toBe(0);
    expect(r.in_range_pct).toBe(100);
  });

  it('bands prediabetic-range fasting averages and flags the physician line', () => {
    const r = analyzeGlucose({
      readings: [
        { mg_dl: 108, date: '2026-01-01', fasting: true },
        { mg_dl: 112, date: '2026-01-02', fasting: true },
        { mg_dl: 110, date: '2026-01-03', fasting: true },
      ],
    });
    expect(r.fasting_avg).toBe(110); // (108+112+110)/3
    expect(r.band).toBe('prediabetic-range');
    expect(r.warnings).toContain('fasting_prediabetic_range_see_physician');
  });

  it('counts hypoglycemia episodes regardless of band', () => {
    const r = analyzeGlucose({
      readings: [
        { mg_dl: 60, date: '2026-01-01', fasting: false },
        { mg_dl: 92, date: '2026-01-02', fasting: true },
        { mg_dl: 95, date: '2026-01-03', fasting: true },
        { mg_dl: 94, date: '2026-01-04', fasting: true },
      ],
    });
    expect(r.hypo_count).toBe(1);
    expect(r.band).toBe('normal');
    expect(r.warnings).toContain('hypoglycemia_episode_logged');
  });
});
