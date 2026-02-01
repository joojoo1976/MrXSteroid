import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, AlertTriangle, CheckCircle2, UserCheck } from 'lucide-react';
import { Page, ContentStrings } from '../types';
// import { usePreferences } from '../context/PreferencesContext';
// import DynamicBrandLogo from '../components/layout/DynamicBrandLogo';

interface TermsPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ content, navigateTo: _navigateTo }) => {
    // const { isRTL } = usePreferences();
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
            >
                <div className="w-20 h-20 bg-gold-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-gold-500 mb-6 border border-gold-500/20">
                    <Scale className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    {content.termsTitle}
                </h1>
            </motion.div>

            <div className="space-y-8">
                <section className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 space-y-4">
                    <div className="flex items-center gap-3 text-gold-500">
                        <UserCheck className="w-6 h-6" />
                        <h2 className="text-xl font-bold uppercase">{content.termsEligibilityTitle}</h2>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                        {content.termsEligibilityDesc}
                    </p>
                </section>

                <section className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 space-y-4">
                    <div className="flex items-center gap-3 text-gold-500">
                        <FileText className="w-6 h-6" />
                        <h2 className="text-xl font-bold uppercase">{content.termsPropertyTitle}</h2>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                        {content.termsPropertyDesc}
                    </p>
                </section>

                <section className="p-8 rounded-[3rem] bg-red-500/5 border border-red-500/20 space-y-4">
                    <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle className="w-6 h-6" />
                        <h2 className="text-xl font-bold uppercase">{content.termsLiabilityTitle}</h2>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                        {content.termsLiabilityDesc}
                    </p>
                </section>
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={() => _navigateTo(Page.HOME)}
                    className="px-12 py-4 bg-zinc-900 border border-zinc-800 text-white font-black uppercase text-sm rounded-2xl hover:bg-zinc-800 transition-all flex items-center gap-3"
                >
                    <CheckCircle2 className="w-5 h-5 text-gold-500" />
                    {content.termsAgreeBtn}
                </button>
            </div>
        </div>
    );
};

export default TermsPage;
