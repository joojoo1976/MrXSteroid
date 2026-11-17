'use client';
import React, { useState } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { MedicationSessionResult, MedicationSessionEntry } from '@/lib/tools/schemas/tool-025-drug-interaction-pro';
import type { DrugInteractionProBuildOptions } from '@/lib/tools/r6/tool-025-drug-interaction-pro-pipeline';
import { buildMedicationSessionCsv, type Tool025UiState } from '@/lib/tools/r6/tool-025-drug-interaction-pro-contract';

type BoxSource = 'engine' | 'static' | 'not_available' | 'not_applicable';
interface BoxDefinition { n: number; id: string; titleKey: string; source: BoxSource; content: React.ReactNode; }
interface ToolLink { slug: string; titleEn: string; titleAr: string; }

export interface Tool025GeniusProps {
  locale: 'ar' | 'en';
  state: Tool025UiState;
  entries: MedicationSessionEntry[];
  result: MedicationSessionResult | null;
  output: ToolOutput<MedicationSessionResult> | null;
  options: DrugInteractionProBuildOptions;
  prevTool: ToolLink;
  nextTool: ToolLink;
  onRemove: (id: string) => void;
  t: Record<string, string>;
}

const SOURCE_BADGES: Record<BoxSource, { en: string; ar: string; className: string }> = {
  engine: { en: 'engine', ar: 'المحرك', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
  static: { en: 'static', ar: 'ثابت', className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300' },
  not_available: { en: 'NOT_AVAILABLE', ar: 'غير متاح', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  not_applicable: { en: 'NOT_APPLICABLE', ar: 'غير منطبق', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
};
const BOX_TINT = ['bg-zinc-900/60 border-zinc-800','bg-rose-950/20 border-rose-900','bg-blue-950/20 border-blue-900','bg-zinc-900/60 border-zinc-800','bg-cyan-950/20 border-cyan-900','bg-cyan-950/20 border-cyan-900','bg-orange-950/20 border-orange-900','bg-teal-950/20 border-teal-900','bg-purple-950/20 border-purple-900','bg-zinc-900/60 border-zinc-800','bg-zinc-900/60 border-zinc-800','bg-yellow-950/20 border-yellow-900'];

export default function Tool025Genius({ locale, state, entries, result, output, options, prevTool, nextTool, onRemove, t }: Tool025GeniusProps) {
  const isAr = locale === 'ar';
  const [compact, setCompact] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const boxes: BoxDefinition[] = [
    { n:1, id:'kpi', titleKey:'box1_title', source:'engine', content:<p className="text-sm font-mono font-bold text-zinc-100">{t.session_list}: {entries.length}</p> },
    { n:2, id:'primary', titleKey:'box2_title', source:'engine', content:(<div data-r6-core="c1" className="space-y-2 text-sm">{result ? (<><p className="text-xs font-bold text-amber-300">{t.interaction_unavailable}</p><p className="text-[11px] text-zinc-400">{t.origin_user_provided}</p><p className="text-[11px] text-zinc-500">{t.not_a_prescription}</p></>) : <p className="text-xs text-zinc-400">{t.state_waiting}</p>}</div>) },
    { n:3, id:'calculated', titleKey:'box3_title', source:'static', content:(<div data-r6-core="c2" className="space-y-2 text-sm"><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.formula_title}</p><p className="mt-1 text-[11px] text-zinc-300">{t.formula_body}</p><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.assumptions_title}</p><p className="mt-1 text-[11px] text-zinc-400">{t.assumptions_body}</p></div>) },
    { n:4, id:'inputs', titleKey:'box4_title', source:'static', content:(<div data-r6-core="inputs" className="space-y-2 text-sm"><p className="text-[11px] text-zinc-400">{t.session_list}: {entries.length}</p>{entries.length===0 ? <p className="text-[11px] text-zinc-500">{t.empty}</p> : <ul className="space-y-2">{entries.map(e => (<li key={e.id} className="flex items-start justify-between gap-2 rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]"><div><div className="font-bold text-zinc-200">{e.itemName}</div><div className="text-zinc-400">{t[`type_${e.itemType}`] ?? e.itemType}</div></div><button type="button" onClick={()=>onRemove(e.id)} className="rounded border border-zinc-700 px-2 py-0.5 text-zinc-300">{t.remove}</button></li>))}</ul>}</div>) },
    { n:5, id:'what-if', titleKey:'box5_title', source:'engine', content:<p className="text-xs text-zinc-400">{t.box5_na}</p> },
    { n:6, id:'sensitivity', titleKey:'box6_title', source:'engine', content:<p className="text-xs text-zinc-400">{t.box6_na}</p> },
    { n:7, id:'safety', titleKey:'box7_title', source:'engine', content:(<div data-r6-core="c3" className="space-y-2 text-sm"><p className="text-[11px] text-zinc-300">{t.interaction_unavailable}</p><div className="rounded border border-zinc-800 bg-zinc-950/70 p-2"><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.referral_title}</p><p className="mt-1 text-[11px] text-zinc-400">{t.referral_not_available}</p><p className="mt-1 text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p></div></div>) },
    { n:8, id:'cross-tool', titleKey:'box8_title', source:'static', content:(<div data-r6-core="cross-tool" className="space-y-2 text-sm"><p className="text-[11px] text-zinc-400">{t.box8_none}</p><p className="mt-1 text-[11px] text-zinc-400"><a className="text-cyan-300 underline" href={`/smarttools/${prevTool.slug}`}>{isAr?prevTool.titleAr:prevTool.titleEn}</a>{' · '}<a className="text-cyan-300 underline" href={`/smarttools/${nextTool.slug}`}>{isAr?nextTool.titleAr:nextTool.titleEn}</a></p><p className="mt-1 text-[11px] text-zinc-500">{t.box8_calculated_at}: {output?output.calculatedAt:t.state_waiting}</p></div>) },
    { n:9, id:'sources', titleKey:'box9_title', source:'not_available', content:(<div data-r6-core="c4" className="space-y-2 text-sm"><p className="text-xs font-bold text-zinc-200">{t.evidence_none}</p><p className="text-[11px] text-zinc-400">{t.evidence_pending_review}</p><p className="text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p></div>) },
    { n:10, id:'export', titleKey:'box10_title', source:'static', content:(<div data-r6-core="export" className="space-y-2 text-sm"><button type="button" disabled={!result} onClick={()=>{if(!result)return;if(typeof URL==='undefined'||typeof URL.createObjectURL!=='function')return;const csv=buildMedicationSessionCsv(result, output?.calculatedAt ?? options.calculatedAt);const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='tool-025-drug-interaction-pro.csv';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);}} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-100 hover:bg-zinc-700 disabled:opacity-40">{t.box10_button}</button><p className="text-[11px] text-zinc-500">{result?t.box10_note:t.box10_unavailable}</p></div>) },
    { n:11, id:'history', titleKey:'box11_title', source:'not_available', content:<p className="text-xs text-zinc-400">{t.box11_na}</p> },
    { n:12, id:'next-actions', titleKey:'box12_title', source:'static', content:(<div data-r6-core="c5" className="space-y-2 text-sm"><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.next_step}</p><p className="mt-1 text-xs text-zinc-300">{t.c5_not_available}</p><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.do_not}</p><p className="mt-1 text-xs text-zinc-200">{t.not_a_diagnosis}</p><p className="text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p><div className="rounded border border-zinc-800 bg-zinc-950/70 p-2" data-r6-rating="session_only_not_saved"><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box12_rating}</p><div className="mt-1 flex gap-1">{[1,2,3,4,5].map(v=>(<button key={v} type="button" aria-pressed={rating===v} onClick={()=>setRating(v)} className={`rounded border px-2 py-0.5 text-xs font-bold ${rating===v?'border-amber-400 bg-amber-400 text-slate-950':'border-zinc-700 bg-zinc-800 text-zinc-200'}`}>{v}</button>))}</div><p className="mt-1 text-[10px] text-zinc-500">{t.box12_rating_not_saved}</p></div></div>) },
  ];
  const visible = compact ? [boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]] : boxes;
  return (
    <section className="mt-8 space-y-4" aria-label={t.genius_section_label} data-r6-genius="tool-025" data-r6-genius-state={state}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{compact ? t.genius_title_compact : t.genius_title}</h2>
        <div className="flex gap-2"><button type="button" onClick={()=>setCompact(true)} aria-pressed={compact} className={`rounded px-3 py-1 text-xs font-bold ${compact?'bg-lime-500 text-slate-950':'bg-zinc-800 text-zinc-200'}`}>{t.genius_compact}</button><button type="button" onClick={()=>setCompact(false)} aria-pressed={!compact} className={`rounded px-3 py-1 text-xs font-bold ${!compact?'bg-lime-500 text-slate-950':'bg-zinc-800 text-zinc-200'}`}>{t.genius_full}</button></div>
      </div>
      {visible.map((box) => { const badge = SOURCE_BADGES[box.source]; return (
        <article key={box.id} data-r6-box={String(box.n)} data-r6-box-id={box.id} data-r6-box-source={box.source} className={`rounded border p-4 ${BOX_TINT[box.n-1]??BOX_TINT[0]}`}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold"><span className="me-1 font-mono text-zinc-500">{box.n}.</span>{t[box.titleKey]}</h3><span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>{isAr?badge.ar:badge.en}</span></div>
          {box.content}
        </article>
      );})}
    </section>
  );
}
