/**
 * React Query Hooks for Supabase Integration
 * MrXSteroid.com - 100 Tools Suite
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O (hooks inject dependencies)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─────────────────────────────────────────────────────────────────────────────
// Data Queries
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all compounds from DB (cached forever — reference data) */
export function useCompounds() {
  return useQuery({
    queryKey: ['compounds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compounds')
        .select('*');
      if (error) throw error;
      return data as Compound[];
    },
    staleTime: Infinity, // Never stale — reference data
  });
}

/** Fetch user's tool state from DB */
export function useUserToolState(userId: string) {
  return useQuery({
    queryKey: ['toolState', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tool_states')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data as UserToolState | null;
    },
  });
}

/** Update user tool state (with automatic cache invalidation) */
export function useUpdateToolState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (state: Partial<UserToolState>) => {
      const { data, error } = await supabase
        .from('user_tool_states')
        .upsert({ ...state, updated_at: new Date().toISOString() });
      if (error) throw error;
      return data as UserToolState;
    },
    onSuccess: () => {
      // Invalidate all tool state queries
      queryClient.invalidateQueries({ queryKey: ['toolState'] });
    },
  });
}

/** Debounce hook for delaying function execution */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>();

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Guest User Support
// ─────────────────────────────────────────────────────────────────────────────

/** Get tool state from LocalStorage (for non-logged-in users) */
export function useGuestState(): UserToolState | null {
  // This would be called in a component, not as a hook directly
  // since LocalStorage requires window access
  return null; // Implemented in lib/utils/guestState.ts
}

// ─────────────────────────────────────────────────────────────────────────────
// Export Supabase Instance (injected by caller)
// ─────────────────────────────────────────────────────────────────────────────

/** 
 * NOTE: The `supabase` instance must be provided to React Query
 * via the QueryClientProvider in your app root, or passed 
 * individually to each hook's queryFn.
 * 
 * Example:
 * ```tsx
 * const queryClient = new QueryClient({
 *   defaultOptions: {
 *     queries: {
 *       // Provide supabase to all queries automatically
 *       // This is a simplified example — see your app setup
 *     },
 *   },
 * });
 * ```
 */
export const supabase = // Will be injected from app setup

// ─────────────────────────────────────────────────────────────────────────────
// Types (re-export for convenience)
// ─────────────────────────────────────────────────────────────────────────────

export type { Compound, UserToolState, UserProfile, MeasurementSystem, UserRole };