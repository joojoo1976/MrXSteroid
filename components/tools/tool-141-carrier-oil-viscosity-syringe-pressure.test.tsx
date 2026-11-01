import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool141 from './tool-141-carrier-oil-viscosity-syringe-pressure';

afterEach(() => cleanup());

function withPreferences(language: Language, unitSystem: 'metric' | 'imperial') {
  const value = {
    language, unitSystem, theme: Theme.DARK, status: 'IDLE', isAutoDetected: false,
    locale: language === Language.AR ? 'ar' : 'en', currency: 'USD', formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined, setUnitSystem: () => undefined, setTheme: () => undefined,
    t: (key: string) => key, content: {} as unknown, isRTL: language === Language.AR, refreshDetection: async () => undefined,
  } as PreferencesContextProps;
  return render(<PreferencesContext.Provider value={value}><Tool141 /></PreferencesContext.Provider>);
}
const renderEnglish = () => withPreferences(Language.EN, 'metric');

describe('Tool 141 interface', () => {
  it('keeps the result unavailable until all measured inputs, sources and assumptions are supplied', () => {
    renderEnglish();
    expect(screen.getByTestId('tool-141-input-state')).toHaveTextContent('PARTIAL');
    fireEvent.change(screen.getByRole('spinbutton', { name: /^Dynamic viscosity/ }), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Viscosity measurement source/), { target: { value: 'Measured report V-1' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /^Density \(/ }), { target: { value: '900' } });
    fireEvent.change(screen.getByLabelText(/Density measurement source/), { target: { value: 'Measured report D-1' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Tube inner diameter/ }), { target: { value: '0.5' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Straight tube length/ }), { target: { value: '25' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Assumed volumetric flow rate/ }), { target: { value: '0.6' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Temperature at property measurement/ }), { target: { value: '22' } });
    expect(screen.getByTestId('tool-141-input-state')).toHaveTextContent('NOT_AVAILABLE');
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Calculate ideal pressure drop/ }));
    expect(screen.getByTestId('tool-141-result')).toHaveTextContent('CALCULATED');
    expect(screen.getByTestId('tool-141-result')).toHaveTextContent('not actual syringe pressure');
  });

  it('does not calculate pressure for non-laminar input', () => {
    renderEnglish();
    const values: Array<[RegExp, string]> = [
      [/^Dynamic viscosity/, '100'], [/Viscosity measurement source/, 'V-1'],
      [/^Density/, '900'], [/Density measurement source/, 'D-1'],
      [/Tube inner diameter/, '0.5'], [/Straight tube length/, '25'],
      [/Assumed volumetric flow rate/, '10000'], [/Temperature at property measurement/, '22'],
    ];
    values.forEach(([label, value]) => {
      const control = label.source.includes('source')
        ? screen.getByRole('textbox', { name: label })
        : screen.getByRole('spinbutton', { name: label });
      fireEvent.change(control, { target: { value } });
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Calculate ideal pressure drop/ }));
    expect(screen.getByTestId('tool-141-result')).toHaveTextContent('NOT_AVAILABLE');
    expect(screen.getByTestId('tool-141-result')).not.toHaveTextContent('Ideal pressure drop across tube');
  });

  it('reports invalid measurements before missing source metadata', () => {
    renderEnglish();
    const entries: Array<[RegExp, string]> = [
      [/^Dynamic viscosity/, '0'], [/^Density/, '900'], [/Tube inner diameter/, '0.5'],
      [/Straight tube length/, '25'], [/Assumed volumetric flow rate/, '0.6'],
      [/Temperature at property measurement/, '22'],
    ];
    entries.forEach(([label, value]) => fireEvent.change(screen.getByRole('spinbutton', { name: label }), { target: { value } }));
    expect(screen.getByTestId('tool-141-input-state')).toHaveTextContent('INVALID');
    expect(screen.getByRole('button', { name: /Calculate ideal pressure drop/ })).toBeDisabled();
  });

  it('follows the shared Arabic/RTL and imperial unit preferences', () => {
    const { container, rerender } = withPreferences(Language.AR, 'metric');
    expect(container.querySelector('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'حاسبة هبوط الضغط النظري في أنبوب دائري' })).toBeInTheDocument();
    const preferences = {
      language: Language.EN, unitSystem: 'imperial', theme: Theme.DARK, status: 'IDLE', isAutoDetected: false,
      locale: 'en', currency: 'USD', formatPrice: (price: number) => `$${price}`,
      setLanguage: () => undefined, setUnitSystem: () => undefined, setTheme: () => undefined,
      t: (key: string) => key, content: {} as unknown, isRTL: false, refreshDetection: async () => undefined,
    } as PreferencesContextProps;
    rerender(<PreferencesContext.Provider value={preferences}><Tool141 /></PreferencesContext.Provider>);
    expect(screen.getByRole('spinbutton', { name: /Tube inner diameter \(in\)/ })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /Temperature at property measurement \(°F\)/ })).toBeInTheDocument();
  });

  it('converts entered values when the global unit system changes', async () => {
    const { rerender } = withPreferences(Language.EN, 'metric');
    fireEvent.change(screen.getByRole('spinbutton', { name: /^Density/ }), { target: { value: '900' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Tube inner diameter/ }), { target: { value: '0.5' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Straight tube length/ }), { target: { value: '25' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Assumed volumetric flow rate/ }), { target: { value: '0.6' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Temperature at property measurement/ }), { target: { value: '22' } });
    const imperialPreferences = {
      language: Language.EN, unitSystem: 'imperial', theme: Theme.DARK, status: 'IDLE', isAutoDetected: false,
      locale: 'en', currency: 'USD', formatPrice: (price: number) => `$${price}`,
      setLanguage: () => undefined, setUnitSystem: () => undefined, setTheme: () => undefined,
      t: (key: string) => key, content: {} as unknown, isRTL: false, refreshDetection: async () => undefined,
    } as PreferencesContextProps;
    rerender(<PreferencesContext.Provider value={imperialPreferences}><Tool141 /></PreferencesContext.Provider>);
    await waitFor(() => expect(Number((screen.getByRole('spinbutton', { name: /Tube inner diameter \(in\)/ }) as HTMLInputElement).value)).toBeCloseTo(0.019685, 6));
    expect(Number((screen.getByRole('spinbutton', { name: /^Density \(lb\/ft³\)/ }) as HTMLInputElement).value)).toBeCloseTo(56.1852, 3);
    expect(Number((screen.getByRole('spinbutton', { name: /Temperature at property measurement \(°F\)/ }) as HTMLInputElement).value)).toBeCloseTo(71.6, 5);
  });
});
