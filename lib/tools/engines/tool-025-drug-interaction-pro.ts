import type { MedicationSessionEntry, MedicationSessionResult } from '../schemas/tool-025-drug-interaction-pro';
import { MedicationSessionInputSchema } from '../schemas/tool-025-drug-interaction-pro';

/**
 * Builds a transparent session record. It intentionally does not infer,
 * score, or screen medication/compound interactions.
 */
export function buildMedicationSessionV7(
  entries: readonly MedicationSessionEntry[],
): MedicationSessionResult {
  const validated = MedicationSessionInputSchema.parse({ entries });
  return {
    resultOrigin: 'USER_PROVIDED',
    interactionAssessment: 'NOT_AVAILABLE',
    reason: 'NO_VALIDATED_INTERACTION_SOURCE_CONFIGURED',
    entries: validated.entries.map((entry) => ({ ...entry })),
  };
}
