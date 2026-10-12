'use client';
/** Tool #105 — AI Health Data Fusion Hub & Timeline (dynamic UI).
 * Local, user-supplied data only. No FHIR / wearable / external integration. */
import React, { useEffect, useMemo, useState } from 'react';
import { fuseHealthData, type HealthEvent, type HealthEventCategory } from '@/lib/tools/engines/tool-105-ai-health-data-fusion-hub';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { HealthFusionInputSchema } from '@/lib/tools/schemas/tool-105-ai-health-data-fusion-hub';
import i18nJson from '@/i18n/tool-105-ai-health-data-fusion-hub.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-105-ai-health-data-fusion-hub';

const CATEGORY_OPTIONS: HealthEventCategory[] = ['lab', 'medication', 'symptom', 'blood-pressure'];
const CATEGORY_KEY: Record<HealthEventCategory, string> = {
  lab: 'cat_lab',
  medication: 'cat_medication',
  symptom: 'cat_symptom',
  'blood-pressure': 'cat_bp',
};

interface DraftEvent {
  date: string;
  category: HealthEventCategory;
  code: string;
  value: string;
  unit: string;
}

interface DraftInputs {
  events: DraftEvent[];
  consent_given: boolean;
  authenticated: boolean;
}

function blankEvent(): DraftEvent {
  return { date: new Date().toISOString().slice(0, 10), category: 'lab', code: '', value: '', unit: '' };
}

export default function Tool105HealthFusion() {
  requireTool(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({ events: [blankEvent()], consent_given: false, authenticated: false });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs?.events?.length) setInputs((p) => ({ ...p, ...draft.inputs }));
  }, []);

  const parsedEvents = useMemo<HealthEvent[]>(
    () =>
      inputs.events
        .filter((e) => e.code.trim().length > 0)
        .map((e) => ({
          date: e.date,
          category: e.category,
          code: e.code.trim(),
          value: e.value.trim() ? Number(e.value) : undefined,
          unit: e.unit.trim() || undefined,
        })),
    [inputs.events],
  );

  const parsed = useMemo(
    () => HealthFusionInputSchema.safeParse({ events: parsedEvents, consent_given: inputs.consent_given, authenticated: inputs.authenticated }),
    [parsedEvents, inputs.consent_given, inputs.authenticated],
  );
  const result = useMemo(() => (parsed.success ? fuseHealthData(parsed.data) : null), [parsed]);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const updateEvent = (idx: number, patch: Partial<DraftEvent>) =>
    setInputs((p) => ({ ...p, events: p.events.map((e, i) => (i === idx ? { ...e, ...patch } : e)) }));


  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale("ar")} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === "ar" ? "bg-lime-500 text-slate-950" : "bg-zinc-800 text-zinc-300"}`}>عربي</button>
          <button type="button" onClick={() => setLocale("en")} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === "en" ? "bg-lime-500 text-slate-950" : "bg-zinc-800 text-zinc-300"}`}>EN</button>
        </div>
      </div>

      <div className="mb-3 rounded-2xl bg-amber-950/30 border border-amber-800/50 p-4 text-xs text-amber-200">
        <p className="font-black mb-1">⚠ {t.scope_title}</p>
        <p>{t.scope_text}</p>
      </div>

      <h2 className="text-sm font-black text-lime-400 mb-2">{t.inputs}</h2>
      <div className="space-y-2 mb-4">
        {inputs.events.map((e, idx) => (
          <div key={idx} className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <input type="date" value={e.date} onChange={(ev) => updateEvent(idx, { date: ev.target.value })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            <select value={e.category} onChange={(ev) => updateEvent(idx, { category: ev.target.value as HealthEventCategory })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
              {CATEGORY_OPTIONS.map((c) => (<option key={c} value={c}>{t[CATEGORY_KEY[c]]}</option>))}
            </select>
            <input type="text" placeholder={t.code} value={e.code} onChange={(ev) => updateEvent(idx, { code: ev.target.value })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            <input type="number" placeholder={t.value} value={e.value} onChange={(ev) => updateEvent(idx, { value: ev.target.value })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            <input type="text" placeholder={t.unit} value={e.unit} onChange={(ev) => updateEvent(idx, { unit: ev.target.value })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
          </div>
        ))}
        <button type="button" onClick={() => setInputs((p) => ({ ...p, events: [...p.events, blankEvent()] }))} className="px-3 py-1 text-xs font-bold rounded-lg bg-lime-500 text-slate-950">{t.add_event}</button>
      </div>

      <div className="flex flex-col gap-2 text-[11px] text-zinc-300 mb-4">
        <label className="flex items-center gap-2"><input type="checkbox" checked={inputs.consent_given} onChange={(e) => setInputs((p) => ({ ...p, consent_given: e.target.checked }))} /> {t.consent}</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={inputs.authenticated} onChange={(e) => setInputs((p) => ({ ...p, authenticated: e.target.checked }))} /> {t.authenticated}</label>
      </div>

      {!parsed.success && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {t.invalid}</p>)}

      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 space-y-3">
          <h2 className="text-sm font-black text-lime-400">{t.results}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label={t.event_count} value={String(result.event_count)} />
            <Metric label={t.persistence} value={result.persistence_mode} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-zinc-300">
              <thead><tr className="text-zinc-500"><th className="text-start p-1">{t.date}</th><th className="text-start p-1">{t.category}</th><th className="text-start p-1">{t.code}</th><th className="text-start p-1">{t.value}</th></tr></thead>
              <tbody>
                {result.timeline.map((ev) => (
                  <tr key={`${ev.date}-${ev.code}`} className="border-t border-zinc-800">
                    <td className="p-1 font-mono">{ev.date}</td>
                    <td className="p-1">{ev.category}</td>
                    <td className="p-1">{ev.code}</td>
                    <td className="p-1 font-mono">{ev.value ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
