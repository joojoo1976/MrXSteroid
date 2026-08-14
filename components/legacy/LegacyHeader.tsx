/**
 * LegacyHeader — minimal sticky header for restored legacy pages.
 * Uses the shared navigateTo adapter so links follow App Router navigation.
 */
'use client';

import React from 'react';
import { Menu, X, ChevronDown, Trophy, Activity, Flame } from 'lucide-react';
import { Page, Language } from '@/shared/types/types';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';

interface LegacyHeaderProps {
    navigateTo: (page: Page) => void;
}

export default function LegacyHeader({ navigateTo }: LegacyHeaderProps) {
    const { language, setLanguage, isRTL } = usePreferences();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const toggleLang = () => setLanguage(language === Language.AR ? Language.EN : Language.AR);

    return (
        <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
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
                    <button
                        type="button"
                        onClick={() => navigateTo(Page.HOME)}
                        className="transition-colors hover:text-[rgb(var(--neon-primary))]"
                    >
                        {isRTL ? 'الرئيسية' : 'Home'}
                    </button>

                    {/* Exclusive Resources Dropdown Menu */}
                    <div className="relative group py-2">
                        <button
                            type="button"
                            className="flex items-center gap-1.5 transition-colors hover:text-[rgb(var(--neon-primary))] text-gold-400 font-black cursor-pointer"
                        >
                            <span>{isRTL ? 'الموارد الحصرية' : 'Exclusive Resources'}</span>
                            <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-gold-400" />
                        </button>

                        {/* Dropdown Menu Card */}
                        <div className="absolute top-full left-0 mt-1 w-64 rounded-2xl bg-zinc-950/95 border border-gold-500/30 p-2 shadow-2xl backdrop-blur-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <button
                                type="button"
                                onClick={() => navigateTo(Page.TIMELINE)}
                                className="w-full text-start flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gold-500/10 hover:border-gold-500/30 text-white transition-all group/item border border-transparent"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gold-500/15 text-gold-400 flex items-center justify-center shrink-0">
                                    <Trophy className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block text-xs font-black text-white group-hover/item:text-gold-400">
                                        {isRTL ? 'الجدول الزمني للتحول الجسدي' : 'Transformation Timeline'}
                                    </span>
                                    <span className="block text-[10px] text-zinc-400 font-bold">
                                        {isRTL ? 'محرك التوقع الحي المتطور' : 'Live Prediction Engine'}
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigateTo(Page.MACRO)}
                                className="w-full text-start flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 text-zinc-300 transition-all border border-transparent"
                            >
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                                    <Flame className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block text-xs font-black text-white">
                                        {isRTL ? 'حاسبة الماكروز المتطورة' : 'Macro Calculator'}
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigateTo(Page.LAB)}
                                className="w-full text-start flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 text-zinc-300 transition-all border border-transparent"
                            >
                                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block text-xs font-black text-white">
                                        {isRTL ? 'المرجع الذكي للتحاليل' : 'Smart Lab Reference'}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigateTo(Page.ABOUT)}
                        className="transition-colors hover:text-[rgb(var(--neon-primary))]"
                    >
                        {isRTL ? 'عن المشروع' : 'About'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigateTo(Page.FAQ)}
                        className="transition-colors hover:text-[rgb(var(--neon-primary))]"
                    >
                        {isRTL ? 'الأسئلة الشائعة' : 'FAQ'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigateTo(Page.CONTACT)}
                        className="transition-colors hover:text-[rgb(var(--neon-primary))]"
                    >
                        {isRTL ? 'اتصل بنا' : 'Contact'}
                    </button>
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
                <nav className="border-t border-white/10 px-4 py-3 md:hidden space-y-2">
                    <button
                        type="button"
                        onClick={() => {
                            navigateTo(Page.TIMELINE);
                            setMobileOpen(false);
                        }}
                        className="block w-full py-2 text-left text-sm font-black text-gold-400"
                    >
                        🏆 {isRTL ? 'Transformation Timeline (الجدول الزمني)' : 'Transformation Timeline'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            navigateTo(Page.MACRO);
                            setMobileOpen(false);
                        }}
                        className="block w-full py-2 text-left text-sm font-bold text-zinc-300"
                    >
                        {isRTL ? 'حاسبة الماكروز' : 'Macro Calculator'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            navigateTo(Page.LAB);
                            setMobileOpen(false);
                        }}
                        className="block w-full py-2 text-left text-sm font-bold text-zinc-300"
                    >
                        {isRTL ? 'مرجع التحاليل' : 'Smart Lab Reference'}
                    </button>
                </nav>
            )}
        </header>
    );
}
