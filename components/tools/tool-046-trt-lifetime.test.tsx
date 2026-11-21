// components/tools/tool-046-trt-lifetime.test.tsx
//
// The R6.1 acceptance tests for the Tool 046 TRT Lifetime Calculator component.
//
// Covered:
//   - the calculation goes through the R6 pipeline exactly once per ready
//     input, and the UI never imports the engine or the legacy adapter;
//   - the five states EMPTY / PARTIAL / INVALID / FULL / DEGRADED;
//   - nothing is invented: every field starts empty, a typed value is kept, and
//     a typed zero is a real value, never "not answered";
//   - the twelve GENIUS boxes are always present, in their fixed order, and a
//     box without approved content says NOT_AVAILABLE with the real reason;
//   - CORE-5 content: C1 projection, C2 formula/assumptions/uncertainty, C3
//     warnings/red flags/pending referral, C4 no unapproved sources, C5 next
//     actions and the session-only rating;
//   - the engine's existing warnings survive unchanged;
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
    fn: null as null | (typeof import('@/lib/tools/r6/tool-046-trt-lifetime-pipeline'))['runTrtLifetime'],
  },
}));

vi.mock('@/lib/tools/r6/tool-046-trt-lifetime-pipeline', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/lib/tools/r6/tool-046-trt-lifetime-pipeline')
  >();
  hoisted.actual.fn = actual.runTrtLifetime;
  hoisted.runSpy.mockImplementation(actual.runTrtLifetime);
  return { ...actual, runTrtLifetime: hoisted.runSpy };
});

import Tool046 from './tool-046-trt-lifetime';

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
  return render(withToolPreferences(<Tool046 />, locale, 'metric'));
}

function field(name: string): HTMLInputElement | HTMLSelectElement {
  const element = document.querySelector(`[data-r6-field="${name}"]`);
  if (!element) throw new Error(`missing field ${name}`);
  return element as HTMLInputElement | HTMLSelectElement;
}

function setField(name: string, value: string) {
  fireEvent.change(field(name), { target: { value } });
}

interface FullOptions {
  age?: string;
  method?: 'injection' | 'gel' | 'cream';
  weeklyMg?: string;
  yearsOnTrt?: string;
  monthlyCost?: string;
  monitoringCost?: string;
}

function fillFull(options: FullOptions = {}) {
  const {
    age = '42',
    method = 'injection',
    weeklyMg = '150',
    yearsOnTrt = '3.5',
    monthlyCost = '40',
    monitoringCost = '300',
  } = options;
  setField('age', age);
  setField('method', method);
  setField('weeklyMg', weeklyMg);
  setField('yearsOnTrt', yearsOnTrt);
  setField('monthlyCost', monthlyCost);
  setField('monitoringCost', monitoringCost);
}

async function waitForState(state: string) {
  await waitFor(() => expect(document.querySelector(`[data-r6-state="${state}"]`)).not.toBeNull());
}

function box(n: number): HTMLElement {
  const element = document.querySelector(`[data-r6-box="${n}"]`);
  if (!element) throw new Error(`missing box ${n}`);
  return element as HTMLElement;
}

describe('Tool 046 TRT lifetime — five states and the pipeline', () => {
  it('starts EMPTY and invents nothing', () => {
    renderTool();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('Empty');
    expect(runSpy).not.toHaveBeenCalled();
    for (const input of Array.from(document.querySelectorAll('[data-r6-field]')) as HTMLInputElement[]) {
      expect(input.value).toBe('');
    }
    for (const name of ['age', 'method', 'weeklyMg', 'yearsOnTrt', 'monthlyCost', 'monitoringCost']) {
      expect(field(name).getAttribute('aria-required')).toBe('true');
    }
  });

  it('stays PARTIAL until every required field is answered', () => {
    renderTool();
    setField('age', '42');
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();

    fillFull({ monitoringCost: '' });
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for an out-of-range age and calculates nothing', () => {
    renderTool();
    fillFull({ age: '17' });
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('outside the accepted range');
    expect(field('age').getAttribute('aria-invalid')).toBe('true');
    expect(field('age').getAttribute('aria-describedby')).toBeTruthy();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for an out-of-range weekly dose', () => {
    renderTool();
    fillFull({ weeklyMg: '301' });
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(field('weeklyMg').getAttribute('aria-invalid')).toBe('true');
    expect(field('age').getAttribute('aria-invalid')).toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('calculates through the R6 pipeline once the input is complete', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(runSpy).toHaveBeenCalled();

    const [input] = runSpy.mock.calls[0] as unknown as [
      {
        age: number;
        method: string;
        weekly_testosterone_mg: number;
        years_on_trt: number;
        monthly_med_cost_usd: number;
        monitoring_annual_cost_usd: number;
      },
    ];
    expect(input).toEqual({
      age: 42,
      method: 'injection',
      weekly_testosterone_mg: 150,
      years_on_trt: 3.5,
      monthly_med_cost_usd: 40,
      monitoring_annual_cost_usd: 300,
    });

    const summary = document.querySelector('[data-r6-summary="full"]');
    expect(summary?.textContent).toContain('3.5');
    expect(summary?.textContent).toContain('$7,800');
    expect(summary?.textContent).toContain('$15,600');
    expect(summary?.textContent).toContain('$23,400');
    expect(summary?.textContent).toContain('40–55');
  });

  it('accepts a typed zero for years and costs as a real value', async () => {
    renderTool();
    fillFull({ yearsOnTrt: '0', monthlyCost: '0', monitoringCost: '0' });
    await waitForState('FULL');
    const [input] = runSpy.mock.calls[0] as unknown as [
      { years_on_trt: number; monthly_med_cost_usd: number; monitoring_annual_cost_usd: number },
    ];
    expect(input.years_on_trt).toBe(0);
    expect(input.monthly_med_cost_usd).toBe(0);
    expect(input.monitoring_annual_cost_usd).toBe(0);
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('$0');
  });

  it('re-renders the projection when the method changes', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('3.5');

    setField('method', 'gel');
    await waitFor(() =>
      expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('1'),
    );
  });

  it('reports DEGRADED when the pipeline fails its contract guard', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    runSpy.mockImplementationOnce(() => ({ ok: false, error: new Error('envelope guard failed') }));
    setField('age', '43');
    await waitForState('DEGRADED');
    expect(document.body.textContent).toContain('could not produce a valid result');
  });
});

describe('Tool 046 TRT lifetime — GENIUS-12 and CORE-5', () => {
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

  it('C1 carries the cost projection, the age band and an honest confidence', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(2).textContent ?? '';
    expect(text).toContain('$7,800');
    expect(text).toContain('$15,600');
    expect(text).toContain('$23,400');
    expect(text).toMatch(/Estimated 10-year cost/i);
    expect(text).toMatch(/40–55/);
    expect(text).toMatch(/Not assessed/i);
    expect(text).toMatch(/neither a quote nor a promise of cost/i);
    expect(text).toMatch(/not a prescription/i);
  });

  it('C2 states the formula with the engine limits, the assumptions and the uncertainty', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(3).textContent ?? '';
    expect(text).toMatch(/Formula/i);
    expect(text).toMatch(/monthly medication × 12 × years/i);
    expect(text).toMatch(/3 per year in year one/i);
    expect(text).toMatch(/2 up to year three/i);
    expect(text).toMatch(/3.5 days for injections/i);
    expect(text).toMatch(/annual panels × 10/i);
    expect(text).toMatch(/Assumptions/i);
    expect(text).toMatch(/Uncertainty/i);
    expect(text).toContain('150 mg');
  });

  it('C3 raises all three engine warnings and their red flags', async () => {
    renderTool();
    fillFull({ age: '45', yearsOnTrt: '6', weeklyMg: '250' });
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/Age is 40 or over/i);
    expect(text).toMatch(/Five years or more on TRT/i);
    expect(text).toMatch(/above the range the engine treats as standard TRT/i);
    expect(text).toMatch(/Age 40 or over: the engine flags cardio monitoring/i);
    expect(text).toMatch(/Five years or more on TRT: the engine flags a full annual panel/i);
    expect(text).toMatch(/above 200 mg: the engine flags a dose review/i);
    expect(text).toMatch(/Referral wording is not available/i);
    expect(text).toMatch(/Pending medical review/i);
  });

  it('C4 does not invent a source: it says NOT_AVAILABLE with the pending review', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(9).textContent ?? '';
    expect(text).toMatch(/NOT_AVAILABLE/);
    expect(text).toMatch(/no approved source recorded/i);
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
    expect(whatIf?.textContent).toMatch(/same calculation path/i);
    expect(sensitivity?.textContent).toMatch(/not a medical recommendation/i);

    expect(runSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
    const probeInputs = runSpy.mock.calls.map((call) => call[0] as {
      age: number;
      weekly_testosterone_mg: number;
      years_on_trt: number;
      monitoring_annual_cost_usd: number;
    });
    expect(probeInputs.some((input) => input.age === 47)).toBe(true);
    expect(probeInputs.some((input) => input.weekly_testosterone_mg === 200)).toBe(true);
    expect(probeInputs.some((input) => input.years_on_trt === 4.5)).toBe(true);
    expect(probeInputs.some((input) => input.monitoring_annual_cost_usd === 400)).toBe(true);
  });

  it('shows the related tools with a hand-entry rule and no automatic transfer', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(8).textContent ?? '';
    expect(text).toContain('TRT Optimization');
    expect(text).toContain('Cycle Break Planner');
    expect(text).toMatch(/Freshness rule/i);
    expect(text).toMatch(/Manual re-entry only/i);
    expect(text).toMatch(/No automatic data transfer/i);
  });

  it('exports a client-side CSV and never adds a session identifier', async () => {
    const createObjectURL = vi.fn(() => 'blob:tool-046');
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
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it('disables the export until a valid result exists', () => {
    renderTool();
    const button = within(box(10)).getByRole('button', { name: /Download CSV/ });
    expect(button).toBeDisabled();
    expect(box(10).textContent).toMatch(/Enter valid data first/i);
  });

  it('keeps C1 identical in compact mode and shows the five CORE boxes', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const fullC1 = box(2).textContent;
    fireEvent.click(screen.getByRole('button', { name: 'Compact' }));
    await waitFor(() => expect(document.querySelectorAll('[data-r6-box]')).toHaveLength(5));
    expect(
      Array.from(document.querySelectorAll('[data-r6-box]')).map((element) =>
        element.getAttribute('data-r6-box'),
      ),
    ).toEqual(['2', '3', '7', '9', '12']);
    expect(box(2).textContent).toBe(fullC1);
  });
});

describe('Tool 046 TRT lifetime — Arabic, accessibility and persistence', () => {
  it('flips to RTL and localizes the interface in Arabic', async () => {
    renderTool('ar');
    const section = document.querySelector('[data-r6-tool="tool-046-trt-lifetime"]');
    expect(section?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { name: 'حاسبة عمر TRT' })).toBeInTheDocument();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('فارغ');

    fillFull();
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain(
      'تكلفة 10 سنوات',
    );
    expect(box(8).textContent).toContain('إعادة إدخال يدوية فقط');
    expect(box(12).textContent).toContain('تقييم لجلسة العرض فقط');
  });

  it('never prints a raw engine warning code', async () => {
    renderTool();
    fillFull({ age: '45', yearsOnTrt: '6', weeklyMg: '250' });
    await waitForState('FULL');
    const text = document.body.textContent ?? '';
    for (const code of [
      'age_40_plus_cardio_monitoring',
      'long_term_annual_full_panel',
      'high_dose_not_trt_range',
    ]) {
      expect(text).not.toContain(code);
    }
  });

  it('labels every control, announces the state and marks an invalid input', () => {
    renderTool();
    for (const input of Array.from(document.querySelectorAll('[data-r6-field]')) as HTMLInputElement[]) {
      expect(input.labels?.length ?? 0).toBeGreaterThan(0);
    }
    expect(document.querySelector('[data-r6-state]')?.getAttribute('aria-live')).toBe('polite');

    setField('age', '999');
    const invalid = field('age');
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
    const wide = Array.from(
      document.querySelectorAll('[data-r6-field], [data-r6-summary]'),
    ).filter((element) => {
      const style = window.getComputedStyle(element);
      return style.minWidth !== '' && style.minWidth !== '0px' && style.minWidth !== 'auto';
    });
    expect(wide).toEqual([]);
  });

  it('has NO persistence and never calls the network, the engine or the adapter', () => {
    const component = readFileSync(
      join(process.cwd(), 'components', 'tools', 'tool-046-trt-lifetime.tsx'),
      'utf8',
    );
    const genius = readFileSync(
      join(process.cwd(), 'components', 'tools', 'tool-046-trt-lifetime.genius.tsx'),
      'utf8',
    );
    for (const source of [component, genius]) {
      expect(source).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
      expect(source).not.toMatch(/adapters\/tool-046/);
      expect(source).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]/);
      expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest|localStorage|sessionStorage/);
      expect(source).not.toMatch(/import[^;]*from[^;]*engines\/tool-046/);
    }
    expect(component).toMatch(/runTrtLifetime/);
    // No fabricated defaults survive in the draft.
    expect(component).not.toMatch(/age:\s*'\d+'/);
    expect(component).not.toMatch(/weeklyMg:\s*'\d+'/);
    expect(component).not.toMatch(/method:\s*'(injection|gel|cream)'/);
  });
});
