'use client';
import React from 'react';

export interface NextBestActionCardProps {
  action: string;
  onAction?: () => void;
  isRTL?: boolean;
}

export default function NextBestActionCard({ action, onAction, isRTL = false }: NextBestActionCardProps) {
  return (
    <div data-testid="next-best-action" className="rounded-xl border p-3">
      <div className="text-xs uppercase opacity-60">{isRTL ? 'الإجراء التالي' : 'Next Best Action'}</div>
      <div className="font-semibold">{action}</div>
      {onAction && <button data-testid="nba-btn" onClick={onAction}>{isRTL ? 'انتقال' : 'Go'}</button>}
    </div>
  );
}
