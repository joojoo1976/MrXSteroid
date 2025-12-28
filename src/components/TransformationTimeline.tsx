import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, BicepsFlexed, Trophy, Flag, Star, Droplet, Flame, Brain, ChevronLeft, ChevronRight, Activity, Dumbbell, LineChart, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ContentStrings } from '../types';

interface MetricBarProps {
    label: string;
    value: number;
    colorClass: string;
    icon: React.ReactNode;
}

const MetricBar: React.FC<MetricBarProps> = ({ label, value, colorClass, icon }) => (
    <div className="space-y-1 group/metric">
        <div className="flex justify-between items-end">
            <span className="text-xs font-black text-zinc-500 flex items-center gap-2 group-hover/metric:text-zinc-900 dark:group-hover/metric:text-white transition-colors">{icon} {label}</span>
            <motion.span
                key={value}
                initial={{ scale: 1.5, color: "#EAB308" }}
                animate={{ scale: 1, color: "inherit" }}
                className="text-xs font-black text-zinc-900 dark:text-white font-mono"
            >
                {value}%
            </motion.span>
        </div>
        <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <motion.div
                className={`h-full rounded-full ${colorClass} relative overflow-hidden`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </motion.div>
        </div>
    </div>
);

const TransformationTimeline: React.FC<{ content: ContentStrings, isRTL: boolean }> = ({ content, isRTL }) => {
    const [activePhase, setActivePhase] = useState(0);

    const chartData = content.timelinePhases.map(phase => ({
        week: phase.week,
        strength: phase.stats.strength,
        hypertrophy: phase.stats.hypertrophy,
        waterRetention: phase.stats.waterRetention,
        fatLoss: phase.stats.fatLoss,
        mood: phase.stats.mood,
    }));

    const getPhaseIcon = (key: string) => {
        switch (key) {
            case 'spark': return <Zap className="w-6 h-6" />;
            case 'muscle': return <BicepsFlexed className="w-6 h-6" />;
            case 'trophy': return <Trophy className="w-6 h-6" />;
            case 'flag': return <Flag className="w-6 h-6" />;
            default: return <Star className="w-6 h-6" />;
        }
    };

    const activeData = content.timelinePhases[activePhase];

    return (
        <div className="max-w-6xl mx-auto px-4 relative">
            {/* Background Kinetic Orbs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold-500/5 blur-[100px] rounded-full animate-float-slow -z-10"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full animate-float-slow -z-10 [animation-delay:-3s]"></div>

            <div className="text-center mb-16 relative">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter"
                >
                    {content.timelineTitle}
                </motion.h2>
                <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-bold italic animate-glow">{content.timelineSubtitle}</p>
            </div>

            {/* Timeline Stepper */}
            <div className="relative mb-20 px-4 md:px-12">
                <div className="absolute top-1/2 left-0 w-full h-2 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 rounded-full z-0 shadow-inner"></div>
                <motion.div
                    className={`absolute top-1/2 h-2 bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600 -translate-y-1/2 rounded-full z-0 shadow-[0_0_30px_rgba(234,179,8,0.5)] ${isRTL ? 'right-0' : 'left-0'}`}
                    animate={{ width: `${(activePhase / (content.timelinePhases.length - 1)) * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                </motion.div>

                <div className="relative z-10 flex justify-between">
                    {content.timelinePhases.map((phase, idx) => {
                        const isActive = idx === activePhase;
                        const isCompleted = idx < activePhase;
                        return (
                            <motion.div
                                key={idx}
                                className="flex flex-col items-center gap-4 cursor-pointer"
                                onClick={() => setActivePhase(idx)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden ${isActive ? 'bg-zinc-900 dark:bg-white text-gold-500 scale-125 ring-8 ring-gold-500/20' : isCompleted ? 'bg-gold-500 text-black' : 'bg-white dark:bg-zinc-900 text-zinc-400 border-2 border-zinc-200 dark:border-zinc-800'}`}>
                                    {getPhaseIcon(phase.iconKey)}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-shimmer"
                                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent w-full h-full -translate-x-full animate-shimmer"
                                            />
                                        )}
                                    </AnimatePresence>
                                    {isCompleted && !isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />}
                                </div>
                                <span className={`text-sm font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gold-600 dark:text-gold-500 scale-110' : 'text-zinc-400'}`}>{phase.week}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Evolution Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="mb-20 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border-4 border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden group/chart animate-glow z-20"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px]"></div>

                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white flex items-center gap-4">
                            <TrendingUp className="w-8 h-8 text-gold-500 animate-pulse" />
                            {isRTL ? "مخطط التطور التراكمي" : "Cumulative Evolution Plot"}
                        </h3>
                        <p className="text-sm font-bold text-zinc-500 mt-1 uppercase tracking-widest">{isRTL ? "تتبع ذكي للمؤشرات البيولوجية والأداء" : "AI-Driven Biometric & Performance Tracking"}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-[10px] font-black uppercase text-red-600">{content.timelineLabels.strength}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-[10px] font-black uppercase text-purple-600">{content.timelineLabels.hypertrophy}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-[10px] font-black uppercase text-blue-600">{content.timelineLabels.water}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="text-[10px] font-black uppercase text-orange-600">{content.timelineLabels.fatLoss}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-[10px] font-black uppercase text-green-600">{content.timelineLabels.mood}</span>
                        </div>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorHypertrophy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} stroke="#888" />
                            <XAxis
                                dataKey="week"
                                stroke="#888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontWeight: 'black' }}
                                reversed={isRTL}
                            />
                            <YAxis hide domain={[0, 'auto']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                    border: '1px solid rgba(234, 179, 8, 0.2)',
                                    borderRadius: '1.5rem',
                                    backdropFilter: 'blur(10px)',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                                }}
                                itemStyle={{ padding: '2px 0' }}
                            />
                            <Area type="monotone" dataKey="strength" stackId="1" stroke="#ef4444" fillOpacity={1} fill="url(#colorStrength)" strokeWidth={3} />
                            <Area type="monotone" dataKey="hypertrophy" stackId="1" stroke="#a855f7" fillOpacity={1} fill="url(#colorHypertrophy)" strokeWidth={3} />
                            <Area type="monotone" dataKey="waterRetention" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" strokeWidth={3} />
                            <Area type="monotone" dataKey="fatLoss" stackId="1" stroke="#f97316" fillOpacity={1} fill="url(#colorFat)" strokeWidth={3} />
                            <Area type="monotone" dataKey="mood" stackId="1" stroke="#22c55e" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Content Card */}
            <motion.div
                key={activePhase}
                initial={{ opacity: 0, x: isRTL ? -100 : 100, rotateY: isRTL ? -10 : 10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[4rem] border-4 border-zinc-200 dark:border-zinc-800/50 shadow-[0_0_80px_rgba(0,0,0,0.1)] overflow-hidden relative flex flex-col lg:flex-row min-h-[600px] card-shine animate-glow group"
            >
                {/* Stats Sidebar */}
                <div className="w-full lg:w-2/5 bg-zinc-50/50 dark:bg-black/40 p-10 lg:p-12 border-b lg:border-b-0 lg:ltr:border-r lg:rtl:border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-600 to-gold-400"></div>

                    <div>
                        <div className="flex items-center gap-5 mb-10">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="p-5 bg-gold-500/10 text-gold-600 dark:text-gold-500 rounded-3xl shadow-xl ring-2 ring-gold-500/20"
                            >
                                {getPhaseIcon(activeData.iconKey)}
                            </motion.div>
                            <div>
                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight tracking-tighter uppercase">{activeData.title}</h3>
                                <p className="text-xs text-gold-600 dark:text-gold-500 font-black tracking-[0.2em] uppercase mt-1">{activeData.shortDesc}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <MetricBar label={content.timelineLabels.strength} value={activeData.stats.strength} colorClass="bg-red-500" icon={<Dumbbell className="w-4 h-4" />} />
                            <MetricBar label={content.timelineLabels.hypertrophy} value={activeData.stats.hypertrophy} colorClass="bg-purple-500" icon={<BicepsFlexed className="w-4 h-4" />} />
                            <MetricBar label={content.timelineLabels.water} value={activeData.stats.waterRetention} colorClass="bg-blue-500" icon={<Droplet className="w-4 h-4" />} />
                            <MetricBar label={content.timelineLabels.fatLoss} value={activeData.stats.fatLoss} colorClass="bg-orange-500" icon={<Flame className="w-4 h-4" />} />
                            <MetricBar label={content.timelineLabels.mood} value={activeData.stats.mood} colorClass="bg-green-500" icon={<Brain className="w-4 h-4" />} />
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-sm font-black text-zinc-400 uppercase tracking-widest">{content.timelineLabels.phaseLabel} {activePhase + 1} / {content.timelinePhases.length}</span>
                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.2, x: isRTL ? 5 : -5 }}
                                whileTap={{ scale: 0.8 }}
                                disabled={activePhase === 0}
                                onClick={() => setActivePhase(p => p - 1)}
                                className="p-4 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-20 transition-all shadow-lg"
                            >
                                <ChevronLeft className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.2, x: isRTL ? -5 : 5 }}
                                whileTap={{ scale: 0.8 }}
                                disabled={activePhase === content.timelinePhases.length - 1}
                                onClick={() => setActivePhase(p => p + 1)}
                                className="p-4 rounded-2xl bg-gold-500 text-black disabled:opacity-20 transition-all shadow-lg"
                            >
                                <ChevronRight className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Narrative Section */}
                <div className="w-full lg:w-3/5 p-10 lg:p-16 flex flex-col justify-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative group/item"
                    >
                        <div className="absolute ltr:-left-6 rtl:-right-6 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent rounded-full animate-pulse"></div>
                        <div className="ltr:pl-6 rtl:pr-6 group-hover/item:ltr:translate-x-3 group-hover/item:rtl:-translate-x-3 transition-transform duration-500">
                            <h4 className="text-lg font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                <Activity className="w-6 h-6" />
                                {content.timelineLabels.biologicalTitle}
                            </h4>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-xl md:text-2xl font-medium">{activeData.details.biological}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative group/item"
                    >
                        <div className="absolute ltr:-left-6 rtl:-right-6 top-0 bottom-0 w-2 bg-gradient-to-b from-purple-500 via-purple-400 to-transparent rounded-full animate-pulse"></div>
                        <div className="ltr:pl-6 rtl:pr-6 group-hover/item:ltr:translate-x-3 group-hover/item:rtl:-translate-x-3 transition-transform duration-500">
                            <h4 className="text-lg font-black text-purple-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                <Brain className="w-6 h-6" />
                                {content.timelineLabels.feelingTitle}
                            </h4>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-xl md:text-2xl font-medium">{activeData.details.feeling}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-zinc-900 dark:bg-white text-white dark:text-black p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group/action card-shine animate-glow"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/20 rounded-bl-full group-hover/action:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-sm font-black text-gold-500 dark:text-gold-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                            <Zap className="w-5 h-5 fill-gold-500" />
                            {content.timelineLabels.actionTitle}
                        </h4>
                        <p className="text-lg md:text-2xl font-black leading-relaxed z-10 relative italic">{activeData.details.action}</p>
                        <div className="absolute bottom-4 right-8 opacity-10 group-hover/action:opacity-30 transition-opacity">
                            <Dumbbell className="w-20 h-20 rotate-45" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default TransformationTimeline;
