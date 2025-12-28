import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  ChevronRight, AlertTriangle, ArrowLeft, Zap, Lock, FileCheck, CheckCircle
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Types & Data
import { Language, Currency, Page, PricingTier } from './types';
import {
  arContent, enContent, heContent, frContent, esContent, deContent, itContent, ruContent, trContent, ptContent, faContent, urContent,
  teaserTablesAR, teaserTablesEN, teaserTablesHE, teaserTablesFR, teaserTablesES, teaserTablesDE, teaserTablesIT, teaserTablesRU, teaserTablesTR, teaserTablesPT, teaserTablesFA, teaserTablesUR
} from './content';
import {
  salesDataAr, salesDataEn, salesDataHe, salesDataFr, salesDataEs, salesDataDe, salesDataIt, salesDataRu, salesDataTr, salesDataPt, salesDataFa, salesDataUr,
  footerKeywordsPoolAr, footerKeywordsPoolEn, footerKeywordsPoolHe, footerKeywordsPoolFr, footerKeywordsPoolEs, footerKeywordsPoolDe, footerKeywordsPoolIt, footerKeywordsPoolRu, footerKeywordsPoolTr, footerKeywordsPoolPt, footerKeywordsPoolFa, footerKeywordsPoolUr,
  seoKeywordsArabic, seoKeywordsEnglish, seoKeywordsHebrew, seoKeywordsFrench, seoKeywordsSpanish, seoKeywordsGerman, seoKeywordsItalian, seoKeywordsRussian, seoKeywordsTurkish, seoKeywordsPortuguese, seoKeywordsPersian, seoKeywordsUrdu
} from './content-data';

// Utils
import { RevealOnScroll } from './utils/shared';

// Major Components
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import MacroCalculator from './components/MacroCalculator';
import InjectionMap from './components/InjectionMap';
import HalfLifeVisualizer from './components/HalfLifeVisualizer';
import SmartLabReference from './components/SmartLabReference';
import GeneticPotentialCalculator from './components/GeneticPotentialCalculator';
import CycleCalendarExporter from './components/CycleCalendarExporter';

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

import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent({
  lang,
  changeLang,
  theme,
  setTheme,
  colorTheme,
  changeColorTheme,
  currencyState,
  content,
  currentPage,
  navigateTo,
  isCheckoutOpen,
  setIsCheckoutOpen,
  selectedTier,
  setSelectedTier,
  openLegal,
  footerKeywords,
  salesData,
  legalState,
  setLegalState,
  setHasPurchased,
  playerState
}: any) {
  const { user, signOut } = useAuth();

  const openCheckout = (tier: PricingTier) => {
    setSelectedTier(tier);
    setIsCheckoutOpen(true);
  };

  const isRTL = lang === Language.AR || lang === Language.HE;

  if (currentPage !== Page.HOME) {
    return (
      <div className={`min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 ${lang === Language.AR ? 'font-arabic' : lang === Language.HE ? 'font-hebrew' : 'font-sans'}`}>
        <Header
          lang={lang}
          changeLang={changeLang}
          theme={theme}
          setTheme={setTheme}
          colorTheme={colorTheme}
          changeColorTheme={changeColorTheme}
          content={content}
          currentPage={currentPage}
          navigateTo={navigateTo}
          user={user}
          onLogout={signOut}
        />
        <main className="pt-24 pb-20 container mx-auto px-4 min-h-screen">
          <button onClick={() => navigateTo(Page.HOME)} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-gold-500 transition-colors font-bold"><ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} /> {content.backToHome}</button>

          {currentPage === Page.MACRO && <MacroCalculator content={content} lang={lang} unitSystem={'metric'} />}
          {currentPage === Page.INJECTION && <InjectionMap content={content} lang={lang} />}
          {currentPage === Page.HALFLIFE && <HalfLifeVisualizer content={content} />}
          {currentPage === Page.LAB && <SmartLabReference content={content} isRTL={isRTL} />}
          {currentPage === Page.GENETIC && <GeneticPotentialCalculator content={content} unitSystem={'metric'} isRTL={isRTL} />}
          {currentPage === Page.CYCLE_ARCHITECT && <CycleCalendarExporter content={content} isRTL={isRTL} />}

          {currentPage === Page.SMART_LANDING && <SmartBookLanding externalLang={lang === Language.AR ? 'ar' : lang === Language.HE ? 'he' : 'en'} externalIsRTL={isRTL} />}

          {currentPage === Page.LOGIN && <LoginPage content={content} navigateTo={navigateTo} isRTL={isRTL} />}
          {currentPage === Page.SIGNUP && <SignupPage content={content} navigateTo={navigateTo} isRTL={isRTL} />}
        </main>
        <Footer content={content} navigateTo={navigateTo} openLegal={openLegal} pool={footerKeywords} lang={lang} />
        <ChatWidget content={content} isRTL={isRTL} />
        <WhatsAppButton isRTL={isRTL} />
        <FloatingSideIcon isRTL={isRTL} />
        <LegalModal isOpen={legalState.isOpen} onClose={() => setLegalState({ ...legalState, isOpen: false })} title={legalState.title} content={legalState.content} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 ${lang === Language.AR ? 'font-arabic' : lang === Language.HE ? 'font-hebrew' : 'font-sans'}`}>
      <Header
        lang={lang}
        changeLang={changeLang}
        theme={theme}
        setTheme={setTheme}
        colorTheme={colorTheme}
        changeColorTheme={changeColorTheme}
        content={content}
        currentPage={currentPage}
        navigateTo={navigateTo}
        user={user}
        onLogout={signOut}
      />

      <Hero content={content} isRTL={isRTL} lang={lang} openCheckout={openCheckout} playerState={playerState} />

      <RevealOnScroll><Features content={content} /></RevealOnScroll>
      <RevealOnScroll><TransformationTimeline content={content} isRTL={isRTL} /></RevealOnScroll>
      <RevealOnScroll><SteroidReadinessQuiz content={content} onComplete={() => navigateTo(Page.SIGNUP)} /></RevealOnScroll>
      <RevealOnScroll><BenefitsSection content={content} /></RevealOnScroll>
      <RevealOnScroll><DailyIQChallenge content={content} onWin={() => toast.success(content.dailyIQ?.toastCorrect || "Correct!")} /></RevealOnScroll>
      <RevealOnScroll><AuthorSection content={content} /></RevealOnScroll>
      <RevealOnScroll><FAQ content={content} /></RevealOnScroll>
      <RevealOnScroll><Contact content={content} isRTL={isRTL} /></RevealOnScroll>

      <Footer content={content} navigateTo={navigateTo} openLegal={openLegal} pool={footerKeywords} lang={lang} />
      <ChatWidget content={content} isRTL={isRTL} />
      <WhatsAppButton isRTL={isRTL} />
      <FloatingSideIcon isRTL={isRTL} />
      <SalesToast content={content} data={salesData} isRTL={isRTL} />

      <BlockingDisclaimerModal content={content} />
      <LegalModal isOpen={legalState.isOpen} onClose={() => setLegalState(prev => ({ ...prev, isOpen: false }))} title={legalState.title} content={legalState.content} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        tier={selectedTier}
        content={content}
        formattedPrice={selectedTier ? (currencyState.symbol + (selectedTier.price * currencyState.rate).toFixed(2)) : ''}
        onSuccess={() => setHasPurchased(true)}
      />

      <Toaster position={isRTL ? 'top-left' : 'top-right'} />
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || Language.AR);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system');
  const [colorTheme, setColorTheme] = useState<string>(() => localStorage.getItem('colorTheme') || 'gold');
  const [currencyState, setCurrencyState] = useState<{ code: string; symbol: string; rate: number; locale: string }>({ code: 'USD', symbol: '$', rate: 1, locale: 'en-US' });
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [legalState, setLegalState] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: '', content: '' });
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);

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
    if (lang === Language.AR) audio.src = "/audio-ar.mp3";
    else if (lang === Language.HE) audio.src = "/audio-he.mp3";
    else audio.src = "/audio-en.mp3";

    audio.onended = () => setIsPlaying(false);

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [lang]);

  // Data Mapping
  const contentMap = {
    [Language.AR]: arContent, [Language.EN]: enContent, [Language.HE]: heContent,
    [Language.FR]: frContent, [Language.ES]: esContent, [Language.DE]: deContent,
    [Language.IT]: itContent, [Language.RU]: ruContent, [Language.TR]: trContent,
    [Language.PT]: ptContent, [Language.FA]: faContent, [Language.UR]: urContent
  };
  const content = contentMap[lang] || enContent;

  const salesDataMap = {
    [Language.AR]: salesDataAr, [Language.EN]: salesDataEn, [Language.HE]: salesDataHe,
    [Language.FR]: salesDataFr, [Language.ES]: salesDataEs, [Language.DE]: salesDataDe,
    [Language.IT]: salesDataIt, [Language.RU]: salesDataRu, [Language.TR]: salesDataTr,
    [Language.PT]: salesDataPt, [Language.FA]: salesDataFa, [Language.UR]: salesDataUr
  };
  const salesData = salesDataMap[lang] || salesDataEn;

  const footerKeywordsMap = {
    [Language.AR]: footerKeywordsPoolAr, [Language.EN]: footerKeywordsPoolEn, [Language.HE]: footerKeywordsPoolHe,
    [Language.FR]: footerKeywordsPoolFr, [Language.ES]: footerKeywordsPoolEs, [Language.DE]: footerKeywordsPoolDe,
    [Language.IT]: footerKeywordsPoolIt, [Language.RU]: footerKeywordsPoolRu, [Language.TR]: footerKeywordsPoolTr,
    [Language.PT]: footerKeywordsPoolPt, [Language.FA]: footerKeywordsPoolFa, [Language.UR]: footerKeywordsPoolUr
  };
  const footerKeywords = footerKeywordsMap[lang] || footerKeywordsPoolEn;

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

  return (
    <AuthProvider>
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
      />
    </AuthProvider>
  );
}