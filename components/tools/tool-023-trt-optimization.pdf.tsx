'use client';
/**
 * components/tools/tool-023-trt-optimization.pdf.tsx
 * ════════════════════════════════════════════════════
 * Tool #023 — P-04: Client-side A4 PDF export.
 * Uses window.open → document.write → window.print().
 * Zero server uploads, zero AI calls.
 */
import React from 'react';
import type { TrtResult } from '@/lib/tools/schemas/tool-023-trt-optimization';

export interface Tool023PdfButtonProps {
  result: TrtResult | null;
  age?: string;
  troughT?: string;
  freeT?: string;
  hematocrit?: string;
  e2?: string;
  trtDuration?: string;
  administration?: string;
  panelDate?: string;
  locale?: 'ar' | 'en';
}

export default function Tool023PdfButton({
  result,
  age,
  troughT,
  freeT,
  hematocrit,
  e2,
  trtDuration,
  administration,
  panelDate,
  locale = 'en',
}: Tool023PdfButtonProps) {
  const isAr = locale === 'ar';

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;

    const title = isAr ? 'تقرير تحسين TRT' : 'TRT Optimization Report';
    const disclaimer = isAr
      ? 'للأغراض التعليمية فقط. ليس بديلاً عن المشورة الطبية.'
      : 'Educational use only. Not a substitute for professional medical advice.';

    const html = `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.5; }
    h1 { font-size: 16pt; border-bottom: 2px solid #4f46e5; padding-bottom: 6px; margin-bottom: 12px; }
    h2 { font-size: 13pt; margin-top: 18px; margin-bottom: 6px; color: #374151; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; font-size: 10pt; }
    th { background: #f3f4f6; font-weight: 600; }
    .disclaimer { margin-top: 24px; border: 1px solid #fbbf24; background: #fffbeb; padding: 10px; border-radius: 4px; font-size: 9pt; color: #92400e; }
    .badge { display: inline-block; background: #ede9fe; color: #5b21b6; border-radius: 4px; padding: 2px 8px; font-size: 9pt; font-weight: 600; }
    ul { margin: 4px 0; padding-left: 18px; }
    li { font-size: 10pt; margin-bottom: 3px; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p><strong>${isAr ? 'تاريخ التقرير:' : 'Report Date:'}</strong> ${new Date().toLocaleDateString()}</p>
  ${panelDate ? `<p><strong>${isAr ? 'تاريخ سحب الدم:' : 'Blood Draw Date:'}</strong> ${panelDate}</p>` : ''}

  <h2>${isAr ? 'بيانات المريض' : 'Patient Data'}</h2>
  <table>
    <tr><th>${isAr ? 'الحقل' : 'Field'}</th><th>${isAr ? 'القيمة' : 'Value'}</th></tr>
    ${age ? `<tr><td>${isAr ? 'العمر' : 'Age'}</td><td>${age} years</td></tr>` : ''}
    ${troughT ? `<tr><td>${isAr ? 'تستوستيرون القاع' : 'Trough Testosterone'}</td><td>${troughT} ng/dL</td></tr>` : ''}
    ${freeT ? `<tr><td>${isAr ? 'التستوستيرون الحر' : 'Free Testosterone'}</td><td>${freeT} pg/mL</td></tr>` : ''}
    ${e2 ? `<tr><td>${isAr ? 'إستراديول E2' : 'Estradiol E2'}</td><td>${e2} pg/mL</td></tr>` : ''}
    ${hematocrit ? `<tr><td>${isAr ? 'الهيماتوكريت' : 'Hematocrit'}</td><td>${hematocrit}%</td></tr>` : ''}
    ${trtDuration ? `<tr><td>${isAr ? 'مدة TRT' : 'TRT Duration'}</td><td>${trtDuration} months</td></tr>` : ''}
    ${administration ? `<tr><td>${isAr ? 'طريق الإعطاء' : 'Administration'}</td><td>${administration}</td></tr>` : ''}
  </table>

  ${result ? `
  <h2>${isAr ? 'نتائج البروتوكول' : 'Protocol Results'}</h2>
  <table>
    <tr><th>${isAr ? 'المقياس' : 'Metric'}</th><th>${isAr ? 'القيمة' : 'Value'}</th></tr>
    <tr><td>${isAr ? 'إجمالي T الموصى به' : 'Recommended Total T'}</td><td>${result.recommended_total_test_ng_dL} ng/dL</td></tr>
    <tr><td>${isAr ? 'الجرعة الموصى بها' : 'Recommended Dose'}</td><td>${result.recommended_dose_mg_weekly} mg/week</td></tr>
    <tr><td>${isAr ? 'نسبة T الحر التقديرية' : 'Estimated Free T Ratio'}</td><td>${result.estimated_free_test_ratio}</td></tr>
    ${result.expected_hematocrit ? `<tr><td>${isAr ? 'الهيماتوكريت المتوقع' : 'Expected Hematocrit'}</td><td>${result.expected_hematocrit}%</td></tr>` : ''}
    <tr><td>${isAr ? 'إدارة E2' : 'E2 Management'}</td><td>${result.e2_management}</td></tr>
    <tr><td>${isAr ? 'جدولة المتابعة' : 'Monitoring Schedule'}</td><td>${result.monitoring_schedule}</td></tr>
  </table>

  ${result.risk_factors.length > 0 ? `
  <h2>${isAr ? 'عوامل الخطر' : 'Risk Factors'}</h2>
  <ul>${result.risk_factors.map(r => `<li>${r}</li>`).join('')}</ul>
  ` : ''}

  ${result.protocol_tips.length > 0 ? `
  <h2>${isAr ? 'نصائح البروتوكول' : 'Protocol Tips'}</h2>
  <ul>${result.protocol_tips.map(t => `<li>${t}</li>`).join('')}</ul>
  ` : ''}
  ` : ''}

  <div class="disclaimer">
    <strong>${isAr ? 'إخلاء المسؤولية:' : 'Disclaimer:'}</strong> ${disclaimer}
  </div>
</body>
</html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <button
      onClick={handlePrint}
      aria-label="Export A4 PDF"
      title={isAr ? 'تصدير PDF A4' : 'Export A4 PDF'}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      {isAr ? 'تصدير PDF A4' : 'Export A4 PDF'}
    </button>
  );
}
