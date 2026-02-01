import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, Info, DollarSign, ArrowRight, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { toast } from 'sonner';
import { DisclaimerModal } from '../modals/DisclaimerModal';
import {
    arContent, enContent
} from '../../i18n';
import { ContentStrings } from '../../types';
import AdPlaceholder from '../shared/AdPlaceholder';
import { StyledBrandName } from '../shared/StyledBrandName';

/**
 * INTERFACES
 */
interface LocalizationData {
    countryCode: string;
    currency: string;
    rate: number;
    locale: string;
    isRTL: boolean;
}

interface SEOKeywordDb {
    [lang: string]: {
        [week: number]: string[];
    };
}

/**
 * MOCK KEYWORD DATABASE (SEO Trends logic)
 */
const KEYWORD_DB: SEOKeywordDb = {
    ar: {
        ...Object.fromEntries(Array.from({ length: 52 }, (_, i) => [
            i + 1,
            ['كمال أجسام', 'جدول تمارين', 'مكملات غذائية', 'ستيرويد آمن', 'بناء عضلات', 'تضخيم', 'تنشيف', 'نصائح طبية', 'حرق دهون']
        ]))
    },
    en: {
        ...Object.fromEntries(Array.from({ length: 52 }, (_, i) => [
            i + 1,
            ['bodybuilding guide', 'workout routines', 'steroid education', 'muscle growth', 'hypertrophy', 'fat loss', 'performance enhancement', 'gym motivation']
        ]))
    },

};

/**
 * SMART BOOK LANDING COMPONENT
 * Features: Auto-Localization, Live Currency, Weekly SEO Keywords
 */
interface SmartBookLandingProps {
    externalLang?: 'en' | 'ar';
    externalIsRTL?: boolean;
}

const SmartBookLanding: React.FC<SmartBookLandingProps> = ({ externalLang, externalIsRTL }) => {
    const { isRTL, language: globalLang } = usePreferences();
    const BASE_PRICE_USD = 49.99;

    // State
    const [loc, setLoc] = useState<LocalizationData>({
        countryCode: 'US',
        currency: 'USD',
        rate: 1,
        locale: 'en-US',
        isRTL: externalIsRTL || false
    });
    const [loading, setLoading] = useState(true);
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    const contentMap: Record<string, ContentStrings> = {
        ar: arContent, en: enContent
    };

    // Sync with external state if provided

    /**
     * 1. AUTO-LOCALIZATION & CURRENCY ENGINE
     */
    useEffect(() => {
        const fetchLocalization = async () => {
            try {
                setLoading(true);
                // Step A: Geolocation
                const geoRes = await fetch('https://ipapi.co/json/');
                const geoData = await geoRes.json();

                const country = geoData.country_code || 'US';
                const userCurr = geoData.currency || 'USD';
                const userLocale = geoData.languages?.split(',')[0] || 'en-US';
                const rtlNeeded = externalIsRTL ?? ['AR', 'FA', 'UR'].includes(geoData.country_code);

                // Step B: Live Currency Conversion
                const rateRes = await fetch(`https://open.er-api.com/v6/latest/USD`);
                const rateData = await rateRes.json();
                const conversionRate = rateData.rates[userCurr] || 1;

                setLoc(prev => ({
                    ...prev,
                    countryCode: country,
                    currency: userCurr,
                    rate: conversionRate,
                    locale: userLocale,
                    isRTL: rtlNeeded
                }));
            } catch {
                console.warn('Localization engine blocked or failed. Using base defaults.');
            } finally {
                setLoading(false);
            }
        };

        fetchLocalization();
    }, [externalIsRTL]);

    /**
     * 2. SMART SEO KEYWORD LOGIC
     */
    const { weekNumber, currentKeywords, currentLang } = useMemo(() => {
        // Get ISO week number
        const target = new Date();
        const dayNr = (target.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.getTime();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
        }
        const week = 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);

        // Use external language if provided, otherwise detect from global settings or RTL state
        const lang = externalLang || globalLang || (loc.isRTL ? 'ar' : 'en');
        const keywords = KEYWORD_DB[lang]?.[week] || KEYWORD_DB['en'][1];

        return { weekNumber: week, currentKeywords: keywords, currentLang: lang };
    }, [loc.isRTL, externalLang, globalLang]);

    // Price Calculation & Formatting
    const formattedPrice = new Intl.NumberFormat(loc.locale, {
        style: 'currency',
        currency: loc.currency
    }).format(BASE_PRICE_USD * loc.rate);

    // SpaceRemit Integration
    // SpaceRemit Integration (Script loaded in index.html)

    const handlePayment = () => {
        if (window.SpaceRemit) {
            window.SpaceRemit.Pay({
                publicKey: import.meta.env.VITE_SPACEREMIT_PUBLIC_KEY || 'pk_test_DEFAULT', // Use env variable
                amount: BASE_PRICE_USD * loc.rate,
                currency: loc.currency,
                productName: 'Mr. X-Steroid Complete Guide',
                productDescription: 'The ultimate bodybuilding and steroid cycle guide.',
                referenceId: `ORDER-${Date.now()}`
            });
        } else {
            console.error('SpaceRemit SDK not loaded');
            toast.error(isRTL ? 'نظام الدفع قيد التحميل... يرجى المحاولة مرة أخرى لاحقاً.' : 'Payment system loading... please try again in a moment.');
        }
    };



    const content = contentMap[currentLang] || enContent;

    return (
        <div className={`min-h-screen bg-background text-foreground font-sans ${loc.isRTL || isRTL ? 'rtl' : 'ltr'} relative overflow-hidden`} dir={loc.isRTL || isRTL ? 'rtl' : 'ltr'}>

            {showDisclaimer && (
                <DisclaimerModal
                    content={content}
                    isRTL={loc.isRTL || isRTL}
                    onAgree={() => setShowDisclaimer(false)}
                />
            )}

            {/* Massive Background Glows */}
            <div className="absolute top-0 end-0 w-[800px] h-[800px] bg-gold-500/10 blur-[150px] rounded-full animate-float-slow -z-10"></div>
            <div className="absolute bottom-0 start-0 w-[600px] h-[600px] bg-blue-500/10 blur-[130px] rounded-full animate-float-slow -z-10 [animation-delay:-5s]"></div>

            <main className="container mx-auto px-6 py-32 relative z-10">
                {/* AdSlot: Landing Top */}
                <div className="mb-20">
                    <AdPlaceholder slotId="landing_top_banner" format="horizontal" content={content} />
                </div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left: Content & Price */}
                    <div className="space-y-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gold-500/10 border-2 border-gold-500/20 text-gold-500 text-lg font-black shadow-[0_0_20px_rgba(234,179,8,0.2)] animate-glow"
                        >
                            <Globe className="w-5 h-5 animate-spin-slow" />
                            {content.landingAvailableIn} {loc.countryCode}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500 animate-text-flash tracking-tighter text-balance"
                        >
                            <StyledBrandName text={content.landingSubtitle} />
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl text-zinc-400 leading-relaxed max-w-2xl font-medium italic"
                        >
                            <StyledBrandName text={content.landingDescription} />
                        </motion.p>

                        {/* Updated Flashy Price Card */}
                        <motion.div
                            whileHover={{ scale: 1.02, rotate: [-0.5, 0.5, 0] }}
                            className="p-10 rounded-[3rem] bg-background/50 border-4 border-gold-500/30 backdrop-blur-3xl relative group shadow-[0_0_50px_rgba(234,179,8,0.1)] card-shine animate-glow"
                        >
                            <div className="absolute -top-6 end-[-1.5rem] bg-gold-500 text-black px-6 py-2 rounded-full font-black text-lg shadow-[0_0_30px_rgba(234,179,8,0.5)] animate-bounce">
                                {content.landingFlashSale}
                            </div>

                            <div className="flex items-center gap-6 flex-wrap">
                                {loading ? (
                                    <div className="h-20 w-64 bg-zinc-800 animate-pulse rounded-2xl" />
                                ) : (
                                    <span className="text-7xl md:text-8xl font-black text-white group-hover:scale-110 transition-transform duration-500 block drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                        {formattedPrice}
                                    </span>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-zinc-500 line-through text-3xl font-black">
                                        {new Intl.NumberFormat(loc.locale, { style: 'currency', currency: loc.currency }).format(BASE_PRICE_USD * 2.5 * loc.rate)}
                                    </span>
                                    <span className="text-gold-500 text-base font-black uppercase tracking-widest mt-1">{content.landingSavePercentage}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                <p className="text-lg text-zinc-400 flex items-center gap-3 font-bold">
                                    <ShieldCheck className="w-6 h-6 text-green-500 animate-pulse" />
                                    {content.landingSecurePayment}
                                </p>
                                <Zap className="w-8 h-8 text-gold-500 animate-pulse fill-gold-500" />
                            </div>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.1, rotateX: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePayment}
                            className="w-full sm:w-auto px-16 py-6 bg-gold-500 hover:bg-gold-400 text-black font-black text-2xl rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] animate-glow relative overflow-hidden group"
                        >
                            <span className="relative z-10">
                                {content.landingClaimDownload}
                            </span>
                            <ArrowRight className={`w-8 h-8 relative z-10 ${loc.isRTL || isRTL ? 'rotate-180' : ''} group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform`} />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                        </motion.button>
                    </div>

                    {/* Right: Smart SEO Section */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-background/40 p-10 rounded-[4rem] border-2 border-zinc-800 shadow-2xl relative overflow-hidden group backdrop-blur-3xl animate-glow"
                        >
                            <div className="absolute -top-10 end-[-2.5rem] p-12 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:rotate-45 group-hover:scale-150">
                                <TrendingUp className="w-48 h-48 text-gold-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gold-500/20 flex items-center justify-center text-gold-500 shadow-xl group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-2xl tracking-tight">{content.landingLiveTrends}</h4>
                                        <p className="text-base text-zinc-500 font-black tracking-widest uppercase">{content.landingWeekIndex?.replace('#{week}', weekNumber.toString())}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {currentKeywords.map((kw, i) => (
                                        <motion.span
                                            whileHover={{ scale: 1.1, backgroundColor: "rgba(234, 179, 8, 0.2)", color: "#EAB308" }}
                                            key={`${kw}-${i}`}
                                            className="px-5 py-3 bg-white/5 text-zinc-300 rounded-2xl text-base font-bold border border-white/10 transition-all cursor-pointer hover:border-gold-500/50"
                                        >
                                            #{kw}
                                        </motion.span>
                                    ))}
                                </div>

                                <div className="mt-10 pt-10 border-t border-white/5 flex items-start gap-6">
                                    <Info className="w-8 h-8 text-zinc-600 mt-1" />
                                    <p className="text-base text-zinc-500 leading-relaxed italic font-medium">
                                        <StyledBrandName text={content.landingTrendsDisclaimer} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Mini Features Cards */}
                        <div className="grid grid-cols-2 gap-8">
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="p-8 bg-background/80 border-2 border-zinc-800 rounded-[2.5rem] shadow-xl animate-glow"
                            >
                                <BookOpen className="w-10 h-10 text-gold-500 mb-6 animate-pulse" />
                                <h5 className="font-black text-2xl mb-2">{loc.isRTL || isRTL ? '+300 صفحة' : '300+ PAGES'}</h5>
                                <p className="text-base text-zinc-500 font-bold uppercase tracking-widest">{content.landingExclusiveSecrets}</p>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="p-8 bg-zinc-900/80 border-2 border-zinc-800 rounded-[2.5rem] shadow-xl animate-glow"
                            >
                                <DollarSign className="w-10 h-10 text-emerald-500 mb-6 animate-pulse" />
                                <h5 className="font-black text-2xl mb-2">{loc.isRTL || isRTL ? 'ضمان استرداد' : 'MONEY BACK'}</h5>
                                <p className="text-base text-zinc-500 font-bold uppercase tracking-widest">{content.landingMoneyBackGuarantee}</p>
                            </motion.div>
                        </div>
                    </div>

                </div>
                {/* AdSlot: Landing Bottom */}
                <div className="mt-20">
                    <AdPlaceholder slotId="landing_bottom_banner" format="horizontal" content={content} />
                </div>
            </main>

            {/* Global Meta Note for SEO */}
            <meta name="keywords" content={currentKeywords.join(', ')} />
        </div>
    );
};

export default SmartBookLanding;
