import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  ChevronRight, AlertTriangle, ArrowLeft, Zap, Lock, FileCheck, CheckCircle
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Types & Data
import { Language, Currency, Page, PricingTier } from './types';
import { arContent, enContent, heContent, teaserTablesAR, teaserTablesEN } from './content';
import { salesDataAr, salesDataEn, footerKeywordsPoolAr, footerKeywordsPoolEn } from './content-data';

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

export default function App() {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || Language.AR);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system');
  const [currencyState, setCurrencyState] = useState<{ code: string; symbol: string; rate: number; locale: string }>({ code: 'USD', symbol: '$', rate: 1, locale: 'en-US' });
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [legalState, setLegalState] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: '', content: '' });
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);

  // Audio Player State for Hero
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

  // Sync audio source and state
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.src = lang === Language.AR ? "/intro_Ar.mp3" : "/intro.mp3";
      if (wasPlaying) {
        audioRef.current.play().catch(e => console.debug("Audio play failed on source change:", e));
      }
    }
  }, [lang]);

  useEffect(() => {
    const initCurrency = async () => {
      try {
        let userCurrencyCode = 'USD'; let userLocale = 'en-US';
        let countryCode = 'US';
        try {
          const geoRes = await fetch('https://ipapi.co/json/');
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            userCurrencyCode = geoData.currency || 'USD';
            countryCode = geoData.country_code || 'US';
            userLocale = geoData.languages ? geoData.languages.split(',')[0] : 'en-US';

            // Set unit system based on country
            if (['US', 'LR', 'MM'].includes(countryCode)) {
              setUnitSystem('imperial');
            }
          }
        } catch (e) { console.debug('Primary GeoIP failed'); }

        if (!localStorage.getItem('lang') && countryCode === 'IL') setLang(Language.HE);

        if (userCurrencyCode !== 'USD') {
          const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
          if (rateRes.ok) {
            const rateData = await rateRes.json();
            const rate = rateData.rates[userCurrencyCode];
            if (rate) setCurrencyState({ code: userCurrencyCode, symbol: '', rate: rate, locale: userLocale });
          }
        }
      } catch (error) { console.debug('Currency init failed, defaulting to USD'); }
    };
    initCurrency();
  }, []);

  const formatPrice = (usdPriceString: string): string => {
    const numericValue = parseFloat(usdPriceString.replace(/[^0-9.]/g, ''));
    if (isNaN(numericValue)) return usdPriceString;
    const localValue = numericValue * currencyState.rate;
    try { return new Intl.NumberFormat(currencyState.locale, { style: 'currency', currency: currencyState.code, maximumFractionDigits: 2 }).format(localValue); } catch (e) { return usdPriceString; }
  };

  const openCheckout = (tier: PricingTier) => { setSelectedTier(tier); setIsCheckoutOpen(true); };
  const openLegal = (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => {
    let title = ''; let text = '';
    switch (key) { case 'privacy': title = content.privacyPolicy; text = content.privacyPolicyContent; break; case 'terms': title = content.termsOfService; text = content.termsOfServiceContent; break; case 'refund': title = content.refundPolicy; text = content.refundPolicyContent; break; case 'disclaimer': title = content.legalDisclaimer; text = content.disclaimerContent; break; }
    setLegalState({ isOpen: true, title, content: text });
  };

  const toggleLang = () => {
    let newLang = lang === Language.EN ? Language.AR : lang === Language.AR ? Language.HE : Language.EN;
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };
  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const content = lang === Language.AR ? arContent : lang === Language.HE ? heContent : enContent;
  const teaserTables = lang === Language.AR ? teaserTablesAR : teaserTablesEN;
  const salesData = lang === Language.AR ? salesDataAr : salesDataEn;
  const isRTL = lang === Language.AR || lang === Language.HE;

  useEffect(() => { document.title = content.seoTitle; const metaDesc = document.querySelector('meta[name="description"]'); if (metaDesc) metaDesc.setAttribute('content', content.seoDescription); }, [lang, content]);
  useEffect(() => { document.documentElement.dir = isRTL ? 'rtl' : 'ltr'; document.documentElement.lang = lang; }, [isRTL, lang]);
  useEffect(() => {
    const handleThemeChange = () => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    handleThemeChange();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, [theme]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage !== Page.HOME) {
    return (
      <div className={`min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 ${isRTL ? 'font-arabic' : 'font-sans'}`}>
        <Header lang={lang} toggleLang={toggleLang} theme={theme as any} toggleTheme={toggleTheme} content={content} currentPage={currentPage} navigateTo={navigateTo} />
        <main className="pt-24 pb-20 container mx-auto px-4 min-h-screen">
          <button onClick={() => navigateTo(Page.HOME)} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-gold-500 transition-colors font-bold"><ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} /> {content.backToHome}</button>
          {currentPage === Page.MACRO && <MacroCalculator content={content} lang={lang} unitSystem={unitSystem} />}
          {currentPage === Page.INJECTION && <InjectionMap content={content} />}
          {currentPage === Page.HALFLIFE && <HalfLifeVisualizer content={content} />}
          {currentPage === Page.LAB && <SmartLabReference content={content} />}
          {currentPage === Page.GENETIC && <GeneticPotentialCalculator content={content} />}
          {currentPage === Page.CYCLE_ARCHITECT && <CycleCalendarExporter content={content} isRTL={isRTL} />}
          {/* Previewing the new Senior Developer Component */}
          {currentPage as any === 'smart-landing' && <SmartBookLanding externalLang={lang === (Language.AR as any) ? 'ar' : 'en'} externalIsRTL={isRTL} />}
        </main>
        <Footer content={content} navigateTo={navigateTo} openLegal={openLegal} pool={lang === Language.AR ? footerKeywordsPoolAr : footerKeywordsPoolEn} />
        <ChatWidget content={content} isRTL={isRTL} />
        <WhatsAppButton isRTL={isRTL} />
        <FloatingSideIcon isRTL={isRTL} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      <Toaster position="top-center" richColors />
      <BlockingDisclaimerModal content={content} />
      <LegalModal isOpen={legalState.isOpen} onClose={() => setLegalState({ ...legalState, isOpen: false })} title={legalState.title} content={legalState.content} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} tier={selectedTier} content={content} formattedPrice={selectedTier ? formatPrice(selectedTier.price) : ''} onSuccess={() => setHasPurchased(true)} />

      <Header lang={lang} toggleLang={toggleLang} theme={theme as any} toggleTheme={toggleTheme} content={content} currentPage={currentPage} navigateTo={navigateTo} />

      <main>
        <Hero content={content} isRTL={isRTL} openCheckout={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} playerState={playerState} />
        <Features content={content} />

        <section className="py-20 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800"><div className="container mx-auto px-4"><TransformationTimeline content={content} isRTL={isRTL} /></div></section>

        <SteroidReadinessQuiz content={content} onComplete={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} />

        <section className="py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold mb-4">{content.sneakPeekTitle}</h2><p className="text-zinc-500 max-w-2xl mx-auto">{content.sneakPeekSubtitle}</p></div>
            <div className="grid md:grid-cols-2 gap-8">
              {teaserTables.map((table, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl relative">
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 font-bold border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">{hasPurchased ? <FileCheck className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gold-500" />}{table.title}</div>
                  <div className="p-6 overflow-x-auto relative min-h-[300px]">
                    <table className="w-full text-sm">
                      <thead><tr className="text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">{table.headers.map((h, i) => <th key={i} className="pb-3 text-start px-2">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {table.rows.map((row, rIdx) => { const isLocked = !hasPurchased && rIdx > 1; return (<tr key={rIdx} className={`transition-colors ${!isLocked ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30' : ''}`}><td className={`py-3 px-2 font-mono text-xs sm:text-sm ${isLocked ? 'blur-[4px] select-none opacity-40' : ''}`}>{row.col1}</td><td className={`py-3 px-2 font-medium ${isLocked ? 'blur-[4px] select-none opacity-40 text-zinc-400' : 'text-gold-600 dark:text-gold-500'}`}>{row.col2}</td><td className={`py-3 px-2 ${isLocked ? 'blur-[4px] select-none opacity-40' : 'text-zinc-600 dark:text-zinc-400'}`}>{row.col3}</td></tr>); })}
                      </tbody>
                    </table>
                    {!hasPurchased && (<div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-zinc-900/80 dark:to-zinc-900 flex flex-col items-center justify-end pb-8 z-10"><Lock className="w-8 h-8 text-gold-500 mb-2 animate-bounce" /><button onClick={() => openCheckout(content.pricingTiers[0])} className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-full text-sm shadow-lg hover:scale-105 transition-transform">{content.unlockText}</button></div>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BenefitsSection content={content} />

        <DailyIQChallenge content={content} onWin={() => toast.success("Code: STEROIDMASTERY25 applied!")} />

        <section id="pricing" className="py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold mb-4">{content.pricingTitle}</h2><p className="text-zinc-500 max-w-2xl mx-auto">{content.pricingSubtitle}</p></div>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {content.pricingTiers.map((tier, idx) => (
                <div key={idx} className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full ${tier.isPopular ? 'bg-zinc-900 dark:bg-zinc-800 border-gold-500 shadow-2xl scale-105 z-10' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50'}`}>
                  {tier.isPopular && (<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold-500 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Best Value</div>)}
                  <div className="mb-6"><h3 className={`text-xl font-bold mb-2 ${tier.isPopular ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{tier.name}</h3><div className="flex items-baseline gap-2"><span className={`text-4xl font-black ${tier.isPopular ? 'text-gold-500' : 'text-zinc-900 dark:text-white'}`}>{formatPrice(tier.price)}</span>{tier.originalPrice && (<span className="text-zinc-500 line-through text-lg decoration-2 decoration-red-500/50">{formatPrice(tier.originalPrice)}</span>)}</div></div>
                  <ul className="space-y-4 mb-8 flex-1">{tier.features.map((feature, fIdx) => (<li key={fIdx} className={`flex items-start gap-3 text-sm ${tier.isPopular ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'}`}><CheckCircle className={`w-5 h-5 shrink-0 ${tier.isPopular ? 'text-gold-500' : 'text-zinc-400'}`} /><span>{feature}</span></li>))}</ul>
                  <button onClick={() => openCheckout(tier)} className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:scale-105 active:scale-95 ${tier.isPopular ? 'bg-gold-500 hover:bg-gold-400 text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'}`}>{tier.buttonText}</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FAQ content={content} />
        <Contact content={content} isRTL={isRTL} />
        <AuthorSection content={content} />
      </main>

      <Footer content={content} navigateTo={navigateTo} openLegal={openLegal} pool={lang === Language.AR ? footerKeywordsPoolAr : footerKeywordsPoolEn} />
      <ChatWidget content={content} isRTL={isRTL} />
      <WhatsAppButton isRTL={isRTL} />
      <FloatingSideIcon isRTL={isRTL} />
      <SalesToast content={content} data={salesData} isRTL={isRTL} />

    </div>
  );
}