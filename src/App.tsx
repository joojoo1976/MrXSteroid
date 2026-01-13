import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import {
  ChevronRight, AlertTriangle, ArrowLeft, Zap, Lock, FileCheck, CheckCircle
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Types & Data
import { Page, Language, Currency, PricingTier, ContentStrings, SalesNotificationData } from './types';
import {
  arContent, enContent, deContent, jaContent,
  teaserTablesAR, teaserTablesEN,
  salesDataAr, salesDataEn,
  footerKeywordsPoolAr, footerKeywordsPoolEn,
  seoKeywordsArabic, seoKeywordsEnglish
} from './i18n';
import { getWeeklyKeywords } from './utils/logic';

// Advanced Localization
import { SupportedLanguage, SupportedCountry, LocalizationState } from './types/localization';
import { initializeLocalization } from './utils/logic';
import LocalizationSimulator from './components/LocalizationSimulator';


// Utils
import RevealOnScroll from './components/RevealOnScroll';

// Major Components
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdPlaceholder from './components/AdPlaceholder';

// Lazy Loaded Components
const MacroCalculator = React.lazy(() => import('./components/MacroCalculator'));
const InjectionMap = React.lazy(() => import('./components/InjectionMap'));
const HalfLifeVisualizer = React.lazy(() => import('./components/HalfLifeVisualizer'));
const SmartLabReference = React.lazy(() => import('./components/SmartLabReference'));
const GeneticPotentialCalculator = React.lazy(() => import('./components/GeneticPotentialCalculator'));
const CycleCalendarExporter = React.lazy(() => import('./components/CycleCalendarExporter'));
const MedicalDisclaimerPage = React.lazy(() => import('./components/MedicalDisclaimerPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));

// Refactored Components
import BlockingDisclaimerModal from './components/BlockingDisclaimerModal';
import LegalModal from './components/LegalModal';
import CheckoutModal from './components/CheckoutModal';
import TransformationTimeline from './components/TransformationTimeline';
import SteroidReadinessQuiz from './components/SteroidReadinessQuiz';
import BenefitsSection from './components/BenefitsSection';
import DailyIQChallenge from './components/DailyIQChallenge';
import AuthorSection from './components/AuthorSection';
import WhatsAppButton from './components/WhatsAppButton';
import FloatingSideIcon from './components/FloatingSideIcon';
import ChatWidget from './components/ChatWidget';
import SalesToast from './components/SalesToast';
import SmartBookLanding from './components/SmartBookLanding';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PricingSection from './components/PricingSection';
import Settings from './components/Settings';

import { AuthProvider, useAuth } from './context/AuthContext';

interface AppContentProps {
  lang: Language;
  changeLang: (lang: Language) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  colorTheme: string;
  changeColorTheme: (color: string) => void;
  currencyState: { code: string; symbol: string; rate: number; locale: string };
  content: ContentStrings;
  currentPage: Page;
  navigateTo: (page: Page) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedTier: PricingTier | null;
  setSelectedTier: (tier: PricingTier | null) => void;
  openLegal: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
  footerKeywords: string[];
  salesData: SalesNotificationData[];
  legalState: { isOpen: boolean; title: string; content: string };
  setLegalState: React.Dispatch<React.SetStateAction<{ isOpen: boolean; title: string; content: string }>>;
  setHasPurchased: (purchased: boolean) => void;
  playerState: { isPlaying: boolean; togglePlay: () => void };
  setCurrencyState: React.Dispatch<React.SetStateAction<{ code: string; symbol: string; rate: number; locale: string }>>;
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (system: 'metric' | 'imperial') => void;
}

function AppContent({
  lang, changeLang, theme, setTheme, colorTheme, changeColorTheme,
  currencyState, content, currentPage, navigateTo, isCheckoutOpen, setIsCheckoutOpen,
  selectedTier, setSelectedTier, openLegal, footerKeywords, salesData,
  legalState, setLegalState, setHasPurchased, playerState, setCurrencyState,
  unitSystem, setUnitSystem
}: AppContentProps) {
  const { user, signOut } = useAuth();
  const isRTL = lang === Language.AR;

  const openCheckout = (tier: PricingTier) => {
    setSelectedTier(tier);
    navigateTo(Page.CHECKOUT);
  };

  useEffect(() => {
    const handleGlobalNav = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'home') {
        navigateTo(Page.HOME);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('mrx_navigate', handleGlobalNav);
    return () => window.removeEventListener('mrx_navigate', handleGlobalNav);
  }, [navigateTo]);

  const sharedComponents = (
    <>
      <Header
        lang={lang} changeLang={changeLang} theme={theme} setTheme={setTheme}
        colorTheme={colorTheme} changeColorTheme={changeColorTheme}
        content={content} currentPage={currentPage} navigateTo={navigateTo}
        user={user} onLogout={signOut} unitSystem={unitSystem} setUnitSystem={setUnitSystem}
      />
      <Settings />
      <div className="flex-1">
        {currentPage === Page.HOME ? (
          <div className="animate-fade-in">
            <Hero content={content} isRTL={isRTL} lang={lang} openCheckout={openCheckout} playerState={playerState} />
            <div className="container mx-auto px-4 mb-20 animate-fade-in-up">
              <AdPlaceholder slotId="home_hero_bottom" content={content} />
            </div>
            <RevealOnScroll><Features content={content} /></RevealOnScroll>
            <RevealOnScroll><TransformationTimeline content={content} isRTL={isRTL} /></RevealOnScroll>
            <RevealOnScroll><SteroidReadinessQuiz content={content} onComplete={() => navigateTo(Page.SIGNUP)} /></RevealOnScroll>
            <RevealOnScroll><BenefitsSection content={content} /></RevealOnScroll>
            <RevealOnScroll>
              <PricingSection
                content={content} currency={currencyState.code as Currency}
                locale={currencyState.locale} openCheckout={openCheckout} isRTL={isRTL}
              />
            </RevealOnScroll>
            <RevealOnScroll><DailyIQChallenge content={content} onWin={() => toast.success(content.dailyIQ?.toastCorrect || "Correct!")} /></RevealOnScroll>
            <RevealOnScroll><AuthorSection content={content} /></RevealOnScroll>
            <RevealOnScroll><FAQ content={content} /></RevealOnScroll>
            <RevealOnScroll><Contact content={content} isRTL={isRTL} /></RevealOnScroll>
            <div className="container mx-auto px-4 mb-20">
              <AdPlaceholder slotId="home_footer_top" content={content} />
            </div>
          </div>
        ) : (
          <main className="pt-24 pb-20 container mx-auto px-4 min-h-screen animate-fade-in">
            <button onClick={() => navigateTo(Page.HOME)} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-gold-500 transition-colors font-bold">
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} /> {content.backToHome}
            </button>
            <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-gold-500 font-black">LOADING MR. X TOOL...</div>}>
              {currentPage === Page.MACRO && <MacroCalculator content={content} lang={lang} navigateTo={navigateTo} unitSystem={unitSystem} />}
              {currentPage === Page.INJECTION && <InjectionMap content={content} lang={lang} navigateTo={navigateTo} unitSystem={unitSystem} />}
              {currentPage === Page.HALFLIFE && <HalfLifeVisualizer content={content} navigateTo={navigateTo} />}
              {currentPage === Page.LAB && <SmartLabReference content={content} isRTL={isRTL} navigateTo={navigateTo} unitSystem={unitSystem} />}
              {currentPage === Page.GENETIC && <GeneticPotentialCalculator content={content} unitSystem={unitSystem} isRTL={isRTL} navigateTo={navigateTo} />}
              {currentPage === Page.CYCLE_ARCHITECT && <CycleCalendarExporter content={content} isRTL={isRTL} navigateTo={navigateTo} />}
              {currentPage === Page.SMART_LANDING && <SmartBookLanding externalLang={lang === Language.AR ? 'ar' : 'en'} externalIsRTL={isRTL} />}
              {currentPage === Page.LOGIN && <LoginPage content={content} navigateTo={navigateTo} isRTL={isRTL} />}
              {currentPage === Page.SIGNUP && <SignupPage content={content} navigateTo={navigateTo} isRTL={isRTL} />}
              {currentPage === Page.RESET_PASSWORD && <ResetPasswordPage content={content} navigateTo={navigateTo} isRTL={isRTL} />}
              {currentPage === Page.PROFILE && <ProfilePage user={user} content={content} isRTL={isRTL} navigateTo={navigateTo} />}
              {currentPage === Page.MEDICAL_DISCLAIMER && <MedicalDisclaimerPage content={content} navigateTo={navigateTo} lang={lang} />}
              {currentPage === Page.CHECKOUT && (
                <CheckoutPage
                  content={content} lang={lang} selectedTier={selectedTier}
                  navigateTo={navigateTo} onSuccess={() => setHasPurchased(true)} openLegal={openLegal}
                />
              )}
            </Suspense>
          </main>
        )}
      </div>
      <Footer content={content} navigateTo={navigateTo} openLegal={openLegal} pool={footerKeywords} lang={lang} />
      <ChatWidget content={content} isRTL={isRTL} />
      <WhatsAppButton isRTL={isRTL} />
      <FloatingSideIcon isRTL={isRTL} />
      {currentPage === Page.HOME && <SalesToast content={content} data={salesData} isRTL={isRTL} />}
      <BlockingDisclaimerModal content={content} />
      <LegalModal isOpen={legalState.isOpen} onClose={() => setLegalState(prev => ({ ...prev, isOpen: false }))} title={legalState.title} content={legalState.content} />
      <CheckoutModal
        isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} tier={selectedTier}
        content={content} lang={lang} navigateTo={navigateTo} onSuccess={() => setHasPurchased(true)} openLegal={openLegal}
        formattedPrice={selectedTier ? (currencyState.symbol + (selectedTier.price * currencyState.rate).toFixed(2)) : ''}
      />
      <Toaster position={isRTL ? 'top-left' : 'top-right'} />
    </>
  );

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen flex flex-col bg-zinc-50 dark:bg-background text-zinc-900 dark:text-zinc-100 transition-colors duration-300 ${lang === Language.AR ? 'font-arabic' : 'font-sans'} ${isRTL ? 'text-right' : 'text-left'}`}
    >
      {sharedComponents}
    </div>
  );
}

export default function App() {
  // Advanced Localization State
  const [localizationState, setLocalizationState] = useState<LocalizationState | null>(null);

  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || Language.EN);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'dark');
  const [colorTheme, setColorTheme] = useState<string>(() => localStorage.getItem('colorTheme') || 'gold');
  const [currencyState, setCurrencyState] = useState<{ code: string; symbol: string; rate: number; locale: string }>({ code: 'USD', symbol: '$', rate: 1, locale: 'en-US' });
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(() => (localStorage.getItem('mrx_unit_system') as 'metric' | 'imperial') || 'metric');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [legalState, setLegalState] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: '', content: '' });
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);

  // Initialize Advanced Localization on Mount
  useEffect(() => {
    const initLoc = async () => {
      const state = await initializeLocalization();
      setLocalizationState(state);

      // Map SupportedLanguage to Language enum
      const langMap: Record<SupportedLanguage, Language> = {
        [SupportedLanguage.AR]: Language.AR,
        [SupportedLanguage.EN]: Language.EN,
        [SupportedLanguage.DE]: Language.DE,
        [SupportedLanguage.JA]: Language.JA
      };

      setLang(langMap[state.language]);
      setCurrencyState(state.currency);

      // Check for reset_password flow
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('page') === 'reset_password') {
        setCurrentPage(Page.RESET_PASSWORD);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    initLoc();
  }, []);

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.debug("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const playerState = { isPlaying, togglePlay };

  // Sync audio source
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Select audio based on language
    if (lang === Language.AR) audio.src = "/intro_Ar.mp3";
    else audio.src = "/intro.mp3";

    audio.onended = () => setIsPlaying(false);

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [lang]);

  // Data Mapping
  const contentMap: Record<Language, ContentStrings> = {
    [Language.AR]: arContent,
    [Language.EN]: enContent,
    [Language.DE]: { ...enContent, ...deContent } as ContentStrings,
    [Language.JA]: { ...enContent, ...jaContent } as ContentStrings
  };
  const content = contentMap[lang] || enContent;

  const salesDataMap = {
    [Language.AR]: salesDataAr,
    [Language.EN]: salesDataEn,
    [Language.DE]: salesDataEn, // Fallback to EN if no DE-specific sales data
    [Language.JA]: salesDataEn  // Fallback to EN if no JA-specific sales data
  };
  const salesData = salesDataMap[lang] || salesDataEn;

  const footerKeywords = useMemo(() => getWeeklyKeywords(lang), [lang]);

  // Eyes on Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Apply Color Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-gold', 'theme-blue', 'theme-red', 'theme-green', 'theme-purple');
    root.classList.add(`theme-${colorTheme}`);
  }, [colorTheme]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeLang = (newLang: Language) => { setLang(newLang); localStorage.setItem('lang', newLang); };
  const changeColorTheme = (newColor: string) => { setColorTheme(newColor); localStorage.setItem('colorTheme', newColor); };
  const openLegal = (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => {
    let title = '';
    let text = '';
    switch (key) {
      case 'privacy': title = content.privacyPolicy; text = content.privacyPolicyContent; break;
      case 'terms': title = content.termsOfService; text = content.termsOfServiceContent; break;
      case 'refund': title = content.refundPolicy; text = content.refundPolicyContent; break;
      case 'disclaimer': title = content.legalDisclaimer; text = content.disclaimerContent; break;
    }
    setLegalState({ isOpen: true, title, content: text });
  };

  // Scroll Progress Effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollProgress = document.getElementById('scroll-progress');
      if (scrollProgress) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        scrollProgress.style.width = `${progress}%`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Localization Changes from Simulator
  const handleLocalizationChange = (newState: LocalizationState) => {
    setLocalizationState(newState);

    // Map SupportedLanguage to Language enum
    const langMap: Record<SupportedLanguage, Language> = {
      [SupportedLanguage.AR]: Language.AR,
      [SupportedLanguage.EN]: Language.EN,
      [SupportedLanguage.DE]: Language.DE,
      [SupportedLanguage.JA]: Language.JA
    };

    setLang(langMap[newState.language]);
    setCurrencyState(newState.currency);

    // Update document direction
    document.documentElement.dir = newState.direction;
    document.documentElement.lang = newState.language;
  };

  return (
    <AuthProvider>
      <div id="scroll-progress" />
      <AppContent
        lang={lang} changeLang={changeLang} theme={theme} setTheme={setTheme}
        colorTheme={colorTheme} changeColorTheme={changeColorTheme}
        currencyState={currencyState} content={content}
        currentPage={currentPage} navigateTo={navigateTo}
        isCheckoutOpen={isCheckoutOpen} setIsCheckoutOpen={setIsCheckoutOpen}
        selectedTier={selectedTier} setSelectedTier={setSelectedTier} openLegal={openLegal}
        footerKeywords={footerKeywords} salesData={salesData}
        legalState={legalState} setLegalState={setLegalState} setHasPurchased={setHasPurchased}
        playerState={playerState}
        setCurrencyState={setCurrencyState}
        unitSystem={unitSystem}
        setUnitSystem={(s) => { setUnitSystem(s); localStorage.setItem('mrx_unit_system', s); }}

      />{/* Advanced Localization Simulator - Hidden */}
      {/* 
      {localizationState && (
        <LocalizationSimulator
          currentState={localizationState}
          onCountryChange={handleLocalizationChange}
          currentLanguage={localizationState.language}
        />
      )}
      */}
    </AuthProvider>
  );
}