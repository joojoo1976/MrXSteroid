/**
 * Deterministic comparison against reference limits entered by the user.
 * This performs interval arithmetic only; it does not interpret clinical risk,
 * recovery, or treatment needs.
 */
import type { BloodworkComparisonRecord, BloodworkComparisonResult } from '../schemas/tool-024-bloodwork-interpreter';

export function compareBloodworkToEnteredIntervalsV7(
  records: readonly BloodworkComparisonRecord[],
): BloodworkComparisonResult {
  return {
    resultOrigin: 'CALCULATED',
    comparisons: records.map((record) => ({
      record,
      relation: record.value < record.referenceLow
        ? 'BELOW_ENTERED_INTERVAL'
        : record.value > record.referenceHigh
          ? 'ABOVE_ENTERED_INTERVAL'
          : 'WITHIN_ENTERED_INTERVAL',
    })),
  };
}
