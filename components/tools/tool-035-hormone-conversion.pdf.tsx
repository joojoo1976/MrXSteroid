'use client';
/**
 * components/tools/tool-035-hormone-conversion.pdf.tsx
 * Tool #035 — P-04: Client-side A4 PDF export for hormone conversion report.
 */
import React from 'react';
import type { ConversionResult } from '@/lib/tools/schemas/tool-035-hormone-conversion';

export interface Tool035PdfButtonProps {
  result: ConversionResult | null;
  analyte?: string;
  value?: string;
  unit?: string;
  measurementDate?: string;
  readingSource?: string;
  locale?: 'ar' | 'en';
}

export default function Tool035PdfButton({
  result,
  analyte,
  value,
  unit,
  measurementDate,
  readingSource,
  locale = 'en',
}: Tool035PdfButtonProps) {
  const isAr = locale === 'ar';

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Hormone Conversion Report</title>
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
  <h1>MRX Hormone Unit Conversion Report</h1>
  <div class="meta">
    Date: ${measurementDate || 'N/A'} | Source: ${readingSource || 'N/A'} | Analyte: ${analyte || 'N/A'}
  </div>
  <div class="grid">
    <div class="card">
      <div>Input Measurement</div>
      <div class="val">${value || '-'} ${unit || ''}</div>
    </div>
    <div class="card">
      <div>Converted Result</div>
      <div class="val">${result ? `${result.result_value} ${result.result_unit}` : 'N/A'}</div>
    </div>
  </div>
  ${result ? `<div>Conversion Factor: ${result.conversion_factor} (${result.calculation_method})</div>` : ''}
  <div class="disclaimer">
    Educational and reference tool only. Not a diagnostic tool. Verify all conversions with prescribing physician or laboratory director.
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
