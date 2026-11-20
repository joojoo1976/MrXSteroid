/**
 * lib/engines/core/v4/profiles/tool-pilot-state.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  R5 First Batch — Shared additive pilot presentation-state helper
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Shared by the three selected pilots (BMI, Protein Needs, Water Intake).
 *  Pure mapping from the accepted V4 envelope state to the pilot's localized
 *  presentation state. No calculation, storage, logging, network or rendering.
 *
 *  `DEGRADED` is the controlled V4 mapping only; none of the three engines
 *  emits a degraded result.
 */

import type { InputCompleteness, ResultStatus } from '../contracts.v4';

export type ToolPilotPresentationStateV4 =
  | 'IDLE'
  | 'EMPTY'
  | 'PARTIAL'
  | 'FULL'
  | 'INVALID'
  | 'DEGRADED'
  | 'UNAVAILABLE'
  | 'ERROR';

export interface ToolPilotStateInputV4 {
  hasError: boolean;
  hasEnvelope: boolean;
  status?: ResultStatus | null;
  completeness?: InputCompleteness | null;
  hasResult: boolean;
}

/**
 * Resolve the visible presentation state.
 * `DEGRADED` is a controlled mapping; the current engines do not emit one.
 */
export function resolveToolPilotPresentationStateV4(
  input: ToolPilotStateInputV4
): ToolPilotPresentationStateV4 {
  if (input.hasError) return 'ERROR';
  if (!input.hasEnvelope) return 'IDLE';
  if (input.status === 'DEGRADED') return 'DEGRADED';
  if (input.status === 'INVALID') return 'INVALID';
  if (input.status === 'VALID' && input.hasResult) return 'FULL';
  if (input.completeness === 'INSUFFICIENT_FOR_SAFE_RESULT') return 'EMPTY';
  if (input.completeness === 'INCOMPLETE') return 'PARTIAL';
  if (input.status === 'PARTIAL') return 'PARTIAL';
  return 'UNAVAILABLE';
}

/** Count provided values; entries that are nullish are never provided. */
export function countProvidedToolFields(values: readonly unknown[]): number {
  return values.filter((value) => value !== undefined && value !== null).length;
}
