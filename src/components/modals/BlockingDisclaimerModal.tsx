import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentStrings } from '../../types';
import { getCookie, setCookie } from '../../utils/logic';
import { StyledBrandName } from '../shared/StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';

const BlockingDisclaimerModal: React.FC<{ content: ContentStrings }> = ({ content }) => {
    const { isRTL } = usePreferences();
    const [show, setShow] = useState(() => !getCookie('disclaimer-agreed'));
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (show) { document.body.style.overflow = 'hidden'; }
        else { document.body.style.overflow = 'auto'; }
        return () => { document.body.style.overflow = 'auto'; };
    }, [show]);

    const handleAgree = () => {
        setCookie('disclaimer-agreed', 'true', 365);
        setShow(false);
        document.body.style.overflow = 'auto';
    };

    if (!show) return null;

    const steps = [
        {
            id: 1,
            title: content.disclaimerStep1Title || content.disclaimerTitle,
            icon: <AlertTriangle className="w-8 h-8 text-gold-500 shrink-0" />,
            content: (
                <div className="prose dark:prose-invert max-w-none text-justify leading-relaxed whitespace-pre-wrap text-base md:text-lg text-zinc-700 dark:text-zinc-300">
                    <StyledBrandName text={content.disclaimerContent || ""} />
                </div>
            )
        },
        {
            id: 2,
            title: content.disclaimerStep2Title || "Verification",
            icon: <ShieldAlert className="w-8 h-8 text-red-500 shrink-0 animate-pulse" />,
            content: (
                <div className="flex flex-col items-center justify-center py-10 space-y-8">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="text-center space-y-4">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                            {content.ageVerificationRequired}
                        </h3>
                        <p className="text-zinc-400 font-bold max-w-md mx-auto text-lg leading-relaxed">
                            {content.ageVerificationDesc}
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 3,
            title: content.disclaimerStep3Title || "Medical",
            icon: <ShieldCheck className="w-8 h-8 text-gold-500 shrink-0" />,
            content: (
                <div className="space-y-6 text-left">
                    <div className="bg-black/40 p-8 rounded-2xl border border-zinc-800 space-y-6">
                        <div className="space-y-2">
                            <h4 className="text-white font-black uppercase text-sm tracking-widest">{content.medicalDisclaimerPoint1?.split(':')[0]}</h4>
                            <p className="text-zinc-400 text-base leading-relaxed">{content.medicalDisclaimerPoint1?.split(':').slice(1).join(':').trim()}</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-black uppercase text-sm tracking-widest">{content.medicalDisclaimerPoint2?.split(':')[0]}</h4>
                            <p className="text-zinc-400 text-base leading-relaxed">{content.medicalDisclaimerPoint2?.split(':').slice(1).join(':').trim()}</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-black uppercase text-sm tracking-widest">{content.medicalDisclaimerPoint3?.split(':')[0]}</h4>
                            <p className="text-zinc-400 text-base leading-relaxed">{content.medicalDisclaimerPoint3?.split(':').slice(1).join(':').trim()}</p>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center italic">
                        {content.disclaimerAcknowledgement}
                    </p>
                </div>
            )
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-background w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl relative z-10 flex flex-col border border-zinc-200 dark:border-gold-500/30 overflow-hidden"
            >
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-zinc-800">
                    <motion.div
                        className="h-full bg-gold-500 shadow-[0_0_10px_#eab308]"
                        initial={{ width: "33.33%" }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Header */}
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-card">
                    <div className="flex items-center gap-4">
                        {currentStep.icon}
                        <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                            {currentStep.title}
                        </h2>
                    </div>
                    <div className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
                        Page {step} / 3
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white dark:bg-background scrollbar-thin scrollbar-thumb-gold-500 scrollbar-track-zinc-200 dark:scrollbar-track-zinc-800">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStep.content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-card flex flex-col items-center gap-4">
                    <div className="w-full max-w-md flex gap-4">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                {isRTL ? "السابق" : "Previous"}
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="flex-[2] py-4 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg rounded-xl shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 group transition-all"
                            >
                                {content.nextStepLabel}
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={handleAgree}
                                className="flex-[2] py-4 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg rounded-xl shadow-lg shadow-gold-500/20 active:scale-95 flex items-center justify-center gap-2 transition-all animate-shimmer bg-[linear-gradient(110deg,#eab308,45%,#fde047,55%,#eab308)] bg-[length:200%_100%]"
                            >
                                <ShieldCheck className="w-6 h-6" />
                                {content.agreeButton}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BlockingDisclaimerModal;
