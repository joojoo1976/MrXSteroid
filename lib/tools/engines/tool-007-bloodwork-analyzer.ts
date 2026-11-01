/**
 * Tool #007 currently records user-transcribed laboratory values only.
 * No reference-range interpretation, diagnostic classification, or advice is
 * calculated here because no validated rule/source contract is configured.
 */
import type { BloodworkRecord } from '@/lib/tools/schemas/tool-007-bloodwork-analyzer';

export type BloodworkRecordV7 = BloodworkRecord;

export interface BloodworkSessionV7 {
  resultOrigin: 'USER_PROVIDED';
  records: BloodworkRecordV7[];
  assessment: 'NOT_AVAILABLE';
  reason: 'NO_VALIDATED_INTERPRETATION_RULES';
}

/** Return the entered records unchanged and explicitly mark interpretation unavailable. */
export function buildBloodworkSessionV7(records: readonly BloodworkRecordV7[]): BloodworkSessionV7 {
  return {
    resultOrigin: 'USER_PROVIDED',
    records: [...records],
    assessment: 'NOT_AVAILABLE',
    reason: 'NO_VALIDATED_INTERPRETATION_RULES',
  };
}
