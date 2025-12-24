import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, BicepsFlexed, Trophy, Flag, Star, Droplet, Flame, Brain, ChevronLeft, ChevronRight, Activity, Dumbbell } from 'lucide-react';
import { ContentStrings } from '../types';

interface MetricBarProps {
    label: string;
    value: number;
    colorClass: string;
    icon: React.ReactNode;
}

const MetricBar: React.FC<MetricBarProps> = ({ label, value, colorClass, icon }) => (
    <div className="space-y-1">
        <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">{icon} {label}</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-white">{value}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
                className={`h-full rounded-full ${colorClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
        </div>
    </div>
);

const TransformationTimeline: React.FC<{ content: ContentStrings, isRTL: boolean }> = ({ content, isRTL }) => {
    const [activePhase, setActivePhase] = useState(0);

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
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.timelineTitle}</h2>
                <p className="text-zinc-500 max-w-2xl mx-auto">{content.timelineSubtitle}</p>
            </div>

            <div className="relative mb-16 px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 rounded-full z-0"></div>
                <motion.div
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-gold-600 to-gold-400 -translate-y-1/2 rounded-full z-0 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    animate={{ width: `${(activePhase / (content.timelinePhases.length - 1)) * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <div className="relative z-10 flex justify-between">
                    {content.timelinePhases.map((phase, idx) => {
                        const isActive = idx === activePhase;
                        const isCompleted = idx < activePhase;
                        return (
                            <div key={idx} className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setActivePhase(idx)}>
                                <button className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl relative overflow-hidden ${isActive ? 'bg-zinc-900 dark:bg-white text-gold-500 scale-110 ring-4 ring-gold-500/20' : isCompleted ? 'bg-gold-500 text-black' : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-700'}`}>
                                    {getPhaseIcon(phase.iconKey)}
                                    {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite]"></div>}
                                </button>
                                <span className={`text-xs font-bold transition-colors ${isActive ? 'text-gold-600 dark:text-gold-500' : 'text-zinc-400'}`}>{phase.week}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-zinc-200 dark:border-zinc-700/50 shadow-2xl overflow-hidden relative transition-all duration-500 min-h-[500px] flex flex-col md:flex-row animate-fade-in group">
                <div className="w-full md:w-1/3 bg-zinc-50/50 dark:bg-black/20 p-6 md:p-8 border-r border-zinc-100 dark:border-zinc-800 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gold-500/20 text-gold-600 dark:text-gold-500 rounded-xl">{getPhaseIcon(activeData.iconKey)}</div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{activeData.title}</h3>
                                <p className="text-xs text-zinc-500 font-medium">{activeData.shortDesc}</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <MetricBar label={content.timelineLabels.strength} value={activeData.stats.strength} colorClass="bg-red-500" icon={<Dumbbell className="w-3 h-3" />} />
                            <MetricBar label={content.timelineLabels.hypertrophy} value={activeData.stats.hypertrophy} colorClass="bg-purple-500" icon={<BicepsFlexed className="w-3 h-3" />} />
                            <MetricBar label={content.timelineLabels.water} value={activeData.stats.waterRetention} colorClass="bg-blue-500" icon={<Droplet className="w-3 h-3" />} />
                            <MetricBar label={content.timelineLabels.fatLoss} value={activeData.stats.fatLoss} colorClass="bg-orange-500" icon={<Flame className="w-3 h-3" />} />
                            <MetricBar label={content.timelineLabels.mood} value={activeData.stats.mood} colorClass="bg-green-500" icon={<Brain className="w-3 h-3" />} />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-center text-xs text-zinc-400">
                            <span>{content.timelineLabels.phaseLabel} {activePhase + 1} / {content.timelinePhases.length}</span>
                            <div className="flex gap-2">
                                <button aria-label="Previous Phase" title="Previous Phase" disabled={activePhase === 0} onClick={() => setActivePhase(p => p - 1)} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </button>
                                <button aria-label="Next Phase" title="Next Phase" disabled={activePhase === content.timelinePhases.length - 1} onClick={() => setActivePhase(p => p + 1)} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-2/3 p-6 md:p-10 flex flex-col justify-center space-y-8">
                    <div className="relative group/item">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                        <div className="pl-4 md:pl-6 transition-all group-hover/item:translate-x-2">
                            <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-4 h-4" /> {content.timelineLabels.biologicalTitle}</h4>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base">{activeData.details.biological}</p>
                        </div>
                    </div>
                    <div className="relative group/item">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-transparent rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                        <div className="pl-4 md:pl-6 transition-all group-hover/item:translate-x-2">
                            <h4 className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Brain className="w-4 h-4" /> {content.timelineLabels.feelingTitle}</h4>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base">{activeData.details.feeling}</p>
                        </div>
                    </div>
                    <div className="bg-zinc-900 dark:bg-white text-white dark:text-black p-5 rounded-2xl shadow-xl transform transition-transform hover:scale-[1.01] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gold-500/20 rounded-bl-full"></div>
                        <h4 className="text-xs font-black text-gold-500 dark:text-gold-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Zap className="w-3 h-3" /> {content.timelineLabels.actionTitle}</h4>
                        <p className="text-sm md:text-base font-medium leading-relaxed z-10 relative">{activeData.details.action}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransformationTimeline;
