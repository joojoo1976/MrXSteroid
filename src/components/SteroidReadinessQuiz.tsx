import React, { useState } from 'react';
import { Trophy, ShieldCheck, ChevronRight } from 'lucide-react';
import { ContentStrings } from '../types';

const SteroidReadinessQuiz: React.FC<{ content: ContentStrings, onComplete: () => void }> = ({ content, onComplete }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const handleAnswer = (points: number) => { setScore(s => s + points); if (currentQ < content.quiz.questions.length - 1) { setCurrentQ(q => q + 1); } else { setFinished(true); } };
    const result = score >= 3 ? content.quiz.results.enhanced : content.quiz.results.natural;

    return (
        <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto bg-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-zinc-700">
                    {!finished ? (
                        <>
                            <h2 className="text-3xl font-black mb-4">{content.quiz.title}</h2><p className="text-zinc-400 mb-8">{content.quiz.subtitle}</p>
                            <div className="mb-8"><div className="flex justify-between text-xs text-zinc-500 mb-2"><span>Question {currentQ + 1}</span><span>{content.quiz.questions.length} Total</span></div><div className="h-2 bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-gold-500 transition-all duration-300" style={{ width: `${((currentQ + 1) / content.quiz.questions.length) * 100}%` }}></div></div></div>
                            <h3 className="text-xl font-bold mb-6">{content.quiz.questions[currentQ].question}</h3>
                            <div className="space-y-4">{content.quiz.questions[currentQ].options.map((opt, idx) => (<button key={idx} onClick={() => handleAnswer(opt.score)} className="w-full p-4 rounded-xl bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 hover:border-gold-500 text-left transition-all flex justify-between items-center group"><span>{opt.text}</span><ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-gold-500" /></button>))}</div>
                        </>
                    ) : (
                        <div className="text-center animate-fade-in">
                            <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">{score >= 3 ? <Trophy className="w-10 h-10 text-black" /> : <ShieldCheck className="w-10 h-10 text-black" />}</div>
                            <h3 className="text-3xl font-black mb-4">{result.title}</h3><p className="text-zinc-400 mb-8 leading-relaxed">{result.desc}</p>
                            <button onClick={onComplete} className="px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-full shadow-lg hover:scale-105 transition-transform">{result.cta}</button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default SteroidReadinessQuiz;
