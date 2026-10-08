/**
 * React Hooks for Tool State Management
 * MrXSteroid.com - Smart Tools Suite
 * Local-first: localStorage persistence with optional Supabase sync.
 */

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types (local definitions — no external DB dependency)
// ─────────────────────────────────────────────────────────────────────────────

export interface UserToolState {
  [key: string]: unknown;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// User Tool State (localStorage-backed)
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch user's tool state from localStorage */
export function useUserToolState(_userId: string) {
  const [data, setData] = useState<UserToolState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('mrx_tool_state') : null;
      setData(raw ? (JSON.parse(raw) as UserToolState) : null);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading };
}

/** Update user tool state (localStorage + optional Supabase sync) */
export function useUpdateToolState() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback((state: Partial<UserToolState>) => {
    setIsPending(true);
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('mrx_tool_state') : null;
      const prev: UserToolState = raw ? JSON.parse(raw) : {};
      const next: UserToolState = { ...prev, ...state, updated_at: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mrx_tool_state', JSON.stringify(next));
      }
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/** Debounce hook for delaying function execution */
export function useDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef(callback);
  
  // Update ref in useLayoutEffect to avoid render-time ref mutation
  useLayoutEffect(() => {
    cbRef.current = callback;
  });

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      cbRef.current(...args);
    }, delay);
  }, [delay]);
}

/** Fetch compound catalog (static fallback — DB integration optional) */
export function useCompounds() {
  return { data: null as null, isLoading: false };
}

/** Get guest tool state from localStorage (for non-logged-in users) */
export function useGuestState(): UserToolState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('mrx_tool_state');
    return raw ? (JSON.parse(raw) as UserToolState) : null;
  } catch {
    return null;
  }
}