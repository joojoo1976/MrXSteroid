'use client';
/**
 * components/tools/tool-006-estrogen-prolactin.visual.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #006 — P-01: Dual Endocrine Visual Gauges & Accessible Data Layer
 *
 * Renders the visual representation:
 * 1. Educational HPTA & Aromatase diagram (renders in every state).
 * 2. Visual scales for Sensitive Estradiol (E2) and Prolactin.
 * 3. Derived E2 / Total Testosterone physiological ratio bar (P-02).
 * 4. Rich interactive tooltips for each marker.
 * 5. Screen-reader accessible equivalent data table.
 * 6. Mobile 390px responsive with zero overflow.
 * ═════════════════════════════════════════════════════════════════════
 */
import React, { useState } from 'react';
import {
  getE2Band,
  getProlactinBand,
  computeE2TRatio,
  TOOL_006_REFERENCE_LIMITS,
  type Tool006Band,
} from '@/lib/tools/r6/tool-006-estrogen-prolactin-contract';

export interface Tool006VisualProps {
  locale: 'ar' | 'en';
  e2: number | null;
  e2Unit: string;
  prolactin: number | null;
  prolactinUnit: string;
  tt: number | null;
}

export default function Tool006Visual({
  locale,
  e2,
  e2Unit,
  prolactin,
  prolactinUnit,
  tt,
}: Tool006VisualProps) {
  const isAr = locale === 'ar';
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const e2Normalized = e2 !== null ? (e2Unit === 'pmol/L' ? Math.round(e2 / 3.67) : e2) : null;
  const prlNormalized = prolactin !== null ? (prolactinUnit === 'mIU/L' ? Math.round(prolactin / 21.2) : prolactin) : null;
  const e2Band: Tool006Band | null = e2Normalized !== null ? getE2Band(e2Normalized) : null;
  const prlBand: Tool006Band | null = prlNormalized !== null ? getProlactinBand(prlNormalized) : null;
  const ratio = e2Normalized !== null && tt !== null && tt > 0 ? computeE2TRatio(e2Normalized, tt) : null;

  const getBandColor = (band: Tool006Band | null) => {
    switch (band) {
      case 'optimal':
        return 'bg-emerald-500 text-emerald-300 border-emerald-500/30';
      case 'borderline':
        return 'bg-amber-500 text-amber-300 border-amber-500/30';
      case 'high':
        return 'bg-rose-500 text-rose-300 border-rose-500/30';
      case 'low':
        return 'bg-sky-500 text-sky-300 border-sky-500/30';
      default:
        return 'bg-zinc-700 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6" data-r6-visual="tool-006">
      {/* ── 1. HPTA Endocrine Flow Illustration (Renders in every state) ── */}
      <div
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5"
        data-r6-illustration="tool-006"
      >
        <div className="mb-3">
          <h3 className="text-sm font-bold text-zinc-200">
            {isAr ? 'مسار توازن الإستراديول والبرولاكتين ومحور HPTA' : 'HPTA Endocrine Axis & Aromatase Pathway'}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isAr
              ? 'مخطط توضيحي لكيفية تحول التستوستيرون وتأثير مستقبلات الدوبامين على البرولاكتين'
              : 'Physiological diagram illustrating testosterone aromatization and dopamine-mediated prolactin regulation'}
          </p>
        </div>

        <div className="relative overflow-x-auto py-2">
          <svg viewBox="0 0 760 140" className="w-full min-w-[500px] h-auto select-none" aria-label="Endocrine Pathway Diagram">
            <defs>
              <linearGradient id="grad-t" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad-e2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad-prl" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Nodes */}
            <g transform="translate(30, 25)">
              <rect width="180" height="90" rx="10" fill="#18181b" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="90" y="32" textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="bold">Total Testosterone</text>
              <text x="90" y="52" textAnchor="middle" fill="#60a5fa" fontSize="10">{isAr ? 'التستوستيرون الكلي' : 'Substrate Pool'}</text>
              <text x="90" y="74" textAnchor="middle" fill="#9ca3af" fontSize="9">300 – 1000 ng/dL</text>
            </g>

            {/* Aromatase arrow */}
            <path d="M 215 70 L 295 70" stroke="#ec4899" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
            <text x="255" y="60" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold">CYP19A1 (Aromatase)</text>

            <g transform="translate(300, 25)">
              <rect width="190" height="90" rx="10" fill="#18181b" stroke="#ec4899" strokeWidth="1.5" />
              <text x="95" y="32" textAnchor="middle" fill="#fbcfe8" fontSize="12" fontWeight="bold">Estradiol (E2)</text>
              <text x="95" y="52" textAnchor="middle" fill="#f472b6" fontSize="10">{isAr ? 'الإستراديول الحساس' : 'Sensitive LC-MS/MS'}</text>
              <text x="95" y="74" textAnchor="middle" fill="#9ca3af" fontSize="9">15 – 35 pg/mL (Target)</text>
            </g>

            {/* Prolactin Node */}
            <g transform="translate(535, 25)">
              <rect width="190" height="90" rx="10" fill="#18181b" stroke="#10b981" strokeWidth="1.5" />
              <text x="95" y="32" textAnchor="middle" fill="#a7f3d0" fontSize="12" fontWeight="bold">Prolactin (PRL)</text>
              <text x="95" y="52" textAnchor="middle" fill="#34d399" fontSize="10">{isAr ? 'البرولاكتين النخامي' : 'Pituitary Hormone'}</text>
              <text x="95" y="74" textAnchor="middle" fill="#9ca3af" fontSize="9">2 – 15 ng/mL (Target)</text>
            </g>
          </svg>
        </div>
      </div>

      {/* ── 2. Dual Visual Range Bars (P-01) ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5">
        <h4 className="mb-3 text-sm font-bold text-zinc-200">
          {isAr ? 'النطاقات الفسيولوجية ومقياس القراءات الحالية' : 'Endocrine Physiological Range Gauges'}
        </h4>

        <div className="space-y-5">
          {/* Estradiol Bar */}
          <div
            className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5"
            data-r6-bar="E2"
            onMouseEnter={() => setActiveTooltip('e2')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-pink-400">Estradiol (E2)</span>
                {e2Band && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBandColor(e2Band)}`}>
                    {e2Band.toUpperCase()}
                  </span>
                )}
              </div>
              <span className="font-mono text-xs font-bold text-zinc-200">
                {e2Normalized !== null ? `${e2Normalized} pg/mL` : isAr ? 'بانتظار الإدخال' : 'Pending input'}
              </span>
            </div>

            {/* Progress Track */}
            <div className="relative h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-[15%] w-[20%] bg-emerald-500/30 border-x border-emerald-500/50" title="Optimal Range (15-35 pg/mL)" />
              <div className="absolute inset-y-0 left-[35%] w-[15%] bg-amber-500/30 border-r border-amber-500/50" title="Borderline (35-50 pg/mL)" />
              <div className="absolute inset-y-0 left-[50%] w-[50%] bg-rose-500/30" title="Elevated (>50 pg/mL)" />
              {e2Normalized !== null && (
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-pink-400 rounded-full shadow-[0_0_8px_rgba(244,114,182,0.8)] transition-all duration-300"
                  style={{
                    left: `calc(${Math.min(100, Math.max(0, (e2Normalized / 100) * 100))}% - 5px)`,
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
              <span>0</span>
              <span className="text-emerald-400 font-semibold">15 (Optimal)</span>
              <span className="text-emerald-400 font-semibold">35</span>
              <span className="text-amber-400">50 (Borderline)</span>
              <span>100+ pg/mL</span>
            </div>
          </div>

          {/* Prolactin Bar */}
          <div
            className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5"
            data-r6-bar="PRL"
            onMouseEnter={() => setActiveTooltip('prolactin')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">Prolactin (PRL)</span>
                {prlBand && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBandColor(prlBand)}`}>
                    {prlBand.toUpperCase()}
                  </span>
                )}
              </div>
              <span className="font-mono text-xs font-bold text-zinc-200">
                {prlNormalized !== null ? `${prlNormalized} ng/mL` : isAr ? 'بانتظار الإدخال' : 'Pending input'}
              </span>
            </div>

            {/* Progress Track */}
            <div className="relative h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-[4%] w-[26%] bg-emerald-500/30 border-x border-emerald-500/50" title="Optimal Range (2-15 ng/mL)" />
              <div className="absolute inset-y-0 left-[30%] w-[20%] bg-amber-500/30 border-r border-amber-500/50" title="Borderline (15-25 ng/mL)" />
              <div className="absolute inset-y-0 left-[50%] w-[50%] bg-rose-500/30" title="Elevated (>25 ng/mL)" />
              {prlNormalized !== null && (
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300"
                  style={{
                    left: `calc(${Math.min(100, Math.max(0, (prlNormalized / 50) * 100))}% - 5px)`,
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
              <span>0</span>
              <span className="text-emerald-400 font-semibold">2 (Min)</span>
              <span className="text-emerald-400 font-semibold">15 (Upper Normal)</span>
              <span className="text-amber-400">25 (Borderline)</span>
              <span>50+ ng/mL</span>
            </div>
          </div>

          {/* Derived E2/T Ratio Bar (P-02) */}
          {ratio !== null && (
            <div
              className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-3.5"
              data-r6-bar="E2T_RATIO"
              onMouseEnter={() => setActiveTooltip('ratio')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-300">
                    {isAr ? 'النسبة الهرمونية المشتقة (E2 / Total T Ratio)' : 'Derived E2 / Total T Ratio (P-02)'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ratio > 6.0 ? 'bg-rose-500 text-rose-300 border-rose-500/30' : 'bg-emerald-500 text-emerald-300 border-emerald-500/30'}`}>
                    {ratio > 6.0 ? 'HIGH AROMATIZATION' : 'EQUILIBRIUM'}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-purple-200">{ratio}%</span>
              </div>
              <div className="relative h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-[30%] w-[25%] bg-emerald-500/40" title="Target Range (3.0% - 5.5%)" />
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                  style={{
                    left: `calc(${Math.min(100, Math.max(0, (ratio / 10) * 100))}% - 5px)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                <span>0%</span>
                <span className="text-emerald-400">3.0%</span>
                <span className="text-emerald-400">5.5% (Optimal)</span>
                <span>10%</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Tooltip */}
        {activeTooltip && (
          <div role="tooltip" className="mt-4 p-3 rounded-lg border border-zinc-700 bg-zinc-950 text-xs text-zinc-300 shadow-xl">
            {activeTooltip === 'e2' && (
              <p>
                <strong>Estradiol (E2): </strong>
                {isAr
                  ? 'الهرمون الإستروجيني الأساسي لدى الذكور. النطاق الأمثل 15-35 pg/mL يحمي صحة العظام والدهون والدماغ، بينما الارتفاع المفرط يسبب التثدي واحتباس السوائل.'
                  : 'Key estrogen fraction in males. Optimal 15–35 pg/mL supports bone mineral density, brain cognition, and cardiovascular lipids without excess gynecomastia risk.'}
              </p>
            )}
            {activeTooltip === 'prolactin' && (
              <p>
                <strong>Prolactin (PRL): </strong>
                {isAr
                  ? 'هرمون تفرزه الغدة النخامية. مستوياته الطبيعية أقل من 15 ng/mL. ارتفاعه قد يؤدي إلى فقدان الرغبة وصعوبة الانتصاب وتحسس الحلمات.'
                  : 'Secreted by anterior pituitary lactotrophs. Normal range is 2–15 ng/mL. Elevation suppresses GnRH/LH and impairs erectile quality.'}
              </p>
            )}
            {activeTooltip === 'ratio' && (
              <p>
                <strong>E2 / Total T Ratio: </strong>
                {isAr
                  ? 'النسبة الفسيولوجية بين الإستراديول والتستوستيرون الكلي. المعدل الطبيعي بين 3% و 5.5% يعكس كفاءة إنزيم الأروماتاز وتوازن الهرمونات.'
                  : 'Derived ratio reflecting aromatase enzyme equilibrium. Optimal 3.0%–5.5% indicates balanced conversion without estrogen dominance.'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Screen-Reader Accessible Data Table ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5" data-r6-table="tool-006">
        <h4 className="mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          {isAr ? 'الجدول البياني المكافئ للشاشات القارئة' : 'Accessible Data Table Equivalent'}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2 text-start">{isAr ? 'التحليل' : 'Marker'}</th>
                <th className="py-2 text-end">{isAr ? 'القيمة' : 'Value'}</th>
                <th className="py-2 text-end">{isAr ? 'الوحدة' : 'Unit'}</th>
                <th className="py-2 text-end">{isAr ? 'النطاق المرجعي' : 'Reference Limit'}</th>
                <th className="py-2 text-end">{isAr ? 'التصنيف' : 'Classification'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              <tr>
                <td className="py-2 font-sans text-zinc-300">Estradiol (E2)</td>
                <td className="py-2 text-end text-white">{e2Normalized !== null ? e2Normalized : '—'}</td>
                <td className="py-2 text-end text-zinc-400">pg/mL</td>
                <td className="py-2 text-end text-zinc-400">15 – 35</td>
                <td className="py-2 text-end text-pink-400">{e2Band ? e2Band.toUpperCase() : 'PENDING'}</td>
              </tr>
              <tr>
                <td className="py-2 font-sans text-zinc-300">Prolactin</td>
                <td className="py-2 text-end text-white">{prlNormalized !== null ? prlNormalized : '—'}</td>
                <td className="py-2 text-end text-zinc-400">ng/mL</td>
                <td className="py-2 text-end text-zinc-400">2 – 15</td>
                <td className="py-2 text-end text-emerald-400">{prlBand ? prlBand.toUpperCase() : 'PENDING'}</td>
              </tr>
              {tt !== null && tt > 0 && (
                <>
                  <tr>
                    <td className="py-2 font-sans text-zinc-300">Total Testosterone</td>
                    <td className="py-2 text-end text-white">{tt}</td>
                    <td className="py-2 text-end text-zinc-400">ng/dL</td>
                    <td className="py-2 text-end text-zinc-400">300 – 1000</td>
                    <td className="py-2 text-end text-blue-400">STANDARD</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-zinc-300">E2/T Ratio</td>
                    <td className="py-2 text-end text-white">{ratio}%</td>
                    <td className="py-2 text-end text-zinc-400">%</td>
                    <td className="py-2 text-end text-zinc-400">3.0 – 5.5%</td>
                    <td className="py-2 text-end text-purple-400">{ratio && ratio > 6.0 ? 'HIGH' : 'OPTIMAL'}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
