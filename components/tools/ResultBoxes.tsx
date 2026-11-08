'use client';

import React, { useState } from 'react';

export interface ResultBoxProps {
  id: string;
  title: string;
  content: React.ReactNode;
  compact?: boolean;
}

export interface ResultBoxesProps {
  compact: boolean;
  locale?: 'ar' | 'en';
  boxes: Array<{ id: string; title: string; content: React.ReactNode }>;
  onToggle?: (compact: boolean) => void;
}

// Genius 12 Box taxonomy — fixed order, fixed IDs
const GENIUS12_META: Array<{ id: string; titleEn: string; titleAr: string; color: string }> = [
  { id: 'C1', titleEn: 'Medical Advice', titleAr: 'نصيحة طبية', color: 'bg-red-950/20 border-red-800' },
  { id: 'C2', titleEn: 'General Advice', titleAr: 'نصيحة عامة', color: 'bg-blue-950/20 border-blue-800' },
  { id: 'C3', titleEn: 'Current Feeling', titleAr: 'الإحساس الحالي', color: 'bg-pink-950/20 border-pink-800' },
  { id: 'C4', titleEn: 'Predictions', titleAr: 'تنبؤات', color: 'bg-purple-950/20 border-purple-800' },
  { id: 'C5', titleEn: 'AI Coach', titleAr: 'مدرب AI', color: 'bg-yellow-950/20 border-yellow-400' },
  { id: 'C6', titleEn: 'Top-3 Reasoning', titleAr: 'أفضل 3 أسباب', color: 'bg-green-950/20 border-green-500' },
  { id: 'C7', titleEn: 'Safety & Warnings', titleAr: 'السلامة والتحذيرات', color: 'bg-orange-950/20 border-orange-500' },
  { id: 'C8', titleEn: 'What-If', titleAr: 'ماذا لو؟', color: 'bg-cyan-950/20 border-cyan-400' },
  { id: 'C9', titleEn: 'Explainable AI', titleAr: 'AI قابل للتفسير', color: 'bg-zinc-900 border-zinc-700' },
  { id: 'C10', titleEn: 'Uncertainty', titleAr: 'عدم اليقين', color: 'bg-zinc-900 border-zinc-600' },
  { id: 'C11', titleEn: 'Alternative Paths', titleAr: 'مسارات بديلة', color: 'bg-teal-950/20 border-teal-400' },
  { id: 'C12', titleEn: 'Next Step / Cross-Tool', titleAr: 'الخطوة التالية / أدوات مرتبطة', color: 'bg-yellow-950/20 border-yellow-500' },
];

// CORE-5 = first 5 boxes (C1-C5)
const CORE5_IDS = ['C1', 'C2', 'C3', 'C4', 'C5'];

export function ResultBoxes({ compact, locale = 'en', boxes, onToggle }: ResultBoxesProps) {
  const isAr = locale === 'ar';
  const visibleBoxes = compact
    ? boxes.filter((b) => CORE5_IDS.includes(b.id))
    : boxes;

  return (
    <div className="space-y-4">
      {onToggle && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => onToggle(true)}
            className={`px-3 py-1 rounded text-xs ${compact ? 'bg-gold-500 text-zinc-950' : 'bg-zinc-700 text-zinc-200'}`}
          >
            {isAr ? 'مدمج (5)' : 'Compact (5)'}
          </button>
          <button
            type="button"
            onClick={() => onToggle(false)}
            className={`px-3 py-1 rounded text-xs ${!compact ? 'bg-gold-500 text-zinc-950' : 'bg-zinc-700 text-zinc-200'}`}
          >
            {isAr ? 'كامل (12)' : 'Full (12)'}
          </button>
        </div>
      )}
      {visibleBoxes.map((box) => {
        const meta = GENIUS12_META.find((m) => m.id === box.id);
        const title = isAr ? (meta?.titleAr ?? box.title) : (meta?.titleEn ?? box.title);
        return (
          <div key={box.id} className={`p-4 rounded border ${meta?.color ?? 'bg-zinc-800 border-zinc-700'}`} data-box-id={box.id}>
            <h3 className="font-bold text-sm mb-2">{title}</h3>
            <div className="text-sm text-zinc-300">{box.content}</div>
          </div>
        );
      })}
      {visibleBoxes.length === 0 && (
        <div className="text-sm text-zinc-500 italic" role="status">
          {isAr ? 'لا توجد نتائج — أدخل البيانات المطلوبة' : 'No results — enter required data'}
        </div>
      )}
    </div>
  );
}

export interface Genius12Data {
  medicalAdvice?: React.ReactNode;
  generalAdvice?: React.ReactNode;
  currentFeeling?: React.ReactNode;
  predictions?: React.ReactNode;
  aiCoach?: React.ReactNode;
  top3Reasoning?: React.ReactNode;
  safety?: React.ReactNode;
  whatIf?: React.ReactNode;
  explainableAI?: React.ReactNode;
  uncertainty?: React.ReactNode;
  alternativePaths?: React.ReactNode;
  nextStepCrossTool?: React.ReactNode;
}

export function makeResultBoxes(data: Genius12Data): Array<{ id: string; title: string; content: React.ReactNode }> {
  const NA = 'NOT_AVAILABLE';
  return [
    { id: 'C1', title: 'Medical Advice', content: data.medicalAdvice ?? NA },
    { id: 'C2', title: 'General Advice', content: data.generalAdvice ?? NA },
    { id: 'C3', title: 'Current Feeling', content: data.currentFeeling ?? NA },
    { id: 'C4', title: 'Predictions', content: data.predictions ?? NA },
    { id: 'C5', title: 'AI Coach', content: data.aiCoach ?? NA },
    { id: 'C6', title: 'Top-3 Reasoning', content: data.top3Reasoning ?? NA },
    { id: 'C7', title: 'Safety & Warnings', content: data.safety ?? NA },
    { id: 'C8', title: 'What-If', content: data.whatIf ?? NA },
    { id: 'C9', title: 'Explainable AI', content: data.explainableAI ?? NA },
    { id: 'C10', title: 'Uncertainty', content: data.uncertainty ?? NA },
    { id: 'C11', title: 'Alternative Paths', content: data.alternativePaths ?? NA },
    { id: 'C12', title: 'Next Step / Cross-Tool', content: data.nextStepCrossTool ?? NA },
  ];
}