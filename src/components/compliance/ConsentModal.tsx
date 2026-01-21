import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import Cookies from 'js-cookie';

export const ConsentModal: React.FC = () => {
    // Lazy usage of cookies to initialize state, preventing effect synchronization issues
    const [isOpen, setIsOpen] = useState(() => !Cookies.get('mrx_consent_v1'));
    const [step, setStep] = useState<'welcome' | 'disclaimer'>('welcome');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleConsent = () => {
        Cookies.set('mrx_consent_v1', 'true', { expires: 365 });
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm mix-blend-overlay"></div>

                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative max-w-2xl w-full bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl"
                >
                    {/* Status Bar */}
                    <div className="h-1 w-full bg-zinc-800">
                        <motion.div
                            className="h-full bg-gold-500"
                            initial={{ width: "50%" }}
                            animate={{ width: step === 'welcome' ? "50%" : "100%" }}
                        />
                    </div>

                    <div className="p-8 md:p-12 text-center relative z-10">
                        <AnimatePresence mode="wait">
                            {step === 'welcome' ? (
                                <motion.div
                                    key="welcome"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/20 animate-pulse">
                                        <AlertTriangle className="w-10 h-10 text-red-500" />
                                    </div>

                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Age Verification Required</h2>
                                        <p className="text-zinc-400 font-bold max-w-md mx-auto">
                                            The content on this platform is for educational and harm-reduction purposes only.
                                            You must be at least <span className="text-gold-500">18 years old</span> to enter.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setStep('disclaimer')}
                                        className="w-full py-5 bg-zinc-100 hover:bg-white text-black font-black text-lg uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 group"
                                    >
                                        I am 18+ <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform fill-current" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="disclaimer"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="w-20 h-20 mx-auto bg-gold-500/10 rounded-full flex items-center justify-center border-2 border-gold-500/20">
                                        <ShieldAlert className="w-10 h-10 text-gold-500" />
                                    </div>

                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Medical Disclaimer</h2>
                                        <div className="text-zinc-400 font-medium text-sm text-left bg-black/40 p-6 rounded-2xl border border-zinc-800 max-h-60 overflow-y-auto custom-scrollbar">
                                            <p className="mb-4">
                                                <strong className="text-white block mb-2">1. No Medical Advice:</strong>
                                                Mr. X and associated materials are strictly for informational purposes. We are not doctors. Consult a physician before starting any protocol.
                                            </p>
                                            <p className="mb-4">
                                                <strong className="text-white block mb-2">2. Assumption of Risk:</strong>
                                                Usage of any compound discussed here carries inherent risks. By proceeding, you agree to hold Mr. X harmless from any liability.
                                            </p>
                                            <p>
                                                <strong className="text-white block mb-2">3. Compliance:</strong>
                                                You agree to comply with all local laws and regulations regarding controlled substances in your jurisdiction.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleConsent}
                                        className="w-full py-5 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> I Agree & Enter
                                    </button>

                                    <button
                                        onClick={() => setStep('welcome')}
                                        className="text-xs font-bold text-zinc-600 hover:text-zinc-400 uppercase tracking-widest"
                                    >
                                        Go Back
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <div className="absolute bottom-8 text-center w-full text-zinc-600 text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
                    Secure Access // Encrypted Connection
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
