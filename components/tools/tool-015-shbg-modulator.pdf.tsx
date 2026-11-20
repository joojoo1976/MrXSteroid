'use client';
/**
 * components/tools/tool-015-shbg-modulator.pdf.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #015 — P-04: Client-Side Free Testosterone Consultation PDF
 *
 * Generates an A4 print-ready consultation summary:
 * - Total Testosterone, SHBG, and Albumin readings.
 * - Vermeulen mass-action Free Testosterone (ng/dL & %).
 * - Bioavailable Testosterone fraction.
 * - Derived Free Androgen Index (FAI).
 * - Non-diagnostic educational disclaimer.
 * ═════════════════════════════════════════════════════════════════════
 */
import React from 'react';
import {
  getShbgBand,
  computeFAI,
  TOOL_015_REFERENCE_LIMITS,
} from '@/lib/tools/r6/tool-015-shbg-modulator-contract';

export interface ShbgSummaryPdfProps {
  locale: 'ar' | 'en';
  totalT: number;
  shbg: number;
  albumin: number;
  freeT: number;
  freeTPct: number;
  bioT: number;
  panelDate?: string;
  labels?: {
    exportButton?: string;
  };
}

export default function ShbgSummaryPdfButton({
  locale,
  totalT,
  shbg,
  albumin,
  freeT,
  freeTPct,
  bioT,
  panelDate,
  labels,
}: ShbgSummaryPdfProps) {
  const isAr = locale === 'ar';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const shbgBand = getShbgBand(shbg);
    const fai = computeFAI(totalT, shbg);

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isAr ? 'rtl' : 'ltr'}" lang="${locale}">
      <head>
        <meta charset="utf-8" />
        <title>${isAr ? 'تقرير استشارة التستوستيرون الحر وSHBG' : 'Free Testosterone & SHBG Consultation Report'}</title>
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
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 800; color: #0369a1; margin: 0; }
          .subtitle { font-size: 11px; color: #666; margin-top: 4px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; }
          .badge-optimal { background: #dcfce7; color: #166534; }
          .badge-low { background: #fef9c3; color: #854d0e; }
          .badge-high { background: #fee2e2; color: #991b1b; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: ${isAr ? 'right' : 'left'}; }
          th { background: #f0f9ff; font-weight: 600; color: #0369a1; }
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
          <h1 class="title">${isAr ? 'تقرير استشارة التستوستيرون الحر وSHBG' : 'Free Testosterone & SHBG Consultation Report'}</h1>
          <div class="subtitle">MrXSteroid Genius Cloud Unified R6.1 · Vermeulen Mass-Action Formula · ${new Date().toLocaleDateString(locale)} ${panelDate ? `· Date: ${panelDate}` : ''}</div>
        </div>

        <div class="section-title">${isAr ? '1. لوحة التحاليل المدخلة' : '1. Input Laboratory Panel'}</div>
        <table>
          <thead>
            <tr>
              <th>${isAr ? 'التحليل' : 'Biomarker'}</th>
              <th>${isAr ? 'القيمة' : 'Value'}</th>
              <th>${isAr ? 'الوحدة' : 'Unit'}</th>
              <th>${isAr ? 'النطاق المرجعي العام' : 'Reference Limit'}</th>
              <th>${isAr ? 'التصنيف' : 'Classification'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${isAr ? 'التستوستيرون الكلي' : 'Total Testosterone'}</strong></td>
              <td>${totalT}</td>
              <td>ng/dL</td>
              <td>300 – 1000 ng/dL</td>
              <td><span class="badge badge-optimal">RECORDED</span></td>
            </tr>
            <tr>
              <td><strong>${isAr ? 'البروتين الرابط للهرمونات الجنسية (SHBG)' : 'Sex Hormone-Binding Globulin (SHBG)'}</strong></td>
              <td>${shbg}</td>
              <td>nmol/L</td>
              <td>${TOOL_015_REFERENCE_LIMITS.shbg.optimalMin} – ${TOOL_015_REFERENCE_LIMITS.shbg.optimalMax} nmol/L</td>
              <td><span class="badge badge-${shbgBand}">${shbgBand.toUpperCase()}</span></td>
            </tr>
            <tr>
              <td><strong>${isAr ? 'الألبومين' : 'Albumin'}</strong></td>
              <td>${albumin}</td>
              <td>g/dL</td>
              <td>3.5 – 5.0 g/dL</td>
              <td><span class="badge badge-optimal">NORMAL</span></td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">${isAr ? '2. نتائج الاتزان الكتلي (معادلة فيرمولين)' : '2. Vermeulen Mass-Action Calculated Fractions'}</div>
        <table>
          <thead>
            <tr>
              <th>${isAr ? 'الكسر المحسوب' : 'Calculated Fraction'}</th>
              <th>${isAr ? 'القيمة' : 'Value'}</th>
              <th>${isAr ? 'النسبة من الكلي' : '% of Total'}</th>
              <th>${isAr ? 'المجال الفسيولوجي الموصى به' : 'Target Interval'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${isAr ? 'التستوستيرون الحر (Free T)' : 'Free Testosterone'}</strong></td>
              <td><strong>${freeT.toFixed(2)} ng/dL</strong></td>
              <td>${freeTPct.toFixed(2)}%</td>
              <td>5.0 – 21.0 ng/dL (1.5% – 2.5%)</td>
            </tr>
            <tr>
              <td><strong>${isAr ? 'التستوستيرون المتاح حيوياً (Bioavailable T)' : 'Bioavailable Testosterone'}</strong></td>
              <td><strong>${bioT.toFixed(2)} ng/dL</strong></td>
              <td>—</td>
              <td>100 – 450 ng/dL</td>
            </tr>
            ${fai !== null ? `
            <tr>
              <td><strong>${isAr ? 'مؤشر الأندروجين الحر (FAI)' : 'Free Androgen Index (FAI)'}</strong></td>
              <td><strong>${fai}%</strong></td>
              <td>—</td>
              <td>30% – 150%</td>
            </tr>
            ` : ''}
          </tbody>
        </table>

        <div class="section-title">${isAr ? '3. نقاط المناقشة مع الطبيب المعالج' : '3. Physician Consultation Discussion Points'}</div>
        <ul>
          <li>${isAr ? 'انخفاض SHBG الشديد (<15 nmol/L) قد يعكس زيادة التصفية الأندروجينية أو مقاومة إنسولين كبدية.' : 'Suppressed SHBG (<15 nmol/L) often reflects hepatic insulin resistance, rapid androgen clearance, or metabolic syndromic traits.'}</li>
          <li>${isAr ? 'ارتفاع SHBG (>50 nmol/L) قد يربط التستوستيرون ويخفض الكسر الحر رغم بقاء التستوستيرون الكلي طبيعياً.' : 'Elevated SHBG (>50 nmol/L) sequesters circulating testosterone, depressing free androgen availability despite eugonadal total T.'}</li>
          <li>${isAr ? 'تجنب استخدام مركبات دوائية قمعية لـ SHBG دون تشخيص سريري وإشراف مباشر.' : 'Avoid unprescribed pharmacological interventions targeting SHBG suppression.'}</li>
        </ul>

        <div class="disclaimer">
          <strong>${isAr ? 'إخلاء مسؤولية سريرية:' : 'Clinical Disclaimer:'}</strong>
          ${isAr
            ? 'هذه الحسابات رياضية استرشادية مستندة إلى معادلة فيرمولين، وليست تشخيصاً طبياً أو توجيهاً علاجياً. يجب مراجعة أي قرار مع طبيب الغدد الصماء المختص.'
            : 'Calculated free testosterone is a mathematical estimation using the Vermeulen mass-action quadratic. It does not replace direct clinical judgment, equilibrium dialysis confirmation, or physician consultation.'}
        </div>

        <div class="footer">
          MrXSteroid Genius Cloud Unified R6.1 · Tool 015 · Vermeulen Mass Action · Client-Side Execution Only
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
      aria-label={labels?.exportButton || (isAr ? 'طباعة تقرير التستوستيرون الحر (A4)' : 'Export A4 PDF')}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white transition shadow-sm"
    >
      <span>🖨️</span>
      <span>{labels?.exportButton || (isAr ? 'طباعة تقرير التستوستيرون الحر (A4)' : 'Export A4 PDF')}</span>
    </button>
  );
}
