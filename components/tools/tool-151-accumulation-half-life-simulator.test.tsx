import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool151 from './tool-151-accumulation-half-life-simulator';

afterEach(() => cleanup());

function renderTool(language: Language) {
  return render(
    <PreferencesContext.Provider value={{ language, unitSystem: 'metric', isRTL: language === Language.AR } as PreferencesContextProps}>
      <Tool151 />
    </PreferencesContext.Provider>,
  );
}

describe('Tool 151 accessible bilingual scenario UI', () => {
  it('renders accessible labels and a localized calculated result without exposing raw JSON', () => {
    renderTool(Language.AR);
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    fireEvent.click(screen.getByRole('button', { name: 'احسب السيناريو' }));
    expect(screen.getByRole('region', { name: 'نتيجة السيناريو' })).toBeInTheDocument();
    expect(screen.getByText('الذروة الحسابية (بلا وحدة)')).toBeInTheDocument();
    expect(screen.getByText('الافتراضات')).toBeInTheDocument();
    expect(screen.queryByText(/"peak_amount"/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });

  it('follows header language changes while preserving inputs and reports invalid values', () => {
    const view = renderTool(Language.AR);
    fireEvent.change(screen.getByLabelText('نصف العمر (أيام)'), { target: { value: '0' } });
    view.rerender(
      <PreferencesContext.Provider value={{ language: Language.EN, unitSystem: 'imperial', isRTL: false } as PreferencesContextProps}>
        <Tool151 />
      </PreferencesContext.Provider>,
    );
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByLabelText('Half-life (days)')).toHaveValue(0);
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenario' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter numeric values within the limits shown for each field.');
    expect(screen.queryByRole('region', { name: 'Scenario result' })).not.toBeInTheDocument();
  });
});
