'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export type TooltipSource = 'engine' | 'static' | 'not_available';

export interface GeniusTooltipProps {
  label: string;
  description: string;
  source: TooltipSource;
  locale?: 'ar' | 'en';
  children: React.ReactNode;
}

const SOURCE_LABELS: Record<TooltipSource, { en: string; ar: string }> = {
  engine: { en: 'From engine', ar: 'من المحرك' },
  static: { en: 'Static', ar: 'ثابت' },
  not_available: { en: 'NOT_AVAILABLE', ar: 'غير متاح' },
};

export function GeniusTooltip({ label, description, source, locale = 'en', children }: GeniusTooltipProps) {
  const isAr = locale === 'ar';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sourceLabel = SOURCE_LABELS[source][isAr ? 'ar' : 'en'];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={label}
      aria-expanded={open}
    >
      {children}
      {open && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-lg bg-zinc-900 border border-zinc-700 shadow-xl text-sm"
          role="tooltip"
        >
          <div className="font-bold text-gold-500 mb-1">{label}</div>
          <div className="text-zinc-300 mb-2">{description}</div>
          <div className="text-xs text-zinc-500 border-t border-zinc-700 pt-1">
            {isAr ? 'المصدر:' : 'Source:'} {sourceLabel}
          </div>
        </div>
      )}
    </div>
  );
}

export default GeniusTooltip;