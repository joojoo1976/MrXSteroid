import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool143 from './tool-143-storage-stability-thermal-degradation-estimator';

afterEach(() => cleanup());

function withPreferences(language: Language, unitSystem: 'metric' | 'imperial') {
  const value = {
    language, unitSystem, theme: Theme.DARK, status: 'IDLE', isAutoDetected: false,
    locale: language === Language.AR ? 'ar' : 'en', currency: 'USD', formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined, setUnitSystem: () => undefined, setTheme: () => undefined,
    t: (key: string) => key, content: {} as unknown, isRTL: language === Language.AR, refreshDetection: async () => undefined,
  } as PreferencesContextProps;
  return <PreferencesContext.Provider value={value}><Tool143 /></PreferencesContext.Provider>;
}

describe('Tool 143 UI', () => {
  it('records the DailyMed search time and reports incomplete data as not evaluable', () => {
    render(<Tool143 />);
    fireEvent.change(screen.getByLabelText('اسم المنتج كما يظهر في الملصق'), { target: { value: 'Example medicine' } });
    const search = screen.getByRole('link', { name: 'ابحث في DailyMed' });
    expect(search).toHaveAttribute('href', expect.stringContaining('query=Example%20medicine'));
    fireEvent.click(search);
    expect((screen.getByLabelText('وقت الاستعلام المسجل') as HTMLInputElement).value).toContain('2026-');
    fireEvent.click(screen.getByRole('button', { name: 'قارن البيانات' }));
    expect(screen.getByText(/غير قابلة للتقييم؛ لا يُفترض نطاق تخزين/)).toBeInTheDocument();
  });

  it('uses the global imperial setting for temperature entry and output while comparing canonically', () => {
    render(withPreferences(Language.EN, 'imperial'));
    fireEvent.change(screen.getByLabelText('Product name as shown on label'), { target: { value: 'Example medicine' } });
    fireEvent.change(screen.getByLabelText('Product state in label'), { target: { value: 'unopened' } });
    fireEvent.click(screen.getByRole('link', { name: 'Search DailyMed' }));
    fireEvent.change(screen.getByLabelText('DailyMed label URL or Set ID'), { target: { value: 'bee5b358-c863-420b-be73-ced2e920c499' } });
    fireEvent.change(screen.getByLabelText('Label storage minimum (°F)'), { target: { value: '35.6' } });
    fireEvent.change(screen.getByLabelText('Label storage maximum (°F)'), { target: { value: '46.4' } });
    fireEvent.change(screen.getByLabelText('Recorded minimum (°F)'), { target: { value: '37.4' } });
    fireEvent.change(screen.getByLabelText('Recorded maximum (°F)'), { target: { value: '44.6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Compare record' }));
    expect(screen.getByText('Readings are within the transcribed range')).toBeInTheDocument();
    expect(screen.getByText(/Label range then readings/)).toBeInTheDocument();
    expect(screen.getByText(/35\.6–46\.4 · 37\.4–44\.6/)).toBeInTheDocument();
  });

  it('converts entered canonical temperatures when the global unit and language preferences change', () => {
    const view = render(withPreferences(Language.EN, 'metric'));
    fireEvent.change(screen.getByLabelText('Label storage minimum (°C)'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Label storage maximum (°C)'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Recorded minimum (°C)'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Recorded maximum (°C)'), { target: { value: '7' } });

    view.rerender(withPreferences(Language.EN, 'imperial'));
    expect(screen.getByLabelText('Label storage minimum (°F)')).toHaveValue(35.6);
    expect(screen.getByLabelText('Label storage maximum (°F)')).toHaveValue(46.4);
    expect(screen.getByLabelText('Recorded minimum (°F)')).toHaveValue(37.4);
    expect(screen.getByLabelText('Recorded maximum (°F)')).toHaveValue(44.6);

    view.rerender(withPreferences(Language.AR, 'imperial'));
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'فاحص نطاق الملصق وسجل حرارة المنتج' })).toBeInTheDocument();
    expect(screen.getByLabelText('أدنى حرارة التخزين في الملصق (°F)')).toHaveValue(35.6);
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
