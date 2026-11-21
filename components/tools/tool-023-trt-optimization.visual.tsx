'use client';
/**
 * components/tools/tool-023-trt-optimization.visual.tsx
 * ═══════════════════════════════════════════════════════
 * Tool #023 — P-01: TRT visual gauge layer
 * Renders gauge bars for Trough T, E2, and Hematocrit.
 */
import React from 'react';
import {
  getTroughTBand,
  getE2Band,
  getHematocritBand,
  TOOL_023_REFERENCE_LIMITS,
  type Tool023Band,
} from '@/lib/tools/r6/tool-023-trt-optimization-contract';
import type { TrtResult } from '@/lib/tools/schemas/tool-023-trt-optimization';

export interface Tool023VisualProps {
  troughT: number | null;
  e2: number | null;
  hematocrit: number | null;
  result: TrtResult | null;
  locale: 'ar' | 'en';
}

function getBandColor(band: Tool023Band | null): string {
  switch (band) {
    case 'optimal': return 'bg-emerald-500';
    case 'borderline': return 'bg-amber-500';
    case 'high': return 'bg-rose-500';
    case 'low': return 'bg-sky-500';
    default: return 'bg-zinc-600';
  }
}

function getBandTextColor(band: Tool023Band | null): string {
  switch (band) {
    case 'optimal': return 'text-emerald-300';
    case 'borderline': return 'text-amber-300';
    case 'high': return 'text-rose-300';
    case 'low': return 'text-sky-300';
    default: return 'text-zinc-400';
  }
}

function clampPct(val: number, min: number, max: number): number {
  return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
}

interface GaugeBarProps {
  label: string;
  value: number | null;
  unit: string;
  band: Tool023Band | null;
  pct: number;
}

function GaugeBar({ label, value, unit, band, pct }: GaugeBarProps) {
  const color = getBandColor(band);
  const textColor = getBandTextColor(band);
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-zinc-400">{label}</span>
        {value !== null && (
          <span className={`text-xs font-semibold ${textColor}`}>
            {value} {unit} {band ? `(${band})` : ''}
          </span>
        )}
      </div>
      <div className="relative h-2 w-full rounded-full bg-zinc-700 overflow-hidden">
        {value !== null && (
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

export default function Tool023Visual({ troughT, e2, hematocrit, result, locale }: Tool023VisualProps) {
  const isAr = locale === 'ar';

  const troughTBand = troughT !== null ? getTroughTBand(troughT) : null;
  const e2Band = e2 !== null ? getE2Band(e2) : null;
  const hematocritBand = hematocrit !== null ? getHematocritBand(hematocrit) : null;

  const tLim = TOOL_023_REFERENCE_LIMITS.troughT;
  const e2Lim = TOOL_023_REFERENCE_LIMITS.e2;
  const hctLim = TOOL_023_REFERENCE_LIMITS.hematocrit;

  const troughTPct = troughT !== null ? clampPct(troughT, 0, 1500) : 0;
  const e2Pct = e2 !== null ? clampPct(e2, 0, 80) : 0;
  const hctPct = hematocrit !== null ? clampPct(hematocrit, 30, 70) : 0;

  return (
    <div data-r6-visual="tool-023" className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      {/* Illustration / diagram area */}
      <div data-r6-illustration="tool-023" className="mb-4 flex items-center justify-center">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          aria-label="TRT Optimization diagram"
          className="opacity-70"
        >
          <circle cx="40" cy="40" r="36" fill="none" stroke="#6366f1" strokeWidth="2" />
          <circle cx="40" cy="40" r="26" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x="40" y="38" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="bold">TRT</text>
          <text x="40" y="50" textAnchor="middle" fill="#7c3aed" fontSize="8">OPT</text>
          {/* Testosterone molecule-like lines */}
          <line x1="40" y1="4" x2="40" y2="14" stroke="#6366f1" strokeWidth="1.5" />
          <line x1="40" y1="66" x2="40" y2="76" stroke="#6366f1" strokeWidth="1.5" />
          <line x1="4" y1="40" x2="14" y2="40" stroke="#6366f1" strokeWidth="1.5" />
          <line x1="66" y1="40" x2="76" y2="40" stroke="#6366f1" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Gauge bars */}
      <GaugeBar
        label={isAr ? 'تستوستيرون القاع' : 'Trough Testosterone'}
        value={troughT}
        unit="ng/dL"
        band={troughTBand}
        pct={troughTPct}
      />
      <GaugeBar
        label={isAr ? 'إستراديول E2' : 'Estradiol E2'}
        value={e2}
        unit="pg/mL"
        band={e2Band}
        pct={e2Pct}
      />
      <GaugeBar
        label={isAr ? 'الهيماتوكريت' : 'Hematocrit'}
        value={hematocrit}
        unit="%"
        band={hematocritBand}
        pct={hctPct}
      />

      {/* Accessible results table */}
      <table
        data-r6-table="tool-023"
        className="w-full text-xs mt-4 border-collapse"
        aria-label={isAr ? 'نتائج TRT' : 'TRT Results'}
      >
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="text-left py-1 text-zinc-400 font-medium">{isAr ? 'المقياس' : 'Metric'}</th>
            <th className="text-right py-1 text-zinc-400 font-medium">{isAr ? 'القيمة' : 'Value'}</th>
            <th className="text-right py-1 text-zinc-400 font-medium">{isAr ? 'النطاق' : 'Band'}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-zinc-800/50">
            <td className="py-1 text-zinc-300">{isAr ? 'تستوستيرون القاع' : 'Trough T'}</td>
            <td className="py-1 text-right text-zinc-200">{troughT !== null ? `${troughT} ng/dL` : '—'}</td>
            <td className={`py-1 text-right font-semibold ${getBandTextColor(troughTBand)}`}>
              {troughTBand ?? '—'}
            </td>
          </tr>
          <tr className="border-b border-zinc-800/50">
            <td className="py-1 text-zinc-300">{isAr ? 'إستراديول E2' : 'Estradiol E2'}</td>
            <td className="py-1 text-right text-zinc-200">{e2 !== null ? `${e2} pg/mL` : '—'}</td>
            <td className={`py-1 text-right font-semibold ${getBandTextColor(e2Band)}`}>
              {e2Band ?? '—'}
            </td>
          </tr>
          <tr>
            <td className="py-1 text-zinc-300">{isAr ? 'الهيماتوكريت' : 'Hematocrit'}</td>
            <td className="py-1 text-right text-zinc-200">{hematocrit !== null ? `${hematocrit}%` : '—'}</td>
            <td className={`py-1 text-right font-semibold ${getBandTextColor(hematocritBand)}`}>
              {hematocritBand ?? '—'}
            </td>
          </tr>
          {result && (
            <tr className="border-t border-zinc-700">
              <td className="py-1 text-zinc-300">{isAr ? 'الجرعة الموصى بها' : 'Recommended Dose'}</td>
              <td className="py-1 text-right text-emerald-300 font-semibold" colSpan={2}>
                {result.recommended_dose_mg_weekly} mg/week
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
