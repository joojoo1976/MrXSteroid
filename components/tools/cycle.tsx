'use client';

/**
 * components/tools/cycle.tsx
 * Layer 5 — Cycle Architect live UI.
 *
 * Renders the Cycle Architect engine (calculateCycleArchitect) with a small
 * compound table, auto-draft (local) and a committed dashboard snapshot on save.
 * Inline Tailwind primitives only — no external UI barrel (matches Dashboard.tsx).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { getTool } from '../../lib/tools/registry';
import { calculateCycleArchitect } from '../../lib/tools/engines/cycle';
import { CycleInputSchema } from '../../lib/tools/schemas/cycle';
import {
  shouldAutoDraft,
  saveDraft,
  loadDraft,
} from '../../lib/tools/adapters/toolLogAdapter';
import { supabase } from '../../shared/lib/supabase';

const TOOL_SLUG = 'cycle';

export default function CycleTool() {
  const { isRTL } = usePreferences();
  const { user } = useAuth();
  const tool = getTool(TOOL_SLUG);

  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const isAr = locale === 'ar';
  const [unitSystem, _setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const [form, setForm] = useState<{
    compounds: Array<{
      compound: string;
      doseMg: number;
      frequencyPerWeek: number;
      weeks: number;
      startWeek: number;
    }>;
    cycleLengthWeeks: number;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    goal: 'bulk' | 'cut' | 'recomp' | 'strength';
    userWeightKg?: number;
    userHeightCm?: number;
  }>({
    compounds: [
      {
        compound: 'testosterone_enanthate',
        doseMg: 250,
        frequencyPerWeek: 2,
        weeks: 12,
        startWeek: 1,
      },
    ],
    cycleLengthWeeks: 12,
    experienceLevel: 'intermediate',
    goal: 'bulk',
    userWeightKg: 85,
    userHeightCm: 178,
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Derive validation + result — never call setState during render.
  const validation = useMemo(() => CycleInputSchema.safeParse(form), [form]);
  const result = useMemo(
    () => (validation.success ? calculateCycleArchitect(validation.data) : null),
    [validation],
  );
  const error = validation.success ? null : validation.error.issues[0]?.message ?? null;

  // Draft restore (once, on mount) + periodic auto-draft (local only).
  const lastSavedRef = useRef<number>(Date.now());
  useEffect(() => {
    const draft = loadDraft(TOOL_SLUG);
    if (draft) setForm(draft.inputs as typeof form);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!shouldAutoDraft(lastSavedRef.current, Date.now())) return;
      saveDraft(TOOL_SLUG, form, {
        locale,
        unitSystem,
        savedAt: new Date().toISOString(),
      });
      lastSavedRef.current = Date.now();
    }, 1500);
    return () => clearTimeout(t);
  }, [form, locale, unitSystem]);

  const handleSave = async () => {
    if (!validation.success) {
      return;
    }
    setSaving(true);
    setSaveStatus(isAr ? 'جاري الحفظ...' : 'Saving…');
    try {
      const { error: err } = await supabase.from('tool_snapshots').insert({
        slug: TOOL_SLUG,
        input: form,
        output: result,
        user_id: user?.id ?? null,
        locale,
        unit_system: unitSystem,
        created_at: new Date().toISOString(),
      });
      setSaveStatus(
        err
          ? isAr
            ? 'تعذّر الحفظ — حاول مجدداً.'
            : 'Save failed — please retry.'
          : isAr
            ? 'تم الحفظ في لوحة القيادة!'
            : 'Saved to dashboard!'
      );
    } catch {
      setSaveStatus(isAr ? 'خطأ أثناء الحفظ.' : 'Error while saving.');
    } finally {
      setSaving(false);
    }
  };

  const compounds = form.compounds;

  return (
    <motion.div
      dir={isRTL ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-28 pb-20 px-4 bg-black text-white"
    >
      <div className="max-w-3xl mx-auto bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black">
              {isAr ? tool?.titleAr : tool?.titleEn}
            </h1>
            <p className="text-sm text-zinc-400">
              {isAr
                ? 'مهندس الدورة — جرّب مجموعات المركبات الآمنة.'
                : 'Cycle Architect — model safe compound stacks.'}
            </p>
          </div>
          <button
            onClick={() => setLocale(isAr ? 'en' : 'ar')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-bold"
          >
            {isAr ? 'English' : 'عربي'}
          </button>
        </div>

        <div className="space-y-5">
          {compounds.map((c, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 p-4">
              <label className="block">
                <span className="text-xs font-bold text-zinc-400">
                  {isAr ? 'المركب' : 'Compound'}
                </span>
                <select
                  value={c.compound}
                  onChange={(e) => {
                    const next = [...compounds];
                    next[i] = { ...c, compound: e.target.value };
                    setForm({ ...form, compounds: next });
                  }}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500"
                >
                  {[
                    ['testosterone_enanthate', 'Testosterone Enanthate'],
                    ['testosterone_cypionate', 'Testosterone Cypionate'],
                    ['nandrolone_decanoate', 'Nandrolone Decanoate'],
                    ['boldenone_undecylenate', 'Boldenone'],
                    ['primo', 'Primobolan'],
                    ['anavar', 'Anavar'],
                    ['winstrol', 'Winstrol'],
                  ].map(([value, labelEn]) => (
                    <option key={value} value={value}>
                      {labelEn}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-zinc-400">
                  {isAr ? 'الجرعة (مغ/أسبوع)' : 'Dose (mg/wk)'}
                </span>
                <input
                  type="number"
                  value={c.doseMg}
                  onChange={(e) => {
                    const next = [...compounds];
                    next[i] = { ...c, doseMg: Number(e.target.value) };
                    setForm({ ...form, compounds: next });
                  }}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-zinc-400">
                  {isAr ? 'الأسابيع' : 'Weeks'}
                </span>
                <input
                  type="number"
                  value={c.weeks}
                  onChange={(e) => {
                    const next = [...compounds];
                    next[i] = { ...c, weeks: Number(e.target.value) };
                    setForm({ ...form, compounds: next });
                  }}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500"
                />
              </label>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400 font-bold">
            {isAr ? `خطأ: ${error}` : `Error: ${error}`}
          </p>
        )}

        {result && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  {isAr ? 'الجرعة الأسبوعية' : 'Weekly dose'}
                </p>
                <p className="text-2xl font-black text-white">{result.totalWeeklyMg}<span className="text-sm text-zinc-400 ml-1">mg</span></p>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  {isAr ? 'إجمالي الدورة' : 'Total cycle'}
                </p>
                <p className="text-2xl font-black text-white">{result.totalCycleMg}<span className="text-sm text-zinc-400 ml-1">mg</span></p>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  {isAr ? 'مغ/كجم/أسبوع' : 'mg/kg/wk'}
                </p>
                <p className="text-2xl font-black text-white">
                  {typeof result.mgPerKgPerWeek === 'number' ? result.mgPerKgPerWeek.toFixed(1) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  {isAr ? 'أطول عمر نصفي' : 'Longest half-life'}
                </p>
                <p className="text-2xl font-black text-white">{result.longestHalfLifeDays}<span className="text-sm text-zinc-400 ml-1">days</span></p>
              </div>
            </div>
            {result.warnings.length > 0 && (
              <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3">
                <p className="text-xs font-black text-yellow-300 mb-1.5">
                  {isAr ? `تحذيرات (${result.warnings.length})` : `Warnings (${result.warnings.length})`}
                </p>
                <ul className="space-y-1">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-yellow-200/80 font-semibold">• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 gap-2">
          <p className="text-xs text-zinc-500">
            {isAr
              ? 'يُحفظ تلقائياً محلياً أثناء الكتابة.'
              : 'Auto-saves locally as you type.'}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gold-500 text-black font-bold text-sm hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving
              ? isAr
                ? '...جاري الحفظ'
                : 'Saving…'
              : isAr
                ? 'حفظ في لوحة القيادة'
                : 'Save to dashboard'}
          </button>
        </div>
        {saveStatus && (
          <p className="mt-3 text-sm text-zinc-400 text-right font-semibold">
            {saveStatus}
          </p>
        )}
      </div>
    </motion.div>
  );
}
