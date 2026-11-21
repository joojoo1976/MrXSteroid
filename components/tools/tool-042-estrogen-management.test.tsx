// components/tools/tool-042-estrogen-management.test.tsx
//
// The R6.1 acceptance tests for the Tool 042 Estrogen Management component.
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
//   - the engine's existing AI-delta hint and warnings survive unchanged;
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
    fn: null as null | (typeof import('@/lib/tools/r6/tool-042-estrogen-management-pipeline'))['runEstrogenManagement'],
  },
}));

vi.mock('@/lib/tools/r6/tool-042-estrogen-management-pipeline', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/lib/tools/r6/tool-042-estrogen-management-pipeline')
  >();
  hoisted.actual.fn = actual.runEstrogenManagement;
  hoisted.runSpy.mockImplementation(actual.runEstrogenManagement);
  return { ...actual, runEstrogenManagement: hoisted.runSpy };
});

import Tool042 from './tool-042-estrogen-management';

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
  return render(withToolPreferences(<Tool042 />, locale, 'metric'));
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
  e2?: string;
  weeklyTest?: string;
  takingAi?: 'yes' | 'no';
  aiDose?: string;
  bodyFat?: string;
  symptoms?: string[];
}

function fillFull(options: FullOptions = {}) {
  const {
    e2 = '25',
    weeklyTest = '500',
    takingAi = 'no',
    aiDose = '',
    bodyFat = '18',
    symptoms = [],
  } = options;
  setField('e2', e2);
  setField('weekly-test', weeklyTest);
  setField('body-fat', bodyFat);
  setField('taking-ai', takingAi);
  if (takingAi === 'yes') setField('ai-dose', aiDose);
  for (const symptom of symptoms) {
    fireEvent.click(document.querySelector(`[data-r6-symptom="${symptom}"]`) as HTMLElement);
  }
}

async function waitForState(state: string) {
  await waitFor(() => expect(document.querySelector(`[data-r6-state="${state}"]`)).not.toBeNull());
}

function box(n: number): HTMLElement {
  const element = document.querySelector(`[data-r6-box="${n}"]`);
  if (!element) throw new Error(`missing box ${n}`);
  return element as HTMLElement;
}

describe('Tool 042 estrogen management — five states and the pipeline', () => {
  it('starts EMPTY and invents nothing', () => {
    renderTool();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('Empty');
    expect(runSpy).not.toHaveBeenCalled();
    for (const input of Array.from(document.querySelectorAll('[data-r6-field]')) as HTMLInputElement[]) {
      expect(input.value).toBe('');
    }
    for (const name of ['e2', 'weekly-test', 'body-fat', 'taking-ai']) {
      expect(field(name).getAttribute('aria-required')).toBe('true');
    }
    // The AI dose is only required once an AI is actually taken.
    expect(field('ai-dose').hasAttribute('disabled')).toBe(true);
  });

  it('stays PARTIAL until every required field is answered', () => {
    renderTool();
    setField('e2', '25');
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('stays PARTIAL when an AI is taken but its dose is missing', () => {
    renderTool();
    fillFull({ takingAi: 'yes', aiDose: '' });
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for a typed zero and calculates nothing', () => {
    renderTool();
    setField('e2', '0');
    setField('weekly-test', '500');
    setField('body-fat', '18');
    setField('taking-ai', 'no');
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('outside the accepted range');
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('cannot hold non-numeric text in a numeric field and never calculates on it', () => {
    renderTool();
    // A `type="number"` control sanitizes letters away at the browser level, so
    // the draft stays EMPTY rather than inventing a value. The `invalid_number`
    // branch of the contract is covered by its own unit test.
    fillFull({ e2: 'abc' });
    expect(field('e2')).toHaveProperty('value', '');
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('calculates through the R6 pipeline once the input is complete', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(runSpy).toHaveBeenCalled();

    const [input] = runSpy.mock.calls[0] as unknown as [
      {
        e2_pg_ml: number;
        weekly_testosterone_mg: number;
        taking_ai: boolean;
        weekly_ai_dose_mg: number;
        symptoms: string[];
        body_fat_pct: number;
      },
    ];
    expect(input).toEqual({
      e2_pg_ml: 25,
      weekly_testosterone_mg: 500,
      taking_ai: false,
      weekly_ai_dose_mg: 0,
      symptoms: [],
      body_fat_pct: 18,
    });

    const summary = document.querySelector('[data-r6-summary="full"]');
    expect(summary?.textContent).toContain('25.0');
    expect(summary?.textContent).toContain('Optimal');
    expect(summary?.textContent).toContain('0.00');
  });

  it('preserves the engine AI-delta hint for an existing AI', async () => {
    renderTool();
    fillFull({ e2: '65', takingAi: 'yes', aiDose: '1' });
    await waitForState('FULL');
    const summary = document.querySelector('[data-r6-summary="full"]');
    expect(summary?.textContent).toContain('High');
    expect(summary?.textContent).toContain('+0.50');
    expect(summary?.textContent).toContain('Adjust the existing AI dose');
  });

  it('shows the newest value immediately and never a stale result', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    setField('e2', '45');
    await waitFor(() =>
      expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('45.0'),
    );
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('Elevated');
  });

  it('escalates an optimal reading when two symptoms are reported', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('Optimal');
    fireEvent.click(document.querySelector('[data-r6-symptom="edema"]') as HTMLElement);
    fireEvent.click(document.querySelector('[data-r6-symptom="mood_swings"]') as HTMLElement);
    await waitFor(() =>
      expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('Elevated'),
    );
  });

  it('reports DEGRADED when the pipeline fails its contract guard', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    runSpy.mockImplementationOnce(() => ({ ok: false, error: new Error('envelope guard failed') }));
    setField('weekly-test', '600');
    await waitForState('DEGRADED');
    expect(document.body.textContent).toContain('could not produce a result');
  });
});

describe('Tool 042 estrogen management — GENIUS-12 and CORE-5', () => {
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

  it('C1 carries the result, the optimal band and an honest confidence', async () => {
    renderTool();
    fillFull({ e2: '65', takingAi: 'yes', aiDose: '1' });
    await waitForState('FULL');
    const text = box(2).textContent ?? '';
    expect(text).toContain('65.0');
    expect(text).toContain('High');
    expect(text).toMatch(/Optimal range/i);
    expect(text).toMatch(/10–40/);
    expect(text).toMatch(/not a personal reference range/i);
    expect(text).toMatch(/Not assessed/i);
    expect(text).toMatch(/Suggested AI change/i);
    expect(text).toMatch(/Prescriber review only/i);
  });

  it('C2 states the formula with the engine limits, the assumptions and the uncertainty', async () => {
    renderTool();
    fillFull({ e2: '45', takingAi: 'yes', aiDose: '0.5', symptoms: ['edema'] });
    await waitForState('FULL');
    const text = box(3).textContent ?? '';
    expect(text).toMatch(/Formula/i);
    expect(text).toMatch(/above 60 pg\/mL/);
    expect(text).toMatch(/above 40 pg\/mL/);
    expect(text).toMatch(/below 10 pg\/mL/);
    expect(text).toMatch(/10 to 40 pg\/mL/);
    expect(text).toMatch(/Two or more selected symptoms/i);
    expect(text).toMatch(/\+0\.50 mg\/week/);
    expect(text).toMatch(/\+0\.25 mg\/week/);
    expect(text).toMatch(/−0\.25 mg\/week/);
    expect(text).toMatch(/Assumptions/i);
    expect(text).toMatch(/Uncertainty/i);
    expect(text).toContain('0.5 mg/week');
    expect(text).toContain('Edema');
  });

  it('C3 raises the engine warning, a red flag and the pending referral for high E2 without an AI', async () => {
    renderTool();
    fillFull({ e2: '65', takingAi: 'no' });
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/E2 is high while no AI is taken/i);
    expect(text).toMatch(/discuss it with the prescriber/i);
    expect(text).toMatch(/The result band is high/i);
    expect(text).toMatch(/Referral wording is not available/i);
    expect(text).toMatch(/Pending medical review/i);
  });

  it('C3 raises the AI-overshoot red flag when E2 is low on an AI', async () => {
    renderTool();
    fillFull({ e2: '5', takingAi: 'yes', aiDose: '1' });
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/AI may be overshooting/i);
    expect(text).toMatch(/may be overshooting with a low E2/i);
  });

  it('C3 raises the extreme-E2 red flag above 100 pg/mL', async () => {
    renderTool();
    fillFull({ e2: '150', takingAi: 'no' });
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/above 100 pg\/mL/);
    expect(text).toMatch(/seek a physician/i);
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
    expect(whatIf?.textContent).toMatch(/re-runs the same calculation path/i);
    expect(sensitivity?.textContent).toMatch(/not a medical recommendation/i);

    // The probes really changed one value each: E2 25 → 30 and 25 → 20.
    expect(runSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
    const probeInputs = runSpy.mock.calls.map((call) => call[0] as { e2_pg_ml: number });
    expect(probeInputs.some((input) => input.e2_pg_ml === 30)).toBe(true);
    expect(probeInputs.some((input) => input.e2_pg_ml === 20)).toBe(true);
  });

  it('shows the related tools with a hand-entry rule and no automatic transfer', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(8).textContent ?? '';
    expect(text).toContain('Estradiol & Prolactin Record');
    expect(text).toContain('TRT Optimization');
    expect(text).toMatch(/Freshness rule/i);
    expect(text).toMatch(/Manual re-entry only/i);
    expect(text).toMatch(/No automatic data transfer/i);
  });

  it('exports a client-side CSV and never adds a session identifier', async () => {
    const createObjectURL = vi.fn(() => 'blob:tool-042');
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

describe('Tool 042 estrogen management — Arabic, accessibility and persistence', () => {
  it('flips to RTL and localizes the interface in Arabic', async () => {
    renderTool('ar');
    const section = document.querySelector('[data-r6-tool="tool-042-estrogen-management"]');
    expect(section?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { name: 'إدارة الإستروجين الاحترافية' })).toBeInTheDocument();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('فارغ');

    fillFull({ e2: '65', takingAi: 'yes', aiDose: '1' });
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('مرتفع');
    expect(box(8).textContent).toContain('سجل قيم الإستروجين والبرولاكتين');
    expect(box(8).textContent).toContain('إعادة إدخال يدوية فقط');
    expect(box(12).textContent).toContain('التقييم لجلسة العرض فقط ولا يُحفظ');
  });

  it('never prints a raw engine warning code or a raw action code', async () => {
    renderTool();
    fillFull({ e2: '5', takingAi: 'yes', aiDose: '1' });
    await waitForState('FULL');
    const text = document.body.textContent ?? '';
    for (const code of [
      'elevated_e2_without_ai_discuss_with_prescriber',
      'ai_may_be_overshooting',
      'low_e2_without_ai_check_prolactin_lh',
      'e2_extreme_seek_physician',
      'adjust_ai',
      'reduce_test',
      'nipple_sensitivity',
      'water_retention',
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

    setField('e2', '999');
    const invalid = field('e2');
    expect(invalid.getAttribute('aria-invalid')).toBe('true');
    expect(invalid.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const rating = document.querySelector('[data-r6-rating]');
    expect(rating).not.toBeNull();
    expect(within(rating as HTMLElement).getByRole('group').getAttribute('aria-label')).toBeTruthy();
  });

  it('marks an out-of-range field only, not every field', () => {
    renderTool();
    fillFull({ e2: '999' });
    expect(field('e2').getAttribute('aria-invalid')).toBe('true');
    expect(field('weekly-test').getAttribute('aria-invalid')).toBeNull();
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
      join(process.cwd(), 'components', 'tools', 'tool-042-estrogen-management.tsx'),
      'utf8',
    );
    const genius = readFileSync(
      join(process.cwd(), 'components', 'tools', 'tool-042-estrogen-management.genius.tsx'),
      'utf8',
    );
    for (const source of [component, genius]) {
      expect(source).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
      expect(source).not.toMatch(/adapters\/tool-042/);
      expect(source).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]/);
      expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest|localStorage|sessionStorage/);
      expect(source).not.toMatch(/import[^;]*from[^;]*engines\/tool-042/);
    }
    expect(component).toMatch(/runEstrogenManagement/);
    // No fabricated defaults survive in the draft.
    expect(component).not.toMatch(/e2:\s*'\d+'/);
    expect(component).not.toMatch(/weeklyTest:\s*'\d+'/);
    expect(component).not.toMatch(/takingAi:\s*'(yes|no)'/);
  });
});
