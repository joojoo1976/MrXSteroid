/**
 * LegacyHeader — minimal sticky header for restored legacy pages.
 * Uses the shared navigateTo adapter so links follow App Router navigation.
 */
'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import { Page, Language } from '@/shared/types/types';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS: { label: string; page: Page }[] = [
    { label: 'Calculators', page: Page.MACRO },
    { label: 'Timeline', page: Page.TIMELINE },
    { label: 'Lab', page: Page.LAB },
    { label: 'About', page: Page.ABOUT },
    { label: 'FAQ', page: Page.FAQ },
    { label: 'Contact', page: Page.CONTACT },
];

interface LegacyHeaderProps {
    navigateTo: (page: Page) => void;
}

export default function LegacyHeader({ navigateTo }: LegacyHeaderProps) {
    const { language, setLanguage, isRTL } = usePreferences();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const toggleLang = () => setLanguage(language === Language.AR ? Language.EN : Language.AR);

    return (
        <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                <button
                    type="button"
                    onClick={() => navigateTo(Page.HOME)}
                    className="flex items-center gap-2 text-lg font-black tracking-tight"
                >
                    <span className="neon-text">MR</span>
                    <span className="text-white">.X</span>
                </button>

                <nav className="hidden items-center gap-6 text-sm font-bold text-zinc-300 md:flex">
                    {NAV_LINKS.map((l) => (
                        <button
                            key={l.page}
                            type="button"
                            onClick={() => navigateTo(l.page)}
                            className="transition-colors hover:text-[rgb(var(--neon-primary))]"
                        >
                            {l.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleLang}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-300 transition-colors hover:border-[rgb(var(--neon-primary))]"
                    >
                        {isRTL ? 'EN' : 'عربي'}
                    </button>
                    {user ? (
                        <button
                            type="button"
                            onClick={() => navigateTo(Page.DASHBOARD)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-300 transition-colors hover:border-[rgb(var(--neon-primary))]"
                        >
                            Dashboard
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigateTo(Page.LOGIN)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-300 transition-colors hover:border-[rgb(var(--neon-primary))]"
                        >
                            Login
                        </button>
                    )}
                    <button
                        type="button"
                        aria-label="Menu"
                        onClick={() => setMobileOpen((v) => !v)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-300 md:hidden"
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <nav className="border-t border-white/10 px-4 py-3 md:hidden">
                    {NAV_LINKS.map((l) => (
                        <button
                            key={l.page}
                            type="button"
                            onClick={() => {
                                navigateTo(l.page);
                                setMobileOpen(false);
                            }}
                            className="block w-full py-2 text-left text-sm font-bold text-zinc-300"
                        >
                            {l.label}
                        </button>
                    ))}
                </nav>
            )}
        </header>
    );
}
