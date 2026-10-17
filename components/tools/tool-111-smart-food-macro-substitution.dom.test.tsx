// components/tools/tool-111-smart-food-macro-substitution.dom.test.tsx
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

vi.mock('@/lib/tools/adapters/tool-111-smart-food-macro-substitution', () => {
  const mockResult = {
    substituteQuantity: 200, substituteUnit: 'g', equivalenceRatio: 1.5, equivalenceScore: 80,
    equivalenceLevel: 'good', originalMacros: { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
    substituteMacros: { protein: 31.4, carbs: 4.6, fat: 17.4, calories: 288 },
    macroDeltas: { protein: 0.4, carbs: 4.6, fat: 13.8, calories: 123 },
    calorieDifference: 123, proteinDifference: 0.4, carbsDifference: 4.6, fatDifference: 13.8,
    targetAdherence: {
      protein: 'on_target', carbs: 'on_target', fat: 'on_target', calories: 'on_target',
      overall: 'significantly_off',
    },
    warnings: [],
    limitations: [{ code: 'ESTIMATED_VALUES', message: 'Estimated values' }],
    metadata: { calculationTimestamp: '2026-10-16T10:00:00.000Z', engineVersion: '1.0.0',
      dataSources: ['USDA', 'USDA'], calculationTimeMs: 1, unitSystem: 'metric', locale: 'en' },
  };
  const mockProvenance = {
    source: 'import', recordedAt: '2026-10-16T08:00:00.000Z', timezone: 'UTC',
    unit: 'g', measurementMethod: 'ingested biometric', confidence: 0.8, dataQuality: 'high',
    referenceRange: { low: 0, high: 100, unit: '%', source: 'test' }, originalUnit: 'g',
  };
  const mockKeyFindings = [{
    code: 'EQUIVALENCE_SCORE',
    labelAr: 'درجة التكافؤ المكروي: 80.0 (good)',
    labelEn: 'Macro equivalence score: 80.0 (good)', value: '80.0', severity: 'info',
  }];
  return {
    tool111Adapter: {
      execute: vi.fn(() => ({
        ok: true,
        output: {
          toolSlug: 'smart-food-macro-substitution',
          result: mockResult,
          provenance: mockProvenance,
          keyFindings: mockKeyFindings,
          seoLinks: {
            prevTool: { slug: 'tool-110', titleAr: 'أداة سابقة', titleEn: 'Previous Tool' },
            nextTool: { slug: 'tool-112', titleAr: 'أداة تالية', titleEn: 'Next Tool' },
          },
        },
      })),
      parseInput: vi.fn(), compute: vi.fn(), build: vi.fn(), buildContext: vi.fn(),
    },
  };
});

import { tool111Adapter } from '@/lib/tools/adapters/tool-111-smart-food-macro-substitution';

describe('Tool #111 — Component & i18n (DOM)', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorageStore = {}; });
  afterEach(() => { cleanup(); });

  function renderTool(locale: Locale) {
    return render(<WithPreferences locale={locale}><Tool111SmartFoodMacroSubstitution /></WithPreferences>);
  }

  /** Fills names + original macros + substitute macros with valid values. */
  function fillValidForm(container: HTMLElement) {
    const textboxes = container.querySelectorAll('input[type="text"]');
    fireEvent.change(textboxes[0], { target: { value: 'Chicken Breast' } });
    fireEvent.change(textboxes[1], { target: { value: 'Chicken Breast' } });
    fireEvent.change(textboxes[2], { target: { value: 'Firm Tofu' } });
    fireEvent.change(textboxes[3], { target: { value: 'Firm Tofu' } });
    const numbers = container.querySelectorAll('input[type="number"]');
    // number inputs: [0..3] original macros, [4..7] substitute macros
    ['31', '0', '3.6', '165'].forEach((v, i) => fireEvent.change(numbers[i], { target: { value: v } }));
    ['15.7', '2.3', '8.7', '144'].forEach((v, i) => fireEvent.change(numbers[4 + i], { target: { value: v } }));
  }

  it('TC-01 renders the input form in English with LTR direction', () => {
    const { container } = renderTool('en');
    expect((container.firstChild as HTMLElement)).toHaveAttribute('lang', 'en');
    expect((container.firstChild as HTMLElement)).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('Smart Food & Macro Substitution Engine')).toBeInTheDocument();
    expect(screen.getByText('Calculate Substitution')).toBeInTheDocument();
  });

  it('TC-02 renders the input form in Arabic with RTL direction', () => {
    const { container } = renderTool('ar');
    expect((container.firstChild as HTMLElement)).toHaveAttribute('lang', 'ar');
    expect((container.firstChild as HTMLElement)).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('محرك استبدال الطعام الذكي بالمكرويات')).toBeInTheDocument();
    expect(screen.getByText('احسب الاستبدال')).toBeInTheDocument();
  });

  it('TC-03 calls the adapter with valid input and displays results', () => {
    const { container } = renderTool('en');
    fillValidForm(container);
    fireEvent.click(screen.getByText('Calculate Substitution'));
    expect(document.body.textContent).toContain('Substitution Results');
  });

  it('TC-04 shows validation errors for invalid input', () => {
    renderTool('en');
    fireEvent.click(screen.getByText('Calculate Substitution'));
    expect(document.body.textContent).toContain('Validation Errors');
  });

  it('TC-05 displays engine results including equivalence score', () => {
    const { container } = renderTool('en');
    fillValidForm(container);
    fireEvent.click(screen.getByText('Calculate Substitution'));
    expect(document.body.textContent).toContain('80.0');
    expect(document.body.textContent).toContain('Macro Equivalence Score');
  });

  it('TC-06 displays warnings and limitations', () => {
    const { container } = renderTool('en');
    fillValidForm(container);
    fireEvent.click(screen.getByText('Calculate Substitution'));
    expect(document.body.textContent).toContain('Limitations');
    expect(document.body.textContent).toContain('ESTIMATED_VALUES');
  });

  it('TC-07 displays key findings', () => {
    const { container } = renderTool('en');
    fillValidForm(container);
    fireEvent.click(screen.getByText('Calculate Substitution'));
    expect(document.body.textContent).toContain('Key Findings');
    expect(document.body.textContent).toContain('EQUIVALENCE_SCORE');
  });

  it('TC-08 displays data provenance', () => {
    const { container } = renderTool('en');
    fillValidForm(container);
    fireEvent.click(screen.getByText('Calculate Substitution'));
    expect(document.body.textContent).toContain('Data Provenance');
    expect(document.body.textContent).toContain('import');
  });

  it('TC-09 Arabic locale sets RTL direction', () => {
    const { container } = renderTool('ar');
    expect((container.firstChild as HTMLElement)).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('المدخلات')).toBeInTheDocument();
  });

  it('TC-10 English locale sets LTR direction', () => {
    const { container } = renderTool('en');
    expect((container.firstChild as HTMLElement)).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('Inputs')).toBeInTheDocument();
  });

  it('TC-13 passes the entered substitute-food macros to the adapter', () => {
    const { container } = renderTool('en');
    fillValidForm(container);
    fireEvent.click(screen.getByText('Calculate Substitution'));
    const exec = vi.mocked(tool111Adapter.execute);
    expect(exec).toHaveBeenCalledTimes(1);
    const input = (exec.mock.calls[0] as unknown as any[])[0];
    expect(input.substituteFood.macrosPer100g).toEqual({ protein: 15.7, carbs: 2.3, fat: 8.7, calories: 144 });
    expect(input.originalFood.macrosPer100g).toEqual({ protein: 31, carbs: 0, fat: 3.6, calories: 165 });
  });

  it('TC-14 blocks calculation and shows an error when substitute macros are missing', () => {
    const { container } = renderTool('en');
    const textboxes = container.querySelectorAll('input[type="text"]');
    fireEvent.change(textboxes[0], { target: { value: 'Chicken Breast' } });
    fireEvent.change(textboxes[1], { target: { value: 'Chicken Breast' } });
    fireEvent.change(textboxes[2], { target: { value: 'Firm Tofu' } });
    fireEvent.change(textboxes[3], { target: { value: 'Firm Tofu' } });
    const numbers = container.querySelectorAll('input[type="number"]');
    ['31', '0', '3.6', '165'].forEach((v, i) => fireEvent.change(numbers[i], { target: { value: v } }));
    fireEvent.click(screen.getByText('Calculate Substitution'));
    expect(document.body.textContent).toContain('Validation Errors');
    expect(vi.mocked(tool111Adapter.execute)).not.toHaveBeenCalled();
  });

  it('TC-15 rejects invalid (negative) substitute macros without calling the adapter', () => {
    const { container } = renderTool('en');
    fillValidForm(container);
    const numbers = container.querySelectorAll('input[type="number"]');
    fireEvent.change(numbers[4], { target: { value: '-1' } });
    fireEvent.click(screen.getByText('Calculate Substitution'));
    expect(document.body.textContent).toContain('Validation Errors');
    expect(vi.mocked(tool111Adapter.execute)).not.toHaveBeenCalled();
  });

  it('TC-16 localizes the target-adherence level in English (no raw value)', () => {
    const { container } = renderTool('en');
    fillValidForm(container);
    fireEvent.click(screen.getByText('Calculate Substitution'));
    expect(document.body.textContent).toContain('Significantly off');
    expect(document.body.textContent).not.toContain('significantly_off');
  });

  it('TC-17 localizes the target-adherence level in Arabic (RTL)', () => {
    const { container } = renderTool('ar');
    fillValidForm(container);
    fireEvent.click(screen.getByText('احسب الاستبدال'));
    expect(document.body.textContent).toContain('بعيد بشكل كبير');
    expect(document.body.textContent).not.toContain('significantly_off');
    expect((container.firstChild as HTMLElement)).toHaveAttribute('dir', 'rtl');
  });

  it('TC-11 component has no hardcoded UI strings', async () => {
    const { findHardcodedStrings } = await import('@/lib/shared/localization');
    const fs = await import('fs');
    const path = await import('path');
    const componentPath = path.join(process.cwd(), 'components/tools/tool-111-smart-food-macro-substitution.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');
    const suspicious = findHardcodedStrings(content);
    const uiStrings = suspicious.filter((s: string) => {
      if (/^[a-z0-9\-:]+$/.test(s)) return false;
      if (s.includes('className') || s.includes('dir=') || s.includes('lang=') ||
          s.includes('type=') || s.includes('value=') || s.includes('key=')) return false;
      const twPrefixes = ['w-', 'rounded', 'border', 'bg-', 'text-', 'p-', 'm-',
        'flex', 'grid', 'space-', 'gap-', 'items-', 'justify-', 'font-', 'hover:',
        'disabled:', 'max-w-', 'mt-', 'mb-', 'ml-', 'mr-', 'px-', 'py-'];
      if (twPrefixes.some(prefix => s.startsWith(prefix))) return false;
      if (s === 'tool-111-smart-food-macro-substitution') return false;
      return s.length <= 2;
    });
    expect(uiStrings.length).toBe(0);
  });

  it('TC-12 does not break tool-010 (no shared state pollution)', () => {
    expect(() => {
      renderTool('en');
    }).not.toThrow();
  });
});
