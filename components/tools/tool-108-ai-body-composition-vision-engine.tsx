'use client';
/** Tool #108 - AI Body Composition Vision Engine (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { calcVision, type VisionResult } from '@/lib/tools/engines/tool-108-ai-body-composition-vision-engine';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { VisionInputSchema } from '@/lib/tools/schemas/tool-108-ai-body-composition-vision-engine';
import i18nJson from '@/i18n/tool-108-ai-body-composition-vision-engine.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-108-ai-body-composition-vision-engine';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';
const QUALITY_OPTIONS = ['poor', 'medium', 'high'];
const QUALITY_LABEL: Record<string, string> = { poor: 'photo_low', medium: 'photo_medium', high: 'photo_high' };
const GENDER_OPTIONS = ['male', 'female'];
const SEX_LABEL: Record<string, string> = { male: 'sex_male', female: 'sex_female' };

interface DraftInputs {
  weight_kg: number;
  height_cm: number;
  age_years: number;
  sex: string;
  neck_cm: number;
  waist_cm: number;
  hips_cm: number;
  chest_cm: number;
  photo_count: number;
  photo_quality: string;
}

export default function Tool108VisionEngine() {
  requireTool(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    weight_kg: 80,
    height_cm: 178,
    age_years: 30,
    sex: 'male',
    neck_cm: 38,
    waist_cm: 92,
    hips_cm: 100,
    chest_cm: 110,
    photo_count: 2,
    photo_quality: 'medium',
  });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((p) => ({ ...p, ...draft.inputs }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const parsed = useMemo(() => VisionInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<VisionResult | null>(() => (parsed.success ? calcVision(parsed.data) : null), [parsed]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.weight_kg}
          <input type="number" min={30} max={250} step={1} value={inputs.weight_kg} onChange={(e) => setInputs((p) => ({ ...p, weight_kg: Number(e.target.value || 80) }))} className={INP} />
        </label>
        <label className={LBL}>{t.height_cm}
          <input type="number" min={120} max={230} step={1} value={inputs.height_cm} onChange={(e) => setInputs((p) => ({ ...p, height_cm: Number(e.target.value || 178) }))} className={INP} />
        </label>
        <label className={LBL}>{t.age}
          <input type="number" min={16} max={85} step={1} value={inputs.age_years} onChange={(e) => setInputs((p) => ({ ...p, age_years: Number(e.target.value || 30) }))} className={INP} />
        </label>
        <label className={LBL}>{t.sex}
          <select value={inputs.sex} onChange={(e) => setInputs((p) => ({ ...p, sex: e.target.value }))} className={SEL}>
            {GENDER_OPTIONS.map((s) => (<option key={s} value={s}>{t[SEX_LABEL[s]]}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.neck_cm}
          <input type="number" min={20} max={60} step={0.5} value={inputs.neck_cm} onChange={(e) => setInputs((p) => ({ ...p, neck_cm: Number(e.target.value || 38) }))} className={INP} />
        </label>
        <label className={LBL}>{t.waist_cm}
          <input type="number" min={40} max={200} step={0.5} value={inputs.waist_cm} onChange={(e) => setInputs((p) => ({ ...p, waist_cm: Number(e.target.value || 92) }))} className={INP} />
        </label>
        <label className={LBL}>{t.hips_cm}
          <input type="number" min={50} max={250} step={0.5} value={inputs.hips_cm} onChange={(e) => setInputs((p) => ({ ...p, hips_cm: Number(e.target.value || 100) }))} className={INP} />
        </label>
        <label className={LBL}>{t.chest_cm}
          <input type="number" min={50} max={350} step={0.5} value={inputs.chest_cm} onChange={(e) => setInputs((p) => ({ ...p, chest_cm: Number(e.target.value || 110) }))} className={INP} />
        </label>
        <label className={LBL}>{t.photo_count}
          <input type="number" min={0} max={12} step={1} value={inputs.photo_count} onChange={(e) => setInputs((p) => ({ ...p, photo_count: Number(e.target.value || 2) }))} className={INP} />
        </label>
        <label className={LBL}>{t.photo_quality}
          <select value={inputs.photo_quality} onChange={(e) => setInputs((p) => ({ ...p, photo_quality: e.target.value }))} className={SEL}>
            {QUALITY_OPTIONS.map((q) => (<option key={q} value={q}>{t[QUALITY_LABEL[q]]}</option>))}
          </select>
        </label>
      </div>

      {!parsed.success && (<p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>)}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric label={t.bmi} value={`${result.bmi}`} />
              <Metric label={t.body_fat_percent} value={`${result.body_fat_percent}%`} />
              <Metric label={t.ffmi} value={`${result.ffmi}`} />
              <Metric label={t.visual_confidence} value={result.visual_confidence} />
            </div>
            <div className="mt-3 text-[11px] text-zinc-300">
              <p className="font-black text-amber-300 mb-1">{t.visual_notes}</p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.visual_notes.map((f) => (<li key={f}>{f}</li>))}
              </ul>
            </div>
          </div>
          <div className="rounded-2xl bg-amber-950/30 border border-amber-800/50 p-4 text-xs text-amber-200">
            <p className="font-black mb-1">&#9888; {t.scope_title}</p>
            <p>{t.scope_text}</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-zinc-500">{t.disclaimer}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
      <div className="text-[9px] text-zinc-500 font-bold uppercase">{label}</div>
      <div className="text-sm text-lime-400 font-mono font-black">{value}</div>
    </div>
  );
}

