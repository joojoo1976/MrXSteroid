'use client';
import React from 'react';

export interface CarryForwardPanelProps {
  available: boolean;
  onUse: () => void;
  onEnterNew: () => void;
  onIgnore: () => void;
  isRTL?: boolean;
}

export default function CarryForwardPanel({ available, onUse, onEnterNew, onIgnore, isRTL = false }: CarryForwardPanelProps) {
  if (!available) return null;
  return (
    <div data-testid="carry-forward" className="rounded-xl border p-4">
      <p className="mb-2">{isRTL ? 'بيانات مرتبطة متاحة' : 'Linked data available'}</p>
      <div className="flex gap-2">
        <button data-testid="cf-use" onClick={onUse}>{isRTL ? 'استخدم البيانات' : 'Use data'}</button>
        <button data-testid="cf-new" onClick={onEnterNew}>{isRTL ? 'إدخال قيم جديدة' : 'Enter new values'}</button>
        <button data-testid="cf-ignore" onClick={onIgnore}>{isRTL ? 'تجاهل' : 'Ignore'}</button>
      </div>
    </div>
  );
}
