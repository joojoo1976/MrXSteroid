'use client';

/**
 * components/tools/multi-ester-pharmacokinetics.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #001 — Layer 5: PharmaSim™ live UI (Tailwind + Recharts + AR/EN RTL).
 * ═══════════════════════════════════════════════════════════════════════════
 * State protocol (spec §5):
 *   - live input state → instant local state (never touches the DB),
 *   - 1500 ms inactivity → versioned local draft via the shared adapter,
 *   - "Save to Bio-Dashboard" → `submitted_snapshot` + `dashboard_projection`
 *     through `POST /api/tools/logs` (Bearer-authenticated).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import {
    calculateMultiEsterPK,
    ESTER_DATABASE,
    type EsterType,
    type InjectionEvent,
} from '@/lib/tools/engines/multi-ester-pharmacokinetics';
import {
    buildMultiEsterPKOutput,
} from '@/lib/tools/adapters/multi-ester-pharmacokinetics';
import {
    AUTO_DRAFT_DEBOUNCE_MS,
    clearDraft,
    commitDashboardSnapshot,
    loadDraft,
    saveDraft,
    shouldAutoDraft,
} from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { tryParseMultiEsterInput } from '@/lib/tools/schemas/multi-ester-pharmacokinetics';

const TOOL_SLUG = 'multi-ester-pharmacokinetics';

type Field = 'day' | 'doseMg' | 'ester';
type FieldValue = number | EsterType;

const LB_PER_KG = 0.45359237;

export default function MultiEsterPKToolComponent() {
    const tool = requireTool(TOOL_SLUG);
    const neighbors = getToolNeighbors(TOOL_SLUG);

    const [locale, setLocale] = useState<'ar' | 'en'>('ar');
    const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
    const [bodyWeightInput, setBodyWeightInput] = useState<number>(85); // kg or lbs
    const [simulationDays, setSimulationDays] = useState<number>(60);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const [injections, setInjections] = useState<InjectionEvent[]>([
        { id: '1', day: 0, doseMg: 250, ester: 'enanthate' },
        { id: '2', day: 7, doseMg: 250, ester: 'enanthate' },
        { id: '3', day: 14, doseMg: 250, ester: 'enanthate' },
        { id: '4', day: 21, doseMg: 250, ester: 'enanthate' },
    ]);

    const isRtl = locale === 'ar';

    // Draft restore (once, on mount) — corrupt/stale drafts are discarded safely.
    // `unitSystem` is intentionally excluded: drafts store the raw display value
    // in the unit system active at save time, so re-adopting the stored system
    // could reinterpret the current display. Always mounting metric is the safe
    // default; cross-system draft migration is a later, explicit feature.
    useEffect(() => {
        const draft = loadDraft<{ bodyWeightInput: number; simulationDays: number; injections: InjectionEvent[] }>(TOOL_SLUG);
        if (!draft) return;
        if (typeof draft.inputs.bodyWeightInput === 'number') setBodyWeightInput(draft.inputs.bodyWeightInput);
        if (typeof draft.inputs.simulationDays === 'number') setSimulationDays(draft.inputs.simulationDays);
        if (Array.isArray(draft.inputs.injections) && draft.inputs.injections.length > 0) {
            setInjections(draft.inputs.injections);
        }
        setSaveStatus(locale === 'ar' ? 'تم استعادة المسودة المحفوظة محلياً' : 'Local draft restored');
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run-once mount restore; see rationale above
    }, []);

    // Convert display body weight to the canonical kg representation.
    const canonicalWeightKg = useMemo(
        () => (unitSystem === 'metric' ? bodyWeightInput : bodyWeightInput * LB_PER_KG),
        [bodyWeightInput, unitSystem],
    );

    // Live real-time calculation (pure engine, recomputed on every keystroke).
    const pkResult = useMemo(() => {
        return calculateMultiEsterPK({
            bodyWeightKg: canonicalWeightKg,
            simulationDays,
            injections,
        });
    }, [canonicalWeightKg, simulationDays, injections]);

    // ── Auto-draft (spec §5.2): 1500 ms inactivity → local cache only ──
    const lastSavedAtRef = useRef<number>(Date.now());
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!shouldAutoDraft(lastSavedAtRef.current, Date.now())) return;
            const saved = saveDraft(TOOL_SLUG, { bodyWeightInput, simulationDays, injections }, {
                locale,
                unitSystem,
                savedAt: new Date().toISOString(),
            });
            lastSavedAtRef.current = Date.now();
            setSaveStatus(saved
                ? (isRtl ? 'تم حفظ المسودة محلياً تلقائياً' : 'Draft auto-saved locally')
                : (isRtl ? 'تعذّر حفظ المسودة محلياً' : 'Local draft unavailable'));
        }, AUTO_DRAFT_DEBOUNCE_MS);
        return () => clearTimeout(timer);
        // NOTE: `unitSystem` is a REAL dependency deliberately excluded from the
        // re-arm key (see the mount-restore rationale above): the draft stores the
        // raw display value in the system active at save time, and the engine
        // consumes the weight through a live `useMemo` conversion, so re-arming on
        // a unit flip would double-convert the restored display number.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional, documented above
    }, [injections, bodyWeightInput, simulationDays, locale, isRtl]);

    const addInjection = useCallback(() => {
        setInjections((current) => {
            const lastInj = current[current.length - 1];
            const newDay = lastInj ? lastInj.day + 7 : 0;
            return [
                ...current,
                { id: `inj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, day: newDay, doseMg: 250, ester: 'enanthate' as EsterType },
            ];
        });
    }, []);

    const removeInjection = useCallback((id: string) => {
        setInjections((current) => (current.length <= 1 ? current : current.filter((i) => i.id !== id)));
    }, []);

    const updateInjection = useCallback((id: string, field: Field, value: FieldValue) => {
        setInjections((current) => current.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    }, []);

    // ── Dashboard commit (spec §5.3): submitted_snapshot → projection ──
    const handleSaveToDashboard = async () => {
        const parsed = tryParseMultiEsterInput({ bodyWeightKg: canonicalWeightKg, simulationDays, injections });
        if (!parsed.ok) {
            setValidationError(parsed.error.issues[0]?.message ?? (isRtl ? 'مدخلات غير صالحة' : 'Invalid inputs'));
            return;
        }
        setValidationError(null);
        setIsSaving(true);
        try {
            const nowIso = new Date().toISOString();
            const output = buildMultiEsterPKOutput(parsed.data, {
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

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl ${isRtl ? 'rtl' : 'ltr'}`}
        >
            {/* Top Header & Settings Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                <div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-lime-500/10 text-lime-400 border border-lime-500/30 rounded-full">
                        PharmaSim™ Engine v3.2
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
                        {isRtl ? tool.titleAr : tool.titleEn}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">
                        {isRtl
                            ? 'نموذج محاكاة رياضياتي لمستويات الهرمون بمصل الدم مع التحليل ثنائي الطور (معادلة باتمان).'
                            : 'Two-compartment Bateman equation pharmacokinetic curve simulation for complex cycles.'}
                    </p>
                </div>

                {/* Global Controls */}
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
                {/* Left Column: Schedule Setup */}
                <div className="lg:col-span-5 bg-slate-900/60 p-4 md:p-5 rounded-xl border border-slate-800/80 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2">
                        {isRtl ? 'إعدادات البروتوكول والجدولة' : 'Protocol & Schedule Setup'}
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="pk-body-weight" className="block text-xs font-medium text-slate-400 mb-1">
                                {isRtl ? `وزن الجسم (${weightUnitLabel})` : `Body Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`}
                            </label>
                            <input
                                id="pk-body-weight"
                                type="number"
                                min={unitSystem === 'metric' ? 30 : 66}
                                max={unitSystem === 'metric' ? 250 : 550}
                                value={bodyWeightInput}
                                onChange={(e) => setBodyWeightInput(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="pk-sim-days" className="block text-xs font-medium text-slate-400 mb-1">
                                {isRtl ? 'مدة المحاكاة (أيام)' : 'Simulation Scope (Days)'}
                            </label>
                            <input
                                id="pk-sim-days"
                                type="number"
                                min={7}
                                max={180}
                                value={simulationDays}
                                onChange={(e) => setSimulationDays(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
                            />
                        </div>
                    </div>

                    {validationError && (
                        <p role="alert" className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                            {validationError}
                        </p>
                    )}

                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-semibold text-slate-300">
                            {isRtl ? 'جدول الحقن المسجل:' : 'Scheduled Injections:'}
                        </span>
                        <button
                            type="button"
                            onClick={addInjection}
                            className="px-2.5 py-1 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-md transition"
                        >
                            {isRtl ? '+ إضافة حقنة' : '+ Add Injection'}
                        </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {injections.map((inj, index) => (
                            <div key={inj.id} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                                <span className="text-slate-500 font-mono w-5">#{index + 1}</span>
                                <div className="w-16">
                                    <label htmlFor={`pk-day-${inj.id}`} className="block text-[10px] text-slate-500">{isRtl ? 'اليوم' : 'Day'}</label>
                                    <input
                                        id={`pk-day-${inj.id}`}
                                        type="number"
                                        min={0}
                                        max={365}
                                        value={inj.day}
                                        onChange={(e) => updateInjection(inj.id, 'day', Number(e.target.value))}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label htmlFor={`pk-ester-${inj.id}`} className="block text-[10px] text-slate-500">{isRtl ? 'الإستر' : 'Ester'}</label>
                                    <select
                                        id={`pk-ester-${inj.id}`}
                                        value={inj.ester}
                                        onChange={(e) => updateInjection(inj.id, 'ester', e.target.value as EsterType)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white"
                                    >
                                        {(Object.entries(ESTER_DATABASE) as Array<[EsterType, typeof ESTER_DATABASE[EsterType]]>).map(([key, item]) => (
                                            <option key={key} value={key}>
                                                {isRtl ? item.nameAr : item.nameEn}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-20">
                                    <label htmlFor={`pk-dose-${inj.id}`} className="block text-[10px] text-slate-500">{isRtl ? 'الجرعة (mg)' : 'Dose (mg)'}</label>
                                    <input
                                        id={`pk-dose-${inj.id}`}
                                        type="number"
                                        min={1}
                                        max={2000}
                                        value={inj.doseMg}
                                        onChange={(e) => updateInjection(inj.id, 'doseMg', Number(e.target.value))}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeInjection(inj.id)}
                                    disabled={injections.length <= 1}
                                    className="text-red-400 hover:text-red-300 p-1 mt-3 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title={isRtl ? 'إزالة' : 'Remove'}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Live Chart & Telemetry Readouts */}
                <div className="lg:col-span-7 bg-slate-900/60 p-4 md:p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2 mb-4">
                            {isRtl ? 'منحنى التركيز والتراكم الزمني بمصل الدم (ng/dL)' : 'Serum Concentration Kinetics (ng/dL)'}
                        </h2>

                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={pkResult.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#020617', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="concentrationNgl"
                                        name={isRtl ? 'تركيز المصل (ng/dL)' : 'Serum Concentration (ng/dL)'}
                                        stroke="#84cc16"
                                        strokeWidth={2.5}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="accumulatedEsterMg"
                                        name={isRtl ? 'مخزون النسيج (mg)' : 'Depot Active Ester (mg)'}
                                        stroke="#06b6d4"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Telemetry Indicator Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'أعلى ذروة (Peak)' : 'Peak Concentration'}</span>
                            <span className="text-base font-bold text-lime-400 font-mono">{pkResult.peakConcentrationNgDl}</span>
                            <span className="text-[10px] text-slate-500 block">ng/dL</span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'أدنى قاع (Trough)' : 'Trough Concentration'}</span>
                            <span className="text-base font-bold text-cyan-400 font-mono">{pkResult.troughConcentrationNgDl}</span>
                            <span className="text-[10px] text-slate-500 block">ng/dL</span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'نسبة التذبذب' : 'Fluctuation Ratio'}</span>
                            <span className="text-base font-bold text-amber-400 font-mono">{pkResult.peakToTroughRatio}x</span>
                            <span className="text-[10px] text-slate-500 block">Peak/Trough</span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'الحالة المستقرة' : 'Steady State'}</span>
                            <span className="text-base font-bold text-purple-400 font-mono">{isRtl ? `اليوم ${pkResult.estimatedSteadyStateDay}` : `Day ${pkResult.estimatedSteadyStateDay}`}</span>
                            <span className="text-[10px] text-slate-500 block">Estimated</span>
                        </div>
                    </div>

                    {/* Save Action Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center pt-3 border-t border-slate-800 gap-3">
                        <span className="text-xs text-slate-500 font-mono">{saveStatus}</span>
                        <button
                            type="button"
                            onClick={handleSaveToDashboard}
                            disabled={isSaving}
                            className="w-full md:w-auto px-5 py-2 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-lg transition shadow-lg shadow-lime-500/10 disabled:opacity-50"
                        >
                            {isSaving
                                ? (isRtl ? 'جاري الحفظ...' : 'Saving...')
                                : (isRtl ? 'حفظ في لوحة القيادة الحيوية (Save Snapshot)' : 'Save to Bio-Dashboard')}
                        </button>
                    </div>
                </div>
            </div>

            {/* SEO Internal Link Graph Navigation (registry-driven, never hand-written) */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
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
