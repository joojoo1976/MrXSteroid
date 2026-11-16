// lib/tools/r6/tool-041-hematocrit-monitor-contract.test.ts
//
// The contract half of OD-12 option B: the values the interface explains must
// still describe what the unchanged V6 engine actually does. These tests run
// the engine itself and compare its behaviour with the mirrored contract — if
// the engine changes, the contract test fails instead of the UI silently
// displaying stale numbers.
import { describe, expect, it } from 'vitest';
import { monitorHematocrit, type HematocritInput } from '@/lib/tools/engines/tool-041-hematocrit-monitor';
import {
  TOOL_041_CROSS_TOOL_LINKS,
  TOOL_041_LIMITS,
  TOOL_041_SOURCES,
  bandLabelKey,
  buildHematocritCsv,
  evaluateHematocritDraft,
  formatHct,
  interventionLine,
  isRealCalendarDate,
  upperReference,
  warningLabelKey,
  type Tool041Draft,
} from './tool-041-hematocrit-monitor-contract';

const draft = (overrides: Partial<Tool041Draft> = {}): Tool041Draft => ({
  readings: [
    { value: '50', date: '2026-01-01' },
    { value: '51', date: '2026-02-01' },
  ],
  sex: 'male',
  onCycle: 'no',
  weeksRemaining: '4',
  ...overrides,
});

const engineInput = (latest: number, sex: HematocritInput['sex']): HematocritInput => ({
  readings: [
    { hct_pct: latest, date: '2026-01-01' },
    { hct_pct: latest, date: '2026-02-01' },
  ],
  sex,
  on_cycle: false,
  weeks_remaining: 4,
});

describe('Tool 041 draft evaluation (five-state model)', () => {
  it('starts EMPTY and does not invent a value', () => {
    const evaluation = evaluateHematocritDraft({
      readings: [{ value: '', date: '' }],
      sex: '',
      onCycle: '',
      weeksRemaining: '',
    });
    expect(evaluation.state).toBe('EMPTY');
    expect(evaluation.input).toBeNull();
  });

  it('stays PARTIAL until every reading and context field is answered', () => {
    expect(evaluateHematocritDraft(draft({ weeksRemaining: '' })).state).toBe('PARTIAL');
    expect(evaluateHematocritDraft(draft({ sex: '' })).state).toBe('PARTIAL');
    expect(evaluateHematocritDraft(draft({ onCycle: '' })).state).toBe('PARTIAL');
    expect(
      evaluateHematocritDraft(draft({ readings: [{ value: '50', date: '2026-01-01' }, { value: '', date: '' }] })).state,
    ).toBe('PARTIAL');
  });

  it('rejects an out-of-range HCT as INVALID', () => {
    const evaluation = evaluateHematocritDraft(
      draft({ readings: [{ value: '72', date: '2026-01-01' }, { value: '51', date: '2026-02-01' }] }),
    );
    expect(evaluation.state).toBe('INVALID');
    expect(evaluation.issues).toContainEqual({ readingIndex: 0, field: 'hct', code: 'out_of_range' });
  });

  it('rejects an impossible calendar date instead of rolling it over', () => {
    expect(isRealCalendarDate('2026-02-30')).toBe(false);
    const evaluation = evaluateHematocritDraft(
      draft({ readings: [{ value: '50', date: '2026-02-30' }, { value: '51', date: '2026-03-01' }] }),
    );
    expect(evaluation.state).toBe('INVALID');
    expect(evaluation.issues).toContainEqual({ readingIndex: 0, field: 'date', code: 'invalid_date' });
  });

  it('rejects a fractional or out-of-range week count', () => {
    expect(evaluateHematocritDraft(draft({ weeksRemaining: '4.5' })).state).toBe('INVALID');
    expect(evaluateHematocritDraft(draft({ weeksRemaining: '53' })).state).toBe('INVALID');
  });

  it('produces a READY input that the canonical Zod contract also accepts', () => {
    const evaluation = evaluateHematocritDraft(draft());
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input).toEqual({
      readings: [
        { hct_pct: 50, date: '2026-01-01' },
        { hct_pct: 51, date: '2026-02-01' },
      ],
      sex: 'male',
      on_cycle: false,
      weeks_remaining: 4,
    });
  });
});

describe('Tool 041 contract values still describe the unchanged engine', () => {
  it('mirrors the schema bounds', () => {
    expect(TOOL_041_LIMITS.inputMin).toBe(20);
    expect(TOOL_041_LIMITS.inputMax).toBe(70);
    expect(TOOL_041_LIMITS.minReadings).toBe(2);
    expect(TOOL_041_LIMITS.maxReadings).toBe(24);
  });

  it.each(['male', 'female'] as const)('mirrors the band boundaries for %s', (sex) => {
    const upper = upperReference(sex);
    const intervene = interventionLine(sex);

    expect(monitorHematocrit(engineInput(upper - 0.1, sex)).band).toBe('normal');
    expect(monitorHematocrit(engineInput(upper + 0.1, sex)).band).toBe('borderline');
    expect(monitorHematocrit(engineInput(upper + TOOL_041_LIMITS.highBandOffset, sex)).band).toBe('borderline');
    expect(monitorHematocrit(engineInput(upper + TOOL_041_LIMITS.highBandOffset + 0.01, sex)).band).toBe('high');
    expect(monitorHematocrit(engineInput(intervene, sex)).band).toBe('high');
    expect(monitorHematocrit(engineInput(intervene + 0.01, sex)).band).toBe('very-high');
  });

  it('mirrors the 180-day projection horizon and the rising-trend flag', () => {
    const steep = monitorHematocrit({
      readings: [
        { hct_pct: 40, date: '2026-01-01' },
        { hct_pct: 45, date: '2026-01-31' },
      ],
      sex: 'male',
      on_cycle: false,
      weeks_remaining: 4,
    });
    expect(steep.projected_threshold_date).not.toBeNull();
    expect(steep.warnings).toContain('rising_trend_30d');

    const slow = monitorHematocrit({
      readings: [
        { hct_pct: 40, date: '2026-01-01' },
        { hct_pct: 41, date: '2026-01-31' },
      ],
      sex: 'male',
      on_cycle: false,
      weeks_remaining: 4,
    });
    expect(slow.projected_threshold_date).toBeNull();
    expect(slow.warnings).not.toContain('rising_trend_30d');
  });

  it('mirrors the donation offset', () => {
    const male = TOOL_041_LIMITS.male;
    expect(
      monitorHematocrit(engineInput(male.intervene - TOOL_041_LIMITS.donationOffset, 'male')).donate_eligible,
    ).toBe(true);
    expect(
      monitorHematocrit(engineInput(male.intervene - TOOL_041_LIMITS.donationOffset - 0.1, 'male')).donate_eligible,
    ).toBe(false);
  });

  it('mirrors the on-cycle warning rule', () => {
    const input = engineInput(TOOL_041_LIMITS.male.upper + 0.5, 'male');
    expect(monitorHematocrit(input).warnings).not.toContain('on_cycle_elevated_hct');
    expect(monitorHematocrit({ ...input, on_cycle: true }).warnings).toContain('on_cycle_elevated_hct');
  });
});

describe('Tool 041 contract content', () => {
  it('maps every engine code to an localisation key, never to a raw code', () => {
    expect(bandLabelKey('very-high')).toBe('band_very_high');
    expect(bandLabelKey('unexpected')).toBe('band_unknown');
    expect(warningLabelKey('on_cycle_elevated_hct')).toBe('warning_on_cycle_elevated_hct');
    expect(warningLabelKey('unknown_code')).toBe('warning_unknown');
  });

  it('formats values deterministically', () => {
    expect(formatHct(52.04)).toBe('52.0');
    expect(formatHct(Number.NaN)).toBe('—');
  });

  it('records no unapproved source and no clinical transfer', () => {
    expect(TOOL_041_SOURCES).toHaveLength(0);
    expect(TOOL_041_CROSS_TOOL_LINKS.every((link) => link.transfer === 'manual-reentry')).toBe(true);
  });

  it('builds a CSV with the inputs and the result and no secret', () => {
    const input = engineInput(53, 'male');
    const csv = buildHematocritCsv(input, monitorHematocrit(input), '2026-11-16T10:00:00.000Z');
    expect(csv).toContain('tool-041-hematocrit-monitor');
    expect(csv).toContain('reading_index');
    expect(csv).toContain('latest_hct_pct,53');
    expect(csv).toContain('sex,male');
    expect(csv).not.toMatch(/token|secret|password|session/i);
  });
});
