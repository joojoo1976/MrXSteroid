/**
 * Header.tsx — Client Component.
 * Sticky glass header with Supabase session toggle and a cart indicator.
 * The cart count is a minimal local signal (no biometric data — ever).
 */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface SessionUser {
    email?: string;
}

export default function Header() {
    const [user, setUser] = useState<SessionUser | null>(null);

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data }) => {
            if (mounted) setUser(data.session?.user ?? null);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) setUser(session?.user ?? null);
        });
        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <header className="sticky top-0 z-40">
            <div className="glass-strong">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
                    <a href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
                        <span className="neon-text">MR</span>
                        <span className="text-white">.X</span>
                    </a>

                    <div className="hidden items-center gap-6 text-sm font-bold text-zinc-300 md:flex">
                        <a href="#calculator" className="transition-colors hover:text-[rgb(var(--neon-primary))]">BioCalc</a>
                        <a href="#protocol" className="transition-colors hover:text-[rgb(var(--neon-primary))]">Protocol</a>
                        <a href="#pricing" className="transition-colors hover:text-[rgb(var(--neon-primary))]">Pricing</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Cart"
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors hover:border-[rgb(var(--neon-primary))] hover:text-[rgb(var(--neon-primary))]"
                        >
                            🛒
                        </button>

                        {user ? (
                            <div className="flex items-center gap-2">
                                <span className="hidden max-w-[140px] truncate text-xs font-bold text-zinc-400 sm:block">
                                    {user.email}
                                </span>
                                <button
                                    type="button"
                                    onClick={signOut}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-zinc-200 transition-colors hover:text-[rgb(var(--neon-primary))]"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <a
                                href="#cta"
                                className="rounded-xl bg-[rgb(var(--neon-primary))] px-4 py-2 text-xs font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.03]"
                            >
                                Sign in
                            </a>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
