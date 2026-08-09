'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, FileText } from 'lucide-react';
import { Page, ContentStrings } from '@/shared/types/types';

interface PrivacyPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ content }) => {
    const sections = [
        {
            title: content.privacyCollectionTitle,
            content: content.privacyCollectionDesc,
            icon: Eye
        },
        {
            title: content.privacySecurityTitle,
            content: content.privacySecurityDesc,
            icon: Lock
        },
        {
            title: content.privacyRightsTitle,
            content: content.privacyRightsDesc,
            icon: FileText
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="w-20 h-20 bg-gold-500/10 rounded-3xl flex items-center justify-center mx-auto text-gold-500 mb-6 shadow-2xl">
                    <Shield className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    {content.privacyTitle}
                </h1>
                <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full" />
            </motion.div>

            <div className="grid gap-8">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="p-8 rounded-[3rem] bg-zinc-900/50 border border-zinc-800 space-y-6"
                    >
                        <div className="flex items-center gap-4 text-gold-500">
                            <section.icon className="w-6 h-6" />
                            <h2 className="text-2xl font-black uppercase tracking-tight">{section.title}</h2>
                        </div>
                        <p className="text-zinc-400 text-lg leading-relaxed">{section.content}</p>
                    </motion.div>
                ))}
            </div>

            <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 text-center">
                <p className="text-zinc-500 text-sm italic">
                    {content.privacyComplianceNote}
                </p>
            </div>
        </div>
    );
};

export default PrivacyPage;
