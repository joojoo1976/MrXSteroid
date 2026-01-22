import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, Mail, Phone, Clock, FileText, Search } from 'lucide-react';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface SupportPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    const contactMethods = [
        {
            title: isRTL ? "البريد الإلكتروني" : "Email Support",
            value: "support@mrxsteroid.com",
            icon: Mail,
            action: "mailto:support@mrxsteroid.com"
        },
        {
            title: isRTL ? "واتساب الدعم" : "WhatsApp Support",
            value: "+20 123 456 789",
            icon: MessageSquare,
            action: "https://wa.me/20123456789"
        },
        {
            title: isRTL ? "ساعات العمل" : "Support Hours",
            value: isRTL ? "يومياً: 10 ص - 10 م" : "Daily: 10 AM - 10 PM",
            icon: Clock,
            action: null
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-16 pb-20">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
            >
                <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto text-gold-500 mb-6 border border-gold-500/20 shadow-2xl">
                    <HelpCircle className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                    {content.supportTitle}
                </h1>
                <p className="text-zinc-500 text-lg font-bold max-w-2xl mx-auto uppercase tracking-widest text-balance">
                    {isRTL ? "نحن هنا لمساعدتك في الحصول على أفضل تجربة وتجاوز جميع التحديات." : "We are here to help you get the best experience and overcome all challenges."}
                </p>

                {/* Search Bar Placeholder */}
                <div className="max-w-2xl mx-auto relative group">
                    <Search className="absolute start-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-gold-500 transition-colors w-5 h-5" />
                    <input
                        type="text"
                        placeholder={isRTL ? "ابحث عن إجابة لمشكلتك..." : "Search for an answer..."}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 ps-16 pe-6 text-white focus:border-gold-500/50 focus:ring-0 transition-all text-lg font-bold"
                    />
                </div>
            </motion.header>

            {/* Contact Methods */}
            <div className="grid md:grid-cols-3 gap-8 text-center">
                {contactMethods.map((method, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="p-10 rounded-[3rem] bg-zinc-900/50 border border-zinc-800 hover:border-gold-500/30 transition-all flex flex-col items-center gap-6"
                    >
                        <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gold-500 shadow-xl">
                            <method.icon className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tight text-white/80">{method.title}</h3>
                            {method.action ? (
                                <a href={method.action} className="text-zinc-400 hover:text-gold-500 transition-colors font-bold text-lg block">
                                    {method.value}
                                </a>
                            ) : (
                                <span className="text-zinc-400 font-bold text-lg block italic">{method.value}</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Useful Links */}
            <section className="p-12 rounded-[4rem] bg-zinc-900 border border-zinc-800">
                <h2 className="text-3xl font-black mb-10 text-center uppercase tracking-tight">{isRTL ? "روابط سريعة للمساعدة" : "Quick Help Links"}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: content.faqPageTitle, page: Page.FAQ },
                        { label: isRTL ? "دليل المستخدم" : "User Guide", page: Page.HOME },
                        { label: content.returnPolicyTitle, page: Page.RETURN_POLICY },
                        { label: content.shippingPolicyTitle, page: Page.SHIPPING_POLICY }
                    ].map((link, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigateTo(link.page)}
                            className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-gold-500 hover:border-gold-500/30 transition-all flex items-center justify-between group"
                        >
                            <span className="font-black uppercase tracking-tight text-xs">{link.label}</span>
                            <FileText className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </section>

            {/* FAQ Preview */}
            <div className="text-center py-10">
                <p className="text-zinc-600 font-bold mb-6 italic">{isRTL ? "لم تجد ما تبحث عنه؟" : "Didn't find what you're looking for?"}</p>
                <button
                    onClick={() => navigateTo(Page.CONTACT)}
                    className="px-12 py-5 bg-gold-500 text-black font-black uppercase rounded-2xl hover:bg-gold-400 transition-all shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)] scale-110"
                >
                    {isRTL ? "تواصل مباشرة مع جورج موريس" : "Contact George Mourice Directly"}
                </button>
            </div>
        </div>
    );
};

export default SupportPage;
