// components/tools/tool-045-cycle-break-planner.test.tsx
//
// The R6.1 acceptance tests for the Tool 045 Cycle Break Planner component.
//
// Covered:
//   - the calculation goes through the R6 pipeline exactly once per ready
//     input, and the UI never imports the engine or the legacy adapter;
//   - the five states EMPTY / PARTIAL / INVALID / FULL / DEGRADED;
//   - nothing is invented: every field starts empty, a typed value is kept, and
//     a typed zero is treated as a real (invalid) value, never as empty;
//   - the twelve GENIUS boxes are always present, in their fixed order, and a
//     box without approved content says NOT_AVAILABLE with the real reason;
//   - CORE-5 content: C1 result, C2 formula/assumptions/uncertainty, C3
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
    fn: null as null | (typeof import('@/lib/tools/r6/tool-045-cycle-break-planner-pipeline'))['runCycleBreakPlanner'],
  },
}));

vi.mock('@/lib/tools/r6/tool-045-cycle-break-planner-pipeline', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/lib/tools/r6/tool-045-cycle-break-planner-pipeline')
  >();
  hoisted.actual.fn = actual.runCycleBreakPlanner;
  hoisted.runSpy.mockImplementation(actual.runCycleBreakPlanner);
  return { ...actual, runCycleBreakPlanner: hoisted.runSpy };
});

import Tool045 from './tool-045-cycle-break-planner';

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
  return render(withToolPreferences(<Tool045 />, locale, 'metric'));
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
  cycleWeeks?: string;
  wantsBloodwork?: 'yes' | 'no';
  name?: string;
  halfLife?: string;
  suppression?: '1' | '2' | '3';
}

function fillFull(options: FullOptions = {}) {
  const {
    cycleWeeks = '12',
    wantsBloodwork = 'yes',
    name = 'Testosterone Enanthate',
    halfLife = '4.5',
    suppression = '2',
  } = options;
  setField('cycle-weeks', cycleWeeks);
  setField('wants-bloodwork', wantsBloodwork);
  setField('compound-name-0', name);
  setField('half-life-0', halfLife);
  setField('suppression-0', suppression);
}

async function waitForState(state: string) {
  await waitFor(() => expect(document.querySelector(`[data-r6-state="${state}"]`)).not.toBeNull());
}

function box(n: number): HTMLElement {
  const element = document.querySelector(`[data-r6-box="${n}"]`);
  if (!element) throw new Error(`missing box ${n}`);
  return element as HTMLElement;
}

describe('Tool 045 cycle break planner — five states and the pipeline', () => {
  it('starts EMPTY and invents nothing', () => {
    renderTool();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('Empty');
    expect(runSpy).not.toHaveBeenCalled();
    for (const input of Array.from(document.querySelectorAll('[data-r6-field]')) as HTMLInputElement[]) {
      expect(input.value).toBe('');
    }
    for (const name of ['cycle-weeks', 'wants-bloodwork', 'compound-name-0', 'half-life-0', 'suppression-0']) {
      expect(field(name).getAttribute('aria-required')).toBe('true');
    }
    expect(document.querySelectorAll('[data-r6-compound]')).toHaveLength(1);
    expect(field('suppression-0')).toHaveValue('');
  });

  it('stays PARTIAL until every required field is answered', () => {
    renderTool();
    setField('cycle-weeks', '12');
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('stays PARTIAL when a compound row is only half-filled', () => {
    renderTool();
    setField('cycle-weeks', '12');
    setField('wants-bloodwork', 'yes');
    setField('compound-name-0', 'Testosterone Enanthate');
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for a typed zero cycle length and calculates nothing', () => {
    renderTool();
    fillFull({ cycleWeeks: '0' });
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('outside the accepted range');
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for an out-of-range half-life', () => {
    renderTool();
    fillFull({ halfLife: '31' });
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('outside the accepted range');
    expect(field('half-life-0').getAttribute('aria-invalid')).toBe('true');
    expect(field('cycle-weeks').getAttribute('aria-invalid')).toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('calculates through the R6 pipeline once the input is complete', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(runSpy).toHaveBeenCalled();

    const [input] = runSpy.mock.calls[0] as unknown as [
      {
        cycle_weeks_used: number;
        compounds: Array<{ name_en: string; half_life_days: number; suppression_factor: number }>;
        wants_bloodwork: boolean;
      },
    ];
    expect(input).toEqual({
      cycle_weeks_used: 12,
      compounds: [{ name_en: 'Testosterone Enanthate', half_life_days: 4.5, suppression_factor: 2 }],
      wants_bloodwork: true,
    });

    const summary = document.querySelector('[data-r6-summary="full"]');
    expect(summary?.textContent).toContain('23');
    expect(summary?.textContent).toContain('D+30');
    expect(summary?.textContent).toContain('6');
    expect(summary?.textContent).toContain('15');
  });

  it('re-renders the plan when the cycle length crosses a PCT boundary', async () => {
    renderTool();
    fillFull({ cycleWeeks: '8' });
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('4');

    setField('cycle-weeks', '13');
    await waitFor(() =>
      expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('8'),
    );
  });

  it('reports DEGRADED when the pipeline fails its contract guard', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    runSpy.mockImplementationOnce(() => ({ ok: false, error: new Error('envelope guard failed') }));
    setField('cycle-weeks', '13');
    await waitForState('DEGRADED');
    expect(document.body.textContent).toContain('could not produce a valid result');
  });

  it('adds and removes compound rows without inventing values', () => {
    renderTool();
    fireEvent.click(document.querySelector('[data-r6-action="add-compound"]') as HTMLElement);
    expect(document.querySelectorAll('[data-r6-compound]')).toHaveLength(2);
    expect(field('half-life-1')).toHaveValue(null);
    fireEvent.click(document.querySelector('[data-r6-action="remove-compound-1"]') as HTMLElement);
    expect(document.querySelectorAll('[data-r6-compound]')).toHaveLength(1);
  });
});

describe('Tool 045 cycle break planner — GENIUS-12 and CORE-5', () => {
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

  it('C1 carries the clearance plan, the milestones and an honest confidence', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(2).textContent ?? '';
    expect(text).toContain('23');
    expect(text).toContain('D+30');
    expect(text).toContain('15');
    expect(text).toMatch(/Recovery milestones/i);
    expect(text).toMatch(/Last dose/i);
    expect(text).toMatch(/PCT window opens/i);
    expect(text).toMatch(/Bloodwork recheck/i);
    expect(text).toMatch(/Not assessed/i);
    expect(text).toMatch(/not a clinical reference range/i);
    expect(text).toMatch(/not a prescription/i);
  });

  it('C2 states the formula with the engine limits, the assumptions and the uncertainty', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(3).textContent ?? '';
    expect(text).toMatch(/Formula/i);
    expect(text).toMatch(/longest half-life × 5/i);
    expect(text).toMatch(/7 days after full clearance/i);
    expect(text).toMatch(/4 weeks \(cycle ≤ 8\)/i);
    expect(text).toMatch(/6 weeks \(cycle ≤ 12\)/i);
    expect(text).toMatch(/otherwise 8 weeks/i);
    expect(text).toMatch(/4 weeks after the PCT window closes/i);
    expect(text).toMatch(/Assumptions/i);
    expect(text).toMatch(/Uncertainty/i);
    expect(text).toContain('Testosterone Enanthate');
  });

  it('C3 raises both engine warnings and their red flags for a suppressive stack without baseline bloodwork', async () => {
    renderTool();
    fillFull({ wantsBloodwork: 'no', suppression: '3' });
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/strongly suppressive, so recovery may take longer/i);
    expect(text).toMatch(/baseline bloodwork check is recommended/i);
    expect(text).toMatch(/The stack includes a strongly suppressive compound/i);
    expect(text).toMatch(/No baseline bloodwork was reported/i);
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
      cycle_weeks_used: number;
      wants_bloodwork: boolean;
      compounds: Array<{ half_life_days: number }>;
    });
    expect(probeInputs.some((input) => input.cycle_weeks_used === 14)).toBe(true);
    expect(probeInputs.some((input) => input.cycle_weeks_used === 10)).toBe(true);
    expect(probeInputs.some((input) => input.wants_bloodwork === false)).toBe(true);
    expect(
      probeInputs.some((input) => input.compounds.some((compound) => compound.half_life_days === 6.5)),
    ).toBe(true);
  });

  it('shows the related tools with a hand-entry rule and no automatic transfer', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(8).textContent ?? '';
    expect(text).toContain('TRT Optimization');
    expect(text).toContain('TRT Lifetime Calculator');
    expect(text).toMatch(/Freshness rule/i);
    expect(text).toMatch(/Manual re-entry only/i);
    expect(text).toMatch(/No automatic data transfer/i);
  });

  it('exports a client-side CSV and never adds a session identifier', async () => {
    const createObjectURL = vi.fn(() => 'blob:tool-045');
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

describe('Tool 045 cycle break planner — Arabic, accessibility and persistence', () => {
  it('flips to RTL and localizes the interface in Arabic', async () => {
    renderTool('ar');
    const section = document.querySelector('[data-r6-tool="tool-045-cycle-break-planner"]');
    expect(section?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { name: 'مخطط فترة الراحة بين الدورات' })).toBeInTheDocument();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('فارغ');

    fillFull();
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('أيام التطهير الكامل');
    expect(box(8).textContent).toContain('إعادة إدخال يدوية فقط');
    expect(box(12).textContent).toContain('تقييم لجلسة العرض فقط');
  });

  it('never prints a raw engine warning code', async () => {
    renderTool();
    fillFull({ wantsBloodwork: 'no', suppression: '3' });
    await waitForState('FULL');
    const text = document.body.textContent ?? '';
    for (const code of [
      'heavily_suppressive_stack_longer_recovery',
      'baseline_bloodwork_before_pct_recommended',
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

    setField('cycle-weeks', '999');
    const invalid = field('cycle-weeks');
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
      join(process.cwd(), 'components', 'tools', 'tool-045-cycle-break-planner.tsx'),
      'utf8',
    );
    const genius = readFileSync(
      join(process.cwd(), 'components', 'tools', 'tool-045-cycle-break-planner.genius.tsx'),
      'utf8',
    );
    for (const source of [component, genius]) {
      expect(source).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
      expect(source).not.toMatch(/adapters\/tool-045/);
      expect(source).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]/);
      expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest|localStorage|sessionStorage/);
      expect(source).not.toMatch(/import[^;]*from[^;]*engines\/tool-045/);
    }
    expect(component).toMatch(/runCycleBreakPlanner/);
    // No fabricated defaults survive in the draft.
    expect(component).not.toMatch(/cycleWeeks:\s*'\d+'/);
    expect(component).not.toMatch(/halfLife:\s*'\d+'/);
    expect(component).not.toMatch(/wantsBloodwork:\s*'(yes|no)'/);
  });
});
