import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import MacroPilotTool from '@/components/tools/macro-pilot';

describe('registered Macro SmartTool (pilot via shared route)', () => {
  it('mounts Macro v6 and follows global language and unit preferences', async () => {
    const renderWithPreferences = (language: Language, unitSystem: 'metric' | 'imperial') => render(
      <PreferencesContext.Provider value={{
        language,
        unitSystem,
        isRTL: language === Language.AR,
      } as PreferencesContextProps}>
        <MacroPilotTool />
      </PreferencesContext.Provider>,
    );

    const view = renderWithPreferences(Language.EN, 'metric');
    expect(screen.getByRole('heading', { name: 'Macro Calculator v6' })).toBeTruthy();
    expect(await screen.findByText('Enter the required values to begin.')).toBeTruthy();
    expect(screen.getByRole('spinbutton', { name: 'Weight (kg)' })).toBeTruthy();
    expect(screen.queryByLabelText('Language')).toBeNull();
    expect(screen.queryByLabelText('Display units')).toBeNull();

    view.rerender(
      <PreferencesContext.Provider value={{
        language: Language.AR,
        unitSystem: 'imperial',
        isRTL: true,
      } as PreferencesContextProps}>
        <MacroPilotTool />
      </PreferencesContext.Provider>,
    );
    expect(screen.getByRole('heading', { name: 'حاسبة الماكروز V6' })).toBeTruthy();
    expect(screen.getByRole('spinbutton', { name: 'الوزن (رطل)' })).toBeTruthy();
    expect(document.querySelector('[data-tool-id="mrx.tool.macro"]')).toHaveAttribute('dir', 'rtl');
  });
});
