'use client';
/**
 * components/tools/tool-043-prolactin-management.visual.tsx
 * Tool #043 — P-01: Prolactin visual gauge layer
 */
import React from 'react';
import type { ProlactinResult } from '@/lib/tools/schemas/tool-043-prolactin-management';
import { TOOL_043_REFERENCE_LIMITS } from '@/lib/tools/r6/tool-043-prolactin-management-contract';

export interface Tool043VisualProps {
  prolactinLevel: number | null;
  result: ProlactinResult | null;
  locale: 'ar' | 'en';
}

export default function Tool043Visual({
  prolactinLevel,
  result,
  locale,
}: Tool043VisualProps) {
  const isAr = locale === 'ar';
  const limits = TOOL_043_REFERENCE_LIMITS.prolactin;

  const band = result ? result.band : null;

  const bandColor =
    band === 'very-high' ? 'bg-red-500' :
    band === 'high' ? 'bg-orange-500' :
    band === 'borderline' ? 'bg-amber-400' :
    'bg-emerald-500';

  const max = 75;
  const currentVal = prolactinLevel ?? 0;
  const pct = Math.min(100, (currentVal / max) * 100);

  return (
    <div className="space-y-4" data-r6-visual="tool-043">
      {/* Gauge and Status Illustration */}
      <div
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5"
        data-r6-illustration="tool-043"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-200">
            {isAr ? 'مقياس نطاق البرولاكتين' : 'Prolactin Dynamic Range Gauge'}
          </h3>
          {result && (
            <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase ${
              band === 'very-high' ? 'bg-red-950/60 text-red-300 border border-red-800' :
              band === 'high' ? 'bg-orange-950/60 text-orange-300 border border-orange-800' :
              band === 'borderline' ? 'bg-amber-950/60 text-amber-300 border border-amber-800' :
              'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
            }`}>
              {result.band}
            </span>
          )}
        </div>

        {/* Range bar */}
        <div className="relative h-4 w-full rounded-full bg-zinc-800 overflow-hidden mb-2">
          {/* Normal range */}
          <div className="absolute top-0 left-0 h-full bg-emerald-950/50" style={{ width: `${(20 / max) * 100}%` }} />
          {/* Borderline */}
          <div className="absolute top-0 h-full bg-amber-950/50" style={{ left: `${(20 / max) * 100}%`, width: `${(5 / max) * 100}%` }} />
          {/* High */}
          <div className="absolute top-0 h-full bg-orange-950/50" style={{ left: `${(25 / max) * 100}%`, width: `${(25 / max) * 100}%` }} />
          {/* Current indicator */}
          <div
            className={`absolute top-0 h-full rounded-full transition-all duration-300 ${bandColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
          <span>0</span>
          <span>Normal (&lt;20)</span>
          <span>Borderline (20-25)</span>
          <span>High (&gt;25)</span>
          <span>50+</span>
        </div>

        {result && (
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              {isAr ? 'الجرعة الأسبوعية المقترحة لكابيرجولين:' : 'Suggested Weekly Cabergoline:'}
            </span>
            <span className="font-bold font-mono text-lime-400">
              {result.suggested_weekly_mcg} mcg/week
            </span>
          </div>
        )}
      </div>

      {/* Accessible Table */}
      <div className="sr-only">
        <table data-r6-table="tool-043">
          <caption>Prolactin Management Analysis</caption>
          <thead>
            <tr><th>Metric</th><th>Value</th></tr>
          </thead>
          <tbody>
            <tr><td>Prolactin Level</td><td>{prolactinLevel ?? '-'} ng/mL</td></tr>
            <tr><td>Classification Band</td><td>{result ? result.band : '-'}</td></tr>
            <tr><td>Action Recommendation</td><td>{result ? result.action : '-'}</td></tr>
            <tr><td>Suggested Cabergoline</td><td>{result ? `${result.suggested_weekly_mcg} mcg` : '-'}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
