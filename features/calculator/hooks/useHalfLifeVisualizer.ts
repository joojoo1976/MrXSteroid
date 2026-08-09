'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ContentStrings } from '@/shared/types/types';
import { UnitSystem } from '@/shared/lib/logic';
import { saveCalculatorResult } from '../../../shared/lib/calculator-history';
import {
    simulateSerum,
    stabilityScore,
    assessRisks,
    clearanceDaysFromHalfLife,
    pctWaitDays,
    roundTo,
    type SerumProfile,
} from '../lib/pharmaEngine';

export interface StackItem {
    id: string;
    compoundId: string;
    dosage: number;
    frequency: string;
    duration: number;
    startWeek: number;
    colorClass: string;
    color: string;
    bgColorClass?: string;
}

export interface SimulationResult {
    chartData: {
        [key: string]: number;
        day: number;
        total: number;
    }[];
    compoundNames: string[];
    maxLevel: number;
    troughLevel: number;
    stabilityScore: number;
    saturationDay: number;
    clearanceDay: number;
    totalActiveDays: number;
    weeklyAveragePeak: number;
    risks: {
        has19Nor: boolean;
        oralCount: number;
        aromatizationRisk: number;
        hasAI: boolean;
    };
    pctStartDay: number;
    daysToSimulate: number;
    pctProtocol: {
        drug: string;
        loading: string;
        maintenance: string;
        note: string;
    }[];
    pctIntensity: number;
    aromatizationRisk: number;
    stabilityTips: string;
    safetyTips: string;
    pctTips: string;
    halfLifeSummary: { name: string; halfLifeDays: number; clearanceDays: number }[];
    peakTimelineLabel: string;
    weeklyPeakByCompound: { name: string; peak: number; color: string }[];
}

interface UseHalfLifeVisualizerOptions {
    content: ContentStrings;
    isRTL: boolean;
    unitSystem: UnitSystem;
}

export const useHalfLifeVisualizer = ({ content, isRTL, unitSystem }: UseHalfLifeVisualizerOptions) => {
    const loadSavedStack = (): StackItem[] => {
        try {
            const saved = localStorage.getItem('mrx_steroid_stack');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    };

    const [stack, setStack] = useState<StackItem[]>(loadSavedStack);
    const [compoundId, setCompoundId] = useState('test_e');
    const [dosage, setDosage] = useState(250);
    const [frequency, setFrequency] = useState('e3d');
    const [duration, setDuration] = useState(12);
    const [startWeek, setStartWeek] = useState(1);

    const colors = useMemo(() => ['#eab308', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'], []);

    useEffect(() => {
        localStorage.setItem('mrx_steroid_stack', JSON.stringify(stack));
    }, [stack]);

    const selectedCompound = useMemo(() =>
        content.halfLifeVisualizer.compounds.find(c => c.id === compoundId),
        [compoundId, content]);

    // Ester-adjusted effective dose for display
    const effectiveDose = useMemo(() => {
        if (!selectedCompound) return dosage;
        return Math.round(dosage * (selectedCompound.esterWeight || 1.0));
    }, [dosage, selectedCompound]);

    const addToStack = useCallback(() => {
        if (!selectedCompound) return;
        const newItem: StackItem = {
            id: Math.random().toString(36).substr(2, 9),
            compoundId,
            dosage,
            frequency,
            duration,
            startWeek,
            colorClass: `bg-gold-500`,
            color: colors[stack.length % colors.length],
            bgColorClass: `bg-gold-500`
        };
        setStack([...stack, newItem]);

        // Auto-save the assessed stack snapshot to the user's calculator history
        const compoundName = selectedCompound?.name || compoundId;
        saveCalculatorResult({
            tool: 'halflife',
            title: isRTL ? 'محاكي نصف العمر فارماسيم' : 'PharmaSim Half-Life Simulator',
            inputs: { compoundId, compoundName, dosage, frequency, duration, startWeek, unitSystem },
            result: { stack: [...stack, newItem].map(s => ({ compoundId: s.compoundId, dosage: s.dosage, frequency: s.frequency, duration: s.duration })) } as Record<string, unknown>,
        });
    }, [selectedCompound, compoundId, dosage, frequency, duration, startWeek, stack, colors, isRTL, unitSystem]);

    const removeFromStack = useCallback((id: string) => {
        setStack(prev => prev.filter(s => s.id !== id));
    }, []);

    const clearStack = useCallback(() => {
        setStack([]);
    }, []);

    const simulationData = useMemo<SimulationResult | null>(() => {
        if (stack.length === 0) return null;

        // ── Core pharmacokinetic simulation (pure engine) ──────────────
        const profile: SerumProfile = simulateSerum({
            stack,
            compounds: content.halfLifeVisualizer.compounds,
        });

        const {
            series: chartData,
            compoundNames,
            maxLevel,
            troughLevel,
            lastInjectionDay,
            activePhaseEndDay: activePhaseEnd,
            saturationDay: saturationPoint,
        } = profile;

        const daysToSimulate = chartData.length;
        const totalActiveDays = activePhaseEnd;

        // Longest half-life in the stack drives clearance & PCT scheduling.
        const longestHL = Math.max(...stack.map(s =>
            content.halfLifeVisualizer.compounds.find(c => c.id === s.compoundId)?.halfLife || 0,
        ));

        const halfLifeSummary: SimulationResult['halfLifeSummary'] = stack.map((item) => {
            const compound = content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId);
            return {
                name: compound ? (isRTL && compound.nameAr ? compound.nameAr : compound.name) : item.compoundId,
                halfLifeDays: roundTo(compound?.halfLife ?? 0, 1),
                clearanceDays: clearanceDaysFromHalfLife(compound?.halfLife ?? 0),
            };
        });

        // ── PCT & clearance timing (pharmacokinetically corrected) ─────
        const pctStartDay = lastInjectionDay + pctWaitDays(longestHL);
        const clearanceDay = Math.round(lastInjectionDay + clearanceDaysFromHalfLife(longestHL));

        // ── Stability over the overlap window ──────────────────────────
        const earliestEnd = Math.min(...stack.map(s => (s.startWeek - 1) * 7 + s.duration * 7));
        const stabilityStart = Math.max(saturationPoint, 0);
        // If a short compound ends before the longest ester reaches 90% Cmax the
        // overlap window is empty — fall back to the steady-state phase so the
        // stability score never collapses to 0 (and the "severe fluctuation"
        // warning doesn't fire spuriously).
        let stabilityEnd = Math.min(earliestEnd, activePhaseEnd);
        if (stabilityEnd <= stabilityStart) {
            stabilityEnd = Math.max(stabilityStart + 1, activePhaseEnd);
        }
        const peakWindowLevels = chartData
            .slice(stabilityStart, stabilityEnd)
            .map(d => d.total)
            .filter(v => v > 0);
        const mean = peakWindowLevels.length > 0
            ? peakWindowLevels.reduce((a, b) => a + b, 0) / peakWindowLevels.length
            : 0;
        const stability = stabilityScore(peakWindowLevels);
        const weeklyAveragePeak = Math.round(mean);

        // ── Risk profile ───────────────────────────────────────────────
        const risks = assessRisks(stack);
        const aromatizationRisk = risks.aromatizationRisk;

        // PCT protocol table
        let pctIntensity = 1;
        if (risks.oralCount > 1) pctIntensity++;
        if (risks.has19Nor) pctIntensity++;
        if (maxLevel > 800) pctIntensity++;
        if (stack.length > 3) pctIntensity++;
        pctIntensity = Math.min(5, pctIntensity); // clamp

        const pctProtocol: SimulationResult['pctProtocol'] = [];
        const isHeavy = pctIntensity > 3;
        pctProtocol.push({
            drug: content.halfLifeVisualizer.analysis?.pctNolvadex || 'Nolvadex',
            loading: isHeavy ? '40mg' : '20mg',
            maintenance: isHeavy ? '20mg' : '10mg',
            note: content.halfLifeVisualizer.analysis?.pctDaily || (isRTL ? 'يومياً' : 'Daily')
        });
        pctProtocol.push({
            drug: content.halfLifeVisualizer.analysis?.pctClomid || 'Clomid',
            loading: isHeavy ? '100mg' : '50mg',
            maintenance: isHeavy ? '50mg' : '25mg',
            note: content.halfLifeVisualizer.analysis?.pctDaily || (isRTL ? 'يومياً' : 'Daily')
        });
        pctProtocol.push({
            drug: content.halfLifeVisualizer.analysis?.pctHcg || 'Epifasi (hCG)',
            loading: isHeavy ? '1000 IU' : '500 IU',
            maintenance: '-',
            note: content.halfLifeVisualizer.analysis?.pctEod || (isRTL ? 'كل يومين' : 'EOD')
        });
        if (isHeavy) {
            pctProtocol.push({
                drug: 'Cabergoline',
                loading: '0.5mg',
                maintenance: '0.25mg',
                note: content.halfLifeVisualizer.analysis?.pctEod || (isRTL ? 'كل يومين' : 'EOD')
            });
        }

        // ── Localized guidance tiers ───────────────────────────────────
        let stabilityTips = content.halfLifeVisualizer.analysis?.stabilityExcellent ||
            (isRTL ? 'استقرار هرموني ممتاز — منحنى ثابت ومنتظم.' : 'Excellent hormonal stability — smooth, consistent serum curve.');
        if (stability < 50) {
            stabilityTips = content.halfLifeVisualizer.analysis?.stabilityFluctuation ||
                (isRTL
                    ? '⚠️ تذبذب حاد! زد تكرار الحقن (يومياً أو يوم بعد يوم) لتقليل التقلبات بشكل ملحوظ.'
                    : '⚠️ Severe fluctuations — switch to daily or EOD for a smoother pharmacokinetic curve.');
        } else if (stability < 75) {
            stabilityTips = isRTL
                ? '⚡ استقرار متوسط — يمكن تحسينه بزيادة تكرار الحقن قليلاً.'
                : '⚡ Moderate stability — slightly more frequent injections will improve the curve.';
        }

        let safetyTips = content.halfLifeVisualizer.analysis?.safetySafe ||
            (isRTL ? 'المؤشرات ضمن النطاق الآمن.' : 'Safety parameters within clinical tolerances.');
        if (risks.has19Nor) {
            safetyTips = content.halfLifeVisualizer.analysis?.safety19nor ||
                (isRTL
                    ? '⚠️ 19-nor مكتشف (ترين/ديكا): احتفظ بكابيرجولين 0.25–0.5ملجم لمراقبة البرولاكتين.'
                    : '⚠️ 19-nor detected (Tren/Deca): Keep Cabergoline 0.25–0.5mg on hand for Prolactin control.');
        } else if (aromatizationRisk > 2 && !risks.hasAI) {
            safetyTips = content.halfLifeVisualizer.analysis?.safetyAromatization ||
                (isRTL
                    ? '⚠️ خطر أروماتة مرتفع: استخدم مثبط أروماتاز (أريميدكس/أروماسين) للسيطرة على الاستراديول.'
                    : '⚠️ High aromatization risk: Use an Aromatase Inhibitor (Arimidex/Aromasin) to control estradiol.');
        }

        let pctTips = (content.halfLifeVisualizer.analysis?.pctStartPrefix || (isRTL ? 'ابدأ بروتوكول التعافي (PCT) بعد ' : 'Initiate PCT approximately ')) +
            Math.round(pctStartDay) +
            (content.halfLifeVisualizer.analysis?.pctStartSuffix || (isRTL ? ' يوماً من آخر جرعة عند اكتمال التخليص البيولوجي.' : ' days post-cycle when biological clearance is confirmed.'));

        if (pctIntensity > 3) {
            pctTips = content.halfLifeVisualizer.analysis?.pctHeavy ||
                (isRTL
                    ? '🚨 دورة عالية الكثافة: hCG إلزامي. راقب LH/FSH بالتحاليل بعد انتهاء PCT.'
                    : '🚨 Ultra-Heavy Cycle: hCG is mandatory. Monitor LH/FSH via blood work post-PCT.');
        } else if (risks.has19Nor) {
            pctTips = content.halfLifeVisualizer.analysis?.pct19nor ||
                (isRTL
                    ? '⚠️ تنبيه 19-nor: التعافي أبطأ — أطل PCT لـ 6 أسابيع بدل 4.'
                    : '⚠️ 19-nor Alert: HPTA recovery is slower — extend PCT to 6 weeks instead of 4.');
        }

        const weeklyPeakByCompound: SimulationResult['weeklyPeakByCompound'] = stack.map((item, idx) => {
            const compound = content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId);
            const key = `${item.compoundId}_${item.id}`;
            const peak = Math.max(...chartData.map(d => d[key] || 0), 0);
            return {
                name: (isRTL && compound?.nameAr ? compound.nameAr : compound?.name) || item.compoundId,
                peak: Math.round(peak),
                color: colors[idx % colors.length]
            };
        });

        const peakTimelineLabel = isRTL
            ? `ذروة اليوم ${Math.round(saturationPoint)} — تخليص كامل اليوم ${Math.round(clearanceDay)}`
            : `Peak Day ${Math.round(saturationPoint)} → Full Clearance Day ${Math.round(clearanceDay)}`;

        return {
            chartData,
            compoundNames,
            maxLevel,
            troughLevel,
            stabilityScore: Math.round(stability),
            saturationDay: saturationPoint,
            clearanceDay,
            totalActiveDays,
            weeklyAveragePeak,
            risks,
            pctStartDay,
            daysToSimulate,
            pctProtocol,
            pctIntensity,
            aromatizationRisk,
            stabilityTips,
            safetyTips,
            pctTips,
            halfLifeSummary,
            peakTimelineLabel,
            weeklyPeakByCompound
        };
    }, [stack, content, isRTL, colors]);

    return {
        stack,
        compoundId,
        setCompoundId,
        dosage,
        setDosage,
        frequency,
        setFrequency,
        duration,
        setDuration,
        startWeek,
        setStartWeek,
        selectedCompound,
        effectiveDose,
        addToStack,
        removeFromStack,
        clearStack,
        simulationData,
        colors
    };
};
