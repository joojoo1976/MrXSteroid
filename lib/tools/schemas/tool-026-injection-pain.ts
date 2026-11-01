import { z } from 'zod';

const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Enter a real calendar date.');

/** A user-authored event note; it does not encode procedural instructions. */
export const InjectionExperienceEntrySchema = z.object({
  id: z.string().uuid(),
  eventDate: DateOnlySchema,
  siteLabel: z.string().trim().max(120).optional(),
  notes: z.string().trim().min(1).max(500),
}).strict();

export const InjectionExperienceInputSchema = z.object({
  entries: z.array(InjectionExperienceEntrySchema).max(100),
}).strict().superRefine(({ entries }, context) => {
  const seen = new Set<string>();
  entries.forEach((entry, index) => {
    if (seen.has(entry.id)) {
      context.addIssue({ code: 'custom', path: ['entries', index, 'id'], message: 'Entry IDs must be unique.' });
    }
    seen.add(entry.id);
  });
});

export const InjectionExperienceResultSchema = z.object({
  resultOrigin: z.literal('USER_PROVIDED'),
  assessment: z.literal('NOT_AVAILABLE'),
  reason: z.literal('NO_CLINICAL_ASSESSMENT_CONFIGURED'),
  entries: z.array(InjectionExperienceEntrySchema).max(100),
}).strict();

export type InjectionExperienceEntry = z.infer<typeof InjectionExperienceEntrySchema>;
export type InjectionExperienceInput = z.infer<typeof InjectionExperienceInputSchema>;
export type InjectionExperienceResult = z.infer<typeof InjectionExperienceResultSchema>;
