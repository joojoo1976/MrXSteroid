import { SessionMemoryInputV7Schema } from '@/lib/tools/schemas/tool-250-personal-fitness-memory-layer.v7';

export function recordSessionMemory(raw: unknown) {
  return {
    status: 'RECORDED' as const,
    resultType: 'SESSION_ONLY' as const,
    entry: SessionMemoryInputV7Schema.parse(raw),
    retention: 'CURRENT_COMPONENT_SESSION_ONLY' as const,
    limitations: [
      'This function returns a value only; it does not write to a database, local storage, cookies, or a cross-tool store.',
      'The user must explicitly choose what to enter; no data is imported from another tool.',
    ],
  };
}
