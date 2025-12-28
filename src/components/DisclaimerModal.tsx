
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ContentStrings } from '../types';

interface DisclaimerModalProps {
    content: ContentStrings;
    onAgree: () => void;
    isRTL: boolean;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ content, onAgree, isRTL }) => {
    const [canAgree, setCanAgree] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanAgree(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
                <motion.div
                    initial={{ scale: 0.5, y: 100, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className="bg-zinc-900 border-2 border-red-500/50 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800 flex items-center gap-4 bg-red-500/10">
                        <div className="p-3 bg-red-500/20 rounded-full animate-pulse">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{content.disclaimerTitle || "Disclaimer"}</h2>
                            <p className="text-red-400 font-medium text-sm mt-1 uppercase tracking-wider">{content.importantDisclaimer || "IMPORTANT WARNING"}</p>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-zinc-300 text-sm leading-relaxed whitespace-pre-line bg-zinc-950/50">
                        {content.disclaimerContent}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-zinc-800 bg-zinc-900 flex flex-col gap-4">
                        <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg">
                            <input type="checkbox" className="mt-1 w-5 h-5 rounded border-zinc-600 text-red-600 focus:ring-red-500 bg-zinc-700" id="ack" disabled={!canAgree} />
                            <label htmlFor="ack" className={`text-sm ${canAgree ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                {content.disclaimerAcknowledgement}
                            </label>
                        </div>

                        <motion.button
                            whileHover={canAgree ? { scale: 1.02, boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)" } : {}}
                            whileTap={canAgree ? { scale: 0.98 } : {}}
                            onClick={() => {
                                const checkbox = document.getElementById('ack') as HTMLInputElement;
                                if (checkbox && checkbox.checked) {
                                    onAgree();
                                } else {
                                    // Flash the checkbox container or show toast
                                    const checkboxContainer = checkbox?.parentElement;
                                    if (checkboxContainer) {
                                        checkboxContainer.classList.add('animate-pulse', 'bg-red-500/20');
                                        setTimeout(() => checkboxContainer.classList.remove('animate-pulse', 'bg-red-500/20'), 500);
                                    }
                                }
                            }}
                            disabled={!canAgree}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
                ${canAgree
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/40 cursor-pointer'
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                }`}
                        >
                            {canAgree ? (
                                <>
                                    <CheckCircle className="w-6 h-6" />
                                    {content.agreeButton}
                                </>
                            ) : (
                                <span>{`Please read... (${timeLeft})`}</span>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
