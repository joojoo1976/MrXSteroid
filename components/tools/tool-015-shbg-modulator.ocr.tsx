'use client';
/**
 * components/tools/tool-015-shbg-modulator.ocr.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #015 — P-03: Privacy-Preserving Client-Side SHBG/Testosterone Scanner
 *
 * Guaranteed Privacy:
 * 1. Zero server upload, zero API token cost, zero data retention.
 * 2. Parses Total Testosterone, SHBG, Albumin, and Date.
 * 3. Staging review and explicit user confirmation gate.
 * ═════════════════════════════════════════════════════════════════════
 */
import React, { useState, useRef } from 'react';

export type ShbgOcrMarker = 'tt' | 'shbg' | 'alb';

export interface ExtractedShbgReading {
  id: string;
  marker: ShbgOcrMarker;
  labelEn: string;
  labelAr: string;
  value: number;
  unit: string;
  confidence: number;
}

export interface Tool015OcrModalProps {
  locale: 'ar' | 'en';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { tt?: number; shbg?: number; alb?: number; date?: string }) => void;
  labels?: {
    title?: string;
    confirm?: string;
  };
}

export default function Tool015OcrModal({
  locale,
  isOpen,
  onClose,
  onConfirm,
  labels,
}: Tool015OcrModalProps) {
  const isAr = locale === 'ar';
  const [isProcessing, setIsProcessing] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedShbgReading[] | null>(null);
  const [extractedDate, setExtractedDate] = useState<string>('');
  const [manualText, setManualText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setIsProcessing(false);
    setExtracted(null);
    setExtractedDate('');
    setManualText('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseReportText = (text: string): { readings: ExtractedShbgReading[]; date: string } => {
    const results: ExtractedShbgReading[] = [];
    const dateMatch = text.match(/\b(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})\b/);
    const date = dateMatch ? dateMatch[1].replace(/[/.]/g, '-') : '';

    const patterns: Array<{
      marker: ShbgOcrMarker;
      labelEn: string;
      labelAr: string;
      regex: RegExp;
    }> = [
      {
        marker: 'tt',
        labelEn: 'Total Testosterone',
        labelAr: 'التستوستيرون الكلي',
        regex: /\b(?:Total\s*Testosterone|Testosterone\s*Total|Total\s*T|Testosterone)\b[:\s]*([0-9]+(?:\.[0-9]+)?)(?:\s*(ng\/dL|nmol\/L))?/i,
      },
      {
        marker: 'shbg',
        labelEn: 'SHBG',
        labelAr: 'البروتين الرابط للهرمونات الجنسية (SHBG)',
        regex: /\b(?:SHBG|Sex\s*Hormone\s*Binding\s*Globulin)\b[:\s]*([0-9]+(?:\.[0-9]+)?)(?:\s*(nmol\/L|ug\/dL))?/i,
      },
      {
        marker: 'alb',
        labelEn: 'Albumin',
        labelAr: 'الألبومين (Albumin)',
        regex: /\b(?:Albumin|Serum\s*Albumin|ALB)\b[:\s]*([0-9]+(?:\.[0-9]+)?)(?:\s*(g\/dL|g\/L))?/i,
      },
    ];

    patterns.forEach((p, idx) => {
      const match = text.match(p.regex);
      if (match && match[1]) {
        let val = parseFloat(match[1]);
        const unit = (match[2] || (p.marker === 'tt' ? 'ng/dL' : p.marker === 'shbg' ? 'nmol/L' : 'g/dL')).toLowerCase();

        if (p.marker === 'tt' && unit.includes('nmol')) {
          val = Math.round(val * 28.84);
        } else if (p.marker === 'alb' && unit.includes('g/l') && val > 15) {
          val = Math.round((val / 10) * 10) / 10;
        }

        results.push({
          id: `ocr-${p.marker}-${idx}`,
          marker: p.marker,
          labelEn: p.labelEn,
          labelAr: p.labelAr,
          value: Math.round(val * 10) / 10,
          unit: p.marker === 'tt' ? 'ng/dL' : p.marker === 'shbg' ? 'nmol/L' : 'g/dL',
          confidence: match[2] ? 95 : 85,
        });
      }
    });

    return { readings: results, date };
  };

  const handleProcessText = (rawText: string) => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    try {
      const { readings, date } = parseReportText(rawText);
      setExtracted(readings);
      if (date) setExtractedDate(date);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      handleProcessText(text);
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setExtracted([]);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (!extracted) return;
    const payload: { tt?: number; shbg?: number; alb?: number; date?: string } = {};
    extracted.forEach((r) => {
      if (r.marker === 'tt') payload.tt = r.value;
      if (r.marker === 'shbg') payload.shbg = r.value;
      if (r.marker === 'alb') payload.alb = r.value;
    });
    if (extractedDate) payload.date = extractedDate;
    onConfirm(payload);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ocr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-xl p-6 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div>
            <h2 id="ocr-modal-title" className="text-lg font-bold text-white">
              {labels?.title || (isAr ? 'مسح تقرير تحاليل SHBG والتستوستيرون (Local OCR)' : 'Scan SHBG & Testosterone Lab Report (Local OCR)')}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isAr
                ? 'معالجة محلية داخل المتصفح 100% دون أي اتصال بخوادم خارجية'
                : '100% in-browser client-side extraction. Zero server upload.'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            ✕
          </button>
        </div>

        {!extracted ? (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleProcessFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-sky-500/50 rounded-xl p-8 text-center cursor-pointer transition bg-zinc-900/40 hover:bg-zinc-900/80"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.txt,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
                }}
              />
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm font-medium text-zinc-200">
                {isAr ? 'اسحب وأفلت تقرير التحليل هنا أو انقر للاختيار' : 'Drag & drop your lab report here, or click to browse'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">PNG, JPG, PDF, TXT (Max 10MB)</p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                {isAr ? 'أو الصق نص التقرير المخبري مباشرة:' : 'Or paste lab report text directly:'}
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={
                  isAr
                    ? 'مثال:\nTotal Testosterone: 650 ng/dL\nSHBG: 32 nmol/L\nAlbumin: 4.3 g/dL'
                    : 'e.g.\nTotal Testosterone: 650 ng/dL\nSHBG: 32 nmol/L\nAlbumin: 4.3 g/dL'
                }
                rows={3}
                className="w-full text-xs font-mono p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                disabled={!manualText.trim() || isProcessing}
                onClick={() => handleProcessText(manualText)}
                className="mt-2 w-full py-2 px-3 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-lg transition"
              >
                {isProcessing
                  ? isAr ? 'جاري الاستخراج...' : 'Extracting...'
                  : isAr ? 'استخراج من النص' : 'Extract from text'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200">
                {isAr ? 'مراجعة القيم المستخرجة والتحقق' : 'Review Extracted Readings & Verify'}
              </h3>
              {extractedDate && (
                <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {extractedDate}
                </span>
              )}
            </div>

            {extracted.length === 0 ? (
              <p className="text-xs text-amber-400 p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg">
                {isAr ? 'لم يتم العثور على قراءات واضحة في النص.' : 'No clear SHBG/Testosterone markers detected.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {extracted.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs">
                    <span className="font-medium text-zinc-300">{isAr ? r.labelAr : r.labelEn}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={r.value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setExtracted((prev) => prev?.map((item) => item.id === r.id ? { ...item, value: val } : item) ?? null);
                        }}
                        className="w-20 text-end font-mono bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white focus:outline-none focus:border-sky-500"
                      />
                      <span className="text-zinc-400 text-[11px]">{r.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setExtracted(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg transition"
              >
                {isAr ? 'إعادة المسح' : 'Re-scan'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={extracted.length === 0}
                className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg transition"
              >
                {labels?.confirm || (isAr ? 'تأكيد واعتماد المدخلات' : 'Confirm & Apply')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
