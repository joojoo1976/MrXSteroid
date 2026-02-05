import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import {
  ArrowLeft, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

// Types & Data
import { Page, Language, PricingTier } from './types';
import {
  salesDataAr, salesDataEn
} from './i18n';
import { getWeeklyKeywords } from './utils/keywordGenerator';

import { initializeLocalization } from './utils/logic';

// Major Components
import Header from './components/layout/Header';
import Hero from './components/layout/Hero';
import Features from './components/marketing/Features';
import Footer from './components/layout/Footer';
import AdPlaceholder from './components/shared/AdPlaceholder';
import RevealOnScroll from './components/shared/RevealOnScroll';

// Refactored Components
import BlockingDisclaimerModal from './components/modals/BlockingDisclaimerModal';
import LegalModal from './components/modals/LegalModal';
import CheckoutModal from './components/modals/CheckoutModal';
import SalesToast from './components/shared/SalesToast';
import WhatsAppButton from './components/shared/WhatsAppButton';
import FloatingSideIcon from './components/layout/FloatingSideIcon';
import ChatWidget from './components/shared/ChatWidget';
import SmartBookLanding from './components/marketing/SmartBookLanding';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Lazy Loaded Components
const MacroCalculator = React.lazy(() => import('./components/tools/MacroCalculator'));
const BodyFatCalculator = React.lazy(() => import('./components/tools/BodyFatCalculator'));
const InjectionMap = React.lazy(() => import('./components/tools/InjectionMap'));
const HalfLifeVisualizer = React.lazy(() => import('./components/tools/HalfLifeVisualizer'));
const SmartLabReference = React.lazy(() => import('./components/tools/SmartLabReference'));
const GeneticPotentialCalculator = React.lazy(() => import('./components/tools/GeneticPotentialCalculator'));
const CycleCalendarExporter = React.lazy(() => import('./components/tools/CycleCalendarExporter'));
const MedicalDisclaimerPage = React.lazy(() => import('./components/MedicalDisclaimerPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const SitemapPage = React.lazy(() => import('./pages/SitemapPage'));
const AccessibilityPage = React.lazy(() => import('./pages/AccessibilityPage'));
const GDPRPage = React.lazy(() => import('./pages/GDPRPage'));
const CCPAPage = React.lazy(() => import('./pages/CCPAPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const ShippingPolicyPage = React.lazy(() => import('./pages/ShippingPolicyPage'));
const ReturnPolicyPage = React.lazy(() => import('./pages/ReturnPolicyPage'));
const CookiePolicyPage = React.lazy(() => import('./pages/CookiePolicyPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const CareersPage = React.lazy(() => import('./pages/CareersPage'));
const FAQPage = React.lazy(() => import('./pages/FAQPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const RefundPage = React.lazy(() => import('./pages/RefundPage'));
const LegalDisclaimerPage = React.lazy(() => import('./pages/LegalDisclaimerPage'));
const DiagnosticPage = React.lazy(() => import('./pages/DiagnosticPage'));
const SuccessPage = React.lazy(() => import('./pages/SuccessPage'));
const CancelPage = React.lazy(() => import('./pages/CancelPage'));
const PaymentPendingPage = React.lazy(() => import('./pages/PaymentPendingPage'));

// End of imports cleanup

// Lazy Loaded Below-the-fold Components
const TransformationTimeline = React.lazy(() => import('./components/tools/TransformationTimeline'));
const SteroidReadinessQuiz = React.lazy(() => import('./components/tools/SteroidReadinessQuiz'));
const BenefitsSection = React.lazy(() => import('./components/marketing/BenefitsSection'));
const DailyIQChallenge = React.lazy(() => import('./components/tools/DailyIQChallenge'));
const AuthorSection = React.lazy(() => import('./components/marketing/AuthorSection'));
const PricingSection = React.lazy(() => import('./components/marketing/PricingSection'));
const FAQ = React.lazy(() => import('./components/marketing/FAQ'));
const ContactSection = React.lazy(() => import('./components/marketing/ContactSection'));
const LiveSchedule = React.lazy(() => import('./components/marketing/LiveSchedule'));
const ArabicVideoSection = React.lazy(() => import('./components/marketing/ArabicVideoSection'));

import { AuthProvider, useAuth } from './context/AuthContext';
import { usePreferences } from './context/PreferencesContext';
import { PreferencesProvider } from './context/PreferencesProvider';
import PreferencesModal from './components/modals/PreferencesModal';
import AuthGuard from './components/auth/AuthGuard';

// Lazy Loaded Components


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
}



function AppContent({
  theme, setTheme, colorTheme, changeColorTheme,
  currencyState, currentPage, navigateTo, isCheckoutOpen, setIsCheckoutOpen,
  selectedTier, setSelectedTier,
  legalState, setLegalState, setHasPurchased
}: AppContentProps) {
  const { language: lang, content, isRTL, isAutoDetected } = usePreferences();
  const { user, signOut } = useAuth();
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Sync ErrorHandler with localized content
  useEffect(() => {
    if (content) {
      import('./lib/error-handler').then(({ errorHandler }) => {
        errorHandler.setContent(content);
      });
    }
  }, [content]);

  // Audio Player State (Moved here to access lang)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-detection Toast Logic
  useEffect(() => {
    if (isAutoDetected) {
      const countryCode = localStorage.getItem('advanced_localization_state')
        ? JSON.parse(localStorage.getItem('advanced_localization_state')!).country
        : 'US';

      toast(content.toastLocalizationTitle || (isRTL ? 'تخصيص ذكي' : 'Smart Localization'), {
        description: (content.toastLocalizationDesc || (isRTL
          ? `تم ضبط اللغة والوحدات بناءً على موقعك ({country})`
          : `Language and units optimized for your region ({country}).`)).replace('{country}', countryCode),
        action: {
          label: content.changeButton || (isRTL ? 'تغيير' : 'Change'),
          onClick: () => setIsPreferencesOpen(true),
        },
        duration: 5000,
        icon: <Globe className="w-4 h-4 text-gold-500" />,
      });
    }
  }, [isAutoDetected, isRTL, content]);

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
    [Language.EN]: salesDataEn
  };
  const salesData = salesDataMap[lang] || salesDataEn;
  const footerKeywords = useMemo(() => getWeeklyKeywords(lang), [lang]);

  const sharedComponents = (
    <>
      <Header
        theme={theme} setTheme={setTheme}
        colorTheme={colorTheme} changeColorTheme={changeColorTheme}
        content={content} currentPage={currentPage} navigateTo={navigateTo}
        user={user} onLogout={signOut}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
      />
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        colorTheme={colorTheme}
        changeColorTheme={changeColorTheme}
      />
      <div className="flex-1">
        {currentPage === Page.HOME ? (
          <div className="animate-fade-in">
            <Hero content={content} openCheckout={openCheckout} playerState={playerState} />
            <div className="container mx-auto px-4 mb-20 animate-fade-in-up">
              <AdPlaceholder slotId="home_hero_bottom" content={content} />
            </div>
            <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"></div></div>}>
              {lang === Language.AR && <RevealOnScroll><ArabicVideoSection /></RevealOnScroll>}
              <RevealOnScroll><Features content={content} /></RevealOnScroll>
              <RevealOnScroll><LiveSchedule content={content} /></RevealOnScroll>
              <RevealOnScroll><TransformationTimeline content={content} /></RevealOnScroll>
              <RevealOnScroll><SteroidReadinessQuiz content={content} onComplete={() => navigateTo(Page.SIGNUP)} /></RevealOnScroll>
              <RevealOnScroll><BenefitsSection content={content} /></RevealOnScroll>
              <RevealOnScroll>
                <PricingSection
                  content={content}
                  openCheckout={openCheckout}
                />
              </RevealOnScroll>
              <RevealOnScroll><DailyIQChallenge content={content} onWin={() => toast.success(content.dailyIQ?.toastCorrect || "Correct!")} /></RevealOnScroll>
              <RevealOnScroll><AuthorSection content={content} /></RevealOnScroll>
              <RevealOnScroll><FAQ content={content} /></RevealOnScroll>
              <RevealOnScroll><ContactSection content={content} /></RevealOnScroll>
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
              {currentPage === Page.MACRO && <MacroCalculator content={content} navigateTo={navigateTo} />}
              {currentPage === Page.BODYFAT && <BodyFatCalculator content={content} navigateTo={navigateTo} />}
              {currentPage === Page.INJECTION && <InjectionMap content={content} navigateTo={navigateTo} />}
              {currentPage === Page.HALFLIFE && <HalfLifeVisualizer content={content} />}
              {currentPage === Page.LAB && <SmartLabReference content={content} navigateTo={navigateTo} />}
              {currentPage === Page.GENETIC && <GeneticPotentialCalculator content={content} navigateTo={navigateTo} />}
              {currentPage === Page.CYCLE_ARCHITECT && <AuthGuard requireSubscription={true}><CycleCalendarExporter content={content} navigateTo={navigateTo} /></AuthGuard>}
              {currentPage === Page.SMART_LANDING && <SmartBookLanding />}
              {currentPage === Page.LOGIN && <LoginPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.SIGNUP && <SignupPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.RESET_PASSWORD && <ResetPasswordPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.DASHBOARD && <AuthGuard><Dashboard navigateTo={navigateTo} /></AuthGuard>}
              {currentPage === Page.DIAGNOSTIC && <DiagnosticPage />}
              {currentPage === Page.PROFILE && <AuthGuard><ProfilePage user={user} content={content} navigateTo={navigateTo} /></AuthGuard>}
              {currentPage === Page.MEDICAL_DISCLAIMER && <MedicalDisclaimerPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.ABOUT && <AboutPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.SITEMAP && <SitemapPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.ACCESSIBILITY && <AccessibilityPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.GDPR && <GDPRPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.CCPA && <CCPAPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.BLOG && <BlogPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.SHIPPING_POLICY && <ShippingPolicyPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.RETURN_POLICY && <ReturnPolicyPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.COOKIE_POLICY && <CookiePolicyPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.SUPPORT && <SupportPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.CAREERS && <CareersPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.FAQ && <FAQPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.CONTACT && <ContactPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.PRIVACY && <PrivacyPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.TERMS && <TermsPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.REFUND && <RefundPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.LEGAL_DISCLAIMER_PAGE && <LegalDisclaimerPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.CHECKOUT && (
                <CheckoutPage
                  content={content} selectedTier={selectedTier}
                  navigateTo={navigateTo} onSuccess={() => navigateTo(Page.PAYMENT_SUCCESS)} openLegal={openLegal}
                />
              )}
              {currentPage === Page.PAYMENT_SUCCESS && <SuccessPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.PAYMENT_CANCEL && <CancelPage content={content} navigateTo={navigateTo} />}
              {currentPage === Page.PAYMENT_PENDING && (
                <PaymentPendingPage
                  transactionId={new URLSearchParams(window.location.search).get('txn') || ''}
                  navigateTo={navigateTo}
                  locale={lang}
                />
              )}
            </Suspense>
          </main>
        )}
      </div>
      <Footer content={content} navigateTo={navigateTo} openLegal={openLegal} pool={footerKeywords} />
      <ChatWidget content={content} />
      <WhatsAppButton />
      <FloatingSideIcon />
      {currentPage === Page.HOME && <SalesToast content={content} data={salesData} />}
      <BlockingDisclaimerModal content={content} />
      <LegalModal isOpen={legalState.isOpen} onClose={() => setLegalState(prev => ({ ...prev, isOpen: false }))} title={legalState.title} content={legalState.content} />
      <CheckoutModal
        isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} tier={selectedTier}
        content={content} navigateTo={navigateTo} onSuccess={() => setHasPurchased(true)} openLegal={openLegal}
        formattedPrice={selectedTier ? (currencyState.symbol + (selectedTier.price * currencyState.rate).toFixed(2)) : ''}
      />
      <Toaster
        position={isRTL ? 'top-left' : 'top-right'}
      />
    </>
  );

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen flex flex-col bg-background text-zinc-900 dark:text-zinc-100 transition-colors duration-300 ${lang === Language.AR ? 'font-arabic' : 'font-sans'}`}
    >
      {sharedComponents}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'dark');
  const [colorTheme, setColorTheme] = useState<string>(() => localStorage.getItem('colorTheme') || 'gold');
  const [currencyState, setCurrencyState] = useState<{ code: string; symbol: string; rate: number; locale: string }>({ code: 'USD', symbol: '$', rate: 1, locale: 'en-US' });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [, setHasPurchased] = useState(false);
  const [legalState, setLegalState] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: '', content: '' });
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);

  // Initialize Advanced Localization on Mount
  useEffect(() => {
    const initLoc = async () => {
      // NOTE: We rely on LanguageContext for language now.
      // But we still need currency and other detection from advancedLocalization
      const state = await initializeLocalization();
      setCurrencyState(state.currency);

      // Simple URL Router (Deep Linking)
      const path = window.location.pathname.toLowerCase();
      if (path === '/dashboard') {
        setCurrentPage(Page.DASHBOARD);
      } else if (path === '/diagnostic') {
        setCurrentPage(Page.DIAGNOSTIC);
      } else if (path === '/login') {
        setCurrentPage(Page.LOGIN);
      } else if (path === '/signup') {
        setCurrentPage(Page.SIGNUP);
      } else if (path === '/profile') {
        setCurrentPage(Page.PROFILE);
      } else if (path === '/about') {
        setCurrentPage(Page.ABOUT);
      } else if (path === '/sitemap') {
        setCurrentPage(Page.SITEMAP);
      } else if (path === '/accessibility') {
        setCurrentPage(Page.ACCESSIBILITY);
      } else if (path === '/gdpr') {
        setCurrentPage(Page.GDPR);
      } else if (path === '/ccpa') {
        setCurrentPage(Page.CCPA);
      } else if (path === '/blog') {
        setCurrentPage(Page.BLOG);
      } else if (path === '/shipping') {
        setCurrentPage(Page.SHIPPING_POLICY);
      } else if (path === '/returns') {
        setCurrentPage(Page.RETURN_POLICY);
      } else if (path === '/cookies') {
        setCurrentPage(Page.COOKIE_POLICY);
      } else if (path === '/support') {
        setCurrentPage(Page.SUPPORT);
      } else if (path === '/careers') {
        setCurrentPage(Page.CAREERS);
      } else if (path === '/faq') {
        setCurrentPage(Page.FAQ);
      } else if (path === '/contact') {
        setCurrentPage(Page.CONTACT);
      } else if (path === '/privacy') {
        setCurrentPage(Page.PRIVACY);
      } else if (path === '/terms') {
        setCurrentPage(Page.TERMS);
      } else if (path === '/refund') {
        setCurrentPage(Page.REFUND);
      } else if (path === '/disclaimer') {
        setCurrentPage(Page.LEGAL_DISCLAIMER_PAGE);
      } else if (path === '/success') {
        setCurrentPage(Page.PAYMENT_SUCCESS);
      } else if (path === '/cancel') {
        setCurrentPage(Page.PAYMENT_CANCEL);
      } else if (path === '/payment-pending') {
        setCurrentPage(Page.PAYMENT_PENDING);
      }

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
      <PreferencesProvider>
        <div id="scroll-progress" />
        <AppContent
          theme={theme} setTheme={setTheme}
          colorTheme={colorTheme} changeColorTheme={changeColorTheme}
          currencyState={currencyState}
          currentPage={currentPage} navigateTo={navigateTo}
          isCheckoutOpen={isCheckoutOpen} setIsCheckoutOpen={setIsCheckoutOpen}
          selectedTier={selectedTier} setSelectedTier={setSelectedTier}
          legalState={legalState} setLegalState={setLegalState} setHasPurchased={setHasPurchased}
        />
      </PreferencesProvider>
    </AuthProvider>
  );
}