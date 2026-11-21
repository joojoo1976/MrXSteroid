'use client';
/**
 * components/tools/tool-015-shbg-modulator.visual.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #015 — P-01: SHBG & Free Testosterone Visual Gauges & Binding Map
 *
 * Visual representations:
 * 1. Androgen binding partition diagram (SHBG vs Albumin vs Free T).
 * 2. Visual scale for SHBG level (Low <15, Normal 15-50, High >50 nmol/L).
 * 3. Visual gauge for calculated Free Testosterone (Vermeulen mass-action).
 * 4. Derived Free Androgen Index (FAI) bar (P-02).
 * 5. Screen-reader accessible data table.
 * 6. Responsive 390px compliant layout.
 * ═════════════════════════════════════════════════════════════════════
 */
import React, { useState } from 'react';
import {
  getShbgBand,
  computeFAI,
  TOOL_015_REFERENCE_LIMITS,
  type Tool015ShbgBand,
} from '@/lib/tools/r6/tool-015-shbg-modulator-contract';

export interface Tool015VisualProps {
  locale: 'ar' | 'en';
  totalT: number | null;
  shbg: number | null;
  albumin: number | null;
  freeT: number | null;
  freeTPct: number | null;
  bioavailableT: number | null;
}

export default function Tool015Visual({
  locale,
  totalT,
  shbg,
  albumin,
  freeT,
  freeTPct,
  bioavailableT,
}: Tool015VisualProps) {
  const isAr = locale === 'ar';
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const shbgBand: Tool015ShbgBand | null = shbg !== null ? getShbgBand(shbg) : null;
  const fai = totalT !== null && shbg !== null ? computeFAI(totalT, shbg) : null;

  const getBandBadge = (band: Tool015ShbgBand | null) => {
    switch (band) {
      case 'optimal':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'low':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'high':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6" data-r6-visual="tool-015">
      {/* ── 1. Androgen Distribution Partition Diagram (Renders in every state) ── */}
      <div
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5"
        data-r6-illustration="tool-015"
      >
        <div className="mb-3">
          <h3 className="text-sm font-bold text-zinc-200">
            {isAr ? 'خريطة توزيع ارتباط التستوستيرون في مجرى الدم' : 'Circulating Testosterone Distribution Partition'}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isAr
              ? 'مخطط اتزان فيرمولين: كيف يحدد SHBG والألبومين الجزء الحر الفعال حيوياً'
              : 'Vermeulen equilibrium: how SHBG and albumin dictate the active free androgen fraction'}
          </p>
        </div>

        <div className="relative overflow-x-auto py-2">
          <svg viewBox="0 0 760 120" className="w-full min-w-[500px] h-auto select-none" aria-label="SHBG Partition Diagram">
            {/* Partition Bar */}
            <g transform="translate(30, 20)">
              {/* SHBG Bound Fraction (~44%) */}
              <rect x="0" y="10" width="310" height="45" rx="8" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="155" y="32" textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="bold">SHBG-Bound (~44%)</text>
              <text x="155" y="47" textAnchor="middle" fill="#bfdbfe" fontSize="9">{isAr ? 'مرتبط بقوة شديدة — غير فعال حيوياً' : 'High Affinity / Inactive'}</text>

              {/* Albumin Bound Fraction (~54%) */}
              <rect x="320" y="10" width="280" height="45" rx="8" fill="#8b5cf6" fillOpacity="0.3" stroke="#8b5cf6" strokeWidth="1.5" />
              <text x="460" y="32" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontWeight="bold">Albumin-Bound (~54%)</text>
              <text x="460" y="47" textAnchor="middle" fill="#ddd6fe" fontSize="9">{isAr ? 'ارتباط ضعيف — متاح حيوياً للأنسجة' : 'Weak Affinity / Bioavailable'}</text>

              {/* Free T Fraction (~2%) */}
              <rect x="610" y="10" width="90" height="45" rx="8" fill="#10b981" fillOpacity="0.4" stroke="#10b981" strokeWidth="2" />
              <text x="655" y="32" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="bold">Free T (~2%)</text>
              <text x="655" y="47" textAnchor="middle" fill="#a7f3d0" fontSize="9">{isAr ? 'حر ونشط' : 'Active'}</text>

              <text x="350" y="80" textAnchor="middle" fill="#9ca3af" fontSize="10">
                {isAr
                  ? 'التستوستيرون المتاح حيوياً (Bioavailable T) = التستوستيرون الحر + المرتبط بالألبومين (~56%)'
                  : 'Bioavailable Testosterone = Free T + Albumin-Bound Fraction (~56%)'}
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* ── 2. Visual Range Scales (P-01) ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5">
        <h4 className="mb-3 text-sm font-bold text-zinc-200">
          {isAr ? 'مقاييس تركيز SHBG والتستوستيرون الحر' : 'SHBG & Free Testosterone Range Gauges'}
        </h4>

        <div className="space-y-5">
          {/* SHBG Scale */}
          <div
            className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5"
            data-r6-bar="SHBG"
            onMouseEnter={() => setActiveTooltip('shbg')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-400">SHBG Level</span>
                {shbgBand && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBandBadge(shbgBand)}`}>
                    {shbgBand.toUpperCase()}
                  </span>
                )}
              </div>
              <span className="font-mono text-xs font-bold text-zinc-200">
                {shbg !== null ? `${shbg} nmol/L` : isAr ? 'بانتظار الإدخال' : 'Pending input'}
              </span>
            </div>

            <div className="relative h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-[15%] bg-amber-500/30" title="Low / Suppressed (<15 nmol/L)" />
              <div className="absolute inset-y-0 left-[15%] w-[35%] bg-emerald-500/30 border-x border-emerald-500/50" title="Optimal Range (15-50 nmol/L)" />
              <div className="absolute inset-y-0 left-[50%] w-[50%] bg-rose-500/30" title="High (>50 nmol/L)" />
              {shbg !== null && (
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all duration-300"
                  style={{
                    left: `calc(${Math.min(100, Math.max(0, (shbg / 100) * 100))}% - 5px)`,
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
              <span>0</span>
              <span className="text-amber-400 font-semibold">15 (Low / Resistance)</span>
              <span className="text-emerald-400 font-semibold">50 (Optimal Range)</span>
              <span>100+ nmol/L</span>
            </div>
          </div>

          {/* Free Testosterone Scale */}
          {freeT !== null && (
            <div
              className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5"
              data-r6-bar="FREE_T"
              onMouseEnter={() => setActiveTooltip('freet')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400">Calculated Free Testosterone (Vermeulen)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                    {freeTPct?.toFixed(2)}% OF TOTAL
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-200">{freeT.toFixed(2)} ng/dL</span>
              </div>

              <div className="relative h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-[16%] w-[53%] bg-emerald-500/40 border-x border-emerald-500/50" title="Optimal Range (5-21 ng/dL)" />
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  style={{
                    left: `calc(${Math.min(100, Math.max(0, (freeT / 30) * 100))}% - 5px)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
                <span>0</span>
                <span className="text-emerald-400">5.0 ng/dL</span>
                <span className="text-emerald-400">21.0 ng/dL (Target)</span>
                <span>30+ ng/dL</span>
              </div>
            </div>
          )}

          {/* Derived Free Androgen Index (FAI) (P-02) */}
          {fai !== null && (
            <div
              className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-3.5"
              data-r6-bar="FAI"
              onMouseEnter={() => setActiveTooltip('fai')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-300">
                    {isAr ? 'مؤشر الأندروجين الحر (Free Androgen Index - FAI)' : 'Free Androgen Index (FAI - P-02)'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${fai > 150 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                    {fai > 150 ? 'ELEVATED ANDROGENICITY' : 'NORMAL'}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-purple-200">{fai}%</span>
              </div>

              <div className="relative h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-[12%] w-[48%] bg-emerald-500/40" title="Target Range (30% - 150%)" />
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                  style={{
                    left: `calc(${Math.min(100, Math.max(0, (fai / 250) * 100))}% - 5px)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                <span>0%</span>
                <span className="text-emerald-400">30%</span>
                <span className="text-emerald-400">150% (Upper Ref)</span>
                <span>250%+</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Tooltip */}
        {activeTooltip && (
          <div role="tooltip" className="mt-4 p-3 rounded-lg border border-zinc-700 bg-zinc-950 text-xs text-zinc-300 shadow-xl">
            {activeTooltip === 'shbg' && (
              <p>
                <strong>SHBG (Sex Hormone-Binding Globulin): </strong>
                {isAr
                  ? 'بروتين كبدي يربط التستوستيرون والإستراديول بقوة عالية. الانخفاض الشديد (<15 nmol/L) يرتبط بزيادة الجزء الحر ومقاومة الإنسولين، بينما الارتفاع يقلل توافر الهرمون الفعال للأنسجة.'
                  : 'High-affinity carrier glycoprotein synthesized by hepatocytes. Low levels (<15 nmol/L) indicate hyperinsulinemia/insulin resistance or androgen exposure, increasing free steroid clearance.'}
              </p>
            )}
            {activeTooltip === 'freet' && (
              <p>
                <strong>Calculated Free Testosterone: </strong>
                {isAr
                  ? 'الكسر الهرموني النشط حيوياً وغير المرتبط بأي بروتين، قادر على عبور الأغشية الخلوية وتفعيل مستقبلات الأندروجين مباشرة.'
                  : 'The unbound, biologically active fraction that diffuses freely into target tissues to bind nuclear androgen receptors.'}
              </p>
            )}
            {activeTooltip === 'fai' && (
              <p>
                <strong>Free Androgen Index (FAI): </strong>
                {isAr
                  ? 'مؤشر نسبي يحسب كـ: (التستوستيرون بالـ nmol/L مقسوماً على SHBG) × 100. يُستخدم لتقييم النشاط الأندروجيني الفعلي.'
                  : 'Calculated as 100 * (TT nmol/L / SHBG nmol/L). Useful clinical index reflecting overall androgen exposure.'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Screen-Reader Accessible Data Table ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5" data-r6-table="tool-015">
        <h4 className="mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          {isAr ? 'الجدول البياني المكافئ للشاشات القارئة' : 'Accessible Data Table Equivalent'}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2 text-start">{isAr ? 'المؤشر' : 'Biomarker'}</th>
                <th className="py-2 text-end">{isAr ? 'القيمة' : 'Value'}</th>
                <th className="py-2 text-end">{isAr ? 'الوحدة' : 'Unit'}</th>
                <th className="py-2 text-end">{isAr ? 'النطاق المرجعي' : 'Reference Limit'}</th>
                <th className="py-2 text-end">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              <tr>
                <td className="py-2 font-sans text-zinc-300">SHBG</td>
                <td className="py-2 text-end text-white">{shbg !== null ? shbg : '—'}</td>
                <td className="py-2 text-end text-zinc-400">nmol/L</td>
                <td className="py-2 text-end text-zinc-400">15 – 50</td>
                <td className="py-2 text-end text-sky-400">{shbgBand ? shbgBand.toUpperCase() : 'PENDING'}</td>
              </tr>
              {freeT !== null && (
                <>
                  <tr>
                    <td className="py-2 font-sans text-zinc-300">Free Testosterone (Vermeulen)</td>
                    <td className="py-2 text-end text-white">{freeT.toFixed(2)}</td>
                    <td className="py-2 text-end text-zinc-400">ng/dL</td>
                    <td className="py-2 text-end text-zinc-400">5.0 – 21.0</td>
                    <td className="py-2 text-end text-emerald-400">CALCULATED</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-zinc-300">Bioavailable Testosterone</td>
                    <td className="py-2 text-end text-white">{bioavailableT?.toFixed(2)}</td>
                    <td className="py-2 text-end text-zinc-400">ng/dL</td>
                    <td className="py-2 text-end text-zinc-400">100 – 450</td>
                    <td className="py-2 text-end text-purple-400">CALCULATED</td>
                  </tr>
                </>
              )}
              {fai !== null && (
                <tr>
                  <td className="py-2 font-sans text-zinc-300">Free Androgen Index (FAI)</td>
                  <td className="py-2 text-end text-white">{fai}%</td>
                  <td className="py-2 text-end text-zinc-400">%</td>
                  <td className="py-2 text-end text-zinc-400">30 – 150%</td>
                  <td className="py-2 text-end text-purple-400">{fai > 150 ? 'ELEVATED' : 'NORMAL'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
