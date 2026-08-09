'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, UserCheck, FileText, Database } from 'lucide-react';
import { Page, ContentStrings } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';

interface GDPRPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const GDPRPage: React.FC<GDPRPageProps> = ({ content, navigateTo: _navigateTo }) => {
    const { isRTL } = usePreferences();
    const rights = [
        { title: isRTL ? "الحق في الوصول" : "Right to Access", icon: UserCheck },
        { title: isRTL ? "الحق في النسيان" : "Right to be Forgotten", icon: Database },
        { title: isRTL ? "الحق في التصحيح" : "Right to Rectification", icon: FileText },
        { title: isRTL ? "الحق في الاعتراض" : "Right to Object", icon: ShieldCheck }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
            >
                <div className="w-20 h-20 bg-gold-500/10 rounded-3xl flex items-center justify-center mx-auto text-gold-500 mb-6 shadow-2xl">
                    <Lock className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    {content.gdprTitle}
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                    {isRTL ? "حماية خصوصيتك هي أولويتنا" : "Protecting your privacy is our priority"}
                </p>
            </motion.div>

            <section className="p-10 rounded-[3rem] bg-zinc-900 border border-zinc-800 space-y-8">
                <h2 className="text-3xl font-black uppercase">{isRTL ? "كيف نحمي بياناتك؟" : "How we protect your data?"}</h2>
                <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                    <p>
                        {isRTL
                            ? "تحت إشراف George Mourice، نستخدم أعلى معايير التشفير (4096-bit) لحماية بيانات المشتركين. نحن لا نقوم ببيع أو مشاركة بياناتك مع أي طرف ثالث لأغراض تسويقية."
                            : "Under the supervision of George Mourice, we use the highest encryption standards (4096-bit) to protect subscriber data. We do not sell or share your data with any third party for marketing purposes."}
                    </p>
                    <p>
                        {isRTL
                            ? "يتم جمع البيانات فقط لغرض تحسين البروتوكولات الرياضية وتأمين عمليات الشراء الإلكترونية."
                            : "Data is collected only for the purpose of improving sports protocols and securing electronic purchase transactions."}
                    </p>
                </div>
            </section>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {rights.map((right, idx) => (
                    <div key={idx} className="p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 text-center space-y-4 hover:border-blue-500/50 transition-colors">
                        <right.icon className="w-8 h-8 mx-auto text-gold-500" />
                        <span className="block font-black uppercase text-xs tracking-widest leading-tight">{right.title}</span>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <p className="text-zinc-500 text-sm">
                    {isRTL ? "آخر تحديث: يناير 2026" : "Last updated: January 2026"}
                </p>
            </div>
        </div>
    );
};

export default GDPRPage;
