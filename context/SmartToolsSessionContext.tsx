'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { PersonalFitnessContextItem } from '@/lib/tools/schemas/tool-148-personal-fitness-memory-layer';
import { selectPersonalContextForTool, validatePersonalFitnessContextItem } from '@/lib/tools/engines/tool-148-personal-fitness-memory-layer.v6';
import type { CrossToolResultEnvelopeV7 } from '@/lib/tools/shared-data/cross-tool-result.v7';
import { grantCrossToolResultToTargetV7, revokeCrossToolResultTargetV7 } from '@/lib/tools/shared-data/cross-tool-result.v7';

interface SmartToolsSessionContextValue {
  items: PersonalFitnessContextItem[];
  sharedWithTool149: CrossToolResultEnvelopeV7[];
  addItem: (raw: unknown) => { ok: true } | { ok: false; errors: Array<{ field: string; message: string }> };
  removeItem: (id: string) => void;
  setShareWithTool149: (id: string, enabled: boolean) => void;
  clearItems: () => void;
  sharedResults: CrossToolResultEnvelopeV7[];
  shareResultWithTool: (raw: unknown, targetToolId: string) => { ok: true; resultId: string } | { ok: false };
  revokeResultForTool: (resultId: string, targetToolId: string) => void;
}

const SmartToolsSessionContext = createContext<SmartToolsSessionContextValue | null>(null);
const Tool149SharedContext = createContext<CrossToolResultEnvelopeV7[]>([]);
type ToolResultSharingValue = {
  sharedResults: CrossToolResultEnvelopeV7[];
  shareResultWithTarget: (raw: unknown) => { ok: true; resultId: string } | { ok: false };
  revokeResult: (resultId: string) => void;
};
type ToolResultSharingStoreValue = {
  sharedResults: CrossToolResultEnvelopeV7[];
  shareResultWithTool: (raw: unknown, targetToolId: string) => { ok: true; resultId: string } | { ok: false };
  revokeResultForTool: (resultId: string, targetToolId: string) => void;
};
const ToolResultSharingContext = createContext<ToolResultSharingStoreValue | null>(null);

export function SmartToolsSessionContextProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PersonalFitnessContextItem[]>([]);
  const [sharedResults, setSharedResults] = useState<CrossToolResultEnvelopeV7[]>([]);
  const addItem = useCallback((raw: unknown) => {
    const candidate = typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? raw as Record<string, unknown> : null;
    const prepared = candidate?.['shareWithTool149'] === true && candidate['shareGrantedAt'] === undefined
      ? { ...candidate, shareGrantedAt: new Date().toISOString() }
      : raw;
    const parsed = validatePersonalFitnessContextItem(prepared);
    if (parsed.status !== 'READY') return { ok: false as const, errors: parsed.errors };
    setItems((current) => current.some((item) => item.id === parsed.item.id)
      ? current.map((item) => item.id === parsed.item.id ? parsed.item : item)
      : [...current, parsed.item]);
    return { ok: true as const };
  }, []);
  const removeItem = useCallback((id: string) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const setShareWithTool149 = useCallback((id: string, enabled: boolean) => {
    const shareGrantedAt = enabled ? new Date().toISOString() : undefined;
    setItems((current) => current.map((item) => {
      if (item.id !== id) return item;
      if (!enabled) {
        const { shareGrantedAt: _revokedAt, ...privateItem } = item;
        return { ...privateItem, shareWithTool149: false };
      }
      return { ...item, shareWithTool149: true, shareGrantedAt: item.shareWithTool149 ? item.shareGrantedAt : shareGrantedAt };
    }));
  }, []);
  const clearItems = useCallback(() => { setItems([]); setSharedResults([]); }, []);
  const shareResultWithTool = useCallback((raw: unknown, targetToolId: string) => {
    const granted = grantCrossToolResultToTargetV7(raw, targetToolId, new Date().toISOString());
    if (!granted) return { ok: false as const };
    setSharedResults((current) => current.some((item) => item.resultId === granted.resultId)
      ? current.map((item) => item.resultId === granted.resultId ? granted : item)
      : [...current, granted]);
    return { ok: true as const, resultId: granted.resultId };
  }, []);
  const revokeResultForTool = useCallback((resultId: string, targetToolId: string) => {
    setSharedResults((current) => current.flatMap((item) => {
      if (item.resultId !== resultId) return [item];
      const updated = revokeCrossToolResultTargetV7(item, targetToolId);
      return updated ? [updated] : [];
    }));
  }, []);
  const sharedWithTool149 = useMemo(() => selectPersonalContextForTool(items, 'tool-149-physique-trajectory-simulator'), [items]);
  const value = useMemo(() => ({ items, sharedWithTool149, addItem, removeItem, setShareWithTool149, clearItems, sharedResults, shareResultWithTool, revokeResultForTool }), [items, sharedWithTool149, addItem, removeItem, setShareWithTool149, clearItems, sharedResults, shareResultWithTool, revokeResultForTool]);
  const resultSharingValue = useMemo(() => ({ sharedResults, shareResultWithTool, revokeResultForTool }), [sharedResults, shareResultWithTool, revokeResultForTool]);

  return (
    <SmartToolsSessionContext.Provider value={value}>
      <Tool149SharedContext.Provider value={sharedWithTool149}>
        <ToolResultSharingContext.Provider value={resultSharingValue}>{children}</ToolResultSharingContext.Provider>
      </Tool149SharedContext.Provider>
    </SmartToolsSessionContext.Provider>
  );
}

const EMPTY_CONTEXT: SmartToolsSessionContextValue = {
  items: [],
  sharedWithTool149: [],
  addItem: () => ({ ok: false, errors: [{ field: 'context', message: 'Session context provider is unavailable.' }] }),
  removeItem: () => undefined,
  setShareWithTool149: () => undefined,
  clearItems: () => undefined,
  sharedResults: [],
  shareResultWithTool: () => ({ ok: false }),
  revokeResultForTool: () => undefined,
};

/** Full session-context management is reserved for Tool 148. */
export function useTool148SessionContext(): SmartToolsSessionContextValue {
  return useContext(SmartToolsSessionContext) ?? EMPTY_CONTEXT;
}

/** Other tools receive only values the user explicitly shared with Tool 149. */
export function useExplicitTool149SessionContext(): CrossToolResultEnvelopeV7[] {
  return useContext(Tool149SharedContext);
}

/** Results are visible only to the explicitly authorized consumer tool. */
export function useSharedResultsForTool(targetToolId: string): CrossToolResultEnvelopeV7[] {
  return useToolResultSharing(targetToolId).sharedResults;
}

/** Target-scoped cross-tool API; it exposes no Tool 148 private context values. */
export function useToolResultSharing(targetToolId: string): ToolResultSharingValue {
  const context = useContext(ToolResultSharingContext);
  const sharedResults = useMemo(
    () => (context?.sharedResults ?? []).filter((result) => result.consent.targetToolIds.includes(targetToolId)),
    [context?.sharedResults, targetToolId],
  );
  const shareResultWithTarget = useCallback(
    (raw: unknown) => context?.shareResultWithTool(raw, targetToolId) ?? { ok: false as const },
    [context, targetToolId],
  );
  const revokeResult = useCallback(
    (resultId: string) => context?.revokeResultForTool(resultId, targetToolId),
    [context, targetToolId],
  );
  return useMemo(() => ({ sharedResults, shareResultWithTarget, revokeResult }), [sharedResults, shareResultWithTarget, revokeResult]);
}
