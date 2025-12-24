import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { ContentStrings } from '../types';

const BlockingDisclaimerModal: React.FC<{ content: ContentStrings }> = ({ content }) => {
    const [show, setShow] = useState(() => !localStorage.getItem('mr_x_disclaimer_accepted_v4'));
    useEffect(() => {
        if (show) { document.body.style.overflow = 'hidden'; }
        else { document.body.style.overflow = 'auto'; }
        return () => { document.body.style.overflow = 'auto'; };
    }, [show]);
    const handleAgree = () => { localStorage.setItem('mr_x_disclaimer_accepted_v4', 'true'); setShow(false); document.body.style.overflow = 'auto'; };
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md"></div>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl relative z-10 flex flex-col border border-zinc-200 dark:border-gold-500/30">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950 rounded-t-2xl">
                    <AlertTriangle className="w-8 h-8 text-gold-500 shrink-0" /><h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{content.disclaimerTitle}</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 bg-white dark:bg-zinc-900 scrollbar-thin scrollbar-thumb-gold-500 scrollbar-track-zinc-200 dark:scrollbar-track-zinc-800">
                    <div className="prose dark:prose-invert max-w-none text-justify leading-relaxed whitespace-pre-wrap text-sm md:text-base text-zinc-700 dark:text-zinc-300">{content.disclaimerContent}</div>
                </div>
                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-b-2xl flex flex-col items-center gap-4">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-2xl">{content.disclaimerAcknowledgement}</p>
                    <button onClick={handleAgree} className="w-full max-w-md py-4 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg rounded-xl shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"><ShieldCheck className="w-6 h-6" />{content.agreeButton}</button>
                </div>
            </div>
        </div>
    );
};

export default BlockingDisclaimerModal;
