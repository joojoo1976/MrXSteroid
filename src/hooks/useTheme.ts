/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  useTheme.ts — MR. X Theme System v2.0                        ║
 * ║  Custom hook مركزي لإدارة الثيم الثلاثي (Light/Dark/System)   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ────────────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface UseThemeReturn {
  /** الخيار الذي اختاره المستخدم صراحةً */
  theme: ThemeMode;
  /** الثيم المطبق فعلياً بعد حسم system */
  resolvedTheme: ResolvedTheme;
  /** تغيير الثيم وحفظه فوراً */
  setTheme: (mode: ThemeMode) => void;
  /** هل الثيم محمّل؟ (لمنع Hydration mismatch) */
  isThemeLoaded: boolean;
}

// ── Storage keys ─────────────────────────────────────────────────────
const STORAGE_KEY = 'mrx_ui_theme';
const LEGACY_KEY  = 'theme';

// ── Helpers ──────────────────────────────────────────────────────────
function readStoredTheme(): ThemeMode {
  try {
    const modern = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (modern && ['light', 'dark', 'system'].includes(modern)) return modern;
    const legacy = localStorage.getItem(LEGACY_KEY) as ThemeMode | null;
    if (legacy && ['light', 'dark', 'system'].includes(legacy)) return legacy;
  } catch { /* localStorage blocked */ }
  return 'dark';
}

function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDOM(mode: ThemeMode): ResolvedTheme {
  const root = document.documentElement;
  const resolved: ResolvedTheme = mode === 'system' ? resolveSystemTheme() : mode;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.setAttribute('data-theme-mode', mode);
  root.setAttribute('data-resolved-theme', resolved);
  return resolved;
}

// ── Main Hook ────────────────────────────────────────────────────────
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState]           = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Ref يتتبع الوضع الحالي بدون إعادة تسجيل الـ listener
  const currentModeRef = useRef<ThemeMode>('dark');
  currentModeRef.current = theme;

  // ── الإعداد الأولي (يتزامن مع Anti-FOUC script) ─────────────────
  useEffect(() => {
    const stored   = readStoredTheme();
    const resolved = applyThemeToDOM(stored);
    setThemeState(stored);
    setResolvedTheme(resolved);
    setIsThemeLoaded(true);
  }, []);

  // ── System Mode Listener — مزامنة حية مع OS ──────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      if (currentModeRef.current !== 'system') return;
      const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newResolved);
      root.setAttribute('data-resolved-theme', newResolved);
      setResolvedTheme(newResolved);
    };

    // دعم المتصفحات القديمة (Safari < 14) والحديثة
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else {
      (mq as MediaQueryList & { addListener: (fn: (e: MediaQueryListEvent) => void) => void }).addListener(handler);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler);
      } else {
        (mq as MediaQueryList & { removeListener: (fn: (e: MediaQueryListEvent) => void) => void }).removeListener(handler);
      }
    };
  }, []);

  // ── Setter — يحدث الحالة وDOM وStorage بشكل متزامن ──────────────
  const setTheme = useCallback((newMode: ThemeMode) => {
    const newResolved = applyThemeToDOM(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
      localStorage.setItem(LEGACY_KEY,  newMode);
    } catch { /* localStorage blocked */ }
    setThemeState(newMode);
    setResolvedTheme(newResolved);
    // Custom event للمكونات الأخرى
    window.dispatchEvent(new CustomEvent('mrx_theme_change', {
      detail: { mode: newMode, resolved: newResolved }
    }));
  }, []);

  return { theme, resolvedTheme, setTheme, isThemeLoaded };
}
