// components/tools/tool-041-hematocrit-monitor.test.tsx
//
// The R6.1 acceptance tests for the Tool 041 Hematocrit Monitor component.
//
// Covered:
//   - the calculation goes through the R6 pipeline exactly once per ready
//     input, and the UI never imports the engine or the legacy adapter;
//   - the five states EMPTY / PARTIAL / INVALID / FULL / DEGRADED;
//   - nothing is invented: every field starts empty and a typed value is kept;
//   - the twelve GENIUS boxes are always present, in their fixed order, and a
//     box without approved content says NOT_AVAILABLE with the real reason;
//   - CORE-5 content: C1 result, C2 formula/assumptions/uncertainty, C3
//     warnings/red flags/pending referral, C4 no unapproved sources, C5 next
//     actions and the session-only rating;
//   - what-if and sensitivity re-run the same pipeline;
//   - the CSV export is generated in the browser and carries no session id;
//   - AR/EN and RTL/LTR, no raw engine code in the output;
//   - accessibility: labelled controls, a live state badge, an alert on
//     invalid input, no fixed widths that would break a 390 px viewport;
//   - no persistence of any kind.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { withToolPreferences } from './tool-preferences.test-utils';

const hoisted = vi.hoisted(() => ({
  runSpy: vi.fn(),
  actual: {
    fn: null as null | (typeof import('@/lib/tools/r6/tool-041-hematocrit-monitor-pipeline'))['runHematocritMonitor'],
  },
}));

vi.mock('@/lib/tools/r6/tool-041-hematocrit-monitor-pipeline', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/lib/tools/r6/tool-041-hematocrit-monitor-pipeline')
  >();
  hoisted.actual.fn = actual.runHematocritMonitor;
  hoisted.runSpy.mockImplementation(actual.runHematocritMonitor);
  return { ...actual, runHematocritMonitor: hoisted.runSpy };
});

import Tool041 from './tool-041-hematocrit-monitor';

const runSpy = hoisted.runSpy;

beforeEach(() => {
  runSpy.mockReset();
  runSpy.mockImplementation((input, options) => {
    if (!hoisted.actual.fn) throw new Error('the real pipeline was not captured');
    return hoisted.actual.fn(input, options);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderTool(locale: 'ar' | 'en' = 'en') {
  return render(withToolPreferences(<Tool041 />, locale, 'metric'));
}

function rawField(name: string): HTMLInputElement {
  const element = document.querySelector(`[data-r6-field="${name}"]`);
  if (!element) throw new Error(`missing field ${name}`);
  return element as HTMLInputElement;
}

function fields(name: string): HTMLInputElement[] {
  return Array.from(document.querySelectorAll(`[data-r6-field="${name}"]`)) as HTMLInputElement[];
}

function setField(name: string, value: string, index = 0) {
  fireEvent.change(fields(name)[index], { target: { value } });
}

interface FullOptions {
  values?: [string, string];
  dates?: [string, string];
  sex?: 'male' | 'female';
  onCycle?: 'yes' | 'no';
  weeks?: string;
}

function fillFull(options: FullOptions = {}) {
  const {
    values = ['50', '51'],
    dates = ['2026-01-01', '2026-02-01'],
    sex = 'male',
    onCycle = 'no',
    weeks = '4',
  } = options;
  setField('hct', values[0], 0);
  setField('date', dates[0], 0);
  setField('hct', values[1], 1);
  setField('date', dates[1], 1);
  setField('sex', sex);
  setField('on-cycle', onCycle);
  setField('weeks', weeks);
}

async function waitForState(state: string) {
  await waitFor(() => expect(document.querySelector(`[data-r6-state="${state}"]`)).not.toBeNull());
}

function box(n: number): HTMLElement {
  const element = document.querySelector(`[data-r6-box="${n}"]`);
  if (!element) throw new Error(`missing box ${n}`);
  return element as HTMLElement;
}

describe('Tool 041 hematocrit monitor — five states and the pipeline', () => {
  it('starts EMPTY and invents nothing', () => {
    renderTool();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('Empty');
    expect(runSpy).not.toHaveBeenCalled();
    for (const field of Array.from(document.querySelectorAll('[data-r6-field]')) as HTMLInputElement[]) {
      expect(field.value).toBe('');
      expect(field.getAttribute('aria-required')).toBe('true');
    }
  });

  it('stays PARTIAL until every reading and every context field is answered', () => {
    renderTool();
    setField('hct', '50', 0);
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for an out-of-range value and calculates nothing', () => {
    renderTool();
    setField('hct', '75', 0);
    setField('date', '2026-01-01', 0);
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('outside the accepted range');
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for a fractional week count', () => {
    renderTool();
    fillFull({ weeks: '4.5' });
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('calculates through the R6 pipeline once the input is complete', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(runSpy).toHaveBeenCalled();
    const [input] = runSpy.mock.calls[0] as unknown as [
      { readings: Array<{ hct_pct: number; date: string }>; sex: string; on_cycle: boolean; weeks_remaining: number },
    ];
    expect(input.readings).toEqual([
      { hct_pct: 50, date: '2026-01-01' },
      { hct_pct: 51, date: '2026-02-01' },
    ]);
    expect(input.sex).toBe('male');
    expect(input.on_cycle).toBe(false);
    expect(input.weeks_remaining).toBe(4);

    const summary = document.querySelector('[data-r6-summary="full"]');
    expect(summary?.textContent).toContain('51.0');
    expect(summary?.textContent).toContain('Borderline');
  });

  it('shows the newest value immediately and never a stale result', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    setField('hct', '55', 1);
    await waitFor(() => expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('55.0'));
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('Very high');
  });

  it('reports DEGRADED when the pipeline fails its contract guard', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    runSpy.mockImplementationOnce(() => ({ ok: false, error: new Error('envelope guard failed') }));
    setField('weeks', '5');
    await waitForState('DEGRADED');
    expect(document.body.textContent).toContain('could not use any reading date');
  });
});

describe('Tool 041 hematocrit monitor — GENIUS-12 and CORE-5', () => {
  it('renders all twelve boxes in their fixed order', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const boxes = Array.from(document.querySelectorAll('[data-r6-box]'));
    expect(boxes.map((element) => element.getAttribute('data-r6-box'))).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    ]);
  });

  it('keeps the history box visible with the real W18 reason', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(box(11).getAttribute('data-r6-box-source')).toBe('not_available');
    expect(box(11).textContent).toMatch(/W18/);
  });

  it('C1 carries the display bounds, the pending clinical band and an honest confidence', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(2).textContent ?? '';
    expect(text).toContain('51.0');
    expect(text).toContain('Borderline');
    expect(text).toMatch(/Display bounds/i);
    expect(text).toMatch(/20–70/);
    expect(text).toMatch(/not a clinical reference range/i);
    expect(text).toMatch(/pending specialist approval/i);
    expect(text).toMatch(/Not assessed/i);
    expect(text).toMatch(/Trend per 30 days/i);
  });

  it('C2 states the formula with the engine limits, the assumptions and the uncertainty', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(3).textContent ?? '';
    expect(text).toMatch(/Formula/i);
    expect(text).toMatch(/male 54\.0%/);
    expect(text).toMatch(/female 48\.0%/);
    expect(text).toMatch(/male 50\.0%/);
    expect(text).toMatch(/female 44\.5%/);
    expect(text).toMatch(/Assumptions/i);
    expect(text).toMatch(/Uncertainty/i);
    expect(text).toContain('2026-01-01');
    expect(text).toContain('2026-02-01');
    expect(text).toContain('50');
    expect(text).toContain('51');
  });

  it('C3 raises the engine warning, a red flag and the pending referral for a very-high value', async () => {
    renderTool();
    fillFull({ values: ['53', '55'] });
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/above the tool's intervention line/i);
    expect(text).toMatch(/above the intervention line/i);
    expect(text).toMatch(/very high/i);
    expect(text).toMatch(/rapid-rise threshold|rapid rise/i);
    expect(text).toMatch(/Referral wording is not available/i);
    expect(text).toMatch(/Pending medical review/i);
  });

  it('C4 does not invent a source: it says NOT_AVAILABLE with the pending review', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(9).textContent ?? '';
    expect(text).toMatch(/NOT_AVAILABLE/);
    expect(text).toMatch(/pending approval/i);
    expect(text).toMatch(/Pending medical review/i);
    expect(box(9).querySelectorAll('a')).toHaveLength(0);
  });

  it('C5 gives the next step, what not to do and when to seek care, and labels the rating session-only', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(12).textContent ?? '';
    expect(text).toMatch(/Next step/i);
    expect(text).toMatch(/What not to do/i);
    expect(text).toMatch(/When to seek care/i);
    expect(text).toMatch(/NOT_AVAILABLE/);
    expect(text).toMatch(/Pending medical review/i);
    expect(text).toMatch(/not saved/i);

    const buttons = within(box(12)).getAllByRole('button');
    expect(buttons).toHaveLength(5);
    fireEvent.click(buttons[3]);
    expect(buttons[3].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('runs the what-if and sensitivity probes through the same pipeline', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const whatIf = document.querySelector('[data-r6-core="what-if"]');
    const sensitivity = document.querySelector('[data-r6-core="sensitivity"]');
    expect(whatIf?.querySelectorAll('li')).toHaveLength(4);
    expect(sensitivity?.querySelectorAll('li')).toHaveLength(4);
    expect(whatIf?.textContent).toMatch(/re-runs the same calculation path/i);
    expect(sensitivity?.textContent).toMatch(/not a medical recommendation/i);
    // One result call plus four probe calls, and the probes really changed a
    // value: the latest-reading probe must have passed 51 + 1 to the pipeline.
    expect(runSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
    const probeInputs = runSpy.mock.calls.map(
      (call) => call[0] as { readings: Array<{ hct_pct: number }> },
    );
    expect(probeInputs.some((input) => input.readings[1]?.hct_pct === 52)).toBe(true);
    expect(probeInputs.some((input) => input.readings[1]?.hct_pct === 50)).toBe(true);
  });

  it('shows the related tools with a hand-entry rule and no automatic transfer', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(8).textContent ?? '';
    expect(text).toContain('TRT Optimization');
    expect(text).toContain('Bloodwork Record Log');
    expect(text).toMatch(/Freshness rule/i);
    expect(text).toMatch(/Manual re-entry only/i);
    expect(text).toMatch(/No automatic data transfer/i);
  });

  it('exports a client-side CSV and never adds a session identifier', async () => {
    const createObjectURL = vi.fn(() => 'blob:tool-041');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(10).textContent ?? '';
    expect(text).toMatch(/created inside the browser only/i);
    expect(text).toMatch(/no session identifier/i);
    const button = within(box(10)).getByRole('button', { name: /Download CSV/ });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps C1 identical in compact mode and shows the five CORE boxes', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const fullC1 = box(2).textContent;
    fireEvent.click(screen.getByRole('button', { name: 'Compact' }));
    await waitFor(() => expect(document.querySelectorAll('[data-r6-box]')).toHaveLength(5));
    expect(
      Array.from(document.querySelectorAll('[data-r6-box]')).map((element) => element.getAttribute('data-r6-box')),
    ).toEqual(['2', '3', '7', '9', '12']);
    expect(box(2).textContent).toBe(fullC1);
  });
});

describe('Tool 041 hematocrit monitor — Arabic, accessibility and persistence', () => {
  it('flips to RTL and localizes the interface in Arabic', async () => {
    renderTool('ar');
    const section = document.querySelector('[data-r6-tool="tool-041-hematocrit-monitor"]');
    expect(section?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { name: 'متتبع الهيماتوكريت' })).toBeInTheDocument();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('فارغ');

    fillFull({ values: ['53', '55'] });
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('مرتفع جدًا');
    expect(box(8).textContent).toContain('تحسين TRT');
    expect(box(8).textContent).toContain('سجل نتائج التحاليل');
    expect(box(8).textContent).toContain('إعادة إدخال يدوية فقط');
  });

  it('never prints a raw engine warning code', async () => {
    renderTool();
    fillFull({ values: ['53', '55'], onCycle: 'yes' });
    await waitForState('FULL');
    const text = document.body.textContent ?? '';
    for (const code of [
      'on_cycle_elevated_hct',
      'rising_trend_30d',
      'above_intervention_line_seek_physician',
      'no_valid_readings',
    ]) {
      expect(text).not.toContain(code);
    }
  });

  it('labels every control, announces the state and marks an invalid input', () => {
    renderTool();
    for (const field of Array.from(document.querySelectorAll('[data-r6-field]')) as HTMLInputElement[]) {
      expect(field.labels?.length ?? 0).toBeGreaterThan(0);
    }
    expect(document.querySelector('[data-r6-state]')?.getAttribute('aria-live')).toBe('polite');

    setField('hct', '80', 0);
    const invalid = rawField('hct');
    expect(invalid.getAttribute('aria-invalid')).toBe('true');
    expect(invalid.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const rating = document.querySelector('[data-r6-rating]');
    expect(rating).not.toBeNull();
    expect(within(rating as HTMLElement).getByRole('group').getAttribute('aria-label')).toBeTruthy();
  });

  it('uses no fixed width that would break a 390 px viewport', () => {
    renderTool();
    fillFull();
    const wide = Array.from(document.querySelectorAll('[data-r6-field], [data-r6-summary]')).filter((element) => {
      const style = window.getComputedStyle(element);
      return style.minWidth !== '' && style.minWidth !== '0px' && style.minWidth !== 'auto';
    });
    expect(wide).toEqual([]);
  });

  it('has NO persistence and never calls the network, the engine or the adapter', () => {
    const component = readFileSync(
      join(process.cwd(), 'components', 'tools', 'tool-041-hematocrit-monitor.tsx'),
      'utf8',
    );
    const genius = readFileSync(
      join(process.cwd(), 'components', 'tools', 'tool-041-hematocrit-monitor.genius.tsx'),
      'utf8',
    );
    for (const source of [component, genius]) {
      expect(source).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
      expect(source).not.toMatch(/adapters\/tool-041/);
      expect(source).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]/);
      expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest|localStorage|sessionStorage/);
      expect(source).not.toMatch(/import[^;]*from[^;]*engines\/tool-041/);
    }
    expect(component).toMatch(/runHematocritMonitor/);
    // No fabricated defaults survive in the draft.
    expect(component).not.toMatch(/weeksRemaining:\s*'\d+'/);
    expect(component).not.toMatch(/sex:\s*'(male|female)'/);
  });
});
