'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  shared/ui/RuntimeLanguageSelector.tsx — T3 integration
 *
 *  Selector for the L2 inline runtime translation target.
 *
 *  This is NOT the site's language switcher. L1 language (English / Arabic) is
 *  chosen by the existing globe control in GlobalHeader and by PreferencesModal,
 *  and this component neither reads nor writes that state. It only picks the
 *  machine-translation target for the marked inline surfaces described in
 *  lib/translation/scanner.ts.
 *
 *  ── The rule this component exists to satisfy ──────────────────────────────
 *  A provider or configuration failure must NEVER look like "no languages".
 *  When the route answers 503 the selector renders the reason and the distinct
 *  code, and offers no language choices at all. An empty dropdown is only ever
 *  shown for a genuine, verified empty list — which the route itself refuses to
 *  produce, so in practice an empty state also reports itself as a fault.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef, useState } from 'react';
import { Check, Globe, Loader2, TriangleAlert } from 'lucide-react';
import { useRuntimeTranslation } from '@/context/RuntimeTranslationContext';

const STATUS_COPY: Record<string, { title: string; detail: string }> = {
    PROVIDER_NOT_CONFIGURED: {
        title: 'Machine translation unavailable',
        detail: 'No translation provider is configured for this deployment.',
    },
    PROVIDER_CAPABILITY_UNAVAILABLE: {
        title: 'Machine translation unavailable',
        detail: 'Language availability could not be confirmed with the provider.',
    },
    RATE_LIMITED: {
        title: 'Machine translation paused',
        detail: 'Too many requests. Try again shortly.',
    },
    TARGET_QUOTA_EXCEEDED: {
        title: 'Machine translation paused',
        detail: 'Too many languages requested at once. Try again shortly.',
    },
    CHARACTER_QUOTA_EXCEEDED: {
        title: 'Machine translation paused',
        detail: 'The request was too large. Try again shortly.',
    },
};

export const RuntimeLanguageSelector: React.FC = () => {
    const { status, targets, error, target, setTarget } = useRuntimeTranslation();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    // Arabic is human-authored and canonical: there is nothing for L2 to do.
    if (status === 'inactive') {
        return (
            <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase text-zinc-400"
                title="This page is already human-authored Arabic. Machine translation applies to the English experience."
                data-testid="runtime-selector-inactive"
            >
                <Globe className="w-3.5 h-3.5" />
                <span>EN content</span>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase text-zinc-400"
                data-testid="runtime-selector-loading"
            >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking</span>
            </div>
        );
    }

    // Every non-ready state renders its reason. No dropdown, so a fault can
    // never be misread as an empty list of languages.
    if (status !== 'ready') {
        const copy = (error && STATUS_COPY[error.code]) || {
            title: 'Machine translation unavailable',
            detail: error?.message ?? 'Language availability could not be established.',
        };
        return (
            <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-black uppercase text-amber-700 dark:text-amber-400"
                title={`${copy.detail} (${error?.code ?? 'UNKNOWN'})`}
                data-testid="runtime-selector-unavailable"
                data-error-code={error?.code ?? 'UNKNOWN'}
            >
                <TriangleAlert className="w-3.5 h-3.5" />
                <span>{copy.title}</span>
            </div>
        );
    }

    // A ready response with no verified target should be impossible: the route
    // answers 503 rather than an empty list. Treat it as a fault regardless.
    if (targets.length === 0) {
        return (
            <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-xl border border-amber-300 dark:border-amber-700 text-[11px] font-black uppercase text-amber-700 dark:text-amber-400"
                data-testid="runtime-selector-unavailable"
                data-error-code="NO_VERIFIED_TARGETS"
            >
                <TriangleAlert className="w-3.5 h-3.5" />
                <span>No languages</span>
            </div>
        );
    }

    const active = target ? targets.find((entry) => entry.code === target) : undefined;

    return (
        <div className="relative hidden sm:block" ref={containerRef} data-testid="runtime-selector">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex items-center justify-center gap-1 px-2.5 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-[11px] font-black uppercase text-gold-500"
                title="Machine-translate marked content on this page"
            >
                <Globe className="w-3.5 h-3.5" />
                <span data-testid="runtime-selector-value">{active ? active.code.toUpperCase() : 'OFF'}</span>
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl"
                >
                    <li>
                        <button
                            type="button"
                            role="option"
                            aria-selected={target === null}
                            onClick={() => {
                                setTarget(null);
                                setOpen(false);
                            }}
                            className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <span>English (original)</span>
                            {target === null && <Check className="w-3.5 h-3.5 text-gold-500" />}
                        </button>
                    </li>
                    {targets.map((entry) => (
                        <li key={entry.code}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={entry.code === target}
                                onClick={() => {
                                    setTarget(entry.code);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <span>
                                    {entry.nativeName}
                                    <span className="ml-1.5 text-[10px] font-medium uppercase text-zinc-400">
                                        {entry.code}
                                    </span>
                                </span>
                                {entry.code === target && <Check className="w-3.5 h-3.5 text-gold-500" />}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RuntimeLanguageSelector;
