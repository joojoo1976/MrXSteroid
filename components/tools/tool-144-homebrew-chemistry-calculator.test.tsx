import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool144 from './tool-144-homebrew-chemistry-calculator';

afterEach(() => cleanup());

function withUnitSystem(unitSystem: 'metric' | 'imperial', language = Language.EN) {
  const value = {
    language: language === 'ar' ? Language.AR : Language.EN, unitSystem, theme: Theme.DARK, status: 'IDLE', isAutoDetected: false,
    locale: language, currency: 'USD', formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined, setUnitSystem: () => undefined, setTheme: () => undefined,
    t: (key: string) => key, content: {} as unknown, isRTL: language === 'ar', refreshDetection: async () => undefined,
  } as PreferencesContextProps;
  return <PreferencesContext.Provider value={value}><Tool144 /></PreferencesContext.Provider>;
}

describe('Tool 144 UI', () => {
  it('calculates after the required measured quantities and temperature are entered', () => {
    render(<Tool144 />);
    const fields = screen.getAllByRole('spinbutton');
    fireEvent.change(fields[0], { target: { value: '1' } });
    fireEvent.change(fields[1], { target: { value: '1' } });
    fireEvent.change(fields[2], { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'احسب' }));
    expect(screen.getByText(/1000 kg\/m3/)).toBeInTheDocument();
  });

  it('follows a global measurement-system change and preserves entered quantities', async () => {
    const { rerender } = render(withUnitSystem('metric'));
    let fields = screen.getAllByRole('spinbutton');
    fireEvent.change(fields[0], { target: { value: '1000' } });
    fireEvent.change(fields[1], { target: { value: '1000' } });
    fireEvent.change(fields[2], { target: { value: '20' } });

    rerender(withUnitSystem('imperial'));
    await waitFor(() => expect(screen.getByLabelText('Unit massUnit')).toHaveValue('lb'));
    fields = screen.getAllByRole('spinbutton');
    expect(Number((fields[0] as HTMLInputElement).value)).toBeCloseTo(2.20462, 4);
    expect(Number((fields[1] as HTMLInputElement).value)).toBeCloseTo(33.814, 2);
    expect(Number((fields[2] as HTMLInputElement).value)).toBeCloseTo(68, 4);
    expect(screen.getByLabelText('Unit resultUnit')).toHaveValue('lb/ft3');
  });

  it('follows the global language change while retaining values and showing no local preference toggle', () => {
    const view = render(withUnitSystem('metric', 'en'));
    const fields = screen.getAllByRole('spinbutton');
    fireEvent.change(fields[0], { target: { value: '2' } });
    fireEvent.change(fields[1], { target: { value: '3' } });
    fireEvent.change(fields[2], { target: { value: '20' } });

    view.rerender(withUnitSystem('metric', 'ar'));

    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'حاسبة عامة للكتلة والحجم والكثافة' })).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton').map((field) => (field as HTMLInputElement).value)).toEqual(['2', '3', '20']);
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
