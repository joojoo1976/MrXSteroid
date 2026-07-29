import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import {
  ArrowLeft, Globe
} from 'lucide-react';
import { LazyMotion, domAnimation } from "framer-motion";
import { toast } from 'sonner';
import { Toaster } from './shared/ui/sonner';

// Types & Data
import { Page, Language, PricingTier } from './shared/types/types';
import {
  salesDataAr, salesDataEn
} from './i18n';
import { getWeeklyKeywords } from './shared/lib/keywordGenerator';

import { initializeLocalization } from './shared/lib/logic';

// Major Components - Fixed paths (actual location: src/shared/ui/)
import Header from './shared/ui/Header';
import Hero from './shared/ui/Hero';
import Features from './features/marketing/Features';
import Footer from './shared/ui/Footer';
import AdPlaceholder from './shared/ui/AdPlaceholder';
import RevealOnScroll from './shared/ui/RevealOnScroll';
import SEO from './shared/ui/SEO';

// Refactored Components - Fixed paths (actual location: src/features/modal/)
import BlockingDisclaimerModal from './features/modal/BlockingDisclaimerModal';
import LegalModal from './features/modal/LegalModal';
import CheckoutModal from './features/modal/CheckoutModal';
import SalesToast from './shared/ui/SalesToast';
import WhatsAppButton from './shared/ui/WhatsAppButton';
import FloatingSideIcon from './shared/ui/FloatingSideIcon';

import { AuthProvider, useAuth } from './context/AuthContext';
import { usePreferences } from './context/PreferencesContext';
import { PreferencesProvider } from './context/PreferencesProvider';
import { RegionProvider } from './context/RegionContext';
import PreferencesModal from './features/modal/PreferencesModal';
import AuthGuard from './features/auth/AuthGuard';
import { useTheme } from './hooks/useTheme';

// Note: SmartBookLanding, LoginPage, SignupPage, ResetPasswordPage moved to Lazy Loaded section below

// Lazy Loaded Components - Fixed paths (actual location: src/features/calculator/)
const MacroCalculator = React.lazy(() => import('./features/calculator/MacroCalculator'));
const BodyFatCalculator = React.lazy(() => import('./features/calculator/BodyFatCalculator'));
const InjectionMap = React.lazy(() => import('./features/calculator/InjectionMap'));
const HalfLifeVisualizer = React.lazy(() => import('./features/calculator/HalfLifeVisualizer'));
const SmartLabReference = React.lazy(() => import('./features/calculator/SmartLabReference'));
const GeneticPotentialCalculator = React.lazy(() => import('./features/calculator/GeneticPotentialCalculator'));
const CycleCalendarExporter = React.lazy(() => import('./features/calculator/CycleCalendarExporter'));
const MasterCalculator = React.lazy(() => import('./features/calculator/MasterCalculator'));
const MedicalDisclaimerPage = React.lazy(() => import('./shared/ui/MedicalDisclaimerPage'));
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
const RepresentativePage = React.lazy(() => import('./pages/RepresentativePage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AuthCallbackPage = React.lazy(() => import('./pages/AuthCallbackPage'));
const PaymentConfigDiagnostic = React.lazy(() => import('./pages/PaymentConfigDiagnostic'));

// Lazy Loaded Auth & Landing Pages (Optimization)
const SmartBookLanding = React.lazy(() => import('./features/marketing/SmartBookLanding'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));

// End of imports cleanup

// Lazy Loaded Below-the-fold Components - Fixed paths (actual location: src/features/)
const TransformationTimeline = React.lazy(() => import('./features/calculator/TransformationTimeline'));
const SteroidReadinessQuiz = React.lazy(() => import('./features/calculator/SteroidReadinessQuiz'));
const BenefitsSection = React.lazy(() => import('./features/marketing/BenefitsSection'));
const DailyIQChallenge = React.lazy(() => import('./features/calculator/DailyIQChallenge'));
const AuthorSection = React.lazy(() => import('./features/marketing/AuthorSection'));
const PricingSection = React.lazy(() => import('./features/marketing/PricingSection'));
const FAQ = React.lazy(() => import('./features/marketing/FAQ'));
const ContactSection = React.lazy(() => import('./features/marketing/ContactSection'));
const LiveSchedule = React.lazy(() => import('./features/marketing/LiveSchedule'));
const ArabicVideoSection = React.lazy(() => import('./features/marketing/ArabicVideoSection'));

interface AppContentProps {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
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
  theme, resolvedTheme, setTheme, colorTheme, changeColorTheme,
  currencyState, currentPage, navigateTo, isCheckoutOpen, setIsCheckoutOpen,
  selectedTier, setSelectedTier,
  legalState, setLegalState, setHasPurchased
}: AppContentProps) {
  const { language: lang, content, isRTL, isAutoDetected } = usePreferences();
  const { user, signOut } = useAuth();
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Global navigation custom event listener (e.g. from Toast notifications)
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'signup') navigateTo(Page.SIGNUP);
      else if (customEvent.detail === 'login') navigateTo(Page.LOGIN);
    };
    window.addEventListener('mrx_navigate_page', handleNavigate);
    return () => window.removeEventListener('mrx_navigate_page', handleNavigate);
  }, [navigateTo]);

  // Sync ErrorHandler with localized content
  useEffect(() => {
    if (content) {
      import('./shared/lib/error-handler').then(({ errorHandler }) => {
        errorHandler.setContent(content);
      });
    }
  }, [content]);

  // Audio Player State (Moved here to access lang)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-detection Toast Logic (Removed as requested by user)

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
        theme={theme} resolvedTheme={resolvedTheme} setTheme={setTheme}
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
        theme={theme}
        setTheme={setTheme}
      />
      <div className="flex-1">
        {currentPage === Page.HOME ? (
          <main className="animate-fade-in">
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
          </main>
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
              {currentPage === Page.CYCLE_ARCHITECT && <AuthGuard requireSubscription={true} navigateTo={navigateTo}><CycleCalendarExporter content={content} navigateTo={navigateTo} /></AuthGuard>}
              {currentPage === Page.MASTER_CALCULATOR && <AuthGuard requireSubscription={true} navigateTo={navigateTo}><MasterCalculator navigateTo={navigateTo} /></AuthGuard>}
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
              {currentPage === Page.REPRESENTATIVE && <AuthGuard><RepresentativePage /></AuthGuard>}
              {currentPage === Page.ADMIN_DASHBOARD && <AuthGuard><AdminDashboard /></AuthGuard>}
              {currentPage === Page.AUTH_CALLBACK && <AuthCallbackPage />}
              {currentPage === Page.PAYMENT_CONFIG_DIAGNOSTIC && <PaymentConfigDiagnostic />}
            </Suspense>
          </main>
        )}
      </div>
      <Footer content={content} navigateTo={navigateTo} openLegal={openLegal} pool={footerKeywords} />
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
  const { theme, resolvedTheme, setTheme } = useTheme();
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

      // Map paths to Page enum for robust routing
      const getPageFromPath = (path: string): Page | null => {
        const p = path.replace(/^\//, '');
        if (!p) return Page.HOME;

        const pathMap: Record<string, Page> = {
          'dashboard': Page.DASHBOARD,
          'diagnostic': Page.DIAGNOSTIC,
          'login': Page.LOGIN,
          'signup': Page.SIGNUP,
          'profile': Page.PROFILE,
          'about': Page.ABOUT,
          'sitemap': Page.SITEMAP,
          'accessibility': Page.ACCESSIBILITY,
          'gdpr': Page.GDPR,
          'ccpa': Page.CCPA,
          'blog': Page.BLOG,
          'shipping': Page.SHIPPING_POLICY,
          'returns': Page.RETURN_POLICY,
          'cookies': Page.COOKIE_POLICY,
          'support': Page.SUPPORT,
          'careers': Page.CAREERS,
          'faq': Page.FAQ,
          'contact': Page.CONTACT,
          'privacy': Page.PRIVACY,
          'terms': Page.TERMS,
          'refund': Page.REFUND,
          'disclaimer': Page.LEGAL_DISCLAIMER_PAGE,
          'success': Page.PAYMENT_SUCCESS,
          'payment-success': Page.PAYMENT_SUCCESS,
          'cancel': Page.PAYMENT_CANCEL,
          'payment-cancel': Page.PAYMENT_CANCEL,
          'payment-pending': Page.PAYMENT_PENDING,
          'representative': Page.REPRESENTATIVE,
          'admin': Page.ADMIN_DASHBOARD,
          'auth/callback': Page.AUTH_CALLBACK,
          'callback': Page.AUTH_CALLBACK,
          'macro': Page.MACRO,
          'bodyfat': Page.BODYFAT,
          'injection': Page.INJECTION,
          'halflife': Page.HALFLIFE,
          'lab': Page.LAB,
          'genetic': Page.GENETIC,
          'cycle': Page.CYCLE_ARCHITECT,
          'payment-diagnostic': Page.PAYMENT_CONFIG_DIAGNOSTIC
        };
        return pathMap[p] || null;
      };

      // Simple URL Router (Deep Linking)
      const path = window.location.pathname.toLowerCase();
      const initialPage = getPageFromPath(path);
      if (initialPage) setCurrentPage(initialPage);

      // Check for reset_password flow
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('page') === 'reset_password') {
        setCurrentPage(Page.RESET_PASSWORD);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    initLoc();

    // Browser back/forward support
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/^\//, '');
      const pathMap: Record<string, Page> = {
        '': Page.HOME,
        'dashboard': Page.DASHBOARD,
        'diagnostic': Page.DIAGNOSTIC,
        'login': Page.LOGIN,
        'signup': Page.SIGNUP,
        'profile': Page.PROFILE,
        'about': Page.ABOUT,
        'sitemap': Page.SITEMAP,
        'accessibility': Page.ACCESSIBILITY,
        'gdpr': Page.GDPR,
        'ccpa': Page.CCPA,
        'blog': Page.BLOG,
        'shipping': Page.SHIPPING_POLICY,
        'returns': Page.RETURN_POLICY,
        'cookies': Page.COOKIE_POLICY,
        'support': Page.SUPPORT,
        'careers': Page.CAREERS,
        'faq': Page.FAQ,
        'contact': Page.CONTACT,
        'privacy': Page.PRIVACY,
        'terms': Page.TERMS,
        'refund': Page.REFUND,
        'disclaimer': Page.LEGAL_DISCLAIMER_PAGE,
        'success': Page.PAYMENT_SUCCESS,
        'payment-success': Page.PAYMENT_SUCCESS,
        'cancel': Page.PAYMENT_CANCEL,
        'payment-cancel': Page.PAYMENT_CANCEL,
        'payment-pending': Page.PAYMENT_PENDING,
        'representative': Page.REPRESENTATIVE,
        'admin': Page.ADMIN_DASHBOARD,
        'auth/callback': Page.AUTH_CALLBACK,
        'callback': Page.AUTH_CALLBACK,
        'macro': Page.MACRO,
        'bodyfat': Page.BODYFAT,
        'injection': Page.INJECTION,
        'halflife': Page.HALFLIFE,
        'lab': Page.LAB,
        'genetic': Page.GENETIC,
        'cycle': Page.CYCLE_ARCHITECT,
        'payment-diagnostic': Page.PAYMENT_CONFIG_DIAGNOSTIC
      };
      setCurrentPage(pathMap[path] || Page.HOME);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);



  // Apply Color Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-gold', 'theme-blue', 'theme-red', 'theme-green', 'theme-purple');
    root.classList.add(`theme-${colorTheme}`);
  }, [colorTheme]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL without reload
    const pathMap: Record<Page, string> = {
      [Page.HOME]: '/',
      [Page.DASHBOARD]: '/dashboard',
      [Page.DIAGNOSTIC]: '/diagnostic',
      [Page.LOGIN]: '/login',
      [Page.SIGNUP]: '/signup',
      [Page.PROFILE]: '/profile',
      [Page.ABOUT]: '/about',
      [Page.SITEMAP]: '/sitemap',
      [Page.ACCESSIBILITY]: '/accessibility',
      [Page.GDPR]: '/gdpr',
      [Page.CCPA]: '/ccpa',
      [Page.BLOG]: '/blog',
      [Page.SHIPPING_POLICY]: '/shipping',
      [Page.RETURN_POLICY]: '/returns',
      [Page.COOKIE_POLICY]: '/cookies',
      [Page.SUPPORT]: '/support',
      [Page.CAREERS]: '/careers',
      [Page.FAQ]: '/faq',
      [Page.CONTACT]: '/contact',
      [Page.PRIVACY]: '/privacy',
      [Page.TERMS]: '/terms',
      [Page.REFUND]: '/refund',
      [Page.LEGAL_DISCLAIMER_PAGE]: '/disclaimer',
      [Page.PAYMENT_SUCCESS]: '/success',
      [Page.PAYMENT_CANCEL]: '/cancel',
      [Page.PAYMENT_PENDING]: '/payment-pending',
      [Page.REPRESENTATIVE]: '/representative',
      [Page.ADMIN_DASHBOARD]: '/admin',
      [Page.AUTH_CALLBACK]: '/auth/callback',
      [Page.MACRO]: '/macro',
      [Page.BODYFAT]: '/bodyfat',
      [Page.INJECTION]: '/injection',
      [Page.HALFLIFE]: '/halflife',
      [Page.LAB]: '/lab',
      [Page.GENETIC]: '/genetic',
      [Page.CYCLE_ARCHITECT]: '/cycle',
      [Page.MASTER_CALCULATOR]: '/master-calculator',
      [Page.SMART_LANDING]: '/smart-landing',
      [Page.MEDICAL_DISCLAIMER]: '/medical-disclaimer',
      [Page.RESET_PASSWORD]: '/reset-password',
      [Page.PAYMENT_CONFIG_DIAGNOSTIC]: '/payment-diagnostic',
      [Page.CHECKOUT]: '/checkout',
    };

    const targetPath = pathMap[page] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page }, '', targetPath);
    }
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
      <RegionProvider>
        <PreferencesProvider>
        <SEO currentPage={currentPage} />
        <div id="scroll-progress" />
        <LazyMotion features={domAnimation}>
          <AppContent
            theme={theme} resolvedTheme={resolvedTheme} setTheme={setTheme}
            colorTheme={colorTheme} changeColorTheme={changeColorTheme}
            currencyState={currencyState}
            currentPage={currentPage} navigateTo={navigateTo}
            isCheckoutOpen={isCheckoutOpen} setIsCheckoutOpen={setIsCheckoutOpen}
            selectedTier={selectedTier} setSelectedTier={setSelectedTier}
            legalState={legalState} setLegalState={setLegalState} setHasPurchased={setHasPurchased}
          />
        </LazyMotion>
      </PreferencesProvider>
      </RegionProvider>
    </AuthProvider>
  );
}