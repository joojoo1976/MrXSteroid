'use client';
/**
 * components/tools/tool-035-hormone-conversion.ocr.tsx
 * Tool #035 — P-03: Client-side OCR modal for hormone reports.
 */
import React, { useState } from 'react';

export interface Tool035OcrValues {
  analyte?: 'testosterone' | 'estradiol';
  value?: string;
  unit?: string;
  measurementDate?: string;
  readingSource?: string;
}

export interface Tool035OcrModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: Partial<Tool035OcrValues>) => void;
  locale?: 'ar' | 'en';
}

function parseReport(text: string): Tool035OcrValues {
  const result: Tool035OcrValues = {};

  // Check analyte and value
  const tMatch = text.match(/(?:total\s+)?testosterone(?:\s+level)?[:\s]+([\d.]+)\s*(ng\/dL|nmol\/L)?/i);
  if (tMatch) {
    result.analyte = 'testosterone';
    result.value = tMatch[1];
    if (tMatch[2]) result.unit = tMatch[2];
  } else {
    const e2Match = text.match(/(?:estradiol|e2)(?:\s+level)?[:\s]+([\d.]+)\s*(pg\/mL|pmol\/L)?/i);
    if (e2Match) {
      result.analyte = 'estradiol';
      result.value = e2Match[1];
      if (e2Match[2]) result.unit = e2Match[2];
    }
  }

  // Date
  const dateMatch = text.match(/(?:date|collected|drawn)[:\s]+(\d{4}-\d{2}-\d{2})/i) ||
                    text.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    result.measurementDate = dateMatch[1];
  }

  // Source
  const sourceMatch = text.match(/(?:lab|laboratory|facility|source)[:\s]+([A-Za-z0-9\s]+)/i);
  if (sourceMatch && sourceMatch[1].trim().length >= 3) {
    result.readingSource = sourceMatch[1].trim();
  }

  return result;
}

export default function Tool035OcrModal({
  open,
  onClose,
  onConfirm,
  locale = 'en',
}: Tool035OcrModalProps) {
  const [pastedText, setPastedText] = useState('');
  const [extracted, setExtracted] = useState<Tool035OcrValues | null>(null);
  const isAr = locale === 'ar';

  if (!open) return null;

  const handleExtract = () => {
    const vals = parseReport(pastedText);
    setExtracted(vals);
  };

  const handleConfirm = () => {
    if (extracted) {
      onConfirm(extracted);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {isAr ? 'مسح تقرير المختبر ضوئياً (OCR محلي)' : 'Scan Lab Report (Client-Side OCR)'}
        </h3>
        <p className="text-xs text-zinc-500">
          {isAr
            ? 'تتم المعالجة بالكامل على متصفحك. لا ترسل أي بيانات إلى الخادم.'
            : 'Zero-persistence: all extraction is done locally in your browser with zero server uploads.'}
        </p>

        <textarea
          rows={5}
          value={pastedText}
          onChange={e => setPastedText(e.target.value)}
          placeholder={isAr ? 'الصق نص تقرير المختبر هنا...' : 'Paste lab report text here…'}
          className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-transparent"
        />

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleExtract}
            className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            {isAr ? 'استخراج من النص' : 'Extract from text'}
          </button>
        </div>

        {extracted && (
          <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-800 space-y-2 border border-zinc-200 dark:border-zinc-700">
            <h4 className="text-xs font-semibold">{isAr ? 'البيانات المستخرجة:' : 'Extracted Values:'}</h4>
            <div className="text-xs space-y-1">
              <p>Analyte: {extracted.analyte || '-'}</p>
              <p>Value: {extracted.value || '-'} {extracted.unit || ''}</p>
              <p>Date: {extracted.measurementDate || '-'}</p>
              <p>Source: {extracted.readingSource || '-'}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!extracted}
            className="text-xs px-3 py-1.5 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {isAr ? 'تأكيد واستيراد' : 'Confirm & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
