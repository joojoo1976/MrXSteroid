'use client';

/**
 * components/tools/hpta-recovery.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #003 — Layer 5: HPTA Suppression & Recovery Time-Course Modeler
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
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from 'recharts';
import {
    calculateHptaRecovery,
    type CompoundPotency,
    type EngineInput,
    type PctProtocol,
} from '@/lib/tools/engines/hpta-recovery';
import { buildHptaRecoveryOutput } from '@/lib/tools/adapters/hpta-recovery';
import {
    AUTO_DRAFT_DEBOUNCE_MS,
    clearDraft,
    commitDashboardSnapshot,
    loadDraft,
    saveDraft,
    shouldAutoDraft,
} from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { tryParseHptaRecoveryInput } from '@/lib/tools/schemas/hpta-recovery';

const TOOL_SLUG = 'hpta-recovery';

/** nmol/L per ng/dL conversion (Testosterone). */
const NMOL_PER_NGDL = 0.0347;
const BASELINE_NGDL = 600;
const BASELINE_NMOL = BASELINE_NGDL * NMOL_PER_NGDL; // ≈ 20.8

interface HptaDraftInputs {
    weeksOnCycle: number;
    compoundPotency: CompoundPotency;
    pctProtocol: PctProtocol;
}

const POTENCY_OPTIONS: Array<{ value: CompoundPotency; ar: string; en: string }> = [
    { value: 'mild', ar: 'لطيفة (Anavar / Primobolan)', en: 'Mild (Anavar / Primobolan)' },
    { value: 'moderate', ar: 'متوسطة (Testosterone Solo)', en: 'Moderate (Testosterone Solo)' },
    { value: 'heavy', ar: 'قوية (Deca / Equipoise)', en: 'Heavy (Deca / Equipoise)' },
    { value: 'extreme', ar: 'شديدة (Trenbolone Stack)', en: 'Extreme (Trenbolone Stack)' },
];

const PCT_OPTIONS: Array<{ value: PctProtocol; ar: string; en: string }> = [
    { value: 'none', ar: 'بدون تنظيف (تعافٍ بطيء)', en: 'No PCT (Cold Turkey)' },
    { value: 'standard', ar: 'بروتوكول قياسي (SERM)', en: 'Standard SERM PCT' },
    { value: 'aggressive_mrx', ar: 'منهجية Mr. X-Steroid المتقدمة', en: 'Mr. X-Steroid Advanced PCT' },
];

const PHASE_COLORS: Record<string, string> = {
    cycle: '#ef4444',
    washout: '#f59e0b',
    recovery: '#10b981',
};

export default function HptaRecoveryToolComponent() {
    const tool = requireTool(TOOL_SLUG);
    const neighbors = getToolNeighbors(TOOL_SLUG);

    const [locale, setLocale] = useState<'ar' | 'en'>('ar');
    const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
    const [weeksOnCycle, setWeeksOnCycle] = useState<number>(12);
    const [compoundPotency, setCompoundPotency] = useState<CompoundPotency>('heavy');
    const [pctProtocol, setPctProtocol] = useState<PctProtocol>('aggressive_mrx');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const isRtl = locale === 'ar';

    // Draft restore (once, on mount) — corrupt/stale drafts are discarded safely.
    useEffect(() => {
        const draft = loadDraft<HptaDraftInputs>(TOOL_SLUG);
        if (!draft) return;
        const i = draft.inputs;
        if (typeof i.weeksOnCycle === 'number') setWeeksOnCycle(i.weeksOnCycle);
        if (i.compoundPotency === 'mild' || i.compoundPotency === 'moderate' || i.compoundPotency === 'heavy' || i.compoundPotency === 'extreme')
            setCompoundPotency(i.compoundPotency);
        if (i.pctProtocol === 'none' || i.pctProtocol === 'standard' || i.pctProtocol === 'aggressive_mrx')
            setPctProtocol(i.pctProtocol);
        setSaveStatus(locale === 'ar' ? 'تم استعادة المسودة المحفوظة محلياً' : 'Local draft restored');
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run-once mount restore
    }, []);

    const engineInput: EngineInput = useMemo(
        () => ({ weeksOnCycle, compoundPotency, pctProtocol }),
        [weeksOnCycle, compoundPotency, pctProtocol],
    );

    // Live real-time calculation (pure engine, recomputed on every change).
    const result = useMemo(() => calculateHptaRecovery(engineInput), [engineInput]);

    const chartData = useMemo(
        () =>
            result.timeline.map((p) => ({
                week: p.weekNumber,
                suppression: p.suppressionPct,
                endoTesto: p.endogenousTestosteronePct,
                lh: p.lhPct,
            })),
        [result],
    );

    // ── Auto-draft (spec §5.2): 1500 ms inactivity → local cache only ──
    const lastSavedAtRef = useRef<number>(Date.now());
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!shouldAutoDraft(lastSavedAtRef.current, Date.now())) return;
            const saved = saveDraft<HptaDraftInputs>(
                TOOL_SLUG,
                { weeksOnCycle, compoundPotency, pctProtocol },
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
    }, [weeksOnCycle, compoundPotency, pctProtocol, locale, isRtl]);

    // ── Dashboard commit (spec §5.3): submitted_snapshot → projection ──
    const handleSaveToDashboard = useCallback(async () => {
        const parsed = tryParseHptaRecoveryInput({ weeksOnCycle, compoundPotency, pctProtocol });
        if (!parsed.ok) {
            setValidationError(parsed.error.issues[0]?.message ?? (isRtl ? 'مدخلات غير صالحة' : 'Invalid inputs'));
            return;
        }
        setValidationError(null);
        setIsSaving(true);
        try {
            const nowIso = new Date().toISOString();
            const output = buildHptaRecoveryOutput(parsed.data, {
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
    }, [weeksOnCycle, compoundPotency, pctProtocol, locale, unitSystem, isRtl]);

    const testoUnitLabel = unitSystem === 'metric' ? 'ng/dL' : 'nmol/L';
    const formatTesto = (pct: number) =>
        unitSystem === 'metric'
            ? `${Math.round((pct / 100) * BASELINE_NGDL)} ng/dL`
            : `${(pct / 100 * BASELINE_NMOL).toFixed(1)} nmol/L`;

    const milestoneWeeks = useMemo(() => {
        const set = new Set<number>([1, weeksOnCycle, weeksOnCycle + result.washoutWeeks]);
        if (result.recoveryCompleteWeek > 0) set.add(result.recoveryCompleteWeek);
        return Array.from(set).sort((a, b) => a - b);
    }, [weeksOnCycle, result.washoutWeeks, result.recoveryCompleteWeek]);

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl ${isRtl ? 'rtl' : 'ltr'}`}
        >
            {/* Header & Settings */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                <div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-lime-500/10 text-lime-400 border border-lime-500/30 rounded-full">
                        HPTA Recovery v1.0 · Tool #003
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
                        {isRtl ? tool.titleAr : tool.titleEn}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">
                        {isRtl
                            ? 'محاكي التثبيط المحوري واستعادة نشاط HPTA الزمني بعد الكورسات الهرمونية.'
                            : 'Time-course modeler for HPTA suppression and endogenous-T rebound after anabolic cycles.'}
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
                        {isRtl ? 'إعدادات الدورة والتعافي' : 'Cycle & Recovery Setup'}
                    </h2>

                    <div>
                        <label htmlFor="hp-weeks" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? `مدة الدورة: ${weeksOnCycle} أسبوع` : `Cycle Duration: ${weeksOnCycle} weeks`}
                        </label>
                        <input
                            id="hp-weeks"
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
                        <label htmlFor="hp-potency" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? 'قوة وقدرة التثبيط للمركبات' : 'Compound Suppression Potency'}
                        </label>
                        <select
                            id="hp-potency"
                            value={compoundPotency}
                            onChange={(e) => setCompoundPotency(e.target.value as CompoundPotency)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                        >
                            {POTENCY_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {isRtl ? o.ar : o.en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="hp-pct" className="block text-xs font-medium text-slate-400 mb-1">
                            {isRtl ? 'بروتوكول التنظيف والتعافي (PCT)' : 'PCT Protocol Strategy'}
                        </label>
                        <select
                            id="hp-pct"
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
                            {isRtl ? 'منحنى التعافي والتثبيط الزمني' : 'HPTA Suppression vs Recovery Curve'}
                        </h2>
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#020617', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                                        formatter={(val: number | string, name: string) => {
                                            const n = typeof val === 'number' ? val : Number(val);
                                            if (name === 'endoTesto' || name === 'lh') {
                                                return [`${n.toFixed(1)}% · ${formatTesto(n)}`, name === 'endoTesto' ? (isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T') : (isRtl ? 'هرمون LH' : 'LH')];
                                            }
                                            return [`${n.toFixed(1)}%`, isRtl ? 'نسبة التثبيط' : 'Suppression'];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    <Area type="monotone" dataKey="suppression" name={isRtl ? 'نسبة التثبيط' : 'Suppression'} stroke="#ef4444" fillOpacity={0.15} fill="#ef4444" strokeWidth={2.5} />
                                    <Area type="monotone" dataKey="endoTesto" name={isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T'} stroke="#10b981" fillOpacity={0.25} fill="#10b981" strokeWidth={2} />
                                    <Area type="monotone" dataKey="lh" name={isRtl ? 'هرمون LH' : 'LH'} stroke="#06b6d4" fillOpacity={0.1} fill="#06b6d4" strokeWidth={1.5} strokeDasharray="4 2" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Telemetry cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'ذروة التثبيط' : 'Peak Suppression'}</span>
                            <span className="text-base font-bold text-red-400 font-mono">{result.peakSuppressionPct}%</span>
                            <span className="text-[10px] text-slate-500 block">{isRtl ? 'من المحور' : 'of axis'}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'مدة التطهير' : 'Washout Weeks'}</span>
                            <span className="text-base font-bold text-amber-400 font-mono">{result.washoutWeeks}</span>
                            <span className="text-[10px] text-slate-500 block">{isRtl ? 'أسبوع' : 'weeks'}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'استعادة ≥٩٠٪' : 'T ≥ 90%'}</span>
                            <span className="text-base font-bold text-lime-400 font-mono">
                                {result.recoveryCompleteWeek > 0 ? (isRtl ? `أسبوع ${result.recoveryCompleteWeek}` : `Wk ${result.recoveryCompleteWeek}`) : '—'}
                            </span>
                            <span className="text-[10px] text-slate-500 block">{result.recoveryCompleteWeek > 0 ? (isRtl ? 'تم التعافي' : 'recovered') : (isRtl ? 'لم يصل' : 'at-risk')}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'التسريع PCT' : 'PCT Boost'}</span>
                            <span className="text-base font-bold text-cyan-400 font-mono">{result.pctProtocolBoost}×</span>
                            <span className="text-[10px] text-slate-500 block">{isRtl ? 'المعامل' : 'factor'}</span>
                        </div>
                    </div>

                    {/* Milestone phase stepper */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-lime-400" />
                            {isRtl ? 'المعالم الزمنية للمحور' : 'Axis Milestones'}
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
                            ? 'وفقاً لمنهجية كتاب Mr. X-Steroid (الفصل السادس)، يعتمد التثبيط المحوري على طول السلسلة الكربونية للإستر وشغف الارتباط بمستقبلات الأندروجين. تضمن هذه الأداة اكتمال التطهير قبل تشغيل محفزات SERMs و hCG لتفادي التثبيط العكسي لمستقبلات النخامية. النتائج نموذج تعليمي وليست استشارة طبية.'
                            : 'Per Mr. X-Steroid Book (Ch. 6), axis suppression depends on ester carbon-chain length and AR binding affinity. This model ensures full compound washout before SERM/hCG activation to avoid reverse suppression of pituitary receptors. Results are an educational model, not medical advice.'}
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
