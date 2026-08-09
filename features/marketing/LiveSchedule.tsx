'use client';

import React from 'react';
import { motion } from 'framer-motion';
import EliteTable, { EliteTableColumn } from '../../shared/ui/EliteTable';
import { Activity, Zap, Lock, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { ContentStrings } from '@/shared/types/types';
import { usePreferences } from '../../context/PreferencesContext';
import RevealOnScroll from '../../shared/ui/RevealOnScroll';

interface LiveScheduleProps {
    content: ContentStrings;
}

const intensityConfig: Record<string, { label: string; labelAr: string; color: string; bg: string; width: string; bars: number }> = {
    HIGH:    { label: 'HIGH',    labelAr: 'مرتفع',  color: 'text-gold-500',   bg: 'bg-gold-500',   width: 'w-2/3', bars: 2 },
    EXTREME: { label: 'EXTREME', labelAr: 'قصوى',   color: 'text-orange-500', bg: 'bg-orange-500', width: 'w-5/6', bars: 3 },
    MAX:     { label: 'MAX',     labelAr: 'أقصى',   color: 'text-red-500',    bg: 'bg-red-500',    width: 'w-full', bars: 4 },
    MEDIUM:  { label: 'MEDIUM',  labelAr: 'متوسط',  color: 'text-blue-500',   bg: 'bg-blue-500',   width: 'w-1/2', bars: 1 },
    LOW:     { label: 'LOW',     labelAr: 'خفيف',   color: 'text-emerald-500',bg: 'bg-emerald-500',width: 'w-1/3', bars: 1 },
};

const IntensityMeter: React.FC<{ level: string; isRTL: boolean }> = ({ level, isRTL }) => {
    const cfg = intensityConfig[level] || intensityConfig['HIGH'];
    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className={`h-3 w-1.5 rounded-full transition-all ${i <= cfg.bars ? cfg.bg : 'bg-zinc-700'}`}
                    />
                ))}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
                {isRTL ? cfg.labelAr : cfg.label}
            </span>
        </div>
    );
};

const LiveSchedule: React.FC<LiveScheduleProps> = ({ content }) => {
    const { isRTL } = usePreferences();
    const scheduleData = content.scheduleData || [];
    const headers = content.scheduleHeaders;

    const phaseInfoAr = [
        { icon: <TrendingUp className="w-5 h-5" />, color: 'text-gold-500 bg-gold-500/10 border-gold-500/20', tip: 'مرحلة البداء — جسمك يبدأ في امتصاص الهرمون وبناء قاعدة النيتروجين. القوة تبدأ في الارتفاع تدريجياً.' },
        { icon: <Zap className="w-5 h-5" />, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', tip: 'مرحلة القمة — أعلى نقطة في الأداء. كثافة تدريب قصوى. الجسم يبلغ ذروته في بناء العضلة وحرق الدهن.' },
        { icon: <Lock className="w-5 h-5" />, color: 'text-red-500 bg-red-500/10 border-red-500/20', tip: '🔒 محتوى مقفل — متاح فقط بعد شراء الكتاب.' },
    ];
    const phaseInfoEn = [
        { icon: <TrendingUp className="w-5 h-5" />, color: 'text-gold-500 bg-gold-500/10 border-gold-500/20', tip: 'Kickstart Phase — Hormone absorption begins. Nitrogen retention builds. Strength starts climbing gradually.' },
        { icon: <Zap className="w-5 h-5" />, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', tip: 'Peak Phase — Maximum performance window. Extreme training intensity. Body reaches peak anabolic state.' },
        { icon: <Lock className="w-5 h-5" />, color: 'text-red-500 bg-red-500/10 border-red-500/20', tip: '🔒 Locked content — Available only after purchasing the book.' },
    ];
    const phaseInfo = isRTL ? phaseInfoAr : phaseInfoEn;

    const columns: EliteTableColumn<typeof scheduleData[0]>[] = [
        {
            header: headers?.phase || 'PHASE',
            accessor: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800/80 flex items-center justify-center text-gold-500 font-black border border-zinc-700 shadow-md text-sm">
                        {item.id}
                    </div>
                    <div>
                        <span className="font-black text-white text-sm">{item.phase}</span>
                    </div>
                </div>
            ),
            className: 'w-1/4'
        },
        {
            header: headers?.focus || 'FOCUS',
            accessor: (item) => (
                <span className="font-bold text-zinc-200 flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    {item.focus}
                </span>
            ),
            className: 'w-1/4'
        },
        {
            header: headers?.protocol || 'PROTOCOL',
            accessor: (item) => (
                <div className="flex items-center gap-2">
                    {item.status === 'LOCKED'
                        ? <span className="text-zinc-600 font-mono text-sm flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> ████████</span>
                        : <span className="font-mono text-sm text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">{item.protocol}</span>
                    }
                </div>
            ),
            className: 'w-1/4'
        },
        {
            header: isRTL ? 'الشدة' : 'INTENSITY',
            accessor: (item) => (
                <IntensityMeter level={item.intensity || 'HIGH'} isRTL={isRTL} />
            ),
            className: 'w-1/6 hidden md:table-cell'
        },
        {
            header: headers?.status || 'STATUS',
            accessor: (item) => (
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider border flex items-center gap-1.5 w-fit ${
                    item.status === 'ACTIVE'   ? 'bg-green-500/10 text-green-400 border-green-500/20 animate-pulse' :
                    item.status === 'PENDING'  ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' :
                    'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}>
                    {item.status === 'ACTIVE'  && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                    {item.status === 'PENDING' && <Clock className="w-3 h-3" />}
                    {item.status === 'LOCKED'  && <Lock className="w-3 h-3" />}
                    {item.status}
                </span>
            ),
            className: 'w-1/6'
        }
    ];

    return (
        <section className="py-24 md:py-32 bg-background relative overflow-hidden">
            {/* Background FX */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black,transparent)] pointer-events-none opacity-30" />
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-0 start-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
            <div className="absolute bottom-0 start-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/10 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">

                {/* ── Section Header ── */}
                <RevealOnScroll>
                    <div className="text-center mb-14 md:mb-20">
                        {/* Live badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black uppercase tracking-widest mb-6"
                        >
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            {isRTL ? 'بيانات حية' : 'Live Data'}
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight"
                        >
                            {isRTL
                                ? <>جداول <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">النخبة</span></>
                                : <>ELITE <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">SCHEDULES</span></>
                            }
                        </motion.h2>

                        <div className="w-20 h-1 bg-gradient-to-r from-gold-500 to-gold-400 mx-auto rounded-full mb-6" />

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-zinc-400 max-w-2xl mx-auto text-base md:text-xl font-semibold leading-relaxed"
                        >
                            {content.eliteSchedulesSubtitle || (isRTL
                                ? 'احصل على بروتوكولات عالمية المستوى مصممة للأبطال. هذه الجداول تمثل خلاصة ما يعمل فعلاً على أعلى مستوى في العالم.'
                                : 'Access world-class protocols designed for champions. These tables represent the distillation of what actually works at the highest level.'
                            )}
                        </motion.p>
                    </div>
                </RevealOnScroll>

                {/* ── Phase Preview Cards ── */}
                <RevealOnScroll delay={150}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
                        {scheduleData.map((item, idx) => {
                            const info = phaseInfo[idx] || phaseInfo[0];
                            return (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className={`rounded-2xl p-5 border ${info.color} backdrop-blur-sm relative overflow-hidden group transition-all duration-300`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2 rounded-xl ${info.color}`}>
                                            {info.icon}
                                        </div>
                                        <IntensityMeter level={item.intensity || 'HIGH'} isRTL={isRTL} />
                                    </div>
                                    <div className="font-black text-white text-sm mb-1">{item.phase}</div>
                                    <div className="text-zinc-400 text-xs font-bold mb-3">{item.focus}</div>
                                    <p className="text-zinc-500 text-[11px] leading-relaxed">{info.tip}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </RevealOnScroll>

                {/* ── Main Table ── */}
                <RevealOnScroll delay={250}>
                    <div className="max-w-5xl mx-auto">
                        <EliteTable
                            data={scheduleData}
                            columns={columns}
                            title={content.scheduleTableTitle}
                            description={content.scheduleTableDescription}
                            content={content}
                        />

                        {/* Disclaimer */}
                        <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 max-w-2xl mx-auto">
                            <AlertTriangle className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                            <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                                {isRTL
                                    ? 'المرحلة الثالثة مقفلة وتُكشف بعد الشراء. الجداول للأغراض التعليمية فقط — استشر طبيبًا قبل البدء بأي بروتوكول.'
                                    : 'Phase 3 is locked and revealed after purchase. Schedules are for educational purposes only — consult a physician before starting any protocol.'
                                }
                            </p>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-8 py-3 rounded-full border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-all text-sm font-black uppercase tracking-widest group"
                            >
                                <Zap className={`w-4 h-4 group-hover:text-gold-400 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                                {content.viewFullDatabase || (isRTL ? 'عرض قاعدة البيانات الكاملة' : 'View Full Database')}
                            </motion.button>
                        </div>
                    </div>
                </RevealOnScroll>

            </div>
        </section>
    );
};

export default LiveSchedule;
