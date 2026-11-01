'use client';
import React, { useState } from 'react';

export interface UniversalTooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function UniversalTooltip({ content, children }: UniversalTooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onTouchStart={() => setOpen((v) => !v)}
    >
      {children}
      {open && (
        <span role="tooltip" data-testid="universal-tooltip" className="absolute z-50 bg-black text-white text-xs rounded p-2">
          {content}
        </span>
      )}
    </span>
  );
}
