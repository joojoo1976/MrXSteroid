import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Minus, Search, ShieldCheck, Zap, FlaskConical, Dna } from 'lucide-react';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import DynamicBrandLogo from '../components/layout/DynamicBrandLogo';

interface FAQPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    const [openIndex, setOpenIndex] = React.useState<number | null>(0);
    const [searchTerm, setSearchTerm] = React.useState("");

    const faqs = [
        {
            qText: isRTL ? "هل استخدام الهرمونات آمن بنسبة 100%؟" : "Is hormone use 100% safe?",
            q: isRTL ? "هل استخدام الهرمونات آمن بنسبة 100%؟" : "Is hormone use 100% safe?",
            aText: isRTL
                ? "لا يوجد تدخل طبي خارجي آمن بنسبة محلقة؛ لكننا نركز في بروتوكولاتنا على أقصى درجات تقليل المخاطر عبر المتابعة الدقيقة والتحاليل الدورية."
                : "No external medical intervention is completely safe; but in our protocols we focus on maximum risk mitigation through careful monitoring and periodic testing.",
            a: isRTL
                ? "لا يوجد تدخل طبي خارجي آمن بنسبة محلقة؛ لكننا نركز في بروتوكولاتنا على أقصى درجات تقليل المخاطر عبر المتابعة الدقيقة والتحاليل الدورية."
                : "No external medical intervention is completely safe; but in our protocols we focus on maximum risk mitigation through careful monitoring and periodic testing.",
            category: "Safety",
            icon: ShieldCheck
        },
        {
            qText: isRTL ? "كيف أبدأ مع Mr. X-Steroid؟" : "How do I start with Mr. X-Steroid?",
            q: isRTL
                ? <span className="flex items-center gap-1">كيف أبدأ مع <DynamicBrandLogo inline variant="full" />؟</span>
                : <span className="flex items-center gap-1">How do I start with <DynamicBrandLogo inline variant="full" />?</span>,
            aText: isRTL
                ? "ابدأ بإنشاء حساب ثم اختر الخطة المناسبة لأهدافك. ستحتاج لتقديم بياناتك الجينية وتاريخك الرياضي لبناء البروتوكول."
                : "Start by creating an account then choose the plan suitable for your goals. You will need to provide your genetic data and sports history to build the protocol.",
            a: isRTL
                ? "ابدأ بإنشاء حساب ثم اختر الخطة المناسبة لأهدافك. ستحتاج لتقديم بياناتك الجينية وتاريخك الرياضي لبناء البروتوكول."
                : "Start by creating an account then choose the plan suitable for your goals. You will need to provide your genetic data and sports history to build the protocol.",
            category: "General",
            icon: Zap
        },
        {
            qText: isRTL ? "ما هو الجهد الجيني؟" : "What is genetic potential?",
            q: isRTL ? "ما هو الجهد الجيني؟" : "What is genetic potential?",
            aText: isRTL
                ? "هو الحد الأقصى الذي يمكن لجسمك الوصول إليه طبيعياً. نحن نستخدم خوارزميات لتحليل هذا الجهد وتحديد أين يمكن للمنشطات أن تتخطى هذا الحد."
                : "It is the maximum your body can reach naturally. We use algorithms to analyze this potential and determine where steroids can exceed this limit.",
            a: isRTL
                ? "هو الحد الأقصى الذي يمكن لجسمك الوصول إليه طبيعياً. نحن نستخدم خوارزميات لتحليل هذا الجهد وتحديد أين يمكن للمنشطات أن تتخطى هذا الحد."
                : "It is the maximum your body can reach naturally. We use algorithms to analyze this potential and determine where steroids can exceed this limit.",
            category: "Science",
            icon: Dna
        },
        {
            qText: isRTL ? "ما هي سياسة الخصوصية للمشتركين؟" : "What is the privacy policy for subscribers?",
            q: isRTL ? "ما هي سياسة الخصوصية للمشتركين؟" : "What is the privacy policy for subscribers?",
            aText: isRTL
                ? "بياناتك مشفرة تماماً تحت إشراف George Mourice ولا يمكن الوصول إليها من أي طرف ثالث تحت أي ظرف."
                : "Your data is fully encrypted under George Mourice's supervision and cannot be accessed by any third party under any circumstances.",
            a: isRTL
                ? "بياناتك مشفرة تماماً تحت إشراف George Mourice ولا يمكن الوصول إليها من أي طرف ثالث تحت أي ظرف."
                : "Your data is fully encrypted under George Mourice's supervision and cannot be accessed by any third party under any circumstances.",
            category: "Legal",
            icon: FlaskConical
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.qText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.aText.toLowerCase().includes(searchTerm.toLowerCase())
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
                {filteredFaqs.map((faq, idx) => (
                    <div key={idx} className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-all hover:border-zinc-700">
                        <button
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            className="w-full p-6 flex items-center justify-between text-start"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-gold-500">
                                    <faq.icon className="w-4 h-4" />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-tight text-white/90">{faq.q}</h3>
                            </div>
                            {openIndex === idx ? <Minus className="w-5 h-5 text-gold-500" /> : <Plus className="w-5 h-5 text-zinc-600" />}
                        </button>
                        <AnimatePresence>
                            {openIndex === idx && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-6 pt-2"
                                >
                                    <p className="text-zinc-500 text-lg leading-relaxed ps-12">
                                        {faq.a}
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
