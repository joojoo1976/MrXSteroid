import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline')>();
  return { ...actual, runLiverEnzymeTracker: vi.fn(actual.runLiverEnzymeTracker) };
});

import Tool039 from './tool-039-liver-enzyme-tracker';
import { runLiverEnzymeTracker } from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline';
import { TOOL_039_DEBOUNCE_MS } from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-contract';

const runSpy = vi.mocked(runLiverEnzymeTracker);
const realPipelineImpl = runSpy.getMockImplementation();

afterEach(() => {
  cleanup();
  runSpy.mockClear();
  if (realPipelineImpl) runSpy.mockImplementation(realPipelineImpl);
});

function renderTool(locale: 'ar' | 'en' = 'en', unitSystem: 'metric' | 'imperial' = 'metric') {
  return render(withToolPreferences(<Tool039 />, locale, unitSystem));
}

function addReading() {
  fireEvent.click(screen.getByRole('button', { name: /Add reading/ }));
}

function fillReading(position: number, value: string, date: string) {
  fireEvent.change(screen.getByLabelText(`Value ${position}`), { target: { value } });
  fireEvent.change(screen.getByLabelText(`Draw date ${position}`), { target: { value: date } });
}

function answer(question: string, choice: 'Yes' | 'No' | 'Unanswered') {
  const group = screen.getByRole('group', { name: question });
  fireEvent.click(within(group).getByRole('button', { name: choice }));
}

function fillAlcohol(value: string) {
  fireEvent.change(screen.getByLabelText('Alcohol drinks per week'), { target: { value } });
}

function completeAllFields(value = '45', date = '2026-01-01') {
  addReading();
  fillReading(1, value, date);
  answer('On oral steroids', 'Yes');
  answer('Using TUDCA', 'No');
  fillAlcohol('0');
}

/** The result engine is debounced: wait until the scheduled run has landed. */
async function settle() {
  await waitFor(() => expect(runSpy).toHaveBeenCalled(), { timeout: TOOL_039_DEBOUNCE_MS * 20 });
}

/**
 * The primary calculation is the single pipeline run that uses the entered
 * reading. The GENIUS-12 what-if / sensitivity boxes re-run the SAME pipeline
 * with one changed input, so those calls are counted separately.
 */
function primaryCalls(value: string, date: string) {
  return runSpy.mock.calls.filter(([input]) => {
    const payload = input as {
      readings?: Array<{ value: number; date: string }>;
      oral_steroids?: boolean;
      uses_tudca?: boolean;
      alcohol_drinks_per_week?: number;
    };
    const readings = payload.readings ?? [];
    return (
      readings.length === 1 &&
      readings[0].value === Number(value) &&
      readings[0].date === date &&
      payload.oral_steroids === true &&
      payload.uses_tudca === false &&
      payload.alcohol_drinks_per_week === 0
    );
  });
}

describe('Tool 039 liver enzyme tracker — input states and R6 pipeline boundary', () => {
  it('EMPTY: no readings, no fake validation errors, pipeline not called', () => {
    renderTool();

    expect(screen.getByRole('heading', { name: 'Liver Enzyme Tracker' })).toBeInTheDocument();
    expect(screen.getByText('No readings yet. Add a reading to begin.')).toBeInTheDocument();
    expect(screen.getByText(/State:\s*Empty/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('PARTIAL: a reading with an empty value/date stays PARTIAL and never calls the pipeline', () => {
    renderTool();
    addReading();

    expect(screen.getByText('Partial input — complete every reading, the answers and alcohol intake.')).toBeInTheDocument();
    expect(screen.getByText(/State:\s*Partial/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('PARTIAL: an empty date is missing input, not INVALID', () => {
    renderTool();
    addReading();
    fireEvent.change(screen.getByLabelText('Value 1'), { target: { value: '45' } });
    answer('On oral steroids', 'No');
    answer('Using TUDCA', 'No');
    fillAlcohol('0');

    expect(screen.getByText(/State:\s*Partial/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('keeps Yes / No / Unanswered explicit and refuses to build input while unanswered', async () => {
    renderTool();
    addReading();
    fillReading(1, '45', '2026-01-01');
    fillAlcohol('0');

    const oral = screen.getByRole('group', { name: 'On oral steroids' });
    expect(within(oral).getByRole('button', { name: 'Unanswered' })).toHaveAttribute('aria-pressed', 'true');

    answer('On oral steroids', 'Yes');
    expect(within(oral).getByRole('button', { name: 'Yes' })).toHaveAttribute('aria-pressed', 'true');
    expect(runSpy).not.toHaveBeenCalled();

    answer('Using TUDCA', 'No');
    await settle();
    expect(primaryCalls('45', '2026-01-01')).toHaveLength(1);
    expect(primaryCalls('45', '2026-01-01')[0][0]).toMatchObject({
      readings: [{ marker: 'ALT', value: 45, unit: 'U/L', date: '2026-01-01' }],
      oral_steroids: true,
      uses_tudca: false,
      alcohol_drinks_per_week: 0,
    });
  });

  it('INVALID: a negative value is rejected without coercion and the pipeline is not called', () => {
    renderTool();
    completeAllFields('-5');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Value must be a number|outside the allowed range/)).toBeInTheDocument();
    expect(screen.getByLabelText('Value 1')).toHaveAttribute('aria-invalid', 'true');
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('INVALID: non-numeric text is rejected instead of becoming zero', () => {
    renderTool();
    completeAllFields('abc');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Value must be a number/)).toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('INVALID: a value above the schema maximum is rejected', () => {
    renderTool();
    completeAllFields('6000');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/outside the allowed range/)).toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('INVALID: an impossible calendar date is rejected', () => {
    renderTool();
    completeAllFields('45', '2026-02-30');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Use a valid date in YYYY-MM-DD format/)).toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('INVALID: alcohol above the schema maximum is rejected', () => {
    renderTool();
    addReading();
    fillReading(1, '45', '2026-01-01');
    answer('On oral steroids', 'No');
    answer('Using TUDCA', 'No');
    fillAlcohol('150');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/outside the allowed range/)).toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('FULL: a typed zero stays zero end-to-end', async () => {
    renderTool();
    completeAllFields('0');
    await settle();

    expect(primaryCalls('0', '2026-01-01')).toHaveLength(1);
    expect(primaryCalls('0', '2026-01-01')[0][0]).toMatchObject({
      readings: [{ marker: 'ALT', value: 0, unit: 'U/L', date: '2026-01-01' }],
      alcohol_drinks_per_week: 0,
    });
    expect(screen.getByText(/State:\s*Full/)).toBeInTheDocument();
    expect(screen.getAllByText('0 U/L').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Normal').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Calculated by the R6 pipeline/).length).toBeGreaterThan(0);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('FULL: complete valid input produces the engine result through the pipeline', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    expect(primaryCalls('112', '2026-01-01')).toHaveLength(1);
    expect(screen.getByText(/State:\s*Full/)).toBeInTheDocument();
    expect(screen.getAllByText('112 U/L').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.00× ULN').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Elevated').length).toBeGreaterThan(0);
  });

  it('renders the five CORE-5 boxes with headings and their required content', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    const expectations: Array<[string, string[]]> = [
      ['2', ['Reference limit', 'not calibrated', '112 U/L']],
      ['3', ['value ÷ reference upper limit', 'No calibrated confidence interval']],
      ['7', ['When to seek medical care', 'Do not']],
      ['9', ['National Library of Medicine', 'E2', '2026-11-11']],
      ['12', ['Next step', 'What not to do', 'When to see a doctor']],
    ];
    for (const [boxId, needles] of expectations) {
      const box = document.querySelector(`[data-r6-box="${boxId}"]`);
      expect(box, `box ${boxId} must exist`).not.toBeNull();
      // Semantic structure: a real heading inside the box.
      expect(box?.querySelector('h3')?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      for (const needle of needles) {
        expect(box?.textContent ?? '', `box ${boxId} must contain "${needle}"`).toContain(needle);
      }
    }
  });

  it('DEGRADED: a complete input whose pipeline fails shows the degraded state with the reason', async () => {
    runSpy.mockImplementation(() => ({ ok: false, error: new Error('engine offline') }));
    renderTool();
    completeAllFields('112');
    await settle();

    expect(screen.getByText(/State:\s*Degraded/)).toBeInTheDocument();
    expect(screen.getByText(/Calculation could not be completed/)).toBeInTheDocument();
    expect(screen.getByText(/engine offline/)).toBeInTheDocument();
    // No result card and no Genius boxes while degraded.
    expect(screen.queryByText('112 U/L')).not.toBeInTheDocument();
    expect(document.querySelector('[data-r6-genius="tool-039"]')).toBeNull();
  });

  it('deleting every reading returns the tool to EMPTY', () => {
    renderTool();
    addReading();
    addReading();
    fireEvent.click(screen.getByRole('button', { name: 'Remove 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove 1' }));

    expect(screen.getByText(/State:\s*Empty/)).toBeInTheDocument();
    expect(screen.getByText('No readings yet. Add a reading to begin.')).toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('is deterministic: rerendering identical input does not recalculate', async () => {
    const view = renderTool();
    completeAllFields('112');
    await settle();
    expect(primaryCalls('112', '2026-01-01')).toHaveLength(1);

    const callsBefore = runSpy.mock.calls.length;
    runSpy.mockClear();
    view.rerender(withToolPreferences(<Tool039 />, 'en', 'metric'));

    expect(runSpy).not.toHaveBeenCalled();
    expect(callsBefore).toBeGreaterThan(0);
    expect(screen.getAllByText('112 U/L').length).toBeGreaterThan(0);
  });

  it('debounces the calculation: a burst of edits triggers exactly one pipeline run', async () => {
    renderTool();
    addReading();
    fillReading(1, '45', '2026-01-01');
    answer('On oral steroids', 'Yes');
    answer('Using TUDCA', 'No');
    fillAlcohol('0');

    fireEvent.change(screen.getByLabelText('Value 1'), { target: { value: '11' } });
    fireEvent.change(screen.getByLabelText('Value 1'), { target: { value: '112' } });
    fireEvent.change(screen.getByLabelText('Value 1'), { target: { value: '112' } });

    // Inside the debounce window nothing has been calculated yet.
    expect(runSpy).not.toHaveBeenCalled();

    await settle();
    expect(primaryCalls('112', '2026-01-01')).toHaveLength(1);
    expect(primaryCalls('45', '2026-01-01')).toHaveLength(0);
  });

  it('uses the Arabic locale and RTL direction from the global preferences', () => {
    renderTool('ar');

    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'متتبع إنزيمات الكبد' })).toBeInTheDocument();
    expect(screen.getByText(/تعتمد الحسابات على قواعد ثابتة/)).toBeInTheDocument();
    expect(screen.getByText(/الحالة:\s*فارغ/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'لم يجب' }).length).toBe(2);
  });
});

describe('Tool 039 source integrity (single calculation source, no SERVER persistence, no network)', () => {
  const readComponent = (file: string) =>
    readFileSync(join(process.cwd(), 'components', 'tools', file), 'utf8');

  it('never imports the engine or the persistence adapters directly', () => {
    for (const file of ['tool-039-liver-enzyme-tracker.tsx', 'tool-039-liver-enzyme-tracker.genius.tsx']) {
      const source = readComponent(file);
      expect(source).not.toMatch(/engines\/tool-039/);
      expect(source).not.toMatch(/adapters\/tool-039/);
      expect(source).not.toMatch(/commitDashboardSnapshot|clearDraft|loadDraft|saveDraft|buildAiContext/);
      expect(source).not.toMatch(/import[^;]*from\s+['"][^'"]*supabase[^'"]*['"]/);
      expect(source).not.toMatch(/createClient\(/);
      expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest/);
    }
  });

  it('uses the local device store as the ONLY persistence and never a server one', () => {
    // Owner decision D-08 (Option A): the only storage is the user's own
    // browser. There is still no server-side persistence and no network call
    // anywhere in the tool.
    const files = [
      'tool-039-liver-enzyme-tracker.tsx',
      'tool-039-liver-enzyme-tracker.genius.tsx',
      'tool-039-liver-enzyme-tracker.history.tsx',
    ];
    for (const file of files) {
      const source = readComponent(file);
      expect(source).not.toMatch(/import[^;]*from\s+['"][^'"]*supabase[^'"]*['"]/);
      expect(source).not.toMatch(/createClient\(/);
      expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest|XMLHttpRequest/);
      expect(source).not.toMatch(/app\/api\//);
    }

    // The one persistence import the tool is allowed to have.
    const component = readComponent('tool-039-liver-enzyme-tracker.tsx');
    expect(component).toMatch(/tool-039-liver-enzyme-tracker-history-store/);
  });

  it('routes every calculation through the R6 pipeline', () => {
    const component = readComponent('tool-039-liver-enzyme-tracker.tsx');
    const genius = readComponent('tool-039-liver-enzyme-tracker.genius.tsx');
    expect(component).toMatch(/runLiverEnzymeTracker/);
    expect(genius).toMatch(/runLiverEnzymeTracker/);
    // The engine module itself is never imported by the UI.
    expect(component).not.toMatch(/trackLiverEnzymes/);
    expect(genius).not.toMatch(/trackLiverEnzymes/);
  });

  it('keeps every empty or invalid value out of the calculation payload', () => {
    const component = readComponent('tool-039-liver-enzyme-tracker.tsx');
    expect(component).not.toMatch(/\?\? 0/);
    expect(component).not.toMatch(/value === '' \? 0/);
  });
});

describe('Tool 039 GENIUS-12 boxes and CORE-5', () => {
  it('renders all 12 ordered boxes with a source badge when the result is FULL', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    const boxes = document.querySelectorAll('[data-r6-box]');
    expect(boxes).toHaveLength(12);
    expect(Array.from(boxes).map((box) => box.getAttribute('data-r6-box'))).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    ]);
    for (const box of Array.from(boxes)) {
      expect(box.getAttribute('data-r6-box-source')).toBeTruthy();
    }
  });

  it('compact mode shows CORE-5 only and keeps C1 identical to the full page', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    const fullPrimary = document.querySelector('[data-r6-box="2"] [data-r6-core="c1"]')?.textContent ?? '';
    expect(fullPrimary.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Compact (5)' }));

    const boxes = document.querySelectorAll('[data-r6-box]');
    expect(boxes).toHaveLength(5);
    expect(Array.from(boxes).map((box) => box.getAttribute('data-r6-box'))).toEqual(['2', '3', '7', '9', '12']);

    const compactPrimary = document.querySelector('[data-r6-box="2"] [data-r6-core="c1"]')?.textContent ?? '';
    expect(compactPrimary).toBe(fullPrimary);

    // CORE-5 content is present in compact mode.
    expect(document.querySelector('[data-r6-core="c2"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-core="c3"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-core="c4"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-core="c5"]')).not.toBeNull();
  });

  it('C1 carries the unit, the reference range and an honest confidence statement', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    const primary = document.querySelector('[data-r6-box="2"]')?.textContent ?? '';
    expect(primary).toContain('112 U/L');
    expect(primary).toContain('Reference limit');
    expect(primary).toContain('56 U/L');
    expect(primary).toContain('not calibrated');
  });

  it('C2 states the formula, the assumptions and the uncertainty', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    const calculated = document.querySelector('[data-r6-box="3"]')?.textContent ?? '';
    expect(calculated).toContain('value ÷ reference upper limit');
    expect(calculated).toContain('No conversion is applied');
    expect(calculated).toContain('No calibrated confidence interval');
  });

  it('C3 raises a red flag and a referral for a critical result', async () => {
    renderTool();
    completeAllFields('300');
    await settle();

    const safety = document.querySelector('[data-r6-box="7"]')?.textContent ?? '';
    expect(document.querySelector('[data-r6-redflags="true"]')).not.toBeNull();
    expect(safety).toContain('Critical result');
    expect(safety).toContain('When to seek medical care');
    expect(safety).toContain('Yellowing of the skin or eyes');
  });

  it('C4 publishes sources with publisher, review date, evidence level and link', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    const evidence = document.querySelector('[data-r6-box="9"]')?.textContent ?? '';
    expect(evidence).toContain('U.S. National Library of Medicine');
    expect(evidence).toContain('E2');
    expect(evidence).toContain('2026-11-11');
    const links = document.querySelectorAll('[data-r6-box="9"] a[href^="https://"]');
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const link of Array.from(links)) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });

  it('C5 gives one next step, what not to do and when to see a doctor', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    const next = document.querySelector('[data-r6-box="12"]')?.textContent ?? '';
    expect(next).toContain('Next step');
    expect(next).toContain('What not to do');
    expect(next).toContain('When to see a doctor');
    // The rating half of box 12 is now a real, local-only control
    // (owner decision D-08, Option A) instead of a NOT_AVAILABLE notice.
    expect(document.querySelector('[data-r6-rating="not_available"]')).toBeNull();
    expect(document.querySelector('[data-r6-rating="local-device"]')).not.toBeNull();
  });

  it('keeps the history box visible with a real reason instead of hiding it', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    // The box is never hidden and it never claims to be NOT_APPLICABLE: it
    // explains the local-only storage and asks for the consent.
    const history = document.querySelector('[data-r6-box="11"]');
    expect(history).not.toBeNull();
    expect(history?.getAttribute('data-r6-box-source')).not.toBe('not_applicable');
    expect(history?.textContent ?? '').toMatch(/browser|device/i);
  });

  it('computes what-if scenarios and sensitivity through the same pipeline', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    const whatIf = document.querySelector('[data-r6-box="5"]')?.textContent ?? '';
    expect(whatIf).toContain('1× ULN');
    expect(whatIf).toContain('3× ULN');
    expect(whatIf).toContain('5× ULULN'.replace('ULULN', 'ULN'));
    // 112 U/L is 2.00× ULN, so 3× ULN is 168 U/L.
    expect(whatIf).toContain('168');

    const sensitivity = document.querySelector('[data-r6-box="6"]')?.textContent ?? '';
    expect(sensitivity).toContain('Marker value');
    expect(sensitivity).toContain('Oral steroids answer');
    expect(sensitivity).toContain('Alcohol intake');
  });

  it('offers a client-side CSV export and links the related tools', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument();
    const crossTool = document.querySelector('[data-r6-box="8"]')?.textContent ?? '';
    expect(crossTool).toContain('Bloodwork');
    expect(crossTool).toContain('Nothing is transferred automatically');
  });

  it('publishes the seven-part capability contract without claiming AI', async () => {
    renderTool();
    completeAllFields('112');
    await settle();

    const contract = document.querySelector('[data-r6-capability="tool-039"]')?.textContent ?? '';
    for (const part of ['CAN', 'CANNOT', 'SOURCES', 'WHY', 'COST', 'STOP', 'RESTORE']) {
      expect(contract).toContain(part);
    }
    expect(contract).toContain('does not use any AI model');
    expect(contract).toContain('Local computation only');
  });

  it('flags stale lab data instead of presenting it as current', async () => {
    renderTool();
    completeAllFields('112', '2020-01-01');
    await settle();

    const safety = document.querySelector('[data-r6-box="7"]')?.textContent ?? '';
    expect(safety).toContain('The newest reading is');
    expect(safety).toContain('Stale');
  });

  it('does not render the result boxes while the input is incomplete', () => {
    renderTool();
    addReading();

    expect(document.querySelector('[data-r6-genius="tool-039"]')).toBeNull();
  });
});
