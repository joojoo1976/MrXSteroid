'use client';
/**
 * components/tools/tool-044-dht-side-effects.ocr.tsx
 * Tool #044 — P-03: Client-side privacy OCR modal for DHT lab reports.
 */
import React, { useState } from 'react';

export interface Tool044OcrValues {
  dhtLevel?: string;
  panelDate?: string;
}

export interface Tool044OcrModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: Partial<Tool044OcrValues>) => void;
  locale?: 'ar' | 'en';
}

function parseReport(text: string): Tool044OcrValues {
  const result: Tool044OcrValues = {};

  const dhtMatch = text.match(/(?:dihydrotestosterone|dht)(?:\s+level)?[:\s]+([\d.]+)/i);
  if (dhtMatch) result.dhtLevel = dhtMatch[1];

  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) result.panelDate = dateMatch[1];

  return result;
}

export default function Tool044OcrModal({
  open,
  onClose,
  onConfirm,
  locale = 'en',
}: Tool044OcrModalProps) {
  const [pastedText, setPastedText] = useState('');
  const [extracted, setExtracted] = useState<Tool044OcrValues | null>(null);
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
            ? 'تتم المعالجة بالكامل على متصفحك دون إرسال أي بيانات لخوادم خارجية.'
            : 'Zero-persistence: client-side processing with zero server uploads.'}
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
            <p>DHT: {extracted.dhtLevel || '-'} ng/dL</p>
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
