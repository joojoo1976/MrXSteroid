import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool015SHBGModulator from './tool-015-shbg-modulator';

afterEach(() => cleanup());

function withLocale(locale: 'ar' | 'en') {
  const value = {
    language: locale === 'ar' ? Language.AR : Language.EN,
    unitSystem: 'imperial',
    theme: Theme.DARK,
    status: 'IDLE',
    isAutoDetected: false,
    locale,
    currency: 'USD',
    formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined,
    setUnitSystem: () => undefined,
    setTheme: () => undefined,
    t: (key: string) => key,
    content: {} as any,
    isRTL: locale === 'ar',
    refreshDetection: async () => undefined,
  } as PreferencesContextProps;
  return <PreferencesContext.Provider value={value}><Tool015SHBGModulator /></PreferencesContext.Provider>;
}

describe('tool 015 global language and fixed lab units', () => {
  it('uses Arabic locale, fixed assay units, and requires all three values', () => {
    const { container } = render(withLocale('ar'));
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('حاسبة التستوستيرون الحر');
    expect(screen.getByText(/وحدات التحاليل هذه مستقلة/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('PARTIAL');

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '500' } });
    fireEvent.change(inputs[1], { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'احسب' }));
    expect(screen.getByRole('status')).toHaveTextContent('PARTIAL');
  });

  it('calculates in English and never shows drug or dose recommendations', () => {
    render(withLocale('en'));
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '500' } });
    fireEvent.change(inputs[1], { target: { value: '30' } });
    fireEvent.change(inputs[2], { target: { value: '4.3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByText(/CALCULATED — Vermeulen/)).toBeInTheDocument();
    expect(document.body.textContent).toContain('10.85 ng/dL');
    expect(document.body.textContent).toContain('Results summary');
    expect(document.body.textContent).toContain('PMID 10523012');
    expect(document.body.textContent).not.toMatch(/Masteron|Halotestin|aromatase inhibitor|dosage adjustment/i);
    expect(document.getElementById('metric-btn')).toBeNull();
    expect(document.getElementById('imperial-btn')).toBeNull();
  });

  it('rejects nonpositive lab values and clears a previously calculated AI context summary', () => {
    render(withLocale('en'));
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '500' } });
    fireEvent.change(inputs[1], { target: { value: '30' } });
    fireEvent.change(inputs[2], { target: { value: '4.3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(document.body.textContent).toContain('Results summary');

    fireEvent.change(inputs[0], { target: { value: '0' } });
    expect(document.body.textContent).not.toContain('Results summary');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByRole('status')).toHaveTextContent('Values must be finite numbers greater than zero.');
  });
});
