'use client';

/**
 * components/tools/pct-timing.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #004 — Layer 5: Dynamic PCT Timing & Compound Washout Engine v2.0
 *  (Tailwind + Recharts + AR/EN RTL + Multi-Compound Stack + Bio-Modifiers).
 * ═══════════════════════════════════════════════════════════════════════════
 * Features:
 *   - Multi-compound stack management with ester bottleneck detection
 *   - Bio-modifiers: Body Fat % (lipophilicity extension), Organ Health, Cycle History
 *   - Interactive Clearance Curve with Red, Yellow, Green HPTA zones
 *   - PCT Launch Card with exact countdown date, confidence score
 *   - Phase-by-phase actionable roadmap (Washout -> Kickstart -> Bloodwork)
 *   - Tool #3 Accumulator and Tool #5 Protocol Generator interlinking
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ReferenceLine,
    Area,
    ComposedChart,
} from 'recharts';
import {
    calculateDynamicPctWashout,
    calculatePctTiming,
    CYCLE_HISTORY_OPTIONS,
    DEFAULT_CLEARANCE_THRESHOLD_PCT,
    ESTER_CATALOG,
    ORGAN_HEALTH_OPTIONS,
    PCT_PROTOCOLS,
    type CycleHistoryExperience,
    type DynamicWashoutInput,
    type EsterPresetKey,
    type OrganHealthStatus,
    type PctProtocol,
    type StackCompoundItem,
} from '@/lib/tools/engines/pct-timing';
import { buildPctTimingOutput } from '@/lib/tools/adapters/pct-timing';
import {
    AUTO_DRAFT_DEBOUNCE_MS,
    clearDraft,
    commitDashboardSnapshot,
    loadDraft,
    saveDraft,
    shouldAutoDraft,
} from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { tryParsePctTimingInput } from '@/lib/tools/schemas/pct-timing';

const TOOL_SLUG = 'pct-timing';

/** nmol/L per ng/dL conversion (Testosterone). */
const NMOL_PER_NGDL = 0.0347;
const BASELINE_NGDL = 600;
const BASELINE_NMOL = BASELINE_NGDL * NMOL_PER_NGDL;

/** Measurement conversion constants */
const KG_TO_LBS = 2.20462;
const kgToLbs = (kg: number): number => Math.round(kg * KG_TO_LBS);
const lbsToKg = (lbs: number): number => Math.round((lbs / KG_TO_LBS) * 10) / 10;

const formatDateLocalized = (iso: string, locale: 'ar' | 'en'): string => {
    try {
        const date = new Date(iso + 'T00:00:00Z');
        return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
        }).format(date);
    } catch {
        return iso;
    }
};

interface PctTimingDraftInputs {
    compoundHalfLifeDays: number;
    weeksOnCycle: number;
    clearanceThresholdPct: number;
    pctProtocol: PctProtocol;
    stack?: StackCompoundItem[];
    bodyFatPct?: number;
    organHealth?: OrganHealthStatus;
    cycleHistory?: CycleHistoryExperience;
    bodyWeightKg?: number;
    lastInjectionDateIso?: string;
}

const PCT_OPTIONS: Array<{ value: PctProtocol; ar: string; en: string }> = [
    { value: 'none', ar: 'بدون PCT (تعافٍ طبيعي فقط)', en: 'No PCT (Natural Recovery Only)' },
    { value: 'standard', ar: 'بروتوكول قياسي (SERM - نولفادكس/كلوميد)', en: 'Standard SERM PCT (Nolva/Clomid)' },
    { value: 'aggressive_mrx', ar: 'منهجية Mr. X-Steroid المتقدمة (بروتوكول مكثف + hCG)', en: 'Mr. X-Steroid Advanced PCT (SERMs + hCG)' },
];

const ORGAN_HEALTH_LABELS: Record<OrganHealthStatus, { ar: string; en: string; note: string }> = {
    optimal: { ar: 'كفاءة عالية (+15% تصريف)', en: 'Optimal (+15% clearance)', note: 'كبد وكلى مثاليان' },
    normal: { ar: 'طبيعي (متوسط القياسات)', en: 'Normal (Standard baseline)', note: 'وظائف حيوية عادية' },
    compromised: { ar: 'مجهد (-15% تصريف أبطأ)', en: 'Compromised (-15% slower)', note: 'إنزيمات مرتفعة أو تاريخ إجهاد' },
};

const CYCLE_HISTORY_LABELS: Record<CycleHistoryExperience, { ar: string; en: string; threshold: number }> = {
    first_cycle: { ar: 'أول دورة (محور شديد الاستجابة)', en: 'First Cycle (Highly Sensitive HPTA)', threshold: 150 },
    intermediate: { ar: 'متوسط (2-4 دورات سابقة)', en: 'Intermediate (2-4 Prior Cycles)', threshold: 150 },
    veteran_long_term: { ar: 'مخضرم / استخدام طويل (>12 شهر)', en: 'Veteran / Long-term (>12 months)', threshold: 100 },
};

export default function PctTimingToolComponent() {
    const tool = requireTool(TOOL_SLUG);
    const neighbors = getToolNeighbors(TOOL_SLUG);

    const [locale, setLocale] = useState<'ar' | 'en'>('ar');
    const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

    // Cycle & Stack State
    const [weeksOnCycle, setWeeksOnCycle] = useState<number>(12);
    const [lastInjectionDate, setLastInjectionDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [pctProtocol, setPctProtocol] = useState<PctProtocol>('standard');

    const [stack, setStack] = useState<StackCompoundItem[]>([
        {
            id: 'cmp_1',
            presetKey: 'test_enanthate',
            halfLifeDays: 4.5,
            doseMgPerWeek: 500,
            isLipophilic: true,
        },
    ]);

    // Bio-Modifiers State
    const [bodyFatPct, setBodyFatPct] = useState<number>(14);
    const [bodyWeightKg, setBodyWeightKg] = useState<number>(85);
    const [organHealth, setOrganHealth] = useState<OrganHealthStatus>('normal');
    const [cycleHistory, setCycleHistory] = useState<CycleHistoryExperience>('intermediate');

    // UI View State
    const [activeTab, setActiveTab] = useState<'daily_curve' | 'weekly_rebound'>('daily_curve');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const isRtl = locale === 'ar';

    // Measurement system toggle with localStorage persistence
    const handleToggleUnitSystem = useCallback((system: 'metric' | 'imperial') => {
        setUnitSystem(system);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('measurementSystem', system);
            } catch {
                // Ignore localStorage errors in private browsing/sandboxes
            }
        }
    }, []);

    // Draft & Settings restore on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedSystem = localStorage.getItem('measurementSystem');
                if (savedSystem === 'metric' || savedSystem === 'imperial') {
                    setUnitSystem(savedSystem);
                }
            } catch {
                // Ignore localStorage errors
            }
        }

        const draft = loadDraft<PctTimingDraftInputs>(TOOL_SLUG);
        if (!draft) return;
        const i = draft.inputs;
        if (typeof i.weeksOnCycle === 'number') setWeeksOnCycle(i.weeksOnCycle);
        if (i.pctProtocol && ['none', 'standard', 'aggressive_mrx'].includes(i.pctProtocol)) {
            setPctProtocol(i.pctProtocol);
        }
        if (typeof i.bodyFatPct === 'number') setBodyFatPct(i.bodyFatPct);
        if (typeof i.bodyWeightKg === 'number') setBodyWeightKg(i.bodyWeightKg);
        if (i.organHealth && ['optimal', 'normal', 'compromised'].includes(i.organHealth)) {
            setOrganHealth(i.organHealth);
        }
        if (i.cycleHistory && ['first_cycle', 'intermediate', 'veteran_long_term'].includes(i.cycleHistory)) {
            setCycleHistory(i.cycleHistory);
        }
        if (i.lastInjectionDateIso) setLastInjectionDate(i.lastInjectionDateIso);
        if (Array.isArray(i.stack) && i.stack.length > 0) setStack(i.stack);

        setSaveStatus(locale === 'ar' ? 'تم استعادة مسودتك المحفوظة محلياً' : 'Local draft restored');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Compound stack management
    const handleAddCompound = () => {
        const newId = `cmp_${Date.now()}`;
        setStack((prev) => [
            ...prev,
            {
                id: newId,
                presetKey: 'nandrolone_decanoate',
                halfLifeDays: 15.0,
                doseMgPerWeek: 300,
                isLipophilic: true,
            },
        ]);
    };

    const handleRemoveCompound = (id: string) => {
        if (stack.length <= 1) return;
        setStack((prev) => prev.filter((c) => c.id !== id));
    };

    const handleUpdateCompound = (id: string, updates: Partial<StackCompoundItem>) => {
        setStack((prev) =>
            prev.map((c) => {
                if (c.id !== id) return c;
                const next = { ...c, ...updates };
                if (updates.presetKey && updates.presetKey !== 'custom') {
                    const preset = ESTER_CATALOG[updates.presetKey as EsterPresetKey];
                    if (preset) {
                        next.halfLifeDays = preset.halfLifeDays;
                        next.isLipophilic = preset.isLipophilic;
                        if (!updates.doseMgPerWeek) next.doseMgPerWeek = preset.defaultDoseMg;
                    }
                }
                return next;
            }),
        );
    };

    // Calculate dynamic washout
    const dynamicInput: DynamicWashoutInput = useMemo(
        () => ({
            stack,
            weeksOnCycle,
            lastInjectionDateIso: lastInjectionDate,
            bioModifiers: {
                bodyFatPct,
                bodyWeightKg,
                organHealth,
                cycleHistory,
            },
            pctProtocol,
        }),
        [stack, weeksOnCycle, lastInjectionDate, bodyFatPct, bodyWeightKg, organHealth, cycleHistory, pctProtocol],
    );

    const result = useMemo(() => calculateDynamicPctWashout(dynamicInput), [dynamicInput]);

    // Chart Data Preparation
    const dailyChartData = useMemo(() => {
        return result.dailyWashout.slice(0, 42).map((p) => ({
            day: `D+${p.day}`,
            dayNum: p.day,
            date: p.dateIso,
            serumPct: p.totalSerumLoadPct,
            serumNgDl: p.estimatedSerumNgDl,
            threshold: result.hptaThresholdNgDl,
            zone: p.zone,
        }));
    }, [result.dailyWashout, result.hptaThresholdNgDl]);

    const weeklyChartData = useMemo(() => {
        return result.timeline.map((p) => ({
            week: `W${p.weekNumber}`,
            weekNum: p.weekNumber,
            serum: p.serumConcentrationPct,
            endoTesto: p.endogenousTestosteronePct,
            phase: p.phase,
        }));
    }, [result.timeline]);

    // Auto-drafting
    const lastSavedAtRef = useRef<number>(Date.now());
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!shouldAutoDraft(lastSavedAtRef.current, Date.now())) return;
            const saved = saveDraft<PctTimingDraftInputs>(
                TOOL_SLUG,
                {
                    compoundHalfLifeDays: result.effectiveHalfLifeDays,
                    weeksOnCycle,
                    clearanceThresholdPct: DEFAULT_CLEARANCE_THRESHOLD_PCT,
                    pctProtocol,
                    stack,
                    bodyFatPct,
                    bodyWeightKg,
                    organHealth,
                    cycleHistory,
                    lastInjectionDateIso: lastInjectionDate,
                },
                { locale, unitSystem, savedAt: new Date().toISOString() },
            );
            lastSavedAtRef.current = Date.now();
            setSaveStatus(
                saved
                    ? isRtl
                        ? 'تم حفظ المسودة التفاعلية محلياً تلقائياً'
                        : 'Draft auto-saved locally'
                    : isRtl
                      ? 'تعذّر حفظ المسودة'
                      : 'Draft save unavailable',
            );
        }, AUTO_DRAFT_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [result.effectiveHalfLifeDays, weeksOnCycle, pctProtocol, stack, bodyFatPct, bodyWeightKg, organHealth, cycleHistory, lastInjectionDate, locale, unitSystem, isRtl]);

    // Dashboard commit
    const handleSaveToDashboard = useCallback(async () => {
        const parsed = tryParsePctTimingInput({
            compoundHalfLifeDays: result.effectiveHalfLifeDays,
            weeksOnCycle,
            clearanceThresholdPct: DEFAULT_CLEARANCE_THRESHOLD_PCT,
            pctProtocol,
            stack,
            bioModifiers: { bodyFatPct, bodyWeightKg, organHealth, cycleHistory },
            lastInjectionDateIso: lastInjectionDate,
        });

        if (!parsed.ok) {
            setValidationError(parsed.error.issues[0]?.message ?? (isRtl ? 'بيانات غير صالحة' : 'Invalid inputs'));
            return;
        }
        setValidationError(null);
        setIsSaving(true);
        try {
            const nowIso = new Date().toISOString();
            const output = buildPctTimingOutput(parsed.data, {
                locale,
                unitSystem,
                snapshotType: 'dashboard_projection',
                calculatedAt: nowIso,
                recordedAt: nowIso,
            });

            const { supabase } = await import('@/shared/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                setSaveStatus(isRtl ? 'سجّل الدخول أولاً لحفظ الخطة في ملفك الشخصي.' : 'Sign in first to save snapshot.');
                return;
            }

            const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data, {
                accessToken: session.access_token,
            });

            if (submitted.ok && projection.ok) {
                clearDraft(TOOL_SLUG);
                setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة بنجاح!' : 'Saved to Bio-Dashboard!');
            } else {
                const reason = projection.error ?? submitted.error ?? 'unknown error';
                setSaveStatus(isRtl ? `تعذّر الحفظ: ${reason}` : `Save failed: ${reason}`);
            }
        } catch {
            setSaveStatus(isRtl ? 'حدث خطأ أثناء الحفظ.' : 'Error saving record.');
        } finally {
            setIsSaving(false);
        }
    }, [result.effectiveHalfLifeDays, weeksOnCycle, pctProtocol, stack, bodyFatPct, bodyWeightKg, organHealth, cycleHistory, lastInjectionDate, locale, unitSystem, isRtl]);

    const formatTesto = (pct: number) =>
        unitSystem === 'metric'
            ? `${Math.round((pct / 100) * BASELINE_NGDL)} ng/dL`
            : `${((pct / 100) * BASELINE_NMOL).toFixed(1)} nmol/L`;

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl ${isRtl ? 'font-cairo' : ''}`}
        >
            {/* Header & Meta Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-5 mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-lime-500/20 text-lime-400 border border-lime-500/30 rounded-full">
                            Dynamic PK/PD Engine v2.0 · Tool #004
                        </span>
                        {result.hasConflictingEsters && (
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full animate-pulse">
                                {isRtl ? '⚠️ تداخل إسترات متضاربة' : '⚠️ Ester Conflict Detected'}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white mt-2">
                        {isRtl ? 'المحرك الديناميكي لتوقيت وتلاشي المركبات (Dynamic PCT)' : 'Dynamic PCT Timing & Compound Washout Engine'}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
                        {isRtl
                            ? 'نمذجة صيدلانية متقدمة (Multi-Exponential Decay) لحساب منحنى التلاشي الفعلي وتحديد النافذة الدقيقة لبدء العلاج بدون هدم عضلي أو إهدار محفزات.'
                            : 'Pharmacokinetic simulation calculating exact serum decay curves and pinpointing the HPTA recovery window to prevent early suppression or catabolic lag.'}
                    </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                        className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition"
                    >
                        {isRtl ? 'English' : 'العربية'}
                    </button>
                    <div className="measurement-toggle flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
                        <label className="text-[10px] text-slate-400 font-bold px-2 hidden sm:inline">
                            {isRtl ? 'نظام القياس:' : 'Measurement System:'}
                        </label>
                        <button
                            id="metric-btn"
                            type="button"
                            onClick={() => handleToggleUnitSystem('metric')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                                unitSystem === 'metric'
                                    ? 'active bg-lime-500 text-slate-950 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {isRtl ? 'متري (كغ/سم)' : 'Metric (mg/kg/cm)'}
                        </button>
                        <button
                            id="imperial-btn"
                            type="button"
                            onClick={() => handleToggleUnitSystem('imperial')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                                unitSystem === 'imperial'
                                    ? 'active bg-lime-500 text-slate-950 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {isRtl ? 'إمبراطوري (رطل/إنش)' : 'Imperial (mg/lb/in)'}
                        </button>
                    </div>
                </div>
            </div>

            {/* PCT Launch Card (Hero Highlight) */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl -z-10" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {isRtl ? 'العد التنازلي لإطلاق PCT' : 'Countdown to PCT Start'}
                        </span>
                        <div className="text-3xl font-black text-lime-400 mt-1 font-mono">
                            {result.daysUntilPctLaunch} {isRtl ? 'يوم' : 'Days'}
                        </div>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                            {result.washoutWeeks} {isRtl ? 'أسابيع تطهير مطلوبة' : 'Washout weeks needed'}
                        </span>
                    </div>

                    <div className="border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {isRtl ? 'التاريخ الفعلي الموصى به للبدء' : 'Optimal Launch Date'}
                        </span>
                        <div className="text-lg font-extrabold text-white mt-1">
                            {formatDateLocalized(result.pctLaunchDateIso, locale)}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block">
                            {result.pctLaunchDateIso}
                        </span>
                        <span className="text-xs text-amber-400/90 mt-0.5 block">
                            {isRtl ? 'الأسبوع' : 'Week'} {result.pctStartWeek} {isRtl ? 'من بدء الخطة' : 'post-cycle'}
                        </span>
                    </div>

                    <div className="border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {isRtl ? 'المركب المحدد للجدول (الأبطأ)' : 'Bottleneck Compound'}
                        </span>
                        <div className="text-base font-black text-amber-300 mt-1 truncate" title={result.limitingCompoundName}>
                            {result.limitingCompoundName}
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                            t½: {result.limitingHalfLifeDays}d → {result.effectiveHalfLifeDays}d ({isRtl ? 'معدل بالدهون' : 'adjusted'})
                        </span>
                        <span className="text-[11px] text-lime-400/90 mt-0.5 block font-medium">
                            {isRtl
                                ? `محسوب لوزن ${unitSystem === 'metric' ? `${bodyWeightKg} كغ` : `${kgToLbs(bodyWeightKg)} رطل`}`
                                : `Adjusted for ${unitSystem === 'metric' ? `${bodyWeightKg}kg` : `${kgToLbs(bodyWeightKg)}lbs`} body weight`}
                        </span>
                    </div>

                    <div className="flex flex-col justify-center items-start md:items-end">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">{isRtl ? 'دقة المحاكاة:' : 'Model Confidence:'}</span>
                            <span className="text-xs font-black text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded-full border border-lime-500/30">
                                {result.confidenceScorePct}%
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                            {isRtl ? `عتبة التثبيط: ${result.hptaThresholdNgDl} ng/dL` : `Inhibitory Gate: ${result.hptaThresholdNgDl} ng/dL`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel: Inputs & Modifiers (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                    {/* 1. Compound Stack Builder */}
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-lime-400" />
                                {isRtl ? '1. حزمة المركبات والإسترات (Stack)' : '1. Compound Stack & Esters'}
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddCompound}
                                className="px-2.5 py-1 text-[11px] font-bold bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/30 rounded-lg transition"
                            >
                                + {isRtl ? 'إضافة مركب' : 'Add Compound'}
                            </button>
                        </div>

                        {result.hasConflictingEsters && (
                            <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
                                {isRtl ? result.conflictWarningAr : result.conflictWarningEn}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            {stack.map((c, idx) => (
                                <div key={c.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 relative">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                                                {isRtl ? `مركب #${idx + 1}` : `Compound #${idx + 1}`}
                                            </label>
                                            <select
                                                value={c.presetKey}
                                                onChange={(e) => handleUpdateCompound(c.id, { presetKey: e.target.value as EsterPresetKey })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-lime-500 font-medium"
                                            >
                                                {Object.values(ESTER_CATALOG).map((preset) => (
                                                    <option key={preset.id} value={preset.id}>
                                                        {isRtl ? preset.nameAr : preset.nameEn} (t½ ~{preset.halfLifeDays}d)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {stack.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCompound(c.id)}
                                                className="text-slate-500 hover:text-rose-400 p-1 text-xs transition"
                                                title={isRtl ? 'حذف' : 'Remove'}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div>
                                            <label className="text-[10px] text-slate-400 block mb-0.5">
                                                {isRtl ? 'الجرعة (ملغ/أسبوع)' : 'Weekly Dose (mg)'}
                                            </label>
                                            <input
                                                type="number"
                                                value={c.doseMgPerWeek}
                                                min={50}
                                                max={3000}
                                                step={25}
                                                onChange={(e) => handleUpdateCompound(c.id, { doseMgPerWeek: Number(e.target.value) })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 block mb-0.5">
                                                {isRtl ? 'نصف العمر (أيام)' : 'Half-Life (days)'}
                                            </label>
                                            <input
                                                type="number"
                                                value={c.halfLifeDays}
                                                min={0.2}
                                                max={30}
                                                step={0.1}
                                                onChange={(e) => handleUpdateCompound(c.id, { halfLifeDays: Number(e.target.value) })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Cycle Protocol & Dates */}
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-lime-400" />
                            {isRtl ? '2. توقيت ومدة الدورة' : '2. Cycle Timing & Protocol'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                                    {isRtl ? 'تاريخ آخر حقنة:' : 'Last Injection Date:'}
                                </label>
                                <input
                                    type="date"
                                    value={lastInjectionDate}
                                    onChange={(e) => setLastInjectionDate(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                                    {isRtl ? `مدة الدورة: ${weeksOnCycle} أسبوع` : `Cycle Duration: ${weeksOnCycle} wks`}
                                </label>
                                <input
                                    type="range"
                                    min={4}
                                    max={24}
                                    value={weeksOnCycle}
                                    onChange={(e) => setWeeksOnCycle(Number(e.target.value))}
                                    className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer mt-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                                {isRtl ? 'خطة الـ PCT المختارة:' : 'PCT Drug Strategy:'}
                            </label>
                            <select
                                value={pctProtocol}
                                onChange={(e) => setPctProtocol(e.target.value as PctProtocol)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-medium focus:border-lime-500"
                            >
                                {PCT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {isRtl ? o.ar : o.en}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 3. Bio-Modifiers (The Dynamic Edge) */}
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-lime-400" />
                            {isRtl ? '3. المعدلات الحيوية الفردية (Bio-Modifiers)' : '3. Personal Bio-Modifiers'}
                        </h2>

                        {/* Body Weight Input (Dynamic Unit System) */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <label id="weight-label" className="text-[11px] text-slate-400 font-semibold">
                                    {unitSystem === 'metric'
                                        ? isRtl ? 'وزن الجسم (كغ):' : 'Body Weight (kg):'
                                        : isRtl ? 'وزن الجسم (رطل):' : 'Body Weight (lbs):'}
                                </label>
                                <span className="text-xs font-black text-lime-400 font-mono">
                                    {unitSystem === 'metric' ? `${bodyWeightKg} kg` : `${kgToLbs(bodyWeightKg)} lbs`}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={unitSystem === 'metric' ? 40 : 88}
                                    max={unitSystem === 'metric' ? 160 : 352}
                                    value={unitSystem === 'metric' ? bodyWeightKg : kgToLbs(bodyWeightKg)}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setBodyWeightKg(unitSystem === 'metric' ? val : lbsToKg(val));
                                    }}
                                    className="flex-1 accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                                />
                                <input
                                    id="weight-input"
                                    type="number"
                                    min={unitSystem === 'metric' ? 40 : 88}
                                    max={unitSystem === 'metric' ? 160 : 352}
                                    value={unitSystem === 'metric' ? bodyWeightKg : kgToLbs(bodyWeightKg)}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (!isNaN(val) && val > 0) {
                                            setBodyWeightKg(unitSystem === 'metric' ? val : lbsToKg(val));
                                        }
                                    }}
                                    className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:border-lime-500"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                {isRtl
                                    ? 'حجم توزيع الدواء (Vd) ومعدلات التصريف تتناسب مع إجمالي كتلة الجسم.'
                                    : 'Volume of distribution (Vd) and baseline clearance scale with total body weight.'}
                            </p>
                        </div>

                        {/* Body Fat Slider */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] text-slate-400 font-semibold">
                                    {isRtl ? 'نسبة الدهون في الجسم (Adipose Storage):' : 'Body Fat % (Adipose Vd Storage):'}
                                </label>
                                <span className="text-xs font-black text-lime-400 font-mono">{bodyFatPct}%</span>
                            </div>
                            <input
                                type="range"
                                min={6}
                                max={40}
                                value={bodyFatPct}
                                onChange={(e) => setBodyFatPct(Number(e.target.value))}
                                className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">
                                {bodyFatPct > 20
                                    ? isRtl
                                        ? '⚠️ تخزن الإسترات المحبة للدهون (ديكا/إكويبويز) في النسيج الدهني مما يمدد نصف العمر الفعلي.'
                                        : '⚠️ High body fat prolongs effective half-life of lipophilic steroids in fat tissue.'
                                    : isRtl
                                      ? 'معدل تخزين نسيجي مثالي وتصريف أسرع للمركب.'
                                      : 'Normal adipose retention; predictable clearance rate.'}
                            </p>
                        </div>

                        {/* Organ Health Slider / Select */}
                        <div className="mb-4">
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                                {isRtl ? 'كفاءة الكبد والكلى (Hepatic/Renal Clearance):' : 'Metabolic Health (Hepatic Clearance):'}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {ORGAN_HEALTH_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setOrganHealth(opt)}
                                        className={`p-2 rounded-xl text-[11px] font-bold border transition ${
                                            organHealth === opt
                                                ? 'bg-lime-500/20 border-lime-500/50 text-lime-300'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {isRtl ? ORGAN_HEALTH_LABELS[opt].ar : ORGAN_HEALTH_LABELS[opt].en}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cycle History / HPTA Sensitivity */}
                        <div>
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                                {isRtl ? 'التاريخ الهرموني وحساسية المستقبلات:' : 'Cycle Experience (LH/FSH Sensitivity):'}
                            </label>
                            <select
                                value={cycleHistory}
                                onChange={(e) => setCycleHistory(e.target.value as CycleHistoryExperience)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:border-lime-500"
                            >
                                {CYCLE_HISTORY_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {isRtl ? CYCLE_HISTORY_LABELS[opt].ar : CYCLE_HISTORY_LABELS[opt].en}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Clearance Visualizer & Roadmap (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                    {/* View Switcher Tabs */}
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-800 gap-3">
                            <div>
                                <h2 className="text-base font-black text-white">
                                    {activeTab === 'daily_curve'
                                        ? isRtl
                                            ? 'منحنى التلاشي اليومي ومناطق الأمان (Washout Zones)'
                                            : 'Daily Clearance Curve & Safety Zones'
                                        : isRtl
                                          ? 'المسار الأسبوعي الشامل لاستعادة المحور (HPTA Rebound)'
                                          : 'Weekly HPTA Rebound Time-Course'}
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    {isRtl
                                        ? 'المنطقة الخضراء تمثل النافذة الفسيولوجية المثالية التي تصبح فيها الغدة النخامية قادرة على الاستجابة للكلوميد والنولفادكس.'
                                        : 'The green zone marks where exogenous androgen drops below inhibitory threshold, allowing SERMs to trigger LH/FSH.'}
                                </p>
                            </div>
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('daily_curve')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                        activeTab === 'daily_curve'
                                            ? 'bg-lime-500 text-slate-950 shadow-md shadow-lime-500/20'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {isRtl ? 'التلاشي اليومي (Daily)' : 'Daily Washout'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('weekly_rebound')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                        activeTab === 'weekly_rebound'
                                            ? 'bg-lime-500 text-slate-950 shadow-md shadow-lime-500/20'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {isRtl ? 'المسار الأسبوعي (Weeks)' : 'Weekly Rebound'}
                                </button>
                            </div>
                        </div>

                        {/* Chart Render */}
                        <div className="w-full h-80 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                {activeTab === 'daily_curve' ? (
                                    <ComposedChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="clearanceGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                                                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#020617',
                                                borderColor: '#334155',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                            }}
                                            formatter={(val: number | string, name: string) => {
                                                const n = Number(val);
                                                if (name === 'serumPct') {
                                                    return [`${n.toFixed(1)}%`, isRtl ? 'الحمل الهرموني المتبقي' : 'Residual Load'];
                                                }
                                                return [val, name];
                                            }}
                                        />
                                        <ReferenceLine
                                            y={DEFAULT_CLEARANCE_THRESHOLD_PCT}
                                            stroke="#10b981"
                                            strokeDasharray="4 4"
                                            strokeWidth={2}
                                            label={{
                                                value: isRtl ? `عتبة التثبيط (${result.hptaThresholdNgDl} ng/dL)` : `Threshold Gate (${result.hptaThresholdNgDl} ng/dL)`,
                                                fontSize: 10,
                                                fill: '#10b981',
                                                position: 'insideBottomRight',
                                            }}
                                        />
                                        <ReferenceLine
                                            x={`D+${result.washoutDays}`}
                                            stroke="#a855f7"
                                            strokeWidth={2}
                                            label={{
                                                value: isRtl ? 'بدء PCT' : 'PCT Launch',
                                                fontSize: 10,
                                                fill: '#a855f7',
                                                position: 'top',
                                            }}
                                        />
                                        <Area type="monotone" dataKey="serumPct" stroke="#f59e0b" fill="url(#clearanceGrad)" strokeWidth={2.5} name="serumPct" />
                                    </ComposedChart>
                                ) : (
                                    <LineChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 10 }} />
                                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#020617',
                                                borderColor: '#334155',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                            }}
                                            formatter={(val: number | string, name: string) => {
                                                const n = Number(val);
                                                if (name === 'endoTesto') {
                                                    return [`${n.toFixed(1)}% (${formatTesto(n)})`, isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T'];
                                                }
                                                return [`${n.toFixed(1)}%`, isRtl ? 'المركب الخارجي' : 'Exogenous Serum'];
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        <ReferenceLine x={`W${result.pctStartWeek}`} stroke="#a855f7" strokeDasharray="4 4" label={{ value: 'PCT Start', fontSize: 10, fill: '#a855f7' }} />
                                        <Line type="monotone" dataKey="serum" name={isRtl ? 'المركب الخارجي' : 'Exogenous Serum'} stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                                        <Line type="monotone" dataKey="endoTesto" name={isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T'} stroke="#10b981" strokeWidth={2.5} dot={false} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>

                        {/* Zone Legend Indicator */}
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                            <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/30">
                                <span className="text-[10px] font-bold text-rose-400 block uppercase">
                                    🔴 {isRtl ? 'المنطقة الحمراء' : 'Red Zone'}
                                </span>
                                <span className="text-[11px] text-slate-300 font-medium">
                                    {isRtl ? 'تثبيط كامل (ممنوع SERMs)' : 'Suppressed (No SERMs)'}
                                </span>
                            </div>
                            <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/30">
                                <span className="text-[10px] font-bold text-amber-400 block uppercase">
                                    🟡 {isRtl ? 'المنطقة الصفراء' : 'Transition'}
                                </span>
                                <span className="text-[11px] text-slate-300 font-medium">
                                    {isRtl ? 'تهيئة الخصية (hCG اختياري)' : 'Priming / hCG Window'}
                                </span>
                            </div>
                            <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                                <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                                    🟢 {isRtl ? 'المنطقة الخضراء' : 'Recovery Window'}
                                </span>
                                <span className="text-[11px] text-slate-300 font-medium">
                                    {isRtl ? 'انطلاق PCT الفعلي' : 'Launch SERM Protocol'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Phase-by-Phase Roadmap */}
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                        <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-lime-400" />
                            {isRtl ? 'خارطة الطريق الزمنية (Action Protocol Roadmap)' : 'Action Protocol Roadmap'}
                        </h2>

                        <div className="flex flex-col gap-2.5">
                            {/* Phase 1 */}
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 mt-0.5">
                                    1
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-white">
                                            {isRtl ? 'مرحلة التلاشي والتنقية (The Washout Phase)' : 'Phase 1: The Washout Phase'}
                                        </h3>
                                        <span className="text-[10px] font-mono text-amber-400">{result.washoutDays} {isRtl ? 'يوماً' : 'days'}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        {isRtl
                                            ? 'لا تبدأ مضادات الاستروجين SERMs هنا إطلاقاً؛ مستويات الاندروجين ما تزال تسد المستقبلات. يمكن إعطاء جرعات صغيرة من hCG إذا كانت مجدولة لإنعاش خلايا لايديغ قبل الهبوط الكامل.'
                                            : 'No SERMs yet. Androgen load still blocks pituitary GnRH release. Optional low-dose hCG priming only.'}
                                    </p>
                                </div>
                            </div>

                            {/* Phase 2 */}
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0 mt-0.5">
                                    2
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-white">
                                            {isRtl ? 'إعادة تشغيل المحور (HPTA Kickstart)' : 'Phase 2: HPTA Kickstart'}
                                        </h3>
                                        <span className="text-[10px] font-mono text-purple-400">
                                            {isRtl ? 'تاريخ البدء:' : 'Starts:'} {formatDateLocalized(result.pctLaunchDateIso, locale)} ({result.pctLaunchDateIso})
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        {isRtl
                                            ? `تبدأ بروتوكول SERM المعتمد (${pctProtocol === 'aggressive_mrx' ? 'نولفادكس + كلوميد بالتدرج' : 'نولفادكس 40/40/20/20'}) لمدة ${result.pctDurationWeeks} أسابيع لإعادة إفراز LH/FSH.`
                                            : `Initiate SERMs protocol (${pctProtocol === 'aggressive_mrx' ? 'Nolvadex + Clomid taper' : 'Nolvadex 40/40/20/20'}) for ${result.pctDurationWeeks} weeks to trigger LH/FSH.`}
                                    </p>
                                </div>
                            </div>

                            {/* Phase 3 */}
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 mt-0.5">
                                    3
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-white">
                                            {isRtl ? 'الفحوصات والتثبيت (Stabilization & Labs)' : 'Phase 3: Bloodwork & Stabilization'}
                                        </h3>
                                        <span className="text-[10px] font-mono text-emerald-400">{isRtl ? 'اليوم +45' : 'Day +45'}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        {isRtl
                                            ? 'إجراء فحص الدم الشامل (LH, FSH, Total T, Free T, Sensitive E2, SHBG) بعد 3-4 أسابيع من التوقف عن الـ SERMs للتحقق من استقرار الإنتاج الطبيعي ذاتياً.'
                                            : 'Run full blood panel (LH, FSH, Total T, Free T, Sensitive E2, SHBG) 3-4 weeks post-SERMs to confirm self-sustaining production.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Save to Bio-Dashboard action bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-3 mt-3 border-t border-slate-800 gap-3">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-slate-400 font-mono">{saveStatus}</span>
                                {validationError && (
                                    <span className="text-xs text-rose-400 font-bold">{validationError}</span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleSaveToDashboard}
                                disabled={isSaving}
                                className="w-full sm:w-auto px-5 py-2.5 text-xs font-black bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-xl transition shadow-lg shadow-lime-500/20 disabled:opacity-50"
                            >
                                {isSaving
                                    ? isRtl ? 'جاري الحفظ...' : 'Saving...'
                                    : isRtl ? '💾 حفظ الخطة في لوحة القيادة الحيوية' : '💾 Save to Bio-Dashboard'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Book context & Medical disclaimer */}
            <div className="mt-6 p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
                <p className="text-xs text-slate-400 leading-relaxed">
                    {isRtl
                        ? 'تنويه علمي وقانوني: هذه المحاكاة مبنية على معادلات الحركية الدوائية (Pharmacokinetics) ونصف العمر المنشور في المراجع الطبية المعتمدة وكتاب Mr. X-Steroid. تختلف معدلات التطهير الفردية وفق صحة الكبد والجينات. لا تغني هذه الحسابات عن تحاليل الدم المخبرية واستشارة الأطباء المتخصصين.'
                        : 'Educational & Safety Notice: All outputs are mathematical pharmacokinetic simulations based on literature half-lives and Mr. X-Steroid Book Ch. 6. Individual hepatic clearance and genetics vary. Confirm all recovery milestones with verified laboratory blood panels.'}
                </p>
            </div>

            {/* SEO Internal Link Graph (registry-driven) */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
                <a
                    href={requireTool(neighbors.prevTool.slug).href}
                    rel="prev"
                    className="flex items-center gap-2 text-slate-400 hover:text-lime-400 transition font-medium"
                >
                    <span>←</span>
                    <span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span>
                </a>
                <a
                    href={requireTool(neighbors.nextTool.slug).href}
                    rel="next"
                    className="flex items-center gap-2 text-slate-400 hover:text-lime-400 transition font-medium"
                >
                    <span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span>
                    <span>→</span>
                </a>
            </div>
        </div>
    );
}
