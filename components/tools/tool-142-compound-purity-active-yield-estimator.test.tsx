import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool142 from './tool-142-compound-purity-active-yield-estimator';

afterEach(() => cleanup());

function withPreferences(language: Language, unitSystem: 'metric' | 'imperial') {
  const value = {
    language, unitSystem, theme: Theme.DARK, status: 'IDLE', isAutoDetected: false,
    locale: language === Language.AR ? 'ar' : 'en', currency: 'USD', formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined, setUnitSystem: () => undefined, setTheme: () => undefined,
    t: (key: string) => key, content: {} as unknown, isRTL: language === Language.AR, refreshDetection: async () => undefined,
  } as PreferencesContextProps;
  return <PreferencesContext.Provider value={value}><Tool142 /></PreferencesContext.Provider>;
}

describe('Tool 142 user assay arithmetic UI', () => {
  it('requires source metadata and calculates only after an explicit user action', () => {
    render(withPreferences(Language.EN, 'metric'));
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(screen.getByLabelText(/Sample mass/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/User-entered mass assay/), { target: { value: '92' } });
    fireEvent.change(screen.getByLabelText(/Stated absolute uncertainty/), { target: { value: '1.5' } });
    fireEvent.change(inputs[0], { target: { value: 'LAB-19, page 2' } });
    fireEvent.change(inputs[1], { target: { value: 'HPLC as stated by lab' } });
    fireEvent.change(inputs[2], { target: { value: 'Expanded, 95% as stated; not re-evaluated' } });
    fireEvent.change(screen.getByLabelText(/Report date/), { target: { value: '2026-08-11' } });

    expect(screen.queryByText(/Calculated central mass/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Calculate arithmetic mass' }));
    expect(screen.getByText(/Calculated central mass/).parentElement).toHaveTextContent('92 g');
    expect(screen.getByText(/Arithmetic bounds/)).toHaveTextContent('90.5–93.5 g');
    expect(screen.getByText(/does not establish purity/)).toBeInTheDocument();
  });

  it('displays Arabic text and RTL direction from the shared preference context', () => {
    const { container } = render(withPreferences(Language.AR, 'metric'));
    expect(container.querySelector('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'حساب كتلة من نتيجة اختبار مدخلة' })).toBeInTheDocument();
  });

  it('uses the global imperial preference for its initial mass unit', () => {
    render(withPreferences(Language.EN, 'imperial'));
    expect(screen.getByLabelText('Sample mass (oz)')).toBeInTheDocument();
  });

  it('keeps the same sample mass when the global unit preference changes', async () => {
    const { rerender } = render(withPreferences(Language.EN, 'metric'));
    fireEvent.change(screen.getByLabelText(/Sample mass/), { target: { value: '100' } });
    rerender(withPreferences(Language.EN, 'imperial'));
    await waitFor(() => expect(Number((screen.getByLabelText('Sample mass (oz)') as HTMLInputElement).value)).toBeCloseTo(3.5273962, 6));
  });

  it('reports NOT_AVAILABLE when numerical values lack mandatory provenance', () => {
    render(withPreferences(Language.EN, 'metric'));
    fireEvent.change(screen.getByLabelText(/Sample mass/), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/User-entered mass assay/), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText(/Stated absolute uncertainty/), { target: { value: '1' } });
    expect(screen.getByTestId('tool-142-input-state')).toHaveTextContent('NOT_AVAILABLE');
    expect(screen.getByRole('button', { name: 'Calculate arithmetic mass' })).toBeDisabled();
  });
});
