import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { withToolPreferences } from './tool-preferences.test-utils';

const hoisted = vi.hoisted(() => ({
  runSpy: vi.fn(),
  actual: {
    fn: null as null | (typeof import('@/lib/tools/r6/tool-051-peptide-dosage-pipeline'))['runPeptideDose'],
  },
}));

vi.mock('@/lib/tools/r6/tool-051-peptide-dosage-pipeline', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/lib/tools/r6/tool-051-peptide-dosage-pipeline')
  >();
  hoisted.actual.fn = actual.runPeptideDose;
  hoisted.runSpy.mockImplementation(actual.runPeptideDose);
  return { ...actual, runPeptideDose: hoisted.runSpy };
});

import Tool051 from './tool-051-peptide-dosage-calculator';

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
  return render(withToolPreferences(<Tool051 />, locale, 'metric'));
}

function field(name: 'vialMg' | 'bacWaterMl' | 'desiredDoseMg'): HTMLInputElement {
  const element = document.querySelector(`[data-r6-field="${name}"]`);
  if (!(element instanceof HTMLInputElement)) throw new Error(`missing field ${name}`);
  return element;
}

function setField(name: 'vialMg' | 'bacWaterMl' | 'desiredDoseMg', value: string) {
  fireEvent.change(field(name), { target: { value } });
}

function fillFull(values: Partial<Record<'vialMg' | 'bacWaterMl' | 'desiredDoseMg', string>> = {}) {
  setField('vialMg', values.vialMg ?? '5');
  setField('bacWaterMl', values.bacWaterMl ?? '2');
  setField('desiredDoseMg', values.desiredDoseMg ?? '0.25');
}

async function waitForState(state: string) {
  await waitFor(() => expect(document.querySelector(`[data-r6-state="${state}"]`)).not.toBeNull());
}

function box(n: number): HTMLElement {
  const element = document.querySelector(`[data-r6-box="${n}"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`missing box ${n}`);
  return element;
}

describe('Tool 051 peptide dosage calculator — states and calculation', () => {
  it('starts EMPTY with no fabricated inputs or pipeline calls', () => {
    renderTool();
    expect(document.querySelector('[data-r6-state="EMPTY"]')?.textContent).toContain('Empty');
    expect(runSpy).not.toHaveBeenCalled();
    expect([field('vialMg').value, field('bacWaterMl').value, field('desiredDoseMg').value]).toEqual(['', '', '']);
    expect([field('vialMg'), field('bacWaterMl'), field('desiredDoseMg')].every((input) => input.getAttribute('aria-required') === 'true')).toBe(true);
  });

  it('remains PARTIAL until all three values are supplied', () => {
    renderTool();
    setField('vialMg', '5');
    setField('bacWaterMl', '2');
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('rejects out-of-range and non-numeric values without running the pipeline', () => {
    renderTool();
    fillFull({ vialMg: '100.1' });
    expect(document.querySelector('[data-r6-state="INVALID"]')).not.toBeNull();
    expect(field('vialMg').getAttribute('aria-invalid')).toBe('true');
    expect(field('vialMg').getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('outside the accepted range');
    expect(runSpy).not.toHaveBeenCalled();

    expect(runSpy).not.toHaveBeenCalled();
  });

  it('routes valid inputs through the guarded pipeline and displays deterministic results', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(runSpy).toHaveBeenCalled();
    expect(runSpy.mock.calls.some(([input]) => JSON.stringify(input) === JSON.stringify({
      vial_mg: 5,
      bac_water_ml: 2,
      desired_dose_mg: 0.25,
    }))).toBe(true);
    const summary = document.querySelector('[data-r6-summary="full"]');
    expect(summary?.textContent).toContain('2.5 mg/ml');
    expect(summary?.textContent).toContain('0.1 ml');
    expect(summary?.textContent).toContain('10 U');
    expect(summary?.textContent).toContain('20');
  });

  it('accepts the declared lower boundaries and reports a clamp warning without raw codes', async () => {
    renderTool();
    fillFull({ vialMg: '100', bacWaterMl: '0.1', desiredDoseMg: '0.01' });
    await waitForState('FULL');
    expect(document.querySelector('[data-r6-summary="full"]')?.textContent).toContain('2 U');
    expect(box(7).textContent).toContain('clamped to 2 units');
    expect(document.body.textContent).not.toContain('dose_below_syringe_resolution');
  });

  it('shows DEGRADED when the pipeline fails its output contract', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    runSpy.mockImplementationOnce(() => ({ ok: false, error: new Error('envelope guard failed') }));
    setField('desiredDoseMg', '0.3');
    await waitForState('DEGRADED');
    expect(document.body.textContent).toContain('could not produce a valid result');
  });
});

describe('Tool 051 peptide dosage calculator — GENIUS, safety and privacy', () => {
  it('renders the twelve boxes in the fixed order and preserves the CORE-5 selection', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(Array.from(document.querySelectorAll('[data-r6-box]')).map((element) => element.getAttribute('data-r6-box')))
      .toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
    const fullC1 = box(2).textContent;
    fireEvent.click(screen.getByRole('button', { name: 'Compact' }));
    await waitFor(() => expect(document.querySelectorAll('[data-r6-box]')).toHaveLength(5));
    expect(Array.from(document.querySelectorAll('[data-r6-box]')).map((element) => element.getAttribute('data-r6-box')))
      .toEqual(['2', '3', '7', '9', '12']);
    expect(box(2).textContent).toBe(fullC1);
  });

  it('keeps source and referral content unavailable pending approval', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(box(9).textContent).toMatch(/NOT_AVAILABLE — no approved source recorded/);
    expect(box(9).textContent).toMatch(/Pending medical review/);
    expect(box(9).querySelectorAll('a')).toHaveLength(0);
    expect(box(7).textContent).toMatch(/Referral wording is not available without specialist approval/);
    expect(box(12).textContent).toMatch(/Session-only rating — not saved/);
  });

  it('keeps cross-tool transfer manual and exposes no history persistence', async () => {
    renderTool();
    fillFull();
    await waitForState('FULL');
    expect(box(8).textContent).toMatch(/Manual re-entry only/);
    expect(box(8).textContent).toMatch(/No automatic data transfer/);
    expect(box(11).textContent).toMatch(/history requires the W18 storage decision/);
    const controls = within(box(12)).getAllByRole('button');
    fireEvent.click(controls[2]);
    expect(controls[2].getAttribute('aria-pressed')).toBe('true');
    expect(box(12).textContent).toMatch(/not saved/);
  });

  it('supports Arabic RTL and labels all fields and live state accessibly', async () => {
    renderTool('ar');
    const section = document.querySelector('[data-r6-tool="tool-051-peptide-dosage-calculator"]');
    expect(section?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { name: 'حاسبة جرعة الببتيدات' })).toBeInTheDocument();
    expect(document.querySelector('[data-r6-state]')?.getAttribute('aria-live')).toBe('polite');
    for (const input of [field('vialMg'), field('bacWaterMl'), field('desiredDoseMg')]) {
      expect(input.labels?.length ?? 0).toBeGreaterThan(0);
    }
    fillFull();
    await waitForState('FULL');
    expect(box(8).textContent).toContain('إعادة إدخال يدوية فقط');
  });

  it('does not add persistence, network, or unguarded engine calls to the UI', () => {
    const sources = [
      readFileSync(join(process.cwd(), 'components', 'tools', 'tool-051-peptide-dosage-calculator.tsx'), 'utf8'),
      readFileSync(join(process.cwd(), 'components', 'tools', 'tool-051-peptide-dosage-calculator.genius.tsx'), 'utf8'),
    ];
    for (const source of sources) {
      expect(source).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
      expect(source).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]|\bfetch\(|axios|XMLHttpRequest|localStorage|sessionStorage/);
      expect(source).not.toMatch(/import[^;]*from[^;]*engines\/tool-051/);
    }
    expect(sources[0]).toMatch(/runPeptideDose/);
  });
});
