'use client';
/**
 * components/tools/tool-040-lipid-profile-optimizer.pdf.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #040 — P-04: Client-Side Lipid Profile Consultation PDF Generator
 *
 * Generates an A4 print-ready cardiovascular lipid report for consultation with
 * a physician or cardiologist:
 * - Confirmed lipid panel (LDL, HDL, Triglycerides, Total Cholesterol, non-HDL).
 * - Composite atherogenic ratios (Castelli I & II, AIP).
 * - Risk bands based on NCEP ATP III.
 * - Lifestyle & supplement intervention ladder.
 * - Non-diagnostic educational disclaimer.
 * ═════════════════════════════════════════════════════════════════════
 */
import React from 'react';
import type { LipidOptimizerInput, LipidOptimizerResult } from '@/lib/tools/schemas/tool-040-lipid-profile-optimizer';

export interface LipidSummaryPdfProps {
  locale: 'ar' | 'en';
  input: LipidOptimizerInput;
  result: LipidOptimizerResult;
  labels?: {
    exportButton?: string;
    disclaimer?: string;
  };
}

export default function LipidSummaryPdfButton({
  locale,
  input,
  result,
  labels,
}: LipidSummaryPdfProps) {
  const isAr = locale === 'ar';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tc = input.panel.total_cholesterol_mg_dl ?? (input.panel.ldl_mg_dl + input.panel.hdl_mg_dl + Math.round(input.panel.triglycerides_mg_dl / 5));
    const castelli1 = (tc / input.panel.hdl_mg_dl).toFixed(2);
    const castelli2 = (input.panel.ldl_mg_dl / input.panel.hdl_mg_dl).toFixed(2);
    const aip = Math.log10(input.panel.triglycerides_mg_dl / input.panel.hdl_mg_dl).toFixed(2);

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isAr ? 'rtl' : 'ltr'}" lang="${locale}">
      <head>
        <meta charset="utf-8" />
        <title>Tool #040 — Lipid Profile Consultation Summary</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; margin: 0; padding: 12px; font-size: 11px; line-height: 1.5; }
          .header { border-bottom: 2px solid #27272a; padding-bottom: 8px; margin-bottom: 14px; }
          .title { font-size: 16px; font-weight: bold; margin: 0; color: #09090b; }
          .meta { font-size: 10px; color: #52525b; margin-top: 4px; }
          .section { margin-bottom: 14px; page-break-inside: avoid; }
          .section-title { font-size: 12px; font-weight: bold; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px; margin-bottom: 6px; color: #18181b; }
          table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 10.5px; }
          th, td { border: 1px solid #e4e4e7; padding: 5px 8px; text-align: ${isAr ? 'right' : 'left'}; }
          th { background: #f4f4f5; font-weight: 600; color: #27272a; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 9.5px; }
          .badge-optimal { background: #dcfce7; color: #166534; }
          .badge-borderline { background: #fef9c3; color: #854d0e; }
          .badge-high { background: #ffedd5; color: #9a3412; }
          .badge-very-high { background: #fee2e2; color: #991b1b; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 6px; }
          .kpi-card { border: 1px solid #e4e4e7; background: #fafafa; padding: 8px; border-radius: 6px; }
          .kpi-title { font-size: 9.5px; color: #71717a; text-transform: uppercase; }
          .kpi-val { font-size: 14px; font-weight: bold; color: #09090b; margin-top: 2px; }
          .interventions { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 10.5px; }
          .interventions li { margin-bottom: 3px; }
          .disclaimer { font-size: 9.5px; color: #71717a; border: 1px solid #e4e4e7; background: #fafafa; padding: 8px; margin-top: 16px; border-radius: 6px; page-break-inside: avoid; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${isAr ? 'تقرير تحسين وتحليل ملف الدهون (Lipid Profile Summary)' : 'Lipid Profile Optimization Summary'}</h1>
          <div class="meta">
            ${isAr ? 'تاريخ التوليد' : 'Generated on'}: ${new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US')} · 
            ${isAr ? 'المرجعية الهندسية' : 'Platform'}: MrXSteroid Genius Cloud Unified R6.1 (Tool #040)
          </div>
        </div>

        <div class="section">
          <div class="section-title">${isAr ? 'لوحة الدهون المخبرية (Lipid Panel Readings)' : 'Confirmed Lipid Panel Readings'}</div>
          <table>
            <thead>
              <tr>
                <th>${isAr ? 'المؤشر المخبري' : 'Biomarker'}</th>
                <th>${isAr ? 'القيمة المدخلة' : 'Reading'}</th>
                <th>${isAr ? 'الوحدة' : 'Unit'}</th>
                <th>${isAr ? 'النطاق المرجعي المستهدف' : 'Target Guideline'}</th>
                <th>${isAr ? 'الحالة السريرية' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>LDL Cholesterol</strong> (${isAr ? 'الضار' : 'Low-Density'})</td>
                <td><strong>${input.panel.ldl_mg_dl}</strong></td>
                <td>mg/dL</td>
                <td>&lt; 100 mg/dL</td>
                <td><span class="badge badge-${result.ldl_status}">${result.ldl_status.toUpperCase()}</span></td>
              </tr>
              <tr>
                <td><strong>HDL Cholesterol</strong> (${isAr ? 'النافع' : 'High-Density'})</td>
                <td><strong>${input.panel.hdl_mg_dl}</strong></td>
                <td>mg/dL</td>
                <td>&gt; 40 mg/dL (&gt; 50 optimal)</td>
                <td><span class="badge badge-${result.hdl_status}">${result.hdl_status.toUpperCase()}</span></td>
              </tr>
              <tr>
                <td><strong>Triglycerides</strong> (${isAr ? 'الدهون الثلاثية' : 'Triglycerides'})</td>
                <td><strong>${input.panel.triglycerides_mg_dl}</strong></td>
                <td>mg/dL</td>
                <td>&lt; 150 mg/dL</td>
                <td><span class="badge badge-${result.tg_status}">${result.tg_status.toUpperCase()}</span></td>
              </tr>
              <tr>
                <td><strong>Total Cholesterol</strong> (${isAr ? 'الكلي' : 'Total'})</td>
                <td><strong>${tc}</strong></td>
                <td>mg/dL</td>
                <td>&lt; 200 mg/dL</td>
                <td>—</td>
              </tr>
              <tr>
                <td><strong>Non-HDL Cholesterol</strong> (${isAr ? 'غير النافع الكلي' : 'Atherogenic Total'})</td>
                <td><strong>${result.non_hdl}</strong></td>
                <td>mg/dL</td>
                <td>&lt; 130 mg/dL</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">${isAr ? 'المؤشرات المشتقة ومخاطر تصلب الشرايين (Composite Atherogenic Indices)' : 'Derived Atherogenic Risk Indices'}</div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">${isAr ? 'مؤشر كاستيلي I (TC/HDL)' : 'Castelli Risk Index I'}</div>
              <div class="kpi-val">${castelli1}</div>
              <div style="font-size:9px;color:#71717a;margin-top:2px;">${isAr ? 'الهدف: < 4.0' : 'Target: < 4.0'}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">${isAr ? 'مؤشر كاستيلي II (LDL/HDL)' : 'Castelli Risk Index II'}</div>
              <div class="kpi-val">${castelli2}</div>
              <div style="font-size:9px;color:#71717a;margin-top:2px;">${isAr ? 'الهدف: < 3.0' : 'Target: < 3.0'}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">${isAr ? 'مؤشر البلازما (AIP = log(TG/HDL))' : 'Atherogenic Index of Plasma'}</div>
              <div class="kpi-val">${aip}</div>
              <div style="font-size:9px;color:#71717a;margin-top:2px;">${isAr ? 'الخطر المنخفض: < 0.11' : 'Low risk: < 0.11'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">${isAr ? 'سياق البروتوكول الرياضي والمخاطر' : 'Clinical & Protocol Context'}</div>
          <table>
            <tbody>
              <tr>
                <td><strong>${isAr ? 'العمر' : 'Age'}:</strong> ${input.age} ${isAr ? 'سنة' : 'yrs'}</td>
                <td><strong>${isAr ? 'ضغط الدم الانقباضي' : 'Systolic BP'}:</strong> ${input.systolic_bp} mmHg</td>
                <td><strong>${isAr ? 'التدخين' : 'Smoking'}:</strong> ${input.smoker ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')}</td>
              </tr>
              <tr>
                <td><strong>${isAr ? 'أثناء السايكل (On-Cycle)' : 'On-Cycle'}:</strong> ${input.on_cycle ? (isAr ? 'نعم (نشط)' : 'Yes (Active)') : (isAr ? 'لا' : 'No')}</td>
                <td colspan="2"><strong>${isAr ? 'الأسابيع المتبقية' : 'Weeks Remaining'}:</strong> ${input.weeks_remaining} ${isAr ? 'أسبوع' : 'weeks'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${result.interventions.length > 0 ? `
          <div class="section">
            <div class="section-title">${isAr ? 'سلم التوصيات والتدخلات المعتمدة (Intervention Ladder)' : 'Evidence-Based Interventions'}</div>
            <div class="interventions">
              <ul style="margin: 0; padding-${isAr ? 'right' : 'left'}: 16px;">
                ${result.interventions.map((item) => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
        ` : ''}

        <div class="disclaimer">
          <strong>${isAr ? 'إخلاء مسؤولية سريري وتعليمي:' : 'Clinical Educational Disclaimer:'}</strong><br />
          ${labels?.disclaimer || (isAr
            ? 'هذا التقرير هو ملخص تنظيمي للحسابات الرياضية للمدخلات المخبرية وفق إرشادات NCEP ATP III والجمعية الأمريكية للقلب AHA 2018، ومخصص لأغراض التعليم والاسترشاد ومساعدة الاستشارة الطبية مع الطبيب المختص أو أخصائي أمراض القلب، ولا يعد تشخيصاً طبياً باتاً أو وصفة علاجية.'
            : 'This document provides a mathematical and educational summary of lipid markers based on NCEP ATP III and AHA/ACC 2018 guidelines. It is intended solely for educational purposes and physician consultation assistance, not for standalone medical diagnosis or drug prescription.')}
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white transition shadow-sm"
      aria-label={isAr ? 'تصدير تقرير الدهون الطبي A4' : 'Export A4 Lipid Report'}
    >
      <span>📄</span>
      <span>{labels?.exportButton || (isAr ? 'تصدير تقرير A4 (طباعة)' : 'Export A4 PDF')}</span>
    </button>
  );
}
