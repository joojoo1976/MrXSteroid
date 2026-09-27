'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  context/RuntimeTranslationProvider.tsx — T3 integration
 *
 *  Owns the client lifecycle for L2 inline runtime translation:
 *    · asks GET /api/translate which targets the provider has verified
 *    · exposes 503 and rate-limit states EXPLICITLY, never as an empty list
 *    · runs the L2 scanner for the chosen target and restores English on clear
 *
 *  ── The English-only gate (this is the important part) ──────────────────────
 *  §3 makes English the sole permitted runtime translation SOURCE. The L1
 *  experience renders either English or human-authored Arabic. If L2 ran while
 *  the page was in Arabic it would feed Arabic prose to the provider as though
 *  it were English and produce garbage — and Arabic is a canonical language that
 *  must never be a machine-translation target at all. So L2 activates only when
 *  `usePreferences().language` is English; in Arabic the scanner never runs and
 *  every marked node is left exactly as L1 rendered it.
 *
 *  ── Fail-closed states ──────────────────────────────────────────────────────
 *  · `unavailable`  — the route answered 503. `PROVIDER_NOT_CONFIGURED` and
 *    `PROVIDER_CAPABILITY_UNAVAILABLE` stay distinct all the way to the UI.
 *  · `limited`      — 429 from the rate limit or a quota.
 *  · `error`        — anything else, including transport failure.
 *  In every one of those states `targets` is empty AND the UI must render the
 *  reason. A provider outage is never presented as "no languages available".
 *
 *  ── Capability is re-checked before every cache read ───────────────────────
 *  A cached translation is only served when the requested target is still in
 *  the verified set. Caching therefore cannot be used to reach a language the
 *  provider has stopped serving.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePreferences } from './PreferencesContext';
import { Language } from '@/shared/types/types';
import { RUNTIME_SOURCE_LANGUAGE, type TranslationSurface } from '@/server/translation/contracts';
import {
    fetchSelectableTargets,
    translateText,
    type ApiResult,
    type SelectableTarget,
    type TranslateApiError,
} from '@/lib/translation/api';
import {
    englishSourceKey,
    runtimeTranslationCache,
    sameTranslationIdentity,
    type TranslationCacheIdentity,
} from '@/lib/translation/cache';
import { createL2Scanner, L2_DEFAULT_MAX_REQUESTS, type L2TranslateFn } from '@/lib/translation/scanner';
import { RuntimeTranslationContext, type RuntimeTranslationStatus } from './RuntimeTranslationContext';

/** House convention: `mrx_`-prefixed client preference keys. */
export const RUNTIME_TARGET_STORAGE_KEY = 'mrx_runtime_translation_target';

function classify(error: TranslateApiError): RuntimeTranslationStatus {
    if (error.status === 503) return 'unavailable';
    if (error.status === 429) return 'limited';
    return 'error';
}

function readStoredTarget(): string | null {
    try {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem(RUNTIME_TARGET_STORAGE_KEY);
    } catch {
        return null;
    }
}

function writeStoredTarget(code: string | null): void {
    try {
        if (typeof window === 'undefined') return;
        if (code === null) window.localStorage.removeItem(RUNTIME_TARGET_STORAGE_KEY);
        else window.localStorage.setItem(RUNTIME_TARGET_STORAGE_KEY, code);
    } catch {
        /* storage unavailable — an in-memory choice still applies for this session */
    }
}

export const RuntimeTranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { language } = usePreferences();

    // L2 translates the English canonical source only.
    const isEnglishExperience = language === Language.EN;

    const [status, setStatus] = useState<RuntimeTranslationStatus>(isEnglishExperience ? 'loading' : 'inactive');
    const [targets, setTargets] = useState<readonly SelectableTarget[]>([]);
    const [error, setError] = useState<TranslateApiError | null>(null);
    const [target, setTargetState] = useState<string | null>(null);
    const [identity, setIdentity] = useState<TranslationCacheIdentity | null>(null);
    /**
     * The identity is ALSO held in a ref. Cache keying needs the latest value on
     * every request, but re-running the scan effect whenever it changes would
     * discard the previous scanner's restore list and leave the document holding
     * machine text with no way back to English. The ref keeps keying correct
     * without making identity a scan trigger.
     */
    const identityRef = useRef<TranslationCacheIdentity | null>(null);
    const [refreshToken, setRefreshToken] = useState(0);

    const scannerRef = useRef<ReturnType<typeof createL2Scanner> | null>(null);

    // Leaving the English experience (or unmounting) must give the document its
    // English back, so the scanner is always restored rather than left applied.
    const restoreDocument = useCallback(() => {
        scannerRef.current?.restore();
        scannerRef.current = null;
    }, []);

    // ── Capability discovery ──────────────────────────────────────────────────
    useEffect(() => {
        if (!isEnglishExperience) {
            restoreDocument();
            setStatus('inactive');
            setTargets([]);
            setError(null);
            return;
        }

        let cancelled = false;
        setStatus('loading');
        setError(null);

        void (async () => {
            const result = await fetchSelectableTargets();
            if (cancelled) return;

            if (result.ok) {
                setTargets(result.data.languages);
                setError(null);
                setStatus('ready');
                return;
            }

            // Fail closed: the reason is preserved and the list stays empty. The
            // two 503 codes remain distinguishable.
            setTargets([]);
            setError(result.error);
            setStatus(classify(result.error));
        })();

        return () => {
            cancelled = true;
        };
    }, [isEnglishExperience, refreshToken, restoreDocument]);

    // A stored target is a preference, never an authorisation: it is adopted
    // only once the provider has confirmed that language.
    useEffect(() => {
        if (status !== 'ready') {
            if (status === 'inactive' || status === 'unavailable' || status === 'error') {
                setTargetState(null);
                restoreDocument();
            }
            return;
        }
        const stored = readStoredTarget();
        if (stored && targets.some((entry) => entry.code === stored)) {
            setTargetState(stored);
            return;
        }
        // Stale or absent preference.
        setTargetState(null);
    }, [status, targets, restoreDocument]);

    const setTarget = useCallback(
        (code: string | null) => {
            // `next` is derived from the current value in the closure, so no side
            // effect ever lives inside a state updater (React may invoke one more
            // than once) and persistence happens exactly once per user action.
            const next = target === code ? null : code;
            setTargetState(next);
            writeStoredTarget(next);
            restoreDocument();
        },
        [target, restoreDocument]
    );

    // An unverified or no-longer-available target is dropped rather than kept.
    // This is a transient guard, so it deliberately does not persist.
    useEffect(() => {
        if (target === null) return;
        if (status !== 'ready' || !targets.some((entry) => entry.code === target)) {
            setTargetState(null);
            restoreDocument();
        }
    }, [target, status, targets, restoreDocument]);

    // ── L2 scan for the selected target ───────────────────────────────────────
    useEffect(() => {
        if (!isEnglishExperience || status !== 'ready' || target === null) {
            restoreDocument();
            return;
        }
        if (!targets.some((entry) => entry.code === target)) {
            restoreDocument();
            return;
        }
        if (typeof document === 'undefined') return;

        const translate: L2TranslateFn = async (text, surface: TranslationSurface) => {
            // Capability is re-checked here: a cached entry is only usable while
            // the target is still in the verified set.
            if (!targets.some((entry) => entry.code === target)) {
                return { ok: false, code: 'PROVIDER_UNSUPPORTED', retryable: false };
            }

            const currentIdentity = identityRef.current;
            const key = currentIdentity ? englishSourceKey(target, text, currentIdentity) : null;

            if (key) {
                const cached = runtimeTranslationCache.get(key);
                if (cached && cached.length > 0) {
                    return { ok: true, text: cached[0], fromCache: true };
                }
            }

            const result = await translateText({
                sourceLanguage: RUNTIME_SOURCE_LANGUAGE,
                targetLanguage: target,
                sourceText: text,
                surface,
            });

            if (!result.ok) {
                return { ok: false, code: result.error.code, retryable: result.error.retryable };
            }

            if (!sameTranslationIdentity(identityRef.current, result.data.identity)) {
                identityRef.current = result.data.identity;
                setIdentity(result.data.identity);
            }

            // Stored under the identity the response actually carried, never under
            // a guessed or previously seen one.
            runtimeTranslationCache.set(
                englishSourceKey(target, text, result.data.identity),
                result.data.translations
            );
            return { ok: true, text: result.data.translations[0] };
        };

        const scanner = createL2Scanner({
            root: document.body,
            target,
            translate,
            maxRequests: L2_DEFAULT_MAX_REQUESTS,
        });
        scannerRef.current = scanner;

        void scanner.scan().then((report) => {
            if (report.failure) {
                // A failed translation leaves the canonical English in place; the
                // condition is surfaced rather than hidden behind partial text.
                if (report.failure.code === 'RATE_LIMITED' || report.failure.code === 'TARGET_QUOTA_EXCEEDED') {
                    setStatus('limited');
                } else if (report.failure.code === 'PROVIDER_NOT_CONFIGURED' || report.failure.code === 'PROVIDER_CAPABILITY_UNAVAILABLE') {
                    setStatus('unavailable');
                }
            }
        });

        return () => {
            // Every re-run and every unmount must give the document its English
            // back, otherwise machine text is left behind with its restore list
            // already discarded.
            scanner.restore();
            scannerRef.current = null;
        };
    }, [isEnglishExperience, status, target, targets, restoreDocument]);

    useEffect(() => restoreDocument, [restoreDocument]);

    const value = useMemo(
        () => ({
            status,
            targets,
            error,
            target,
            setTarget,
            identity,
            isActive: isEnglishExperience && status === 'ready' && target !== null,
            refresh: () => setRefreshToken((token) => token + 1),
        }),
        [status, targets, error, target, setTarget, identity, isEnglishExperience]
    );

    return <RuntimeTranslationContext.Provider value={value}>{children}</RuntimeTranslationContext.Provider>;
};

export type { ApiResult };
