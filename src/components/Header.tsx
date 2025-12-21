
import React, { useState } from 'react';
import { Menu, X, ChevronDown, CalendarCheck, Sun, Moon } from 'lucide-react';
import { Language, ContentStrings } from '../types';
import { USFlag, EGFlag, ILFlag } from '../utils/shared';

interface HeaderProps {
  lang: Language;
  toggleLang: () => void;
  theme: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  content: ContentStrings;
  currentPage: string;
  navigateTo: (page: any) => void;
}

const Header: React.FC<HeaderProps> = ({
  lang, toggleLang, theme, toggleTheme, content, currentPage, navigateTo
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = (target: string) => {
    if (['macro', 'injection', 'halflife', 'lab', 'genetic', 'cycle'].includes(target)) {
      navigateTo(target);
    } else {
      navigateTo('home');
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
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="cursor-pointer" onClick={() => navigateTo('home')}>
            <img
              src="/logo_MrXSteroid.png"
              alt="Mr. X Steroid Logo"
              className="h-10 w-auto object-contain brightness-100 dark:brightness-110 rounded-xl"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            <button onClick={() => navigateTo('home')} className={`text-sm font-bold transition-colors ${currentPage === 'home' ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
              {content.homeLink}
            </button>
            <button onClick={() => handleNav('features')} className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors">
              {content.navFeatures}
            </button>

            {/* Tools Dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${(currentPage !== 'home' && currentPage !== 'cycle') ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                {content.navAiTools} <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 pt-2 w-56 hidden group-hover:block animate-fade-in-up">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <button onClick={() => navigateTo('macro')} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.macro}</button>
                  <button onClick={() => navigateTo('injection')} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.injection}</button>
                  <button onClick={() => navigateTo('halflife')} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.halflife}</button>
                  <button onClick={() => navigateTo('lab')} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.lab}</button>
                  <button onClick={() => navigateTo('genetic')} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.genetic}</button>
                </div>
              </div>
            </div>

            {/* Premium Dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${currentPage === 'cycle' ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                {content.navPremiumResources} <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 pt-2 w-64 hidden group-hover:block animate-fade-in-up">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <button onClick={() => navigateTo('cycle')} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
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
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-gold-500/50 transition-all text-xs font-medium text-zinc-700 dark:text-zinc-200 group shadow-sm"
          >
            {getLangFlag()}
            <span className="hidden sm:inline">{getLangLabel()}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400 hover:text-gold-500 dark:hover:text-gold-500 transition-all shadow-sm flex items-center justify-center gap-2"
            title={theme === 'system' ? 'System Mode' : theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'system' ? (
              <div className="relative">
                <Sun className="w-4 h-4 opacity-50" />
                <Moon className="w-3 h-3 absolute -top-1 -right-1" />
              </div>
            ) : theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-zinc-700 dark:text-zinc-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl py-4 px-6 flex flex-col gap-4 animate-fade-in-up h-screen overflow-y-auto pb-20">
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
