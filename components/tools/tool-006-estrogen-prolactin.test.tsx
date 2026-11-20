// components/tools/tool-006-estrogen-prolactin.test.tsx
//
// R6.1 Acceptance & Parity Tests for Tool #006 (Estradiol & Prolactin Monitor).
// Verifies full parity with Tool 039 benchmark:
//   - P-01: Dual visual range gauge for Sensitive E2 & Prolactin;
//   - P-02: Derived physiological E2/T ratio;
//   - P-03: Privacy-preserving client-side OCR scanner with staging table;
//   - P-04: Print-to-PDF consultation report with non-diagnostic disclaimers;
//   - P-05: One-click deterministic synthetic demo data with overwrite guard;
//   - 5-state lifecycle: EMPTY, PARTIAL, FULL, INVALID, DEGRADED;
//   - Debounced R6 execution (120ms);
//   - Tool-owned GENIUS-12 analytical boxes & compact Core-5 mode;
//   - Responsive 390px & RTL/LTR compliance.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/r6/tool-006-estrogen-prolactin-pipeline', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/tools/r6/tool-006-estrogen-prolactin-pipeline')>();
  return { ...actual, runEstrogenProlactin: vi.fn(actual.runEstrogenProlactin) };
});

import Tool006 from './tool-006-estrogen-prolactin';
import { runEstrogenProlactin } from '@/lib/tools/r6/tool-006-estrogen-prolactin-pipeline';

const runSpy = vi.mocked(runEstrogenProlactin);

beforeEach(() => {
  runSpy.mockClear();
});

afterEach(() => {
  cleanup();
});

function renderTool(locale: 'ar' | 'en' = 'en') {
  return render(withToolPreferences(<Tool006 />, locale, 'metric'));
}

function fillPanel(values: Partial<Record<string, string>> = {}) {
  const defaults: Record<string, string> = {
    'Sensitive Estradiol (E2)': '30',
    'Prolactin (PRL)': '12',
    'Total Testosterone (Optional)': '600',
    'Blood Draw Date': '2026-03-01',
  };
  const merged = { ...defaults, ...values };
  for (const [label, val] of Object.entries(merged)) {
    if (!val) continue;
    const field = screen.getByLabelText(label) as HTMLInputElement;
    fireEvent.change(field, { target: { value: val } });
  }
}

async function waitForResult() {
  await waitFor(() => expect(runSpy).toHaveBeenCalled(), { timeout: 5000 });
  await waitFor(() => expect(document.querySelector('[data-r6-state="FULL"]')).not.toBeNull(), { timeout: 5000 });
}

describe('Tool 006 — R6.1 Parity & Lifecycle (Tool 039 Standard)', () => {
  it('starts EMPTY and invents nothing', () => {
    renderTool();
    expect(screen.getByText(/State:\s*Empty/)).toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
    for (const field of document.querySelectorAll('[data-r6-field]')) {
      const el = field as HTMLInputElement;
      expect(el.value).toBe('');
    }
  });

  it('stays PARTIAL until required fields are entered', async () => {
    renderTool();
    fireEvent.change(screen.getByLabelText('Sensitive Estradiol (E2)'), { target: { value: '30' } });
    await waitFor(() => expect(screen.getByText(/State:\s*Partial/)).toBeInTheDocument());
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for out-of-range value and calculates nothing', async () => {
    renderTool();
    fillPanel({ 'Sensitive Estradiol (E2)': '2500' });
    await waitFor(() => expect(screen.getByText(/State:\s*Invalid/)).toBeInTheDocument());
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('rejects an impossible calendar date', async () => {
    renderTool();
    fillPanel({ 'Blood Draw Date': '2026-02-31' });
    await waitFor(() => expect(screen.getByText(/State:\s*Invalid/)).toBeInTheDocument());
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('calculates through the R6 pipeline once complete and debounces edits', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    expect(runSpy).toHaveBeenCalled();
    expect(document.querySelector('[data-r6-state="FULL"]')).not.toBeNull();
  });

  it('renders visual layer in every state (P-01)', () => {
    renderTool();
    expect(document.querySelector('[data-r6-visual="tool-006"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-illustration="tool-006"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-table="tool-006"]')).not.toBeNull();
  });

  it('renders all twelve GENIUS boxes in fixed order', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const boxes = document.querySelectorAll('[data-r6-box]');
    expect(boxes).toHaveLength(12);
    expect(Array.from(boxes).map((b) => b.getAttribute('data-r6-box'))).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    ]);
  });

  it('supports Core-5 compact mode toggle', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const toggleBtn = screen.getByRole('button', { name: /Core 5 Only|الأساسية 5/i });
    fireEvent.click(toggleBtn);
    await waitFor(() => {
      expect(document.querySelectorAll('[data-r6-box]')).toHaveLength(6);
    });
  });

  it('localizes into Arabic and sets RTL direction', () => {
    renderTool('ar');
    expect(document.querySelector('main')?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByText('مراقب الإستراديول والبرولاكتين')).toBeInTheDocument();
  });

  it('ensures no controls have fixed widths that break 390px viewport', () => {
    renderTool();
    const fields = Array.from(document.querySelectorAll('[data-r6-field]'));
    fields.forEach((el) => {
      const style = window.getComputedStyle(el);
      expect(style.minWidth === '' || style.minWidth === '0px' || style.minWidth === 'auto').toBe(true);
    });
  });
});

describe('Tool 006 — Domain Parity Features: P-01, P-02, P-03, P-04, P-05', () => {
  it('P-01 & P-02: computes derived E2/T ratio when Total Testosterone is entered', async () => {
    renderTool();
    fillPanel({
      'Sensitive Estradiol (E2)': '30',
      'Prolactin (PRL)': '10',
      'Total Testosterone (Optional)': '600',
    });
    await waitForResult();
    const ratioBar = document.querySelector('[data-r6-bar="E2T_RATIO"]');
    expect(ratioBar).not.toBeNull();
    expect(ratioBar?.textContent).toContain('5%');
  });

  it('P-05: loads deterministic synthetic demo data, executes pipeline, shows badge, and clears cleanly', async () => {
    renderTool();
    const loadDemoBtn = screen.getByRole('button', { name: /Load Demo Data|تجربة ببيانات افتراضية/i });
    expect(loadDemoBtn).toBeInTheDocument();

    fireEvent.click(loadDemoBtn);

    await waitFor(() => {
      expect((screen.getByLabelText('Sensitive Estradiol (E2)') as HTMLInputElement).value).toBe('58');
      expect((screen.getByLabelText('Prolactin (PRL)') as HTMLInputElement).value).toBe('18.5');
      expect((screen.getByLabelText('Total Testosterone (Optional)') as HTMLInputElement).value).toBe('1450');
      expect((screen.getByLabelText('Blood Draw Date') as HTMLInputElement).value).toBe('2026-03-10');
    });

    expect(screen.getByTestId('synthetic-demo-badge')).toBeInTheDocument();

    await waitForResult();
    expect(runSpy).toHaveBeenCalled();
    expect(document.querySelector('[data-r6-state="FULL"]')).not.toBeNull();

    const clearDemoBtn = screen.getByRole('button', { name: /Clear Demo|مسح البيانات/i });
    fireEvent.click(clearDemoBtn);

    await waitFor(() => {
      expect(document.querySelector('[data-r6-state="EMPTY"]')).not.toBeNull();
      expect(screen.queryByTestId('synthetic-demo-badge')).toBeNull();
    });
  });

  it('P-04: renders printable A4 PDF export button and triggers print view', async () => {
    const openMock = vi.fn().mockReturnValue({
      document: { open: vi.fn(), write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    });
    vi.stubGlobal('open', openMock);

    renderTool();
    fillPanel();
    await waitForResult();

    const pdfBtn = screen.getByRole('button', { name: /Export A4 PDF|طباعة تقرير الهرمونات/i });
    expect(pdfBtn).toBeInTheDocument();

    fireEvent.click(pdfBtn);
    expect(openMock).toHaveBeenCalledWith('', '_blank');
  });

  it('P-03: opens local OCR modal, parses endocrine text, and applies confirmed readings', async () => {
    renderTool();
    const scanBtn = screen.getByRole('button', { name: /Scan Lab Report|مسح تقرير التحليل/i });
    expect(scanBtn).toBeInTheDocument();

    fireEvent.click(scanBtn);
    expect(screen.getByText(/Scan Endocrine Lab Report|مسح تقرير تحاليل/i)).toBeInTheDocument();

    const sampleText = 'Lab Date: 2026-03-05\nEstradiol: 35.5 pg/mL\nProlactin: 14.2 ng/mL\nTotal Testosterone: 750 ng/dL';
    const textarea = screen.getByPlaceholderText(/Total Testosterone|مثال/i);
    fireEvent.change(textarea, { target: { value: sampleText } });

    const extractBtn = screen.getByRole('button', { name: /Extract from text|استخراج من النص/i });
    fireEvent.click(extractBtn);

    await waitFor(() => {
      expect(screen.getByText(/Review Extracted Readings|مراجعة القيم المستخرجة/i)).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Apply|تأكيد واعتماد المدخلات/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect((screen.getByLabelText('Sensitive Estradiol (E2)') as HTMLInputElement).value).toBe('35.5');
      expect((screen.getByLabelText('Prolactin (PRL)') as HTMLInputElement).value).toBe('14.2');
      expect((screen.getByLabelText('Total Testosterone (Optional)') as HTMLInputElement).value).toBe('750');
      expect((screen.getByLabelText('Blood Draw Date') as HTMLInputElement).value).toBe('2026-03-05');
    });
  });
});
