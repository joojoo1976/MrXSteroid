'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FileCheck } from 'lucide-react';
import { ContentStrings, Page } from '@/shared/types/types';
import BrandLogo from './BrandLogo';
import DynamicBrandLogo from './DynamicBrandLogo';
import { StyledBrandName } from './StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';

interface MedicalDisclaimerPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const MedicalDisclaimerPage: React.FC<MedicalDisclaimerPageProps> = ({ content, navigateTo }) => {
    const { title, sections } = content.medicalDisclaimerPage;
    const { isRTL } = usePreferences();

    return (
        <div className={`min-h-screen py-12 px-4 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <header className="max-w-4xl mx-auto text-center mb-16 relative z-10">
                <div className="mb-6 flex justify-center">
                    <BrandLogo className="text-4xl" onClick={() => navigateTo(Page.HOME)} />
                </div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-5xl font-black text-gold-500 mb-4 drop-shadow-lg"
                >
                    {title}
                </motion.h1>
                <div className="w-24 h-1 bg-gold-500 mx-auto rounded-full mt-4"></div>
            </header>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                {sections.map((section, index) => {
                    const isHighRisk = section.title.includes("High-Risk") || section.title.includes("تحذير");
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className={`group relative overflow-hidden bg-zinc-950/40 border ${isHighRisk ? 'border-red-500/30 bg-red-500/5' : 'border-gold-500/10'} rounded-3xl p-8 hover:border-gold-500/30 transition-all duration-500 shadow-2xl backdrop-blur-xl`}
                        >
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className={`w-12 h-12 rounded-2xl ${isHighRisk ? 'bg-red-500/10 text-red-500' : 'bg-gold-500/10 text-gold-500'} flex items-center justify-center shrink-0`}>
                                    {isHighRisk ? <AlertTriangle className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
                                </div>
                                <h2 className={`text-xl md:text-2xl font-black ${isHighRisk ? 'text-red-500' : 'text-gold-500'} uppercase tracking-tight`}>{section.title}</h2>
                            </div>

                            <div className={`text-zinc-300 leading-relaxed text-lg ${isRTL ? 'border-r-2 pr-8' : 'border-l-2 pl-8'} border-white/5 relative z-10`}>
                                <div className="prose dark:prose-invert max-w-none">
                                    <StyledBrandName text={section.content} />
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${isHighRisk ? 'bg-red-500/5' : 'bg-gold-500/5'} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
                        </motion.div>
                    );
                })}

                <div className="mt-12 text-center text-zinc-500 text-sm">
                    <p>© {new Date().getFullYear()} <DynamicBrandLogo inline variant="full" />. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default MedicalDisclaimerPage;
