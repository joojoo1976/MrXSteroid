/**
 * lib/engines/core/v4/profiles/macro-pilot-state.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Batch D — Additive Macro Pilot Presentation State
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Pure mapping from the accepted V4 envelope state to the pilot's localized
 *  presentation state. It does not calculate, store, log, fetch, or render.
 *  The pilot consumes it so empty/partial/full/invalid/degraded/error handling
 *  is deterministic and directly testable.
 */

import type { InputCompleteness, ResultStatus } from '../contracts.v4';
import {
  getMacroMissingFields,
  getMacroProvidedFields,
  type MacroInputFieldIdV4,
} from './macro-input-metadata.v4';

export const MACRO_REQUIRED_FIELD_COUNT = 6;

export type MacroPilotPresentationStateV4 =
  | 'IDLE'
  | 'EMPTY'
  | 'PARTIAL'
  | 'FULL'
  | 'INVALID'
  | 'DEGRADED'
  | 'UNAVAILABLE'
  | 'ERROR';

export interface MacroPilotStateInputV4 {
  hasError: boolean;
  hasEnvelope: boolean;
  status?: ResultStatus | null;
  completeness?: InputCompleteness | null;
  hasResult: boolean;
}

/**
 * Resolve the visible presentation state. `DEGRADED` is the controlled V4
 * mapping only; the current Macro V6 engine does not emit a degraded result.
 */
export function resolveMacroPilotPresentationStateV4(
  input: MacroPilotStateInputV4
): MacroPilotPresentationStateV4 {
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

export interface MacroRequiredFieldProgressV4 {
  provided: number;
  required: number;
  missing: MacroInputFieldIdV4[];
}

/** Count provided required fields and list missing ones in canonical order. */
export function getMacroRequiredFieldProgress(
  values: Partial<Record<MacroInputFieldIdV4, unknown>>
): MacroRequiredFieldProgressV4 {
  return {
    provided: getMacroProvidedFields(values).length,
    required: MACRO_REQUIRED_FIELD_COUNT,
    missing: getMacroMissingFields(values),
  };
}
