'use client';

import React, { useEffect, useId, useRef, useState } from 'react';

export type TooltipSource = 'engine' | 'static' | 'not_available';

export interface GeniusTooltipProps {
  label: string;
  description: string;
  source: TooltipSource;
  locale?: 'ar' | 'en';
  children: React.ReactNode;
}

const SOURCE_LABELS: Record<TooltipSource, { en: string; ar: string }> = {
  engine: { en: 'From deterministic engine', ar: 'من المحرك الحتمي' },
  static: { en: 'Static explanation', ar: 'شرح ثابت' },
  not_available: { en: 'Unavailable in this tool', ar: 'غير متاح في هذه الأداة' },
};

/** Accessible explanation affordance that never steals behavior from its child control. */
export function GeniusTooltip({ label, description, source, locale = 'en', children }: GeniusTooltipProps) {
  const isAr = locale === 'ar';
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const sourceLabel = SOURCE_LABELS[source][isAr ? 'ar' : 'en'];

  const closeTooltip = () => {
    setPinned(false);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setPinned(false);
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPinned(false);
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex max-w-full items-start gap-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned) setOpen(false);
      }}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !pinned) {
          setOpen(false);
        }
      }}
    >
      {children}
      <button
        type="button"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-400 bg-white text-xs font-bold leading-none text-amber-700 shadow-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
        aria-label={isAr ? `مساعدة: ${label}` : `Help: ${label}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          // Focus arrives before click, so pinning must derive from pinned—not open.
          const nextPinned = !pinned;
          setPinned(nextPinned);
          setOpen(nextPinned);
        }}
      >
        ?
      </button>

      {open && (
        <div
          id={panelId}
          role="tooltip"
          className={`absolute top-full z-[100] mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-amber-400 bg-white p-3 text-sm text-zinc-800 shadow-xl ${isAr ? 'left-0 text-right' : 'right-0 text-left'}`}
        >
          <span
            aria-hidden="true"
            className={`absolute -top-2 h-4 w-4 rotate-45 border-l border-t border-amber-400 bg-white ${isAr ? 'left-3' : 'right-3'}`}
          />
          <div className="relative">
            <div className="mb-1 font-bold text-amber-700">{label}</div>
            <div className="mb-2 text-zinc-700">{description}</div>
            <div className="border-t border-amber-200 pt-1 text-xs text-zinc-500">
              {isAr ? 'المصدر:' : 'Source:'} {sourceLabel}
            </div>
            <button
              type="button"
              className="mt-2 rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              onClick={closeTooltip}
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeniusTooltip;
