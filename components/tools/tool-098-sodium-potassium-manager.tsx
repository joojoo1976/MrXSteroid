'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { manageSodiumPotassium } from '@/lib/tools/engines/tool-098-sodium-potassium-manager';
import { buildSodiumPotassiumManagerOutput } from '@/lib/tools/adapters/tool-098-sodium-potassium-manager';
import { AUTO_DRAFT_DEBOUNCE_MS, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { SodiumPotassiumManagerInputSchema, type SodiumPotassiumManagerInput } from '@/lib/tools/schemas/tool-098-sodium-potassium-manager';
import i18nJson from '@/i18n/tool-098-sodium-potassium-manager.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-098-sodium-potassium-manager';
type Draft = Record<keyof SodiumPotassiumManagerInput, string>;
const EMPTY: Draft = { daily_sodium_mg: '', daily_potassium_mg: '' };

export default function Tool098SodiumPotassiumManager() {
  const { locale } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const rtl = locale === 'ar';
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [inputs, setInputs] = useState<Draft>(EMPTY);
  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const draft = loadDraft<Draft>(TOOL_SLUG);
    if (draft?.inputs && typeof draft.inputs.daily_sodium_mg !== 'undefined' && typeof draft.inputs.daily_potassium_mg !== 'undefined') {
      setInputs({ daily_sodium_mg: String(draft.inputs.daily_sodium_mg), daily_potassium_mg: String(draft.inputs.daily_potassium_mg) });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const parsed = useMemo(() => SodiumPotassiumManagerInputSchema.safeParse({
    daily_sodium_mg: inputs.daily_sodium_mg === '' ? undefined : Number(inputs.daily_sodium_mg),
    daily_potassium_mg: inputs.daily_potassium_mg === '' ? undefined : Number(inputs.daily_potassium_mg),
  }), [inputs]);
  const result = parsed.success ? manageSodiumPotassium(parsed.data) : null;

  const update = (key: keyof Draft, value: string) => setInputs((current) => ({ ...current, [key]: value }));
  const save = async () => {
    if (!parsed.success || !result) { setSaveStatus(t.complete_inputs); return; }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const output = buildSodiumPotassiumManagerOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const response = await commitDashboardSnapshot(output, parsed.data);
      if (response.submitted.ok && response.projection.ok) { await clearDraft(TOOL_SLUG); setSaveStatus(t.saved); } else setSaveStatus(t.save_failed);
    } catch { setSaveStatus(t.save_failed); } finally { setSaving(false); }
  };

  return <main className="mx-auto max-w-4xl px-4 py-6" dir={rtl ? 'rtl' : 'ltr'}>
    <header className="mb-5"><h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1><p className="mt-2 text-sm text-zinc-400">{t.scope}</p></header>
    <section aria-label={t.inputs} className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:grid-cols-2">
      <label className="text-sm font-semibold text-zinc-300">{t.sodium_mg}<input aria-label={t.sodium_mg} type="number" min="0" max="15000" step="1" value={inputs.daily_sodium_mg} onChange={(e) => update('daily_sodium_mg', e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" /></label>
      <label className="text-sm font-semibold text-zinc-300">{t.potassium_mg}<input aria-label={t.potassium_mg} type="number" min="0.01" max="10000" step="1" value={inputs.daily_potassium_mg} onChange={(e) => update('daily_potassium_mg', e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" /></label>
    </section>
    <p role="status" className="mt-3 text-sm text-zinc-300">{!parsed.success ? t.complete_inputs : t.calculated}</p>
    {result && <section aria-label={t.result} className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"><span className="block text-sm text-zinc-400">{t.ratio}</span><strong className="mt-2 block text-4xl font-black font-mono text-white">{result.sodium_to_potassium_ratio}</strong><p className="mt-3 text-sm text-zinc-400">{t.limits}</p><p className="mt-3 text-xs text-zinc-500">{t.disclaimer}</p><div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4"><span aria-live="polite" className="text-xs text-zinc-400">{saveStatus}</span><button type="button" onClick={save} disabled={saving} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">{saving ? t.saving : t.save}</button></div></section>}
    <nav aria-label={t.navigation} className="mt-6 flex justify-between border-t border-zinc-800 pt-4 text-xs"><a href={requireTool(neighbors.prevTool.slug).href} rel="prev">← {rtl ? neighbors.prevTool.titleAr : neighbors.prevTool.titleEn}</a><a href={requireTool(neighbors.nextTool.slug).href} rel="next">{rtl ? neighbors.nextTool.titleAr : neighbors.nextTool.titleEn} →</a></nav><p className="mt-2 text-xs text-zinc-600">{tool.toolId} · CALCULATED</p>
  </main>;
}
