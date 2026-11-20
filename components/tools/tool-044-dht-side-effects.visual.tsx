'use client';
/**
 * components/tools/tool-044-dht-side-effects.visual.tsx
 * Tool #044 — P-01: DHT side effect risk gauges layer
 */
import React from 'react';
import type { DhtResult } from '@/lib/tools/schemas/tool-044-dht-side-effects';

export interface Tool044VisualProps {
  dhtLevel: number | null;
  result: DhtResult | null;
  locale: 'ar' | 'en';
}

function RiskBar({
  label,
  pct,
}: {
  label: string;
  pct: number;
}) {
  let color = 'bg-emerald-500';
  if (pct > 66) color = 'bg-rose-500';
  else if (pct > 33) color = 'bg-amber-500';

  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span className="font-mono font-bold text-white">{pct}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Tool044Visual({
  dhtLevel,
  result,
  locale,
}: Tool044VisualProps) {
  const isAr = locale === 'ar';

  return (
    <div className="space-y-4" data-r6-visual="tool-044">
      {/* Risk Illustration & Gauges */}
      <div
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5"
        data-r6-illustration="tool-044"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-200">
            {isAr ? 'مؤشرات أخطار الديهيدروتستوستيرون (DHT)' : 'DHT Side Effect Risk Spectrum'}
          </h3>
          {result && (
            <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase ${
              result.band === 'high' ? 'bg-red-950/60 text-red-300 border border-red-800' :
              result.band === 'moderate' ? 'bg-amber-950/60 text-amber-300 border border-amber-800' :
              'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
            }`}>
              {result.band} Risk
            </span>
          )}
        </div>

        {result ? (
          <div className="space-y-3">
            <RiskBar
              label={isAr ? 'خطر تساقط الشعر الأندروجيني' : 'Androgenetic Alopecia Risk'}
              pct={result.hair_loss_risk_pct}
            />
            <RiskBar
              label={isAr ? 'خطر أعراض تضخم البروستاتا' : 'Prostate Symptom Burden'}
              pct={result.prostate_symptom_risk_pct}
            />
            <RiskBar
              label={isAr ? 'العبء الأندروجيني الكلي' : 'Overall Androgenic Load'}
              pct={result.overall_burden_pct}
            />
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-zinc-500">
            {isAr ? 'أدخل مستويات DHT والمتغيرات لعرض تقييم المخاطر' : 'Enter DHT level and clinical parameters to assess androgenic risk profile'}
          </div>
        )}
      </div>

      {/* Accessible Table */}
      <div className="sr-only">
        <table data-r6-table="tool-044">
          <caption>DHT Side Effects Evaluation</caption>
          <thead>
            <tr><th>Metric</th><th>Value</th></tr>
          </thead>
          <tbody>
            <tr><td>DHT Level</td><td>{dhtLevel ?? '-'} ng/dL</td></tr>
            <tr><td>Hair Loss Risk</td><td>{result ? `${result.hair_loss_risk_pct}%` : '-'}</td></tr>
            <tr><td>Prostate Risk</td><td>{result ? `${result.prostate_symptom_risk_pct}%` : '-'}</td></tr>
            <tr><td>Overall Burden</td><td>{result ? `${result.overall_burden_pct}%` : '-'}</td></tr>
            <tr><td>Risk Band</td><td>{result ? result.band : '-'}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
