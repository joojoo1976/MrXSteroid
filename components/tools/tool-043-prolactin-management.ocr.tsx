'use client';
/**
 * components/tools/tool-043-prolactin-management.ocr.tsx
 * Tool #043 — P-03: Client-side privacy OCR modal for prolactin lab reports.
 */
import React, { useState } from 'react';

export interface Tool043OcrValues {
  prolactinLevel?: string;
  weeklyCabergolineMcg?: string;
  panelDate?: string;
}

export interface Tool043OcrModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: Partial<Tool043OcrValues>) => void;
  locale?: 'ar' | 'en';
}

function parseReport(text: string): Tool043OcrValues {
  const result: Tool043OcrValues = {};

  const prlMatch = text.match(/(?:prolactin|prl)(?:\s+level)?[:\s]+([\d.]+)/i);
  if (prlMatch) result.prolactinLevel = prlMatch[1];

  const cabMatch = text.match(/(?:cabergoline|dostinex)[:\s]+([\d.]+)\s*(?:mcg|ug)?/i);
  if (cabMatch) result.weeklyCabergolineMcg = cabMatch[1];

  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) result.panelDate = dateMatch[1];

  return result;
}

export default function Tool043OcrModal({
  open,
  onClose,
  onConfirm,
  locale = 'en',
}: Tool043OcrModalProps) {
  const [pastedText, setPastedText] = useState('');
  const [extracted, setExtracted] = useState<Tool043OcrValues | null>(null);
  const isAr = locale === 'ar';

  if (!open) return null;

  const handleExtract = () => {
    setExtracted(parseReport(pastedText));
  };

  const handleConfirm = () => {
    if (extracted) onConfirm(extracted);
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
            ? 'تتم المعالجة بالكامل على متصفحك دون رفع أي ملفات.'
            : 'Zero-persistence: processed locally in your browser with zero server uploads.'}
        </p>

        <textarea
          rows={5}
          value={pastedText}
          onChange={e => setPastedText(e.target.value)}
          placeholder={isAr ? 'الصق نص تقرير المختبر هنا...' : 'Paste lab report text here…'}
          className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-transparent"
        />

        <button
          type="button"
          onClick={handleExtract}
          className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          {isAr ? 'استخراج من النص' : 'Extract from text'}
        </button>

        {extracted && (
          <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-800 text-xs space-y-1">
            <p>Prolactin: {extracted.prolactinLevel || '-'} ng/mL</p>
            <p>Cabergoline: {extracted.weeklyCabergolineMcg || '-'} mcg</p>
            <p>Date: {extracted.panelDate || '-'}</p>
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
