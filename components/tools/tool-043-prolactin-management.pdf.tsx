'use client';
/**
 * components/tools/tool-043-prolactin-management.pdf.tsx
 * Tool #043 — P-04: Client-side A4 PDF export.
 */
import React from 'react';
import type { ProlactinResult } from '@/lib/tools/schemas/tool-043-prolactin-management';

export interface Tool043PdfButtonProps {
  result: ProlactinResult | null;
  prolactinLevel?: string;
  uses19Nor?: boolean;
  weeklyCabergolineMcg?: string;
  symptoms?: string[];
  panelDate?: string;
  locale?: 'ar' | 'en';
}

export default function Tool043PdfButton({
  result,
  prolactinLevel,
  uses19Nor,
  weeklyCabergolineMcg,
  symptoms,
  panelDate,
  locale = 'en',
}: Tool043PdfButtonProps) {
  const isAr = locale === 'ar';

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Prolactin Management Report</title>
  <style>
    body { font-family: sans-serif; padding: 24px; color: #111; line-height: 1.5; }
    h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 8px; }
    .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .card { border: 1px solid #ccc; padding: 12px; border-radius: 6px; }
    .val { font-size: 18px; font-weight: bold; margin-top: 4px; }
    .disclaimer { font-size: 10px; color: #777; border-top: 1px solid #ddd; padding-top: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <h1>MRX Prolactin Management Consultation Summary</h1>
  <div class="meta">
    Date: ${panelDate || 'N/A'} | 19-nor Compound Use: ${uses19Nor ? 'Yes' : 'No'} | Current Cabergoline: ${weeklyCabergolineMcg || '0'} mcg/wk
  </div>
  <div class="grid">
    <div class="card">
      <div>Prolactin Level</div>
      <div class="val">${prolactinLevel || '-'} ng/mL</div>
    </div>
    <div class="card">
      <div>Classification Band</div>
      <div class="val">${result ? result.band.toUpperCase() : 'N/A'}</div>
    </div>
  </div>
  ${result ? `
    <div><strong>Action:</strong> ${result.action}</div>
    <div><strong>Suggested Cabergoline:</strong> ${result.suggested_weekly_mcg} mcg/week</div>
    ${result.warnings.length > 0 ? `<div><strong>Warnings:</strong> ${result.warnings.join(', ')}</div>` : ''}
  ` : ''}
  <div class="disclaimer">
    Educational and clinical guidance only. Cabergoline is a dopamine agonist requiring strict physician prescription and echocardiogram monitoring.
  </div>
</body>
</html>
    `;

    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <button
      type="button"
      aria-label="Export A4 PDF"
      onClick={handlePrint}
      className="text-xs px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 transition"
    >
      {isAr ? 'تصدير PDF A4' : 'Export A4 PDF'}
    </button>
  );
}
