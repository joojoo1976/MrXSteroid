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
      {visibleBoxes.map((box) => (
        <div key={box.id} className="p-4 rounded bg-zinc-800 border border-zinc-700" data-box-id={box.id}>
          <h3 className="font-bold text-sm mb-2 text-gold-500">{box.title}</h3>
          <div className="text-sm text-zinc-300">{box.content}</div>
        </div>
      ))}
      {visibleBoxes.length === 0 && (
        <div className="text-sm text-zinc-500 italic" role="status">
          {isAr ? 'لا توجد نتائج — أدخل البيانات المطلوبة' : 'No results — enter required data'}
        </div>
      )}
    </div>
  );
}

export function makeResultBoxes(data: {
  primaryResult: string;
  howCalculated: string;
  safety: string;
  evidence: string;
  nextActions: string;
  kpi?: string;
  inputs?: string;
  whatIf?: string;
  sensitivity?: string;
  crossTool?: string;
  export?: string;
  history?: string;
  feedback?: string;
}): Array<{ id: string; title: string; content: React.ReactNode }> {
  return [
    { id: 'KPI', title: 'KPI Strip', content: data.kpi || data.primaryResult },
    { id: 'C1', title: 'Primary Result', content: data.primaryResult },
    { id: 'C2', title: 'Formula / How Calculated', content: data.howCalculated },
    { id: 'C3', title: 'Inputs Summary', content: data.inputs || data.howCalculated },
    { id: 'C4', title: 'What-If', content: data.whatIf || 'NOT_AVAILABLE' },
    { id: 'C5', title: 'Sensitivity', content: data.sensitivity || 'NOT_AVAILABLE' },
    { id: 'C6', title: 'Warnings / Safety', content: data.safety },
    { id: 'C7', title: 'Cross-Tool Links', content: data.crossTool || 'NOT_AVAILABLE' },
    { id: 'C8', title: 'Evidence / Sources', content: data.evidence },
    { id: 'C9', title: 'Export', content: data.export || 'NOT_AVAILABLE' },
    { id: 'C10', title: 'History', content: data.history || 'NOT_AVAILABLE' },
    { id: 'C11', title: 'Feedback / Rating + Next Actions', content: data.feedback || data.nextActions },
    { id: 'C12', title: 'Next Actions', content: data.nextActions },
  ];
}