import React, { useState, useEffect } from 'react';
import { TRANSITIONS } from '../../shared/lib/logic';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, CalendarCheck, Sun, Moon, Globe, LogOut, Settings2, GripHorizontal, Layout, Move } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { ContentStrings, Page } from '../../shared/types/types';
import { md5 } from '../../shared/lib/cryptoUtils';
import DynamicBrandLogo from './DynamicBrandLogo';
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
  colorTheme: string;
  changeColorTheme: (color: string) => void;
  content: ContentStrings;
  currentPage: Page;
  navigateTo: (page: Page) => void;
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
      <Moon className="w-3 h-3 absolute -top-1 -end-1" />
    </div>
  );
  if (theme === 'dark') return <Moon className="w-4 h-4" />;
  return <Sun className="w-4 h-4" />;
};

const Header: React.FC<HeaderProps> = ({
  theme, setTheme, colorTheme: _colorTheme, changeColorTheme: _changeColorTheme, content, currentPage, navigateTo, user, onLogout, onOpenPreferences
}) => {
  const { language: lang, isRTL } = usePreferences();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  // Design Mode State
  const [isDesignMode, setIsDesignMode] = useState(false);
  // ... rest of state
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() => {
    // Updated key to 'header_layout_v2' to force reset for user
    const saved = localStorage.getItem('header_layout_v2');
    return saved ? JSON.parse(saved) : {
      sections: ['logo', 'nav', 'lang-theme', 'auth'],
      alignment: 'justify-between',
      gap: 'gap-4'
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
    localStorage.setItem('header_layout_v2', JSON.stringify(config));
  };

  const handleNav = (target: string) => {
    const pageMap: Record<string, Page> = {
      'macro': Page.MACRO,
      'bodyfat': Page.BODYFAT,
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
  };



  const renderSection = (id: HeaderSection) => {
    switch (id) {
      case 'logo':
        return (
          <div key="logo" className="flex items-center gap-3">
            <DynamicBrandLogo variant='full' showMascot onClick={() => navigateTo(Page.HOME)} className="py-0.5 scale-75 md:scale-80 origin-start" />
          </div>
        );
      case 'lang-theme':
        return (
          <div key="lang-theme" className="flex items-center gap-2">
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              onBlur={() => setTimeout(() => setIsThemeDropdownOpen(false), 200)}
              className="flex items-center justify-center gap-2 px-2 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-gold-500/50 transition-all text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-sm group min-w-[44px] h-[36px]"
              title="Toggle Theme"
            >
              <ThemeIcon theme={theme} />
              <div className="flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded px-0.5 ml-1">
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isThemeDropdownOpen ? 'rotate-180 text-gold-500' : 'text-zinc-500'}`} />
              </div>
            </button>
            {isThemeDropdownOpen && (
              <div className={`absolute top-full ${isRTL ? 'end-0' : 'start-0'} mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[60] ${TRANSITIONS.SLIDE_UP} p-1.5`}>
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
              className="flex items-center justify-center gap-2 px-2 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-gold-500/50 transition-all text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-sm group min-w-[44px] h-[36px]"
              title="Preferences"
            >
              <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline uppercase text-[9px] tracking-widest bg-gold-500/10 text-gold-600 dark:text-gold-500 px-1.5 rounded">PREFERENCES</span>
            </button>
          </div>
        );
      case 'nav':
        return (
          <div key="nav" className="hidden md:flex items-center gap-4">
            <button onClick={() => navigateTo(Page.HOME)} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${currentPage === Page.HOME ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
              {content.homeLink}
            </button>
            <button onClick={() => handleNav('features')} className="text-xs font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">
              {content.navFeatures}
            </button>
            <div className="relative group">
              <button className={`flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold transition-colors ${(currentPage !== Page.HOME && currentPage !== Page.CYCLE_ARCHITECT) ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                {content.navAiTools}
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 group-hover:bg-gold-500/20 transition-colors">
                  <ChevronDown className="w-2 h-2" />
                </div>
              </button>
              <div className={`absolute top-full ${isRTL ? 'end-0' : 'start-0'} pt-2 w-56 hidden group-hover:block animate-fade-in-up z-50`}>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  {(['macro', 'bodyfat', 'injection', 'halflife', 'lab', 'genetic'] as const).map(tool => (
                    <button
                      key={tool}
                      onClick={() => navigateTo(Page[tool.toUpperCase() as keyof typeof Page])}
                      className={`block w-full text-start px-3 py-2 text-xs transition-colors ${currentPage === Page[tool.toUpperCase() as keyof typeof Page] ? 'bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-500 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                      {content.navToolNames[tool]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className={`flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold transition-colors ${currentPage === Page.CYCLE_ARCHITECT ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                {content.navPremiumResources}
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 group-hover:bg-gold-500/20 transition-colors">
                  <ChevronDown className="w-2 h-2" />
                </div>
              </button>
              <div className={`absolute top-full ${isRTL ? 'end-0' : 'start-0'} pt-2 w-64 hidden group-hover:block animate-fade-in-up z-50`}>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <button onClick={() => navigateTo(Page.CYCLE_ARCHITECT)} className="block w-full text-start px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-gold-500" />{content.navToolNames.cycleArchitect}
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => handleNav('pricing')} className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">{content.pricingTitle}</button>
            <button onClick={() => handleNav('contact')} className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">{content.contact}</button>
          </div>
        );
      case 'auth':
        return (
          <div key="auth" className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo(Page.PROFILE)}
                  className="flex items-center gap-2 group transition-all"
                >
                  <div className="w-7 h-7 rounded-full border-2 border-gold-500/50 group-hover:border-gold-500 overflow-hidden transition-all bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <img src={getProfilePic(user) || ''} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <span className="hidden lg:inline text-xs font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-gold-500 transition-colors">
                    {user.user_metadata?.user_name || user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center gap-2 px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/10 text-zinc-500 hover:text-red-600 transition-all text-[10px] font-bold shadow-sm group min-w-[28px]"
                  title={content.logout || "Logout"}
                  aria-label={content.logout || "Logout"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-inline border-zinc-200 dark:border-zinc-800 ps-3">
                <button onClick={() => navigateTo(Page.LOGIN)} className={`text-xs font-bold transition-colors ${currentPage === Page.LOGIN ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                  {content.loginBtn}
                </button>
                <button onClick={() => navigateTo(Page.SIGNUP)} className="px-3.5 py-1.5 text-xs font-bold bg-zinc-900 dark:bg-gold-500 text-white dark:text-black rounded-lg hover:scale-105 transition-all shadow-md active:scale-95">
                  {content.signupBtn}
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 glass-morphism-premium border-b border-zinc-200 dark:border-zinc-800/50 group/nav transition-all duration-500 ${isScrolled ? 'shadow-md backdrop-blur-xl' : ''}`}>

      {/* Design Mode Toggle */}
      <button
        onClick={() => setIsDesignMode(!isDesignMode)}
        className={`absolute top-full end-4 mt-2 flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg shadow-lg border transition-all z-50 ${isDesignMode ? 'bg-gold-500 text-black border-gold-600 animate-pulse' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 opacity-0 group-hover/nav:opacity-100'}`}
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

      <nav className={`container mx-auto px-4 flex items-center transition-all duration-500 py-0.5`}>
        <Reorder.Group
          axis="x"
          values={layoutConfig.sections}
          onReorder={(newOrder) => saveLayout({ ...layoutConfig, sections: newOrder })}
          className={`flex items-center w-full ${layoutConfig.alignment} gap-1 lg:gap-3`}
        >
          {layoutConfig.sections.map((sectionId) => (
            <Reorder.Item
              key={sectionId}
              value={sectionId}
              drag={isDesignMode}
              className={`relative flex items-center transition-all ${isDesignMode ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-gold-500/50 rounded-lg p-1' : ''}`}
            >
              {isDesignMode && (
                <div className="absolute -top-3 inset-inline-start-1/2 -translate-x-1/2 bg-gold-500 text-[10px] px-1 rounded flex items-center gap-1 shadow-sm">
                  <GripHorizontal className="w-2 h-2" /> {sectionId}
                </div>
              )}
              {renderSection(sectionId)}
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* Mobile menu toggle stays right-aligned regardless */}
        <button
          className="md:hidden ms-auto flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full start-0 w-full glass-morphism-premium border-b border-zinc-200 dark:border-zinc-800/50 shadow-2xl py-4 px-4 flex flex-col gap-3 h-[calc(100vh-80px)] overflow-y-auto pb-24 z-[100]"
          >
            <button onClick={() => { navigateTo(Page.HOME); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-start">{content.homeLink}</button>
            <button onClick={() => { handleNav('features'); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-start">{content.navFeatures}</button>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>
            <p className="text-sm text-zinc-500 uppercase font-bold">{content.navAiTools}</p>
            {(['macro', 'bodyfat', 'injection', 'halflife', 'lab', 'genetic'] as const).map(tool => (
              <button key={tool} onClick={() => { navigateTo(Page[tool.toUpperCase() as keyof typeof Page]); setIsMobileMenuOpen(false); }} className="text-sm text-start ps-4">{content.navToolNames[tool]}</button>
            ))}
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>
            <p className="text-sm text-zinc-500 uppercase font-bold">{content.navPremiumResources}</p>
            <button onClick={() => { navigateTo(Page.CYCLE_ARCHITECT); setIsMobileMenuOpen(false); }} className="text-sm text-start ps-4 flex items-center gap-2">
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
                    <span>{user.user_metadata?.user_name || user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
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
        className="hidden md:flex border-t border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-background/80 backdrop-blur-md overflow-hidden shadow-sm"
        animate={{ height: isScrolled ? 0 : 'auto', opacity: isScrolled ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1.5 py-1.5">
            {(['macro', 'bodyfat', 'injection', 'halflife', 'lab', 'genetic'] as const).map((tool) => (
              <button
                key={tool}
                onClick={() => navigateTo(Page[tool.toUpperCase() as keyof typeof Page])}
                className="whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gold-500 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              >
                {content.navToolNames[tool]}
              </button>
            ))}
            <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
            <button
              onClick={() => navigateTo(Page.CYCLE_ARCHITECT)}
              className="whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gold-500 bg-gold-500/5 hover:bg-gold-500 hover:text-black transition-all border border-gold-500/10 shadow-sm"
            >
              {content.navToolNames.cycleArchitect}
            </button>
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default Header;
