/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GlobalHeader.tsx — Unified Header System (Header 1 + Header 2)
 *  Lead Digital Architect & Tech Advisor
 *
 *  Two-tier navigation system that is shared across every page:
 *    • Header 1 (Primary)   — always visible, sticky at top.
 *        Brand logo, language toggle, theme, profile/auth.
 *    • Header 2 (Secondary) — slim sub-navigation that hides on scroll-down
 *        and re-appears on scroll-up. Used for quick access to calculators
 *        and premium resources.
 *
 *  Fully internationalized (AR/EN), RTL/LTR aware, mobile responsive.
 * ═══════════════════════════════════════════════════════════════════════════
 */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    ChevronDown,
    Globe,
    LogOut,
    LayoutDashboard,
    User as UserIcon,
    Scale,
    Trophy,
    Activity,
    Flame,
    CalendarCheck,
    Stethoscope,
    Calculator,
    Beaker,
    Dna,
    Syringe,
    Timer,
    ExternalLink,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { MockUser } from '../lib/mock-auth-service';
import { ContentStrings, Page, Language } from '@/shared/types/types';
import { md5 } from '../../shared/lib/cryptoUtils';
import DynamicBrandLogo from './DynamicBrandLogo';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import { DROPDOWN_CONFIGS, MenuItem } from '@/shared/config/menuConfig';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface GlobalHeaderProps {
    content: ContentStrings;
    currentPage: Page;
    navigateTo: (page: Page) => void;
    user?: User | MockUser | null;
    onLogout?: () => void;
    onOpenPreferences?: () => void;
    /** Hide Header 2 (sub-navigation). Defaults to false. */
    disableSubNav?: boolean;
    /** Hide theme switcher. Defaults to false. */
    disableThemeSwitcher?: boolean;
}

type ToolKey = 'macro' | 'bodyfat' | 'injection' | 'halflife' | 'lab' | 'genetic';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getProfilePic = (
    user: User | MockUser | null | undefined,
    dbAvatarUrl?: string | null,
): string | null => {
    if (!user) return null;
    if (dbAvatarUrl) return dbAvatarUrl;
    if (user.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    if (user.user_metadata?.picture) return user.user_metadata.picture;
    const emailHash = md5(user.email?.toLowerCase().trim() || '');
    return `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=100`;
};

const getIconComponent = (iconName?: string): React.ReactNode => {
    if (!iconName) return null;
    const icons: Record<string, React.ReactNode> = {
        Flame: <Flame className="w-3.5 h-3.5" />,
        Scale: <Scale className="w-3.5 h-3.5" />,
        Syringe: <Syringe className="w-3.5 h-3.5" />,
        Timer: <Timer className="w-3.5 h-3.5" />,
        Beaker: <Beaker className="w-3.5 h-3.5" />,
        Dna: <Dna className="w-3.5 h-3.5" />,
        Trophy: <Trophy className="w-3.5 h-3.5 text-gold-500" />,
        CalendarCheck: <CalendarCheck className="w-3.5 h-3.5 text-gold-500" />,
        Activity: <Activity className="w-3.5 h-3.5 text-gold-500" />,
    };
    return icons[iconName] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const GlobalHeader: React.FC<GlobalHeaderProps> = ({
    content,
    currentPage,
    navigateTo,
    user,
    onLogout,
    onOpenPreferences,
    disableSubNav = false,
    disableThemeSwitcher = false,
}) => {
    const { language: lang, isRTL, setLanguage, unitSystem, setUnitSystem } = usePreferences();
    const { profileData } = useAuth();
    const profilePic = getProfilePic(user, profileData?.avatar_url);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSubNavVisible, setIsSubNavVisible] = useState(true);
    const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(null);
    const lastScrollYRef = useRef(0);

    // ─────────────────────────────────────────────────────────────────────────
    // Scroll logic — show/hide secondary nav based on scroll direction
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            const delta = currentY - lastScrollYRef.current;

            setIsScrolled(currentY > 20);

            // Hide when scrolling DOWN past 80px, show when scrolling UP
            if (currentY < 80) {
                setIsSubNavVisible(true);
            } else if (delta > 4) {
                setIsSubNavVisible(false);
            } else if (delta < -4) {
                setIsSubNavVisible(true);
            }

            lastScrollYRef.current = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setOpenDesktopDropdown(null);
    }, [currentPage]);

    // ─────────────────────────────────────────────────────────────────────────
    // Navigation helpers
    // ─────────────────────────────────────────────────────────────────────────

    const goHome = useCallback(() => {
        navigateTo(Page.HOME);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [navigateTo]);

    const handleScrollToId = useCallback((id: string) => {
        navigateTo(Page.HOME);
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
    }, [navigateTo]);

    // Toggle language and keep the URL locale prefix in sync so a refresh or
    // direct share of the current page renders in the chosen language.
    const toggleLanguage = useCallback(() => {
        const nextLang = lang === Language.AR ? Language.EN : Language.AR;
        setLanguage(nextLang);
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
            const newPath = `/${nextLang}${currentPath === '/' ? '' : currentPath}`;
            window.history.pushState({}, '', newPath);
        }
    }, [lang, setLanguage]);

    const isCalculatorPage = [
        Page.MACRO, Page.BODYFAT, Page.INJECTION, Page.HALFLIFE,
        Page.LAB, Page.GENETIC, Page.CYCLE_ARCHITECT,
    ].includes(currentPage);

    const toolMeta: Array<{ key: ToolKey; label: string; page: Page; icon: React.ReactNode }> = [
        { key: 'macro',     label: content.navToolNames?.macro     || (isRTL ? 'الماكروز' : 'Macros'),     page: Page.MACRO,      icon: <Flame className="w-3.5 h-3.5" /> },
        { key: 'bodyfat',   label: content.navToolNames?.bodyfat   || (isRTL ? 'نسبة الدهون' : 'Body Fat'), page: Page.BODYFAT,    icon: <Scale className="w-3.5 h-3.5" /> },
        { key: 'injection', label: content.navToolNames?.injection || (isRTL ? 'الحقن' : 'Injection'),     page: Page.INJECTION,  icon: <Syringe className="w-3.5 h-3.5" /> },
        { key: 'halflife',  label: content.navToolNames?.halflife  || (isRTL ? 'عمر النصف' : 'Half-life'),  page: Page.HALFLIFE,   icon: <Timer className="w-3.5 h-3.5" /> },
        { key: 'lab',       label: content.navToolNames?.lab       || (isRTL ? 'التحاليل' : 'Lab'),         page: Page.LAB,        icon: <Beaker className="w-3.5 h-3.5" /> },
        { key: 'genetic',   label: content.navToolNames?.genetic   || (isRTL ? 'الجينات' : 'Genetic'),      page: Page.GENETIC,    icon: <Dna className="w-3.5 h-3.5" /> },
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <header
            className="fixed top-0 inset-x-0 z-50"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HEADER 1 — Primary (Always visible, glass-morphism)             */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div
                className={`relative w-full border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/85 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 z-[60] ${
                    isScrolled ? 'shadow-md dark:shadow-black/40' : 'shadow-none'
                }`}
            >
                <nav className="container mx-auto px-4 lg:px-6 h-12 md:h-14 flex items-center justify-between gap-3">
                    {/* Brand / Logo */}
                    <button
                        onClick={goHome}
                        className="flex items-center gap-2 shrink-0 group"
                        aria-label={isRTL ? 'الصفحة الرئيسية' : 'Home'}
                    >
                        <DynamicBrandLogo
                            variant="short"
                            showMascot
                            className="scale-90 md:scale-100 origin-start"
                        />
                    </button>

                    {/* Desktop Primary Nav */}
                    <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                        <NavLink
                            active={currentPage === Page.HOME}
                            onClick={goHome}
                            label={content.homeLink || (isRTL ? 'الرئيسية' : 'Home')}
                        />
                        <NavLink
                            active={false}
                            onClick={() => handleScrollToId('features')}
                            label={content.navFeatures || (isRTL ? 'المميزات' : 'Features')}
                        />

                        {/* AI Tools Dropdown — /smarttools */}
                        <DesktopDropdown
                            label={isRTL ? 'أدوات ذكية' : 'Smart Tools'}
                            active={toolMeta.some((t) => t.page === currentPage)}
                            isOpen={openDesktopDropdown === 'smarttools'}
                            onToggle={() =>
                                setOpenDesktopDropdown(openDesktopDropdown === 'smarttools' ? null : 'smarttools')
                            }
                            onClose={() => setOpenDesktopDropdown(null)}
                            onLabelClick={() => {
                                window.location.href = '/smarttools';
                            }}
                            isRTL={isRTL}
                        >
                            {DROPDOWN_CONFIGS[0].items.map((item, idx) => (
                                <DropdownItem
                                    key={item.href}
                                    icon={getIconComponent(item.icon)}
                                    label={isRTL ? item.labelAr : item.label}
                                    active={currentPage === item.page}
                                    onClick={() => {
                                        window.location.href = item.href;
                                    }}
                                />
                            ))}
                        </DesktopDropdown>

                        {/* Premium Resources Dropdown — /premium-resources */}
                        <DesktopDropdown
                            label={isRTL ? 'موارد حصرية' : 'Premium'}
                            active={currentPage === Page.CYCLE_ARCHITECT || currentPage === Page.TIMELINE}
                            isOpen={openDesktopDropdown === 'premium'}
                            onToggle={() =>
                                setOpenDesktopDropdown(openDesktopDropdown === 'premium' ? null : 'premium')
                            }
                            onClose={() => setOpenDesktopDropdown(null)}
                            onLabelClick={() => {
                                window.location.href = '/premium-resources';
                            }}
                            isRTL={isRTL}
                        >
                            {DROPDOWN_CONFIGS[1].items.map((item) => (
                                <DropdownItem
                                    key={item.href}
                                    icon={getIconComponent(item.icon)}
                                    label={isRTL ? item.labelAr : item.label}
                                    active={currentPage === item.page}
                                    onClick={() => {
                                        window.location.href = item.href;
                                    }}
                                />
                            ))}
                        </DesktopDropdown>

                        <NavLink
                            active={false}
                            onClick={() => handleScrollToId('pricing')}
                            label={content.pricingTitle || (isRTL ? 'الأسعار' : 'Pricing')}
                        />
                        <NavLink
                            active={currentPage === Page.CONTACT}
                            onClick={() => navigateTo(Page.CONTACT)}
                            label={content.contact || (isRTL ? 'تواصل' : 'Contact')}
                        />
                    </div>

                    {/* Right Cluster: language + theme + auth + mobile toggle */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {/* Theme Switcher */}
                        {!disableThemeSwitcher && (
                            <ThemeSwitcher
                                theme={(typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light') as any}
                                resolvedTheme="dark"
                                setTheme={(mode) => {
                                    // Lightweight theme toggle to avoid coupling to parent props.
                                    const root = document.documentElement;
                                    if (mode === 'dark') root.classList.add('dark');
                                    else if (mode === 'light') root.classList.remove('dark');
                                    else {
                                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                        root.classList.toggle('dark', prefersDark);
                                    }
                                }}
                                isRTL={isRTL}
                                variant="icon"
                            />
                        )}

                        {/* Language Switcher */}
                        <button
                            onClick={toggleLanguage}
                            className="hidden sm:flex items-center justify-center gap-1 px-2.5 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-[11px] font-black uppercase text-gold-500"
                            title={isRTL ? 'Switch to English' : 'التبديل إلى العربية'}
                            aria-label={isRTL ? 'تغيير اللغة' : 'Switch Language'}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>{lang === Language.AR ? 'EN' : 'عربي'}</span>
                        </button>

                        {/* Unit Switcher (calculators only) */}
                        {isCalculatorPage && (
                            <button
                                onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
                                className="hidden md:flex items-center justify-center gap-1 px-2.5 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-[10px] font-black uppercase text-zinc-700 dark:text-zinc-200"
                                title={isRTL ? 'نظام القياس' : 'Unit system'}
                            >
                                <Scale className="w-3.5 h-3.5 text-gold-500" />
                                <span>{unitSystem === 'metric' ? (isRTL ? 'متري' : 'MET') : (isRTL ? 'إمبر' : 'IMP')}</span>
                            </button>
                        )}

                        {/* Auth / Profile */}
                        <div className="hidden sm:flex items-center gap-1.5 ps-2 ms-1 border-s border-zinc-200 dark:border-zinc-800">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => navigateTo(Page.DASHBOARD)}
                                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                                        title={isRTL ? 'لوحة التحكم' : 'Dashboard'}
                                        aria-label={isRTL ? 'لوحة التحكم' : 'Dashboard'}
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-gold-500" />
                                    </button>
                                    <button
                                        onClick={() => navigateTo(Page.PROFILE)}
                                        className="flex items-center gap-2 group"
                                        title={isRTL ? 'الملف الشخصي' : 'Profile'}
                                    >
                                        <div className="w-8 h-8 rounded-full border-2 border-gold-500/50 group-hover:border-gold-500 overflow-hidden transition-all bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                            {profilePic ? (
                                                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-4 h-4 text-zinc-500" />
                                            )}
                                        </div>
                                    </button>
                                    {onLogout && (
                                        <button
                                            onClick={onLogout}
                                            className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/10 text-zinc-500 hover:text-red-600 transition-all"
                                            title={isRTL ? 'تسجيل الخروج' : 'Logout'}
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigateTo(Page.LOGIN)}
                                        className={`px-3 h-9 text-xs font-bold rounded-xl transition-colors ${
                                            currentPage === Page.LOGIN
                                                ? 'text-gold-500'
                                                : 'text-zinc-700 dark:text-zinc-300 hover:text-gold-500'
                                        }`}
                                    >
                                        {content.loginBtn || (isRTL ? 'دخول' : 'Login')}
                                    </button>
                                    <button
                                        onClick={() => navigateTo(Page.SIGNUP)}
                                        className="px-3.5 h-9 text-xs font-black rounded-xl bg-zinc-900 dark:bg-gold-500 text-white dark:text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                                    >
                                        {content.signupBtn || (isRTL ? 'تسجيل' : 'Sign Up')}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200"
                            aria-label={isMobileMenuOpen ? (isRTL ? 'إغلاق القائمة' : 'Close menu') : (isRTL ? 'فتح القائمة' : 'Open menu')}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HEADER 2 — Secondary Sub-Nav (hides on scroll-down)            */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {!disableSubNav && (
                <motion.div
                    initial={false}
                    animate={{
                        height: isSubNavVisible ? 'auto' : 0,
                        opacity: isSubNavVisible ? 1 : 0,
                    }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-40 overflow-hidden border-b border-zinc-200/40 dark:border-zinc-800/40 bg-white/60 dark:bg-zinc-950/50 backdrop-blur-md"
                >
                    <div className="container mx-auto px-4 lg:px-6">
                        <div className="flex items-center justify-center gap-1 py-1.5 overflow-x-auto scrollbar-none">
                            {toolMeta.map((tool) => (
                                <button
                                    key={tool.key}
                                    onClick={() => navigateTo(tool.page)}
                                    className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        currentPage === tool.page
                                            ? 'bg-gold-500 text-black border-gold-500 shadow-sm'
                                            : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gold-500'
                                    }`}
                                >
                                    {tool.icon}
                                    <span>{tool.label}</span>
                                </button>
                            ))}
                            <span className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1.5" />
                            <button
                                onClick={() => navigateTo(Page.CYCLE_ARCHITECT)}
                                className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                    currentPage === Page.CYCLE_ARCHITECT
                                        ? 'bg-gold-500 text-black border-gold-500'
                                        : 'text-gold-500 bg-gold-500/5 border-gold-500/10 hover:bg-gold-500 hover:text-black'
                                }`}
                            >
                                <CalendarCheck className="w-3 h-3" />
                                <span>{content.navToolNames?.cycleArchitect || (isRTL ? 'مهندس الدورة' : 'Cycle Architect')}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* Mobile Menu Drawer                                                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-xl shadow-2xl max-h-[calc(100vh-3.5rem)] overflow-y-auto"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
                            <MobileNavButton
                                onClick={() => { goHome(); setIsMobileMenuOpen(false); }}
                                label={content.homeLink || (isRTL ? 'الرئيسية' : 'Home')}
                                active={currentPage === Page.HOME}
                            />
                            <MobileNavButton
                                onClick={() => { handleScrollToId('features'); setIsMobileMenuOpen(false); }}
                                label={content.navFeatures || (isRTL ? 'المميزات' : 'Features')}
                            />

                            <MobileSectionLabel label={isRTL ? 'أدوات ذكية' : 'Smart Tools'} />
                            {DROPDOWN_CONFIGS[0].items.map((item) => (
                                <MobileNavButton
                                    key={item.href}
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        window.location.href = item.href;
                                    }}
                                    label={isRTL ? item.labelAr : item.label}
                                    active={currentPage === item.page}
                                    indented
                                />
                            ))}
                            <MobileNavButton
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    window.location.href = '/smarttools';
                                }}
                                label={isRTL ? '← كل الأدوات' : '← View all tools'}
                                indented
                            />

                            <MobileSectionLabel label={isRTL ? 'موارد حصرية' : 'Premium Resources'} />
                            {DROPDOWN_CONFIGS[1].items.map((item) => (
                                <MobileNavButton
                                    key={item.href}
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        window.location.href = item.href;
                                    }}
                                    label={isRTL ? item.labelAr : item.label}
                                    active={currentPage === item.page}
                                    indented
                                />
                            ))}
                            <MobileNavButton
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    window.location.href = '/premium-resources';
                                }}
                                label={isRTL ? '← كل الموارد' : '← View all resources'}
                                indented
                            />

                            <MobileSectionLabel label="" />
                            <MobileNavButton
                                onClick={() => { handleScrollToId('pricing'); setIsMobileMenuOpen(false); }}
                                label={content.pricingTitle || (isRTL ? 'الأسعار' : 'Pricing')}
                            />
                            <MobileNavButton
                                onClick={() => { navigateTo(Page.CONTACT); setIsMobileMenuOpen(false); }}
                                label={content.contact || (isRTL ? 'تواصل' : 'Contact')}
                                active={currentPage === Page.CONTACT}
                            />

                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-3" />

                            {/* Mobile Auth */}
                            {user ? (
                                <>
                                    <MobileNavButton
                                        onClick={() => { navigateTo(Page.DASHBOARD); setIsMobileMenuOpen(false); }}
                                        label={isRTL ? 'لوحة التحكم' : 'Dashboard'}
                                        icon={<LayoutDashboard className="w-4 h-4" />}
                                    />
                                    <MobileNavButton
                                        onClick={() => { navigateTo(Page.PROFILE); setIsMobileMenuOpen(false); }}
                                        label={isRTL ? 'الملف الشخصي' : 'Profile'}
                                        icon={<UserIcon className="w-4 h-4" />}
                                    />
                                    {onLogout && (
                                        <button
                                            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-red-500 font-bold"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            {isRTL ? 'تسجيل الخروج' : 'Logout'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <button
                                        onClick={() => { navigateTo(Page.LOGIN); setIsMobileMenuOpen(false); }}
                                        className="py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-sm"
                                    >
                                        {content.loginBtn || (isRTL ? 'دخول' : 'Login')}
                                    </button>
                                    <button
                                        onClick={() => { navigateTo(Page.SIGNUP); setIsMobileMenuOpen(false); }}
                                        className="py-3 rounded-xl bg-zinc-900 dark:bg-gold-500 text-white dark:text-black font-bold text-sm"
                                    >
                                        {content.signupBtn || (isRTL ? 'تسجيل' : 'Sign Up')}
                                    </button>
                                </div>
                            )}

                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-3" />

                            {/* Mobile Language + Theme */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleLanguage}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold"
                                >
                                    <Globe className="w-4 h-4 text-gold-500" />
                                    {lang === Language.AR ? 'English' : 'العربية'}
                                </button>
                                {!disableThemeSwitcher && (
                                    <ThemeSwitcher
                                        theme={(typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light') as any}
                                        resolvedTheme="dark"
                                        setTheme={(mode) => {
                                            const root = document.documentElement;
                                            if (mode === 'dark') root.classList.add('dark');
                                            else if (mode === 'light') root.classList.remove('dark');
                                            else {
                                                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                                root.classList.toggle('dark', prefersDark);
                                            }
                                        }}
                                        isRTL={isRTL}
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components (kept local for cohesion)
// ─────────────────────────────────────────────────────────────────────────────

const NavLink: React.FC<{
    active: boolean;
    onClick: () => void;
    label: string;
}> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
            active ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-300 hover:text-gold-500'
        }`}
    >
        {label}
    </button>
);

const DesktopDropdown: React.FC<{
    label: string;
    active: boolean;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onLabelClick?: () => void;
    isRTL: boolean;
    children: React.ReactNode;
}> = ({ label, active, isOpen, onToggle, onClose, onLabelClick, isRTL, children }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [isOpen, onClose]);

    const showDropdown = isOpen || isHovered;

    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 150);
    };

    return (
        <div
            ref={ref}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex items-center gap-1">
                <button
                    onClick={onLabelClick}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
                        active ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-300 hover:text-gold-500'
                    }`}
                >
                    {label}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </button>
                <button
                    onClick={onToggle}
                    className="px-1 py-1.5 text-zinc-600 dark:text-zinc-300 hover:text-gold-500 transition-colors"
                    aria-label="Toggle dropdown"
                >
                    <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
            </div>
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`absolute top-full ${isRTL ? 'end-0' : 'start-0'} mt-1 min-w-[240px] py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl z-[100]`}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DropdownItem: React.FC<{
    icon?: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-start transition-colors ${
            active
                ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const MobileNavButton: React.FC<{
    onClick: () => void;
    label: string;
    active?: boolean;
    icon?: React.ReactNode;
    indented?: boolean;
}> = ({ onClick, label, active, icon, indented }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-2 py-2.5 text-sm font-bold text-start rounded-lg px-3 ${
            indented ? 'ps-6' : ''
        } ${
            active
                ? 'bg-gold-500/10 text-gold-500'
                : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const MobileSectionLabel: React.FC<{ label: string }> = ({ label }) =>
    label ? (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pt-3 pb-1 px-3">
            {label}
        </p>
    ) : null;

export default GlobalHeader;
