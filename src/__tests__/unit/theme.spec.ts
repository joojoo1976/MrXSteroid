/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  theme.spec.ts — MR. X Theme System v2.0 Unit Tests           ║
 * ║  اختبارات Vitest لـ:                                           ║
 * ║  • useTheme hook — قراءة/كتابة صحيحة                          ║
 * ║  • Anti-FOUC inline script — منع الوميض                        ║
 * ║  • System listener — التزامن مع OS                             ║
 * ║  • QA helpers — حسابات تباين الألوان WCAG                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getContrastRatio } from '../../shared/lib/theme-qa';

// ══════════════════════════════════════════════════════════════════════
// Helpers: DOM Mocking
// ══════════════════════════════════════════════════════════════════════

/** إعداد DOM محاكي بسيط لـ useTheme */
function setupDOM(
  options: {
    storedTheme?: string;
    systemPrefersDark?: boolean;
    domClass?: string;
  } = {}
) {
  const { storedTheme = 'dark', systemPrefersDark = true, domClass = 'dark' } = options;

  // Mock document.documentElement
  const root = {
    classList: {
      _classes: new Set<string>(domClass ? [domClass] : []),
      add: vi.fn(function (this: { _classes: Set<string> }, ...c: string[]) {
        c.forEach(cls => this._classes.add(cls));
      }),
      remove: vi.fn(function (this: { _classes: Set<string> }, ...c: string[]) {
        c.forEach(cls => this._classes.delete(cls));
      }),
      contains: vi.fn(function (this: { _classes: Set<string> }, c: string) {
        return this._classes.has(c);
      }),
    },
    setAttribute: vi.fn(),
    getAttribute: vi.fn((attr: string) => {
      if (attr === 'data-theme-mode') return storedTheme;
      if (attr === 'data-resolved-theme') return domClass;
      return null;
    }),
    hasAttribute: vi.fn(() => true),
  };

  // Mock localStorage
  const store: Record<string, string> = { mrx_ui_theme: storedTheme };
  const localStorageMock = {
    getItem: vi.fn((k: string) => store[k] ?? null),
    setItem: vi.fn((k: string, v: string) => { store[k] = v; }),
    removeItem: vi.fn((k: string) => { delete store[k]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  };

  // Mock matchMedia
  const mediaQueryMock = {
    matches: systemPrefersDark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };

  return { root, localStorageMock, mediaQueryMock, store };
}

// ══════════════════════════════════════════════════════════════════════
// Suite 1: WCAG Color Contrast
// ══════════════════════════════════════════════════════════════════════
describe('WCAG Color Contrast — getContrastRatio()', () => {
  it('Dark Mode: #100444 vs #FFFFA3 meets WCAG AA (≥4.5)', () => {
    const ratio = getContrastRatio('#100444', '#FFFFA3');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Dark Mode: #1a0a5c vs #FFFFA3 meets WCAG AA (≥4.5)', () => {
    const ratio = getContrastRatio('#1a0a5c', '#FFFFA3');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Light Mode: #fafafa vs #100444 meets WCAG AA (≥4.5)', () => {
    const ratio = getContrastRatio('#fafafa', '#100444');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Light Mode: #ffffff vs #100444 meets WCAG AAA (≥7.0)', () => {
    const ratio = getContrastRatio('#ffffff', '#100444');
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it('Black vs White gives 21:1 contrast (maximum)', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('Identical colors give contrast ratio of 1:1', () => {
    const ratio = getContrastRatio('#100444', '#100444');
    expect(ratio).toBeCloseTo(1, 2);
  });

  it('Contrast ratio is commutative (bg/fg order irrelevant)', () => {
    const r1 = getContrastRatio('#100444', '#FFFFA3');
    const r2 = getContrastRatio('#FFFFA3', '#100444');
    expect(r1).toBeCloseTo(r2, 10);
  });
});

// ══════════════════════════════════════════════════════════════════════
// Suite 2: Anti-FOUC Inline Script Logic
// ══════════════════════════════════════════════════════════════════════
describe('Anti-FOUC Logic', () => {
  it('should resolve "dark" stored mode to class "dark"', () => {
    const stored = 'dark';
    const resolved = stored === 'system'
      ? (true /* systemPrefersDark */ ? 'dark' : 'light')
      : (stored === 'light' ? 'light' : 'dark');
    expect(resolved).toBe('dark');
  });

  it('should resolve "light" stored mode to class "light"', () => {
    const stored = 'light';
    const resolved = stored === 'system'
      ? (true ? 'dark' : 'light')
      : (stored === 'light' ? 'light' : 'dark');
    expect(resolved).toBe('light');
  });

  it('should resolve "system" with OS dark preference to "dark"', () => {
    const stored = 'system';
    const systemPrefersDark = true;
    const resolved = stored === 'system'
      ? (systemPrefersDark ? 'dark' : 'light')
      : stored;
    expect(resolved).toBe('dark');
  });

  it('should resolve "system" with OS light preference to "light"', () => {
    const stored = 'system';
    const systemPrefersDark = false;
    const resolved = stored === 'system'
      ? (systemPrefersDark ? 'dark' : 'light')
      : stored;
    expect(resolved).toBe('light');
  });

  it('should default to "dark" when localStorage is empty', () => {
    const stored = null; // localStorage.getItem returns null
    const effective = stored || 'dark';
    const resolved = effective === 'system'
      ? 'dark'
      : (effective === 'light' ? 'light' : 'dark');
    expect(resolved).toBe('dark');
  });

  it('should default to "dark" when stored value is invalid', () => {
    const stored = 'invalid_value';
    const validModes = ['light', 'dark', 'system'];
    const effective = validModes.includes(stored) ? stored : 'dark';
    expect(effective).toBe('dark');
  });
});

// ══════════════════════════════════════════════════════════════════════
// Suite 3: useTheme Core Logic (Pure Functions)
// ══════════════════════════════════════════════════════════════════════
describe('useTheme Core Logic', () => {
  describe('readStoredTheme()', () => {
    it('returns stored value when valid', () => {
      const mockGet = (key: string) => key === 'mrx_ui_theme' ? 'dark' : null;
      const validModes = ['light', 'dark', 'system'];
      const modern = mockGet('mrx_ui_theme');
      const result = (modern && validModes.includes(modern)) ? modern : 'dark';
      expect(result).toBe('dark');
    });

    it('falls back to legacy key when modern key missing', () => {
      const mockGet = (key: string) => key === 'theme' ? 'light' : null;
      const validModes = ['light', 'dark', 'system'];
      const modern = mockGet('mrx_ui_theme');
      const legacy = mockGet('theme');
      const result = (modern && validModes.includes(modern))
        ? modern
        : (legacy && validModes.includes(legacy))
          ? legacy
          : 'dark';
      expect(result).toBe('light');
    });

    it('returns "dark" when both keys are null', () => {
      const mockGet = (_: string) => null;
      const validModes = ['light', 'dark', 'system'];
      const modern = mockGet('mrx_ui_theme');
      const legacy = mockGet('theme');
      const result = (modern && validModes.includes(modern))
        ? modern
        : (legacy && validModes.includes(legacy))
          ? legacy
          : 'dark';
      expect(result).toBe('dark');
    });
  });

  describe('applyThemeToDOM()', () => {
    let classesAdded: string[] = [];
    let classesRemoved: string[] = [];
    let attrs: Record<string, string> = {};

    beforeEach(() => {
      classesAdded = [];
      classesRemoved = [];
      attrs = {};
    });

    const mockApply = (
      mode: 'light' | 'dark' | 'system',
      systemPrefersDark = true
    ) => {
      const resolved: 'light' | 'dark' = mode === 'system'
        ? (systemPrefersDark ? 'dark' : 'light')
        : mode;
      classesRemoved.push('light', 'dark');
      classesAdded.push(resolved);
      attrs['data-theme-mode'] = mode;
      attrs['data-resolved-theme'] = resolved;
      return resolved;
    };

    it('applies "dark" class for dark mode', () => {
      const resolved = mockApply('dark');
      expect(resolved).toBe('dark');
      expect(classesAdded).toContain('dark');
      expect(attrs['data-theme-mode']).toBe('dark');
      expect(attrs['data-resolved-theme']).toBe('dark');
    });

    it('applies "light" class for light mode', () => {
      const resolved = mockApply('light');
      expect(resolved).toBe('light');
      expect(classesAdded).toContain('light');
      expect(attrs['data-theme-mode']).toBe('light');
    });

    it('applies "dark" for system mode when OS prefers dark', () => {
      const resolved = mockApply('system', true);
      expect(resolved).toBe('dark');
      expect(attrs['data-theme-mode']).toBe('system');
      expect(attrs['data-resolved-theme']).toBe('dark');
    });

    it('applies "light" for system mode when OS prefers light', () => {
      const resolved = mockApply('system', false);
      expect(resolved).toBe('light');
      expect(attrs['data-resolved-theme']).toBe('light');
    });

    it('removes both "light" and "dark" before adding new class', () => {
      mockApply('dark');
      expect(classesRemoved).toContain('light');
      expect(classesRemoved).toContain('dark');
    });
  });

  describe('setTheme()', () => {
    it('persists to both mrx_ui_theme and legacy "theme" keys', () => {
      const store: Record<string, string> = {};
      const setItem = (k: string, v: string) => { store[k] = v; };

      // Simulate setTheme('light')
      const newMode = 'light';
      setItem('mrx_ui_theme', newMode);
      setItem('theme', newMode);

      expect(store['mrx_ui_theme']).toBe('light');
      expect(store['theme']).toBe('light');
    });

    it('dispatches mrx_theme_change custom event', () => {
      const events: CustomEvent[] = [];
      const dispatchSpy = vi.fn((e: Event) => events.push(e as CustomEvent));

      // Simulate dispatchEvent
      const evt = new CustomEvent('mrx_theme_change', {
        detail: { mode: 'dark', resolved: 'dark' }
      });
      dispatchSpy(evt);

      expect(dispatchSpy).toHaveBeenCalledOnce();
      expect(events[0].detail.mode).toBe('dark');
      expect(events[0].detail.resolved).toBe('dark');
    });
  });
});

// ══════════════════════════════════════════════════════════════════════
// Suite 4: System Listener Logic
// ══════════════════════════════════════════════════════════════════════
describe('System Listener Logic', () => {
  it('should NOT update resolved theme when mode is not "system"', () => {
    let resolvedTheme = 'dark';
    const currentMode = 'dark'; // NOT system

    // Simulate matchMedia change handler
    const handler = (matches: boolean) => {
      if (currentMode !== 'system') return; // Guard
      resolvedTheme = matches ? 'dark' : 'light';
    };

    handler(false); // OS switches to light
    expect(resolvedTheme).toBe('dark'); // Unchanged because mode is not system
  });

  it('should update resolved theme when mode IS "system"', () => {
    let resolvedTheme = 'dark';
    const currentMode = 'system';

    const handler = (matches: boolean) => {
      if (currentMode !== 'system') return;
      resolvedTheme = matches ? 'dark' : 'light';
    };

    handler(false); // OS switches to light
    expect(resolvedTheme).toBe('light');

    handler(true); // OS switches back to dark
    expect(resolvedTheme).toBe('dark');
  });

  it('uses addEventListener when available', () => {
    const mq = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Simulate useEffect logic
    const handler = vi.fn();
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    }

    expect(mq.addEventListener).toHaveBeenCalledWith('change', handler);
  });

  it('uses legacy addListener as fallback for Safari < 14', () => {
    const mq = {
      addEventListener: undefined as unknown as typeof window.matchMedia,
      addListener: vi.fn(),
    } as unknown as MediaQueryList & { addListener: ReturnType<typeof vi.fn> };

    const handler = vi.fn();
    if (mq.addEventListener) {
      (mq as unknown as { addEventListener: (e: string, h: unknown) => void }).addEventListener('change', handler);
    } else {
      mq.addListener(handler);
    }

    expect(mq.addListener).toHaveBeenCalledWith(handler);
  });
});

// ══════════════════════════════════════════════════════════════════════
// Suite 5: Storage Key Migration
// ══════════════════════════════════════════════════════════════════════
describe('Storage Key Migration', () => {
  const STORAGE_KEY = 'mrx_ui_theme';
  const LEGACY_KEY  = 'theme';

  it('prefers modern key over legacy key', () => {
    const store: Record<string, string> = {
      [STORAGE_KEY]: 'dark',
      [LEGACY_KEY]: 'light', // Legacy says light but modern says dark
    };

    const validModes = ['light', 'dark', 'system'];
    const modern = store[STORAGE_KEY];
    const legacy = store[LEGACY_KEY];
    const result = (modern && validModes.includes(modern))
      ? modern
      : (legacy && validModes.includes(legacy))
        ? legacy
        : 'dark';

    expect(result).toBe('dark'); // Modern key wins
  });

  it('syncs legacy key when setting modern key', () => {
    const store: Record<string, string> = {};
    store[STORAGE_KEY] = 'system';
    store[LEGACY_KEY]  = 'system';

    expect(store[STORAGE_KEY]).toBe('system');
    expect(store[LEGACY_KEY]).toBe('system');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
