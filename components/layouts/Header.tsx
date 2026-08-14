/**
 * Header.tsx — Client Component.
 * Sticky glass header with Supabase session toggle, Exclusive Resources dropdown menu, and a cart indicator.
 */
'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Trophy, Activity, Flame } from 'lucide-react';
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
        <header className="sticky top-0 z-50">
            <div className="glass-strong border-b border-white/10 bg-black/80 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
                    <a href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
                        <span className="neon-text">MR</span>
                        <span className="text-white">.X</span>
                    </a>

                    <div className="hidden items-center gap-6 text-sm font-bold text-zinc-300 md:flex">
                        <a href="/" className="transition-colors hover:text-[rgb(var(--neon-primary))]">
                            الرئيسية
                        </a>

                        {/* Exclusive Resources Dropdown Menu */}
                        <div className="relative group py-2">
                            <button
                                type="button"
                                className="flex items-center gap-1.5 transition-colors hover:text-[rgb(var(--neon-primary))] text-gold-400 font-black cursor-pointer"
                            >
                                <span>الموارد الحصرية (Exclusive Resources)</span>
                                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-gold-400" />
                            </button>

                            {/* Dropdown Menu Card */}
                            <div className="absolute top-full right-0 mt-1 w-64 rounded-2xl bg-zinc-950/95 border border-gold-500/30 p-2 shadow-2xl backdrop-blur-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <a
                                    href="/TransformationTimeline"
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gold-500/10 hover:border-gold-500/30 text-white transition-all group/item border border-transparent"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gold-500/15 text-gold-400 flex items-center justify-center shrink-0">
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-white group-hover/item:text-gold-400">
                                            Transformation Timeline
                                        </span>
                                        <span className="block text-[10px] text-zinc-400 font-bold">
                                            الجدول الزمني للتحول الجسدي
                                        </span>
                                    </div>
                                </a>

                                <a
                                    href="/macro"
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 text-zinc-300 transition-all border border-transparent"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-white">Macro Calculator</span>
                                        <span className="block text-[10px] text-zinc-400 font-bold">حاسبة الماكروز المتطورة</span>
                                    </div>
                                </a>

                                <a
                                    href="/lab"
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 text-zinc-300 transition-all border border-transparent"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-white">Smart Lab Reference</span>
                                        <span className="block text-[10px] text-zinc-400 font-bold">المرجع الذكي للتحاليل</span>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <a href="#pricing" className="transition-colors hover:text-[rgb(var(--neon-primary))]">
                            الأسعار والخطط
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
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
