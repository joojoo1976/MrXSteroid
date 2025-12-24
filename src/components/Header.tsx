
import React, { useState } from 'react';
import { Menu, X, ChevronDown, CalendarCheck, Sun, Moon } from 'lucide-react';
import { Language, ContentStrings, Page } from '../types';
import { USFlag, EGFlag, ILFlag } from '../utils/icon-utils';

interface HeaderProps {
  lang: Language;
  toggleLang: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  content: ContentStrings;
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

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
  lang, toggleLang, theme, setTheme, content, currentPage, navigateTo
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const handleNav = (target: string) => {
    // Basic mapping for section anchors vs internal pages
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

  const getLangLabel = () => {
    if (lang === Language.AR) return 'AR';
    if (lang === Language.HE) return 'HE';
    return 'EN';
  };

  const getLangFlag = () => {
    if (lang === Language.AR) return <EGFlag />;
    if (lang === Language.HE) return <ILFlag />;
    return <USFlag />;
  };

  return (
    <nav dir="ltr" className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 py-4 flex flex-row items-center gap-4">
        {/* Left Side: Logo & Controls */}
        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo(Page.HOME)}>
            <img
              src="/logo_MrXSteroid.png"
              alt="Mr. X Steroid Logo"
              className="h-10 w-auto object-contain brightness-100 dark:brightness-110 rounded-2xl"
            />
            <div className="text-2xl font-black tracking-tighter hidden lg:block font-permanent-marker">
              <span className="text-[#FACC15]">M</span>
              <span className="text-[#22D3EE]">r</span>
              <span className="text-[#1E3A8A] dark:text-[#FEF08A]">.</span>
              <span className="text-[#1E3A8A] mx-1">X</span>
              <span className="text-[#1E3A8A] dark:text-[#FEF08A]">-</span>
              <span className="text-[#FACC15]">S</span>
              <span className="text-[#4ADE80]">t</span>
              <span className="text-[#EF4444]">e</span>
              <span className="text-[#FACC15]">r</span>
              <span className="text-[#3B82F6]">o</span>
              <span className="text-[#22D3EE]">i</span>
              <span className="text-[#EF4444]">d</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-gold-500/50 transition-all text-xs font-medium text-zinc-700 dark:text-zinc-200 group shadow-sm"
              title="Switch Language"
            >
              {getLangFlag()}
              <span className="hidden sm:inline">{getLangLabel()}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                onBlur={() => setTimeout(() => setIsThemeDropdownOpen(false), 200)}
                className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400 hover:text-gold-500 dark:hover:text-gold-500 transition-all shadow-sm flex items-center justify-center gap-2"
                title="Theme Settings"
              >
                <ThemeIcon theme={theme} />
                <ChevronDown className={`w-3 h-3 transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isThemeDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t);
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${theme === t ? 'bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-500 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                      {t === 'light' ? <Sun className="w-4 h-4" /> : t === 'dark' ? <Moon className="w-4 h-4" /> : (
                        <div className="relative">
                          <Sun className="w-3 h-3 opacity-50" />
                          <Moon className="w-2 h-2 absolute -top-1 -right-1" />
                        </div>
                      )}
                      {content.themeNames[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Navigation & Mobile Toggle */}
        <div className="flex-1 flex justify-end items-center gap-6">
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            <button onClick={() => navigateTo(Page.HOME)} className={`text-sm font-bold transition-colors ${currentPage === Page.HOME ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
              {content.homeLink}
            </button>
            <button onClick={() => handleNav('features')} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">
              {content.navFeatures}
            </button>

            {/* Tools Dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${(currentPage !== Page.HOME && currentPage !== Page.CYCLE_ARCHITECT) ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                {content.navAiTools} <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full right-0 pt-2 w-56 hidden group-hover:block animate-fade-in-up">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <button onClick={() => navigateTo(Page.MACRO)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.macro}</button>
                  <button onClick={() => navigateTo(Page.INJECTION)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.injection}</button>
                  <button onClick={() => navigateTo(Page.HALFLIFE)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.halflife}</button>
                  <button onClick={() => navigateTo(Page.LAB)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.lab}</button>
                  <button onClick={() => navigateTo(Page.GENETIC)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.genetic}</button>
                </div>
              </div>
            </div>

            {/* Premium Dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${currentPage === Page.CYCLE_ARCHITECT ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                {content.navPremiumResources} <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full right-0 pt-2 w-64 hidden group-hover:block animate-fade-in-up">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <button onClick={() => navigateTo(Page.CYCLE_ARCHITECT)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-gold-500" />{content.navToolNames.cycleArchitect}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => handleNav('pricing')} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">
              {content.pricingTitle}
            </button>
            <button onClick={() => handleNav('contact')} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">
              {content.contact}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 text-zinc-700 dark:text-zinc-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            title={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl py-4 px-6 flex flex-col gap-4 animate-fade-in-up h-screen overflow-y-auto pb-20">
          <button onClick={() => handleNav('home')} className="text-lg font-bold text-start">{content.homeLink}</button>
          <button onClick={() => handleNav('features')} className="text-lg font-bold text-start">{content.navFeatures}</button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
          <p className="text-xs text-zinc-500 uppercase font-bold">{content.navAiTools}</p>
          <button onClick={() => handleNav('macro')} className="text-sm text-start pl-4">{content.navToolNames.macro}</button>
          <button onClick={() => handleNav('injection')} className="text-sm text-start pl-4">{content.navToolNames.injection}</button>
          <button onClick={() => handleNav('halflife')} className="text-sm text-start pl-4">{content.navToolNames.halflife}</button>
          <button onClick={() => handleNav('lab')} className="text-sm text-start pl-4">{content.navToolNames.lab}</button>
          <button onClick={() => handleNav('genetic')} className="text-sm text-start pl-4">{content.navToolNames.genetic}</button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
          <p className="text-xs text-zinc-500 uppercase font-bold">{content.navPremiumResources}</p>
          <button onClick={() => handleNav('cycle')} className="text-sm text-start pl-4 flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-gold-500" />{content.navToolNames.cycleArchitect}</button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
          <button onClick={() => handleNav('pricing')} className="text-lg font-bold text-start">{content.pricingTitle}</button>
          <button onClick={() => handleNav('contact')} className="text-lg font-bold text-start">{content.contact}</button>
        </div>
      )}
    </nav>
  );
};

export default Header;
