import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, BicepsFlexed, Trophy, Flag, Star, Droplet, Flame, Brain, ChevronLeft, ChevronRight, Activity, Dumbbell, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ContentStrings } from '../../types';
import { StyledBrandName } from '../shared/StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';

const MetricBar: React.FC<{ label: string; value: number; colorClass: string; icon: React.ReactNode }> = ({ label, value, colorClass, icon }) => (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/30 group/metric transition-all hover:bg-white/80 dark:hover:bg-zinc-800/50">
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center bg-zinc-500/10 rounded-lg text-zinc-500 group-hover/metric:scale-110 transition-all`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-tight text-zinc-500 truncate">{label}</span>
                <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-100">{value}%</span>
            </div>
            <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${value}%` }}
                    className={`h-full ${colorClass} rounded-full`}
                />
            </div>
        </div>
    </div>
);

const TransformationTimeline: React.FC<{ content: ContentStrings }> = ({ content }) => {
    const { isRTL } = usePreferences();
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
        <div className="max-w-7xl mx-auto px-4 relative">
            {/* Background Kinetic Orbs */}
            <div className="absolute -top-24 -inset-inline-start-24 w-96 h-96 bg-gold-500/5 blur-[100px] rounded-full animate-float-slow -z-10"></div>
            <div className="absolute -bottom-24 -inset-inline-end-24 w-96 h-96 bg-zinc-700/5 blur-[100px] rounded-full animate-float-slow -z-10 [animation-delay:-3s]"></div>

            <div className="text-center mb-16 relative">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter"
                >
                    {content.timelineTitle}
                </motion.h2>
                <p className="text-sm md:text-lg text-zinc-500 max-w-5xl mx-auto font-bold italic animate-glow"><StyledBrandName text={content.timelineSubtitle} /></p>
            </div>

            {/* Dashboard Container */}
            <div className={`flex flex-col lg:flex-row gap-8 items-start relative z-20 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>

                {/* Vertical Sidebar (Weeks Selection) */}
                <div className="w-full lg:w-32 flex lg:flex-col gap-4 lg:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 hide-scrollbar lg:sticky lg:top-24 relative">
                    {/* Luminous Connector Strip */}
                    <div className="absolute top-1/2 inset-inline-start-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent lg:w-1 lg:h-full lg:inset-inline-start-1/2 lg:top-0 lg:bg-gradient-to-b -z-10 blur-sm"></div>
                    <div className="absolute top-1/2 inset-inline-start-0 w-full h-0.5 bg-gold-500/30 lg:w-0.5 lg:h-full lg:inset-inline-start-1/2 lg:top-0 -z-10"></div>

                    {/* Pulsing Line Effect (Mobile Horizontal) */}
                    <motion.div
                        className="absolute block lg:hidden top-1/2 -translate-y-1/2 h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent blur-md z-0"
                        animate={{ left: ['-20%', '120%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Pulsing Line Effect (Desktop Vertical) */}
                    <motion.div
                        className="absolute hidden lg:block left-1/2 -translate-x-1/2 w-1 h-24 bg-gradient-to-b from-transparent via-white to-transparent blur-md z-0"
                        animate={{ top: ['-20%', '120%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    {content.timelinePhases.map((phase, idx) => {
                        const isActive = idx === activePhase;
                        const isCompleted = idx < activePhase;
                        return (
                            <motion.div
                                key={idx}
                                className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 group/phase"
                                onClick={() => setActivePhase(idx)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl relative overflow-hidden ${isActive ? 'bg-zinc-900 dark:bg-white text-gold-500 scale-110 ring-4 ring-gold-500/20' : isCompleted ? 'bg-gold-500 text-black' : 'bg-white dark:bg-zinc-900 text-zinc-400 border-2 border-zinc-200 dark:border-zinc-800'}`}>
                                    {getPhaseIcon(phase.iconKey)}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-shimmer"
                                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent w-full h-full -translate-x-full animate-shimmer"
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className={`flex flex-col items-center leading-none transition-colors duration-300 ${isActive ? 'text-gold-600 dark:text-gold-500' : 'text-zinc-400 group-hover/phase:text-zinc-600 dark:group-hover/phase:text-zinc-300'}`}>
                                    <span className="text-[10px] md:text-xs font-bold uppercase opacity-80 mb-0.5">{content.timelineWeekLabel}</span>
                                    <span className="text-xl md:text-2xl font-black">{phase.week}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Main Dashboard Grid */}
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full min-h-[600px]">
                    {/* Evolution Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-white/50 dark:bg-background/50 backdrop-blur-3xl rounded-[2.5rem] p-5 md:p-8 border-4 border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden group/chart animate-glow flex flex-col h-full"
                    >
                        <div className="absolute top-0 inset-inline-end-0 w-48 h-48 bg-gold-500/5 rounded-full blur-[60px]"></div>

                        <div className="flex flex-col mb-6 gap-3">
                            <div>
                                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gold-500 animate-pulse" />
                                    {content.timelineLabels.chartTitle}
                                </h3>
                                <p className="text-xs font-bold text-zinc-500 mt-0.5 uppercase tracking-widest">{content.timelineLabels.chartSubtitle}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { label: content.timelineLabels.strength, color: 'red-500' },
                                    { label: content.timelineLabels.hypertrophy, color: 'purple-500' },
                                    { label: content.timelineLabels.water, color: 'blue-500' },
                                    { label: content.timelineLabels.fatLoss, color: 'orange-500' },
                                    { label: content.timelineLabels.mood, color: 'green-500' }
                                ].map((item, i) => (
                                    <div key={i} className={`flex items-center gap-1 px-2.5 py-1 bg-${item.color}/10 rounded-full border border-${item.color}/20 text-[10px] font-black uppercase text-${item.color}`}>
                                        <div className={`w-1 h-1 rounded-full bg-${item.color}`}></div>
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-grow min-h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
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
                                        fontSize={9}
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
                                            borderRadius: '1rem',
                                            backdropFilter: 'blur(10px)',
                                            color: '#fff',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <Area name={content.timelineLabels.strength} type="monotone" dataKey="strength" stackId="1" stroke="#ef4444" fillOpacity={1} fill="url(#colorStrength)" strokeWidth={2} />
                                    <Area name={content.timelineLabels.hypertrophy} type="monotone" dataKey="hypertrophy" stackId="1" stroke="#a855f7" fillOpacity={1} fill="url(#colorHypertrophy)" strokeWidth={2} />
                                    <Area name={content.timelineLabels.water} type="monotone" dataKey="waterRetention" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" strokeWidth={2} />
                                    <Area name={content.timelineLabels.fatLoss} type="monotone" dataKey="fatLoss" stackId="1" stroke="#f97316" fillOpacity={1} fill="url(#colorFat)" strokeWidth={2} />
                                    <Area name={content.timelineLabels.mood} type="monotone" dataKey="mood" stackId="1" stroke="#22c55e" fillOpacity={1} fill="url(#colorMood)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Content Card */}
                    <motion.div
                        key={activePhase}
                        initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 120 }}
                        className="bg-white/90 dark:bg-background/80 backdrop-blur-3xl rounded-[2.5rem] border-4 border-zinc-200 dark:border-zinc-800/50 shadow-2xl overflow-hidden relative flex flex-col h-full card-shine animate-glow group"
                    >
                        {/* Stats Header */}
                        <div className="w-full bg-zinc-50/50 dark:bg-background/40 p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col relative text-start">
                            <div className="absolute top-0 inset-inline-start-0 w-full h-1.5 bg-gradient-to-r from-gold-600 to-gold-400"></div>

                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-10 h-10 flex items-center justify-center bg-gold-500/10 text-gold-600 dark:text-gold-500 rounded-lg shadow-lg ring-1 ring-gold-500/20"
                                >
                                    {getPhaseIcon(activeData.iconKey)}
                                </motion.div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white leading-tight tracking-tighter uppercase">{activeData.title}</h3>
                                    <p className="text-xs text-gold-600 dark:text-gold-500 font-black tracking-[0.2em] uppercase mt-1">{activeData.shortDesc}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-2">
                                <MetricBar label={content.timelineLabels.strength} value={activeData.stats.strength} colorClass="bg-red-500" icon={<Dumbbell className="w-2.5 h-2.5" />} />
                                <MetricBar label={content.timelineLabels.hypertrophy} value={activeData.stats.hypertrophy} colorClass="bg-purple-500" icon={<BicepsFlexed className="w-2.5 h-2.5" />} />
                                <MetricBar label={content.timelineLabels.water} value={activeData.stats.waterRetention} colorClass="bg-blue-500" icon={<Droplet className="w-2.5 h-2.5" />} />
                                <MetricBar label={content.timelineLabels.fatLoss} value={activeData.stats.fatLoss} colorClass="bg-orange-500" icon={<Flame className="w-2.5 h-2.5" />} />
                                <MetricBar label={content.timelineLabels.mood} value={activeData.stats.mood} colorClass="bg-green-500" icon={<Brain className="w-2.5 h-2.5" />} />
                            </div>
                        </div>

                        {/* Narrative Section */}
                        <div className="w-full p-5 lg:p-6 space-y-4 flex-grow flex flex-col justify-center text-start overflow-y-auto max-h-[350px] hide-scrollbar">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative group/item">
                                <div className="absolute inline-start-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent rounded-full"></div>
                                <div className="ps-4 group-hover/item:ps-5 transition-all">
                                    <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Activity className="w-4 h-4" />
                                        {content.timelineLabels.biologicalTitle}
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-base font-medium"><StyledBrandName text={activeData.details.biological} /></p>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="relative group/item">
                                <div className="absolute inline-start-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-purple-400 to-transparent rounded-full"></div>
                                <div className="ps-4 group-hover/item:ps-5 transition-all">
                                    <h4 className="text-sm font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Brain className="w-4 h-4" />
                                        {content.timelineLabels.feelingTitle}
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-base font-medium"><StyledBrandName text={activeData.details.feeling} /></p>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-background dark:bg-white text-white dark:text-black p-4 rounded-3xl shadow-xl relative overflow-hidden group/action">
                                <h4 className="text-sm font-black text-gold-500 dark:text-gold-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Zap className="w-4 h-4 fill-gold-500" />
                                    {content.timelineLabels.actionTitle}
                                </h4>
                                <p className="text-base font-black leading-tight relative italic text-white dark:text-black"><StyledBrandName text={activeData.details.action} /></p>
                            </motion.div>
                        </div>

                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between mt-auto">
                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{content.timelineLabels.phaseLabel} {activePhase + 1} / {content.timelinePhases.length}</span>
                            <div className="flex gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    disabled={activePhase === 0}
                                    onClick={() => setActivePhase(p => p - 1)}
                                    className="p-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-20 transition-all shadow-md"
                                >
                                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    disabled={activePhase === content.timelinePhases.length - 1}
                                    onClick={() => setActivePhase(p => p + 1)}
                                    className="p-2.5 rounded-xl bg-gold-500 text-black disabled:opacity-20 transition-all shadow-md"
                                >
                                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>


        </div>
    );
};

export default TransformationTimeline;
