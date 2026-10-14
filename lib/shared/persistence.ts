// lib/shared/persistence.ts
/**
 * lib/shared/persistence.ts
 * Unified Local Persistence Service for SmartTools
 * localStorage-only (Supabase/RLS: NOT_CONFIGURED)
 */

export type UnitSystem = 'metric' | 'imperial';
export type Locale = 'ar' | 'en';

/** Storage key prefix */
const STORAGE_PREFIX = 'mrx:tool';

/** Draft schema version for versioning */
export const DRAFT_SCHEMA_VERSION = 1;

/** Debounce delay for auto-save (ms) */
export const AUTO_SAVE_DEBOUNCE_MS = 1500;

/** User tool state shape */
export interface UserToolState {
  [key: string]: unknown;
  updated_at?: string;
}

/** Draft state with versioning */
export interface ToolDraft<TInputs> {
  version: number;
  toolSlug: string;
  toolVersion: string;
  savedAt: string;
  locale: Locale;
  unitSystem: UnitSystem;
  inputs: TInputs;
}

/**
 * Storage interface for abstraction (allows mocking in tests)
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Get browser localStorage or null during SSR */
export function getBrowserStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined') return null;
    const storage = window.localStorage as StorageLike | undefined;
    return storage && typeof storage.getItem === 'function' ? storage : null;
  } catch {
    return null;
  }
}

/** Generate versioned storage key */
export function getStorageKey(toolSlug: string, type: 'state' | 'draft' = 'state'): string {
  return `${STORAGE_PREFIX}:${type}:${toolSlug}`;
}

/**
 * Local-first persistence service
 * All operations are localStorage-only, no Supabase sync
 */
export const persistence = {
  /**
   * Get tool state from localStorage
   */
  get: <T>(toolSlug: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(getStorageKey(toolSlug, 'state'));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  /**
   * Set tool state in localStorage with timestamp
   */
  set: <T>(toolSlug: string, data: Partial<T>): void => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(getStorageKey(toolSlug, 'state'));
      const prev: UserToolState = raw ? JSON.parse(raw) : {};
      const next: UserToolState = { 
        ...prev, 
        ...data, 
        updated_at: new Date().toISOString() 
      };
      localStorage.setItem(getStorageKey(toolSlug, 'state'), JSON.stringify(next));
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  },

  /**
   * Get draft state from localStorage
   */
  getDraft: <TInputs>(toolSlug: string): ToolDraft<TInputs> | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(getStorageKey(toolSlug, 'draft'));
      return raw ? (JSON.parse(raw) as ToolDraft<TInputs>) : null;
    } catch {
      return null;
    }
  },

  /**
   * Save draft state to localStorage with versioning
   */
  setDraft: <TInputs>(
    toolSlug: string,
    data: TInputs,
    options: {
      toolVersion: string;
      locale: 'ar' | 'en';
      unitSystem: 'metric' | 'imperial';
    }
  ): void => {
    if (typeof window === 'undefined') return;
    try {
      const draft: ToolDraft<TInputs> = {
        version: 1,
        toolSlug,
        toolVersion: options.toolVersion,
        savedAt: new Date().toISOString(),
        locale: options.locale,
        unitSystem: options.unitSystem,
        inputs: data,
      };
      localStorage.setItem(getStorageKey(toolSlug, 'draft'), JSON.stringify(draft));
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Clear draft for a tool
   */
  clearDraft: (toolSlug: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(getStorageKey(toolSlug, 'draft'));
    } catch {
      // Ignore
    }
  },

  /**
   * Clear all state for a tool
   */
  clear: (toolSlug: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(getStorageKey(toolSlug, 'state'));
      localStorage.removeItem(getStorageKey(toolSlug, 'draft'));
    } catch {
      // Ignore
    }
  },

  /**
   * Check if storage is available
   */
  isAvailable: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
} as const;

/**
 * Debounce hook for delaying function execution
 * Used for auto-save functionality
 */
export function useDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  // This is a placeholder - actual implementation is in lib/hooks/useToolState.ts
  // The shared version will be created when we extract the hook
  return callback;
}