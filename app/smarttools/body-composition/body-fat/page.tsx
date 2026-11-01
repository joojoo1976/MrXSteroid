'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LinkedDataContext } from '@/components/smarttools/LinkedDataContext';
import ContinueWithButton from '@/components/shared/ContinueWithButton';
import NextBestActionCard from '@/components/shared/NextBestActionCard';

export default function BodyFatPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(() => {
    try { const s = localStorage.getItem('mrx_bodyfat_result'); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Body Fat</h1>
      {result && (
        <LinkedDataContext
          sourceToolName="Body Fat"
          calculatedAt={result.calculated_at}
          value={result.outputs?.body_fat_percent ?? 0}
          unit="%"
          confidence={result.confidence ?? 'medium'}
          onEdit={() => {}}
          onIgnore={() => { localStorage.removeItem('mrx_bodyfat_result'); setResult(null); }}
          tooltipText="Body fat % carried forward to Macro Calculator."
        />
      )}
      {result && (
        <ContinueWithButton
          sourceToolId="body-fat"
          targetToolId="macro"
          targetHref="/smarttools/nutrition/macro"
          onNavigate={(href) => router.push(href)}
          confirmMessage="Continue to Macro Calculator?"
        />
      )}
      <NextBestActionCard action="Calculate macros next" onAction={() => router.push('/smarttools/nutrition/macro')} />
    </div>
  );
}
