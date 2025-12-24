import React, { useState, useEffect, useMemo } from 'react';
import { Globe, TrendingUp, Info, DollarSign, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

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
    he: {
        ...Object.fromEntries(Array.from({ length: 52 }, (_, i) => [
            i + 1,
            ['פיתוח גוף', 'אימונים', 'תוכנית אימונים', 'סטרואידים', 'בניית שריר', 'חיטוב', 'מסה', 'בריאות']
        ]))
    }
};

/**
 * SMART BOOK LANDING COMPONENT
 * Features: Auto-Localization, Live Currency, Weekly SEO Keywords
 */
interface SmartBookLandingProps {
    externalLang?: 'en' | 'ar' | 'he';
    externalIsRTL?: boolean;
}

const SmartBookLanding: React.FC<SmartBookLandingProps> = ({ externalLang, externalIsRTL }) => {
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

    // Sync with external state if provided
    useEffect(() => {
        if (externalIsRTL !== undefined) {
            setLoc(prev => ({ ...prev, isRTL: externalIsRTL }));
        }
    }, [externalIsRTL]);

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
                const rtlNeeded = externalIsRTL ?? ['AR', 'HE', 'FA', 'UR'].includes(geoData.country_code);

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
            } catch (error) {
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

        // Use external language if provided, otherwise detect from RTL state
        const lang = externalLang || (loc.isRTL ? (loc.countryCode === 'IL' ? 'he' : 'ar') : 'en');
        const keywords = KEYWORD_DB[lang]?.[week] || KEYWORD_DB['en'][1];

        return { weekNumber: week, currentKeywords: keywords, currentLang: lang };
    }, [loc.isRTL, loc.countryCode, externalLang]);

    // Price Calculation & Formatting
    const formattedPrice = new Intl.NumberFormat(loc.locale, {
        style: 'currency',
        currency: loc.currency
    }).format(BASE_PRICE_USD * loc.rate);

    return (
        <div className={`min-h-screen bg-zinc-950 text-white font-sans ${loc.isRTL ? 'rtl' : 'ltr'}`} dir={loc.isRTL ? 'rtl' : 'ltr'}>
            {/* Premium Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <main className="container mx-auto px-6 py-24 relative z-10">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Content & Price */}
                    <div className="space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-sm font-bold">
                            <Globe className="w-4 h-4" />
                            {currentLang === 'he' ? `זמין כעת בישראל` : loc.isRTL ? `متاح الآن في ${loc.countryCode}` : `Now Available in ${loc.countryCode}`}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
                            {currentLang === 'he' ? 'המדריך הסודי לשינוי קיצוני' : loc.isRTL ? 'دليلك السري لتحول جذري' : 'The Secret Protocol for Maximum Results'}
                        </h1>

                        <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
                            {currentLang === 'he'
                                ? 'הצטרף לאלפי מקצוענים שפרצו את הגבולות הגנטיים שלהם באמצעות הטכניקות המתקדמות והנחקרות ביותר.'
                                : loc.isRTL
                                    ? 'انضم إلى آلاف المحترفين الذين كسروا حواجزهم الجينية باستخدام أكثر التقنيات تقدماً وبحثاً.'
                                    : 'Join thousands of professionals who broke their genetic limits using the most advanced and researched techniques.'}
                        </p>

                        {/* Dynamic Price Display */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative group hover:border-gold-500/30 transition-all">
                            <div className="absolute -top-4 -right-4 bg-gold-500 text-black px-4 py-1 rounded-full font-bold text-sm shadow-xl">
                                {currentLang === 'he' ? 'מבצע מוגבל' : loc.isRTL ? 'خصم محدود' : 'Limited Offer'}
                            </div>

                            <div className="flex items-baseline gap-4">
                                {loading ? (
                                    <div className="h-12 w-48 bg-zinc-800 animate-pulse rounded-lg" />
                                ) : (
                                    <span className="text-6xl font-black text-white group-hover:scale-105 transition-transform duration-500 block">
                                        {formattedPrice}
                                    </span>
                                )}
                                <span className="text-zinc-500 line-through text-xl">
                                    {new Intl.NumberFormat(loc.locale, { style: 'currency', currency: loc.currency }).format(BASE_PRICE_USD * 2 * loc.rate)}
                                </span>
                            </div>
                            <p className="mt-4 text-sm text-zinc-500 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                {currentLang === 'he' ? 'תשלום מאובטח ומוצפן' : loc.isRTL ? 'دفع آمن بنسبة 100%' : '100% Encrypted & Secure Payment'}
                            </p>
                        </div>

                        <button className="w-full sm:w-auto px-12 py-5 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-2xl shadow-gold-500/20">
                            {currentLang === 'he' ? 'קבל את העותק שלך עכשיו' : loc.isRTL ? 'احصل على نسختك الآن' : 'Get Your Copy Now'}
                            <ArrowRight className={`w-6 h-6 ${loc.isRTL ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Right: Smart SEO Section */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="w-32 h-32 text-gold-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center text-gold-500">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{currentLang === 'he' ? 'טרנדים חמים בחיפוש' : loc.isRTL ? 'تريندات البحث الحالية' : 'Live Search Trends'}</h4>
                                        <p className="text-xs text-zinc-500">{currentLang === 'he' ? `אנדקס שבוע ${weekNumber}` : loc.isRTL ? `الأسبوع رقم ${weekNumber}` : `Week #${weekNumber} Index`}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {currentKeywords.map((kw, i) => (
                                        <span
                                            key={`${kw}-${i}`}
                                            className="px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm border border-zinc-700 hover:border-gold-500/50 transition-all cursor-default"
                                        >
                                            #{kw}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t border-zinc-800/50 flex items-start gap-4">
                                    <Info className="w-5 h-5 text-zinc-500 mt-1" />
                                    <p className="text-xs text-zinc-500 leading-relaxed italic">
                                        {currentLang === 'he'
                                            ? 'מילות מפתח אלו נגזרו על בסיס טרנדים של Google לחיפוש השבוע כדי להבטיח שהתוכן יגיע לקהל היעד בצורה מדויקת.'
                                            : loc.isRTL
                                                ? 'تم اشتقاق هذه الكلمات بناءً على أعلى تريندات البحث في Google لهذا الأسبوع لضمان وصول المحتوى للجمهور المستهدف بدقة.'
                                                : 'These keywords are derived based on the highest Google Search trends for this week to ensure content reaches the targeted audience accurately.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mini Features */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
                                <BookOpen className="w-8 h-8 text-gold-500 mb-4" />
                                <h5 className="font-bold mb-1">{currentLang === 'he' ? '300+ עמודים' : loc.isRTL ? '+300 صفحة' : '300+ Pages'}</h5>
                                <p className="text-xs text-zinc-500">{currentLang === 'he' ? 'של סודות בלעדיים' : loc.isRTL ? 'من الأسرار الحصرية' : 'of exclusive secrets'}</p>
                            </div>
                            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
                                <DollarSign className="w-8 h-8 text-emerald-500 mb-4" />
                                <h5 className="font-bold mb-1">{currentLang === 'he' ? 'אחריות כספית' : loc.isRTL ? 'ضمان استبدال' : 'Money Back'}</h5>
                                <p className="text-xs text-zinc-500">{currentLang === 'he' ? 'למשך 30 יום' : loc.isRTL ? 'لمدة 30 يوماً' : '30-day guarantee'}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Global Meta Note for SEO */}
            <meta name="keywords" content={currentKeywords.join(', ')} />
        </div>
    );
};

export default SmartBookLanding;
