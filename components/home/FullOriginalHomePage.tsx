'use client';

import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { useLegacyNavigation } from '../../lib/use-legacy-navigation';
import { Page, PricingTier, Language } from '@/shared/types/types';
import { footerKeywordsPoolAr, footerKeywordsPoolEn, salesDataAr, salesDataEn } from '../../i18n/data';
import { toast } from 'sonner';

import GlobalHeader from '../../shared/ui/GlobalHeader';
import Hero from '../../shared/ui/Hero';
import AdPlaceholder from '../../shared/ui/AdPlaceholder';
import { ArabicVideoSection } from '../../features/marketing/ArabicVideoSection';
import Features from '../../features/marketing/Features';
import LiveSchedule from '../../features/marketing/LiveSchedule';
import SteroidReadinessQuiz from '../../features/calculator/SteroidReadinessQuiz';
import BenefitsSection from '../../features/marketing/BenefitsSection';
import PricingSection from '../../features/marketing/PricingSection';
import DailyIQChallenge from '../../features/calculator/DailyIQChallenge';
import AuthorSection from '../../features/marketing/AuthorSection';
import ContactSection from '../../features/marketing/ContactSection';
import Footer from '../../shared/ui/Footer';
import WhatsAppButton from '../../shared/ui/WhatsAppButton';
import FloatingSideIcon from '../../shared/ui/FloatingSideIcon';
import SalesToast from '../../shared/ui/SalesToast';
import BlockingDisclaimerModal from '../../features/modal/BlockingDisclaimerModal';
import LegalModal from '../../features/modal/LegalModal';
import CheckoutModal from '../../features/modal/CheckoutModal';
import PreferencesModal from '../../features/modal/PreferencesModal';
import PaymobProductModal from '../../features/modal/PaymobProductModal';
import RevealOnScroll from '../../shared/ui/RevealOnScroll';

export default function FullOriginalHomePage() {
    const { content, isRTL, language: lang } = usePreferences();
    const { user, signOut } = useAuth();
    const navigateTo = useLegacyNavigation();

    // Audio Player State for Hero
    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlay = () => setIsPlaying((prev) => !prev);
    const playerState = { isPlaying, togglePlay };

    // Checkout & Modals State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const [isPaymobModalOpen, setIsPaymobModalOpen] = useState(false);
    const [paymobDefaultProductId] = useState<number | undefined>(undefined);
    const [colorTheme, setColorTheme] = useState('gold');

    const [legalState, setLegalState] = useState<{ isOpen: boolean; title: string; content: string }>({
        isOpen: false,
        title: '',
        content: '',
    });

    const openCheckout = (tier: PricingTier) => {
        setSelectedTier(tier);
        setIsCheckoutOpen(true);
    };

    const openLegal = (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => {
        const titleMap: Record<string, string> = {
            privacy: content.privacyPolicy || 'Privacy Policy',
            terms: content.termsOfService || 'Terms of Service',
            refund: content.returnPolicyTitle || 'Refund Policy',
            disclaimer: content.disclaimerTitle || 'Medical Disclaimer',
        };
        const contentObj = content as unknown as Record<string, string>;
        const contentMap: Record<string, string> = {
            privacy: content.privacyPolicyContent || content.privacyPolicy || '',
            terms: content.termsOfServiceContent || content.termsOfService || '',
            refund: contentObj.refundPolicyContent || contentObj.returnPolicyContent || '',
            disclaimer: content.legalDisclaimer || '',
        };
        setLegalState({
            isOpen: true,
            title: titleMap[key] || '',
            content: contentMap[key] || '',
        });
    };

    const footerKeywords = isRTL ? footerKeywordsPoolAr : footerKeywordsPoolEn;
    const salesData = isRTL ? salesDataAr : salesDataEn;

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-background text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <GlobalHeader
                content={content}
                currentPage={Page.HOME}
                navigateTo={navigateTo}
                user={user}
                onLogout={signOut}
                onOpenPreferences={() => setIsPreferencesOpen(true)}
            />

            <main className="flex-1 animate-fade-in">
                {/* Hero Section */}
                <Hero content={content} openCheckout={openCheckout} playerState={playerState} />

                {/* Ad / Spacing */}
                <div className="container mx-auto px-4 mb-20 animate-fade-in-up">
                    <AdPlaceholder slotId="home_hero_bottom" content={content} />
                </div>

                {/* Arabic Explainer Video (shows for Arabic audience) */}
                {lang === Language.AR && (
                    <RevealOnScroll>
                        <ArabicVideoSection />
                    </RevealOnScroll>
                )}

                {/* Features: "ماذا يوجد داخل هذا الكتاب؟" */}
                <RevealOnScroll>
                    <Features content={content} />
                </RevealOnScroll>

                {/* Live Schedule */}
                <RevealOnScroll>
                    <LiveSchedule content={content} />
                </RevealOnScroll>

                {/* Steroid Readiness Quiz */}
                <RevealOnScroll>
                    <SteroidReadinessQuiz content={content} onComplete={() => navigateTo(Page.SIGNUP)} />
                </RevealOnScroll>

                {/* Benefits: "لماذا 'مستر إكس ستيرويد' هو أفضل استثمار لك؟" */}
                <RevealOnScroll>
                    <BenefitsSection content={content} />
                </RevealOnScroll>

                {/* Pricing Tiers & Packages */}
                <RevealOnScroll>
                    <PricingSection content={content} openCheckout={openCheckout} />
                </RevealOnScroll>

                {/* Daily IQ Challenge */}
                <RevealOnScroll>
                    <DailyIQChallenge content={content} onWin={() => toast.success(content.dailyIQ?.toastCorrect || 'Correct!')} />
                </RevealOnScroll>

                {/* Author Section */}
                <RevealOnScroll>
                    <AuthorSection content={content} />
                </RevealOnScroll>

                {/* Contact Section */}
                <RevealOnScroll>
                    <ContactSection content={content} />
                </RevealOnScroll>
            </main>

            {/* Footer */}
            <Footer content={content} navigateTo={navigateTo} openLegal={openLegal} pool={footerKeywords} />

            {/* Floating Utilities */}
            <WhatsAppButton />
            <FloatingSideIcon />
            <SalesToast content={content} data={salesData} />
            <BlockingDisclaimerModal content={content} />

            {/* Modals */}
            <LegalModal isOpen={legalState.isOpen} onClose={() => setLegalState((prev) => ({ ...prev, isOpen: false }))} title={legalState.title} content={legalState.content} />
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                tier={selectedTier}
                content={content}
                navigateTo={navigateTo}
                onSuccess={() => {}}
                openLegal={openLegal}
                formattedPrice=""
            />
            <PreferencesModal
                isOpen={isPreferencesOpen}
                onClose={() => setIsPreferencesOpen(false)}
                colorTheme={colorTheme}
                changeColorTheme={setColorTheme}
            />
            <PaymobProductModal isOpen={isPaymobModalOpen} onClose={() => setIsPaymobModalOpen(false)} defaultProductId={paymobDefaultProductId} lang={lang as 'ar' | 'en'} />
        </div>
    );
}
