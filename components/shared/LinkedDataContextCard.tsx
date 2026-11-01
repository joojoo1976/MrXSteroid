'use client';
import React from 'react';

export interface LinkedDataContextData {
  sourceToolName?: string;
  computedAt: string;
  value: unknown;
  unit?: string;
  confidence?: string | number;
  stale: boolean;
  unitMismatch: boolean;
  lowConfidence: boolean;
  insufficient: boolean;
}

export interface LinkedDataContextCardProps {
  data: LinkedDataContextData;
  onEdit?: () => void;
  onIgnore?: () => void;
  tooltip?: string;
  isRTL?: boolean;
}

export default function LinkedDataContextCard({ data, onEdit, onIgnore, tooltip, isRTL = false }: LinkedDataContextCardProps) {
  const staleLabel = data.stale ? (isRTL ? 'قديم' : 'Stale') : (isRTL ? 'حديث' : 'Fresh');
  return (
    <div data-testid="linked-data-context" role="region" aria-label={isRTL ? 'بيانات مرتبطة' : 'Linked data'} className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{data.sourceToolName ?? (isRTL ? 'أداة مصدر' : 'Source tool')}</span>
        <span data-testid="linked-stale">{staleLabel}</span>
      </div>
      <div className="mt-2 text-sm">
        <span data-testid="linked-value">{String((data.value as any)?.weight ?? data.value)}</span>
        {data.unit && <span className="ml-1">{data.unit}</span>}
      </div>
      <div className="text-xs opacity-70">
        {isRTL ? 'محسوب في:' : 'Computed at:'} {data.computedAt}
      </div>
      <div className="text-xs opacity-70">
        {isRTL ? 'الثقة:' : 'Confidence:'} {String(data.confidence ?? '—')}
      </div>
      {data.unitMismatch && <div data-testid="unit-mismatch" className="text-red-500 text-xs">{isRTL ? 'عدم تطابق الوحدة' : 'Unit mismatch'}</div>}
      {data.lowConfidence && <div data-testid="low-confidence" className="text-amber-500 text-xs">{isRTL ? 'ثقة منخفضة' : 'Low confidence'}</div>}
      {data.insufficient && <div data-testid="insufficient" className="text-red-500 text-xs">{isRTL ? 'بيانات غير كافية' : 'Insufficient data'}</div>}
      {tooltip && <div data-testid="linked-tooltip" className="text-xs italic mt-1">{tooltip}</div>}
      <div className="mt-3 flex gap-2">
        {onEdit && <button data-testid="linked-edit" onClick={onEdit}>{isRTL ? 'تعديل' : 'Edit'}</button>}
        {onIgnore && <button data-testid="linked-ignore" onClick={onIgnore}>{isRTL ? 'تجاهل' : 'Ignore'}</button>}
      </div>
    </div>
  );
}
