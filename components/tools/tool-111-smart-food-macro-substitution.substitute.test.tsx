// components/tools/tool-111-smart-food-macro-substitution.substitute.test.tsx
// End-to-end proof (component -> real adapter -> engine -> render) that the
// substitute-food macros typed into the form drive the rendered results.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import * as PreferencesCtx from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';

vi.mock('next/navigation', () => ({
  permanentRedirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));

let localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { localStorageStore = {}; }),
  length: 0, key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

type Locale = 'ar' | 'en';
function makePreferences(locale: Locale): PreferencesCtx.PreferencesContextProps {
  return {
    language: locale === 'ar' ? Language.AR : Language.EN, unitSystem: 'metric', theme: Theme.DARK,
    status: 'IDLE', isAutoDetected: false, locale: locale, currency: 'USD',
    formatPrice: (p: number) => `$${p}`, setLanguage: vi.fn(), setUnitSystem: vi.fn(),
    setTheme: vi.fn(), t: (key: any) => String(key), content: {} as any,
    isRTL: locale === 'ar', refreshDetection: vi.fn().mockResolvedValue(undefined),
  };
}
function WithPreferences({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (<PreferencesCtx.PreferencesContext.Provider value={makePreferences(locale)}>{children}</PreferencesCtx.PreferencesContext.Provider>);
}

import Tool111SmartFoodMacroSubstitution from './tool-111-smart-food-macro-substitution';

function setMacros(numbers: NodeListOf<Element>, offset: number, values: string[]) {
  values.forEach((v, i) => fireEvent.change(numbers[offset + i], { target: { value: v } }));
}

describe('Tool #111 — substitute-food macros drive results (real adapter)', () => {
  beforeEach(() => { localStorageStore = {}; });
  afterEach(() => { cleanup(); });

  function renderTool() {
    return render(<WithPreferences locale="en"><Tool111SmartFoodMacroSubstitution /></WithPreferences>);
  }

  function fillNames(container: HTMLElement) {
    const textboxes = container.querySelectorAll('input[type="text"]');
    fireEvent.change(textboxes[0], { target: { value: 'Chicken Breast' } });
    fireEvent.change(textboxes[1], { target: { value: 'Chicken Breast' } });
    fireEvent.change(textboxes[2], { target: { value: 'Firm Tofu' } });
    fireEvent.change(textboxes[3], { target: { value: 'Firm Tofu' } });
  }

  it('EE-01 changing substitute macros changes the rendered equivalence score', () => {
    const { container } = renderTool();
    fillNames(container);
    const numbers = container.querySelectorAll('input[type="number"]');

    // Original macros: chicken breast.
    setMacros(numbers, 0, ['31', '0', '3.6', '165']);
    // Substitute macros identical to the original -> perfect equivalence.
    setMacros(numbers, 4, ['31', '0', '3.6', '165']);
    fireEvent.click(screen.getByText('Calculate Substitution'));
    const scoreMatched = parseFloat(screen.getByTestId('equivalence-score').textContent ?? '');

    // Change ONLY the substitute profile -> equivalence must drop.
    setMacros(numbers, 4, ['15.7', '2.3', '8.7', '144']);
    fireEvent.click(screen.getByText('Calculate Substitution'));
    const scoreDifferent = parseFloat(screen.getByTestId('equivalence-score').textContent ?? '');

    expect(Number.isFinite(scoreMatched)).toBe(true);
    expect(Number.isFinite(scoreDifferent)).toBe(true);
    expect(scoreMatched).toBe(100);
    expect(scoreMatched).toBeGreaterThan(scoreDifferent);
  });
});
