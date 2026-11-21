/**
 * components/tools/bmi-pilot.v4.test.tsx
 *
 * R5 first batch, Tool 1: V4 pilot integration coverage for the retained
 * BMI tool. Mirrors the Macro pilot contract: EN/AR, RTL/LTR, progressive
 * disclosure, required-input completeness, envelope states.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import BmiPilotTool from '@/components/tools/bmi-pilot';
import { withToolPreferences } from '@/components/tools/tool-preferences.test-utils';

afterEach(() => cleanup());

function renderTool(locale: 'ar' | 'en' = 'en', unitSystem: 'metric' | 'imperial' = 'metric') {
  return render(withToolPreferences(<BmiPilotTool />, locale, unitSystem));
}

describe('BMI pilot V4', () => {
  it('renders the V4 shell and the default completeness progress', async () => {
    renderTool('en', 'metric');
    const shell = document.querySelector('[data-tool-id="mrx.tool.bmi"]');
    expect(shell).not.toBeNull();
    expect(shell).toHaveAttribute('data-ai-status', 'NOT_CONFIGURED');
    expect(shell).toHaveAttribute('data-risk-tier', 'LOW');
    expect(shell).toHaveAttribute('dir', 'ltr');
    expect(screen.getByTestId('bmi-required-progress')).toHaveTextContent(
      '2 of 2 required inputs provided.'
    );
  });

  it('calculates the engine-equivalent bounded result with a VALID envelope', async () => {
    renderTool('en', 'metric');
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await waitFor(() => expect(screen.getByTestId('bmi-result')).toHaveTextContent('BMI: 22.9'));
    expect(screen.getByTestId('bmi-result-type')).toHaveTextContent('CALCULATED');
    expect(document.querySelector('[data-result-status="VALID"]')).not.toBeNull();
    expect(document.querySelector('[data-completeness="SUFFICIENT_FOR_BASIC_RESULT"]')).not.toBeNull();
    expect(screen.getByTestId('bmi-not-diagnosis-warning')).toBeInTheDocument();
  });

  it('keeps the meaning sections visible and collapses the three advanced disclosures', async () => {
    renderTool('en', 'metric');
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await screen.findByTestId('bmi-result');
    expect(screen.getByText('What this result means')).toBeInTheDocument();
    expect(screen.getByText('What this result does not mean')).toBeInTheDocument();

    const formula = screen.getByTestId('bmi-details-formula');
    const interpretation = screen.getByTestId('bmi-details-interpretation');
    const units = screen.getByTestId('bmi-details-units');
    expect(document.querySelectorAll('details')).toHaveLength(3);
    expect(formula).not.toHaveAttribute('open');
    expect(interpretation).not.toHaveAttribute('open');
    expect(units).not.toHaveAttribute('open');
    expect(screen.getByText('Formula, evidence and categories')).toBeInTheDocument();
    expect(screen.getByText('Interpreting your number')).toBeInTheDocument();
    expect(screen.getByText('Units and rounding')).toBeInTheDocument();
  });

  it('keeps every disclosure summary keyboard focusable', async () => {
    renderTool('en', 'metric');
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await screen.findByTestId('bmi-result');
    const summaries = Array.from(document.querySelectorAll('summary'));
    expect(summaries).toHaveLength(3);
    for (const summary of summaries) {
      summary.focus();
      expect(document.activeElement).toBe(summary);
    }
  });

  it('rejects an invalid input with a single alert and no result', async () => {
    renderTool('en', 'metric');
    const weight = screen.getByLabelText('Weight (kg)');
    fireEvent.change(weight, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    const alert = await screen.findByRole('alert');
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1);
    expect(alert.textContent ?? '').not.toMatch(/NaN|Infinity/i);
    expect(screen.queryByTestId('bmi-result')).toBeNull();
    expect(document.querySelector('[data-result-status="INVALID"]')).not.toBeNull();
  });

  it('renders Arabic RTL with localized progress and summaries', async () => {
    renderTool('ar', 'metric');
    const shell = document.querySelector('[data-tool-id="mrx.tool.bmi"]');
    expect(shell).toHaveAttribute('dir', 'rtl');
    expect(screen.getByTestId('bmi-required-progress')).toHaveTextContent(
      'تم إدخال 2 من أصل 2 مدخلات مطلوبة.'
    );
    fireEvent.click(screen.getByRole('button', { name: /احسب/i }));
    await screen.findByTestId('bmi-result');
    expect(screen.getByText('ماذا تعني هذه النتيجة')).toBeInTheDocument();
    expect(screen.getByText('المعادلة والأدلة والفئات')).toBeInTheDocument();
    expect(screen.getByText('تفسير رقمك')).toBeInTheDocument();
    expect(screen.getByText('الوحدات والتقريب')).toBeInTheDocument();
  });

  it('uses imperial units without changing the canonical engine result', async () => {
    renderTool('en', 'imperial');
    expect(screen.getByText('Weight (lb)')).toBeInTheDocument();
    expect(screen.getByText('Height (in)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await screen.findByTestId('bmi-result');
    expect(screen.getByTestId('bmi-result')).toHaveTextContent('BMI: 22.9');
  });
});
