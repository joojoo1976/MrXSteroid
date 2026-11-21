'use client';
/**
 * components/tools/tool-023-trt-optimization.ocr.tsx
 * ═══════════════════════════════════════════════════
 * Tool #023 — P-03: Client-side OCR modal for TRT lab reports.
 * 100% client-side — zero server uploads, zero AI calls.
 */
import React, { useState } from 'react';

export interface Tool023OcrValues {
  troughT?: string;
  freeT?: string;
  e2?: string;
  hematocrit?: string;
  panelDate?: string;
}

export interface Tool023OcrModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: Partial<Tool023OcrValues>) => void;
  locale?: 'ar' | 'en';
}

/** Extract a numeric value from text using multiple regex patterns */
function extractNumeric(text: string, patterns: RegExp[]): string | undefined {
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1].trim();
  }
  return undefined;
}

/** Extract date in YYYY-MM-DD format */
function extractDate(text: string): string | undefined {
  // Try ISO format
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  // Try MM/DD/YYYY
  const usMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) {
    const m = usMatch[1].padStart(2, '0');
    const d = usMatch[2].padStart(2, '0');
    return `${usMatch[3]}-${m}-${d}`;
  }
  // Try DD-Mon-YYYY e.g. 10-Mar-2026
  const shortMonMatch = text.match(/(\d{1,2})[-\s](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-\s](\d{4})/i);
  if (shortMonMatch) {
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    };
    const d = shortMonMatch[1].padStart(2, '0');
    const mo = months[shortMonMatch[2].toLowerCase()] ?? '01';
    return `${shortMonMatch[3]}-${mo}-${d}`;
  }
  return undefined;
}

function parseLabText(text: string): Partial<Tool023OcrValues> {
  const result: Partial<Tool023OcrValues> = {};

  // Total Testosterone / Trough T
  const troughT = extractNumeric(text, [
    /(?:trough\s+t(?:estosterone)?|total\s+test(?:osterone)?)\s*[:-]?\s*(\d+(?:\.\d+)?)\s*(?:ng\/dL)?/i,
    /(?:testosterone|test)\s*[:-]\s*(\d+(?:\.\d+)?)\s*(?:ng\/dL)?/i,
    /T\s*[:-]\s*(\d+(?:\.\d+)?)\s*ng\/dL/i,
  ]);
  if (troughT) result.troughT = troughT;

  // Free Testosterone
  const freeT = extractNumeric(text, [
    /free\s+t(?:estosterone)?\s*[:-]?\s*(\d+(?:\.\d+)?)\s*(?:pg\/mL)?/i,
    /free\s+test\s*[:-]\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (freeT) result.freeT = freeT;

  // Estradiol / E2
  const e2 = extractNumeric(text, [
    /(?:estradiol|e2|e-2)\s*[:-]?\s*(\d+(?:\.\d+)?)\s*(?:pg\/mL)?/i,
    /e2\s*=\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (e2) result.e2 = e2;

  // Hematocrit / HCT
  const hematocrit = extractNumeric(text, [
    /(?:hematocrit|hct|h\.c\.t)\s*[:-]?\s*(\d+(?:\.\d+)?)\s*%?/i,
    /hct\s*=\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (hematocrit) result.hematocrit = hematocrit;

  // Panel date
  const panelDate = extractDate(text);
  if (panelDate) result.panelDate = panelDate;

  return result;
}

export default function Tool023OcrModal({ open, onClose, onConfirm, locale = 'en' }: Tool023OcrModalProps) {
  const [text, setText] = useState('');
  const [extracted, setExtracted] = useState<Partial<Tool023OcrValues> | null>(null);
  const isAr = locale === 'ar';

  if (!open) return null;

  const handleExtract = () => {
    const values = parseLabText(text);
    setExtracted(values);
  };

  const handleConfirm = () => {
    if (extracted) {
      onConfirm(extracted);
    }
    onClose();
  };

  const handleClose = () => {
    setText('');
    setExtracted(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'مسح تقرير المختبر' : 'Scan Lab Report'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={handleClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-200 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-lg font-bold text-zinc-100 mb-4">
          {isAr ? 'مسح تقرير التحاليل' : 'Scan Lab Report'}
        </h2>

        {!extracted ? (
          <>
            <p className="text-xs text-zinc-400 mb-3">
              {isAr
                ? 'الصق نص تقرير المختبر أدناه. يتم المعالجة محلياً فقط.'
                : 'Paste your lab report text below. Processing is 100% local — nothing is uploaded.'}
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isAr ? 'الصق نص تقرير المختبر هنا…' : 'Paste lab report text here…'}
              rows={10}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleExtract}
              disabled={!text.trim()}
              className="mt-3 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              {isAr ? 'استخراج من النص' : 'Extract from text'}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">
              {isAr ? 'مراجعة القيم المستخرجة' : 'Review Extracted Readings'}
            </h3>
            <table className="w-full text-sm mb-4 border-collapse">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-1 text-zinc-400 font-medium">{isAr ? 'الحقل' : 'Field'}</th>
                  <th className="text-right py-1 text-zinc-400 font-medium">{isAr ? 'القيمة' : 'Value'}</th>
                </tr>
              </thead>
              <tbody>
                {extracted.troughT && (
                  <tr className="border-b border-zinc-800">
                    <td className="py-1 text-zinc-300">{isAr ? 'تستوستيرون القاع' : 'Trough T'}</td>
                    <td className="py-1 text-right text-zinc-100">{extracted.troughT} ng/dL</td>
                  </tr>
                )}
                {extracted.freeT && (
                  <tr className="border-b border-zinc-800">
                    <td className="py-1 text-zinc-300">{isAr ? 'التستوستيرون الحر' : 'Free T'}</td>
                    <td className="py-1 text-right text-zinc-100">{extracted.freeT} pg/mL</td>
                  </tr>
                )}
                {extracted.e2 && (
                  <tr className="border-b border-zinc-800">
                    <td className="py-1 text-zinc-300">{isAr ? 'إستراديول E2' : 'Estradiol E2'}</td>
                    <td className="py-1 text-right text-zinc-100">{extracted.e2} pg/mL</td>
                  </tr>
                )}
                {extracted.hematocrit && (
                  <tr className="border-b border-zinc-800">
                    <td className="py-1 text-zinc-300">{isAr ? 'الهيماتوكريت' : 'Hematocrit'}</td>
                    <td className="py-1 text-right text-zinc-100">{extracted.hematocrit}%</td>
                  </tr>
                )}
                {extracted.panelDate && (
                  <tr>
                    <td className="py-1 text-zinc-300">{isAr ? 'تاريخ سحب الدم' : 'Panel Date'}</td>
                    <td className="py-1 text-right text-zinc-100">{extracted.panelDate}</td>
                  </tr>
                )}
                {Object.keys(extracted).length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-2 text-center text-zinc-400">
                      {isAr ? 'لم يتم استخراج أي قيم' : 'No values could be extracted'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex gap-2">
              <button
                onClick={() => setExtracted(null)}
                className="flex-1 rounded-lg border border-zinc-600 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                {isAr ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={handleConfirm}
                disabled={Object.keys(extracted).length === 0}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
              >
                {isAr ? 'تأكيد وتطبيق' : 'Confirm & Apply'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
