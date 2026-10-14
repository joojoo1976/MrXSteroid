// lib/shared/test-utils.tsx
/**
 * lib/shared/test-utils.tsx
 * Shared React Testing Utilities for SmartTools
 * jsdom environment tests
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { PreferencesContext, Language, Theme } from '@/context/PreferencesContext';

/**
 * Locale type for testing
 */
export type TestLocale = 'ar' | 'en';

/**
 * Mock PreferencesContext props for a given locale
 */
export function makePreferences(locale: TestLocale) {
  return {
    language: locale === 'ar' ? Language.AR : Language.EN,
    unitSystem: 'metric' as const,
    theme: Theme.DARK,
    status: 'IDLE' as const,
    isAutoDetected: false,
    locale,
    currency: 'USD',
    formatPrice: (p: number) => `$${p}`,
    setLanguage: jest.fn(),
    setUnitSystem: jest.fn(),
    setTheme: jest.fn(),
    t: (key: any) => String(key),
    content: {} as any,
    isRTL: locale === 'ar',
    refreshDetection: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Wrapper component providing controlled PreferencesContext
 */
interface WithPreferencesProps {
  locale: TestLocale;
  children: React.ReactNode;
}

export function WithPreferences({ locale, children }: WithPreferencesProps) {
  return (
    <PreferencesContext.Provider value={makePreferences(locale)}>
      {children}
    </PreferencesContext.Provider>
  );
}

/**
 * Render component with specified locale
 */
export function renderWithLocale<T>(
  ui: React.ReactElement,
  locale: TestLocale = 'ar',
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(
    <WithPreferences locale={locale}>{ui}</WithPreferences>,
    options
  );
}

/**
 * Render component in Arabic locale
 */
export function renderAr<T>(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult {
  return renderWithLocale(ui, 'ar', options);
}

/**
 * Render component in English locale
 */
export function renderEn<T>(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult {
  return renderWithLocale(ui, 'en', options);
}

/**
 * Render component in both locales and return both results
 */
export function renderBothLocales<T>(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): { ar: RenderResult; en: RenderResult } {
  return {
    ar: renderAr(ui, options),
    en: renderEn(ui, options),
  };
}

/**
 * Assert component renders without NaN or Infinity in text content
 */
export function expectNoNaNInDOM(renderResult: RenderResult): void {
  const text = renderResult.container.textContent || '';
  if (text.includes('NaN') || text.includes('Infinity')) {
    throw new Error(`DOM contains NaN or Infinity: ${text.slice(0, 200)}`);
  }
}

/**
 * Assert component renders correctly in both locales
 */
export function expectBilingualRender<T>(
  ui: React.ReactElement,
  assertions: {
    ar?: (result: RenderResult) => void;
    en?: (result: RenderResult) => void;
  }
): void {
  if (assertions.ar) {
    const arResult = renderAr(ui);
    assertions.ar(arResult);
  }
  if (assertions.en) {
    const enResult = renderEn(ui);
    assertions.en(enResult);
  }
}

/**
 * Assert no NaN or Infinity in rendered output for both locales
 */
export function expectNoNaNInBothLocales(ui: React.ReactElement): void {
  const { ar, en } = renderBothLocales(ui);
  expectNoNaNInDOM(ar);
  expectNoNaNInDOM(en);
}

/**
 * Assert direction attribute is correct for locale
 */
export function expectDirection(
  renderResult: RenderResult,
  locale: TestLocale
): void {
  const expectedDir = locale === 'ar' ? 'rtl' : 'ltr';
  const root = renderResult.container.firstElementChild;
  if (root && root.getAttribute('dir') !== expectedDir) {
    throw new Error(
      `Expected dir="${expectedDir}" for ${locale}, got "${root.getAttribute('dir')}"`
    );
  }
}

/**
 * Assert direction is correct for both locales
 */
export function expectDirectionBothLocales(ui: React.ReactElement): void {
  expectDirection(renderAr(ui).container.firstElementChild!, 'ar');
  expectDirection(renderEn(ui).container.firstElementChild!, 'en');
}

/**
 * Get input element by label text
 */
export function getInputByLabel(
  renderResult: RenderResult,
  labelText: string
): HTMLInputElement | null {
  const label = renderResult.container.querySelector(`label:contains("${labelText}")`);
  if (!label) return null;
  const input = label.querySelector('input') || 
    renderResult.container.querySelector(`input[id="${label.getAttribute('for')}"]`);
  return input as HTMLInputElement | null;
}

/**
 * Simulate user typing in an input
 */
export async function typeInInput(
  input: HTMLInputElement,
  value: string
): Promise<void> {
  // Clear existing value
  input.value = '';
  // Simulate typing
  for (const char of value) {
    input.value += char;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

/**
 * Assert no NaN or Infinity in rendered output for both locales
 */
export function expectNoNaNInBothLocales(ui: React.ReactElement): void {
  const { ar, en } = renderBothLocales(ui);
  const arText = ar.container.textContent || '';
  const enText = en.container.textContent || '';
  
  if (arText.includes('NaN') || arText.includes('Infinity')) {
    throw new Error(`Arabic DOM contains NaN/Infinity: ${arText.slice(0, 200)}`);
  }
  if (enText.includes('NaN') || enText.includes('Infinity')) {
    throw new Error(`English DOM contains NaN/Infinity: ${enText.slice(0, 200)}`);
  }
}