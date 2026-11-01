'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AIInsightPanel from '@/components/smarttools/AIInsightPanel';
import { AIInsightProvider } from '@/components/smarttools/AIInsightContext';

export default function SmartToolsAIExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const finalSegment = pathname.split('/').filter(Boolean).at(-1) ?? '';
  const toolSlug = /^tool-\d{3}-[a-z0-9-]+$/.test(finalSegment) ? finalSegment : null;
  const aiExplanationAllowed = toolSlug !== 'tool-150-ai-performance-command-center';

  return (
    <AIInsightProvider>
      {children}
      {toolSlug && aiExplanationAllowed && (
        <div className="mx-auto max-w-6xl px-4 pb-6">
          <AIInsightPanel key={toolSlug} toolSlug={toolSlug} />
        </div>
      )}
    </AIInsightProvider>
  );
}
