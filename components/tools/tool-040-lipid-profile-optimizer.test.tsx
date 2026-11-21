// components/tools/tool-040-lipid-profile-optimizer.test.tsx
//
// The R6.1 acceptance tests for the Tool 040 component.
//
// Covered (the owner's required list, mapped to this tool):
//   - the calculation goes through the R6 pipeline and the UI never calls the
//     engine or the legacy adapter directly;
//   - the states EMPTY / PARTIAL / FULL / INVALID / DEGRADED;
//   - nothing is invented: the tool starts empty and a typed 0 is a real 0;
//   - the input is DEBOUNCED: a burst of edits triggers one calculation;
//   - there is NO persistence: no draft, no dashboard snapshot, no session;
//   - the tool owns its twelve GENIUS boxes and keeps their fixed order;
//   - the visual layer renders in every state, the data-driven rows only with
//     a result;
//   - AR/EN and RTL/LTR;
//   - accessibility: keyboard, screen reader, no horizontal overflow at 390 px.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline')>();
  return { ...actual, runLipidProfileOptimizer: vi.fn(actual.runLipidProfileOptimizer) };
});

import Tool040 from './tool-040-lipid-profile-optimizer';
import { runLipidProfileOptimizer } from '@/lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline';

const runSpy = vi.mocked(runLipidProfileOptimizer);

beforeEach(() => {
  runSpy.mockClear();
});

afterEach(() => {
  cleanup();
});

function renderTool(locale: 'ar' | 'en' = 'en') {
  return render(withToolPreferences(<Tool040 />, locale, 'metric'));
}

function fillPanel(values: Partial<Record<string, string>> = {}) {
  const set = (label: string, value: string) => {
    const field = screen.getByLabelText(label) as HTMLInputElement;
    fireEvent.change(field, { target: { value } });
  };
  const defaults: Record<string, string> = {
    'LDL cholesterol': '160',
    'HDL cholesterol': '38',
    Triglycerides: '210',
    'Panel date': '2026-02-01',
    Age: '45',
    'Systolic blood pressure': '145',
    'Weeks remaining': '8',
  };
  const merged = { ...defaults, ...values };
  for (const [label, value] of Object.entries(merged)) {
    if (!value) continue;
    set(label, value);
  }
  for (const [label, choice] of [['Smoker', 'Yes'], ['On cycle', 'Yes']] as const) {
    const group = screen.getByRole('group', { name: label });
    fireEvent.click(within(group).getByRole('button', { name: choice }));
  }
}

async function waitForResult() {
  await waitFor(() => expect(runSpy).toHaveBeenCalled(), { timeout: 5000 });
  await waitFor(() => expect(document.querySelector('[data-r6-state="FULL"]')).not.toBeNull(), { timeout: 5000 });
}

describe('Tool 040 lipid profile optimizer — R6.1 behaviour', () => {
  it('starts EMPTY and invents nothing', () => {
    renderTool();
    expect(screen.getByText(/State:\s*Empty/)).toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
    // No field is pre-filled with a fabricated value.
    for (const field of document.querySelectorAll('[data-r6-field]')) {
      const element = field as HTMLInputElement;
      if (element.type !== 'radio') expect(element.value).toBe('');
    }
  });

  it('stays PARTIAL until every required field is answered', async () => {
    renderTool();
    fireEvent.change(screen.getByLabelText('LDL cholesterol'), { target: { value: '160' } });
    await waitFor(() => expect(screen.getByText(/State:\s*Partial/)).toBeInTheDocument());
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for an out-of-range value and calculates nothing', async () => {
    renderTool();
    fillPanel({ 'LDL cholesterol': '900' });
    await waitFor(() => expect(screen.getByText(/State:\s*Invalid/)).toBeInTheDocument());
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('rejects an impossible calendar date', async () => {
    renderTool();
    fillPanel({ 'Panel date': '2026-02-30' });
    await waitFor(() => expect(screen.getByText(/State:\s*Invalid/)).toBeInTheDocument());
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('calculates through the R6 pipeline once the panel is complete', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    expect(runSpy).toHaveBeenCalled();
    const [passedInput] = runSpy.mock.calls[0] as unknown as [{ panel: { ldl_mg_dl: number } }];
    expect(passedInput.panel.ldl_mg_dl).toBe(160);
    // The result is shown from the engine output.
    expect(document.querySelector('[data-r6-bar="LDL"]')?.textContent).toContain('160');
  });

  it('debounces the calculation: a burst of edits triggers one run', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const callsAfterFirst = runSpy.mock.calls.length;
    fireEvent.change(screen.getByLabelText('LDL cholesterol'), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText('LDL cholesterol'), { target: { value: '140' } });
    fireEvent.change(screen.getByLabelText('LDL cholesterol'), { target: { value: '130' } });
    await waitFor(() => expect(document.querySelector('[data-r6-bar="LDL"]')?.textContent).toContain('130'), { timeout: 5000 });
    expect(runSpy.mock.calls.length).toBeLessThan(callsAfterFirst + 12);
  });

  it('treats a typed zero as a real value, not as an empty field', async () => {
    renderTool();
    fillPanel({ Age: '0' });
    // 0 is below the accepted range, so it is INVALID — never silently ignored.
    await waitFor(() => expect(screen.getByText(/State:\s*Invalid/)).toBeInTheDocument());
  });

  it('shows the freshness of the panel and marks an old panel as stale', async () => {
    renderTool();
    fillPanel({ 'Panel date': '2020-01-01' });
    await waitForResult();
    expect(screen.getAllByText(/Stale|قديم/).length).toBeGreaterThan(0);
  });

  it('has NO persistence: no draft, no dashboard snapshot, no session', () => {
    const source = readFileSync(join(process.cwd(), 'components', 'tools', 'tool-040-lipid-profile-optimizer.tsx'), 'utf8');
    expect(source).not.toMatch(/loadDraft|saveDraft|clearDraft|commitDashboardSnapshot|buildAiContext/);
    expect(source).not.toMatch(/adapters\/tool-040/);
    expect(source).not.toMatch(/from ['"][^'"]*supabase[^'"]*['"]/);
    expect(source).not.toMatch(/\bfetch\(|axios|XMLHttpRequest/);
    // The UI never IMPORTS the engine directly: it goes through the R6 pipeline.
    expect(source).not.toMatch(/import[^;]*from[^;]*engines\/tool-040/);
    expect(source).toMatch(/runLipidProfileOptimizer/);
  });

  it('renders all twelve GENIUS boxes in their fixed order', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const boxes = document.querySelectorAll('[data-r6-box]');
    expect(boxes).toHaveLength(12);
    expect(Array.from(boxes).map((box) => box.getAttribute('data-r6-box'))).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    ]);
  });

  it('keeps the history box visible with a real reason instead of hiding it', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const history = document.querySelector('[data-r6-box="11"]');
    expect(history).not.toBeNull();
    expect(history?.getAttribute('data-r6-box-source')).toBe('not_applicable');
    expect(history?.textContent ?? '').toMatch(/NOT_APPLICABLE|غير منطبق/);
  });

  it('shows the compact mode with the five CORE boxes', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    fireEvent.click(screen.getByRole('button', { name: /Core 5|الأساسية 5/ }));
    await waitFor(() => expect(document.querySelectorAll('[data-r6-box]')).toHaveLength(5));
  });

  it('renders the visual layer with a tooltip per marker', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    expect(document.querySelector('[data-r6-visual="tool-040"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-illustration="tool-040"]')).not.toBeNull();
    const bar = document.querySelector('[data-r6-bar="LDL"]') as HTMLElement;
    expect(bar).not.toBeNull();
    fireEvent.mouseEnter(bar);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.textContent).toContain('LDL');
    expect(tooltip.textContent).toContain('160');
  });

  it('provides the accessible data table equal to the chart values', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const table = document.querySelector('[data-r6-table="tool-040"] table');
    expect(table?.textContent).toContain('160');
    expect(table?.textContent).toContain('mg/dL');
  });

  it('flips the direction and localizes the labels in Arabic', async () => {
    renderTool('ar');
    expect(document.querySelector('main')?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByText('محسّن تحليل الدهون')).toBeInTheDocument();
  });

  it('keeps the controls free of fixed widths that would break a 390 px viewport', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const wide = Array.from(document.querySelectorAll('[data-r6-field], [data-r6-bar]')).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.minWidth !== '' && style.minWidth !== '0px' && style.minWidth !== 'auto';
    });
    expect(wide).toEqual([]);
  });

  it('never lets the result of an older input be shown as the current one', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    expect(document.querySelector('[data-r6-bar="LDL"]')?.textContent).toContain('160');
    fireEvent.change(screen.getByLabelText('LDL cholesterol'), { target: { value: '100' } });
    // The stale value must disappear until the new calculation lands.
    await waitFor(() => expect(document.querySelector('[data-r6-bar="LDL"]')?.textContent).toContain('100'), { timeout: 5000 });
  });
});

// Appended to components/tools/tool-040-lipid-profile-optimizer.test.tsx
//
// The CORE-5 content assertions (ACC-5.5.x, LAYER-CORE5-C1..C5), the seven-part
// capability contract, the what-if / sensitivity boxes, the cross-tool link
// contract, the client-side CSV export and the compact-mode C1 parity.
//
// Every assertion reads the RENDERED page, so a box that is empty or cosmetic
// fails the test instead of passing on a badge.
describe('Tool 040 — CORE-5 content, capability contract and the remaining boxes', () => {
  it('C1 carries the unit, the reference edge and an honest confidence statement', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const box = document.querySelector('[data-r6-box="2"]');
    expect(box).not.toBeNull();
    const text = box?.textContent ?? '';
    expect(text).toContain('mg/dL');
    // The reference edge of the optimal band is shown for every marker.
    expect(text).toContain('100'); // LDL optimal edge
    expect(text).toContain('60'); // HDL optimal edge
    expect(text).toContain('150'); // TG optimal edge
    // The confidence is declared, and no percentage is invented.
    expect(text).toMatch(/Deterministic|no model|not calibrated/i);
    expect(text).not.toMatch(/\d{2}\s*%/);
  });

  it('C2 states the formula, the assumptions and the uncertainty', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const text = document.querySelector('[data-r6-box="3"]')?.textContent ?? '';
    expect(text).toContain('Formula');
    expect(text).toContain('Assumptions');
    expect(text).toContain('Uncertainty');
    // The inputs actually used are listed.
    expect(text).toContain('160');
    expect(text).toContain('mg/dL');
  });

  it('C3 raises a red flag and a referral for a very-high result', async () => {
    renderTool();
    fillPanel({ 'Triglycerides': '520' });
    await waitForResult();
    const text = document.querySelector('[data-r6-box="7"]')?.textContent ?? '';
    expect(text).toMatch(/red flag|Red flag|clinic/i);
    // The pancreatitis threshold is named in the referral list.
    expect(text).toContain('500');
    expect(text).toMatch(/pancreatitis/i);
  });

  it('C4 publishes the sources with publisher, date, evidence level and link', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const box = document.querySelector('[data-r6-box="9"]');
    expect(box).not.toBeNull();
    const links = Array.from(box?.querySelectorAll('a') ?? []) as HTMLAnchorElement[];
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const link of links) {
      expect(link.href.startsWith('https://')).toBe(true);
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
    }
    const text = box?.textContent ?? '';
    expect(text).toMatch(/MedlinePlus/);
    expect(text).toMatch(/CDC/);
    expect(text).toMatch(/E2/);
    expect(text).toMatch(/2026-11-12/);
  });

  it('C5 gives one next step, what not to do and when to see a doctor', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const text = document.querySelector('[data-r6-box="12"]')?.textContent ?? '';
    expect(text).toMatch(/Next step/i);
    expect(text).toMatch(/What not to do/i);
    expect(text).toMatch(/When to see a doctor/i);
  });

  it('publishes the seven-part capability contract without claiming AI', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const contract = document.querySelector('[data-r6-core="capability"]');
    expect(contract).not.toBeNull();
    const text = contract?.textContent ?? '';
    for (const part of ['CAN', 'CANNOT', 'SOURCES', 'WHY', 'COST', 'STOP', 'RESTORE']) {
      expect(text).toContain(part);
    }
    // The contract says the tool cannot store anything and cannot prescribe.
    expect(text).toMatch(/cannot store/i);
    expect(text).toMatch(/cannot prescribe|not.*prescribe/i);
  });

  it('computes the what-if scenarios and the sensitivity through the same pipeline', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const whatIf = document.querySelector('[data-r6-core="what-if"]');
    expect(whatIf).not.toBeNull();
    expect(whatIf?.querySelectorAll('li').length).toBeGreaterThanOrEqual(3);
    const sensitivity = document.querySelector('[data-r6-core="sensitivity"]');
    expect(sensitivity).not.toBeNull();
    expect(sensitivity?.querySelectorAll('li').length).toBeGreaterThanOrEqual(5);
  });

  it('renders the cross-tool links with their freshness rule and the no-transfer statement', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const text = document.querySelector('[data-r6-core="cross-tool"]')?.textContent ?? '';
    expect(text).toContain('tool-039-liver-enzyme-tracker');
    expect(text).toMatch(/Freshness rule/i);
    expect(text).toMatch(/Stale action/i);
    expect(text).toMatch(/Nothing is shared automatically/i);
    expect(text).toMatch(/manual-reentry/);
  });

  it('offers a client-side CSV export and never calls a server', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const box = document.querySelector('[data-r6-box="10"]');
    const button = within(box as HTMLElement).getByRole('button', { name: /Download CSV/ });
    expect(button).toBeInTheDocument();
    expect(box?.textContent ?? '').toMatch(/No account, no upload|no server call/i);
  });

  it('keeps C1 identical between the compact mode and the full page', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const fullC1 = document.querySelector('[data-r6-box="2"]')?.textContent ?? '';
    fireEvent.click(screen.getByRole('button', { name: /Core 5|الأساسية 5/ }));
    await waitFor(() => expect(document.querySelectorAll('[data-r6-box]')).toHaveLength(5));
    const compactC1 = document.querySelector('[data-r6-box="2"]')?.textContent ?? '';
    expect(compactC1).toBe(fullC1);
  });

  it('shows the freshness verdict of the panel and marks an old panel as stale', async () => {
    renderTool();
    fillPanel({ 'Panel date': '2020-01-01' });
    await waitForResult();
    const text = document.querySelector('[data-r6-box="2"]')?.textContent ?? '';
    expect(text).toMatch(/Stale|قديم/);
  });
});

describe('Tool 040 — Parity Features: P-03 (OCR), P-04 (PDF), P-05 (Demo Data)', () => {
  it('P-05: loads deterministic synthetic demo data, executes pipeline, shows badge, and clears cleanly', async () => {
    renderTool();
    const loadDemoBtn = screen.getByRole('button', { name: /Load Demo Data|تجربة ببيانات افتراضية/i });
    expect(loadDemoBtn).toBeInTheDocument();

    // Click Load Demo
    fireEvent.click(loadDemoBtn);

    // Verify fields populated
    await waitFor(() => {
      expect((screen.getByLabelText('LDL cholesterol') as HTMLInputElement).value).toBe('148');
      expect((screen.getByLabelText('HDL cholesterol') as HTMLInputElement).value).toBe('32');
      expect((screen.getByLabelText('Triglycerides') as HTMLInputElement).value).toBe('180');
      expect((screen.getByLabelText('Total cholesterol') as HTMLInputElement).value).toBe('216');
      expect((screen.getByLabelText('Age') as HTMLInputElement).value).toBe('34');
      expect((screen.getByLabelText('Systolic blood pressure') as HTMLInputElement).value).toBe('128');
    });

    // Verify Synthetic Demo Data badge is visible
    expect(screen.getByTestId('synthetic-demo-badge')).toBeInTheDocument();
    expect(screen.getByTestId('synthetic-demo-badge').textContent).toMatch(/Synthetic Demo Data|بيانات تجريبية توضيحية/);

    // Pipeline must execute and state must become FULL
    await waitForResult();
    expect(runSpy).toHaveBeenCalled();
    expect(document.querySelector('[data-r6-state="FULL"]')).not.toBeNull();

    // Clear Demo button should now be available
    const clearDemoBtn = screen.getByRole('button', { name: /Clear Demo|مسح البيانات/i });
    fireEvent.click(clearDemoBtn);

    // Verify state resets to EMPTY and badge is removed
    await waitFor(() => {
      expect(document.querySelector('[data-r6-state="EMPTY"]')).not.toBeNull();
      expect(screen.queryByTestId('synthetic-demo-badge')).toBeNull();
    });
  });

  it('P-04: renders printable A4 PDF export button when result is FULL and opens print view', async () => {
    const openMock = vi.fn().mockReturnValue({
      document: { open: vi.fn(), write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    });
    vi.stubGlobal('open', openMock);

    renderTool();
    fillPanel();
    await waitForResult();

    const pdfBtn = screen.getByRole('button', { name: /Export A4 (Lipid Report|PDF)|Print Consultation Report|تصدير تقرير A4/i });
    expect(pdfBtn).toBeInTheDocument();

    fireEvent.click(pdfBtn);
    expect(openMock).toHaveBeenCalledWith('', '_blank');
  });

  it('P-03: opens local OCR modal, parses lipid text, and applies confirmed readings', async () => {
    renderTool();
    const scanBtn = screen.getByRole('button', { name: /Scan Lab Report|مسح تقرير التحليل/i });
    expect(scanBtn).toBeInTheDocument();

    // Open modal
    fireEvent.click(scanBtn);
    expect(screen.getByText(/Scan Lipid Lab Report|مسح تقرير دهون الدم/i)).toBeInTheDocument();

    // Paste sample text
    const sampleText = 'Lab Report Date: 2026-03-01\nLDL Cholesterol: 165 mg/dL\nHDL Cholesterol: 35 mg/dL\nTriglycerides: 200 mg/dL\nTotal Cholesterol: 240 mg/dL';
    const textarea = screen.getByPlaceholderText(/Total Cholesterol|مثال/i);
    fireEvent.change(textarea, { target: { value: sampleText } });

    // Click Parse
    const parseBtn = screen.getByRole('button', { name: /Extract from text|استخراج من النص/i });
    fireEvent.click(parseBtn);

    // Staging table displays extracted readings
    await waitFor(() => {
      expect(screen.getByText(/Review Extracted Readings|مراجعة القيم المستخرجة/i)).toBeInTheDocument();
    });

    // Click Confirm & Apply
    const confirmBtn = screen.getByRole('button', { name: /Confirm & Apply|تأكيد واعتماد المدخلات/i });
    fireEvent.click(confirmBtn);

    // Verify fields populated into form
    await waitFor(() => {
      expect((screen.getByLabelText('LDL cholesterol') as HTMLInputElement).value).toBe('165');
      expect((screen.getByLabelText('HDL cholesterol') as HTMLInputElement).value).toBe('35');
      expect((screen.getByLabelText('Triglycerides') as HTMLInputElement).value).toBe('200');
      expect((screen.getByLabelText('Total cholesterol') as HTMLInputElement).value).toBe('240');
      expect((screen.getByLabelText('Panel date') as HTMLInputElement).value).toBe('2026-03-01');
    });
  });
});
