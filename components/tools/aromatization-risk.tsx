'use client';

/**
 * components/tools/aromatization-risk.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #002 — Layer 5: Unvalidated Aromatization Scenario Model
 *  (Tailwind + Recharts + AR/EN RTL + pg/mL ↔ pmol/L units).
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
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from 'recharts';
import {
    calculateAromatizationRisk,
    type AiProtocol,
    type CompoundType,
    type EngineInput,
} from '@/lib/tools/engines/aromatization-risk';
import { buildAromatizationRiskOutput } from '@/lib/tools/adapters/aromatization-risk';
import {
    AUTO_DRAFT_DEBOUNCE_MS,
    clearDraft,
    commitDashboardSnapshot,
    loadDraft,
    saveDraft,
    shouldAutoDraft,
} from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { tryParseAromatizationRiskInput } from '@/lib/tools/schemas/aromatization-risk';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const TOOL_SLUG = 'aromatization-risk';

/** pmol/L per pg/mL conversion (Estradiol). */
const PMOL_PER_PGML = 3.671;

interface AromatizationDraftInputs {
    weeksOnCycle: number;
    weeklyDoseMg: number;
    bodyFatPct: number;
    compoundType: CompoundType;
    aiProtocol: AiProtocol;
}

const COMPOUND_OPTIONS: Array<{ value: CompoundType; ar: string; en: string }> = [
    { value: 'testosterone', ar: 'تستوستيرون (إستر طويل)', en: 'Testosterone (long ester)' },
    { value: 'methandienone', ar: 'ميثانديينون (Dianabol)', en: 'Methandienone (Dianabol)' },
    { value: 'boldenone', ar: 'بولدينون (Equipoise)', en: 'Boldenone (Equipoise)' },
    { value: 'nandrolone', ar: 'ناندرولون (Deca)', en: 'Nandrolone (Deca)' },
    { value: 'oxymetholone', ar: 'أوكسي ميثولون (Anadrol)', en: 'Oxymetholone (Anadrol)' },
    { value: 'trenbolone', ar: 'ترينبولون (لا يُأَرومَتَز)', en: 'Trenbolone (non-aromatising)' },
];

const AI_OPTIONS: Array<{ value: AiProtocol; ar: string; en: string }> = [
    { value: 'none', ar: 'عامل افتراضي 0%', en: 'Hypothetical factor 0%' },
    { value: 'mild', ar: 'عامل افتراضي 50%', en: 'Hypothetical factor 50%' },
    { value: 'standard', ar: 'عامل افتراضي 72%', en: 'Hypothetical factor 72%' },
    { value: 'aggressive', ar: 'عامل افتراضي 88%', en: 'Hypothetical factor 88%' },
];

const PHASE_COLORS: Record<string, string> = {
    on_cycle: '#ef4444',
    post_cycle: '#10b981',
};

export default function AromatizationRiskToolComponent() {
    const tool = requireTool(TOOL_SLUG);
    const neighbors = getToolNeighbors(TOOL_SLUG);

    const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
    const [weeksOnCycle, setWeeksOnCycle] = useState<number>(12);
    const [weeklyDoseMg, setWeeklyDoseMg] = useState<number>(500);
    const [bodyFatPct, setBodyFatPct] = useState<number>(15);
    const [compoundType, setCompoundType] = useState<CompoundType>('testosterone');
    const [aiProtocol, setAiProtocol] = useState<AiProtocol>('none');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    // Draft restore (once, on mount) — corrupt/stale drafts are discarded safely.
    useEffect(() => {
        const draft = loadDraft<AromatizationDraftInputs>(TOOL_SLUG);
        if (!draft) return;
        const i = draft.inputs;
        if (typeof i.weeksOnCycle === 'number') setWeeksOnCycle(i.weeksOnCycle);
        if (typeof i.weeklyDoseMg === 'number') setWeeklyDoseMg(i.weeklyDoseMg);
        if (typeof i.bodyFatPct === 'number') setBodyFatPct(i.bodyFatPct);
        if (typeof i.compoundType === 'string' && COMPOUND_OPTIONS.some((o) => o.value === i.compoundType))
            setCompoundType(i.compoundType as CompoundType);
        if (typeof i.aiProtocol === 'string' && AI_OPTIONS.some((o) => o.value === i.aiProtocol))
            setAiProtocol(i.aiProtocol as AiProtocol);
        setSaveStatus(locale === 'ar' ? 'تم استعادة المسودة المحفوظة محلياً' : 'Local draft restored');
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run-once mount restore
    }, []);

    const engineInput: EngineInput = useMemo(
        () => ({ weeksOnCycle, weeklyDoseMg, bodyFatPct, compoundType, aiProtocol }),
        [weeksOnCycle, weeklyDoseMg, bodyFatPct, compoundType, aiProtocol],
    );

    // Live real-time calculation (pure engine, recomputed on every change).
    const result = useMemo(() => calculateAromatizationRisk(engineInput), [engineInput]);

    const e2UnitLabel = unitSystem === 'metric' ? 'pg/mL' : 'pmol/L';
    const formatE2 = (pgml: number) =>
        unitSystem === 'metric'
            ? `${pgml.toFixed(0)} pg/mL`
            : `${(pgml * PMOL_PER_PGML).toFixed(0)} pmol/L`;
    const chartData = useMemo(
        () =>
            result.timeline.map((p) => ({
                week: p.weekNumber,
                e2: unitSystem === 'metric' ? p.estradiolPgml : Math.round(p.estradiolPgml * PMOL_PER_PGML),
                phase: p.phase,
            })),
        [result, unitSystem],
    );

    // ── Auto-draft (spec §5.2): 1500 ms inactivity → local cache only ──
    const lastSavedAtRef = useRef<number>(Date.now());
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!shouldAutoDraft(lastSavedAtRef.current, Date.now())) return;
            const saved = saveDraft<AromatizationDraftInputs>(
                TOOL_SLUG,
                { weeksOnCycle, weeklyDoseMg, bodyFatPct, compoundType, aiProtocol },
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
    }, [weeksOnCycle, weeklyDoseMg, bodyFatPct, compoundType, aiProtocol, locale, isRtl]);

    // ── Dashboard commit (spec §5.3): submitted_snapshot → projection ──
    const handleSaveToDashboard = useCallback(async () => {
        const parsed = tryParseAromatizationRiskInput({ weeksOnCycle, weeklyDoseMg, bodyFatPct, compoundType, aiProtocol });
        if (!parsed.ok) {
            setValidationError(parsed.error.issues[0]?.message ?? (isRtl ? 'مدخلات غير صالحة' : 'Invalid inputs'));
            return;
        }
        setValidationError(null);
        setIsSaving(true);
        try {
            const nowIso = new Date().toISOString();
            const output = buildAromatizationRiskOutput(parsed.data, {
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
    }, [weeksOnCycle, weeklyDoseMg, bodyFatPct, compoundType, aiProtocol, locale, unitSystem, isRtl]);

    const milestoneWeeks = useMemo(() => {
        const set = new Set<number>([1, weeksOnCycle, weeksOnCycle + 1]);
        return Array.from(set).sort((a, b) => a - b);
    }, [weeksOnCycle]);

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl ${isRtl ? 'rtl' : 'ltr'}`}
        >
            {/* Header & Settings */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                <div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-lime-500/10 text-lime-400 border border-lime-500/30 rounded-full">
                        Aromatization Risk v1.0 · Tool #002
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
                        {isRtl ? tool.titleAr : tool.titleEn}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">
                        {isRtl
                            ? 'منحنى حسابي افتراضي مبني على ثوابت غير متحقق منها سريرياً. لا يحسب المخاطر ولا يوصي بالأدوية أو تعديل الجرعات.'
                            : 'Illustrative arithmetic curve using constants that are not clinically validated. It does not assess risk or recommend medication or dose changes.'}
                    </p>
                    <p role="note" className="mt-3 rounded border border-amber-500/50 bg-amber-950/40 p-3 text-xs text-amber-100">
                        {isRtl
                            ? 'قيم E2 المعروضة مخرجات نموذج غير متحقق منها وليست قياسات مخبرية أو توقعات سريرية. لم تتوفر أدلة موثقة لهذه الثوابت؛ لا تستخدم النتائج لاتخاذ قرار صحي أو دوائي.'
                            : 'Displayed E2 values are unvalidated model outputs, not laboratory measurements or clinical predictions. Verified evidence for these constants is unavailable; do not use these results for health or medication decisions.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Inputs */}
                <div className="lg:col-span-5 bg-slate-900/60 p-4 md:p-5 rounded-xl border border-slate-800/80 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2">
                        {isRtl ? 'إعدادات الدورة والمركب' : 'Cycle & Compound Setup'}
                    </h2>

                    <div>
                        <label htmlFor="ar-weeks" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? `مدة الدورة: ${weeksOnCycle} أسبوع` : `Cycle Duration: ${weeksOnCycle} weeks`}
                        </label>
                        <input data-r6-slider="true"
                            id="ar-weeks"
                            type="range"
                            min={4}
                            max={24}
                            step={1}
                            value={weeksOnCycle}
                            onChange={(e) => setWeeksOnCycle(Number(e.target.value))}
                            className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div>
                        <label htmlFor="ar-dose" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl
                                ? `مدخل سيناريو افتراضي: ${weeklyDoseMg} ملغ/أسبوع (ليس توصية جرعة)`
                                : `Hypothetical scenario input: ${weeklyDoseMg} mg/week (not a dose recommendation)`}
                        </label>
                        <input data-r6-slider="true"
                            id="ar-dose"
                            type="range"
                            min={100}
                            max={2000}
                            step={50}
                            value={weeklyDoseMg}
                            onChange={(e) => setWeeklyDoseMg(Number(e.target.value))}
                            className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div>
                        <label htmlFor="ar-bf" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? `نسبة دهون الجسم: ${bodyFatPct}%` : `Body Fat: ${bodyFatPct}%`}
                        </label>
                        <input data-r6-slider="true"
                            id="ar-bf"
                            type="range"
                            min={6}
                            max={40}
                            step={1}
                            value={bodyFatPct}
                            onChange={(e) => setBodyFatPct(Number(e.target.value))}
                            className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div>
                        <label htmlFor="ar-compound" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? 'المركب الأساسي' : 'Primary Compound'}
                        </label>
                        <select
                            id="ar-compound"
                            value={compoundType}
                            onChange={(e) => setCompoundType(e.target.value as CompoundType)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                        >
                            {COMPOUND_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {isRtl ? o.ar : o.en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="ar-ai" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? 'عامل الكبت الافتراضي في النموذج (ليس جرعة دواء)' : 'Hypothetical model suppression factor (not a drug dose)'}
                        </label>
                        <select
                            id="ar-ai"
                            value={aiProtocol}
                            onChange={(e) => setAiProtocol(e.target.value as AiProtocol)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                        >
                            {AI_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {isRtl ? o.ar : o.en}
                                </option>
                            ))}
                        </select>
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
                            {isRtl ? 'منحنى الاستراديول الزمني' : 'Estradiol (E2) Trajectory'}
                        </h2>
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#020617', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                                        formatter={(val: number | string) => {
                                            const n = typeof val === 'number' ? val : Number(val);
                                            return [formatE2(unitSystem === 'metric' ? n : n / PMOL_PER_PGML), isRtl ? 'الاستراديول' : 'E2'];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    <Area type="monotone" dataKey="e2" name={isRtl ? 'الاستراديول (E2)' : 'Estradiol (E2)'} stroke="#ec4899" fillOpacity={0.25} fill="#ec4899" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Telemetry cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'ذروة E2 المحسوبة بالنموذج' : 'Modelled peak E2'}</span>
                            <span className="text-base font-bold font-mono text-slate-200">
                                {formatE2(result.peakE2).split(' ')[0]}
                            </span>
                            <span className="text-[10px] text-slate-500 block">{e2UnitLabel}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'تقييم التثدي السريري' : 'Clinical gynecomastia risk'}</span>
                            <span className="text-sm font-bold text-slate-300">{isRtl ? 'غير متاح' : 'NOT ASSESSED'}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'تقييم المخاطر السريرية' : 'Clinical risk assessment'}</span>
                            <span className="text-sm font-bold text-slate-300">{isRtl ? 'غير متاح' : 'NOT ASSESSED'}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'معامل افتراضي' : 'Hypothetical model factor'}</span>
                            <span className="text-base font-bold text-cyan-400 font-mono">{Math.round(result.aiSuppressionFactor * 100)}%</span>
                            <span className="text-[10px] text-slate-500 block">{isRtl ? 'كبت' : 'suppression'}</span>
                        </div>
                    </div>

                    {/* Milestone phase stepper */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-lime-400" />
                            {isRtl ? 'معالم منحنى الاستراديول' : 'E2 Trajectory Milestones'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {milestoneWeeks.map((wk) => {
                                const note = result.timeline.find((p) => p.weekNumber === wk);
                                const phaseColor = note ? PHASE_COLORS[note.phase] ?? '#64748b' : '#64748b';
                                return (
                                    <div
                                        key={wk}
                                        className="flex-1 min-w-[130px] p-2.5 rounded-lg border text-xs bg-slate-950 border-slate-800 text-slate-300"
                                        title={isRtl ? note?.milestoneNoteAr : note?.milestoneNoteEn}
                                    >
                                        <div className="font-bold flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: phaseColor }} />
                                            {isRtl ? `الأسبوع ${wk}` : `Week ${wk}`}
                                        </div>
                                        <div className="text-[10px] mt-1 line-clamp-2 text-slate-400">
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

            {/* Model limits */}
            <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="flex items-start gap-3">
                    <span className="text-lg"></span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {isRtl
                            ? 'المعادلات والثوابت الموروثة في هذه الأداة لم تُتحقق بمصدر علمي محدد في هذا المشروع. المنحنى يعرض نتيجة حسابية وفق الافتراضات المخفية في النموذج ولا يصف استجابة جسم شخص بعينه. لا يصدر تشخيصاً أو درجة خطورة أو توصية علاجية.'
                            : 'The inherited equations and constants in this tool have not been verified against a specific scientific source in this project. The curve is arithmetic under the model assumptions and does not describe an individual physiological response. No diagnosis, risk score, or treatment recommendation is produced.'}
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
