// components/tools/tool-049-bone-density.test.tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { withToolPreferences } from './tool-preferences.test-utils';

const hoisted = vi.hoisted(() => ({
  runSpy: vi.fn(),
  actual: {
    fn: null as
      | null
      | (typeof import('@/lib/tools/r6/tool-049-bone-density-pipeline'))['runBoneDensity'],
  },
}));

vi.mock('@/lib/tools/r6/tool-049-bone-density-pipeline', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/lib/tools/r6/tool-049-bone-density-pipeline')
  >();
  hoisted.actual.fn = actual.runBoneDensity;
  hoisted.runSpy.mockImplementation(actual.runBoneDensity);
  return { ...actual, runBoneDensity: hoisted.runSpy };
});

import Tool049 from './tool-049-bone-density';

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
  return render(withToolPreferences(<Tool049 />, locale, 'metric'));
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
  sex?: 'male' | 'female' | '';
  usesAiYears?: string;
  weeklyResistance?: string;
  calciumMg?: string;
  vitaminD?: string;
  smoker?: 'yes' | 'no' | '';
}

/** 30 / male / 2 AI years / 4 sessions / 1200 mg / 2000 IU / non-smoker -> 84, optimal. */
function fillFull(options: FullOptions = {}) {
  const {
    age = '30',
    sex = 'male',
    usesAiYears = '2',
    weeklyResistance = '4',
    calciumMg = '1200',
    vitaminD = '2000',
    smoker = 'no',
  } = options;
  setField('age', age);
  setField('sex', sex);
  setField('usesAiYears', usesAiYears);
  setField('weeklyResistance', weeklyResistance);
  setField('calciumMg', calciumMg);
  setField('vitaminD', vitaminD);
  setField('smoker', smoker);
}

async function waitForState(state: string) {
  await waitFor(() => expect(document.querySelector(`[data-r6-state="${state}"]`)).not.toBeNull());
}

function box(n: number): HTMLElement {
  const element = document.querySelector(`[data-r6-box="${n}"]`);
  if (!element) throw new Error(`missing box ${n}`);
  return element as HTMLElement;
}

describe('Tool 049 bone density — five states and the pipeline', () => {
  it('starts EMPTY and invents nothing', () => {
    renderTool();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('Empty');
    expect(runSpy).not.toHaveBeenCalled();
    for (const input of Array.from(document.querySelectorAll('[data-r6-field]')) as HTMLInputElement[]) {
      expect(input.value).toBe('');
    }
    for (const name of [
      'age',
      'sex',
      'usesAiYears',
      'weeklyResistance',
      'calciumMg',
      'vitaminD',
      'smoker',
    ]) {
      expect(field(name).getAttribute('aria-required')).toBe('true');
    }
  });

  it('stays PARTIAL until every required field is answered', () => {
    renderTool();
    setField('age', '30');
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();

    fillFull({ smoker: '' });
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

  it('reports INVALID for an out-of-range vitamin D value', () => {
    renderTool();
    fillFull({ vitaminD: '10001' });
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(field('vitaminD').getAttribute('aria-invalid')).toBe('true');
    expect(field('age').getAttribute('aria-invalid')).toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('treats a typed 0 as a real value for the zero-valid fields', async () => {
    renderTool();
    fillFull({ usesAiYears: '0', weeklyResistance: '0', calciumMg: '0', vitaminD: '0' });
    // All zero-valid fields are 0; age is still 30, sex male, smoker no -> valid.
    // score = 60 + 0 + 0 + 0 - 0 - 0 - 0 - 0 = 60 -> good
    // But uses_ai_years 0 removes ai_exposure risk factor.
    await waitForState('FULL');
    expect(runSpy).toHaveBeenCalled();
    const [input] = runSpy.mock.calls[0] as unknown as [{ uses_ai_years: number; weekly_resistance_sessions: number; calcium_mg_daily: number; vitamin_d_iu_daily: number }];
    expect(input.uses_ai_years).toBe(0);
    expect(input.weekly_resistance_sessions).toBe(0);
    expect(input.calcium_mg_daily).toBe(0);
    expect(input.vitamin_d_iu_daily).toBe(0);
  });

  it('calculates through the R6 pipeline once the input is complete', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(runSpy).toHaveBeenCalled();

    const [input] = runSpy.mock.calls[0] as unknown as [
      {
        age: number;
        sex: string;
        uses_ai_years: number;
        weekly_resistance_sessions: number;
        calcium_mg_daily: number;
        vitamin_d_iu_daily: number;
        smoker: boolean;
      },
    ];
    expect(input).toEqual({
      age: 30,
      sex: 'male',
      uses_ai_years: 2,
      weekly_resistance_sessions: 4,
      calcium_mg_daily: 1200,
      vitamin_d_iu_daily: 2000,
      smoker: false,
    });

    const summary = document.querySelector('[data-r6-summary="full"]');
    expect(summary?.textContent).toContain('84');
    expect(summary?.textContent).toContain('Optimal');
  });

  it('re-renders the score when smoking changes', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('84');

    setField('smoker', 'yes');
    await waitFor(() => {
      const text = document.querySelector('[data-r6-summary="full"]')?.textContent ?? '';
      expect(text).toContain('76');
      expect(text).toContain('Good');
    });
  });

  it('reports DEGRADED when the pipeline fails its contract guard', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    runSpy.mockImplementationOnce(() => ({ ok: false, error: new Error('envelope guard failed') }));
    setField('age', '31');
    await waitForState('DEGRADED');
    expect(document.body.textContent).toContain('could not produce a valid result');
  });
});

describe('Tool 049 bone density — GENIUS-12 and CORE-5', () => {
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

  it('C1 carries the score, the band and an honest "not assessed" confidence', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(2).textContent ?? '';
    expect(text).toContain('84');
    expect(text).toMatch(/Band: Optimal/);
    expect(text).toMatch(/Risk factors: 1/);
    expect(text).toMatch(/Confidence: Not assessed/);
    expect(text).toMatch(/fixed-weight educational screening estimate/i);
    expect(text).toMatch(/not a DXA scan/i);
    expect(text).toMatch(/not a diagnosis and not a prescription/i);
  });

  it('C2 states the formula, every contribution and the assumptions', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(3).textContent ?? '';
    expect(text).toMatch(/Base = 60 points/i);
    expect(text).toMatch(/min\(20, weekly sessions × 3\)/i);
    expect(text).toMatch(/min\(15, daily calcium ÷ 100\)/i);
    expect(text).toMatch(/min\(15, daily vitamin D ÷ 400\)/i);
    expect(text).toMatch(/years of aromatase-inhibitor use × 2\.5/i);
    expect(text).toMatch(/Smoking penalty = 8 points/i);
    expect(text).toMatch(/Postmenopausal proxy penalty = 8 points/i);
    expect(text).toMatch(/Advanced-age penalty = 5 points/i);
    expect(text).toMatch(/clamped to 0–100/i);
    expect(text).toMatch(/Base: 60 points/);
    expect(text).toMatch(/Resistance training: 12 points/);
    expect(text).toMatch(/Calcium intake: 12 points/);
    expect(text).toMatch(/Vitamin D intake: 5 points/);
    expect(text).toMatch(/AI \(aromatase inhibitor\) exposure: -5 points/);
    expect(text).toMatch(/Smoking: 0 points/);
    expect(text).toMatch(/Postmenopausal proxy: 0 points/);
    expect(text).toMatch(/Advanced age: 0 points/);
    expect(text).toMatch(/Total before rounding: 84 points → 84/);
    expect(text).toMatch(/Assumptions/i);
    expect(text).toMatch(/Uncertainty/i);
  });

  it('C3 shows the engine risk factors, interventions, warnings and pending referral', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/Aromatase-inhibitor \(AI\) exposure/);
    expect(text).toMatch(/Review AI use with a physician \(informational\)/);
    expect(text).toMatch(/informational categories, not instructions/i);
    expect(text).toMatch(/educational screening score, not a DXA diagnosis/i);
    expect(text).not.toMatch(/The score is below 40/);
    // red flag for AI exposure present
    expect(text).toMatch(/Aromatase-inhibitor exposure is an active risk factor/i);
    expect(text).toMatch(/Referral wording is not available/i);
    expect(text).toMatch(/Pending medical review/i);
  });

  it('C3 stays calm on a high-scoring non-smoker with no AI exposure', async () => {
    renderTool();
    fillFull({
      age: '25',
      sex: 'female',
      usesAiYears: '0',
      weeklyResistance: '5',
      calciumMg: '1000',
      vitaminD: '1200',
      smoker: 'no',
    });
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/No engine risk factor at these inputs/i);
    expect(text).toMatch(/No red flag at these inputs/i);
    expect(box(2).textContent ?? '').toMatch(/Band: Optimal/);
  });

  it('C4 does not invent a source, a range or a confidence', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(9).textContent ?? '';
    expect(text).toMatch(/NOT_AVAILABLE/);
    expect(text).toMatch(/no approved source recorded/i);
    expect(text).toMatch(/0\.9/);
    expect(text).toMatch(/not reused/i);
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
    expect(whatIf?.querySelectorAll('li')).toHaveLength(6);
    expect(sensitivity?.querySelectorAll('li')).toHaveLength(6);
    expect(whatIf?.textContent).toMatch(/same calculation path/i);
    expect(sensitivity?.textContent).toMatch(/not a medical recommendation/i);

    expect(runSpy.mock.calls.length).toBeGreaterThanOrEqual(7);
    const probeInputs = runSpy.mock.calls.map((call) => call[0] as {
      age: number;
      sex: string;
      uses_ai_years: number;
      weekly_resistance_sessions: number;
      calcium_mg_daily: number;
      vitamin_d_iu_daily: number;
      smoker: boolean;
    });
    expect(probeInputs.some((input) => input.age === 35)).toBe(true);
    expect(probeInputs.some((input) => input.uses_ai_years === 4)).toBe(true);
    expect(probeInputs.some((input) => input.weekly_resistance_sessions === 6)).toBe(true);
    expect(probeInputs.some((input) => input.calcium_mg_daily === 1700)).toBe(true);
    expect(probeInputs.some((input) => input.vitamin_d_iu_daily === 3000)).toBe(true);
    expect(probeInputs.some((input) => input.smoker === true)).toBe(true);
  });

  it('shows the related tools with a hand-entry rule and no automatic transfer', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(8).textContent ?? '';
    expect(text).toMatch(/Fertility Preservation/i);
    expect(text).toMatch(/TRT Lifetime/i);
    expect(text).toMatch(/Freshness rule/i);
    expect(text).toMatch(/Manual re-entry only/i);
    expect(text).toMatch(/No automatic data transfer/i);
  });

  it('exports a client-side CSV and never adds a session identifier', async () => {
    const createObjectURL = vi.fn(() => 'blob:tool-049');
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

describe('Tool 049 bone density — Arabic, accessibility and persistence', () => {
  it('flips to RTL and localizes the interface in Arabic', async () => {
    renderTool('ar');
    const section = document.querySelector('[data-r6-tool="tool-049-bone-density"]');
    expect(section?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { name: 'محسّن كثافة العظام' })).toBeInTheDocument();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('فارغ');

    fillFull();
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('مثالي');
    expect(box(3).textContent).toContain('الأساس');
    expect(box(8).textContent).toContain('إعادة إدخال يدوية فقط');
    expect(box(12).textContent).toContain('تقييم لجلسة العرض فقط');
  });

  it('never prints a raw engine risk factor, intervention or warning code', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = document.body.textContent ?? '';
    for (const code of [
      'ai_exposure',
      'low_resistance_training',
      'low_calcium',
      'low_vitamin_d',
      'postmenopausal_proxy',
      'advanced_age',
      'review_ai_use_with_physician',
      'progressive_resistance_program',
      'calcium_intake_1000mg',
      'vitamin_d_1000_2000iu',
      'smoking_cessation',
      'dxa_scan_discussion',
      'educational_screening_not_diagnosis',
    ]) {
      expect(text).not.toContain(code);
    }
  });

  it('labels every control, announces the state and marks an invalid input', () => {
    renderTool();
    for (const control of Array.from(document.querySelectorAll('[data-r6-field]'))) {
      expect((control as HTMLInputElement).labels?.length ?? 0).toBeGreaterThan(0);
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
      join(process.cwd(), 'components', 'tools', 'tool-049-bone-density.tsx'),
      'utf8',
    );
    const genius = readFileSync(
      join(process.cwd(), 'components', 'tools', 'tool-049-bone-density.genius.tsx'),
      'utf8',
    );
    for (const source of [component, genius]) {
      expect(source).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
      expect(source).not.toMatch(/adapters\/tool-049/);
      expect(source).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]/);
      expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest|localStorage|sessionStorage/);
      expect(source).not.toMatch(/import[^;]*from[^;]*engines\/tool-049/);
    }
    expect(component).toMatch(/runBoneDensity/);
    expect(component).not.toMatch(/age:\s*'\d+'/);
    expect(component).not.toMatch(/calciumMg:\s*'\d+'/);
    expect(component).not.toMatch(/vitaminD:\s*'\d+'/);
  });
});
