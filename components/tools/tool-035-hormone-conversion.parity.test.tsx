// components/tools/tool-035-hormone-conversion.parity.test.tsx
// R6.1 Parity & Benchmark Tests for Tool #035 (Hormone Conversion)
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool035 from './tool-035-hormone-conversion';

beforeEach(() => {
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

function renderTool(language: Language = Language.EN, unitSystem: 'metric' | 'imperial' = 'metric') {
  return render(
    <PreferencesContext.Provider value={{ language, unitSystem, isRTL: language === Language.AR } as PreferencesContextProps}>
      <Tool035 />
    </PreferencesContext.Provider>,
  );
}

describe('Tool 035 — R6.1 Parity (Tool 039 Standard)', () => {
  it('starts EMPTY lifecycle state', () => {
    renderTool();
    expect(document.querySelector('[data-r6-state="EMPTY"]')).not.toBeNull();
  });

  it('transitions to PARTIAL and then FULL lifecycle state', async () => {
    renderTool();
    fireEvent.change(screen.getByLabelText(/Lab result value/i), { target: { value: '900' } });
    expect(document.querySelector('[data-r6-state="PARTIAL"]')).not.toBeNull();

    fireEvent.change(screen.getByLabelText(/Result date/i), { target: { value: '2026-03-10' } });
    fireEvent.change(screen.getByLabelText(/Lab\/report source/i), { target: { value: 'Quest Diagnostics' } });
    expect(document.querySelector('[data-r6-state="FULL"]')).not.toBeNull();
  });

  // P-01: Visual layer
  it('renders visual layer with data-r6-visual', () => {
    renderTool();
    expect(document.querySelector('[data-r6-visual="tool-035"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-illustration="tool-035"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-table="tool-035"]')).not.toBeNull();
  });

  // P-03: OCR scanner
  it('renders scan button and opens OCR modal', async () => {
    renderTool();
    const scanBtn = screen.getByRole('button', { name: /scan lab report/i });
    expect(scanBtn).toBeInTheDocument();
    fireEvent.click(scanBtn);
    await waitFor(() => expect(screen.getByPlaceholderText(/paste lab report/i)).toBeInTheDocument());
  });

  // P-04: PDF export
  it('renders Export A4 PDF button and calls window.open', () => {
    renderTool();
    const pdfBtn = screen.getByRole('button', { name: /Export A4 PDF/i });
    expect(pdfBtn).toBeInTheDocument();
    fireEvent.click(pdfBtn);
    expect(window.open).toHaveBeenCalledWith('', '_blank');
  });

  // P-05: Demo data
  it('loads demo data on Load Demo button click and displays badge', async () => {
    renderTool();
    const demoBtn = screen.getByRole('button', { name: /load demo/i });
    fireEvent.click(demoBtn);
    expect(screen.getByTestId('synthetic-demo-badge')).toBeInTheDocument();
    expect(screen.getByDisplayValue('900')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Quest Diagnostics')).toBeInTheDocument();
    expect(document.querySelector('[data-r6-state="FULL"]')).not.toBeNull();
  });

  it('clears demo data on Clear button click', () => {
    renderTool();
    fireEvent.click(screen.getByRole('button', { name: /load demo/i }));
    expect(screen.getByTestId('synthetic-demo-badge')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(screen.queryByTestId('synthetic-demo-badge')).not.toBeInTheDocument();
    expect(document.querySelector('[data-r6-state="EMPTY"]')).not.toBeNull();
  });

  // GENIUS-12
  it('renders all 12 GENIUS analytical boxes with correct box 11', () => {
    renderTool();
    const boxes = document.querySelectorAll('[data-r6-box]');
    expect(boxes.length).toBe(12);

    const box11 = document.querySelector('[data-r6-box="11"]');
    expect(box11).not.toBeNull();
    expect(box11?.getAttribute('data-r6-box-source')).toBe('not_applicable');
    expect(box11?.textContent).toMatch(/NOT_APPLICABLE/);
  });
});
