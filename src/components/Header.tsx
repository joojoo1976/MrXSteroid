import React, { useState } from 'react';
import { Menu, X, ChevronDown, CalendarCheck, Sun, Moon, Globe, Palette, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Language, ContentStrings, Page } from '../types';
import { USFlag, EGFlag, ILFlag, FRFlag, ESFlag, DEFlag, ITFlag, RUFlag, TRFlag, PTFlag, FAFlag, URFlag } from '../utils/icon-utils';
import BrandLogo from './BrandLogo';

interface HeaderProps {
  lang: Language;
  changeLang: (lang: Language) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  content: ContentStrings;
  currentPage: Page;
  navigateTo: (page: Page) => void;
  colorTheme: string;
  changeColorTheme: (theme: string) => void;
  user?: User | null;
  onLogout?: () => void;
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
  lang, changeLang, theme, setTheme, content, currentPage, navigateTo, colorTheme, changeColorTheme, user, onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

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
    { code: Language.HE, label: 'עברית', flag: <ILFlag /> },
    { code: Language.FR, label: 'Français', flag: <FRFlag /> },
    { code: Language.ES, label: 'Español', flag: <ESFlag /> },
    { code: Language.DE, label: 'Deutsch', flag: <DEFlag /> },
    { code: Language.IT, label: 'Italiano', flag: <ITFlag /> },
    { code: Language.RU, label: 'Русский', flag: <RUFlag /> },
    { code: Language.TR, label: 'Türkçe', flag: <TRFlag /> },
    { code: Language.PT, label: 'Português', flag: <PTFlag /> },
    { code: Language.FA, label: 'فارسی', flag: <FAFlag /> },
    { code: Language.UR, label: 'اردو', flag: <URFlag /> },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[1];
  const isRTL = [Language.AR, Language.HE, Language.FA, Language.UR].includes(lang);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 py-4 flex flex-row items-center gap-4">
        {/* Left Side: Logo & Controls */}
        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo(Page.HOME)}>
            <img
              src="/logo_MrXSteroid.png"
              alt="Mr. X Steroid Logo"
              className="h-10 w-auto object-contain brightness-100 dark:brightness-110 rounded-2xl"
            />
            <div className="hidden lg:block">
              <BrandLogo className="text-2xl" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                onBlur={() => setTimeout(() => setIsLangDropdownOpen(false), 200)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-gold-500/50 transition-all text-xs font-medium text-zinc-700 dark:text-zinc-200 group shadow-sm min-w-[80px]"
                title="Switch Language"
              >
                {currentLang.flag}
                <span className="hidden sm:inline uppercase">{currentLang.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up max-h-[400px] overflow-y-auto`}>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLang(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${lang === l.code ? 'bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-500 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                      {l.flag}
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up`}>
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t);
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${theme === t ? 'bg-gold-5 dark:bg-gold-500/10 text-gold-600 dark:text-gold-500 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
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

            {/* Color Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                onBlur={() => setTimeout(() => setIsColorDropdownOpen(false), 200)}
                className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400 hover:text-gold-500 dark:hover:text-gold-500 transition-all shadow-sm flex items-center justify-center gap-2"
                title="Color Theme"
              >
                <Palette className="w-4 h-4" />
                <ChevronDown className={`w-3 h-3 transition-transform ${isColorDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isColorDropdownOpen && (
                <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up p-2`}>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'gold', color: 'bg-yellow-500' },
                      { id: 'blue', color: 'bg-blue-500' },
                      { id: 'red', color: 'bg-red-500' },
                      { id: 'green', color: 'bg-green-500' },
                      { id: 'purple', color: 'bg-purple-500' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          changeColorTheme(c.id);
                          setIsColorDropdownOpen(false);
                        }}
                        className={`w-8 h-8 rounded-full ${c.color} border-2 ${colorTheme === c.id ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent hover:scale-110'} transition-all shadow-sm`}
                        title={c.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Navigation & Mobile Toggle */}
        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="hidden md:flex gap-6 items-center">

            {/* Nav Links Wrapper - Reversed in RTL */}
            <div className={`flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} pt-2 w-56 hidden group-hover:block animate-fade-in-up`}>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                    <button onClick={() => navigateTo(Page.MACRO)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.macro}</button>
                    <button onClick={() => navigateTo(Page.INJECTION)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.injection}</button>
                    <button onClick={() => navigateTo(Page.HALFLIFE)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.halflife}</button>
                    <button onClick={() => navigateTo(Page.LAB)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.lab}</button>
                    <button onClick={() => navigateTo(Page.GENETIC)} className="block w-full text-start px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{content.navToolNames.genetic}</button>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${currentPage === Page.CYCLE_ARCHITECT ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}>
                  {content.navPremiumResources} <ChevronDown className="w-3 h-3" />
                </button>
                <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} pt-2 w-64 hidden group-hover:block animate-fade-in-up`}>
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

            <div className={`flex items-center gap-2 ${isRTL ? 'border-r border-zinc-200 dark:border-zinc-800 mr-4 pr-4' : 'border-l border-zinc-200 dark:border-zinc-800 ml-4 pl-4'}`}>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-200">
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-red-500 transition-colors"
                    title={content.logout || "Logout"}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigateTo(Page.LOGIN)}
                    className={`text-sm font-bold transition-colors ${currentPage === Page.LOGIN ? 'text-gold-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-gold-500'}`}
                  >
                    {content.loginBtn}
                  </button>
                  <button
                    onClick={() => navigateTo(Page.SIGNUP)}
                    className="px-5 py-2.5 text-sm font-bold bg-zinc-900 dark:bg-gold-500 text-white dark:text-black rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95"
                  >
                    {content.signupBtn}
                  </button>
                </>
              )}
            </div>
          </div>

          <button
            className="p-2 text-zinc-700 dark:text-zinc-200 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            title={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl py-4 px-6 flex flex-col gap-4 animate-fade-in-up h-screen overflow-y-auto pb-20">
          <button onClick={() => handleNav('home')} className="text-lg font-bold text-start">{content.homeLink}</button>
          <button onClick={() => handleNav('features')} className="text-lg font-bold text-start">{content.navFeatures}</button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
          <p className="text-xs text-zinc-500 uppercase font-bold">{content.navAiTools}</p>
          <button onClick={() => handleNav('macro')} className="text-sm text-start ltr:pl-4 rtl:pr-4">{content.navToolNames.macro}</button>
          <button onClick={() => handleNav('injection')} className="text-sm text-start ltr:pl-4 rtl:pr-4">{content.navToolNames.injection}</button>
          <button onClick={() => handleNav('halflife')} className="text-sm text-start ltr:pl-4 rtl:pr-4">{content.navToolNames.halflife}</button>
          <button onClick={() => handleNav('lab')} className="text-sm text-start ltr:pl-4 rtl:pr-4">{content.navToolNames.lab}</button>
          <button onClick={() => handleNav('genetic')} className="text-sm text-start ltr:pl-4 rtl:pr-4">{content.navToolNames.genetic}</button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
          <p className="text-xs text-zinc-500 uppercase font-bold">{content.navPremiumResources}</p>
          <button onClick={() => handleNav('cycle')} className="text-sm text-start ltr:pl-4 rtl:pr-4 flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-gold-500" />{content.navToolNames.cycleArchitect}</button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
          <button onClick={() => handleNav('pricing')} className="text-lg font-bold text-start">{content.pricingTitle}</button>
          <button onClick={() => handleNav('contact')} className="text-lg font-bold text-start">{content.contact}</button>

          <div className="mt-4 flex flex-col gap-3">
            {user ? (
              <button
                onClick={() => { onLogout?.(); setIsMobileMenuOpen(false); }}
                className="w-full py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-center text-red-500 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> {content.logout || "Logout"}
              </button>
            ) : (
              <>
                <button
                  onClick={() => { navigateTo(Page.LOGIN); setIsMobileMenuOpen(false); }}
                  className="w-full py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-center"
                >
                  {content.loginBtn}
                </button>
                <button
                  onClick={() => { navigateTo(Page.SIGNUP); setIsMobileMenuOpen(false); }}
                  className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-gold-500 text-white dark:text-black font-bold text-center shadow-lg"
                >
                  {content.signupBtn}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
