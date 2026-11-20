// components/tools/tool-023-trt-optimization.test.tsx
// R6.1 Parity Tests for Tool #023 (TRT Optimization Engine)
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/r6/tool-023-trt-optimization-pipeline', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/tools/r6/tool-023-trt-optimization-pipeline')>();
  return { ...actual, runTrtOptimization: vi.fn(actual.runTrtOptimization) };
});

import Tool023 from './tool-023-trt-optimization';
import { runTrtOptimization } from '@/lib/tools/r6/tool-023-trt-optimization-pipeline';

const runSpy = vi.mocked(runTrtOptimization);

beforeEach(() => {
  runSpy.mockClear();
  vi.stubGlobal('open', vi.fn(() => ({
    document: { open: vi.fn(), write: vi.fn(), close: vi.fn() },
    print: vi.fn(),
    focus: vi.fn(),
  })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderTool(locale: 'ar' | 'en' = 'en') {
  return render(withToolPreferences(<Tool023 />, locale, 'metric'));
}

function fillPanel(values: Partial<Record<string, string>> = {}) {
  const defaults: Record<string, string> = {
    'Age (years)': '32',
    'Trough Testosterone (ng/dL)': '780',
    'Symptoms': 'none',
    'TRT Duration (months)': '12',
    'Administration Route': 'intramuscular',
  };
  const merged = { ...defaults, ...values };
  for (const [label, val] of Object.entries(merged)) {
    if (!val) continue;
    const field = screen.getByLabelText(label) as HTMLElement;
    fireEvent.change(field, { target: { value: val } });
  }
}

async function waitForResult() {
  await waitFor(() => expect(runSpy).toHaveBeenCalled(), { timeout: 5000 });
  await waitFor(() => expect(document.querySelector('[data-r6-state="FULL"]')).not.toBeNull(), { timeout: 5000 });
}

describe('Tool 023 — R6.1 Parity (Tool 039 Standard)', () => {
  // P-00: 5-state lifecycle
  it('starts EMPTY', () => {
    renderTool();
    expect(screen.getByText(/State:\s*Empty/)).toBeInTheDocument();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('stays PARTIAL until required fields are entered', async () => {
    renderTool();
    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '32' } });
    await waitFor(() => expect(screen.getByText(/State:\s*Partial/)).toBeInTheDocument());
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reports INVALID for out-of-range value', async () => {
    renderTool();
    fillPanel({ 'Age (years)': '32', 'Trough Testosterone (ng/dL)': '9999' });
    await waitFor(() => expect(screen.getByText(/State:\s*Invalid/)).toBeInTheDocument());
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('reaches FULL state and calls engine', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    expect(runSpy).toHaveBeenCalledOnce();
  });

  // P-01: Visual gauge
  it('renders visual gauge layer with data-r6-visual', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    expect(document.querySelector('[data-r6-visual="tool-023"]')).not.toBeNull();
  });

  it('renders illustration with data-r6-illustration', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    expect(document.querySelector('[data-r6-illustration="tool-023"]')).not.toBeNull();
  });

  it('renders results table with data-r6-table', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    expect(document.querySelector('[data-r6-table="tool-023"]')).not.toBeNull();
  });

  // P-03: OCR
  it('renders OCR scan button', () => {
    renderTool();
    expect(screen.getByRole('button', { name: /scan lab report/i })).toBeInTheDocument();
  });

  it('opens OCR modal on scan button click', async () => {
    renderTool();
    fireEvent.click(screen.getByRole('button', { name: /scan lab report/i }));
    await waitFor(() => expect(screen.getByPlaceholderText(/paste lab report/i)).toBeInTheDocument());
  });

  // P-04: PDF
  it('renders Export A4 PDF button', () => {
    renderTool();
    expect(screen.getByRole('button', { name: /Export A4 PDF/i })).toBeInTheDocument();
  });

  it('calls window.open on PDF export', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    fireEvent.click(screen.getByRole('button', { name: /Export A4 PDF/i }));
    expect(window.open).toHaveBeenCalledWith('', '_blank');
  });

  // P-05: Demo data
  it('renders Load Demo button', () => {
    renderTool();
    expect(screen.getByRole('button', { name: /load demo/i })).toBeInTheDocument();
  });

  it('loads demo data and shows synthetic badge', async () => {
    renderTool();
    fireEvent.click(screen.getByRole('button', { name: /load demo/i }));
    await waitFor(() => expect(screen.getByTestId('synthetic-demo-badge')).toBeInTheDocument());
  });

  it('demo data triggers engine and reaches FULL state', async () => {
    renderTool();
    fireEvent.click(screen.getByRole('button', { name: /load demo/i }));
    await waitForResult();
    expect(runSpy).toHaveBeenCalledOnce();
  });

  it('clears demo data on Clear button click', async () => {
    renderTool();
    fireEvent.click(screen.getByRole('button', { name: /load demo/i }));
    await waitFor(() => expect(screen.getByTestId('synthetic-demo-badge')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    await waitFor(() => expect(document.querySelector('[data-testid="synthetic-demo-badge"]')).toBeNull());
    await waitFor(() => expect(screen.getByText(/State:\s*Empty/)).toBeInTheDocument());
  });

  // P-02: Derived ratio / recommendations
  it('shows recommended dose after calculation', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    expect(document.querySelector('[data-r6-state="FULL"]')).not.toBeNull();
  });

  // GENIUS-12
  it('renders 12 GENIUS analytical boxes', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const boxes = document.querySelectorAll('[data-r6-box]');
    expect(boxes.length).toBe(12);
  });

  it('box 11 has NOT_APPLICABLE source', async () => {
    renderTool();
    fillPanel();
    await waitForResult();
    const box11 = document.querySelector('[data-r6-box="11"]');
    expect(box11).not.toBeNull();
    expect(box11!.getAttribute('data-r6-box-source')).toBe('not_applicable');
    expect(box11!.textContent).toMatch(/NOT_APPLICABLE/);
  });
});
