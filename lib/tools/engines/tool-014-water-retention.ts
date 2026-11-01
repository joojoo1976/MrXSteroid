import type { WaterRetentionResult } from '../schemas/tool-014-water-retention';

/**
 * No validated model or sourced threshold is available for this tool.
 * Intentionally return an explicit unavailable state instead of emitting the
 * former unsupported retention estimates, severity labels, or treatment advice.
 */
export function calculateWaterRetention(_input: unknown): WaterRetentionResult {
  return { status: 'NOT_AVAILABLE', reason: 'NO_VALIDATED_MODEL' };
}
