'use client';
import React from 'react';

export interface ContinueWithButtonProps {
  sourceToolId: string;
  targetToolId: string;
  targetHref: string;
  onNavigate: (href: string) => void;
  confirmMessage?: string;
  labelAr?: string;
  labelEn?: string;
  isRTL?: boolean;
}

export default function ContinueWithButton({
  targetHref, onNavigate, confirmMessage, labelAr, labelEn, isRTL = false,
}: ContinueWithButtonProps) {
  const label = isRTL ? (labelAr ?? 'تابع') : (labelEn ?? 'Continue');
  return (
    <button
      data-testid="continue-with"
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        onNavigate(targetHref);
      }}
    >
      {label}
    </button>
  );
}
