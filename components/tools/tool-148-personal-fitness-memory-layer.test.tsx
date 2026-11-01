import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SmartToolsSessionContextProvider } from '@/context/SmartToolsSessionContext';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool148PersonalFitnessMemoryLayer from './tool-148-personal-fitness-memory-layer';
import Tool149PhysiqueTrajectorySimulator from './tool-149-physique-trajectory-simulator';

function renderTool() {
  return render(<PreferencesContext.Provider value={{ language: Language.EN, unitSystem: 'metric', isRTL: false } as PreferencesContextProps}>
    <SmartToolsSessionContextProvider><Tool148PersonalFitnessMemoryLayer /></SmartToolsSessionContextProvider>
  </PreferencesContext.Provider>);
}

describe('Tool 148 session fitness context', () => {
  afterEach(() => cleanup());
  it('keeps values private to the tool unless the user opts in to Tool 149', () => {
    renderTool();
    fireEvent.change(screen.getByRole('spinbutton', { name: /current weight/i }), { target: { value: '80' } });
    fireEvent.change(screen.getByRole('textbox', { name: /value source/i }), { target: { value: 'user measurement' } });
    fireEvent.change(screen.getByLabelText(/measurement date/i), { target: { value: '2026-10-25' } });
    fireEvent.click(screen.getByRole('button', { name: /add to this session/i }));
    expect(screen.getByText(/private to this tool/i)).toBeTruthy();
    expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked();
    expect(screen.getByText(/nothing is persistently stored or sent to an external party/i)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /fitness context available this session/i })).not.toBeInTheDocument();
  });

  it('requires both consents, exposes only the selected value, and supports revoke and clearing the imported copy', () => {
    render(<PreferencesContext.Provider value={{ language: Language.EN, unitSystem: 'metric', isRTL: false } as PreferencesContextProps}>
      <SmartToolsSessionContextProvider>
        <Tool148PersonalFitnessMemoryLayer />
        <Tool149PhysiqueTrajectorySimulator />
      </SmartToolsSessionContextProvider>
    </PreferencesContext.Provider>);

    fireEvent.change(screen.getAllByRole('spinbutton', { name: /current weight/i })[0], { target: { value: '80' } });
    fireEvent.change(screen.getByRole('textbox', { name: /value source/i }), { target: { value: 'user measurement' } });
    fireEvent.change(screen.getByLabelText(/measurement date/i), { target: { value: '2026-10-25' } });
    fireEvent.click(screen.getByRole('button', { name: /add to this session/i }));
    expect(screen.queryByRole('region', { name: /fitness context available this session/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /allow tool 149 to access current weight/i }));
    expect(screen.getByRole('region', { name: /fitness context available this session/i })).toHaveTextContent('80 kg');
    expect(screen.getByRole('region', { name: /fitness context available this session/i })).not.toHaveTextContent('user measurement');
    expect(screen.getByRole('region', { name: /fitness context available this session/i })).not.toHaveTextContent('2026-10-25');
    expect(screen.getByRole('region', { name: /fitness context available this session/i })).toHaveTextContent(/second consent/i);

    fireEvent.click(screen.getByRole('checkbox', { name: /current weight: 80 kg/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm and import selected values/i }));
    expect(screen.getAllByLabelText(/current weight \(kg\)/i)[1]).toHaveValue(80);

    fireEvent.click(screen.getByRole('checkbox', { name: /allow tool 149 to access current weight/i }));
    expect(screen.queryByRole('region', { name: /fitness context available this session/i })).not.toBeInTheDocument();
    expect(screen.getByText(/revocation also clears the linked imported value from tool 149/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/current weight \(kg\)/i)[1]).toHaveValue(null);
    expect(screen.queryByRole('button', { name: /clear imported values from this form/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /allow tool 149 to access current weight/i }));
    const regrantedContext = screen.getByRole('region', { name: /fitness context available this session/i });
    expect(within(regrantedContext).getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByRole('button', { name: /confirm and import selected values/i })).toBeDisabled();

    fireEvent.click(within(regrantedContext).getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /confirm and import selected values/i }));
    expect(screen.getAllByLabelText(/current weight \(kg\)/i)[1]).toHaveValue(80);
    fireEvent.click(screen.getByRole('button', { name: /clear imported values from this form/i }));
    expect(screen.getAllByLabelText(/current weight \(kg\)/i)[1]).toHaveValue(null);
    expect(screen.queryByRole('button', { name: /clear imported values from this form/i })).not.toBeInTheDocument();
  });

  it('requires source and date and lets the user clear session context', () => {
    renderTool();
    fireEvent.change(screen.getByRole('spinbutton', { name: /current weight/i }), { target: { value: '-2' } });
    fireEvent.change(screen.getByRole('textbox', { name: /value source/i }), { target: { value: 'user measurement' } });
    fireEvent.change(screen.getByLabelText(/measurement date/i), { target: { value: '2026-10-25' } });
    fireEvent.click(screen.getByRole('button', { name: /add to this session/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('INVALID_INPUT');
  });
});
