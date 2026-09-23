'use client';

/**
 * components/tools/genetic.tsx
 * Layer 5 — Genetic Potential live UI.
 *
 * Renders the Genetic Potential engine (calculateGeneticPotential) reading
 * height/wrist/ankle (and optional body-fat) to estimate an untrained genetic
 * ceiling, then persists a committed dashboard snapshot on save.
 * Inline Tailwind primitives only — no external UI barrel.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { getTool } from '../../lib/tools/registry';
import { calculateGeneticPotential } from '../../lib/tools/engines/genetic';
import { GeneticInputSchema } from '../../lib/tools/schemas/genetic';
import { shouldAutoDraft, saveDraft, loadDraft } from '../../lib/tools/adapters/toolLogAdapter';
import { supabase } from '../../shared/lib/supabase';

const TOOL_SLUG = 'genetic';

export default function GeneticTool() {
  const { isRTL } = usePreferences();
  const { user } = useAuth();
  const tool = getTool(TOOL_SLUG);

  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const isAr = locale === 'ar';
  const [unitSystem, _setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const [form, setForm] = useState<{
    heightCm: number;
    wristCm: number;
    ankleCm: number;
    bodyFatPct?: number;
  }>({
    heightCm: 180,
    wristCm: 17.5,
    ankleCm: 23,
    bodyFatPct: 15,
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Derive validation + result — never call setState during render.
  const validation = useMemo(() => GeneticInputSchema.safeParse(form), [form]);
  const result = useMemo(
    () => (validation.success ? calculateGeneticPotential(validation.data) : null),
    [validation],
  );
  const error = validation.success ? null : validation.error.issues[0]?.message ?? null;

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

  const rows: Array<{ key: 'heightCm' | 'wristCm' | 'ankleCm' | 'bodyFatPct'; labelAr: string; labelEn: string; unit: string }> = [
    { key: 'heightCm', labelAr: 'الطول', labelEn: 'Height', unit: 'cm' },
    { key: 'wristCm', labelAr: 'محيط الرسغ', labelEn: 'Wrist', unit: 'cm' },
    { key: 'ankleCm', labelAr: 'محيط الكاحل', labelEn: 'Ankle', unit: 'cm' },
    { key: 'bodyFatPct', labelAr: 'نسبة الدهون', labelEn: 'Body fat', unit: '%' },
  ];

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
                ? 'الإمكانات الوراثية — تقدير سقف النمو العضلي.'
                : 'Genetic Potential — estimate your untrained muscular ceiling.'}
            </p>
          </div>
          <button
            onClick={() => setLocale(isAr ? 'en' : 'ar')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-bold"
          >
            {isAr ? 'English' : 'عربي'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((row) => (
            <label key={row.key} className="block">
              <span className="text-xs font-bold text-zinc-400">
                {isAr ? row.labelAr : row.labelEn} ({row.unit})
              </span>
              <input
                type="number"
                step="any"
                value={form[row.key]}
                onChange={(e) =>
                  setForm({ ...form, [row.key]: Number(e.target.value) })
                }
                className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500"
              />
            </label>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400 font-bold">
            {isAr ? `خطأ: ${error}` : `Error: ${error}`}
          </p>
        )}

        {result && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  {isAr ? 'الكتلة العضلية القصوى (كجم)' : 'Max lean mass (kg)'}
                </p>
                <p className="text-3xl font-black text-white">
                  {result.maxLBMkg}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-400">
                  {isAr ? 'السقف' : 'FFMI'}
                </p>
                <p className="text-xl font-bold text-white">
                  {result.maxFFMI.toFixed(1)}
                </p>
              </div>
            </div>
            {typeof result.potentialReachedPct === 'number' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span>{isAr ? 'الوصول إلى السقف' : 'Potential reached'}</span>
                  <span>{(result.potentialReachedPct as number).toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, result.potentialReachedPct as number)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 gap-2">
          <p className="text-xs text-zinc-500">
            {isAr ? 'يُحفظ تلقائياً محلياً أثناء الكتابة.' : 'Auto-saves locally as you type.'}
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
