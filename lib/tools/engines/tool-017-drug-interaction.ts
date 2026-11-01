import { DrugInteractionResultSchema, type DrugInteractionResult } from '../schemas/tool-017-drug-interaction';

/**
 * Fails closed while no verified and maintained interaction source is wired.
 * In particular, absence of a source must never be presented as a negative
 * interaction screen or as evidence that a combination is safe.
 */
export function checkDrugInteractions(_input?: unknown): DrugInteractionResult {
  return DrugInteractionResultSchema.parse({
    status: 'NOT_AVAILABLE',
    reason: 'NO_VERIFIED_INTERACTION_SOURCE',
  });
}
