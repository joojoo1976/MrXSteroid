import { useState, useMemo, useEffect, useCallback } from 'react';
import { ContentStrings } from '../../../types';

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
    chartData: any[];
    compoundNames: string[];
    maxLevel: number;
    stabilityScore: number;
    saturationDay: number;
    risks: {
        has19Nor: boolean;
        oralCount: number;
        aromatizationRisk: number;
        hasAI: boolean;
    };
    pctStartDay: number;
    daysToSimulate: number;
    pctProtocol: any[];
    pctIntensity: number;
    aromatizationRisk: number;
    stabilityTips: string;
    safetyTips: string;
    pctTips: string;
}

interface UseHalfLifeVisualizerOptions {
    content: ContentStrings;
    isRTL: boolean;
}

export const useHalfLifeVisualizer = ({ content, isRTL }: UseHalfLifeVisualizerOptions) => {
    const loadSavedStack = () => {
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
    }, [selectedCompound, compoundId, dosage, frequency, duration, startWeek, stack, colors]);

    const removeFromStack = useCallback((id: string) => {
        setStack(prev => prev.filter(s => s.id !== id));
    }, []);

    const simulationData = useMemo<SimulationResult | null>(() => {
        if (stack.length === 0) return null;

        const daysToSimulate = (Math.max(...stack.map(s => (s.startWeek - 1) * 7 + s.duration * 7))) + 50;
        const dataByDay: (Record<string, number> & { day: number, total: number })[] = Array.from({ length: daysToSimulate }, (_, i) => ({ day: i, total: 0 }));
        const compoundNames: string[] = [];

        stack.forEach((item) => {
            const compound = content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId);
            if (!compound) return;

            const key = `${item.compoundId}_${item.id}`;
            compoundNames.push(key);

            const startDay = (item.startWeek - 1) * 7;
            const totalDurationDays = item.duration * 7;
            const h = compound.halfLife;
            const k = Math.LN2 / h;

            for (let t = 0; t < daysToSimulate; t++) {
                let serumLevel = 0;
                let injectionCount = 0;
                if (item.frequency === 'ed') injectionCount = Math.floor((t - startDay));
                else if (item.frequency === 'eod') injectionCount = Math.floor((t - startDay) / 2);
                else if (item.frequency === 'e3d') injectionCount = Math.floor((t - startDay) / 3);
                else if (item.frequency === 'e7d') injectionCount = Math.floor((t - startDay) / 7);

                for (let i = 0; i <= injectionCount; i++) {
                    const injectionDay = startDay + (
                        item.frequency === 'ed' ? i :
                            item.frequency === 'eod' ? i * 2 :
                                item.frequency === 'e3d' ? i * 3 : i * 7
                    );

                    if (injectionDay < startDay + totalDurationDays && injectionDay >= startDay && t >= injectionDay) {
                        const activeDosage = item.dosage * (compound.esterWeight || 1.0);
                        serumLevel += activeDosage * Math.exp(-k * (t - injectionDay));
                    }
                }
                dataByDay[t][key] = serumLevel;
                dataByDay[t].total += serumLevel;
            }
        });

        const maxLevel = Math.max(...dataByDay.map(d => d.total));
        const saturationPoint = dataByDay.findIndex(d => d.total >= maxLevel * 0.9);

        const activePhaseEnd = Math.max(...stack.map(s => (s.startWeek - 1) * 7 + s.duration * 7));
        const peakWeekLevels = dataByDay.slice(saturationPoint, activePhaseEnd).map(d => d.total);
        const mean = peakWeekLevels.length > 0 ? peakWeekLevels.reduce((a, b) => a + b, 0) / peakWeekLevels.length : 0;
        const stdDev = peakWeekLevels.length > 0 ? Math.sqrt(peakWeekLevels.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / peakWeekLevels.length) : 0;
        const stabilityScore = mean > 0 ? Math.max(0, Math.min(100, 100 - (stdDev / mean * 100))) : 0;

        const has19Nor = stack.some(s => s.compoundId === 'deca' || s.compoundId === 'tren_a' || s.compoundId === 'tren_e' || s.compoundId === 'npp');
        const oralCount = stack.filter(s => s.compoundId === 'anavar' || s.compoundId === 'dbol' || s.compoundId === 'anadrol' || s.compoundId === 'win_o' || s.compoundId === 'tbol' || s.compoundId === 'sdrol').length;
        const aromatizationRisk = stack.filter(s => s.compoundId === 'test_e' || s.compoundId === 'test_p' || s.compoundId === 'test_c' || s.compoundId === 'dbol' || s.compoundId === 'anadrol').length;
        const hasAI = stack.some(s => s.compoundId === 'arimidex' || s.compoundId === 'proviron');

        let pctStartDay = activePhaseEnd;
        const lastDoseDay = activePhaseEnd;
        const postCycleData = dataByDay.slice(lastDoseDay);
        const dropBelowThreshold = postCycleData.findIndex(d => d.total < 50);
        if (dropBelowThreshold !== -1) {
            pctStartDay = lastDoseDay + dropBelowThreshold;
        } else {
            const longestHL = Math.max(...stack.map(s => content.halfLifeVisualizer.compounds.find(c => c.id === s.compoundId)?.halfLife || 0));
            pctStartDay = lastDoseDay + (longestHL * 5);
        }

        let pctIntensity = 1;
        if (oralCount > 1) pctIntensity++;
        if (has19Nor) pctIntensity++;
        if (maxLevel > 800) pctIntensity++;
        if (stack.length > 3) pctIntensity++;

        const pctProtocol = [];
        if (stack.length > 0) {
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
        }

        let stabilityTips = content.halfLifeVisualizer.analysis?.stabilityExcellent || (isRTL ? 'استقرار هرموني ممتاز.' : 'Excellent hormonal stability.');
        if (stabilityScore < 70) {
            stabilityTips = content.halfLifeVisualizer.analysis?.stabilityFluctuation || (isRTL
                ? '⚠️ التذبذب عالٍ! يفضل زيادة تكرار الحقن (مثلاً من مرتين أسبوعياً إلى يوم وراء يوم) لتقليل التقلبات.'
                : '⚠️ High fluctuation! Increase injection frequency (e.g., from twice weekly to EOD) to minimize spikes.');
        }

        let safetyTips = content.halfLifeVisualizer.analysis?.safetySafe || (isRTL ? 'المؤشرات ضمن النطاق الآمن.' : 'Safety indicators within range.');
        if (has19Nor) {
            safetyTips = content.halfLifeVisualizer.analysis?.safety19nor || (isRTL
                ? '⚠️ دمج 19-nor (ترين/ديكا): استخدم كابيرجولين 0.25-0.5 ملجم عند الحاجة لمراقبة البرولاكتين.'
                : '⚠️ 19-nor detected (Tren/Deca): Use Cabergoline 0.25-0.5mg as needed to monitor Prolactin.');
        } else if (aromatizationRisk > 2 && !hasAI) {
            safetyTips = content.halfLifeVisualizer.analysis?.safetyAromatization || (isRTL
                ? '⚠️ خطر أروماتة عالٍ: تأكد من استخدام أريميدكس أو أروماسين للسيطرة على الاستروجين.'
                : '⚠️ High aromatization risk: Use Arimidex or Aromasin to control Estrogen.');
        }

        let pctTips = (content.halfLifeVisualizer.analysis?.pctStartPrefix || (isRTL ? 'تحتاج لبدء التنظيف بعد ' : 'Start PCT after ')) +
            Math.round(pctStartDay) +
            (content.halfLifeVisualizer.analysis?.pctStartSuffix || (isRTL ? ' يوماً لضمان خروج جميع المواد من جسمك.' : ' days to ensure all compounds have cleared.'));

        if (pctIntensity > 3) {
            pctTips = content.halfLifeVisualizer.analysis?.pctHeavy || (isRTL
                ? '🚨 كورس ثقيل جداً: لا غنى عن الـ hCG ومتابعة دقيقة لهرمونات LH/FSH بعد انتهاء التنظيف.'
                : '🚨 Ultra Heavy Cycle: hCG is mandatory. Monitor LH/FSH levels closely after finishing PCT.');
        } else if (has19Nor) {
            pctTips = content.halfLifeVisualizer.analysis?.pct19nor || (isRTL
                ? '⚠️ تنبيه 19-nor: الاستشفاء قد يكون أبطأ. ننصح بإطالة فترة التنظيف لـ 6 أسابيع بدل 4.'
                : '⚠️ 19-nor Alert: Recovery might be slower. Consider extending PCT to 6 weeks instead of 4.');
        }

        return {
            chartData: dataByDay,
            compoundNames,
            maxLevel,
            stabilityScore: Math.round(stabilityScore),
            saturationDay: saturationPoint,
            risks: { has19Nor, oralCount, aromatizationRisk, hasAI },
            pctStartDay,
            daysToSimulate,
            pctProtocol,
            pctIntensity,
            aromatizationRisk,
            stabilityTips,
            safetyTips,
            pctTips
        };
    }, [stack, content, isRTL]);

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
        addToStack,
        removeFromStack,
        simulationData,
        colors
    };
};
