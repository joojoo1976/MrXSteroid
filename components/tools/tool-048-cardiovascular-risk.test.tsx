// components/tools/tool-048-cardiovascular-risk.test.tsx
//
// The R6.1 acceptance tests for the Tool 048 Cardiovascular Risk Assessor.
//
// Covered:
//   - the calculation goes through the R6 pipeline exactly once per ready
//     input, and the UI never imports the engine or the legacy adapter;
//   - the five states EMPTY / PARTIAL / INVALID / FULL / DEGRADED;
//   - nothing is invented: every field starts empty, and a numeric 0 is
//     rejected as out of range rather than silently ignored;
//   - the twelve GENIUS boxes are always present, in their fixed order, and a
//     box without approved content says NOT_AVAILABLE with the real reason;
//   - CORE-5 content: C1 risk/band with an honest "not assessed" confidence,
//     C2 formula/contributions/assumptions/uncertainty, C3 drivers/mitigations/
//     warnings/red flags/pending referral, C4 no unapproved source and no
//     legacy invented range, C5 next actions and the session-only rating;
//   - the engine's existing drivers, mitigations and warnings survive unchanged;
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
    fn: null as
      | null
      | (typeof import('@/lib/tools/r6/tool-048-cardiovascular-risk-pipeline'))['runCardioRisk'],
  },
}));

vi.mock('@/lib/tools/r6/tool-048-cardiovascular-risk-pipeline', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/lib/tools/r6/tool-048-cardiovascular-risk-pipeline')
  >();
  hoisted.actual.fn = actual.runCardioRisk;
  hoisted.runSpy.mockImplementation(actual.runCardioRisk);
  return { ...actual, runCardioRisk: hoisted.runSpy };
});

import Tool048 from './tool-048-cardiovascular-risk';

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
  return render(withToolPreferences(<Tool048 />, locale, 'metric'));
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
  smoker?: 'yes' | 'no' | '';
  systolicBp?: string;
  totalCholesterol?: string;
  hdl?: string;
  onCycle?: 'yes' | 'no' | '';
}

/** 50 / male / smoker / 145 / 220 / 35 / off-cycle -> 21 %, high. */
function fillFull(options: FullOptions = {}) {
  const {
    age = '50',
    sex = 'male',
    smoker = 'yes',
    systolicBp = '145',
    totalCholesterol = '220',
    hdl = '35',
    onCycle = 'no',
  } = options;
  setField('age', age);
  setField('sex', sex);
  setField('smoker', smoker);
  setField('systolicBp', systolicBp);
  setField('totalCholesterol', totalCholesterol);
  setField('hdl', hdl);
  setField('onCycle', onCycle);
}

async function waitForState(state: string) {
  await waitFor(() => expect(document.querySelector(`[data-r6-state="${state}"]`)).not.toBeNull());
}

function box(n: number): HTMLElement {
  const element = document.querySelector(`[data-r6-box="${n}"]`);
  if (!element) throw new Error(`missing box ${n}`);
  return element as HTMLElement;
}

describe('Tool 048 cardiovascular — five states and the pipeline', () => {
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
      'smoker',
      'systolicBp',
      'totalCholesterol',
      'hdl',
      'onCycle',
    ]) {
      expect(field(name).getAttribute('aria-required')).toBe('true');
    }
  });

  it('stays PARTIAL until every required field is answered', () => {
    renderTool();
    setField('age', '50');
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();

    fillFull({ onCycle: '' });
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

  it('reports INVALID for an out-of-range HDL', () => {
    renderTool();
    fillFull({ hdl: '111' });
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(field('hdl').getAttribute('aria-invalid')).toBe('true');
    expect(field('age').getAttribute('aria-invalid')).toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('treats a typed 0 as out of range instead of unanswered', () => {
    renderTool();
    fillFull({ systolicBp: '0' });
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(field('systolicBp').getAttribute('aria-invalid')).toBe('true');
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
        sex: string;
        smoker: boolean;
        systolic_bp: number;
        total_cholesterol: number;
        hdl: number;
        on_cycle: boolean;
      },
    ];
    expect(input).toEqual({
      age: 50,
      sex: 'male',
      smoker: true,
      systolic_bp: 145,
      total_cholesterol: 220,
      hdl: 35,
      on_cycle: false,
    });

    const summary = document.querySelector('[data-r6-summary="full"]');
    expect(summary?.textContent).toContain('21%');
    expect(summary?.textContent).toContain('High');
    expect(summary?.textContent).toContain('5');
  });

  it('re-renders the estimate and the band when smoking changes', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('21%');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('High');

    setField('smoker', 'no');
    await waitFor(() => {
      const text = document.querySelector('[data-r6-summary="full"]')?.textContent ?? '';
      expect(text).toContain('17%');
      expect(text).toContain('Elevated');
    });
  });

  it('reports DEGRADED when the pipeline fails its contract guard', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    runSpy.mockImplementationOnce(() => ({ ok: false, error: new Error('envelope guard failed') }));
    setField('age', '51');
    await waitForState('DEGRADED');
    expect(document.body.textContent).toContain('could not produce a valid result');
  });
});

describe('Tool 048 cardiovascular — GENIUS-12 and CORE-5', () => {
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

  it('C1 carries the risk, the band and an honest "not assessed" confidence', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(2).textContent ?? '';
    expect(text).toContain('21%');
    expect(text).toMatch(/Band: High/);
    expect(text).toMatch(/Risk drivers: 5/);
    expect(text).toMatch(/Confidence: Not assessed/);
    expect(text).toMatch(/fixed-weight educational heuristic/i);
    expect(text).toMatch(/not the clinical ASCVD pooled-cohort equation/i);
    expect(text).toMatch(/not a diagnosis and not a prescription/i);
  });

  it('C2 states the formula, every contribution and the assumptions', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(3).textContent ?? '';
    expect(text).toMatch(/Age term = \(age − 18\) × 0\.35 points/i);
    expect(text).toMatch(/max\(0, systolic − 120\) × 0\.08 points/i);
    expect(text).toMatch(/max\(0, total cholesterol − 180\) × 0\.04 points/i);
    expect(text).toMatch(/max\(0, 45 − HDL\) × 0\.1 points/i);
    expect(text).toMatch(/smoker \+4, on cycle \+3, male \+1/i);
    expect(text).toMatch(/clamped to 0–60 %/i);
    expect(text).toMatch(/Age: 11\.2 points/);
    expect(text).toMatch(/Systolic blood pressure: 2 points/);
    expect(text).toMatch(/Total cholesterol: 1\.6 points/);
    expect(text).toMatch(/HDL: 1 points/);
    expect(text).toMatch(/Smoking: 4 points/);
    expect(text).toMatch(/Cycle burden: 0 points/);
    expect(text).toMatch(/Sex \(male\): 1 points/);
    expect(text).toMatch(/Total before rounding: 20\.8 points → 21%/);
    expect(text).toMatch(/Assumptions/i);
    expect(text).toMatch(/Uncertainty/i);
  });

  it('C3 shows the engine drivers, mitigations, warnings, red flags and pending referral', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/Age 45 or over/);
    expect(text).toMatch(/Systolic blood pressure above 130 mmHg/);
    expect(text).toMatch(/Total cholesterol above 200 mg\/dL/);
    expect(text).toMatch(/HDL below 40 mg\/dL/);
    expect(text).toMatch(/informational categories, not instructions/i);
    expect(text).toMatch(/educational additive heuristic, not the clinical ASCVD/i);
    expect(text).toMatch(/estimate is 20 % or higher; the engine recommends a physician consultation/i);
    expect(text).toMatch(/The educational estimate is 20 % or higher/);
    expect(text).toMatch(/Current smoking is an active driver/);
    expect(text).toMatch(/Referral wording is not available/i);
    expect(text).toMatch(/Pending medical review/i);
  });

  it('C3 does not raise the on-cycle red flag when the user is off cycle', async () => {
    renderTool();
    fillFull({ onCycle: 'no' });
    await waitForState('FULL');
    expect(box(7).textContent ?? '').not.toMatch(/Suppressive cycle use is an active driver/);
  });

  it('C3 stays calm on a low-risk input', async () => {
    renderTool();
    fillFull({
      age: '25',
      sex: 'female',
      smoker: 'no',
      systolicBp: '110',
      totalCholesterol: '150',
      hdl: '60',
      onCycle: 'no',
    });
    await waitForState('FULL');
    const text = box(7).textContent ?? '';
    expect(text).toMatch(/No engine driver at these inputs/i);
    expect(text).toMatch(/No red flag at these inputs/i);
    expect(text).not.toMatch(/physician consultation/i);
    expect(box(2).textContent ?? '').toMatch(/Band: Low/);
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
      smoker: boolean;
      systolic_bp: number;
      total_cholesterol: number;
      hdl: number;
      on_cycle: boolean;
    });
    expect(probeInputs.some((input) => input.age === 55)).toBe(true);
    expect(probeInputs.some((input) => input.systolic_bp === 155)).toBe(true);
    expect(probeInputs.some((input) => input.total_cholesterol === 240)).toBe(true);
    expect(probeInputs.some((input) => input.hdl === 25)).toBe(true);
    expect(probeInputs.some((input) => input.smoker === false)).toBe(true);
    expect(probeInputs.some((input) => input.on_cycle === true)).toBe(true);
  });

  it('shows a band crossing in the what-if rows', async () => {
    renderTool();
    fillFull({
      age: '30',
      sex: 'female',
      smoker: 'no',
      systolicBp: '120',
      totalCholesterol: '180',
      hdl: '45',
      onCycle: 'no',
    });
    await waitForState('FULL');
    const whatIf = document.querySelector('[data-r6-core="what-if"]')?.textContent ?? '';
    expect(whatIf).toMatch(/Age \+5 years.*Low → Moderate/);
  });

  it('shows the related tools with a hand-entry rule and no automatic transfer', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = box(8).textContent ?? '';
    expect(text).toMatch(/TRT Lifetime/i);
    expect(text).toMatch(/Hematocrit/i);
    expect(text).toMatch(/Freshness rule/i);
    expect(text).toMatch(/Manual re-entry only/i);
    expect(text).toMatch(/No automatic data transfer/i);
  });

  it('exports a client-side CSV and never adds a session identifier', async () => {
    const createObjectURL = vi.fn(() => 'blob:tool-048');
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

describe('Tool 048 cardiovascular — Arabic, accessibility and persistence', () => {
  it('flips to RTL and localizes the interface in Arabic', async () => {
    renderTool('ar');
    const section = document.querySelector('[data-r6-tool="tool-048-cardiovascular-risk"]');
    expect(section?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { name: 'مقيّم خطر القلب' })).toBeInTheDocument();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('فارغ');

    fillFull();
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('عالٍ');
    expect(box(3).textContent).toContain('حد العمر');
    expect(box(8).textContent).toContain('إعادة إدخال يدوية فقط');
    expect(box(12).textContent).toContain('تقييم لجلسة العرض فقط');
  });

  it('never prints a raw engine driver, mitigation or warning code', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    const text = document.body.textContent ?? '';
    for (const code of [
      'blood_pressure',
      'total_cholesterol',
      'low_hdl',
      'on_cycle_burden',
      'bp_management',
      'lipid_optimization',
      'raise_hdl_cardio',
      'smoking_cessation',
      'cycle_responsibility_bp_lipid_monitoring',
      'educational_not_clinical_ascvd',
      'consult_physician',
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
      join(process.cwd(), 'components', 'tools', 'tool-048-cardiovascular-risk.tsx'),
      'utf8',
    );
    const genius = readFileSync(
      join(process.cwd(), 'components', 'tools', 'tool-048-cardiovascular-risk.genius.tsx'),
      'utf8',
    );
    for (const source of [component, genius]) {
      expect(source).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
      expect(source).not.toMatch(/adapters\/tool-048/);
      expect(source).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]/);
      expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest|localStorage|sessionStorage/);
      expect(source).not.toMatch(/import[^;]*from[^;]*engines\/tool-048/);
    }
    expect(component).toMatch(/runCardioRisk/);
    // No fabricated defaults survive in the draft.
    expect(component).not.toMatch(/age:\s*'\d+'/);
    expect(component).not.toMatch(/systolicBp:\s*'\d+'/);
    expect(component).not.toMatch(/hdl:\s*'\d+'/);
  });
});
