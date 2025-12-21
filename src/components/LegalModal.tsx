import React from 'react';
import { FileText, X } from 'lucide-react';

const LegalModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; content: string; }> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl relative z-10 flex flex-col border border-zinc-200 dark:border-zinc-700 animate-fade-in-up">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 rounded-t-2xl">
                    <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="text-gold-500" /> {title}</h2><button onClick={onClose} className="text-zinc-500 hover:text-red-500"><X className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-zinc-900 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">{content}</div>
                </div>
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-b-2xl text-center"><button onClick={onClose} className="px-8 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg text-sm font-bold transition-colors">Close</button></div>
            </div>
        </div>
    );
};

export default LegalModal;
