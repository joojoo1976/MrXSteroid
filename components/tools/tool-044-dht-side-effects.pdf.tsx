'use client';
/**
 * components/tools/tool-044-dht-side-effects.pdf.tsx
 * Tool #044 — P-04: Client-side A4 PDF consultation report.
 */
import React from 'react';
import type { DhtResult } from '@/lib/tools/schemas/tool-044-dht-side-effects';

export interface Tool044PdfButtonProps {
  result: DhtResult | null;
  dhtLevel?: string;
  usesDhtDerivative?: boolean;
  fiveAri?: string;
  familyHistoryHairloss?: boolean;
  age?: string;
  panelDate?: string;
  locale?: 'ar' | 'en';
}

export default function Tool044PdfButton({
  result,
  dhtLevel,
  usesDhtDerivative,
  fiveAri,
  familyHistoryHairloss,
  age,
  panelDate,
  locale = 'en',
}: Tool044PdfButtonProps) {
  const isAr = locale === 'ar';

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>DHT Side Effects Analysis Report</title>
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
  <h1>MRX DHT Side Effect Burden Assessment</h1>
  <div class="meta">
    Age: ${age || 'N/A'} | Date: ${panelDate || 'N/A'} | 5-ARI: ${fiveAri || 'none'} | DHT-derivative: ${usesDhtDerivative ? 'Yes' : 'No'}
  </div>
  <div class="grid">
    <div class="card">
      <div>Serum DHT Level</div>
      <div class="val">${dhtLevel || '-'} ng/dL</div>
    </div>
    <div class="card">
      <div>Overall Androgenic Burden</div>
      <div class="val">${result ? `${result.overall_burden_pct}% (${result.band.toUpperCase()})` : 'N/A'}</div>
    </div>
    <div class="card">
      <div>Hair Loss Risk (AGA)</div>
      <div class="val">${result ? `${result.hair_loss_risk_pct}%` : 'N/A'}</div>
    </div>
    <div class="card">
      <div>Prostate Symptom Risk</div>
      <div class="val">${result ? `${result.prostate_symptom_risk_pct}%` : 'N/A'}</div>
    </div>
  </div>
  ${result && result.mitigations.length > 0 ? `
    <div><strong>Clinical Mitigations:</strong></div>
    <ul>${result.mitigations.map(m => `<li>${m}</li>`).join('')}</ul>
  ` : ''}
  <div class="disclaimer">
    Educational risk model only. Not a medical diagnosis. Men over 45 or experiencing urinary symptoms should undergo formal PSA screening and digital rectal examination with an accredited urologist.
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
