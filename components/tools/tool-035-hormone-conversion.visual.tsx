'use client';
/**
 * components/tools/tool-035-hormone-conversion.visual.tsx
 * ═══════════════════════════════════════════════════════════
 * Tool #035 — P-01: Hormone Conversion Visual Layer
 *
 * Renders conversion pathway visualization and gauge bars.
 */
import React from 'react';
import type { ConversionResult } from '@/lib/tools/schemas/tool-035-hormone-conversion';
import { TOOL_035_REFERENCE_LIMITS } from '@/lib/tools/r6/tool-035-hormone-conversion-contract';

export interface Tool035VisualProps {
  analyte: 'testosterone' | 'estradiol' | null;
  inputValue: number | null;
  inputUnit: string | null;
  result: ConversionResult | null;
  locale: 'ar' | 'en';
}

function getRefLimits(analyte: string | null, unit: string | null) {
  if (!analyte || !unit) return null;
  if (analyte === 'testosterone') {
    if (unit === 'ng/dL') return TOOL_035_REFERENCE_LIMITS.testosterone_ng_dL;
    if (unit === 'nmol/L') return TOOL_035_REFERENCE_LIMITS.testosterone_nmol_L;
  }
  if (analyte === 'estradiol') {
    if (unit === 'pg/mL') return TOOL_035_REFERENCE_LIMITS.estradiol_pg_mL;
    if (unit === 'pmol/L') return TOOL_035_REFERENCE_LIMITS.estradiol_pmol_L;
  }
  return null;
}

function GaugeBar({
  value,
  limits,
  label,
  unit,
}: {
  value: number;
  limits: { low: number; optimalMin: number; optimalMax: number; high: number };
  label: string;
  unit: string;
}) {
  const max = limits.high * 1.2;
  const pct = Math.min(100, (value / max) * 100);
  const optMinPct = (limits.optimalMin / max) * 100;
  const optMaxPct = (limits.optimalMax / max) * 100;

  let barColor = 'bg-zinc-500';
  if (value < limits.low) barColor = 'bg-sky-500';
  else if (value < limits.optimalMin) barColor = 'bg-amber-400';
  else if (value <= limits.optimalMax) barColor = 'bg-emerald-500';
  else if (value <= limits.high) barColor = 'bg-amber-500';
  else barColor = 'bg-rose-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span className="font-mono font-bold text-white">{value} {unit}</span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
        {/* Optimal zone */}
        <div
          className="absolute top-0 h-full bg-emerald-900/50"
          style={{ left: `${optMinPct}%`, width: `${optMaxPct - optMinPct}%` }}
        />
        {/* Value bar */}
        <div
          className={`absolute top-0 h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600 mt-0.5">
        <span>0</span>
        <span className="text-emerald-600">Optimal: {limits.optimalMin}–{limits.optimalMax}</span>
        <span>{limits.high}+</span>
      </div>
    </div>
  );
}

export default function Tool035Visual({
  analyte,
  inputValue,
  inputUnit,
  result,
  locale,
}: Tool035VisualProps) {
  const isAr = locale === 'ar';

  const inputLimits = getRefLimits(analyte, inputUnit);
  const resultLimits = result ? getRefLimits(result.analyte, result.result_unit) : null;

  return (
    <div className="space-y-5" data-r6-visual="tool-035">
      {/* Illustration: Conversion Pathway */}
      <div
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5"
        data-r6-illustration="tool-035"
      >
        <h3 className="text-sm font-bold text-zinc-200 mb-3">
          {isAr ? 'مسار تحويل الوحدة' : 'Unit Conversion Pathway'}
        </h3>

        {result ? (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {isAr ? 'القيمة المدخلة' : 'Input Value'}
              </span>
              <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 px-5 py-3 text-center">
                <span className="text-2xl font-bold text-cyan-400 font-mono">{result.input_value}</span>
                <span className="block text-xs text-cyan-300 mt-0.5">{result.input_unit}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-0.5 text-zinc-500">
              <span className="text-2xl">→</span>
              <span className="text-[10px]">×{result.conversion_factor}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {isAr ? 'القيمة المحولة' : 'Converted Value'}
              </span>
              <div className="rounded-xl border border-lime-500/40 bg-lime-950/20 px-5 py-3 text-center">
                <span className="text-2xl font-bold text-lime-400 font-mono">{result.result_value}</span>
                <span className="block text-xs text-lime-300 mt-0.5">{result.result_unit}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-500 text-sm">
            {isAr ? 'أدخل بياناتك لعرض مسار التحويل' : 'Enter your data to display the conversion pathway'}
          </div>
        )}

        {result && (
          <p className="text-center text-xs text-zinc-500 mt-3 font-mono">
            {result.calculation_method.replace(/_/g, ' ')}
          </p>
        )}
      </div>

      {/* Gauge bars */}
      {result && inputLimits && resultLimits && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="text-sm font-bold text-zinc-200 mb-3">
            {isAr ? 'النطاقات المرجعية' : 'Reference Ranges'}
          </h3>
          <GaugeBar
            value={result.input_value}
            limits={inputLimits}
            label={`${isAr ? 'المدخل' : 'Input'} (${result.input_unit})`}
            unit={result.input_unit}
          />
          <GaugeBar
            value={result.result_value}
            limits={resultLimits}
            label={`${isAr ? 'المحول' : 'Converted'} (${result.result_unit})`}
            unit={result.result_unit}
          />
        </div>
      )}

      {/* Accessible data table */}
      <div className="sr-only">
        <table data-r6-table="tool-035">
          <caption>Hormone Conversion Results</caption>
          <thead>
            <tr><th>Field</th><th>Value</th></tr>
          </thead>
          <tbody>
            <tr><td>Analyte</td><td>{result ? result.analyte : (analyte || '-')}</td></tr>
            <tr><td>Input</td><td>{result ? `${result.input_value} ${result.input_unit}` : (inputValue !== null ? `${inputValue} ${inputUnit || ''}` : '-')}</td></tr>
            <tr><td>Result</td><td>{result ? `${result.result_value} ${result.result_unit}` : '-'}</td></tr>
            <tr><td>Conversion Factor</td><td>{result ? String(result.conversion_factor) : '-'}</td></tr>
            <tr><td>Method</td><td>{result ? result.calculation_method : '-'}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
