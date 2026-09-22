'use client';

/**
 * components/tools/timeline.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #080 — Layer 5: Transformation Timeline Engine live UI
 *  (Tailwind + Recharts + AR/EN RTL + Metric/Imperial).
 * ═══════════════════════════════════════════════════════════════════════════
 * State protocol (spec §5):
 *   - live input state → instant local state (never touches the DB),
 *   - 1500 ms inactivity → versioned local draft via the shared adapter,
 *   - "Save to Bio-Dashboard" → `submitted_snapshot` + `dashboard_projection`
 *     through `POST /api/tools/logs` (Bearer-authenticated).
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
} from 'recharts';
import {
    calculateTimeline,
    type BiologicalStatus,
    type EngineInput,
    type ExperienceLevel,
    type Goal,
} from '@/lib/tools/engines/timeline';
import { buildTimelineOutput } from '@/lib/tools/adapters/timeline';
import {
    AUTO_DRAFT_DEBOUNCE_MS,
    clearDraft,
    commitDashboardSnapshot,
    loadDraft,
    saveDraft,
    shouldAutoDraft,
} from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { tryParseTimelineInput } from '@/lib/tools/schemas/timeline';

const TOOL_SLUG = 'timeline';

const LB_PER_KG = 0.45359237;

interface TimelineDraftInputs {
    startingWeightInput: number;
    startingBodyFatPct: number;
    caloricDeltaKcal: number;
    timelineWeeks: number;
    goal: Goal;
    biologicalStatus: BiologicalStatus;
    experienceLevel: ExperienceLevel;
}

const GOAL_OPTIONS: Array<{ value: Goal; ar: string; en: string }> = [
    { value: 'fat_loss', ar: 'فقدان دهون', en: 'Fat Loss' },
    { value: 'lean_gain', ar: 'بناء عضلي', en: 'Lean Muscle Gain' },
    { value: 'recomposition', ar: 'إعادة تكوين', en: 'Recomposition' },
];

const STATUS_OPTIONS: Array<{ value: BiologicalStatus; ar: string; en: string }> = [
    { value: 'natural', ar: 'طبيعي', en: 'Natural' },
    { value: 'enhanced', ar: 'معزز (دورة بنائية)', en: 'Enhanced (Anabolic Cycle)' },
    { value: 'heavy_enhanced', ar: 'معزز بكثافة', en: 'Heavy Enhanced' },
];

const EXPERIENCE_OPTIONS: Array<{ value: ExperienceLevel; ar: string; en: string }> = [
    { value: 'beginner', ar: 'مبتدئ', en: 'Beginner' },
    { value: 'intermediate', ar: 'متوسط', en: 'Intermediate' },
    { value: 'advanced', ar: 'متقدم', en: 'Advanced' },
];

const MILESTONE_WEEKS = [2, 6, 12];

export default function TimelineToolComponent() {
    const tool = requireTool(TOOL_SLUG);
    const neighbors = getToolNeighbors(TOOL_SLUG);

    const [locale, setLocale] = useState<'ar' | 'en'>('ar');
    const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
    const [startingWeightInput, setStartingWeightInput] = useState<number>(85);
    const [startingBodyFatPct, setStartingBodyFatPct] = useState<number>(20);
    const [caloricDeltaKcal, setCaloricDeltaKcal] = useState<number>(-500);
    const [timelineWeeks, setTimelineWeeks] = useState<number>(12);
    const [goal, setGoal] = useState<Goal>('fat_loss');
    const [biologicalStatus, setBiologicalStatus] = useState<BiologicalStatus>('natural');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const isRtl = locale === 'ar';

    // Draft restore (once, on mount) — corrupt/stale drafts are discarded safely.
    useEffect(() => {
        const draft = loadDraft<TimelineDraftInputs>(TOOL_SLUG);
        if (!draft) return;
        const i = draft.inputs;
        if (typeof i.startingWeightInput === 'number') setStartingWeightInput(i.startingWeightInput);
        if (typeof i.startingBodyFatPct === 'number') setStartingBodyFatPct(i.startingBodyFatPct);
        if (typeof i.caloricDeltaKcal === 'number') setCaloricDeltaKcal(i.caloricDeltaKcal);
        if (typeof i.timelineWeeks === 'number') setTimelineWeeks(i.timelineWeeks);
        if (i.goal === 'fat_loss' || i.goal === 'lean_gain' || i.goal === 'recomposition') setGoal(i.goal);
        if (i.biologicalStatus === 'natural' || i.biologicalStatus === 'enhanced' || i.biologicalStatus === 'heavy_enhanced')
            setBiologicalStatus(i.biologicalStatus);
        if (i.experienceLevel === 'beginner' || i.experienceLevel === 'intermediate' || i.experienceLevel === 'advanced')
            setExperienceLevel(i.experienceLevel);
        setSaveStatus(locale === 'ar' ? 'تم استعادة المسودة المحفوظة محلياً' : 'Local draft restored');
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run-once mount restore
    }, []);

    const canonicalWeightKg = useMemo(
        () => (unitSystem === 'metric' ? startingWeightInput : startingWeightInput * LB_PER_KG),
        [startingWeightInput, unitSystem],
    );

    const engineInput: EngineInput = useMemo(
        () => ({
            startingWeightKg: canonicalWeightKg,
            startingBodyFatPct,
            goal,
            biologicalStatus,
            experienceLevel,
            caloricDeltaKcal,
            timelineWeeks,
        }),
        [canonicalWeightKg, startingBodyFatPct, goal, biologicalStatus, experienceLevel, caloricDeltaKcal, timelineWeeks],
    );

    // Live real-time calculation (pure engine, recomputed on every change).
    const result = useMemo(() => calculateTimeline(engineInput), [engineInput]);

    const chartData = useMemo(
        () =>
            result.timeline.map((p) => ({
                week: p.weekNumber,
                weight: p.estimatedWeightKg,
                lean: p.estimatedLbmKg,
                fat: p.estimatedFatMassKg,
            })),
        [result],
    );

    // ── Auto-draft (spec §5.2): 1500 ms inactivity → local cache only ──
    const lastSavedAtRef = useRef<number>(Date.now());
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!shouldAutoDraft(lastSavedAtRef.current, Date.now())) return;
            const saved = saveDraft<TimelineDraftInputs>(
                TOOL_SLUG,
                {
                    startingWeightInput,
                    startingBodyFatPct,
                    caloricDeltaKcal,
                    timelineWeeks,
                    goal,
                    biologicalStatus,
                    experienceLevel,
                },
                { locale, unitSystem, savedAt: new Date().toISOString() },
            );
            lastSavedAtRef.current = Date.now();
            setSaveStatus(
                saved
                    ? isRtl
                        ? 'تم حفظ المسودة محلياً تلقائياً'
                        : 'Draft auto-saved locally'
                    : isRtl
                      ? 'تعذّر حفظ المسودة محلياً'
                      : 'Local draft unavailable',
            );
        }, AUTO_DRAFT_DEBOUNCE_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional, mirrors multi-ester
    }, [startingWeightInput, startingBodyFatPct, caloricDeltaKcal, timelineWeeks, goal, biologicalStatus, experienceLevel, locale, isRtl]);

    // ── Dashboard commit (spec §5.3): submitted_snapshot → projection ──
    const handleSaveToDashboard = async () => {
        const parsed = tryParseTimelineInput({
            startingWeightKg: canonicalWeightKg,
            startingBodyFatPct,
            goal,
            biologicalStatus,
            experienceLevel,
            caloricDeltaKcal,
            timelineWeeks,
        });
        if (!parsed.ok) {
            setValidationError(parsed.error.issues[0]?.message ?? (isRtl ? 'مدخلات غير صالحة' : 'Invalid inputs'));
            return;
        }
        setValidationError(null);
        setIsSaving(true);
        try {
            const nowIso = new Date().toISOString();
            const output = buildTimelineOutput(parsed.data, {
                locale,
                unitSystem,
                snapshotType: 'dashboard_projection',
                calculatedAt: nowIso,
                recordedAt: nowIso,
            });

            const { supabase } = await import('@/shared/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                setSaveStatus(isRtl ? 'سجّل الدخول أولاً لحفظ اللقطة في لوحتك.' : 'Sign in first to save a dashboard snapshot.');
                return;
            }

            const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data, {
                accessToken: session.access_token,
            });

            if (submitted.ok && projection.ok) {
                clearDraft(TOOL_SLUG);
                setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية بنجاح!' : 'Saved to Bio-Dashboard!');
            } else {
                const reason = projection.error ?? submitted.error ?? 'unknown error';
                setSaveStatus(isRtl ? `تعذّر الحفظ: ${reason}` : `Save failed: ${reason}`);
            }
        } catch {
            setSaveStatus(isRtl ? 'حدث خطأ أثناء الحفظ.' : 'Error saving record.');
        } finally {
            setIsSaving(false);
        }
    };

    const weightUnitLabel = unitSystem === 'metric' ? 'كجم' : 'باوند';
    const deltaLabel = caloricDeltaKcal > 0 ? `+${caloricDeltaKcal}` : `${caloricDeltaKcal}`;

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl ${isRtl ? 'rtl' : 'ltr'}`}
        >
            {/* Header & Settings */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                <div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-lime-500/10 text-lime-400 border border-lime-500/30 rounded-full">
                        Timeline Engine v1.0 · Tool #080
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
                        {isRtl ? tool.titleAr : tool.titleEn}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">
                        {isRtl
                            ? 'محاكاة أسبوعية لمسار تحول تركيبة الجسم مع التكيف الأيضي وتحذير الهضبة.'
                            : 'Week-by-week body-composition trajectory with metabolic adaptation & plateau detection.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition"
                    >
                        {isRtl ? 'English (LTR)' : 'عربي (RTL)'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-lime-400 rounded-lg border border-slate-700 transition"
                    >
                        {unitSystem === 'metric' ? 'Metric (kg)' : 'Imperial (lbs)'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Inputs */}
                <div className="lg:col-span-5 bg-slate-900/60 p-4 md:p-5 rounded-xl border border-slate-800/80 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2">
                        {isRtl ? 'إعدادات التحول' : 'Transformation Setup'}
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="tl-weight" className="block text-xs font-medium text-slate-400 mb-1">
                                {isRtl ? `وزن البداية (${weightUnitLabel})` : `Starting Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`}
                            </label>
                            <input
                                id="tl-weight"
                                type="number"
                                min={unitSystem === 'metric' ? 30 : 66}
                                max={unitSystem === 'metric' ? 300 : 660}
                                value={startingWeightInput}
                                onChange={(e) => setStartingWeightInput(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="tl-bf" className="block text-xs font-medium text-slate-400 mb-1">
                                {isRtl ? 'نسبة دهون البداية (%)' : 'Starting Body Fat (%)'}
                            </label>
                            <input
                                id="tl-bf"
                                type="number"
                                min={3}
                                max={60}
                                value={startingBodyFatPct}
                                onChange={(e) => setStartingBodyFatPct(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="tl-goal" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? 'الهدف' : 'Goal'}
                        </label>
                        <select
                            id="tl-goal"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value as Goal)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                        >
                            {GOAL_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {isRtl ? o.ar : o.en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="tl-status" className="block text-xs font-medium text-slate-400 mb-1">
                                {isRtl ? 'الحالة البيولوجية' : 'Biological Status'}
                            </label>
                            <select
                                id="tl-status"
                                value={biologicalStatus}
                                onChange={(e) => setBiologicalStatus(e.target.value as BiologicalStatus)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {isRtl ? o.ar : o.en}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tl-exp" className="block text-xs font-medium text-slate-400 mb-1">
                                {isRtl ? 'مستوى الخبرة' : 'Experience'}
                            </label>
                            <select
                                id="tl-exp"
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                            >
                                {EXPERIENCE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {isRtl ? o.ar : o.en}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="tl-delta" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? `فجوة السعرات اليومية: ${deltaLabel} سعرة` : `Daily Caloric Delta: ${deltaLabel} kcal`}
                        </label>
                        <input
                            id="tl-delta"
                            type="range"
                            min={-1500}
                            max={1500}
                            step={50}
                            value={caloricDeltaKcal}
                            onChange={(e) => setCaloricDeltaKcal(Number(e.target.value))}
                            className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div>
                        <label htmlFor="tl-weeks" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? `مدة الجدول: ${timelineWeeks} أسبوع` : `Timeline Length: ${timelineWeeks} weeks`}
                        </label>
                        <input
                            id="tl-weeks"
                            type="range"
                            min={4}
                            max={52}
                            step={1}
                            value={timelineWeeks}
                            onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                            className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                        />
                    </div>

                    {validationError && (
                        <p role="alert" className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                            {validationError}
                        </p>
                    )}
                </div>

                {/* Right Column: Chart + Telemetry + Milestones */}
                <div className="lg:col-span-7 bg-slate-900/60 p-4 md:p-5 rounded-xl border border-slate-800/80 flex flex-col gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2 mb-4">
                            {isRtl ? 'مسار التركيب البدني (كجم)' : 'Body Composition Trajectory (kg)'}
                        </h2>
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#020617', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    <Line type="monotone" dataKey="weight" name={isRtl ? 'الوزن الكلي' : 'Total Weight'} stroke="#84cc16" strokeWidth={2.5} dot={false} />
                                    <Line type="monotone" dataKey="lean" name={isRtl ? 'الكتلة العضلية' : 'Lean Mass'} stroke="#06b6d4" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="fat" name={isRtl ? 'الكتلة الدهنية' : 'Fat Mass'} stroke="#f59e0b" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Telemetry cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'الزمن للهدف' : 'Weeks to Goal'}</span>
                            <span className="text-base font-bold text-lime-400 font-mono">{result.totalWeeksNeeded}</span>
                            <span className="text-[10px] text-slate-500 block">{isRtl ? 'أسبوع' : 'weeks'}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'عضلة مكتسبة' : 'Muscle Gained'}</span>
                            <span className="text-base font-bold text-cyan-400 font-mono">+{result.muscleGainedKg}</span>
                            <span className="text-[10px] text-slate-500 block">kg</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'دهون مفقودة' : 'Fat Lost'}</span>
                            <span className="text-base font-bold text-amber-400 font-mono">-{Math.max(0, result.fatLostKg)}</span>
                            <span className="text-[10px] text-slate-500 block">kg</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'تحذير الهضبة' : 'Plateau Warning'}</span>
                            <span className="text-base font-bold text-purple-400 font-mono">
                                {result.plateauWarningWeek > 0 ? (isRtl ? `أسبوع ${result.plateauWarningWeek}` : `Wk ${result.plateauWarningWeek}`) : '—'}
                            </span>
                            <span className="text-[10px] text-slate-500 block">{result.targetReached ? (isRtl ? 'الهدف محقق' : 'goal reached') : '—'}</span>
                        </div>
                    </div>

                    {/* Milestone phase stepper */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-lime-400" />
                            {isRtl ? 'المعالم الزمنية' : 'Milestone Phases'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {MILESTONE_WEEKS.map((wk) => {
                                const reached = result.totalWeeksNeeded >= wk;
                                const note = result.timeline.find((p) => p.weekNumber === wk);
                                return (
                                    <div
                                        key={wk}
                                        className={`flex-1 min-w-[120px] p-2.5 rounded-lg border text-xs ${
                                            reached
                                                ? 'bg-lime-500/10 border-lime-500/40 text-lime-300'
                                                : 'bg-slate-950 border-slate-800 text-slate-400'
                                        }`}
                                        title={isRtl ? note?.milestoneNoteAr : note?.milestoneNoteEn}
                                    >
                                        <div className="font-bold">{isRtl ? `الأسبوع ${wk}` : `Week ${wk}`}</div>
                                        <div className="text-[10px] mt-1 line-clamp-2">
                                            {isRtl ? note?.milestoneNoteAr : note?.milestoneNoteEn}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Save action bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center pt-3 border-t border-slate-800 gap-3">
                        <span className="text-xs text-slate-500 font-mono">{saveStatus}</span>
                        <button
                            type="button"
                            onClick={handleSaveToDashboard}
                            disabled={isSaving}
                            className="w-full md:w-auto px-5 py-2 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-lg transition shadow-lg shadow-lime-500/10 disabled:opacity-50"
                        >
                            {isSaving
                                ? isRtl ? 'جاري الحفظ...' : 'Saving...'
                                : isRtl ? 'حفظ في لوحة القيادة الحيوية' : 'Save to Bio-Dashboard'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Book context / disclaimer */}
            <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="flex items-start gap-3">
                    <span className="text-lg"></span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {isRtl
                            ? 'وفقاً لمنهجية كتاب Mr. X-Steroid (الفصل الخاص بحركية تركيبة الجسم)، تحاكي هذه الأداة سقف التضخّم العضلي الجيني وتأثير التكيف الأيضي مع احتباس الماء الأولي للمركبات المعززة. النتائج نموذج تعليمي وليست استشارة طبية.'
                            : 'Per the Mr. X-Steroid Book body-composition kinetics chapter, this engine models the genetic hypertrophy ceiling, metabolic adaptation decay, and initial enhanced-compound water retention. Results are an educational model, not medical advice.'}
                    </p>
                </div>
            </div>

            {/* SEO Internal Link Graph (registry-driven) */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
                <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-slate-400 hover:text-lime-400 transition">
                    <span>←</span>
                    <span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span>
                </a>
                <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-slate-400 hover:text-lime-400 transition">
                    <span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span>
                    <span>→</span>
                </a>
            </div>
        </div>
    );
}
