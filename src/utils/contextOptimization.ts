
import { ChatMessage } from './geminiService';

/**
 * Mr. X Context Engineering Utilities
 * Implements Compaction, Masking, and Partitioning strategies.
 */

export interface ContextConfig {
    maxTokens: number;
    compactionThreshold: number; // e.g., 0.8 for 80%
    isRTL: boolean;
}

const DEFAULT_CONFIG: ContextConfig = {
    maxTokens: 32000, // Safe default for Gemini flash / GPT-4o-mini
    compactionThreshold: 0.8,
    isRTL: false
};

/**
 * Compaction Strategy: Summarizes history when approaching limits.
 * Preserves key Mr. X data (user goals, cycles, health metrics).
 */
export const compactHistory = async (
    history: ChatMessage[],
    summarizer: (history: ChatMessage[]) => Promise<string>,
    config: ContextConfig = DEFAULT_CONFIG
): Promise<ChatMessage[]> => {
    // Basic heuristic: message count or character length if token count is expensive to compute
    // For this implementation, we'll use a message count threshold (e.g., 10 turns)
    // or a total character length threshold.

    const totalChars = history.reduce((acc, msg) => acc + (msg.parts?.length || 0), 0);
    const charThreshold = config.maxTokens * 4 * config.compactionThreshold; // Rough tokens to chars conversion

    if (totalChars < charThreshold || history.length < 6) {
        return history;
    }

    console.log(`[Context Optimization] Compacting history (Utilization: ~${Math.round((totalChars / charThreshold) * 80)}%)`);

    // Elite Strategy: Protect Security and SpaceRemit logic from being summarized away
    const protectedKeywords = ['supabase', 'spaceremit', 'auth', 'payment', 'session', 'handshake'];
    const isProtected = (msg: ChatMessage) =>
        protectedKeywords.some(kw => msg.parts.toLowerCase().includes(kw));

    // Keep the most recent 3 messages AND any protected messages
    const recentHistory = history.slice(-3);
    const olderHistory = history.slice(0, -3);

    const historyToSummarize = olderHistory.filter(msg => !isProtected(msg));
    const protectedOldHistory = olderHistory.filter(msg => isProtected(msg));

    if (historyToSummarize.length < 3) {
        return history; // Not enough to summarize meaningfully while protecting security
    }

    try {
        const summary = await summarizer(historyToSummarize);

        const summaryMessage: ChatMessage = {
            role: 'model',
            parts: config.isRTL
                ? `[ملخص "Mr. X" للنقاش السابق]: ${summary}`
                : `[Mr. X Summary of Previous Discussion]: ${summary}`
        };

        return [summaryMessage, ...protectedOldHistory, ...recentHistory];
    } catch (error) {
        console.error("Compaction failed:", error);
        return history; // Fallback to original history on error
    }
};

/**
 * Observation Masking: Replaces large raw JSON outputs with identifiers.
 */
export const maskObservation = (
    data: unknown,
    label: string,
    isRTL: boolean = false
): { masked: string; raw: unknown; refId: string } => {
    const refId = `Obs_${Math.random().toString(36).substring(2, 9)}`;
    const rawString = JSON.stringify(data);

    // If it's small enough, don't mask
    if (rawString.length < 500) {
        return { masked: rawString, raw: data, refId };
    }

    const summary = Array.isArray(data)
        ? `${data.length} items found`
        : typeof data === 'object'
            ? Object.keys(data).join(', ')
            : 'Data payload';

    const masked = isRTL
        ? `[ملاحظة: ${refId}] (نوع: ${label}, فحص: ${summary}). تم الحجب للمحافظة على أداء النظام.`
        : `[Obs: ${refId}] (Type: ${label}, Summary: ${summary}). Masked for context efficiency.`;

    return { masked, raw: data, refId };
};

/**
 * Context Partitioning: Helper to feed synthesized results back to coordinator.
 * Prevents "Smart Tool" verbose outputs from flooding main context.
 */
export const synthesizeToolResult = (
    toolName: string,
    result: unknown,
    isRTL: boolean = false
): string => {
    const elitePrefix = isRTL ? 'تحليل "Mr. X" الإحترافي:' : 'Elite Mr. X Synthesis:';

    // Use observation masking to keep the context lean
    const { masked } = maskObservation(result, toolName, isRTL);
    return `${elitePrefix} ${toolName} analysis complete. ${masked}`;
};
