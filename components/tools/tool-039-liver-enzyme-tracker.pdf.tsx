'use client';
/**
 * components/tools/tool-039-liver-enzyme-tracker.pdf.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 * Tool #039 — P-04: Client-Side Doctor Summary PDF Generator
 *
 * Generates an A4 print-ready medical summary for consultation with a physician:
 * - Includes all confirmed readings, units, ULN multiples, and reference limits.
 * - Includes De Ritis Ratio when validly calculated.
 * - Includes Chronological Trend if multiple dated readings exist.
 * - Multi-page printable layout without truncation.
 * - Educational disclaimer prominently displayed.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React from 'react';
import type { LiverTrackerInput, LiverTrackerResult } from '@/lib/tools/schemas/tool-039-liver-enzyme-tracker';
import type { Tool039DeRitisResult } from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-contract';

export interface DoctorSummaryPdfProps {
  locale: 'ar' | 'en';
  input: LiverTrackerInput;
  result: LiverTrackerResult;
  deRitis: Tool039DeRitisResult | null;
  labels: {
    exportButton: string;
    disclaimer: string;
  };
}

export default function DoctorSummaryPdfButton({
  locale,
  input,
  result,
  deRitis,
  labels,
}: DoctorSummaryPdfProps) {
  const isAr = locale === 'ar';

  const handlePrint = () => {
    // Client-side print document creation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isAr ? 'rtl' : 'ltr'}" lang="${locale}">
      <head>
        <meta charset="utf-8" />
        <title>Tool #039 — Doctor Summary (Liver Enzymes)</title>
        <style>
          @page { size: A4 portrait; margin: 16mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; margin: 0; padding: 12px; font-size: 12px; line-height: 1.5; }
          .header { border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 16px; }
          .title { font-size: 18px; font-weight: bold; margin: 0; }
          .meta { font-size: 11px; color: #555; margin-top: 4px; }
          .section { margin-bottom: 16px; page-break-inside: avoid; }
          .section-title { font-size: 13px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: ${isAr ? 'right' : 'left'}; }
          th { background: #f5f5f5; font-weight: bold; }
          .disclaimer { font-size: 10px; color: #666; border: 1px solid #ddd; background: #fafafa; padding: 8px; margin-top: 20px; border-radius: 4px; page-break-inside: avoid; }
          .deritis-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px; border-radius: 4px; margin-top: 8px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${isAr ? 'ملخص تحاليل إنزيمات الكبد للاستشارة الطبية' : 'Liver Enzyme Panel — Consultation Summary'}</h1>
          <div class="meta">
            ${isAr ? 'تاريخ التقرير' : 'Generated on'}: ${new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US')} · 
            ${isAr ? 'الأداة' : 'Tool'}: Tool #039 — Liver Enzyme Tracker (v1.0.0)
          </div>
        </div>

        <div class="section">
          <div class="section-title">${isAr ? 'نتائج التحاليل المخبرية المؤكدة' : 'Confirmed Laboratory Readings'}</div>
          <table>
            <thead>
              <tr>
                <th>${isAr ? 'المؤشر' : 'Marker'}</th>
                <th>${isAr ? 'القيمة' : 'Value'}</th>
                <th>${isAr ? 'الوحدة' : 'Unit'}</th>
                <th>${isAr ? 'مضاعف الحد المرجعي' : 'ULN Multiple'}</th>
                <th>${isAr ? 'الحالة المخبرية' : 'Status'}</th>
                <th>${isAr ? 'التغير خلال 30 يوم' : 'Trend / 30d'}</th>
              </tr>
            </thead>
            <tbody>
              ${result.markers
                .map(
                  (m) => `
                <tr>
                  <td><strong>${m.marker}</strong></td>
                  <td>${m.latest_value}</td>
                  <td>${m.unit}</td>
                  <td>${m.uln_multiple.toFixed(2)}×</td>
                  <td>${m.status}</td>
                  <td>${m.trend_per_30d > 0 ? '+' : ''}${m.trend_per_30d.toFixed(2)}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>

        ${
          deRitis
            ? `
          <div class="section">
            <div class="section-title">${isAr ? 'نسبة دي ريتيس (AST / ALT)' : 'De Ritis Ratio (AST/ALT)'}</div>
            <div class="deritis-box">
              <strong>${isAr ? 'النسبة المحسوبة' : 'Calculated Ratio'}: ${deRitis.ratioFormatted}</strong>
              (${isAr ? 'تاريخ السحب المتطابق' : 'Synchronized Draw Date'}: ${deRitis.date})
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #444;">
                ${
                  isAr
                    ? 'نسبة تثقيفية للمقارنة بين AST و ALT في نفس العينة. التمارين الرياضية الشاقة وإصابات العضلات قد ترفع AST بشكل مستقل.'
                    : 'Educational ratio comparing AST and ALT on the exact same draw date. Strenuous muscular exercise can elevate AST independently.'
                }
              </p>
            </div>
          </div>
        `
            : ''
        }

        <div class="section">
          <div class="section-title">${isAr ? 'السياق وعوامل الخطر المدخلة' : 'Contextual User Inputs'}</div>
          <table>
            <tbody>
              <tr>
                <td>${isAr ? 'استخدام المنشطات الفموية' : 'Oral Anabolic Steroid Use'}</td>
                <td><strong>${input.oral_steroids ? (isAr ? 'نعم' : 'Yes') : isAr ? 'لا' : 'No'}</strong></td>
              </tr>
              <tr>
                <td>${isAr ? 'استخدام داعم الكبد TUDCA' : 'Using TUDCA Support'}</td>
                <td><strong>${input.uses_tudca ? (isAr ? 'نعم' : 'Yes') : isAr ? 'لا' : 'No'}</strong></td>
              </tr>
              <tr>
                <td>${isAr ? 'مشروبات كحولية في الأسبوع' : 'Alcohol drinks per week'}</td>
                <td><strong>${input.alcohol_drinks_per_week}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="disclaimer">
          <strong>${isAr ? 'تنبيه طبي هام' : 'Medical Disclaimer'}:</strong> ${labels.disclaimer}
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <button
      type="button"
      data-testid="pdf-doctor-summary"
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-700 bg-cyan-950/40 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-900/50 hover:text-white transition"
    >
      <span>📑</span>
      <span>{labels.exportButton}</span>
    </button>
  );
}
