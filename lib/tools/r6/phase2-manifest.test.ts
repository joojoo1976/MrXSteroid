import { describe, expect, it } from 'vitest';
import { getPhase2Manifest } from '@/lib/tools/r6/phase2-manifest';

describe('Phase 2 manifest', () => {
  it('marks pie applicable only for composition domains', () => {
    expect(getPhase2Manifest('macro', 'nutrition').chart.kind).toBe('pie3');
    expect(getPhase2Manifest('tool-019-cardio-monitor', 'medical-monitoring').chart.kind).toBe('none');
  });

  it('keeps C4/C5/C8/C11 NOT applicable without an engine', () => {
    const m = getPhase2Manifest('tool-019-cardio-monitor', 'medical-monitoring');
    expect(m.c4.applicable).toBe(false);
    expect(m.c5.applicable).toBe(false);
    expect(m.whatIf.applicable).toBe(false);
    expect(m.c11.applicable).toBe(false);
    expect(m.c4.naReason).toBeTruthy();
  });

  it('keeps Tool 132 checklist-only (no vision/voice need claimed)', () => {
    const m = getPhase2Manifest('tool-132-ai-pose-form-coach', 'training-recovery');
    expect(m.vision.needs).toBe(false);
    expect(m.voice.needs).toBe(false);
  });

  it('always provides a 7-part capability contract with evidence', () => {
    const m = getPhase2Manifest('tool-019-cardio-monitor', 'medical-monitoring');
    expect(m.capability.can).toBeTruthy();
    expect(m.capability.cannot).toBeTruthy();
    expect(m.capability.sources).toBeTruthy();
    expect(m.capability.why).toBeTruthy();
    expect(m.capability.cost).toBeTruthy();
    expect(m.capability.stop).toBeTruthy();
    expect(m.capability.restore).toBeTruthy();
    expect(m.capability.evidence).toMatch(/^E[0-5]$/);
  });
});
