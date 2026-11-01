import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import Tool008SideEffectTracker from './tool-008-side-effect-tracker';
import Tool009InjectionSiteRotator from './tool-009-injection-site-rotator';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function renderWithPreferences(locale: 'ar' | 'en', component: React.ReactNode) {
  const preferences: PreferencesContextProps = {
    language: locale === 'ar' ? Language.AR : Language.EN,
    unitSystem: 'metric',
    theme: Theme.DARK,
    status: 'IDLE',
    isAutoDetected: false,
    locale: locale === 'ar' ? 'ar-EG' : 'en-US',
    currency: 'USD',
    formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined,
    setUnitSystem: () => undefined,
    setTheme: () => undefined,
    t: (key: string) => key,
    content: {} as PreferencesContextProps['content'],
    isRTL: locale === 'ar',
    refreshDetection: async () => undefined,
  };
  return render(<PreferencesContext.Provider value={preferences}>{component}</PreferencesContext.Provider>);
}

describe('Tools 008 and 009 explicit history logging', () => {
  it('Tool 008 follows header language and saves only after explicit submit', async () => {
    vi.mocked(localStorage.setItem).mockClear();
    renderWithPreferences('en', <Tool008SideEffectTracker />);
    fireEvent.change(screen.getByLabelText('Symptom or observation'), { target: { value: 'User-described symptom' } });
    expect(screen.getByText('No entries have been saved in this browser.')).toBeInTheDocument();
    expect(localStorage.getItem('mrx_tool_state')).toBeFalsy();
    fireEvent.click(screen.getByRole('button', { name: 'Save log entry' }));
    await waitFor(() => expect(localStorage.setItem).toHaveBeenCalledWith('mrx_tool_state', expect.stringContaining('"side_effects"')));
    expect(screen.getByText('User-described symptom')).toBeInTheDocument();
  });

  it('Tool 009 follows Arabic header direction and never produces a safety interval', async () => {
    vi.mocked(localStorage.setItem).mockClear();
    const { container } = renderWithPreferences('ar', <Tool009InjectionSiteRotator />);
    expect(container.querySelector('section')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText(/لا توصي بمواقع أو فواصل للحقن/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('اسم الموقع الذي تدخله'), { target: { value: 'User label' } });
    fireEvent.change(screen.getByLabelText('التاريخ المسجل'), { target: { value: '2026-10-25' } });
    expect(localStorage.getItem('mrx_tool_state')).toBeFalsy();
    expect(screen.queryByText(/موعد آمن|Next safe injection/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'حفظ الإدخال' }));
    await waitFor(() => expect(localStorage.setItem).toHaveBeenCalledWith('mrx_tool_state', expect.stringContaining('"injection_sites"')));
    const serialized = vi.mocked(localStorage.setItem).mock.calls.at(-1)?.[1] ?? '';
    expect(serialized).not.toContain('next_safe_date');
    expect(serialized).toContain('User label');
  });
});
