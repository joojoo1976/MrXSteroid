import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import {
  ChevronRight, AlertTriangle, ArrowLeft, Zap, Lock, FileCheck, CheckCircle
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Types & Data
import { Page, Language, Currency, PricingTier, ContentStrings, SalesNotificationData } from './types';
import {
  salesDataAr, salesDataEn
} from './i18n';
import { getWeeklyKeywords } from './utils/keywordGenerator';

// Advanced Localization
import { SupportedLanguage, LocalizationState } from './types/localization';
import { initializeLocalization } from './utils/logic';

// Utils
import RevealOnScroll from './components/RevealOnScroll';

// Major Components
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
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
import SalesToast from './components/SalesToast';
import WhatsAppButton from './components/WhatsAppButton';
import FloatingSideIcon from './components/FloatingSideIcon';
import ChatWidget from './components/ChatWidget';
import SmartBookLanding from './components/SmartBookLanding';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Settings from './components/Settings';
import { ConsentModal } from './components/compliance/ConsentModal';

// Lazy Loaded Below-the-fold Components
const TransformationTimeline = React.lazy(() => import('./components/TransformationTimeline'));
const SteroidReadinessQuiz = React.lazy(() => import('./components/SteroidReadinessQuiz'));
const BenefitsSection = React.lazy(() => import('./components/BenefitsSection'));
const DailyIQChallenge = React.lazy(() => import('./components/DailyIQChallenge'));
const AuthorSection = React.lazy(() => import('./components/AuthorSection'));
const PricingSection = React.lazy(() => import('./components/PricingSection'));
const FAQ = React.lazy(() => import('./components/FAQ'));
const Contact = React.lazy(() => import('./components/Contact'));

import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

interface AppContentProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  colorTheme: string;
  changeColorTheme: (color: string) => void;
  currencyState: { code: string; symbol: string; rate: number; locale: string };
  currentPage: Page;
  navigateTo: (page: Page) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedTier: PricingTier | null;
  setSelectedTier: (tier: PricingTier | null) => void;
  legalState: { isOpen: boolean; title: string; content: string };
  setLegalState: React.Dispatch<React.SetStateAction<{ isOpen: boolean; title: string; content: string }>>;
  setHasPurchased: (purchased: boolean) => void;
  setCurrencyState: React.Dispatch<React.SetStateAction<{ code: string; symbol: string; rate: number; locale: string }>>;
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (system: 'metric' | 'imperial') => void;
}

function AppContent({
  theme, setTheme, colorTheme, changeColorTheme,
  currencyState, currentPage, navigateTo, isCheckoutOpen, setIsCheckoutOpen,
  selectedTier, setSelectedTier,
  legalState, setLegalState, setHasPurchased, setCurrencyState,
  unitSystem, setUnitSystem
}: AppContentProps) {
  const { language: lang, setLanguage: changeLang, content, isRTL } = useLanguage();
  const { user, signOut } = useAuth();

  // Audio Player State (Moved here to access lang)
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

  const openLegal = (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => {
    let title = '';
    let text = '';
    switch (key) {
      case 'privacy': title = content.privacyPolicy || 'Privacy'; text = content.privacyPolicyContent; break;
      case 'terms': title = content.termsOfService || 'Terms'; text = content.termsOfServiceContent; break;
      case 'refund': title = content.refundPolicy || 'Refund'; text = content.refundPolicyContent; break;
      case 'disclaimer': title = content.legalDisclaimer || 'Disclaimer'; text = content.disclaimerContent || ''; break;
    }
    setLegalState({ isOpen: true, title, content: text });
  };

  const salesDataMap = {
    [Language.AR]: salesDataAr,
    [Language.EN]: salesDataEn,
    [Language.DE]: salesDataEn,
    [Language.JA]: salesDataEn
  };
  const salesData = salesDataMap[lang] || salesDataEn;
  const footerKeywords = useMemo(() => getWeeklyKeywords(lang), [lang]);

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
            <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"></div></div>}>
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
            </Suspense>
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
              {currentPage === Page.MACRO && <MacroCalculator content={content} lang={lang} navigateTo={navigateTo} />}
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
      <ConsentModal />
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
      // NOTE: We rely on LanguageContext for language now.
      // But we still need currency and other detection from advancedLocalization
      const state = await initializeLocalization();
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

  const changeColorTheme = (newColor: string) => { setColorTheme(newColor); localStorage.setItem('colorTheme', newColor); };

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

  return (
    <AuthProvider>
      <LanguageProvider>
        <div id="scroll-progress" />
        <AppContent
          theme={theme} setTheme={setTheme}
          colorTheme={colorTheme} changeColorTheme={changeColorTheme}
          currencyState={currencyState}
          currentPage={currentPage} navigateTo={navigateTo}
          isCheckoutOpen={isCheckoutOpen} setIsCheckoutOpen={setIsCheckoutOpen}
          selectedTier={selectedTier} setSelectedTier={setSelectedTier}
          legalState={legalState} setLegalState={setLegalState} setHasPurchased={setHasPurchased}
          setCurrencyState={setCurrencyState}
          unitSystem={unitSystem}
          setUnitSystem={(s) => { setUnitSystem(s); localStorage.setItem('mrx_unit_system', s); }}
        />
      </LanguageProvider>
    </AuthProvider>
  );
}