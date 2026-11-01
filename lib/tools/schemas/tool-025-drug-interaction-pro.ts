import { z } from 'zod';

/** User-entered medication/compound details. No interaction rules are encoded here. */
export const MedicationSessionEntrySchema = z.object({
  id: z.string().uuid(),
  itemName: z.string().trim().min(1).max(120),
  itemType: z.enum(['prescription', 'over_the_counter', 'supplement', 'hormone_or_compound', 'other']),
  doseDescription: z.string().trim().max(80).optional(),
  sourceLabel: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(240).optional(),
}).strict();

export const MedicationSessionInputSchema = z.object({
  entries: z.array(MedicationSessionEntrySchema).max(50),
}).strict().superRefine(({ entries }, context) => {
  const ids = new Set<string>();
  entries.forEach((entry, index) => {
    if (ids.has(entry.id)) {
      context.addIssue({ code: 'custom', path: ['entries', index, 'id'], message: 'Entry IDs must be unique.' });
    }
    ids.add(entry.id);
  });
});

export const MedicationSessionResultSchema = z.object({
  resultOrigin: z.literal('USER_PROVIDED'),
  interactionAssessment: z.literal('NOT_AVAILABLE'),
  reason: z.literal('NO_VALIDATED_INTERACTION_SOURCE_CONFIGURED'),
  entries: z.array(MedicationSessionEntrySchema).max(50),
}).strict();

export type MedicationSessionEntry = z.infer<typeof MedicationSessionEntrySchema>;
export type MedicationSessionInput = z.infer<typeof MedicationSessionInputSchema>;
export type MedicationSessionResult = z.infer<typeof MedicationSessionResultSchema>;
