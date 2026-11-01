import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import { SmartToolsSessionContextProvider, useTool148SessionContext } from '@/context/SmartToolsSessionContext';
import { useEffect } from 'react';
import Tool149PhysiqueTrajectorySimulator from '@/components/tools/tool-149-physique-trajectory-simulator';
import Tool150ManualResultsOrganizer from '@/components/tools/tool-150-ai-performance-command-center';

function renderWithHeaderPreferences(locale: 'ar' | 'en' = 'en', unitSystem: 'metric' | 'imperial' = 'metric') {
  const renderAt = (language: 'ar' | 'en', units: 'metric' | 'imperial') => (
    <PreferencesContext.Provider value={{
      language: language === 'ar' ? Language.AR : Language.EN,
      unitSystem: units,
      isRTL: language === 'ar',
    } as PreferencesContextProps}>
      <Tool149PhysiqueTrajectorySimulator />
    </PreferencesContext.Provider>
  );
  const view = render(renderAt(locale, unitSystem));
  return {
    ...view,
    setHeaderPreferences: (language: 'ar' | 'en', units: 'metric' | 'imperial') => view.rerender(renderAt(language, units)),
  };
}

describe('Tool 149 global language and measurement preferences', () => {
  afterEach(() => cleanup());

  it('shows PARTIAL and blocks calculation while mandatory values are missing', () => {
    renderWithHeaderPreferences();
    expect(screen.getByText(/PARTIAL/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calculate scenarios' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'EN' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Metric' })).not.toBeInTheDocument();
  });

  it('shows explicit validation errors and blocks zero/negative values', () => {
    renderWithHeaderPreferences();
    fireEvent.change(screen.getByLabelText('Current weight (kg)'), { target: { value: '-2' } });
    fireEvent.change(screen.getByLabelText('Current body-fat percentage (%)'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Target body-fat percentage (%)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Scenario rate 1 (kg/week)'), { target: { value: '0' } });
    expect(screen.getByRole('alert')).toHaveTextContent('INVALID_INPUT');
    expect(screen.getByRole('button', { name: 'Calculate scenarios' })).toBeDisabled();
  });

  it('calculates one rate and preserves the result when the header changes measurement units', () => {
    const view = renderWithHeaderPreferences();
    fireEvent.change(screen.getByLabelText('Current weight (kg)'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Current body-fat percentage (%)'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Target body-fat percentage (%)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Scenario rate 1 (kg/week)'), { target: { value: '0.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenarios' }));
    expect(screen.getByText('93.8 kg')).toBeInTheDocument();
    expect(screen.getByText('12.5 weeks')).toBeInTheDocument();
    expect(screen.getAllByText(/constant lean mass/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CALCULATED/).length).toBeGreaterThan(0);
    view.setHeaderPreferences('en', 'imperial');
    expect(screen.getByLabelText('Current weight (lb)')).toHaveValue(220.46);
    expect(screen.queryByText('Results summary')).not.toBeInTheDocument();
  });

  it('compares three manually entered rates and converts values through the header preference', () => {
    const view = renderWithHeaderPreferences();
    fireEvent.change(screen.getByLabelText('Current weight (kg)'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Current body-fat percentage (%)'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Target body-fat percentage (%)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Scenario rate 1 (kg/week)'), { target: { value: '0.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add rate' }));
    fireEvent.change(screen.getByLabelText('Scenario rate 2 (kg/week)'), { target: { value: '0.25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add rate' }));
    fireEvent.change(screen.getByLabelText('Scenario rate 3 (kg/week)'), { target: { value: '1' } });
    view.setHeaderPreferences('en', 'imperial');
    expect((screen.getByLabelText('Current weight (lb)') as HTMLInputElement).value).toBe('220.46');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenarios' }));
    expect(screen.getAllByText('206.8 lb')).toHaveLength(3);
    expect(screen.getByText('12.5 weeks')).toBeInTheDocument();
    expect(screen.getByText('25 weeks')).toBeInTheDocument();
    expect(screen.getByText('6.3 weeks')).toBeInTheDocument();
  });

  it('uses global Arabic language preference without clearing entered values', () => {
    const view = renderWithHeaderPreferences();
    fireEvent.change(screen.getByLabelText('Current weight (kg)'), { target: { value: '100' } });
    view.setHeaderPreferences('ar', 'metric');
    expect(screen.getByLabelText('الوزن الحالي (kg)')).toHaveValue(100);
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
  });

  it('imports only explicitly shared values selected by the user', () => {
    function SeedContext() {
      const { addItem } = useTool148SessionContext();
      useEffect(() => {
        addItem({ id: 'weight-1', field: 'current_weight_kg', value: 85, unit: 'kg', source: 'user record', recordedOn: '2026-10-25', shareWithTool149: true });
        addItem({ id: 'fat-1', field: 'current_body_fat_pct', value: 18, unit: '%', source: 'user record', recordedOn: '2026-10-25', shareWithTool149: false });
      }, [addItem]);
      return null;
    }

    render(<PreferencesContext.Provider value={{ language: Language.EN, unitSystem: 'metric', isRTL: false } as PreferencesContextProps}>
      <SmartToolsSessionContextProvider><SeedContext /><Tool149PhysiqueTrajectorySimulator /></SmartToolsSessionContextProvider>
    </PreferencesContext.Provider>);

    expect(screen.getByLabelText('Current weight (kg)')).toHaveValue(null);
    expect(screen.getByLabelText('Current body-fat percentage (%)')).toHaveValue(null);
    fireEvent.click(screen.getByRole('checkbox', { name: /current weight: 85 kg/i }));
    fireEvent.click(screen.getByRole('button', { name: /import selected values/i }));
    expect(screen.getByLabelText('Current weight (kg)')).toHaveValue(85);
    expect(screen.getByLabelText('Current body-fat percentage (%)')).toHaveValue(null);
    expect(screen.queryByText(/user record/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/user-entered and unverified/i)).not.toBeInTheDocument();
  });

  it('shares a calculated result to Tool 150 only after consent and a second explicit import action', () => {
    render(<PreferencesContext.Provider value={{ language: Language.EN, unitSystem: 'metric', isRTL: false } as PreferencesContextProps}>
      <SmartToolsSessionContextProvider>
        <Tool149PhysiqueTrajectorySimulator />
        <Tool150ManualResultsOrganizer />
      </SmartToolsSessionContextProvider>
    </PreferencesContext.Provider>);

    fireEvent.change(screen.getByLabelText('Current weight (kg)'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Current body-fat percentage (%)'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Target body-fat percentage (%)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Scenario rate 1 (kg/week)'), { target: { value: '0.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenarios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Allow Tool 150 to import this result' }));

    expect(screen.getByText(/tool-149-physique-trajectory-simulator · .*SENSITIVE · 3 fields/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /tool-149-physique-trajectory-simulator/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Import selected results' }));
    expect(screen.getByLabelText('Metric name 2')).toHaveValue('Tool 149 scenario 1 target weight');
    expect(screen.getByLabelText('Value as reported 2')).toHaveValue('93.8');
    expect(screen.getByLabelText('Data status 2')).toHaveValue('unknown');

    fireEvent.click(screen.getByRole('button', { name: 'Revoke access to this result' }));
    expect(screen.queryByText(/tool-149-physique-trajectory-simulator · .*SENSITIVE · 3 fields/i)).not.toBeInTheDocument();
  });
});
