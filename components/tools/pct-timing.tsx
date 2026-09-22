'use client';

/**
 * components/tools/pct-timing.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #004 — Layer 5: PCT Timing & Compound Washout Engine
 *  (Tailwind + Recharts + AR/EN RTL + Metric/Imperial T units).
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
    ReferenceLine,
} from 'recharts';
import {
    calculatePctTiming,
    type EngineInput,
    type PctProtocol,
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

interface PctTimingDraftInputs {
    compoundHalfLifeDays: number;
    weeksOnCycle: number;
    clearanceThresholdPct: number;
    pctProtocol: PctProtocol;
}

const PCT_OPTIONS: Array<{ value: PctProtocol; ar: string; en: string }> = [
    { value: 'none', ar: 'بدون PCT (تعافٍ طبيعي)', en: 'No PCT (Natural Recovery)' },
    { value: 'standard', ar: 'بروتوكول قياسي (SERM)', en: 'Standard SERM PCT' },
    { value: 'aggressive_mrx', ar: 'منهجية Mr. X-Steroid المتقدمة', en: 'Mr. X-Steroid Advanced PCT' },
];

const PHASE_COLORS: Record<string, string> = {
    active_cycle: '#ef4444',
    washout: '#f59e0b',
    pct_active: '#a855f7',
    recovery: '#10b981',
};

export default function PctTimingToolComponent() {
    const tool = requireTool(TOOL_SLUG);
    const neighbors = getToolNeighbors(TOOL_SLUG);

    const [locale, setLocale] = useState<'ar' | 'en'>('ar');
    const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
    const [compoundHalfLifeDays, setCompoundHalfLifeDays] = useState<number>(5);
    const [weeksOnCycle, setWeeksOnCycle] = useState<number>(12);
    const [clearanceThresholdPct, setClearanceThresholdPct] = useState<number>(5);
    const [pctProtocol, setPctProtocol] = useState<PctProtocol>('standard');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const isRtl = locale === 'ar';

    // Draft restore (once, on mount) — corrupt/stale drafts are discarded safely.
    useEffect(() => {
        const draft = loadDraft<PctTimingDraftInputs>(TOOL_SLUG);
        if (!draft) return;
        const i = draft.inputs;
        if (typeof i.compoundHalfLifeDays === 'number') setCompoundHalfLifeDays(i.compoundHalfLifeDays);
        if (typeof i.weeksOnCycle === 'number') setWeeksOnCycle(i.weeksOnCycle);
        if (typeof i.clearanceThresholdPct === 'number') setClearanceThresholdPct(i.clearanceThresholdPct);
        if (i.pctProtocol === 'none' || i.pctProtocol === 'standard' || i.pctProtocol === 'aggressive_mrx')
            setPctProtocol(i.pctProtocol);
        setSaveStatus(locale === 'ar' ? 'تم استعادة المسودة المحفوظة محلياً' : 'Local draft restored');
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run-once mount restore
    }, []);

    const engineInput: EngineInput = useMemo(
        () => ({ compoundHalfLifeDays, weeksOnCycle, clearanceThresholdPct, pctProtocol }),
        [compoundHalfLifeDays, weeksOnCycle, clearanceThresholdPct, pctProtocol],
    );

    // Live real-time calculation (pure engine, recomputed on every change).
    const result = useMemo(() => calculatePctTiming(engineInput), [engineInput]);

    const chartData = useMemo(
        () =>
            result.timeline.map((p) => ({
                week: p.weekNumber,
                serum: p.serumConcentrationPct,
                endoTesto: p.endogenousTestosteronePct,
            })),
        [result],
    );

    // ── Auto-draft (spec §5.2): 1500 ms inactivity → local cache only ──
    const lastSavedAtRef = useRef<number>(Date.now());
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!shouldAutoDraft(lastSavedAtRef.current, Date.now())) return;
            const saved = saveDraft<PctTimingDraftInputs>(
                TOOL_SLUG,
                { compoundHalfLifeDays, weeksOnCycle, clearanceThresholdPct, pctProtocol },
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
    }, [compoundHalfLifeDays, weeksOnCycle, clearanceThresholdPct, pctProtocol, locale, isRtl]);

    // ── Dashboard commit (spec §5.3): submitted_snapshot → projection ──
    const handleSaveToDashboard = useCallback(async () => {
        const parsed = tryParsePctTimingInput({ compoundHalfLifeDays, weeksOnCycle, clearanceThresholdPct, pctProtocol });
        if (!parsed.ok) {
            setValidationError(parsed.error.issues[0]?.message ?? (isRtl ? 'مدخلات غير صالحة' : 'Invalid inputs'));
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
    }, [compoundHalfLifeDays, weeksOnCycle, clearanceThresholdPct, pctProtocol, locale, unitSystem, isRtl]);

    const testoUnitLabel = unitSystem === 'metric' ? 'ng/dL' : 'nmol/L';
    const formatTesto = (pct: number) =>
        unitSystem === 'metric'
            ? `${Math.round((pct / 100) * BASELINE_NGDL)} ng/dL`
            : `${(pct / 100 * BASELINE_NMOL).toFixed(1)} nmol/L`;

    const milestoneWeeks = useMemo(() => {
        const set = new Set<number>([1, weeksOnCycle, result.pctStartWeek]);
        if (result.pctDurationWeeks > 0) set.add(result.pctStartWeek + result.pctDurationWeeks);
        if (result.fullRecoveryWeek > 0) set.add(result.fullRecoveryWeek);
        return Array.from(set).sort((a, b) => a - b);
    }, [weeksOnCycle, result.pctStartWeek, result.pctDurationWeeks, result.fullRecoveryWeek]);

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl ${isRtl ? 'rtl' : 'ltr'}`}
        >
            {/* Header & Settings */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                <div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-lime-500/10 text-lime-400 border border-lime-500/30 rounded-full">
                        PCT Timing v1.0 · Tool #004
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
                        {isRtl ? tool.titleAr : tool.titleEn}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">
                        {isRtl
                            ? 'محرك توقيت تطهير المركبات وجدولة علاج ما بعد الدورة (PCT) وفق نصف العمر.'
                            : 'Compound washout engine and post-cycle therapy scheduling based on elimination half-life.'}
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
                        {unitSystem === 'metric' ? `Metric (${testoUnitLabel})` : `Imperial (${testoUnitLabel})`}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Inputs */}
                <div className="lg:col-span-5 bg-slate-900/60 p-4 md:p-5 rounded-xl border border-slate-800/80 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2">
                        {isRtl ? 'إعدادات المركبة والدورة' : 'Compound & Cycle Setup'}
                    </h2>

                    <div>
                        <label htmlFor="pt-hl" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? `نصف العمر: ${compoundHalfLifeDays} يوم` : `Half-Life: ${compoundHalfLifeDays} days`}
                        </label>
                        <input
                            id="pt-hl"
                            type="range"
                            min={0.5}
                            max={30}
                            step={0.5}
                            value={compoundHalfLifeDays}
                            onChange={(e) => setCompoundHalfLifeDays(Number(e.target.value))}
                            className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div>
                        <label htmlFor="pt-weeks" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? `مدة الدورة: ${weeksOnCycle} أسبوع` : `Cycle Duration: ${weeksOnCycle} weeks`}
                        </label>
                        <input
                            id="pt-weeks"
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
                        <label htmlFor="pt-thr" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? `عتبة التطهير: ${clearanceThresholdPct}%` : `Clearance Threshold: ${clearanceThresholdPct}%`}
                        </label>
                        <input
                            id="pt-thr"
                            type="range"
                            min={1}
                            max={20}
                            step={1}
                            value={clearanceThresholdPct}
                            onChange={(e) => setClearanceThresholdPct(Number(e.target.value))}
                            className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div>
                        <label htmlFor="pt-pct" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? 'بروتوكول PCT' : 'PCT Protocol'}
                        </label>
                        <select
                            id="pt-pct"
                            value={pctProtocol}
                            onChange={(e) => setPctProtocol(e.target.value as PctProtocol)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                        >
                            {PCT_OPTIONS.map((o) => (
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
                            {isRtl ? 'منحنى التطهير وارتجاف المحور' : 'Washout & Axis Rebound Curve'}
                        </h2>
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#020617', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                                        formatter={(val: number | string, name: string) => {
                                            const n = typeof val === 'number' ? val : Number(val);
                                            if (name === 'endoTesto') {
                                                return [`${n.toFixed(1)}% · ${formatTesto(n)}`, isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T'];
                                            }
                                            return [`${n.toFixed(1)}%`, isRtl ? 'تركيز المركب' : 'Serum Compound'];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    <ReferenceLine y={clearanceThresholdPct} stroke="#f59e0b" strokeDasharray="6 4" label={{ value: isRtl ? 'عتبة التطهير' : 'Threshold', fontSize: 9, fill: '#f59e0b' }} />
                                    <ReferenceLine x={result.pctStartWeek} stroke="#a855f7" strokeDasharray="4 4" label={{ value: 'PCT', fontSize: 9, fill: '#a855f7' }} />
                                    <Line type="monotone" dataKey="serum" name={isRtl ? 'تركيز المركب' : 'Serum Compound'} stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                                    <Line type="monotone" dataKey="endoTesto" name={isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T'} stroke="#10b981" strokeWidth={2.5} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Telemetry cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'أسابيع التطهير' : 'Washout Weeks'}</span>
                            <span className="text-base font-bold text-amber-400 font-mono">{result.washoutWeeks}</span>
                            <span className="text-[10px] text-slate-500 block">{isRtl ? 'حتى PCT' : 'to PCT'}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'بدء PCT' : 'PCT Start'}</span>
                            <span className="text-base font-bold text-purple-400 font-mono">{isRtl ? `أسبوع ${result.pctStartWeek}` : `Wk ${result.pctStartWeek}`}</span>
                            <span className="text-[10px] text-slate-500 block">{result.pctDurationWeeks > 0 ? `${result.pctDurationWeeks}w` : (isRtl ? 'بدون' : 'none')}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'استعادة ≥٩٠٪' : 'T ≥ 90%'}</span>
                            <span className="text-base font-bold text-lime-400 font-mono">
                                {result.fullRecoveryWeek > 0 ? (isRtl ? `أسبوع ${result.fullRecoveryWeek}` : `Wk ${result.fullRecoveryWeek}`) : '—'}
                            </span>
                            <span className="text-[10px] text-slate-500 block">{result.fullRecoveryWeek > 0 ? (isRtl ? 'تم' : 'recovered') : (isRtl ? 'لم يصل' : 'at-risk')}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'T النهائي' : 'Final T'}</span>
                            <span className="text-base font-bold text-cyan-400 font-mono">{result.finalTestosteronePct}%</span>
                            <span className="text-[10px] text-slate-500 block">{isRtl ? 'من الأساسي' : 'of baseline'}</span>
                        </div>
                    </div>

                    {/* Milestone phase stepper */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-lime-400" />
                            {isRtl ? 'معالم التطهير والتعافي' : 'Washout & Recovery Milestones'}
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

            {/* Book context / disclaimer */}
            <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="flex items-start gap-3">
                    <span className="text-lg"></span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {isRtl
                            ? 'وفقاً لكتاب Mr. X-Steroid (الفصل السادس)، يجب اكتمال تطهير المركب (انخفاض التركيز تحت العتبة) قبل تنشيط محفزات SERMs و hCG لتفادي التثبيط العكسي لمستقبلات النخامية. يحسب هذا المحرك نافذة التطهير من نصف العمر الأُسّي ويجدول PCT تبعاً لذلك. النتائج نموذج تعليمي وليست استشارة طبية.'
                            : 'Per Mr. X-Steroid Book (Ch. 6), compound washout (serum below threshold) must complete before SERM/hCG activation to avoid reverse-suppressing pituitary receptors. This engine derives the washout window from exponential half-life and schedules PCT accordingly. Results are an educational model, not medical advice.'}
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
