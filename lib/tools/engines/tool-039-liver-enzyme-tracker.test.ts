/**
 * Tool #039 — Liver Enzyme Tracker: engine + schema verification.
 */
import { describe, it, expect } from 'vitest';
import { trackLiverEnzymes } from './tool-039-liver-enzyme-tracker';
import { LiverTrackerInputSchema, LiverTrackerResultSchema } from '../schemas/tool-039-liver-enzyme-tracker';

describe('tool-039 liver engine', () => {
  it('reports normal panel as normal', () => {
    const input = {
      readings: [
        { marker: 'ALT' as const, value: 30, unit: 'U/L', date: '2026-01-01' },
        { marker: 'AST' as const, value: 25, unit: 'U/L', date: '2026-01-01' },
      ],
      oral_steroids: false, alcohol_drinks_per_week: 2, uses_tudca: false,
    };
    expect(LiverTrackerInputSchema.safeParse(input).success).toBe(true);
    const r = trackLiverEnzymes(input);
    expect(LiverTrackerResultSchema.safeParse(r).success).toBe(true);
    expect(r.overall_status).toBe('normal');
    expect(r.stop_orals).toBe(false);
  });

  it('escalates 4x ALT to high and stops orals', () => {
    const r = trackLiverEnzymes({
      readings: [{ marker: 'ALT', value: 224, unit: 'U/L', date: '2026-02-01' }],
      oral_steroids: true, alcohol_drinks_per_week: 0, uses_tudca: false,
    });
    expect(r.markers[0].uln_multiple).toBe(4);
    expect(r.markers[0].status).toBe('high');
    expect(r.overall_status).toBe('high');
    expect(r.stop_orals).toBe(true);
    expect(r.recommendations.some((x) => x.includes('STOP'))).toBe(true);
  });

  it('detects cholestatic escalation via bilirubin', () => {
    const r = trackLiverEnzymes({
      readings: [
        { marker: 'ALT', value: 140, unit: 'U/L', date: '2026-02-01' },
        { marker: 'bilirubin', value: 2.4, unit: 'mg/dL', date: '2026-02-01' },
      ],
      oral_steroids: true, alcohol_drinks_per_week: 0, uses_tudca: true,
    });
    // ALT 2.5x = elevated + bili 2.0x -> escalated to high
    expect(r.overall_status).toBe('high');
  });
});
