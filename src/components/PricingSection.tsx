import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import { ContentStrings, PricingTier, Currency } from '../types';
import CurrencyPrice from './CurrencyPrice';
import { renderStyledBrandName } from '../utils/logic';

interface PricingSectionProps {
    content: ContentStrings;
    currency: Currency;
    locale: string;
    openCheckout: (tier: PricingTier) => void;
    isRTL: boolean;
}

const PricingCard: React.FC<{
    tier: PricingTier;
    idx: number;
    currency: Currency;
    locale: string;
    isRTL: boolean;
    openCheckout: (tier: PricingTier) => void;
}> = ({ tier, idx, currency, locale, isRTL, openCheckout }) => {
    const [bookLang, setBookLang] = React.useState<'en' | 'ar'>('ar');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col h-full ${tier.isPopular
                ? 'bg-zinc-900 border-gold-500 shadow-[0_20px_50px_rgba(234,179,8,0.15)] ring-4 ring-gold-500/10 scale-105 z-10'
                : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50'
                }`}
        >
            {tier.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {tier.popularLabel || "Most Popular"}
                </div>
            )}

            <div className="mb-6">
                <h3 className={`text-xl font-black mb-2 ${tier.isPopular ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                    {tier.name}
                </h3>
                <div className="flex items-baseline gap-2 flex-wrap">
                    <CurrencyPrice
                        basePrice={tier.price}
                        targetCurrency={currency}
                        locale={locale}
                        showTransition={true}
                        className={`text-4xl font-black ${tier.isPopular ? 'text-gold-500' : 'text-zinc-900 dark:text-white'}`}
                    />
                    {tier.originalPrice && (
                        <span className="text-zinc-500 line-through text-sm font-bold opacity-60">
                            {tier.originalPrice}
                        </span>
                    )}
                </div>
                <p className={`mt-3 text-sm font-medium leading-relaxed ${tier.isPopular ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {renderStyledBrandName(tier.description)}
                </p>
            </div>

            {/* Language Selector UI */}
            <div className="mb-6 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
                <label htmlFor={`book-lang-select-${idx}`} className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                    {isRTL ? "لغة الكتاب" : "Book Language"}
                </label>
                <select
                    id={`book-lang-select-${idx}`}
                    value={bookLang}
                    onChange={(e) => setBookLang(e.target.value as 'en' | 'ar')}
                    title={isRTL ? "لغة الكتاب" : "Book Language"}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                >
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">English (الإنجليزية)</option>
                </select>
            </div>

            <div className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                        <div className={`mt-1 rounded-full p-0.5 ${tier.isPopular ? 'bg-gold-500/20 text-gold-500' : 'bg-green-500/20 text-green-500'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className={`text-xs font-medium ${tier.isPopular ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'}`}>
                            {renderStyledBrandName(feature)}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => openCheckout({ ...tier, selectedLanguage: bookLang } as PricingTier & { selectedLanguage: 'en' | 'ar' })}
                className={`w-full py-4 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 group ${tier.isPopular
                    ? 'bg-gold-500 hover:bg-gold-400 text-black shadow-lg shadow-gold-500/25'
                    : 'bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white'
                    }`}
            >
                <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                {tier.buttonText || (isRTL ? "اشترِ الآن" : "Buy Now")}
            </button>
        </motion.div>
    );
};

const PricingSection: React.FC<PricingSectionProps> = ({ content, currency, locale, openCheckout, isRTL }) => {
    return (
        <section id="pricing" className="py-24 px-4 relative overflow-hidden bg-white dark:bg-black/20">
            <div className="container mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 dark:text-white uppercase tracking-tighter">
                        {content.pricingTitle || "Choose Your Path"}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
                        {content.pricingSubtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {content.pricingTiers.map((tier, idx) => (
                        <PricingCard
                            key={idx}
                            tier={tier}
                            idx={idx}
                            currency={currency}
                            locale={locale}
                            isRTL={isRTL}
                            openCheckout={openCheckout}
                        />
                    ))}
                </div>

            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-gold-500/5 blur-[100px] rounded-full -z-10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full -z-10"></div>
        </section>
    );
};

export default PricingSection;
