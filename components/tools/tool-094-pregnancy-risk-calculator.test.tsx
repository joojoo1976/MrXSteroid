import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool094 from './tool-094-pregnancy-risk-calculator';

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
  return render(<PreferencesContext.Provider value={value}><Tool094 /></PreferencesContext.Provider>);
}

describe('Tool 094 product-specific pregnancy information UI', () => {
  it('explains why class-level risk and timing are unavailable and collects no personal inputs', () => {
    renderTool(Language.EN);
    expect(screen.getByRole('heading', { name: 'Pregnancy Exposure Information' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Generic washout periods');
    expect(screen.getByRole('link', { name: 'View this DailyMed isotretinoin product label' })).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save|حفظ|calculate|احسب/i })).not.toBeInTheDocument();
  });

  it('follows the global Arabic preference without local language controls', () => {
    renderTool(Language.AR);
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'معلومات التعرض والدواء مع الحمل' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('لا يمكن لفئة مركب عامة');
    expect(screen.queryByRole('button', { name: /English|العربية|اللغة/i })).not.toBeInTheDocument();
  });
});
