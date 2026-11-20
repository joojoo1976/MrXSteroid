'use client';
/**
 * components/tools/tool-006-estrogen-prolactin.pdf.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #006 — P-04: Client-Side Endocrine Consultation Report PDF Generator
 *
 * Generates an A4 print-ready consultation summary:
 * - Verified endocrine values (Estradiol, Prolactin, Total Testosterone).
 * - Mayo Clinic & Endocrine Society reference bands.
 * - Derived physiological E2/T ratio.
 * - Non-diagnostic educational disclaimer.
 * ═════════════════════════════════════════════════════════════════════
 */
import React from 'react';
import {
  getE2Band,
  getProlactinBand,
  computeE2TRatio,
  TOOL_006_REFERENCE_LIMITS,
} from '@/lib/tools/r6/tool-006-estrogen-prolactin-contract';

export interface EstrogenProlactinPdfProps {
  locale: 'ar' | 'en';
  e2: number;
  e2Unit: string;
  prolactin: number;
  prolactinUnit: string;
  tt?: number | null;
  panelDate?: string;
  labels?: {
    exportButton?: string;
  };
}

export default function EstrogenProlactinPdfButton({
  locale,
  e2,
  e2Unit,
  prolactin,
  prolactinUnit,
  tt,
  panelDate,
  labels,
}: EstrogenProlactinPdfProps) {
  const isAr = locale === 'ar';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const e2PgMl = e2Unit === 'pmol/L' ? Math.round(e2 / 3.67) : e2;
    const prlNgMl = prolactinUnit === 'mIU/L' ? Math.round(prolactin / 21.2) : prolactin;
    const e2Band = getE2Band(e2PgMl);
    const prlBand = getProlactinBand(prlNgMl);
    const ratio = tt && tt > 0 ? computeE2TRatio(e2PgMl, tt) : null;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isAr ? 'rtl' : 'ltr'}" lang="${locale}">
      <head>
        <meta charset="utf-8" />
        <title>${isAr ? 'تقرير استشارة الإستراديول والبرولاكتين' : 'Endocrine Consultation Report — E2 & Prolactin'}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.5;
            padding: 0;
            margin: 0;
            font-size: 12px;
          }
          .header { border-bottom: 2px solid #6b21a8; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 800; color: #581c87; margin: 0; }
          .subtitle { font-size: 11px; color: #666; margin-top: 4px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; }
          .badge-optimal { background: #dcfce7; color: #166534; }
          .badge-borderline { background: #fef9c3; color: #854d0e; }
          .badge-high { background: #fee2e2; color: #991b1b; }
          .badge-low { background: #e0f2fe; color: #075985; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: ${isAr ? 'right' : 'left'}; }
          th { background: #faf5ff; font-weight: 600; color: #581c87; }
          .section-title { font-size: 13px; font-weight: 700; color: #374151; margin-top: 14px; margin-bottom: 6px; }
          .disclaimer {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 10px;
            font-size: 10px;
            color: #92400e;
            margin-top: 20px;
            border-radius: 4px;
          }
          .footer { margin-top: 24px; font-size: 9px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${isAr ? 'تقرير استشارة التوازن الهرموني (E2 / Prolactin)' : 'Endocrine Balance Consultation Report (E2 & Prolactin)'}</h1>
          <div class="subtitle">MrXSteroid Genius Cloud Unified R6.1 · ${new Date().toLocaleDateString(locale)} · ${panelDate ? (isAr ? `تاريخ السحب: ${panelDate}` : `Blood Draw Date: ${panelDate}`) : ''}</div>
        </div>

        <div class="section-title">${isAr ? '1. لوحة التحاليل الهرمونية المؤكدة' : '1. Confirmed Endocrine Lab Panel'}</div>
        <table>
          <thead>
            <tr>
              <th>${isAr ? 'التحليل' : 'Biomarker'}</th>
              <th>${isAr ? 'القيمة المدخلة' : 'Entered Value'}</th>
              <th>${isAr ? 'القيمة الموحدة' : 'Normalized Value'}</th>
              <th>${isAr ? 'المجال المرجعي الموصى به' : 'Target Reference Interval'}</th>
              <th>${isAr ? 'التصنيف' : 'Classification'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${isAr ? 'الإستراديول (Estradiol E2)' : 'Estradiol (Sensitive E2)'}</strong></td>
              <td>${e2} ${e2Unit}</td>
              <td>${e2PgMl} pg/mL</td>
              <td>${TOOL_006_REFERENCE_LIMITS.e2.optimalMin} – ${TOOL_006_REFERENCE_LIMITS.e2.optimalMax} pg/mL</td>
              <td><span class="badge badge-${e2Band}">${e2Band.toUpperCase()}</span></td>
            </tr>
            <tr>
              <td><strong>${isAr ? 'البرولاكتين (Prolactin)' : 'Prolactin'}</strong></td>
              <td>${prolactin} ${prolactinUnit}</td>
              <td>${prlNgMl} ng/mL</td>
              <td>${TOOL_006_REFERENCE_LIMITS.prolactin.optimalMin} – ${TOOL_006_REFERENCE_LIMITS.prolactin.optimalMax} ng/mL</td>
              <td><span class="badge badge-${prlBand}">${prlBand.toUpperCase()}</span></td>
            </tr>
            ${tt && tt > 0 ? `
            <tr>
              <td><strong>${isAr ? 'التستوستيرون الكلي (Total Testosterone)' : 'Total Testosterone'}</strong></td>
              <td>${tt} ng/dL</td>
              <td>${tt} ng/dL</td>
              <td>300 – 1000 ng/dL</td>
              <td><span class="badge badge-optimal">STANDARD</span></td>
            </tr>
            ` : ''}
          </tbody>
        </table>

        ${ratio !== null ? `
        <div class="section-title">${isAr ? '2. النسبة الهرمونية المشتقة (E2 / T Ratio)' : '2. Derived Physiological Ratio (E2 / T Ratio)'}</div>
        <table>
          <thead>
            <tr>
              <th>${isAr ? 'المؤشر' : 'Index'}</th>
              <th>${isAr ? 'النسبة المحسوبة' : 'Calculated Value'}</th>
              <th>${isAr ? 'النطاق الفسيولوجي' : 'Physiological Equilibrium'}</th>
              <th>${isAr ? 'التفسير السريري' : 'Clinical Interpretation'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>E2 / Total Testosterone</strong></td>
              <td><strong>${ratio}%</strong></td>
              <td>3.0% – 5.5%</td>
              <td>${ratio > 6.0 ? (isAr ? 'ميل للأروماتاز المرتفع، يتطلب متابعة الأعراض' : 'High aromatization tendency, monitor symptoms') : (isAr ? 'توازن فسيولوجي سليم' : 'Physiological equilibrium')}</td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        <div class="section-title">${isAr ? '3. نقاط المناقشة مع الطبيب المعالج' : '3. Physician Consultation Discussion Points'}</div>
        <ul>
          <li>${isAr ? 'تقييم أي أعراض حسية موضعية (تحسس الحلمات، التثدي المبكر، احتباس السوائل).' : 'Evaluate physical symptoms: nipple sensitivity, early gynecomastia, fluid retention.'}</li>
          <li>${isAr ? 'تقييم الرغبة الجنسية، المزاج، واستقرار الانتصاب وعلاقته بتوازن البرولاكتين والإستراديول.' : 'Review libido, mood, erectile quality, and dopamine/prolactin equilibrium.'}</li>
          <li>${isAr ? 'تجنب البدء العشوائي بمثبطات الأروماتاز أو ناهضات الدوبامين دون إشراف طبي قطعي.' : 'Avoid unprescribed aromatase inhibitor or dopamine agonist dosing.'}</li>
        </ul>

        <div class="disclaimer">
          <strong>${isAr ? 'إخلاء مسؤولية سريرية قطعي:' : 'Clinical Disclaimer:'}</strong>
          ${isAr
            ? 'هذا التقرير مُعد لغايات التوثيق والمناقشة التعليمية مع الطبيب المختص فقط، ولا يشكل تشخيصاً طبياً أو وصفة علاجية لأي دواء.'
            : 'This document is prepared solely for patient recordkeeping and structured clinical consultation with a licensed physician. It does not constitute a medical diagnosis, treatment plan, or pharmaceutical prescription.'}
        </div>

        <div class="footer">
          MrXSteroid Genius Cloud Unified R6.1 · Tool 006 · Endocrine & Biomarker Suite · Client-Side Execution Only
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      aria-label={labels?.exportButton || (isAr ? 'طباعة تقرير الهرمونات (A4)' : 'Export A4 PDF')}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white transition shadow-sm"
    >
      <span>🖨️</span>
      <span>{labels?.exportButton || (isAr ? 'طباعة تقرير الهرمونات (A4)' : 'Export A4 PDF')}</span>
    </button>
  );
}
