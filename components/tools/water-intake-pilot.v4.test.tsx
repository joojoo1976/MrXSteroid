/**
 * components/tools/water-intake-pilot.v4.test.tsx
 *
 * R5 first batch, Tool 3: V4 pilot integration coverage. Keeps the retained
 * tool's contract: EN/AR, RTL/LTR, required-input completeness, envelopes,
 * medical-boundary explanations.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import WaterIntakePilotTool from './water-intake-pilot';
import { withToolPreferences } from '@/components/tools/tool-preferences.test-utils';

afterEach(() => cleanup());

function renderTool(locale: 'ar' | 'en' = 'en', unitSystem: 'metric' | 'imperial' = 'metric') {
  return render(withToolPreferences(<WaterIntakePilotTool />, locale, unitSystem));
}

describe('water-intake pilot V4', () => {
  it('renders the V4 shell with progress 1 of 2 (activity pre-selected)', () => {
    renderTool('en', 'metric');
    const shell = document.querySelector('[data-tool-id="mrx.tool.water-intake"]');
    expect(shell).not.toBeNull();
    expect(shell).toHaveAttribute('data-ai-status', 'NOT_CONFIGURED');
    expect(shell).toHaveAttribute('data-risk-tier', 'LOW');
    expect(screen.getByTestId('water-required-progress')).toHaveTextContent(
      '1 of 2 required inputs provided.'
    );
  });

  it('calculates the engine-equivalent value with a VALID envelope and warning', async () => {
    renderTool('en', 'metric');
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '70' } });
    fireEvent.click(screen.getByTestId('water-calculate'));

    expect(screen.getByTestId('water-result')).toHaveTextContent('2.5 L/day (2500 mL)');
    expect(screen.getByTestId('water-result-type')).toHaveTextContent('CALCULATED');
    expect(document.querySelector('[data-result-status="VALID"]')).not.toBeNull();
    expect(screen.getByTestId('water-not-medical-warning')).toBeInTheDocument();
  });

  it('keeps meaning sections visible and collapses the three disclosures', async () => {
    renderTool('en', 'metric');
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '70' } });
    fireEvent.click(screen.getByTestId('water-calculate'));

    await screen.findByTestId('water-result');
    expect(screen.getByText('What this result means')).toBeInTheDocument();
    expect(screen.getByText('What this result does not mean')).toBeInTheDocument();
    expect(document.querySelectorAll('details')).toHaveLength(3);
    expect(screen.getByText('Formula, evidence and assumptions')).toBeInTheDocument();
    expect(screen.getByText('Interpreting your number')).toBeInTheDocument();
    expect(screen.getByText('Units and rounding')).toBeInTheDocument();
  });

  it('keeps every disclosure summary keyboard focusable', async () => {
    renderTool('en', 'metric');
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '70' } });
    fireEvent.click(screen.getByTestId('water-calculate'));

    await screen.findByTestId('water-result');
    const summaries = Array.from(document.querySelectorAll('summary'));
    expect(summaries).toHaveLength(3);
    for (const summary of summaries) {
      summary.focus();
      expect(document.activeElement).toBe(summary);
    }
  });

  it('rejects an empty weight with a single alert and no result', async () => {
    renderTool('en', 'metric');
    fireEvent.click(screen.getByTestId('water-calculate'));

    const alert = await screen.findByRole('alert');
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1);
    expect(alert.textContent ?? '').not.toMatch(/NaN|Infinity/i);
    expect(screen.queryByTestId('water-result')).toBeNull();
    expect(document.querySelector('[data-result-status="INVALID"]')).not.toBeNull();
  });

  it('renders Arabic RTL with localized progress, headings and summaries', async () => {
    renderTool('ar', 'metric');
    const shell = document.querySelector('[data-tool-id="mrx.tool.water-intake"]');
    expect(shell).toHaveAttribute('dir', 'rtl');
    expect(screen.getByTestId('water-required-progress')).toHaveTextContent(
      'تم إدخال 1 من أصل 2 مدخلات مطلوبة.'
    );
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '70' } });
    fireEvent.click(screen.getByTestId('water-calculate'));
    await screen.findByTestId('water-result');
    expect(screen.getByText('ماذا تعني هذه النتيجة')).toBeInTheDocument();
    expect(screen.getByText('المعادلة والأدلة والافتراضات')).toBeInTheDocument();
    expect(screen.getByText('تفسير رقمك')).toBeInTheDocument();
    expect(screen.getByText('الوحدات والتقريب')).toBeInTheDocument();
  });

  it('shows 2 of 2 after entering a weight', async () => {
    renderTool('en', 'metric');
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '80' } });
    expect(screen.getByTestId('water-required-progress')).toHaveTextContent(
      '2 of 2 required inputs provided.'
    );
  });
});
