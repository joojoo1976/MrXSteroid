import React, { useState, useEffect } from 'react';
import { TRANSITIONS } from '../../utils/logic';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, CalendarCheck, Sun, Moon, Globe, Palette, LogOut, User as UserIcon, Settings2, GripHorizontal, Layout, Move } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Language, ContentStrings, Page } from '../../types';
import { USFlag, EGFlag } from '../../utils/icon-utils';
import { md5 } from '../../utils/cryptoUtils';
import BrandLogo from '../shared/BrandLogo';
import BrandBranding from './BrandBranding';
import UnitToggle from '../shared/UnitToggle';

import { usePreferences } from '../../context/PreferencesContext';

type HeaderSection = 'logo' | 'lang-theme' | 'nav' | 'auth';

interface LayoutConfig {
  sections: HeaderSection[];
  alignment: 'justify-start' | 'justify-center' | 'justify-end' | 'justify-between' | 'justify-around';
  gap: string;
}

interface HeaderProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  content: ContentStrings;
  currentPage: Page;
  navigateTo: (page: Page) => void;
  colorTheme: string;
  changeColorTheme: (theme: string) => void;
  user?: User | null;
  onLogout?: () => void;
  onOpenPreferences: () => void;
}

const getProfilePic = (user: User | null | undefined) => {
  if (!user) return null;
  if (user.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
  const emailHash = md5(user.email?.toLowerCase().trim() || '');
  return `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=100`;
};

const ThemeIcon = ({ theme }: { theme: 'light' | 'dark' | 'system' }) => {
  if (theme === 'system') return (
    <div className="relative">
      <Sun className="w-4 h-4 opacity-50" />
      <Moon className="w-3 h-3 absolute -top-1 -right-1" />
    </div>
  );
  if (theme === 'dark') return <Moon className="w-4 h-4" />;
  return <Sun className="w-4 h-4" />;
};

const Header: React.FC<HeaderProps> = ({
  theme, setTheme, content, currentPage, navigateTo, colorTheme, changeColorTheme, user, onLogout, onOpenPreferences
}) => {
  const { language: lang, setLanguage: changeLang, unitSystem, setUnitSystem, isRTL } = usePreferences();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  // Design Mode State
  const [isDesignMode, setIsDesignMode] = useState(false);
  // ... rest of state
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() => {
    const saved = localStorage.getItem('header_layout_config');
    return saved ? JSON.parse(saved) : {
      sections: ['logo', 'lang-theme', 'nav', 'auth'],
      alignment: 'justify-between',
      gap: 'gap-6'
    };
  });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const saveLayout = (config: LayoutConfig) => {
    setLayoutConfig(config);
    localStorage.setItem('header_layout_config', JSON.stringify(config));
  };

  const handleNav = (target: string) => {
    const pageMap: Record<string, Page> = {
      'macro': Page.MACRO,
      'injection': Page.INJECTION,
      'halflife': Page.HALFLIFE,
      'lab': Page.LAB,
      'genetic': Page.GENETIC,
      'cycle': Page.CYCLE_ARCHITECT
    };

    if (pageMap[target]) {
      navigateTo(pageMap[target]);
    } else {
      navigateTo(Page.HOME);
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setIsMobileMenuOpen(false);
  };

  const languages = [
    { code: Language.AR, label: 'العربية', flag: <EGFlag /> },
    { code: Language.EN, label: 'English', flag: <USFlag /> },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[1];

  const renderSection = (id: HeaderSection) => {
    switch (id) {
      case 'logo':
        return (
          <div key="logo" className="flex items-center gap-3">
            <BrandBranding />
          </div>
        );
      case 'lang-theme':
        return (
          <div key="lang-theme" className="flex items-center gap-2">
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              onBlur={() => setTimeout(() => setIsThemeDropdownOpen(false), 200)}
              className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-gold-500/50 transition-all text-sm font-bold text-zinc-700 dark:text-zinc-200 shadow-sm group min-w-[40px]"
              title="Toggle Theme"
            >
              <ThemeIcon theme={theme} />
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isThemeDropdownOpen && (
              <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[60] ${TRANSITIONS.SLIDE_UP} p-1.5`}>
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTheme(t); setIsThemeDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-xl ${theme === t ? 'bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-500 font-black' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  >
                    {t === 'light' ? <Sun className="w-4 h-4" /> : t === 'dark' ? <Moon className="w-4 h-4" /> : (
                      <div className="relative">
                        <Sun className="w-3.5 h-3.5 opacity-50" /><Moon className="w-2.5 h-2.5 absolute -top-1 -right-1" />
                      </div>
                    )}
                    {content.themeNames[t]}
                  </button>
                ))}
              </div>
            )}

            {/* Smart Globe Button - Opens Unified Settings */}
            <button
              onClick={onOpenPreferences}
              className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-gold-500/50 transition-all text-sm font-bold text-zinc-700 dark:text-zinc-200 shadow-sm group min-w-[40px]"
              title="Preferences"
            >
              <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline uppercase text-[10px] tracking-widest">{lang}</span>
            </button>
          </div>
        );
      case 'nav':
        return (
          <div key="nav" className="hidden md:flex items-center gap-6">
            <button onClick={() => navigateTo(Page.HOME)} className={`text-sm font-bold transition-colors ${currentPage === Page.HOME ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
              {content.homeLink}
            </button>
            <button onClick={() => handleNav('features')} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">
              {content.navFeatures}
            </button>
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${(currentPage !== Page.HOME && currentPage !== Page.CYCLE_ARCHITECT) ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                {content.navAiTools} <ChevronDown className="w-3 h-3" />
              </button>
              <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} pt-2 w-56 hidden group-hover:block animate-fade-in-up z-50`}>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  {(['macro', 'injection', 'halflife', 'lab', 'genetic'] as const).map(tool => (
                    <button key={tool} onClick={() => navigateTo(Page[tool.toUpperCase() as keyof typeof Page])} className="block w-full text-start px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames[tool]}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${currentPage === Page.CYCLE_ARCHITECT ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                {content.navPremiumResources} <ChevronDown className="w-3 h-3" />
              </button>
              <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} pt-2 w-64 hidden group-hover:block animate-fade-in-up z-50`}>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <button onClick={() => navigateTo(Page.CYCLE_ARCHITECT)} className="block w-full text-start px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-gold-500" />{content.navToolNames.cycleArchitect}
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => handleNav('pricing')} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">{content.pricingTitle}</button>
            <button onClick={() => handleNav('contact')} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">{content.contact}</button>
          </div>
        );
      case 'auth':
        return (
          <div key="auth" className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateTo(Page.PROFILE)}
                  className="flex items-center gap-2 group transition-all"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-gold-500/50 group-hover:border-gold-500 overflow-hidden transition-all bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <img src={getProfilePic(user) || ''} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <span className="hidden lg:inline text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-gold-500 transition-colors">
                    {user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/10 text-zinc-500 hover:text-red-600 transition-all text-xs font-bold shadow-sm group min-w-[32px]"
                  title={content.logout || "Logout"}
                  aria-label={content.logout || "Logout"}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ltr:border-l rtl:border-r border-zinc-200 dark:border-zinc-800 ltr:pl-4 rtl:pr-4">
                <button onClick={() => navigateTo(Page.LOGIN)} className={`text-sm font-bold transition-colors ${currentPage === Page.LOGIN ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                  {content.loginBtn}
                </button>
                <button onClick={() => navigateTo(Page.SIGNUP)} className="px-5 py-2.5 text-sm font-bold bg-zinc-900 dark:bg-gold-500 text-white dark:text-black rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95">
                  {content.signupBtn}
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 glass-morphism-premium border-b border-zinc-200 dark:border-zinc-800/50 group/nav transition-all duration-500 ${isScrolled ? 'shadow-md backdrop-blur-xl' : ''}`}>

      {/* Design Mode Toggle */}
      <button
        onClick={() => setIsDesignMode(!isDesignMode)}
        className={`absolute top-full ltr:right-4 rtl:left-4 mt-2 flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg shadow-lg border transition-all z-50 ${isDesignMode ? 'bg-gold-500 text-black border-gold-600 animate-pulse' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 opacity-0 group-hover/nav:opacity-100'}`}
        title="Toggle Visual Editor"
      >
        <Settings2 className="w-4 h-4" />
      </button>

      {/* Editor Toolbar */}
      <AnimatePresence>
        {isDesignMode && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-gold-500 text-black py-2 px-4 flex items-center justify-center gap-6 text-sm font-black uppercase tracking-widest shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <span>{lang === 'ar' ? 'محاذاة:' : 'Alignment:'}</span>
              {(['justify-start', 'justify-center', 'justify-end', 'justify-between'] as const).map(align => (
                <button
                  key={align}
                  onClick={() => saveLayout({ ...layoutConfig, alignment: align })}
                  className={`px-2 py-1 rounded transition-colors ${layoutConfig.alignment === align ? 'bg-black text-white' : 'hover:bg-black/10'}`}
                  title={align.replace('justify-', '')}
                >
                  {align.replace('justify-', '')}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4" />
              <span>{lang === 'ar' ? 'المسافات:' : 'Gap:'}</span>
              {(['gap-2', 'gap-4', 'gap-6', 'gap-10'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => saveLayout({ ...layoutConfig, gap: g })}
                  className={`px-2 py-1 rounded transition-colors ${layoutConfig.gap === g ? 'bg-black text-white' : 'hover:bg-black/10'}`}
                  title={g.replace('gap-', '')}
                >
                  {g.replace('gap-', '')}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`container mx-auto px-4 flex items-center transition-all duration-500 ${isScrolled ? 'py-2' : 'py-3'}`}>
        <Reorder.Group
          axis="x"
          values={layoutConfig.sections}
          onReorder={(newOrder) => saveLayout({ ...layoutConfig, sections: newOrder })}
          className={`flex items-center w-full ${layoutConfig.alignment} ${layoutConfig.gap}`}
        >
          {layoutConfig.sections.map((sectionId) => (
            <Reorder.Item
              key={sectionId}
              value={sectionId}
              drag={isDesignMode}
              className={`relative flex items-center transition-all ${isDesignMode ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-gold-500/50 rounded-lg p-1' : ''}`}
            >
              {isDesignMode && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-[10px] px-1 rounded flex items-center gap-1 shadow-sm">
                  <GripHorizontal className="w-2 h-2" /> {sectionId}
                </div>
              )}
              {renderSection(sectionId)}
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* Mobile menu toggle stays right-aligned regardless */}
        <button
          className="md:hidden ml-auto flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass-morphism-premium border-b border-zinc-200 dark:border-zinc-800/50 shadow-2xl py-4 px-4 flex flex-col gap-3 h-[calc(100vh-80px)] overflow-y-auto pb-24 z-[100]"
          >
            <button onClick={() => { navigateTo(Page.HOME); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-start">{content.homeLink}</button>
            <button onClick={() => { handleNav('features'); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-start">{content.navFeatures}</button>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>
            <p className="text-sm text-zinc-500 uppercase font-bold">{content.navAiTools}</p>
            {(['macro', 'injection', 'halflife', 'lab', 'genetic'] as const).map(tool => (
              <button key={tool} onClick={() => { navigateTo(Page[tool.toUpperCase() as keyof typeof Page]); setIsMobileMenuOpen(false); }} className="text-sm text-start ltr:pl-4 rtl:pr-4">{content.navToolNames[tool]}</button>
            ))}
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>
            <p className="text-sm text-zinc-500 uppercase font-bold">{content.navPremiumResources}</p>
            <button onClick={() => { navigateTo(Page.CYCLE_ARCHITECT); setIsMobileMenuOpen(false); }} className="text-sm text-start ltr:pl-4 rtl:pr-4 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-gold-500" />{content.navToolNames.cycleArchitect}
            </button>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>
            <button onClick={() => { handleNav('pricing'); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-start">{content.pricingTitle}</button>
            <button onClick={() => { handleNav('contact'); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-start">{content.contact}</button>
            <div className="mt-4 flex flex-col gap-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { navigateTo(Page.PROFILE); setIsMobileMenuOpen(false); }}
                    className="w-full py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold flex items-center justify-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full border border-gold-500/50 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <img src={getProfilePic(user) || ''} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <span>{user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                  </button>
                  <button onClick={() => { onLogout?.(); setIsMobileMenuOpen(false); }} className="w-full py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-center text-red-500 flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" /> {content.logout || "Logout"}
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => { navigateTo(Page.LOGIN); setIsMobileMenuOpen(false); }} className="w-full py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-center">{content.loginBtn}</button>
                  <button onClick={() => { navigateTo(Page.SIGNUP); setIsMobileMenuOpen(false); }} className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-gold-500 text-white dark:text-black font-bold text-center shadow-lg">{content.signupBtn}</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary Horizontal Nav for Tools - Desktop Only */}
      <motion.div
        className="hidden md:flex border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-background/50 backdrop-blur-md overflow-hidden"
        animate={{ height: isScrolled ? 0 : 'auto', opacity: isScrolled ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 py-2">
            {(['macro', 'injection', 'halflife', 'lab', 'genetic'] as const).map((tool) => (
              <button
                key={tool}
                onClick={() => navigateTo(Page[tool.toUpperCase() as keyof typeof Page])}
                className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-gold-600 dark:hover:text-gold-500 hover:shadow-sm transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              >
                {content.navToolNames[tool]}
              </button>
            ))}
            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-2"></div>
            <button
              onClick={() => navigateTo(Page.CYCLE_ARCHITECT)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-500 bg-gold-500/10 hover:bg-gold-500 hover:text-white dark:hover:text-black hover:shadow-md transition-all border border-gold-500/20"
            >
              {content.navToolNames.cycleArchitect}
            </button>
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Header;
