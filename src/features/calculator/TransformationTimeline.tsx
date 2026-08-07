import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import {
    Zap, BicepsFlexed, Trophy, Flag, Star, Droplet, Flame, Brain,
    ChevronLeft, ChevronRight, Activity, Dumbbell, TrendingUp, BookOpen,
    ShieldCheck, Scale, Ruler, Timer, Percent, Gauge, LineChart, HeartPulse,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ContentStrings } from '@/shared/types/types';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';
import { useTransformationTimeline } from './hooks/useTransformationTimeline';
import {
    formatWeight,
    clamp,
    roundTo,
    buildTimelineCopyContext,
    renderTimelineCopy,
    type TimelineCopyContext,
    type TrainingAge,
} from './lib/transformationEngine';

// ═══════════════════════════════════════════════════════════════════════════
//  Small presentational primitives
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Spring-animated numeric readout — glides to each new value instead of
 * snapping, driven by framer-motion (no rAF loops, GPU-friendly).
 */
const AnimatedNumber: React.FC<{
    value: number;
    format?: (n: number) => string;
    className?: string;
}> = memo(({ value, format, className }) => {
    const spring = useSpring(value, { stiffness: 90, damping: 22, mass: 0.5 });
    const display = useTransform(spring, (v) => (format ? format(v) : String(Math.round(v))));
    return <motion.span className={className} aria-hidden="true">{display}</motion.span>;
});

const MetricBar: React.FC<{ label: string; value: number; colorClass: string; icon: React.ReactNode }> = memo(({ label, value, colorClass, icon }) => (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/30 group/metric transition-all hover:bg-white/80 dark:hover:bg-zinc-800/50 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/5">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-zinc-500/10 rounded-lg text-zinc-500 group-hover/metric:scale-110 transition-all">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-tight text-zinc-500 truncate">{label}</span>
                <AnimatedNumber
                    value={value}
                    format={(n) => `${Math.round(n)}%`}
                    className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 tabular-nums"
                />
            </div>
            <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    animate={{ width: `${clamp(value, 0, 100)}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                    className={`h-full ${colorClass} rounded-full`}
                />
            </div>
        </div>
    </div>
));

/** Neon silhouette — SVG kinetic micro-graphic representing muscle vs fat. */
const KineticSilhouette: React.FC<{ musclePct: number; fatPct: number; isAr: boolean }> = ({ musclePct, fatPct, isAr }) => {
    const muscle = clamp(musclePct, 5, 100);
    const fat = clamp(fatPct, 5, 100);
    return (
        <div className="relative w-full max-w-[240px] mx-auto aspect-square" aria-hidden="true">
            {/* Pulsing halo */}
            <div className="absolute inset-0 rounded-full bg-gold-500/5 blur-2xl animate-pulse" />
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_18px_rgba(234,179,8,0.25)]">
                <defs>
                    <linearGradient id="muscleGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
                    </linearGradient>
                </defs>

                {/* Fat ring (shrinks as fat drops) */}
                <circle
                    cx="100" cy="100" r={30 + fat * 0.5}
                    fill="none" stroke="url(#fatGrad)" strokeWidth="10"
                    strokeDasharray={`${(100 - fat) * 1.9} 600`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                />

                {/* Muscle core (grows with hypertrophy) */}
                <motion.circle
                    cx="100" cy="100"
                    r={18 + muscle * 0.22}
                    fill="url(#muscleGrad)"
                    initial={{ r: 20 }}
                    animate={{ r: 18 + muscle * 0.22 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 14 }}
                    className="opacity-90"
                />

                {/* Atomic nucleus */}
                <circle cx="100" cy="100" r="6" fill="#fff" className="animate-pulse" />
                <text x="100" y="196" textAnchor="middle" fontSize="9" fontWeight="800" fill="currentColor" className="text-zinc-400 dark:text-zinc-500">
                    {isAr ? 'كتلة عضلية × نسبة دهون' : 'Muscle × Fat'}
                </text>
            </svg>
        </div>
    );
};

/** Glassmorphism stat tile for the live engine panel. */
const EngineTile: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    accentClass?: string;
    trend?: 'up' | 'down';
    hint?: string;
}> = memo(({ icon, label, value, accentClass = 'text-gold-500', trend, hint }) => (
    <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-4 flex flex-col gap-1.5 shadow-lg group/tile hover:shadow-gold-500/10 transition-all hover:-translate-y-0.5 hover:border-gold-500/30">
        <div className={`absolute top-0 inset-inline-start-0 h-0.5 w-full bg-gradient-to-r ${trend === 'down' ? 'from-emerald-500 to-cyan-400' : trend === 'up' ? 'from-gold-500 to-rose-500' : 'from-zinc-400 to-transparent'} opacity-60`} />
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <span className={`flex items-center justify-center w-7 h-7 rounded-lg bg-white/70 dark:bg-white/10 ${accentClass}`}>{icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest truncate">{label}</span>
        </div>
        <motion.span
            key={value}
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900 dark:text-white font-mono tabular-nums"
        >
            {value}
        </motion.span>
        {hint && <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{hint}</span>}
    </div>
));

// ═══════════════════════════════════════════════════════════════════════════
//  Main component
// ═══════════════════════════════════════════════════════════════════════════

const TransformationTimeline: React.FC<{ content: ContentStrings }> = ({ content }) => {
    const { isRTL, unitSystem, setUnitSystem } = usePreferences();
    const isAr = isRTL;
    const isMetric = unitSystem === 'metric';
    const L = content.timelineLabels;

    const {
        activePhase,
        activeData,
        activeAggregate,
        chartData,
        nextPhase,
        prevPhase,
        setPhase,
        totalPhases,
        startWeightKg,
        setStartWeightKg,
        startBodyFatPct,
        setStartBodyFatPct,
        trainingAge,
        setTrainingAge,
        projections,
    } = useTransformationTimeline({ content });

    const [navDirection, setNavDirection] = useState<'next' | 'prev'>('next');

    const goNext = useCallback(() => {
        setNavDirection('next');
        nextPhase();
    }, [nextPhase]);

    const goPrev = useCallback(() => {
        setNavDirection('prev');
        prevPhase();
    }, [prevPhase]);

    const goTo = useCallback((idx: number) => {
        setNavDirection(idx > activePhase ? 'next' : 'prev');
        setPhase(idx);
    }, [activePhase, setPhase]);

    // Keyboard navigation (Arrow keys) — skips interactive form controls.
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const tag = target?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (isRTL) goPrev(); else goNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (isRTL) goNext(); else goPrev();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isRTL, goNext, goPrev]);

    // Unit-aware narrative context — recomputed only when inputs/units change.
    const copyCtx = useMemo<TimelineCopyContext>(
        () => buildTimelineCopyContext({ startWeightKg, trainingAge, unitSystem, isAr }),
        [startWeightKg, trainingAge, unitSystem, isAr],
    );

    const renderCopy = useCallback((template: string) => renderTimelineCopy(template, copyCtx), [copyCtx]);

    const getPhaseIcon = (key: string) => {
        switch (key) {
            case 'spark': return <Zap className="w-6 h-6" />;
            case 'muscle': return <BicepsFlexed className="w-6 h-6" />;
            case 'trophy': return <Trophy className="w-6 h-6" />;
            case 'flag': return <Flag className="w-6 h-6" />;
            default: return <Star className="w-6 h-6" />;
        }
    };

    // Live engine values formatted in the active unit system.
    const activeMuscleGain = formatWeight(activeAggregate?.muscleGainKg ?? 0, unitSystem, isAr);
    const activeFatPctEnd = `${roundTo(activeAggregate?.bodyFatPctEnd ?? startBodyFatPct, 1)}%`;
    const activeFatLossRate = `${roundTo(activeAggregate?.fatLossRatePct ?? 0.75, 1)}%`;

    // Real weekly fat loss: actual mass shed in the active phase's first week.
    const activeWeeklyFatLossKg = projections[Math.max((activeAggregate?.weekStart ?? 1) - 1, 0)]?.fatLossKg ?? 0;
    const activeWeeklyFatLoss = `${formatWeight(activeWeeklyFatLossKg, unitSystem, isAr)}/${isAr ? 'أسبوع' : 'wk'}`;
    const weeklyFatLossHint = `${isAr ? `~${activeFatLossRate} من وزن الجسم` : `${activeFatLossRate} of body weight`}`;

    const phaseProgress = ((activePhase + 1) / totalPhases) * 100;

    // Direction-aware slide variants (RTL-aware).
    const slideVariants = {
        enter: (dir: 'next' | 'prev') => ({
            x: isRTL ? (dir === 'next' ? -64 : 64) : (dir === 'next' ? 64 : -64),
            opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (dir: 'next' | 'prev') => ({
            x: isRTL ? (dir === 'next' ? 64 : -64) : (dir === 'next' ? -64 : 64),
            opacity: 0,
        }),
    };

    const trainingAgeOptions: { id: TrainingAge; label: string }[] = [
        { id: 'novice', label: L.trainingNovice },
        { id: 'intermediate', label: L.trainingIntermediate },
        { id: 'advanced', label: L.trainingAdvanced },
    ];

    return (
        <section
            id="transformation-timeline"
            aria-labelledby="timeline-h2"
            className="max-w-[1400px] mx-auto px-4 md:px-6 relative py-12 md:py-20"
        >
            {/* Background Kinetic Orbs */}
            <div className="absolute -top-12 -inset-inline-start-24 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full animate-float-slow -z-10"></div>
            <div className="absolute -bottom-12 -inset-inline-end-24 w-96 h-96 bg-zinc-700/5 blur-[120px] rounded-full animate-float-slow -z-10 [animation-delay:-3s]"></div>

            {/* ── Section Header ── */}
            <div className="text-center mb-12 md:mb-16 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest mb-6"
                >
                    <Activity className="w-3.5 h-3.5" />
                    {isAr ? 'علم البيولوجيا التطبيقي' : 'Applied Biology Science'}
                </motion.div>

                <motion.h2
                    id="timeline-h2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tight"
                >
                    {content.timelineTitle}
                </motion.h2>
                <div className="h-1 w-24 bg-gold-500 mx-auto mb-6 rounded-full animate-pulse"></div>
                <p className="text-base md:text-xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto font-semibold leading-relaxed">
                    <StyledBrandName text={content.timelineSubtitle} />
                </p>

                {/* Quick stats row */}
                <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-8">
                    {[
                        { icon: <BookOpen className="w-4 h-4" />, label: isAr ? '4 مراحل مفصلة' : '4 Detailed Phases' },
                        { icon: <LineChart className="w-4 h-4" />, label: isAr ? 'توقعات حية' : 'Live Projections' },
                        { icon: <ShieldCheck className="w-4 h-4" />, label: isAr ? 'نصائح الخبراء' : 'Expert Tips' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-black text-zinc-600 dark:text-zinc-300"
                        >
                            <span className="text-gold-500">{stat.icon}</span>
                            {stat.label}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Live Prediction Engine Panel ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-5 md:p-8 mb-6 md:mb-8 shadow-2xl"
            >
                {/* Neon top edge */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />

                <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                    {/* Header + inputs */}
                    <div className="flex-1 space-y-5">
                        <div>
                            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white flex items-center gap-2">
                                <Gauge className="w-5 h-5 text-gold-500 animate-pulse" />
                                {L.engineTitle}
                            </h3>
                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-1">{L.engineSubtitle}</p>
                        </div>

                        {/* Unit toggle */}
                        <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800" role="group" aria-label={isAr ? 'نظام القياس' : 'Unit system'}>
                            <button
                                type="button"
                                onClick={() => setUnitSystem('metric')}
                                aria-pressed={isMetric}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${isMetric ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/30' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                            >
                                <Scale className="w-3.5 h-3.5" />
                                {L.metric} · kg
                            </button>
                            <button
                                type="button"
                                onClick={() => setUnitSystem('imperial')}
                                aria-pressed={!isMetric}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${!isMetric ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/30' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                            >
                                <Ruler className="w-3.5 h-3.5" />
                                {L.imperial} · lbs
                            </button>
                        </div>

                        {/* Start weight slider */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                    <Dumbbell className="w-3 h-3 text-gold-500" />
                                    {L.startWeightLabel}
                                </span>
                                <AnimatedNumber
                                    value={startWeightKg}
                                    format={(n) => formatWeight(n, unitSystem, isAr)}
                                    className="text-sm font-black text-zinc-900 dark:text-white font-mono tabular-nums"
                                />
                            </div>
                            <input
                                type="range"
                                min={40}
                                max={160}
                                value={startWeightKg}
                                onChange={(e) => setStartWeightKg(Number(e.target.value))}
                                aria-label={L.startWeightLabel}
                                className="w-full accent-gold-500"
                            />
                        </div>

                        {/* Body fat slider */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                    <Percent className="w-3 h-3 text-gold-500" />
                                    {L.bodyFatLabel}
                                </span>
                                <AnimatedNumber
                                    value={startBodyFatPct}
                                    format={(n) => `${Math.round(n)}%`}
                                    className="text-sm font-black text-zinc-900 dark:text-white font-mono tabular-nums"
                                />
                            </div>
                            <input
                                type="range"
                                min={8}
                                max={40}
                                value={startBodyFatPct}
                                onChange={(e) => setStartBodyFatPct(Number(e.target.value))}
                                aria-label={L.bodyFatLabel}
                                className="w-full accent-gold-500"
                            />
                        </div>

                        {/* Training age selector */}
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-2">
                                <Timer className="w-3 h-3 text-gold-500" />
                                {L.trainingAgeLabel}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {trainingAgeOptions.map((opt) => {
                                    const selected = trainingAge === opt.id;
                                    return (
                                        <motion.button
                                            key={opt.id}
                                            type="button"
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setTrainingAge(opt.id)}
                                            aria-pressed={selected}
                                            className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition-all border ${
                                                selected
                                                    ? 'bg-gold-500/15 border-gold-500/40 text-gold-600 dark:text-gold-400 shadow-lg shadow-gold-500/10'
                                                    : 'bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-gold-500/30'
                                            }`}
                                        >
                                            {opt.label}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Kinetic silhouette + live numbers */}
                    <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="col-span-2 flex justify-center">
                            <KineticSilhouette
                                musclePct={activeAggregate?.muscleGainKg ? Math.min(100, 20 + activeAggregate.muscleGainKg * 12) : 22}
                                fatPct={startBodyFatPct}
                                isAr={isAr}
                            />
                        </div>
                        <EngineTile
                            icon={<Flame className="w-3.5 h-3.5" />}
                            label={L.weeklyFatLoss}
                            value={activeWeeklyFatLoss}
                            accentClass="text-orange-500"
                            trend="down"
                            hint={weeklyFatLossHint}
                        />
                        <EngineTile
                            icon={<Droplet className="w-3.5 h-3.5" />}
                            label={L.projectedFatPct}
                            value={activeFatPctEnd}
                            accentClass="text-blue-500"
                            trend="down"
                        />
                        <EngineTile
                            icon={<BicepsFlexed className="w-3.5 h-3.5" />}
                            label={L.weeklyMuscleGain}
                            value={activeMuscleGain}
                            accentClass="text-purple-500"
                            trend="up"
                        />
                        <EngineTile
                            icon={<TrendingUp className="w-3.5 h-3.5" />}
                            label={L.cumulativeMuscle}
                            value={formatWeight((chartData[activePhase]?.cumulativeMuscleKg ?? 0), unitSystem, isAr)}
                            accentClass="text-gold-500"
                            trend="up"
                        />
                    </div>
                </div>

                <p className="mt-5 text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-green-500 shrink-0" />
                    {L.disclaimer}
                </p>
            </motion.div>

            {/* ── Dashboard Container ── */}
            <div className={`flex flex-col xl:flex-row gap-6 md:gap-8 items-start relative z-20 ${isRTL ? 'xl:flex-row-reverse' : ''}`}>

                {/* Vertical Sidebar (Weeks Selection) */}
                <div className="w-full lg:w-32 flex lg:flex-col gap-4 lg:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 hide-scrollbar lg:sticky lg:top-24 relative">
                    {/* Luminous Connector Strip */}
                    <div className="absolute top-1/2 inset-inline-start-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent lg:w-1 lg:h-full lg:inset-inline-start-1/2 lg:top-0 lg:bg-gradient-to-b -z-10 blur-sm"></div>
                    <div className="absolute top-1/2 inset-inline-start-0 w-full h-0.5 bg-gold-500/30 lg:w-0.5 lg:h-full lg:inset-inline-start-1/2 lg:top-0 -z-10"></div>

                    {/* Pulsing Line Effect (Mobile Horizontal) */}
                    <motion.div
                        className="absolute block lg:hidden top-1/2 -translate-y-1/2 h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent blur-md z-0"
                        animate={{ left: ['-20%', '120%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Pulsing Line Effect (Desktop Vertical) */}
                    <motion.div
                        className="absolute hidden lg:block left-1/2 -translate-x-1/2 w-1 h-24 bg-gradient-to-b from-transparent via-white to-transparent blur-md z-0"
                        animate={{ top: ['-20%', '120%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    {content.timelinePhases.map((phase, idx) => {
                        const isActive = idx === activePhase;
                        const isCompleted = idx < activePhase;
                        return (
                            <motion.div
                                key={idx}
                                className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 group/phase"
                                onClick={() => goTo(idx)}
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.92 }}
                                role="button"
                                tabIndex={0}
                                aria-label={phase.title}
                                aria-current={isActive ? 'step' : undefined}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(idx); } }}
                            >
                                <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl overflow-hidden ${
                                    isActive
                                        ? 'bg-zinc-900 dark:bg-white text-gold-500 scale-110 ring-4 ring-gold-500/20 shadow-[0_0_25px_-5px_rgba(234,179,8,0.6)]'
                                        : isCompleted
                                            ? 'bg-gold-500 text-black'
                                            : 'bg-white dark:bg-zinc-900 text-zinc-400 border-2 border-zinc-200 dark:border-zinc-800'
                                }`}>
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
                <div className="flex-grow grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8 items-stretch w-full bg-black/5 dark:bg-white/5 p-4 md:p-8 rounded-[2.5rem] md:rounded-[4rem] border-2 border-zinc-200/30 dark:border-zinc-800/30 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_-12px_rgba(234,179,8,0.15)]">
                    <div className="absolute top-0 inset-0 bg-gold-500/5 -z-10 opacity-30"></div>

                    {/* Evolution Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/90 dark:bg-background/90 backdrop-blur-3xl rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden group/chart animate-glow flex flex-col min-h-[400px]"
                    >
                        <div className="absolute top-0 inset-inline-end-0 w-48 h-48 bg-gold-500/5 rounded-full blur-[60px]"></div>

                        <div className="flex flex-col mb-6 gap-3">
                            <div>
                                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gold-500 animate-pulse" />
                                    {L.chartTitle}
                                </h3>
                                <p className="text-xs font-bold text-zinc-500 mt-0.5 uppercase tracking-widest">{L.chartSubtitle}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { label: L.strength, color: 'red-500' },
                                    { label: L.hypertrophy, color: 'purple-500' },
                                    { label: L.water, color: 'blue-500' },
                                    { label: L.fatLoss, color: 'orange-500' },
                                    { label: L.mood, color: 'green-500' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase">
                                        <div className={`w-1 h-1 rounded-full ${item.color.replace('text-', 'bg-')}`}></div>
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
                                    <ReferenceLine
                                        x={activeData.week}
                                        stroke="#f59e0b"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        ifOverflow="extendDomain"
                                    />
                                    <Area name={L.strength} type="monotone" dataKey="strength" stackId="1" stroke="#ef4444" fillOpacity={1} fill="url(#colorStrength)" strokeWidth={2} />
                                    <Area name={L.hypertrophy} type="monotone" dataKey="hypertrophy" stackId="1" stroke="#a855f7" fillOpacity={1} fill="url(#colorHypertrophy)" strokeWidth={2} />
                                    <Area name={L.water} type="monotone" dataKey="waterRetention" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" strokeWidth={2} />
                                    <Area name={L.fatLoss} type="monotone" dataKey="fatLoss" stackId="1" stroke="#f97316" fillOpacity={1} fill="url(#colorFat)" strokeWidth={2} />
                                    <Area name={L.mood} type="monotone" dataKey="mood" stackId="1" stroke="#22c55e" fillOpacity={1} fill="url(#colorMood)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Content Card — animated phase transitions */}
                    <AnimatePresence mode="wait" custom={navDirection} initial={false}>
                        <motion.div
                            key={activePhase}
                            custom={navDirection}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl rounded-[2rem] md:rounded-[3.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col h-full card-shine animate-glow group min-h-[520px]"
                        >
                            {/* Stats Header */}
                            <div className="w-full bg-zinc-50/50 dark:bg-background/40 p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col relative text-start">
                                <div className="absolute top-0 inset-inline-start-0 w-full h-1.5 bg-gradient-to-r from-gold-600 to-gold-400"></div>

                                <div className="flex items-center gap-3 mb-3">
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

                                {/* Tagline — premium strip */}
                                <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20">
                                    <Star className="w-3 h-3 text-gold-500 shrink-0" />
                                    <span className="text-[11px] md:text-xs font-black text-gold-700 dark:text-gold-400 italic leading-tight">{activeData.tagline}</span>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-2">
                                    <MetricBar label={L.strength} value={activeData.stats.strength} colorClass="bg-red-500" icon={<Dumbbell className="w-2.5 h-2.5" />} />
                                    <MetricBar label={L.hypertrophy} value={activeData.stats.hypertrophy} colorClass="bg-purple-500" icon={<BicepsFlexed className="w-2.5 h-2.5" />} />
                                    <MetricBar label={L.water} value={activeData.stats.waterRetention} colorClass="bg-blue-500" icon={<Droplet className="w-2.5 h-2.5" />} />
                                    <MetricBar label={L.fatLoss} value={activeData.stats.fatLoss} colorClass="bg-orange-500" icon={<Flame className="w-2.5 h-2.5" />} />
                                    <MetricBar label={L.mood} value={activeData.stats.mood} colorClass="bg-green-500" icon={<Brain className="w-2.5 h-2.5" />} />
                                </div>
                            </div>

                            {/* Narrative Section — full content always visible (no hidden scroll) */}
                            <div className="w-full p-6 md:p-10 space-y-5 flex-grow flex flex-col justify-start text-start" data-testid="timeline-narrative">

                                {/* Biological block */}
                                <motion.div initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="relative group/item">
                                    <div className="absolute inline-start-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent rounded-full"></div>
                                    <div className="ps-6 group-hover/item:ps-8 transition-all">
                                        <h4 className="text-xs md:text-sm font-black text-blue-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <Activity className="w-4 h-4" />
                                            {L.biologicalTitle}
                                        </h4>
                                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base font-semibold">
                                            <StyledBrandName text={renderCopy(activeData.details.biological)} />
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Feeling block */}
                                <motion.div initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative group/item">
                                    <div className="absolute inline-start-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 via-purple-400 to-transparent rounded-full"></div>
                                    <div className="ps-6 group-hover/item:ps-8 transition-all">
                                        <h4 className="text-xs md:text-sm font-black text-purple-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <Brain className="w-4 h-4" />
                                            {L.feelingTitle}
                                        </h4>
                                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base font-semibold">
                                            <StyledBrandName text={renderCopy(activeData.details.feeling)} />
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Expert action block */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-50 text-white dark:text-black p-5 md:p-7 rounded-2xl shadow-2xl relative overflow-hidden ring-2 ring-gold-500/30 group/action"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover/action:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    <h4 className="text-xs md:text-sm font-black text-gold-400 dark:text-gold-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Zap className="w-4 h-4 fill-gold-400" />
                                        {L.actionTitle}
                                    </h4>
                                    <p className="text-base md:text-lg font-black leading-tight italic text-white dark:text-black">
                                        <StyledBrandName text={renderCopy(activeData.details.action)} />
                                    </p>

                                    <div className="absolute top-3 end-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-400 text-[9px] font-black uppercase tracking-wider">
                                        <ShieldCheck className="w-2.5 h-2.5" />
                                        {isAr ? 'نصيحة الخبير' : 'Expert Tip'}
                                    </div>
                                </motion.div>

                                {/* Medical advice block */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="relative rounded-2xl border border-rose-500/25 dark:border-rose-400/25 bg-gradient-to-br from-rose-500/[0.06] to-transparent p-5 md:p-7 shadow-xl overflow-hidden group/medical"
                                >
                                    <div className="absolute top-0 inset-inline-start-0 w-full h-1 bg-gradient-to-r from-rose-600 via-rose-400 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover/medical:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    <h4 className="text-xs md:text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <HeartPulse className="w-4 h-4" />
                                        {L.medicalTitle}
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base font-semibold">
                                        <StyledBrandName text={renderCopy(activeData.details.medical)} />
                                    </p>

                                    <div className="absolute top-3 end-3 flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-wider">
                                        <ShieldCheck className="w-2.5 h-2.5" />
                                        {isAr ? 'إشراف طبي' : 'Medical Supervision'}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Footer — progress + navigation */}
                            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4 mt-auto">
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                            {L.phaseLabel} {activePhase + 1} / {totalPhases}
                                        </span>
                                        <span className="text-[10px] font-black text-gold-600 dark:text-gold-500 tabular-nums">{Math.round(phaseProgress)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 rounded-full"
                                            animate={{ width: `${phaseProgress}%` }}
                                            transition={{ type: 'spring', stiffness: 120, damping: 24 }}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.9 }}
                                        disabled={activePhase === 0}
                                        onClick={goPrev}
                                        aria-label={isAr ? 'المرحلة السابقة' : 'Previous phase'}
                                        className="p-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-20 transition-all shadow-md hover:bg-zinc-300 dark:hover:bg-zinc-700"
                                    >
                                        <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.9 }}
                                        disabled={activePhase === totalPhases - 1}
                                        onClick={goNext}
                                        aria-label={isAr ? 'المرحلة التالية' : 'Next phase'}
                                        className="p-2.5 rounded-xl bg-gold-500 text-black disabled:opacity-20 transition-all shadow-md hover:bg-gold-400"
                                    >
                                        <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default TransformationTimeline;
