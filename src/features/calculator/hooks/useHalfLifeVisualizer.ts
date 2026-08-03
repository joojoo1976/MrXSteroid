import { useState, useMemo, useEffect, useCallback } from 'react';
import { ContentStrings } from '@/shared/types/types';
import { UnitSystem } from '@/shared/lib/logic';
import { saveCalculatorResult } from '../../../shared/lib/calculator-history';

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

    const colors = ['#eab308', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];

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

        // Sub-day resolution (0.25-day = 6h steps) for accurate short-ester peak detection
        const STEP = 0.25;
        const activePhaseEnd = Math.max(...stack.map(s => (s.startWeek - 1) * 7 + s.duration * 7));
        const daysToSimulate = activePhaseEnd + 60;
        const totalSteps = Math.ceil(daysToSimulate / STEP);

        // Build float-timestep accumulator
        const dataByStep: Array<Record<string, number>> = Array.from({ length: totalSteps }, () => ({ total: 0 }));
        const compoundNames: string[] = [];
        const halfLifeSummary: SimulationResult['halfLifeSummary'] = [];

        stack.forEach((item) => {
            const compound = content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId);
            if (!compound) return;

            const key = `${item.compoundId}_${item.id}`;
            compoundNames.push(key);
            halfLifeSummary.push({
                name: isRTL && compound.nameAr ? compound.nameAr : compound.name,
                halfLifeDays: compound.halfLife,
                clearanceDays: Math.round(compound.halfLife * 5.32),
            });

            const startDay = (item.startWeek - 1) * 7;
            const totalDurationDays = item.duration * 7;
            const h = compound.halfLife;
            const k = Math.LN2 / h;

            let ka = h < 1.0 ? 12.0 : h <= 3.0 ? 3.0 : 1.0;
            if (Math.abs(ka - k) < 0.0001) ka += 0.001;
            const batemanMultiplier = ka / (ka - k);

            const intervalMap: Record<string, number> = { ed: 1, eod: 2, e3d: 3, e7d: 7 };
            const interval = intervalMap[item.frequency] || 7;
            const activeDosage = item.dosage * (compound.esterWeight || 1.0);

            const injectionDays: number[] = [];
            for (let d = startDay; d < startDay + totalDurationDays; d += interval) {
                injectionDays.push(d);
            }

            for (let si = 0; si < totalSteps; si++) {
                const t = si * STEP;
                if (t < startDay) { dataByStep[si][key] = 0; continue; }

                let serumLevel = 0;
                for (const injDay of injectionDays) {
                    if (injDay > t) break;
                    const deltaT = t - injDay;
                    // Bateman Equation: C(t) = D·(ka/(ka−ke))·(e^(−ke·Δt) − e^(−ka·Δt))
                    const level = activeDosage * batemanMultiplier *
                        (Math.exp(-k * deltaT) - Math.exp(-ka * deltaT));
                    serumLevel += Math.max(0, level);
                }
                dataByStep[si][key] = serumLevel;
                dataByStep[si]['total'] = (dataByStep[si]['total'] || 0) + serumLevel;
            }
        });

        // Downsample to daily resolution for chart rendering
        const dataByDay: ({ [key: string]: number; day: number; total: number })[] = [];
        for (let day = 0; day < daysToSimulate; day++) {
            const si = Math.min(Math.round(day / STEP), totalSteps - 1);
            const entry: { [key: string]: number; day: number; total: number } = {
                day,
                total: dataByStep[si]['total'] || 0
            };
            for (const key of compoundNames) {
                entry[key] = dataByStep[si][key] || 0;
            }
            dataByDay.push(entry);
        }

        const maxLevel = Math.max(...dataByDay.map(d => d.total), 0);
        const saturationPoint = dataByDay.findIndex(d => d.total >= maxLevel * 0.9);

        // Stability: overlapping active window only (from saturation to earliest compound's end)
        const earliestEnd = Math.min(...stack.map(s => (s.startWeek - 1) * 7 + s.duration * 7));
        const stabilityStart = Math.max(saturationPoint, 0);
        const stabilityEnd = Math.min(earliestEnd, activePhaseEnd);
        const peakWindowLevels = dataByDay.slice(stabilityStart, stabilityEnd).map(d => d.total).filter(v => v > 0);
        const mean = peakWindowLevels.length > 0 ? peakWindowLevels.reduce((a, b) => a + b, 0) / peakWindowLevels.length : 0;
        const stdDev = peakWindowLevels.length > 0 ? Math.sqrt(peakWindowLevels.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / peakWindowLevels.length) : 0;
        const stabilityScore = mean > 0 ? Math.max(0, Math.min(100, 100 - (stdDev / mean * 100))) : 0;
        const weeklyAveragePeak = Math.round(mean);

        const has19Nor = stack.some(s => ['deca', 'tren_a', 'tren_e', 'npp'].includes(s.compoundId));
        const oralCount = stack.filter(s => ['anavar', 'dbol', 'anadrol', 'win_o', 'tbol', 'sdrol'].includes(s.compoundId)).length;
        const aromatizationRisk = stack.filter(s => ['test_e', 'test_p', 'test_c', 'dbol', 'anadrol'].includes(s.compoundId)).length;
        const hasAI = stack.some(s => ['arimidex', 'proviron'].includes(s.compoundId));

        // PCT start: serum drops below 5% of peak (pharmacokinetic 95% clearance standard)
        const clearanceThreshold = Math.max(maxLevel * 0.05, 5);
        const postCycleData = dataByDay.slice(activePhaseEnd);
        const dropIndex = postCycleData.findIndex(d => d.total < clearanceThreshold);
        let pctStartDay: number;
        if (dropIndex !== -1) {
            pctStartDay = activePhaseEnd + dropIndex;
        } else {
            const longestHL = Math.max(...stack.map(s => content.halfLifeVisualizer.compounds.find(c => c.id === s.compoundId)?.halfLife || 0));
            pctStartDay = activePhaseEnd + Math.ceil(longestHL * 5.32);
        }
        const clearanceDay = pctStartDay;
        const totalActiveDays = activePhaseEnd;

        let pctIntensity = 1;
        if (oralCount > 1) pctIntensity++;
        if (has19Nor) pctIntensity++;
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

        let stabilityTips = content.halfLifeVisualizer.analysis?.stabilityExcellent ||
            (isRTL ? 'استقرار هرموني ممتاز — منحنى ثابت ومنتظم.' : 'Excellent hormonal stability — smooth, consistent serum curve.');
        if (stabilityScore < 50) {
            stabilityTips = content.halfLifeVisualizer.analysis?.stabilityFluctuation ||
                (isRTL
                    ? '⚠️ تذبذب حاد! زد تكرار الحقن (يومياً أو يوم بعد يوم) لتقليل التقلبات بشكل ملحوظ.'
                    : '⚠️ Severe fluctuations — switch to daily or EOD for a smoother pharmacokinetic curve.');
        } else if (stabilityScore < 75) {
            stabilityTips = isRTL
                ? '⚡ استقرار متوسط — يمكن تحسينه بزيادة تكرار الحقن قليلاً.'
                : '⚡ Moderate stability — slightly more frequent injections will improve the curve.';
        }

        let safetyTips = content.halfLifeVisualizer.analysis?.safetySafe ||
            (isRTL ? 'المؤشرات ضمن النطاق الآمن.' : 'Safety parameters within clinical tolerances.');
        if (has19Nor) {
            safetyTips = content.halfLifeVisualizer.analysis?.safety19nor ||
                (isRTL
                    ? '⚠️ 19-nor مكتشف (ترين/ديكا): احتفظ بكابيرجولين 0.25–0.5ملجم لمراقبة البرولاكتين.'
                    : '⚠️ 19-nor detected (Tren/Deca): Keep Cabergoline 0.25–0.5mg on hand for Prolactin control.');
        } else if (aromatizationRisk > 2 && !hasAI) {
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
        } else if (has19Nor) {
            pctTips = content.halfLifeVisualizer.analysis?.pct19nor ||
                (isRTL
                    ? '⚠️ تنبيه 19-nor: التعافي أبطأ — أطل PCT لـ 6 أسابيع بدل 4.'
                    : '⚠️ 19-nor Alert: HPTA recovery is slower — extend PCT to 6 weeks instead of 4.');
        }

        const weeklyPeakByCompound: SimulationResult['weeklyPeakByCompound'] = stack.map((item, idx) => {
            const compound = content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId);
            const key = `${item.compoundId}_${item.id}`;
            const peak = Math.max(...dataByDay.map(d => d[key] || 0), 0);
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
            chartData: dataByDay,
            compoundNames,
            maxLevel,
            stabilityScore: Math.round(stabilityScore),
            saturationDay: saturationPoint,
            clearanceDay,
            totalActiveDays,
            weeklyAveragePeak,
            risks: { has19Nor, oralCount, aromatizationRisk, hasAI },
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
    }, [stack, content, isRTL, unitSystem]);

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
