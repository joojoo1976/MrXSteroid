'use client';
import React, { useState, useId } from 'react';

export interface LinkedDataContextProps {
  sourceToolName: string;
  calculatedAt: string;
  value: number;
  unit: string;
  confidence: 'high' | 'medium' | 'low';
  onEdit: () => void;
  onIgnore: () => void;
  tooltipText: string;
  isRTL?: boolean;
}

const CONFIDENCE_LABELS = {
  en: { high: 'High', medium: 'Medium', low: 'Low' },
  ar: { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' },
};

export function LinkedDataContext({
  sourceToolName, calculatedAt, value, unit, confidence, onEdit, onIgnore, tooltipText, isRTL = false,
}: LinkedDataContextProps) {
  const tooltipId = useId();
  const [showTooltip, setShowTooltip] = useState(false);
  const labels = isRTL ? CONFIDENCE_LABELS.ar : CONFIDENCE_LABELS.en;
  const formattedDate = new Date(calculatedAt).toLocaleDateString(
    undefined, { year: 'numeric', month: 'short', day: 'numeric' }
  );
  return (
    <div data-testid="linked-data-context" className="rounded-lg border p-4 bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{sourceToolName}</span>
        <button
          type="button"
          aria-describedby={tooltipId}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((s) => !s)}
          className="ml-2 text-muted hover:text-fg"
          aria-label={isRTL ? 'تبديل التلميح' : 'Toggle tooltip'}
        >
          ⓘ
        </button>
      </div>
      {showTooltip && (
        <span role="tooltip" id={tooltipId} data-testid="linked-tooltip" className="block mt-1 text-xs text-muted">
          {tooltipText}
        </span>
      )}
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted">{unit}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full confidence-${confidence}`}>
          {labels[confidence]}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">{formattedDate}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onEdit} className="btn-secondary" data-testid="linked-edit">
          {isRTL ? 'تعديل' : 'Edit'}
        </button>
        <button type="button" onClick={onIgnore} className="btn-ghost" data-testid="linked-ignore">
          {isRTL ? 'تجاهل' : 'Ignore'}
        </button>
      </div>
    </div>
  );
}
