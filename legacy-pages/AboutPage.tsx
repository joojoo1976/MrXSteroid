'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Star, Users, Target } from 'lucide-react';
import { Page, ContentStrings } from '@/shared/types/types';
import BrandLogo from '../shared/ui/BrandLogo';
import { usePreferences } from '../context/PreferencesContext';

interface AboutPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ content, navigateTo: _navigateTo }) => {
    const { isRTL } = usePreferences();
    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden rounded-[3rem] bg-zinc-900 border border-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-gold-500/5" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <BrandLogo className="text-5xl mb-6 mx-auto" />
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 text-balance">
                            {content.aboutPageTitle}
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed italic">
                            {content.aboutPageContent}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Story */}
            <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-10 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800 space-y-6"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gold-500/20 flex items-center justify-center text-gold-500">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">
                        {content.aboutPageStoryTitle}
                    </h3>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        {content.aboutPageStory}
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-10 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800 space-y-6"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gold-500/20 flex items-center justify-center text-gold-500">
                        <Target className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">
                        {content.aboutPageMissionTitle}
                    </h3>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        {content.aboutPageMission}
                    </p>
                </motion.div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { icon: Shield, label: content.aboutValueSafety || (isRTL ? "الأمان" : "Safety"), color: "text-green-500" },
                    { icon: BookOpen, label: content.aboutValueScience || (isRTL ? "العلم" : "Science"), color: "text-gold-500" },
                    { icon: Star, label: content.aboutValueExcellence || (isRTL ? "التميز" : "Excellence"), color: "text-gold-500" },
                    { icon: Users, label: content.aboutValueCommunity || (isRTL ? "المجتمع" : "Community"), color: "text-purple-500" },
                ].map((value, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 text-center space-y-4">
                        <value.icon className={`w-10 h-10 mx-auto ${value.color}`} />
                        <span className="block font-black uppercase text-sm tracking-widest">{value.label}</span>
                    </div>
                ))}
            </div>

            {/* Author Section Integration */}
            <section className="p-12 rounded-[3rem] bg-gradient-to-r from-zinc-900 via-zinc-900 to-gold-500/5 border border-zinc-800">
                <div className="max-w-3xl space-y-6">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">
                        {content.authorSection}
                    </h2>
                    <p className="text-xl text-zinc-400 italic font-medium leading-relaxed text-justify">
                        {content.authorBio || (isRTL
                            ? "جورج موريس، باحث وخبير في العلوم الفيزيولوجية الرياضية، كرس سنوات من البحث لترجمة أصعب البروتوكولات العلمية إلى خطط عملية قابلة للتطبيق."
                            : "George Mourice, a researcher and expert in sports physiological sciences, has dedicated years to translating the most complex scientific protocols into actionable plans.")}
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
