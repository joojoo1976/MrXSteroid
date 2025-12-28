import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ShieldCheck, ChevronRight, Zap, Target, Activity } from 'lucide-react';
import { ContentStrings } from '../types';

const SteroidReadinessQuiz: React.FC<{ content: ContentStrings, onComplete: () => void }> = ({ content, onComplete }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const handleAnswer = (points: number) => {
        setScore(s => s + points);
        if (currentQ < content.quiz.questions.length - 1) {
            setCurrentQ(q => q + 1);
        } else {
            setFinished(true);
        }
    };

    const result = score >= 3 ? content.quiz.results.enhanced : content.quiz.results.natural;

    return (
        <section id="readiness-quiz" className="py-32 bg-zinc-950 text-white relative overflow-hidden">

            {/* Background Kinetic Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/10 blur-[150px] rounded-full animate-float-slow -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full animate-float-slow -z-10" style={{ animationDelay: '-5s' }}></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">

                    {/* Main Quiz Card */}
                    <motion.div
                        layout
                        className="relative bg-zinc-900/40 backdrop-blur-3xl rounded-[4rem] p-10 md:p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-zinc-800/50 overflow-hidden card-shine animate-glow"
                    >
                        {/* Dynamic Top Stripe */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-600 via-white to-gold-400"></div>

                        <AnimatePresence mode="wait">
                            {!finished ? (
                                <motion.div
                                    key="quiz-body"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="relative z-10"
                                >
                                    <div className="text-center mb-16">
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="inline-flex items-center justify-center p-4 bg-gold-500/10 rounded-3xl mb-6 border border-gold-500/20"
                                        >
                                            <Target className="w-10 h-10 text-gold-500" />
                                        </motion.div>
                                        <h2 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-400 to-white animate-text-flash tracking-tight">
                                            {content.quiz.title}
                                        </h2>
                                        <p className="text-2xl text-zinc-500 font-bold italic animate-glow">
                                            {content.quiz.subtitle}
                                        </p>
                                    </div>

                                    {/* Progress Visualizer */}
                                    <div className="mb-16">
                                        <div className="flex justify-between items-end mb-4">
                                            <span className="text-sm font-black text-gold-500 uppercase tracking-[0.3em]">
                                                {content.quiz.questionLabel} {currentQ + 1}
                                            </span>
                                            <span className="text-sm font-black text-zinc-500 uppercase tracking-widest">
                                                {content.quiz.questions.length} {content.quiz.totalLabel}
                                            </span>
                                        </div>
                                        <div className="h-4 bg-black/40 rounded-full overflow-hidden p-1 shadow-inner border border-white/5">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] relative overflow-hidden"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((currentQ + 1) / content.quiz.questions.length) * 100}%` }}
                                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Question & Options */}
                                    <motion.div
                                        key={currentQ}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-10"
                                    >
                                        <h3 className="text-3xl md:text-4xl font-black leading-tight text-center mb-12">
                                            {content.quiz.questions[currentQ].question}
                                        </h3>
                                        <div className="grid gap-6">
                                            {content.quiz.questions[currentQ].options.map((opt, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={{ scale: 1.05, x: 10, borderColor: "rgba(234, 179, 8, 0.5)" }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleAnswer(opt.score)}
                                                    className="w-full p-8 rounded-[2rem] bg-zinc-950/50 hover:bg-zinc-900 border-4 border-zinc-800 text-left transition-all flex justify-between items-center group shadow-2xl relative overflow-hidden"
                                                >
                                                    <div className="relative z-10 flex items-center gap-6">
                                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-black text-gold-500 group-hover:bg-gold-500 group-hover:text-black transition-colors">
                                                            {idx + 1}
                                                        </div>
                                                        <span className="font-black text-xl md:text-2xl group-hover:text-gold-500 transition-colors">{opt.text}</span>
                                                    </div>
                                                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-zinc-800 group-hover:bg-gold-500 flex items-center justify-center transition-all shadow-xl group-hover:rotate-12">
                                                        <ChevronRight className="w-6 h-6 text-zinc-500 group-hover:text-black" />
                                                    </div>
                                                    {/* Internal Hover Glow */}
                                                    <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="quiz-results"
                                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    className="text-center py-10 relative z-10"
                                >
                                    <div className="relative inline-block mb-12">
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 4 }}
                                            className="absolute inset-0 bg-gold-500 blur-[80px] rounded-full"
                                        ></motion.div>
                                        <motion.div
                                            whileHover={{ rotateY: 360 }}
                                            transition={{ duration: 1 }}
                                            className="w-40 h-40 bg-gradient-to-br from-gold-400 via-yellow-200 to-gold-600 rounded-[3rem] flex items-center justify-center relative shadow-3xl ring-8 ring-white/10"
                                        >
                                            {score >= 3 ? <Trophy className="w-20 h-20 text-black animate-bounce" /> : <ShieldCheck className="w-20 h-20 text-black animate-pulse" />}
                                        </motion.div>
                                    </div>

                                    <h3 className="text-5xl md:text-7xl font-black mb-10 bg-clip-text text-transparent bg-gradient-to-r from-white via-gold-400 to-white animate-text-flash tracking-tight">
                                        {result.title}
                                    </h3>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-black/60 rounded-[3rem] p-10 border-4 border-gold-500/20 mb-16 shadow-2xl relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50"></div>
                                        <p className="text-zinc-300 leading-relaxed text-2xl font-bold italic">"{result.desc}"</p>
                                        <Activity className="absolute bottom-6 right-10 w-16 h-16 text-white/5 group-hover:text-gold-500/10 transition-colors" />
                                    </motion.div>

                                    <motion.button
                                        whileHover={{ scale: 1.1, boxShadow: "0 0 50px rgba(234, 179, 8, 0.4)" }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onComplete}
                                        className="w-full md:w-auto px-20 py-8 bg-gold-500 hover:bg-gold-400 text-black font-black text-2xl rounded-[2.5rem] shadow-2xl transition-all flex items-center justify-center gap-4 mx-auto relative overflow-hidden group"
                                    >
                                        <span className="relative z-10">{result.cta}</span>
                                        <ChevronRight className="w-8 h-8 relative z-10 group-hover:translate-x-3 transition-transform" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                        <Zap className="absolute top-2 left-4 w-6 h-6 text-white/30 animate-pulse" />
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Footer Info */}
                    <div className="mt-12 flex justify-center items-center gap-8 opacity-40">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Secure Protocol</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Live Bio-Data Screening</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SteroidReadinessQuiz;
