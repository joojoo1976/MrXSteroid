import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool092 from './tool-092-female-dosage-calculator';

afterEach(() => cleanup());

function renderTool(language: Language) {
  const value = {
    language,
    unitSystem: 'metric',
    theme: Theme.DARK,
    status: 'IDLE',
    isAutoDetected: false,
    locale: language === Language.AR ? 'ar' : 'en',
    currency: 'USD',
    formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined,
    setUnitSystem: () => undefined,
    setTheme: () => undefined,
    t: (key: string) => key,
    content: {} as unknown,
    isRTL: language === Language.AR,
    refreshDetection: async () => undefined,
  } as PreferencesContextProps;
  return render(<PreferencesContext.Provider value={value}><Tool092 /></PreferencesContext.Provider>);
}

describe('Tool 092 unavailable-dose UI', () => {
  it('shows the unavailable state and omits unsupported safety tiers and durations', () => {
    renderTool(Language.EN);
    expect(screen.getByRole('heading', { name: 'Female Androgen Dose Evidence Check' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No validated product-specific model establishes a safe androgen dose');
    expect(screen.queryByText('conservative-minimal-risk')).not.toBeInTheDocument();
    expect(screen.queryByText('Max Conservative Exposure Window')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save|حفظ|calculate|احسب/i })).not.toBeInTheDocument();
  });

  it('uses the global Arabic preference and RTL layout without local language controls', () => {
    renderTool(Language.AR);
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'مراجعة أدلة جرعات الأندروجينات للنساء' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('لا يوجد نموذج موثّق خاص بالمنتج');
    expect(screen.queryByRole('button', { name: /English|العربية|اللغة/i })).not.toBeInTheDocument();
  });
});
