// @vitest-environment jsdom
import React, { type PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import { useSmartLabReference } from './useSmartLabReference';

const makePreferences = (unitSystem: 'metric' | 'imperial'): PreferencesContextProps => ({
  language: Language.EN,
  unitSystem,
  theme: 'dark',
  status: 'IDLE',
  isAutoDetected: false,
  locale: 'en-US',
  currency: 'USD',
  formatPrice: (price) => `$${price}`,
  setLanguage: vi.fn(),
  setUnitSystem: vi.fn(),
  setTheme: vi.fn(),
  t: (key) => String(key),
  content: {} as PreferencesContextProps['content'],
  isRTL: false,
  refreshDetection: vi.fn(async () => undefined),
});

describe('useSmartLabReference header measurement preference', () => {
  it('follows the header unit and converts the entered value without a local selector', async () => {
    let unitSystem: 'metric' | 'imperial' = 'metric';
    const wrapper = ({ children }: PropsWithChildren) => React.createElement(
      PreferencesContext.Provider,
      { value: makePreferences(unitSystem) },
      children,
    );
    const { result, rerender } = renderHook(() => useSmartLabReference(), { wrapper });

    act(() => {
      result.current.openDetails('hormones_total_testosterone');
      result.current.setValue('5');
    });

    expect(result.current.unitSystem).toBe('metric');
    expect(result.current.value).toBe('5');

    unitSystem = 'imperial';
    rerender();

    await waitFor(() => {
      expect(result.current.unitSystem).toBe('imperial');
      expect(result.current.value).toBe('144.09');
    });
  });
});

