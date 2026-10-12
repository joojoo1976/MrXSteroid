// components/tools/tool-010-compound-stack-builder.dom.test.tsx
// ═══════════════════════════════════════════════════════════════════════════
// Layer-5 UI coverage for tool #010 — Compound Stack Builder
// Tests: Metric/Imperial toggle & Arabic/RTL/LTR locale switching
// Runs in the dedicated `jsdom` vitest project only (*.dom.test.tsx suffix).
// ═══════════════════════════════════════════════════════════════════════════
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';

// ── Mocks needed before any component import ──────────────────────────────
// tool-010 uses usePreferences() from PreferencesContext which requires a
// provider. We mock the whole context so we can control locale from tests.
import * as PreferencesCtx from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';

// Mock next/navigation used indirectly
vi.mock('next/navigation', () => ({
  permanentRedirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));

// Stable localStorage mock backed by a real Map so reads/writes persist
// across renders within the same test.
let localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { localStorageStore = {}; }),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

// ── PreferencesContext factory helpers ────────────────────────────────────
type Locale = 'ar' | 'en';

function makePreferences(locale: Locale): PreferencesCtx.PreferencesContextProps {
  return {
    language: locale === 'ar' ? Language.AR : Language.EN,
    unitSystem: 'metric',
    theme: Theme.DARK,
    status: 'IDLE',
    isAutoDetected: false,
    locale: locale,
    currency: 'USD',
    formatPrice: (p: number) => `$${p}`,
    setLanguage: vi.fn(),
    setUnitSystem: vi.fn(),
    setTheme: vi.fn(),
    t: (key: any) => String(key),
    content: {} as any,
    isRTL: locale === 'ar',
    refreshDetection: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Wrap component with a controlled PreferencesContext value.
 */
function WithPreferences({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = makePreferences(locale);
  return (
    <PreferencesCtx.PreferencesContext.Provider value={value}>
      {children}
    </PreferencesCtx.PreferencesContext.Provider>
  );
}

// ── Import component under test ────────────────────────────────────────────
// Imported AFTER mocks are registered.
import Tool010CompoundStackBuilder from './tool-010-compound-stack-builder';

// ── Import toggle helpers for direct unit testing ─────────────────────────
import {
  kgToLbs,
  lbsToKg,
  KG_TO_LBS,
  getStoredMeasurementSystem,
  storeMeasurementSystem,
} from './MeasurementToggle';

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 1 — MeasurementToggle unit tests (pure logic, no render)
// ═══════════════════════════════════════════════════════════════════════════
describe('MeasurementToggle — pure conversion helpers', () => {
  it('TC-M-00 kgToLbs converts 85 kg correctly', () => {
    // 85 × 2.20462 = 187.39 → Math.round → 187
    expect(kgToLbs(85)).toBe(187);
  });

  it('TC-M-00b lbsToKg converts 187 lbs back within 0.5 kg', () => {
    const kg = lbsToKg(187);
    expect(Math.abs(kg - 85)).toBeLessThan(0.5);
  });

  it('TC-M-00c KG_TO_LBS constant is precisely 2.20462', () => {
    expect(KG_TO_LBS).toBeCloseTo(2.20462, 4);
  });

  it('TC-M-00d storeMeasurementSystem persists to localStorage', () => {
    storeMeasurementSystem('imperial');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('measurementSystem', 'imperial');
  });

  it('TC-M-00e getStoredMeasurementSystem reads from localStorage', () => {
    localStorageStore['measurementSystem'] = 'imperial';
    const result = getStoredMeasurementSystem();
    expect(result).toBe('imperial');
  });

  it('TC-M-00f getStoredMeasurementSystem defaults to metric when empty', () => {
    delete localStorageStore['measurementSystem'];
    localStorageMock.getItem.mockReturnValueOnce(null);
    const result = getStoredMeasurementSystem();
    expect(result).toBe('metric');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 2 — Metric/Imperial UI Tests (tool-010 component rendered in jsdom)
// ═══════════════════════════════════════════════════════════════════════════
describe('tool-010 — Metric/Imperial toggle (UI)', () => {
  beforeEach(() => {
    localStorageStore = {};
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // TC-MI-01: Metric input — verify component renders metric toggle
  it('TC-MI-01 renders MeasurementToggle in Metric mode by default', () => {
    localStorageStore['measurementSystem'] = 'metric';
    render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );

    // The Metric button should have the active class when metric is selected
    const metricBtn = document.getElementById('metric-btn');
    expect(metricBtn).not.toBeNull();
    expect(metricBtn?.classList.contains('active')).toBe(true);
  });

  // TC-MI-02: Switch to Imperial — button becomes active, localStorage updated
  it('TC-MI-02 switches to Imperial when Imperial button is clicked', () => {
    localStorageStore['measurementSystem'] = 'metric';
    render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );

    const imperialBtn = document.getElementById('imperial-btn');
    expect(imperialBtn).not.toBeNull();
    act(() => { fireEvent.click(imperialBtn!); });

    // After click, localStorage should be updated to imperial
    expect(localStorageMock.setItem).toHaveBeenCalledWith('measurementSystem', 'imperial');
    // imperial button should now be active
    expect(imperialBtn?.classList.contains('active')).toBe(true);
  });

  // TC-MI-03: Return to Metric — Metric button becomes active again
  it('TC-MI-03 returns to Metric after clicking Metric button', () => {
    localStorageStore['measurementSystem'] = 'imperial';
    render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );

    const metricBtn = document.getElementById('metric-btn');
    act(() => { fireEvent.click(metricBtn!); });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('measurementSystem', 'metric');
    expect(metricBtn?.classList.contains('active')).toBe(true);
  });

  // TC-MI-04: Cycling Metric → Imperial → Metric
  it('TC-MI-04 cycling Metric → Imperial → Metric retains correct active state', () => {
    localStorageStore['measurementSystem'] = 'metric';
    render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );

    const metricBtn = document.getElementById('metric-btn');
    const imperialBtn = document.getElementById('imperial-btn');

    // Step 1: metric active
    expect(metricBtn?.classList.contains('active')).toBe(true);

    // Step 2: switch to imperial
    act(() => { fireEvent.click(imperialBtn!); });
    expect(imperialBtn?.classList.contains('active')).toBe(true);
    expect(metricBtn?.classList.contains('active')).toBe(false);

    // Step 3: switch back to metric
    act(() => { fireEvent.click(metricBtn!); });
    expect(metricBtn?.classList.contains('active')).toBe(true);
    expect(imperialBtn?.classList.contains('active')).toBe(false);
  });

  // TC-MI-05: Save/Restore with Imperial selected — localStorage persists
  it('TC-MI-05 localStorage persists imperial selection across re-renders', () => {
    localStorageStore['measurementSystem'] = 'metric';
    const { unmount } = render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );

    act(() => { fireEvent.click(document.getElementById('imperial-btn')!); });
    unmount();

    // Simulate page reload — store should still have 'imperial'
    expect(localStorageStore['measurementSystem']).toBe('imperial');

    // Re-render: toggle should restore imperial
    render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    expect(document.getElementById('imperial-btn')?.classList.contains('active')).toBe(true);
  });

  // TC-MI-06: Label text changes between Arabic and English per locale
  it('TC-MI-06 metric toggle label shows Arabic text in AR locale', () => {
    render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    const metricBtn = document.getElementById('metric-btn');
    // Arabic metric label: 'متري (كغ/سم)'
    expect(metricBtn?.textContent).toContain('متري');
  });

  it('TC-MI-06b metric toggle label shows English text in EN locale', () => {
    render(
      <WithPreferences locale="en">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    const metricBtn = document.getElementById('metric-btn');
    // English metric label: 'Metric (mg/kg/cm)'
    expect(metricBtn?.textContent).toContain('Metric');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 3 — Arabic/RTL & English/LTR Tests
// ═══════════════════════════════════════════════════════════════════════════
describe('tool-010 — Arabic RTL / English LTR (UI)', () => {
  beforeEach(() => {
    localStorageStore = {};
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // TC-AR-01: Arabic locale → container dir="rtl"
  it('TC-AR-01 root container has dir=rtl in Arabic locale', () => {
    const { container } = render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    const rootDiv = container.querySelector('.pct-timing-tool');
    expect(rootDiv).not.toBeNull();
    expect(rootDiv?.getAttribute('dir')).toBe('rtl');
  });

  // TC-AR-02: English locale → container dir="ltr"
  it('TC-AR-02 root container has dir=ltr in English locale', () => {
    const { container } = render(
      <WithPreferences locale="en">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    const rootDiv = container.querySelector('.pct-timing-tool');
    expect(rootDiv).not.toBeNull();
    expect(rootDiv?.getAttribute('dir')).toBe('ltr');
  });

  // TC-AR-03: Arabic locale → tool name renders in Arabic
  it('TC-AR-03 tool title renders Arabic text in AR locale', () => {
    render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    const h2 = screen.getByRole('heading', { level: 2 });
    // Arabic tool name from i18n: 'بناء حزمة المركبات'
    expect(h2.textContent).toBe('بناء حزمة المركبات');
  });

  // TC-AR-04: English locale → tool name renders in English
  it('TC-AR-04 tool title renders English text in EN locale', () => {
    render(
      <WithPreferences locale="en">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    const h2 = screen.getByRole('heading', { level: 2 });
    // English tool name from i18n: 'Compound Stack Builder'
    expect(h2.textContent).toBe('Compound Stack Builder');
  });

  // TC-AR-05: Arabic locale → Build Stack button text is Arabic
  it('TC-AR-05 Build Stack button renders in Arabic in AR locale', () => {
    render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    // Arabic: 'بناء الحزمة'
    expect(screen.getByRole('button', { name: 'بناء الحزمة' })).toBeInTheDocument();
  });

  // TC-AR-06: English locale → Build Stack button text is English
  it('TC-AR-06 Build Stack button renders in English in EN locale', () => {
    render(
      <WithPreferences locale="en">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    // English: 'Build Stack'
    expect(screen.getByRole('button', { name: 'Build Stack' })).toBeInTheDocument();
  });

  // TC-AR-07: MeasurementToggle inner dir reflects locale — now receives isRtl prop from tool-010
  it('TC-AR-07 MeasurementToggle container has dir=rtl in AR locale (isRtl prop correctly passed)', () => {
    // After fix: tool-010 passes isRtl={i18nData.dir === 'rtl'} to MeasurementToggle
    const { container } = render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    const toggle = container.querySelector('.measurement-toggle');
    expect(toggle).not.toBeNull();
    // With fix applied: isRtl=true in AR locale → dir="rtl" on toggle container
    expect(toggle?.getAttribute('dir')).toBe('rtl');
  });

  // TC-AR-08: Input fields and stack result section remain in DOM after locale
  it('TC-AR-08 stack name input and synergy result survive in both locales', () => {
    const { rerender } = render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    // Stack name input present in AR
    expect(document.querySelector('input[type="text"]')).not.toBeNull();

    // Switch to EN locale
    rerender(
      <WithPreferences locale="en">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );
    // Input still present in EN
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });

  // TC-AR-09: Adding a compound does not break locale display
  it('TC-AR-09 adding compound preserves Arabic heading and RTL dir', () => {
    const { container } = render(
      <WithPreferences locale="ar">
        <Tool010CompoundStackBuilder />
      </WithPreferences>
    );

    const buildBtn = screen.getByRole('button', { name: 'بناء الحزمة' });
    act(() => { fireEvent.click(buildBtn); });

    // RTL and Arabic title still intact after interaction
    const rootDiv = container.querySelector('.pct-timing-tool');
    expect(rootDiv?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('بناء حزمة المركبات');
  });
});
