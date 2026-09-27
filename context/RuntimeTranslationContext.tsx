'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  context/RuntimeTranslationContext.tsx — T3 integration
 *
 *  State and capability contract for L2 inline runtime translation.
 *
 *  This is a SEPARATE concern from L1. `usePreferences().language` is the
 *  protected `Language` enum (ar | en) and drives the human-authored
 *  dictionaries plus the URL prefix. The runtime target tracked here is
 *  deliberately independent of it: choosing French must never write the
 *  language enum, must never move the URL, and must never alter what L1 renders.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createContext, useContext } from 'react';
import type { SelectableTarget, TranslateApiError } from '@/lib/translation/api';
import type { TranslationCacheIdentity } from '@/lib/translation/cache';

export type RuntimeTranslationStatus =
    /** Not applicable: the L1 experience is Arabic, where L2 must not run. */
    | 'inactive'
    /** Capability has not been checked yet. */
    | 'loading'
    /** Provider-verified targets are available. */
    | 'ready'
    /** The route answered 503: no provider, or capability could not be established. */
    | 'unavailable'
    /** The endpoint is rate limited or a quota was exhausted. */
    | 'limited'
    /** Any other failure. */
    | 'error';

export type RuntimeTranslationState = {
    readonly status: RuntimeTranslationStatus;
    /** Only ever provider-verified targets. Empty when status !== 'ready'. */
    readonly targets: readonly SelectableTarget[];
    /** The failure behind a non-ready status. Never synthesised for a ready list. */
    readonly error: TranslateApiError | null;
    /** Chosen runtime target, or null for the canonical English original. */
    readonly target: string | null;
    setTarget(code: string | null): void;
    /** Identity of the most recent successful translation, folded into cache keys (§33). */
    readonly identity: TranslationCacheIdentity | null;
    /** L2 is only ever active for the English L1 experience. */
    readonly isActive: boolean;
    /** Re-runs the capability check. */
    refresh(): void;
};

export const RuntimeTranslationContext = createContext<RuntimeTranslationState | undefined>(undefined);

export function useRuntimeTranslation(): RuntimeTranslationState {
    const context = useContext(RuntimeTranslationContext);
    if (!context) {
        throw new Error('useRuntimeTranslation must be used within a RuntimeTranslationProvider');
    }
    return context;
}
