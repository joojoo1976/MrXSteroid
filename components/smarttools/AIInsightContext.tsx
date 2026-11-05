/* eslint-disable react-refresh/only-export-components */
'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';

export interface AIInsightContextValue {
  toolSlug: string;
  locale: 'ar' | 'en';
  provenanceLine: string;
  findings: Array<{ code: string; labelAr: string; labelEn: string; value: string; severity: string }>;
}

interface AIInsightContextState {
  current: AIInsightContextValue | null;
  publish: (value: AIInsightContextValue | null) => void;
}

const AIInsightContext = createContext<AIInsightContextState | null>(null);

export function AIInsightProvider({ children }: { children: ReactNode }) {
  const [current, publish] = useState<AIInsightContextValue | null>(null);
  const publishStable = useCallback((next: AIInsightContextValue | null) => publish(next), []);
  const value = useMemo(() => ({ current, publish: publishStable }), [current, publishStable]);
  return <AIInsightContext.Provider value={value}>{children}</AIInsightContext.Provider>;
}

export function toAIInsightContext(output: ToolOutput): AIInsightContextValue {
  const p = output.provenance;
  const provenanceLine = [
    `source=${p.source}`,
    `recordedAt=${p.recordedAt}`,
    `timezone=${p.timezone}`,
    `unit=${p.unit}`,
    `method=${p.measurementMethod ?? 'unspecified'}`,
    `quality=${p.dataQuality}`,
  ].join('; ');

  return {
    toolSlug: output.toolSlug,
    locale: output.locale,
    provenanceLine,
    findings: output.keyFindings.slice(0, 16).map((finding) => ({
      code: finding.code,
      labelAr: finding.labelAr,
      labelEn: finding.labelEn,
      value: String(finding.value).slice(0, 140),
      severity: finding.severity,
    })),
  };
}

export function useAIInsightContext() {
  return useContext(AIInsightContext);
}
