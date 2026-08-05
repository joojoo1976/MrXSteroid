import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Minus, Search, ShieldCheck, Zap, FlaskConical, Dna } from 'lucide-react';
import { Page, ContentStrings } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';
import DynamicBrandLogo from '../shared/ui/DynamicBrandLogo';
import { supabase } from '../shared/lib/supabase';
import type { FaqItem } from '../features/admin/useAdminData';

interface FAQPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    const [openId, setOpenId] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [dbFaqs, setDbFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        supabase
            .from('faq_items')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .limit(100)
            .then(({ data, error }) => {
                if (!mounted) return;
                if (error) {
                    setError(error.message);
                } else {
                    setDbFaqs((data || []) as FaqItem[]);
                }
                setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    const faqs = React.useMemo(() => {
        const rawFaqs = !error && dbFaqs.length > 0
            ? dbFaqs.map(f => ({
                id: f.id,
                q: isRTL ? f.question_ar : f.question_en,
                a: isRTL ? (f.answer_ar || f.answer_en || '') : (f.answer_en || f.answer_ar || ''),
                category: isRTL ? f.category_ar : f.category_en,
            }))
            : (content.faqsData || []).map((f, i) => ({
                id: `static-${i}`,
                q: f.q,
                a: f.a,
                category: f.category,
            }));

        return rawFaqs.map(faq => {
            // Map categories to icons
            let icon = HelpCircle;
            const cat = faq.category.toLowerCase();
            if (cat.includes('safety') || cat.includes('أمان')) icon = ShieldCheck;
            if (cat.includes('general') || cat.includes('عام')) icon = Zap;
            if (cat.includes('science') || cat.includes('علم')) icon = Dna;
            if (cat.includes('legal') || cat.includes('قانون')) icon = FlaskConical;

            // Handle DynamicBrandLogo injection if name is mentioned
            const processText = (text: string) => {
                const parts = text.split(/(Mr\. X-Steroid|مستر إكس-ستيرويد)/g);
                return parts.map((part, i) => {
                    if (part === "Mr. X-Steroid" || part === "مستر إكس-ستيرويد") {
                        return <DynamicBrandLogo key={i} inline variant="full" />;
                    }
                    return part;
                });
            };

            return {
                ...faq,
                icon,
                qElement: processText(faq.q),
                aElement: processText(faq.a)
            };
        });
    }, [content.faqsData, isRTL, dbFaqs, error]);

    const filteredFaqs = faqs.filter(faq =>
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-16 pb-20">
            <header className="text-center space-y-6">
                <motion.div initial={{ rotate: -10 }} animate={{ rotate: 0 }} className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center text-gold-500 mx-auto border border-gold-500/20">
                    <HelpCircle className="w-10 h-10" />
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                    {content.faqPageTitle}
                </h1>
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={content.faqSearchPlaceholder}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 ps-12 pe-4 text-white focus:border-gold-500/50 transition-all font-bold"
                    />
                </div>
            </header>

            <div className="space-y-4">
                {loading ? (
                    <div className="p-10 text-center text-zinc-600 font-bold">{isRTL ? 'جارٍ التحميل…' : 'Loading…'}</div>
                ) : filteredFaqs.length === 0 ? (
                    <div className="p-10 text-center text-zinc-600 font-bold">
                        {isRTL ? 'لا توجد أسئلة مطابقة.' : 'No matching questions found.'}
                    </div>
                ) : filteredFaqs.map((faq) => (
                    <div key={faq.id} className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-all hover:border-zinc-700">
                        <button
                            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                            className="w-full p-6 flex items-center justify-between text-start"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-gold-500">
                                    <faq.icon className="w-4 h-4" />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-tight text-white/90">{faq.qElement || faq.q}</h3>
                            </div>
                            {openId === faq.id ? <Minus className="w-5 h-5 text-gold-500" /> : <Plus className="w-5 h-5 text-zinc-600" />}
                        </button>
                        <AnimatePresence>
                            {openId === faq.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-6 pt-2"
                                >
                                    <p className="text-zinc-500 text-lg leading-relaxed ps-12">
                                        {faq.aElement || faq.a}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div className="p-12 rounded-[4rem] bg-gold-500/5 border border-gold-500/10 text-center space-y-6">
                <h3 className="text-2xl font-black uppercase">{content.faqAnotherQuestion}</h3>
                <p className="text-zinc-500 font-bold italic">{content.faqExpertHelpText}</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button onClick={() => navigateTo(Page.CONTACT)} className="px-8 py-3 bg-gold-500 text-black font-black uppercase rounded-xl hover:bg-gold-400 transition-all">
                        {content.faqContactBtn}
                    </button>
                    <button onClick={() => navigateTo(Page.SUPPORT)} className="px-8 py-3 bg-zinc-900 text-white font-black uppercase rounded-xl hover:bg-zinc-800 border border-zinc-800 transition-all">
                        {content.faqSupportBtn}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
