import React, { useState } from 'react';
import { CheckCircle, Copy, X } from 'lucide-react';
import { ContentStrings } from '../types';

const DailyIQChallenge: React.FC<{ content: ContentStrings, onWin: () => void }> = ({ content, onWin }) => {
    const [answered, setAnswered] = useState(false);
    const [correct, setCorrect] = useState(false);
    const question = content.dailyIQ.questions[0];

    const handleOption = (idx: number) => {
        setAnswered(true);
        if (idx === question.correctIndex) {
            setCorrect(true);
            onWin();
        }
    };

    return (
        <section className="py-20 bg-gradient-to-br from-zinc-900 to-black text-white">
            <div className="container mx-auto px-4 text-center">
                <div className="inline-block p-2 px-4 rounded-full bg-gold-500/20 text-gold-500 text-xs font-bold mb-6 border border-gold-500/30">DAILY CHALLENGE</div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">{content.dailyIQ.title}</h2><p className="text-zinc-400 max-w-2xl mx-auto mb-12">{content.dailyIQ.subtitle}</p>
                <div className="max-w-2xl mx-auto bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-8 border border-zinc-700">
                    {!answered ? (
                        <>
                            <h3 className="text-xl font-bold mb-8">{question.question}</h3>
                            <div className="grid gap-4">{question.options.map((opt, idx) => (<button key={idx} onClick={() => handleOption(idx)} className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-gold-500 hover:bg-zinc-800 transition-all font-medium text-left">{opt}</button>))}</div>
                        </>
                    ) : (
                        <div className="animate-fade-in">
                            {correct ? (
                                <>
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
                                    <h3 className="text-2xl font-bold text-green-500 mb-2">{content.dailyIQ.winTitle}</h3><p className="text-zinc-400 mb-6">{content.dailyIQ.winDesc}</p>
                                    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700 flex items-center justify-between mb-6"><code className="text-gold-500 font-mono font-bold tracking-widest">STEROIDMASTERY25</code><Copy className="w-5 h-5 text-zinc-500 cursor-pointer hover:text-white" /></div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><X className="w-8 h-8 text-red-500" /></div>
                                    <h3 className="text-2xl font-bold text-red-500 mb-2">{content.dailyIQ.loseTitle}</h3><p className="text-zinc-400 mb-6">{content.dailyIQ.loseDesc}</p>
                                </>
                            )}
                            <div className="bg-zinc-900/50 p-4 rounded-lg text-sm text-zinc-300 text-left"><strong className="text-gold-500 block mb-1">Explanation:</strong>{question.explanation}</div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DailyIQChallenge;
