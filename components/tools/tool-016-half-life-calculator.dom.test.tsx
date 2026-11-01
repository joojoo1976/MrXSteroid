import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool016HalfLifeCalculator from './tool-016-half-life-calculator';

afterEach(() => cleanup());

function renderWithLocale(locale: 'ar' | 'en') {
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
  return render(<PreferencesContext.Provider value={value}><Tool016HalfLifeCalculator /></PreferencesContext.Provider>);
}

describe('Tool 016 half-life scenario calculator', () => {
  it('follows global Arabic direction and requires the source before calculation', () => {
    const { container } = renderWithLocale('ar');
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    fireEvent.click(screen.getByRole('button', { name: 'احسب السيناريوهات' }));
    expect(screen.getByRole('status')).toHaveTextContent('PARTIAL');
    expect(screen.queryByText(/CALCULATED/)).toBeNull();
    expect(document.getElementById('metric-btn')).toBeNull();
    expect(document.getElementById('imperial-btn')).toBeNull();
  });

  it('shows calculated arithmetic, source, and limits in English and clears stale results on edit', () => {
    renderWithLocale('en');
    fireEvent.change(screen.getByLabelText('Name or label'), { target: { value: 'Example compound' } });
    fireEvent.change(screen.getByLabelText(/User-provided half-life/), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Half-life source (required)'), { target: { value: 'Product label section 5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenarios' }));
    expect(screen.getByText(/CALCULATED — Mathematical scenario only/)).toBeInTheDocument();
    expect(document.body.textContent).toContain('21.61 days');
    expect(document.body.textContent).toContain('Product label section 5');
    expect(document.body.textContent).toContain('not clinical clearance');
    expect(document.body.textContent).not.toMatch(/PCT After|Masteron|Halotestin|TUDCA|milk thistle/i);

    fireEvent.change(screen.getByLabelText('Name or label'), { target: { value: 'Changed' } });
    expect(screen.queryByText(/CALCULATED — Mathematical scenario only/)).toBeNull();
  });

  it('allows multiple independent user-entered scenarios', () => {
    renderWithLocale('en');
    fireEvent.click(screen.getByRole('button', { name: 'Add another independent scenario' }));
    expect(screen.getAllByRole('group')).toHaveLength(2);
  });
});
