'use client';
import React, { useState } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { PeptideDoseInput } from '@/lib/tools/schemas/tool-051-peptide-dosage-calculator';
import type { PeptideDoseBuildOptions, PeptideDoseResult } from '@/lib/tools/r6/tool-051-peptide-dosage-pipeline';
import { runPeptideDose } from '@/lib/tools/r6/tool-051-peptide-dosage-pipeline';
import { requireTool } from '@/lib/tools/registry';
import i18nJson from '@/i18n/tool-051-peptide-dosage-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';
import {
  TOOL_051_CROSS_TOOL_LINKS,
  TOOL_051_LIMITS,
  TOOL_051_SOURCES,
  buildPeptideDoseCsv,
  clamp,
  formatMl,
  mirroredConcentration,
  mirroredDoseVolume,
  mirroredDrawUnits,
  mirroredDosesPerVial,
  mirroredWarnings,
  warningLabelKey,
  type Tool051Draft,
  type Tool051UiState,
} from '@/lib/tools/r6/tool-051-peptide-dosage-contract';

type BoxSource = 'engine' | 'static' | 'not_available' | 'not_applicable';

interface BoxDefinition {
  n: number;
  id: string;
  titleKey: string;
  source: BoxSource;
  content: React.ReactNode;
}

interface ToolLink { slug: string; titleEn: string; titleAr: string; }

export interface Tool051GeniusProps {
  locale: 'ar' | 'en';
  state: Tool051UiState;
  draft: Tool051Draft;
  input: PeptideDoseInput | null;
  output: ToolOutput<PeptideDoseResult> | null;
  options: PeptideDoseBuildOptions;
  prevTool: ToolLink;
  nextTool: ToolLink;
}

const SOURCE_BADGES: Record<BoxSource, { en: string; ar: string; className: string }> = {
  engine: { en: 'engine', ar: 'المحرك', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
  static: { en: 'static', ar: 'ثابت', className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300' },
  not_available: { en: 'NOT_AVAILABLE', ar: 'غير متاح', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  not_applicable: { en: 'NOT_APPLICABLE', ar: 'غير منطبق', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
};

const BOX_TINT = [
  'bg-zinc-900/60 border-zinc-800', 'bg-rose-950/20 border-rose-900', 'bg-blue-950/20 border-blue-900',
  'bg-zinc-900/60 border-zinc-800', 'bg-cyan-950/20 border-cyan-900', 'bg-cyan-950/20 border-cyan-900',
  'bg-orange-950/20 border-orange-900', 'bg-teal-950/20 border-teal-900', 'bg-purple-950/20 border-purple-900',
  'bg-zinc-900/60 border-zinc-800', 'bg-zinc-900/60 border-zinc-800', 'bg-yellow-950/20 border-yellow-900',
];

const CROSS_TOOL_KEYS: Record<string, { field: string; note: string; freshness: string }> = {
  'tool-046-trt-lifetime': { field: 'cross_tool_046_field', note: 'cross_tool_046_note', freshness: 'cross_tool_046_freshness' },
};

interface Probe { id: string; label: string; concentration: number | null; drawUnits: number | null; changed: boolean; error: boolean; }

export default function Tool051Genius({ locale, state, draft, input, output, options, prevTool, nextTool }: Tool051GeniusProps) {
  const t = pickToolI18n(i18nJson, locale);
  const isAr = locale === 'ar';
  const [compact, setCompact] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const result = output?.result ?? null;

  const warningLabel = (code: string): string => t[warningLabelKey(code)] ?? t.warning_unknown;

  const runProbe = (labelKey: string, changed: Partial<PeptideDoseInput>): Probe => {
    const label = t[labelKey] ?? labelKey;
    if (!input || !result) return { id: labelKey, label, concentration: null, drawUnits: null, changed: false, error: true };
    const outcome = runPeptideDose({ ...input, ...changed }, { ...options, snapshotType: 'submitted_snapshot' });
    if (!outcome.ok) return { id: labelKey, label, concentration: null, drawUnits: null, changed: false, error: true };
    const next = outcome.output.result;
    return {
      id: labelKey, label, concentration: next.concentration_mg_per_ml, drawUnits: next.draw_units_u100,
      changed: next.concentration_mg_per_ml !== result.concentration_mg_per_ml || next.draw_units_u100 !== result.draw_units_u100 || next.doses_per_vial !== result.doses_per_vial,
      error: false,
    };
  };

  const vial = Number(draft.vialMg);
  const bac = Number(draft.bacWaterMl);
  const dose = Number(draft.desiredDoseMg);

  const probes: Probe[] = [
    runProbe('box5_vial_up', input ? { vial_mg: clamp((Number.isFinite(vial) ? vial : input.vial_mg) + 1, 0.1, 100) } : {}),
    runProbe('box5_bac_up', input ? { bac_water_ml: clamp((Number.isFinite(bac) ? bac : input.bac_water_ml) + 0.5, 0.1, 10) } : {}),
    runProbe('box5_dose_up', input ? { desired_dose_mg: clamp((Number.isFinite(dose) ? dose : input.desired_dose_mg) + 0.1, 0.01, 10) } : {}),
  ];

  const anyFlip = probes.some((p) => p.changed);

  const probeSummary = (probe: Probe, changedKey: string, unchangedKey: string): string => {
    if (probe.error || probe.concentration === null || probe.drawUnits === null || !result) return t.box5_out_of_range;
    const base = `${t.kpi_concentration}: ${formatMl(result.concentration_mg_per_ml)} → ${formatMl(probe.concentration)} · ${t.kpi_draw_units}: ${formatMl(result.draw_units_u100)} → ${formatMl(probe.drawUnits)}`;
    return probe.changed ? `${base} · ${t[changedKey]}` : `${base} · ${t[unchangedKey]}`;
  };

  const renderPrimaryResult = (): React.ReactNode => (
    <div data-r6-core="c1" className="space-y-2 text-sm">
      {result ? (
        <>
          <p className="font-mono text-2xl font-black text-zinc-100">
            {formatMl(result.concentration_mg_per_ml)}{' '}
            <span className="text-sm font-bold text-zinc-400">{t.primary_conc_suffix}</span>
          </p>
          <p className="text-xs font-bold text-lime-300">
            {t.kpi_draw_units}: {formatMl(result.draw_units_u100)} U · {t.kpi_dose_volume}: {formatMl(result.dose_volume_ml)} ml
          </p>
          <p className="text-[11px] text-zinc-400">
            {t.kpi_doses_per_vial}:{' '}
            <span className="font-mono font-bold text-zinc-100">{result.doses_per_vial}</span>
            {' · '}
            {t.kpi_clamped}:{' '}
            <span className="font-bold text-zinc-100">{result.clamped ? t.yes : t.no}</span>
          </p>
          <p className="text-[11px] text-zinc-400">
            {t.confidence}: <span className="font-bold">{t.confidence_not_assessed}</span>
          </p>
          <p className="text-[11px] text-zinc-500">{t.primary_heuristic_note}</p>
          <p className="text-[11px] text-amber-300">{t.primary_not_dosing_note}</p>
          <p className="text-[11px] text-zinc-500">{t.not_a_prescription}</p>
        </>
      ) : (
        <p className="text-xs text-zinc-400">{t.state_waiting} — {t.state_no_result}</p>
      )}
    </div>
  );

  const conc = input ? mirroredConcentration(input) : 0;
  const doseVol = input ? mirroredDoseVolume(input) : 0;
  const draw = input ? mirroredDrawUnits(input) : { units: 0, clamped: false };
  const dosesPerVial = input ? mirroredDosesPerVial(input) : 0;

  const renderHowCalculated = (): React.ReactNode => (
    <div data-r6-core="c2" className="space-y-2 text-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.formula_title}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_concentration}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_dose_volume}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_draw_units}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_min_draw}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_doses_per_vial}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.inputs_used}</p>
        <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-zinc-300">
          <li>{t.field_vial_mg}: {draft.vialMg.trim() === '' ? t.box4_not_entered : `${draft.vialMg} mg`}</li>
          <li>{t.field_bac_water}: {draft.bacWaterMl.trim() === '' ? t.box4_not_entered : `${draft.bacWaterMl} ml`}</li>
          <li>{t.field_desired_dose}: {draft.desiredDoseMg.trim() === '' ? t.box4_not_entered : `${draft.desiredDoseMg} mg`}</li>
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.assumptions_title}</p>
        <p className="mt-1 text-[11px] text-zinc-400">{t.assumptions_body}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.uncertainty_title}</p>
        <p className="mt-1 text-[11px] text-zinc-400">{t.uncertainty_body}</p>
      </div>
      {input && (
        <p className="mt-1 text-[11px] text-zinc-400">
          {t.mirrored_concentration}: {formatMl(conc)} mg/ml · {t.mirrored_dose_volume}: {formatMl(doseVol)} ml · {t.mirrored_draw_units}: {formatMl(draw.units)} U ({draw.clamped ? t.yes : t.no} clamped) · {t.mirrored_doses_per_vial}: {dosesPerVial}
        </p>
      )}
    </div>
  );

  const renderInputsSummary = (): React.ReactNode => (
    <div data-r6-core="inputs" className="space-y-2 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box4_inputs_label}</p>
      <ul className="space-y-0.5 font-mono text-[11px] text-zinc-300">
        <li>{t.field_vial_mg}: {draft.vialMg.trim() === '' ? t.box4_not_entered : `${draft.vialMg} mg`}</li>
        <li>{t.field_bac_water}: {draft.bacWaterMl.trim() === '' ? t.box4_not_entered : `${draft.bacWaterMl} ml`}</li>
        <li>{t.field_desired_dose}: {draft.desiredDoseMg.trim() === '' ? t.box4_not_entered : `${draft.desiredDoseMg} mg`}</li>
      </ul>
      {!input && <p className="text-[11px] text-zinc-500">{t.box4_waiting}</p>}
    </div>
  );

  const renderWhatIf = (): React.ReactNode => (
    <div data-r6-core="what-if" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box5_intro}</p>
      <ul className="space-y-1">
        {probes.map((probe) => (
          <li key={probe.id} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
            <span className="font-bold text-zinc-200">{probe.label}</span>
            <span className="ms-2 text-zinc-400">{probeSummary(probe, 'box5_changed', 'box5_unchanged')}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-zinc-500">{t.box6_effect_recommendation}</p>
    </div>
  );

  const renderSensitivity = (): React.ReactNode => (
    <div data-r6-core="sensitivity" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box6_intro}</p>
      <ul className="space-y-1">
        {probes.map((probe) => (
          <li key={probe.id} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
            <span className="font-bold text-zinc-200">{probe.label}</span>
            <span className="ms-2 text-zinc-400">{probeSummary(probe, 'box6_effect_status', 'box6_effect_no_status')}</span>
          </li>
        ))}
      </ul>
      {!anyFlip && <p className="text-[11px] text-amber-300">{t.box6_no_single_change}</p>}
      <p className="text-[11px] text-zinc-500">{t.box6_effect_recommendation}</p>
    </div>
  );

  const renderSafety = (): React.ReactNode => {
    const warnings = result?.warnings ?? [];
    return (
      <div data-r6-core="c3" className="space-y-2 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.warnings_title}</p>
          {warnings.length === 0 ? (
            <p className="mt-1 text-[11px] text-zinc-300">{result ? t.no_warnings : t.state_waiting}</p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-amber-200">
              {warnings.map((code) => (<li key={code}>{warningLabel(code)}</li>))}
            </ul>
          )}
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.referral_title}</p>
          <p className="mt-1 text-[11px] text-zinc-400">{t.referral_not_available}</p>
          <p className="mt-1 text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p>
        </div>
      </div>
    );
  };

  const renderCrossTool = (): React.ReactNode => (
    <div data-r6-core="cross-tool" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box8_intro}</p>
      <ul className="space-y-2">
        {TOOL_051_CROSS_TOOL_LINKS.map((link) => {
          const linkTool = requireTool(link.targetToolId);
          const keys = CROSS_TOOL_KEYS[link.targetToolId];
          return (
            <li key={link.targetToolId} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
              <p className="font-bold text-zinc-200">{isAr ? linkTool.titleAr : linkTool.titleEn}</p>
              <p className="mt-1 text-zinc-400">
                <span className="font-bold">{t.box8_mapped_fields}:</span>{' '}
                {link.mappedFields.map((f) => `${keys ? t[keys.field] : f.targetField} — ${keys ? t[keys.note] : f.note}`).join('; ')}
              </p>
              <p className="text-zinc-400">
                <span className="font-bold">{t.box8_freshness}:</span>{' '}
                {keys ? t[keys.freshness] : link.freshnessRule}
              </p>
              <p className="text-zinc-500">
                <span className="font-bold">{t.box8_link_note}:</span> {t.box8_transfer_manual}
              </p>
            </li>
          );
        })}
      </ul>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box8_prev_next}</p>
        <p className="mt-1 text-[11px] text-zinc-400">
          <a className="text-cyan-300 underline" href={`/smarttools/${prevTool.slug}`}>{isAr ? prevTool.titleAr : prevTool.titleEn}</a>
          {' · '}
          <a className="text-cyan-300 underline" href={`/smarttools/${nextTool.slug}`}>{isAr ? nextTool.titleAr : nextTool.titleEn}</a>
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">{t.box8_calculated_at}: {output ? output.calculatedAt : t.state_waiting}</p>
      </div>
      <p className="text-[11px] text-zinc-500">{t.box8_no_transfer}</p>
    </div>
  );

  const renderSources = (): React.ReactNode => (
    <div data-r6-core="c4" className="space-y-2 text-sm">
      <p className="text-xs font-bold text-zinc-200">{t.evidence_none}</p>
      <p className="text-[11px] text-zinc-400">{t.evidence_pending_review}</p>
      <p className="text-[11px] text-zinc-500">{t.evidence_no_invented_range}</p>
      <p className="text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p>
    </div>
  );

  const renderNextActions = (): React.ReactNode => (
    <div data-r6-core="c5" className="space-y-2 text-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.next_step}</p>
        <p className="mt-1 text-xs text-zinc-300">{t.c5_not_available}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.do_not}</p>
        <p className="mt-1 text-xs text-zinc-200">{t.not_a_diagnosis}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.seek_care}</p>
        <p className="mt-1 text-xs text-zinc-300">{t.c5_not_available}</p>
      </div>
      <p className="text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2" data-r6-rating="session_only_not_saved">
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box12_rating}</p>
        <div className="mt-1 flex gap-1" role="group" aria-label={t.box12_rating_aria}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" aria-pressed={rating === value} onClick={() => setRating(value)}
              className={`rounded border px-2 py-0.5 text-xs font-bold ${rating === value ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-zinc-700 bg-zinc-800 text-zinc-200'}`}>
              {value}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-zinc-500">{t.box12_rating_not_saved}</p>
      </div>
    </div>
  );

  const kpi = (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_concentration}</span>
        <span className="font-mono text-sm font-bold text-lime-300">{result ? formatMl(result.concentration_mg_per_ml) : '—'}</span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_dose_volume}</span>
        <span className="font-mono text-sm font-bold text-zinc-100">{result ? formatMl(result.dose_volume_ml) : '—'}</span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_draw_units}</span>
        <span className="font-mono text-sm font-bold text-amber-300">{result ? formatMl(result.draw_units_u100) : '—'}</span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_doses_per_vial}</span>
        <span className="font-mono text-sm font-bold text-cyan-300">{result ? result.doses_per_vial : '—'}</span>
      </div>
    </div>
  );

  const renderExport = (): React.ReactNode => (
    <div data-r6-core="export" className="space-y-2 text-sm">
      <p className="text-xs text-zinc-400">{t.box10_intro}</p>
      <button type="button" disabled={!result || !input} onClick={() => {
        if (!result || !input) return;
        if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
        const csv = buildPeptideDoseCsv(input, result, output?.calculatedAt ?? options.calculatedAt);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tool-051-peptide-dosage-calculator.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-100 hover:bg-zinc-700 disabled:opacity-40">
        {t.box10_button}
      </button>
      <p className="text-[11px] text-zinc-500">{result ? t.box10_note : t.box10_unavailable}</p>
    </div>
  );

  const boxes: BoxDefinition[] = [
    { n: 1, id: 'kpi', titleKey: 'box1_title', source: 'engine', content: (<div className="space-y-2 text-sm">{kpi}<p className="text-[11px] text-zinc-500">{t.box1_note}</p></div>) },
    { n: 2, id: 'primary', titleKey: 'box2_title', source: 'engine', content: renderPrimaryResult() },
    { n: 3, id: 'calculated', titleKey: 'box3_title', source: 'static', content: renderHowCalculated() },
    { n: 4, id: 'inputs', titleKey: 'box4_title', source: 'static', content: renderInputsSummary() },
    { n: 5, id: 'what-if', titleKey: 'box5_title', source: 'engine', content: renderWhatIf() },
    { n: 6, id: 'sensitivity', titleKey: 'box6_title', source: 'engine', content: renderSensitivity() },
    { n: 7, id: 'safety', titleKey: 'box7_title', source: 'engine', content: renderSafety() },
    { n: 8, id: 'cross-tool', titleKey: 'box8_title', source: 'static', content: renderCrossTool() },
    { n: 9, id: 'sources', titleKey: 'box9_title', source: 'not_available', content: renderSources() },
    { n: 10, id: 'export', titleKey: 'box10_title', source: 'static', content: renderExport() },
    { n: 11, id: 'history', titleKey: 'box11_title', source: 'not_available', content: <p className="text-xs text-zinc-400">{t.box11_na}</p> },
    { n: 12, id: 'next-actions', titleKey: 'box12_title', source: 'static', content: renderNextActions() },
  ];

  const compactBoxes = [boxes[1], boxes[2], boxes[6], boxes[8], boxes[11]];
  const visibleBoxes = compact ? compactBoxes : boxes;

  return (
    <section className="mt-8 space-y-4" aria-label={t.genius_section_label} data-r6-genius="tool-051" data-r6-genius-state={state}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{compact ? t.genius_title_compact : t.genius_title}</h2>
        <div className="flex gap-2" role="group" aria-label={t.genius_mode_label}>
          <button type="button" onClick={() => setCompact(true)} aria-pressed={compact} className={`rounded px-3 py-1 text-xs font-bold ${compact ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-200'}`}>{t.genius_compact}</button>
          <button type="button" onClick={() => setCompact(false)} aria-pressed={!compact} className={`rounded px-3 py-1 text-xs font-bold ${!compact ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-200'}`}>{t.genius_full}</button>
        </div>
      </div>
      {visibleBoxes.map((box) => {
        const badge = SOURCE_BADGES[box.source];
        return (
          <article key={box.id} data-r6-box={String(box.n)} data-r6-box-id={box.id} data-r6-box-source={box.source} className={`rounded border p-4 ${BOX_TINT[box.n - 1] ?? BOX_TINT[0]}`}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold">
                <span className="me-1 font-mono text-zinc-500">{box.n}.</span>
                {t[box.titleKey]}
              </h3>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
                {isAr ? badge.ar : badge.en}
              </span>
            </div>
            {box.content}
          </article>
        );
      })}
    </section>
  );
}
