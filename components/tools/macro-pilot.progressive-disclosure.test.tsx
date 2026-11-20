/**
 * components/tools/macro-pilot.progressive-disclosure.test.tsx
 *
 * Batch D coverage for the pilot's remaining presentation requirements:
 * required-input completeness, progressive disclosure, explanation boundaries,
 * empty/partial/invalid guidance, and Arabic/English RTL/LTR equivalence.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import MacroPilotTool from '@/components/tools/macro-pilot';

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

describe('required-input completeness presentation', () => {
  it('shows 0 of 6 before any input and updates to 1 of 6 for a partial input', async () => {
    renderPilot();
    const progress = await screen.findByTestId('macro-required-progress');
    expect(progress).toHaveTextContent('0 of 6 required inputs provided.');

    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '30' } });
    await waitFor(() =>
      expect(screen.getByTestId('macro-required-progress')).toHaveTextContent(
        '1 of 6 required inputs provided.'
      )
    );
  });

  it('lists the missing required fields and never invents values', async () => {
    renderPilot();
    await screen.findByTestId('macro-required-progress');
    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '30' } });

    const required = await screen.findByLabelText('Required inputs');
    expect(required).toHaveTextContent('Sex');
    expect(required).toHaveTextContent('Height');
    expect(required).toHaveTextContent('Weight');
    expect(required).toHaveTextContent('Activity factor');
    expect(required).toHaveTextContent('Phase');
    expect(required).not.toHaveTextContent('Age');
  });
});

describe('progressive disclosure and explanation boundaries', () => {
  it('keeps the primary result visible and collapses advanced detail into authored disclosures', async () => {
    renderPilot();
    completeRequiredInputs();

    const result = await screen.findByTestId('macro-result');
    expect(result.closest('details')).toBeNull();
    expect(result).toHaveTextContent('Target calories:');

    const formula = screen.getByTestId('macro-details-formula');
    const scenarios = screen.getByTestId('macro-details-scenarios');
    const whatIf = screen.getByTestId('macro-details-what-if');
    expect(document.querySelectorAll('details')).toHaveLength(3);
    expect(formula).not.toHaveAttribute('open');
    expect(scenarios).not.toHaveAttribute('open');
    expect(whatIf).not.toHaveAttribute('open');

    expect(screen.getByText('Formula, evidence and assumptions')).toBeInTheDocument();
    expect(screen.getByText('Comparison scenarios and sensitivity')).toBeInTheDocument();
    expect(screen.getByText('What-if scenario')).toBeInTheDocument();
  });

  it('states what the result means and what it does not mean', async () => {
    renderPilot();
    completeRequiredInputs();
    await screen.findByTestId('macro-result');

    expect(screen.getByText('What this result means')).toBeInTheDocument();
    expect(
      screen.getByText(/not a measurement, diagnosis, treatment plan, or guarantee/)
    ).toBeInTheDocument();
    expect(screen.getByText('What this result does not mean')).toBeInTheDocument();
    expect(
      screen.getByText(/does not diagnose, treat, prescribe, manage an eating disorder/)
    ).toBeInTheDocument();
    expect(screen.getByText(/does not save or share your inputs/)).toBeInTheDocument();
  });

  it('keeps every disclosure summary keyboard focusable', async () => {
    renderPilot();
    completeRequiredInputs();
    await screen.findByTestId('macro-result');

    const summaries = Array.from(document.querySelectorAll('summary'));
    expect(summaries).toHaveLength(3);
    for (const summary of summaries) {
      summary.focus();
      expect(document.activeElement).toBe(summary);
    }
  });
});

describe('empty, partial, invalid and unavailable guidance', () => {
  it('shows localized error guidance without adding a second alert', async () => {
    renderPilot();
    completeRequiredInputs();
    await screen.findByTestId('macro-result');

    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '18' } });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Age must be between 19 and 100 years.');
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1);
    expect(screen.getByText('Correct the entered value and recalculate.')).toBeInTheDocument();
    expect(screen.queryByTestId('macro-details-formula')).toBeNull();
  });
});

describe('Arabic RTL equivalence', () => {
  it('localizes completeness, explanation and disclosure text under dir=rtl', async () => {
    const view = renderPilot('ar');
    const shell = document.querySelector('[data-tool-id="mrx.tool.macro"]');
    expect(shell).toHaveAttribute('dir', 'rtl');
    expect(await screen.findByTestId('macro-required-progress')).toHaveTextContent(
      'تم إدخال 0 من أصل 6 حقول مطلوبة.'
    );

    fireEvent.change(screen.getByLabelText('العمر (سنة)'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('الجنس المستخدم في معادلة الأيض الأساسي'), {
      target: { value: 'male' },
    });
    fireEvent.change(screen.getByLabelText('الطول (سم)'), { target: { value: '175' } });
    fireEvent.change(screen.getByLabelText('الوزن (كجم)'), { target: { value: '75' } });
    fireEvent.change(screen.getByLabelText('معامل النشاط (1.2–1.9)'), {
      target: { value: '1.55' },
    });
    fireEvent.change(screen.getByLabelText('مرحلة الحساب'), {
      target: { value: 'maintenance' },
    });

    await screen.findByTestId('macro-result');
    expect(screen.getByText('ماذا تعني هذه النتيجة')).toBeInTheDocument();
    expect(screen.getByText('ما لا تعنيه هذه النتيجة')).toBeInTheDocument();
    expect(screen.getByText('المعادلة والأدلة والافتراضات')).toBeInTheDocument();
    expect(screen.getByText('سيناريوهات المقارنة والحساسية')).toBeInTheDocument();
    expect(screen.getByText('السيناريو الافتراضي')).toBeInTheDocument();
    expect(view.container.querySelector('[data-tool-id="mrx.tool.macro"]')).toHaveAttribute(
      'dir',
      'rtl'
    );
  });
});
