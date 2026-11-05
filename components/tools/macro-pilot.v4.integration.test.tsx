/**
 * components/tools/macro-pilot.v4.integration.test.tsx
 *
 * Dedicated R3 integration coverage for:
 * - MacroPilotTool → GeniusToolTemplateV4 → V4 adapter → Macro V6
 * - the owner-approved EMPTY/PARTIAL/FULL state mapping
 * - numerical equivalence with the unchanged Macro V6 engine
 * - duplicate-UI / landmark prevention
 * - Arabic RTL and English LTR shell behaviour
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import MacroPilotTool from '@/components/tools/macro-pilot';
import { calculateMacrosV6, type MacroInputV6 } from '@/lib/tools/engines/macro.v6';

afterEach(() => cleanup());

function renderPilot(language: 'en' | 'ar' = 'en') {
  const renderAt = (nextLanguage: 'en' | 'ar') => (
    <PreferencesContext.Provider
      value={{
        language: nextLanguage === 'ar' ? Language.AR : Language.EN,
        unitSystem: 'metric',
        theme: Theme.LIGHT,
        isRTL: nextLanguage === 'ar',
      } as PreferencesContextProps}
    >
      <MacroPilotTool />
    </PreferencesContext.Provider>
  );

  const view = render(renderAt(language));
  return {
    ...view,
    setLanguage: (nextLanguage: 'en' | 'ar') => view.rerender(renderAt(nextLanguage)),
  };
}

function completeRequiredInputs() {
  fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '30' } });
  fireEvent.change(screen.getByLabelText('Sex used by the BMR equation'), {
    target: { value: 'male' },
  });
  fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '175' } });
  fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '75' } });
  fireEvent.change(screen.getByLabelText('Activity factor (1.2–1.9)'), {
    target: { value: '1.55' },
  });
  fireEvent.change(screen.getByLabelText('Calculation phase'), {
    target: { value: 'maintenance' },
  });
}

function envelopeElement(): Element | null {
  return document.querySelector('.genius-tool-template-v4__envelope');
}

describe('Macro V4 pilot integration', () => {
  it('renders exactly one V4 shell section, one h1 and one exposed status region', async () => {
    renderPilot();
    await screen.findByTestId('macro-status');

    const shell = document.querySelector('[data-tool-id="mrx.tool.macro"]');
    expect(shell).not.toBeNull();
    expect(shell?.tagName).toBe('SECTION');
    expect(document.querySelectorAll('section')).toHaveLength(1);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    // R3.1 hides the raw V4 status token region in the pilot CSS; the
    // localized domain status below is the exposed polite live region.
    expect(screen.getByTestId('macro-status')).toHaveAttribute('role', 'status');
    expect(shell?.getAttribute('data-risk-tier')).toBe('MEDIUM');
    expect(shell?.getAttribute('data-ai-status')).toBe('NOT_CONFIGURED');
    expect(screen.getByTestId('macro-status')).toHaveAttribute('role', 'status');
    expect(screen.getByTestId('macro-status')).toHaveAttribute('aria-live', 'polite');
  });

  it('does not nest the V3 template or duplicate the shell', async () => {
    renderPilot();
    await screen.findByTestId('macro-status');

    expect(document.querySelector('.genius-tool-template')).toBeNull();
    expect(document.querySelector('.genius-tool-template-v4')).not.toBeNull();
    expect(document.querySelector('.genius-tool-template-v4__header h1')).not.toBeNull();
  });

  it('maps the EMPTY state to NOT_AVAILABLE / INSUFFICIENT_FOR_SAFE_RESULT', async () => {
    renderPilot();

    const status = await screen.findByTestId('macro-status');
    expect(status).toHaveTextContent('Inputs incomplete');
    expect(screen.getByText('Enter the required values to begin.')).toBeInTheDocument();

    await waitFor(() => {
      expect(envelopeElement()).not.toBeNull();
      expect(
        document.querySelector('[data-result-status="NOT_AVAILABLE"]')
      ).not.toBeNull();
      expect(
        document.querySelector('[data-completeness="INSUFFICIENT_FOR_SAFE_RESULT"]')
      ).not.toBeNull();
    });
  });

  it('maps the PARTIAL state to NOT_AVAILABLE / INCOMPLETE', async () => {
    renderPilot();
    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '30' } });

    await waitFor(() => {
      expect(
        document.querySelector('[data-completeness="INCOMPLETE"]')
      ).not.toBeNull();
      expect(
        document.querySelector('[data-result-status="NOT_AVAILABLE"]')
      ).not.toBeNull();
    });
    expect(screen.getByText('Missing required fields')).toBeInTheDocument();
  });

  it('maps the FULL valid state to VALID / SUFFICIENT_FOR_BASIC_RESULT and matches Macro V6 exactly', async () => {
    renderPilot();
    completeRequiredInputs();

    const resultElement = await screen.findByTestId('macro-result');
    await waitFor(() => {
      expect(document.querySelector('[data-result-status="VALID"]')).not.toBeNull();
      expect(
        document.querySelector('[data-completeness="SUFFICIENT_FOR_BASIC_RESULT"]')
      ).not.toBeNull();
    });

    const directInput: MacroInputV6 = {
      age: 30,
      sex: 'male',
      heightCm: 175,
      weightKg: 75,
      activityLevel: 1.55,
      phase: 'maintenance',
    };
    const direct = await calculateMacrosV6(directInput);
    expect('result' in direct).toBe(true);
    if (!('result' in direct)) return;

    const text = resultElement.textContent ?? '';
    expect(text).toContain(`Target calories: ${direct.result.targetCalories} kcal`);
    expect(text).toContain(`Protein: ${direct.result.proteinGrams} g`);
    expect(text).toContain(`Carbohydrates: ${direct.result.carbsGrams} g`);
    expect(text).toContain(`Fat: ${direct.result.fatGrams} g`);
    expect(screen.getByTestId('macro-result-type')).toHaveTextContent('CALCULATED');
  });

  it('maps a rejected FULL input to INVALID / INCOMPLETE without losing guidance', async () => {
    renderPilot();
    completeRequiredInputs();
    await screen.findByTestId('macro-result');

    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '18' } });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Age must be between 19 and 100 years.');
    expect(alert.textContent ?? '').not.toMatch(/NaN|Infinity/);

    await waitFor(() => {
      expect(document.querySelector('[data-result-status="INVALID"]')).not.toBeNull();
      expect(
        document.querySelector('[data-completeness="INCOMPLETE"]')
      ).not.toBeNull();
    });
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1);
  });

  it('preserves the existing Macro V6 age-extrapolation warning in the domain UI', async () => {
    renderPilot();
    completeRequiredInputs();
    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '79' } });

    expect(
      await screen.findByText(/source study included healthy adults aged 19–78/)
    ).toBeInTheDocument();
  });

  it('supports the Arabic RTL shell and the English LTR shell without duplicate landmarks', async () => {
    const view = renderPilot();
    await screen.findByTestId('macro-status');

    const shell = document.querySelector('[data-tool-id="mrx.tool.macro"]');
    expect(shell).toHaveAttribute('dir', 'ltr');

    view.setLanguage('ar');
    await waitFor(() => expect(shell).toHaveAttribute('dir', 'rtl'));
    expect(screen.getByText('حاسبة الماكروز V6')).toBeInTheDocument();
    expect(document.querySelectorAll('section')).toHaveLength(1);
    expect(shell).toHaveAttribute('dir', 'rtl');
    expect(screen.getByTestId('macro-status')).toHaveTextContent('المدخلات غير مكتملة');

    view.setLanguage('en');
    await waitFor(() => expect(shell).toHaveAttribute('dir', 'ltr'));
  });

  it('exposes labelled controls and a live status region for keyboard and screen-reader use', async () => {
    renderPilot();
    await screen.findByTestId('macro-status');

    const statusRegion = screen.getByTestId('macro-status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');

    const button = screen.getByRole('button', { name: 'Recalculate' });
    expect(button).toBeEnabled();
    button.focus();
    expect(document.activeElement).toBe(button);

    fireEvent.click(button);
    await waitFor(() => expect(screen.getByTestId('macro-status')).toBeInTheDocument());

    expect(screen.getByLabelText('Age (years)')).toHaveAttribute('type', 'number');
    expect(screen.getByLabelText('Sex used by the BMR equation').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Calculation phase').tagName).toBe('SELECT');
  });
});
