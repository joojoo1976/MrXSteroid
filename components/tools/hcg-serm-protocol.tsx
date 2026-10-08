'use client';

/**
 * components/tools/hcg-serm-protocol.tsx
 * ═════════════════════════════════════════════════════════════════════════════
 *  Tool #005 — Layer 5: Intelligent HCG & SERM Protocol Generator
 *  (Tailwind + AR/EN RTL + MeasurementToggle + i18n/hcg-serm-protocol.json).
 * ═════════════════════════════════════════════════════════════════════════════
 * Features:
 *   - Multilingual with real-time toggle: reads i18n/hcg-serm-protocol.json
 *   - Dual Measurement System Toggle: Metric (kg/cm) ↔ Imperial (lbs/in)
 *   - Full RTL/LTR dynamic styling with font-cairo
 *   - S-Score clinical suppression gauge
 *   - HCG Priming requirement calculation with 48h stop warning
 *   - Auto-switching SERM selector (ocular/gyno sensitivity guard)
 *   - 4-Phase Protocol Roadmap (HCG Priming -> Kickstart -> Stabilization -> Weaning)
 *   - Auto-drafting + Bio-Dashboard snapshot commit
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import i18nData from '@/i18n/hcg-serm-protocol.json';
import MeasurementToggle, {
    kgToLbs,
    lbsToKg,
    type MeasurementSystem,
} from './MeasurementToggle';
import {
    calculateHcgSermProtocol,
    COMPOUND_SUPPRESSION_CATALOG,
    SERM_AVAILABILITY_OPTIONS,
    TESTICULAR_STATUS_OPTIONS,
    type HcgSermEngineInput,
    type SermAvailability,
    type SideEffectProfile,
    type TesticularStatus,
} from '@/lib/tools/engines/hcg-serm-protocol';
import { buildHcgSermProtocolOutput } from '@/lib/tools/adapters/hcg-serm-protocol';
import {
    AUTO_DRAFT_DEBOUNCE_MS,
    clearDraft,
    commitDashboardSnapshot,
    loadDraft,
    saveDraft,
    shouldAutoDraft,
} from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { tryParseHcgSermEngineInput } from '@/lib/tools/schemas/hcg-serm-protocol';

const TOOL_SLUG = 'hcg-serm-protocol';

interface HcgSermDraftInputs {
    compounds: Array<{ catalogId: string; weeklyDoseMg: number }>;
    cycleWeeks: number;
    testicularStatus: TesticularStatus;
    preferredSerm: SermAvailability;
    sideEffects: SideEffectProfile;
    bodyWeightKg?: number;
}

export default function HcgSermProtocolToolComponent() {
    const neighbors = getToolNeighbors(TOOL_SLUG);

    const [locale, setLocale] = useState<'ar' | 'en'>('ar');
    const [unitSystem, setUnitSystem] = useState<MeasurementSystem>('metric');

    // Input States
    const [compounds, setCompounds] = useState<Array<{ id: string; catalogId: string; weeklyDoseMg: number }>>([
        { id: 'cmp_1', catalogId: 'testosterone', weeklyDoseMg: 500 },
    ]);
    const [cycleWeeks, setCycleWeeks] = useState<number>(12);
    const [testicularStatus, setTesticularStatus] = useState<TesticularStatus>('normal');
    const [preferredSerm, setPreferredSerm] = useState<SermAvailability>('auto_select');
    const [sideEffects, setSideEffects] = useState<SideEffectProfile>({
        ocularSensitivity: false,
        moodSensitivity: false,
        jointPain: false,
        gynoHistory: false,
    });
    const [bodyWeightKg, setBodyWeightKg] = useState<number>(85);

    // Persistence & UI States
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const isRtl = locale === 'ar';
    const t = isRtl ? i18nData.ar : i18nData.en;

    // Draft restore on mount
    useEffect(() => {
        const draft = loadDraft<HcgSermDraftInputs>(TOOL_SLUG);
        if (!draft) return;
        const i = draft.inputs;
        if (typeof i.cycleWeeks === 'number') setCycleWeeks(i.cycleWeeks);
        if (typeof i.bodyWeightKg === 'number') setBodyWeightKg(i.bodyWeightKg);
        if (i.testicularStatus && TESTICULAR_STATUS_OPTIONS.includes(i.testicularStatus)) {
            setTesticularStatus(i.testicularStatus);
        }
        if (i.preferredSerm && SERM_AVAILABILITY_OPTIONS.includes(i.preferredSerm)) {
            setPreferredSerm(i.preferredSerm);
        }
        if (i.sideEffects) {
            setSideEffects({
                ocularSensitivity: Boolean(i.sideEffects.ocularSensitivity),
                moodSensitivity: Boolean(i.sideEffects.moodSensitivity),
                jointPain: Boolean(i.sideEffects.jointPain),
                gynoHistory: Boolean(i.sideEffects.gynoHistory),
            });
        }
        if (Array.isArray(i.compounds) && i.compounds.length > 0) {
            setCompounds(
                i.compounds.map((c, idx) => ({
                    id: `cmp_${idx + 1}`,
                    catalogId: c.catalogId,
                    weeklyDoseMg: c.weeklyDoseMg,
                })),
            );
        }
        setSaveStatus(isRtl ? 'تم استعادة مسودتك المحفوظة محلياً' : 'Local draft restored');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Compound handlers
    const handleAddCompound = () => {
        setCompounds((prev) => [
            ...prev,
            {
                id: `cmp_${Date.now()}`,
                catalogId: 'nandrolone',
                weeklyDoseMg: 300,
            },
        ]);
    };

    const handleRemoveCompound = (id: string) => {
        if (compounds.length <= 1) return;
        setCompounds((prev) => prev.filter((c) => c.id !== id));
    };

    const handleUpdateCompound = (id: string, updates: Partial<{ catalogId: string; weeklyDoseMg: number }>) => {
        setCompounds((prev) =>
            prev.map((c) => {
                if (c.id !== id) return c;
                const next = { ...c, ...updates };
                if (updates.catalogId) {
                    const preset = COMPOUND_SUPPRESSION_CATALOG.find((cat) => cat.id === updates.catalogId);
                    if (preset && !updates.weeklyDoseMg) next.weeklyDoseMg = preset.defaultDoseMg;
                }
                return next;
            }),
        );
    };

    // Engine computation
    const engineInput: HcgSermEngineInput = useMemo(
        () => ({
            compounds: compounds.map((c) => ({ catalogId: c.catalogId, weeklyDoseMg: c.weeklyDoseMg })),
            cycleWeeks,
            testicularStatus,
            preferredSerm,
            sideEffects,
            bodyWeightKg,
        }),
        [compounds, cycleWeeks, testicularStatus, preferredSerm, sideEffects, bodyWeightKg],
    );

    const result = useMemo(() => calculateHcgSermProtocol(engineInput), [engineInput]);

    // Auto-drafting
    const lastSavedAtRef = useRef<number>(Date.now());
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!shouldAutoDraft(lastSavedAtRef.current, Date.now())) return;
            const saved = saveDraft<HcgSermDraftInputs>(
                TOOL_SLUG,
                {
                    compounds: compounds.map((c) => ({ catalogId: c.catalogId, weeklyDoseMg: c.weeklyDoseMg })),
                    cycleWeeks,
                    testicularStatus,
                    preferredSerm,
                    sideEffects,
                    bodyWeightKg,
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
    }, [compounds, cycleWeeks, testicularStatus, preferredSerm, sideEffects, bodyWeightKg, locale, unitSystem, isRtl]);

    // Save to Bio-Dashboard
    const handleSaveToDashboard = useCallback(async () => {
        const parsed = tryParseHcgSermEngineInput(engineInput);
        if (!parsed.ok) {
            setValidationError(parsed.error.issues[0]?.message ?? (isRtl ? 'بيانات غير صالحة' : 'Invalid inputs'));
            return;
        }
        setValidationError(null);
        setIsSaving(true);
        try {
            const nowIso = new Date().toISOString();
            const output = buildHcgSermProtocolOutput(parsed.data, {
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
    }, [engineInput, locale, unitSystem, isRtl]);

    const weightDisplayNote = unitSystem === 'metric'
        ? t.weight_note_metric.replace('{weight}', String(bodyWeightKg))
        : t.weight_note_imperial.replace('{weight}', String(kgToLbs(bodyWeightKg)));

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl ${isRtl ? 'font-cairo' : ''}`}
        >
            {/* Header & Meta Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-5 mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-lime-500/20 text-lime-400 border border-lime-500/30 rounded-full">
                            Clinical HPTA Engine · Tool #005
                        </span>
                        {result.isAutoSwitched && (
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full animate-pulse">
                                🛡️ {isRtl ? 'تم تفعيل التبديل الوقائي للـ SERM' : 'Protective Auto-Switch Active'}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white mt-2">
                        {t.title}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
                        {t.subtitle}
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
                    <MeasurementToggle
                        unitSystem={unitSystem}
                        onChange={(sys) => setUnitSystem(sys)}
                        isRtl={isRtl}
                    />
                </div>
            </div>

            {/* Suppression Score & Overview Hero Card */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl -z-10" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t.s_score_label}
                        </span>
                        <div className={`text-3xl font-black mt-1 font-mono ${
                            result.severity === 'severe'
                                ? 'text-rose-400'
                                : result.severity === 'moderate'
                                  ? 'text-amber-400'
                                  : 'text-lime-400'
                        }`}>
                            {result.sScore}
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 block font-medium">
                            {isRtl ? result.severityLabelAr : result.severityLabelEn}
                        </span>
                    </div>

                    <div className="border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t.total_duration}
                        </span>
                        <div className="text-2xl font-black text-white mt-1">
                            {result.totalDurationWeeks} {isRtl ? 'أسابيع' : 'Weeks'}
                        </div>
                        <span className="text-xs text-lime-400 mt-0.5 block">
                            {weightDisplayNote}
                        </span>
                    </div>

                    <div className="border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t.selected_serm}
                        </span>
                        <div className="text-base font-black text-amber-300 mt-1 truncate" title={isRtl ? result.selectedSermNameAr : result.selectedSermNameEn}>
                            {isRtl ? result.selectedSermNameAr : result.selectedSermNameEn}
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                            {result.isAutoSwitched
                                ? isRtl ? result.autoSwitchReasonAr : result.autoSwitchReasonEn
                                : isRtl ? 'بروتوكول موجه مخصص' : 'Custom Tailored Protocol'}
                        </span>
                    </div>

                    <div className="flex flex-col justify-center items-start md:items-end">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">{isRtl ? 'حالة HCG:' : 'HCG Status:'}</span>
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                                result.hcgRequired
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                                {result.hcgRequired ? t.hcg_required : t.no_hcg_required}
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                            {result.phases.length} {isRtl ? 'مراحل علاجية متتالية' : 'Sequential Phases'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warnings and Auto-Switch Alerts */}
            {result.hcgRequired && (
                <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5">
                    <span className="text-base shrink-0">⚠️</span>
                    <div className="leading-relaxed">
                        <strong className="font-bold">{isRtl ? 'تحذير توقيت HCG الهام: ' : 'Critical HCG Timing Warning: '}</strong>
                        {t.hcg_stop_warning}
                    </div>
                </div>
            )}

            {result.isAutoSwitched && (
                <div className="mb-6 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/40 text-blue-300 text-xs flex items-start gap-2.5">
                    <span className="text-base shrink-0">🛡️</span>
                    <div className="leading-relaxed">
                        <strong className="font-bold">{isRtl ? 'حماية سريرية: ' : 'Clinical Safeguard: '}</strong>
                        {isRtl ? result.autoSwitchReasonAr : result.autoSwitchReasonEn}
                    </div>
                </div>
            )}

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel: Inputs (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                    {/* 1. Cycle Compounds */}
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-lime-400" />
                                {isRtl ? '1. مركبات الدورة المنتهية' : '1. Cycle Compounds'}
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddCompound}
                                className="px-2.5 py-1 text-[11px] font-bold bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/30 rounded-lg transition"
                            >
                                + {isRtl ? 'إضافة مركب' : 'Add Compound'}
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {compounds.map((c, idx) => (
                                <div key={c.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 relative">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                                                {isRtl ? `مركب #${idx + 1}` : `Compound #${idx + 1}`}
                                            </label>
                                            <select
                                                value={c.catalogId}
                                                onChange={(e) => handleUpdateCompound(c.id, { catalogId: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-lime-500 font-medium"
                                            >
                                                {COMPOUND_SUPPRESSION_CATALOG.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {isRtl ? item.nameAr : item.nameEn} (Kj: {item.factor})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {compounds.length > 1 && (
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

                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-0.5">
                                            {isRtl ? 'الجرعة الأسبوعية (ملغ/أسبوع)' : 'Weekly Dose (mg/wk)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={c.weeklyDoseMg}
                                            min={10}
                                            max={5000}
                                            step={25}
                                            onChange={(e) => handleUpdateCompound(c.id, { weeklyDoseMg: Number(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Duration & Physical Status */}
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-lime-400" />
                            {isRtl ? '2. المدة والحالة السريرية للخصية' : '2. Duration & Testicular Status'}
                        </h2>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] text-slate-400 font-semibold">
                                    {isRtl ? `مدة الدورة: ${cycleWeeks} أسبوع` : `Cycle Duration: ${cycleWeeks} weeks`}
                                </label>
                                <span className="text-xs font-black text-lime-400 font-mono">{cycleWeeks}w</span>
                            </div>
                            <input
                                type="range"
                                min={4}
                                max={48}
                                value={cycleWeeks}
                                onChange={(e) => setCycleWeeks(Number(e.target.value))}
                                className="w-full accent-lime-500 bg-slate-800 rounded-lg cursor-pointer"
                            />
                        </div>

                        {/* Body Weight Input */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] text-slate-400 font-semibold">
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
                        </div>

                        {/* Testicular Atrophy Status */}
                        <div>
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                                {isRtl ? 'ملاحظة حجم وكفاءة الخصية:' : 'Testicular Size & Atrophy Status:'}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(
                                    [
                                        { val: 'normal', ar: 'طبيعي', en: 'Normal' },
                                        { val: 'mild_atrophy', ar: 'ضمور خفيف', en: 'Mild Atrophy' },
                                        { val: 'severe_atrophy', ar: 'ضمور شديد', en: 'Severe Atrophy' },
                                    ] as const
                                ).map((opt) => (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => setTesticularStatus(opt.val)}
                                        className={`p-2 rounded-xl text-[11px] font-bold border transition ${
                                            testicularStatus === opt.val
                                                ? 'bg-lime-500/20 border-lime-500/50 text-lime-300'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {isRtl ? opt.ar : opt.en}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. SERM Preferences & Sensitivities */}
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-lime-400" />
                            {isRtl ? '3. تفضيلات الـ SERM وحساسية الأعراض' : '3. SERM Choice & Sensitivities'}
                        </h2>

                        <div className="mb-4">
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                                {isRtl ? 'المركب المفضل لديك:' : 'Preferred SERM:'}
                            </label>
                            <select
                                value={preferredSerm}
                                onChange={(e) => setPreferredSerm(e.target.value as SermAvailability)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:border-lime-500"
                            >
                                <option value="auto_select">{isRtl ? 'اختيار ذكي تلقائي (موصى به)' : 'Auto-Select (Recommended)'}</option>
                                <option value="enclomiphene">{isRtl ? 'إينكلوميفين (Enclomiphene)' : 'Enclomiphene'}</option>
                                <option value="nolvadex">{isRtl ? 'نولفادكس (Nolvadex / Tamoxifen)' : 'Nolvadex (Tamoxifen)'}</option>
                                <option value="clomid">{isRtl ? 'كلوميد (Clomid / Clomiphene)' : 'Clomid (Clomiphene)'}</option>
                                <option value="toremifene">{isRtl ? 'توريميفين (Toremifene)' : 'Toremifene'}</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                            <span className="text-[11px] font-bold text-slate-300">
                                {isRtl ? 'ملف الحساسية السريرية للأعراض:' : 'Side-Effect Sensitivity Profile:'}
                            </span>

                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-slate-950/60 transition">
                                <input
                                    type="checkbox"
                                    checked={sideEffects.ocularSensitivity}
                                    onChange={(e) => setSideEffects((prev) => ({ ...prev, ocularSensitivity: e.target.checked }))}
                                    className="accent-lime-500 rounded"
                                />
                                <span>{isRtl ? 'حساسية أو تشوش في الرؤية مع الكلوميد' : 'Ocular / Vision Sensitivity with Clomid'}</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-slate-950/60 transition">
                                <input
                                    type="checkbox"
                                    checked={sideEffects.gynoHistory}
                                    onChange={(e) => setSideEffects((prev) => ({ ...prev, gynoHistory: e.target.checked }))}
                                    className="accent-lime-500 rounded"
                                />
                                <span>{isRtl ? 'تاريخ وراثي أو إصابة سابقة بالتثدي (Gynaecomastia)' : 'History of Gynecomastia Flare-ups'}</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-slate-950/60 transition">
                                <input
                                    type="checkbox"
                                    checked={sideEffects.moodSensitivity}
                                    onChange={(e) => setSideEffects((prev) => ({ ...prev, moodSensitivity: e.target.checked }))}
                                    className="accent-lime-500 rounded"
                                />
                                <span>{isRtl ? 'حساسية مزاجية أو اكتئاب ناتج عن مضادات الاستروجين' : 'Mood Swings / Emotional Sensitivity'}</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-slate-950/60 transition">
                                <input
                                    type="checkbox"
                                    checked={sideEffects.jointPain}
                                    onChange={(e) => setSideEffects((prev) => ({ ...prev, jointPain: e.target.checked }))}
                                    className="accent-lime-500 rounded"
                                />
                                <span>{isRtl ? 'آلام المفاصل الناتجة عن هبوط الاستراديول' : 'Joint Pain / Dry Joints with SERMs'}</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Protocol Phases Roadmap (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800">
                            <div>
                                <h2 className="text-base font-black text-white">
                                    {isRtl ? 'خطة المراحل العلاجية المتكاملة (Protocol Phases)' : 'Action Protocol Roadmap'}
                                </h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {isRtl
                                        ? `إجمالي مدة الخطة: ${result.totalDurationWeeks} أسابيع متتالية وفق مستويات التثبيط وحساسية المستقبلات.`
                                        : `Total duration: ${result.totalDurationWeeks} sequential weeks adjusted for receptor sensitivity.`}
                                </p>
                            </div>
                            <span className="text-xs font-mono font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-xl border border-lime-500/30">
                                {result.phases.length} Phases
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {result.phases.map((phase) => (
                                <div
                                    key={phase.phaseNumber}
                                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3.5"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border ${
                                        phase.phaseNumber === 0
                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                            : phase.phaseNumber === 1
                                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                              : phase.phaseNumber === 2
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    }`}>
                                        P{phase.phaseNumber}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                                            <h3 className="text-sm font-extrabold text-white">
                                                {isRtl ? phase.titleAr : phase.titleEn}
                                            </h3>
                                            <span className="text-xs font-mono text-lime-400">
                                                {phase.durationWeeks} {isRtl ? 'أسابيع' : 'weeks'}
                                            </span>
                                        </div>

                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-xs font-bold text-amber-300">
                                                {isRtl ? phase.drugNameAr : phase.drugNameEn}:
                                            </span>
                                            <span className="text-xs text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                                                {isRtl ? phase.dosageDescriptionAr : phase.dosageDescriptionEn}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                            {isRtl ? phase.instructionsAr : phase.instructionsEn}
                                        </p>

                                        {phase.warningKey && (
                                            <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                                                ⚠️ {t.hcg_stop_warning}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bloodwork Panel Section */}
                        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                                <span>🩸</span>
                                {isRtl ? 'فحوصات الدم والمتابعة السريرية الإلزامية' : 'Mandatory Clinical Bloodwork Panel'}
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {isRtl ? result.bloodworkPanelPromptAr : result.bloodworkPanelPromptEn}
                            </p>
                        </div>

                        {/* Emotional / Health Alert */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                            <span>ℹ️</span>
                            <p className="leading-relaxed">
                                {t.emotional_health_alert}
                            </p>
                        </div>

                        {/* Save bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-3 mt-4 border-t border-slate-800 gap-3">
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

            {/* Medical Disclaimer */}
            <div className="mt-6 p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
                <p className="text-xs text-slate-400 leading-relaxed">
                    {t.medical_disclaimer}
                </p>
            </div>

            {/* Navigation & Tool Interlinking */}
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
