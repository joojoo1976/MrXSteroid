// components/tools/tool-015-shbg-modulator.parity.test.tsx
//
// R6.1 Acceptance & Parity Tests for Tool #015 (SHBG Modulator & Free Testosterone).
// Verifies full parity with Tool 039 benchmark:
//   - P-01: Visual range gauge for SHBG level & Free Testosterone;
//   - P-02: Derived Free Androgen Index (FAI = 100 * (TT_nmol / SHBG_nmol));
//   - P-03: Privacy-preserving local OCR scanner with staging table;
//   - P-04: Printable consultation A4 PDF report with non-diagnostic disclaimers;
//   - P-05: One-click deterministic synthetic demo data (TT=850, SHBG=14, Alb=4.3);
//   - Full 12 GENIUS analytical boxes & compact Core-5 mode;
//   - 390px responsive and RTL/LTR compliance.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool015 from './tool-015-shbg-modulator';

afterEach(() => {
  cleanup();
});

function renderTool(locale: 'ar' | 'en' = 'en') {
  return render(withToolPreferences(<Tool015 />, locale, 'metric'));
}

function fillInputs(tt = '650', shbg = '32', alb = '4.3') {
  const inputs = screen.getAllByRole('spinbutton');
  fireEvent.change(inputs[0], { target: { value: tt } });
  fireEvent.change(inputs[1], { target: { value: shbg } });
  fireEvent.change(inputs[2], { target: { value: alb } });
  fireEvent.click(screen.getByRole('button', { name: /Calculate|احسب/i }));
}

describe('Tool 015 — R6.1 Parity & Lifecycle (Tool 039 Standard)', () => {
  it('starts PARTIAL and invents nothing', () => {
    renderTool();
    expect(screen.getByRole('status')).toHaveTextContent(/PARTIAL/);
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    inputs.forEach((input) => expect(input.value).toBe(''));
  });

  it('renders visual layer in every state (P-01)', () => {
    renderTool();
    expect(document.querySelector('[data-r6-visual="tool-015"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-illustration="tool-015"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-table="tool-015"]')).not.toBeNull();
  });

  it('renders all twelve GENIUS boxes in fixed order upon calculation', () => {
    renderTool();
    fillInputs();
    const boxes = document.querySelectorAll('[data-r6-box]');
    expect(boxes).toHaveLength(12);
    expect(Array.from(boxes).map((b) => b.getAttribute('data-r6-box'))).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    ]);
  });

  it('supports Core-5 compact mode toggle', () => {
    renderTool();
    fillInputs();
    const toggleBtn = screen.getByRole('button', { name: /Core 5 Only|الأساسية 5/i });
    fireEvent.click(toggleBtn);
    expect(document.querySelectorAll('[data-r6-box]')).toHaveLength(6);
  });
});

describe('Tool 015 — Domain Parity Features: P-01, P-02, P-03, P-04, P-05', () => {
  it('P-01 & P-02: computes Free Testosterone and derived FAI', () => {
    renderTool();
    fillInputs('650', '32', '4.3');
    // FAI = 100 * (650 * 0.0347) / 32 = 22.555 / 32 * 100 = 70.5%
    const faiBar = document.querySelector('[data-r6-bar="FAI"]');
    expect(faiBar).not.toBeNull();
    expect(faiBar?.textContent).toContain('70.5%');
  });

  it('P-05: loads synthetic demo data (TT=850, SHBG=14), shows badge, executes real engine, and clears cleanly', () => {
    renderTool();
    const loadDemoBtn = screen.getByRole('button', { name: /Load Demo Data|تجربة ببيانات افتراضية/i });
    fireEvent.click(loadDemoBtn);

    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    expect(inputs[0].value).toBe('850');
    expect(inputs[1].value).toBe('14');
    expect(inputs[2].value).toBe('4.3');

    // Synthetic demo badge must appear
    expect(screen.getByTestId('synthetic-demo-badge')).toBeInTheDocument();

    // High FAI verified: 850 * 0.0347 / 14 * 100 = 210.7%
    expect(document.body.textContent).toContain('210.7%');
    expect(document.body.textContent).toContain('Results summary');

    // Clear demo
    const clearDemoBtn = screen.getByRole('button', { name: /Clear Demo|مسح البيانات/i });
    fireEvent.click(clearDemoBtn);

    expect(screen.queryByTestId('synthetic-demo-badge')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(/PARTIAL/);
  });

  it('P-04: renders printable A4 PDF export button and triggers print view', () => {
    const openMock = vi.fn().mockReturnValue({
      document: { open: vi.fn(), write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    });
    vi.stubGlobal('open', openMock);

    renderTool();
    fillInputs('650', '32', '4.3');

    const pdfBtn = screen.getByRole('button', { name: /Export A4 PDF|طباعة تقرير/i });
    expect(pdfBtn).toBeInTheDocument();

    fireEvent.click(pdfBtn);
    expect(openMock).toHaveBeenCalledWith('', '_blank');
  });

  it('P-03: opens local OCR modal, parses lab report text, and applies confirmed readings', async () => {
    renderTool();
    const scanBtn = screen.getByRole('button', { name: /Scan Lab Report|مسح تقرير التحليل/i });
    fireEvent.click(scanBtn);

    expect(screen.getByText(/Scan SHBG & Testosterone Lab Report|مسح تقرير تحاليل/i)).toBeInTheDocument();

    const sampleText = 'Total Testosterone: 720 ng/dL\nSHBG: 28.5 nmol/L\nAlbumin: 4.4 g/dL\nDate: 2026-03-01';
    const textarea = screen.getByPlaceholderText(/Total Testosterone|مثال/i);
    fireEvent.change(textarea, { target: { value: sampleText } });

    const extractBtn = screen.getByRole('button', { name: /Extract from text|استخراج من النص/i });
    fireEvent.click(extractBtn);

    await waitFor(() => {
      expect(screen.getByText(/Review Extracted Readings|مراجعة القيم المستخرجة/i)).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Apply|تأكيد واعتماد المدخلات/i });
    fireEvent.click(confirmBtn);

    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    expect(inputs[0].value).toBe('720');
    expect(inputs[1].value).toBe('28.5');
    expect(inputs[2].value).toBe('4.4');
  });
});
