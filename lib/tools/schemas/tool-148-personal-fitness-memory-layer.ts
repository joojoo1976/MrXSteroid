import { z } from 'zod';

export const PERSONAL_FITNESS_CONTEXT_FIELDS = [
  'current_weight_kg',
  'current_body_fat_pct',
  'target_body_fat_pct',
] as const;

export const PersonalFitnessContextFieldSchema = z.enum(PERSONAL_FITNESS_CONTEXT_FIELDS);
export const PersonalFitnessContextTargetSchema = z.literal('tool-149-physique-trajectory-simulator');

export const PersonalFitnessContextItemSchema = z.object({
  id: z.string().trim().min(1).max(80),
  field: PersonalFitnessContextFieldSchema,
  value: z.number().finite(),
  unit: z.string().trim().min(1).max(24),
  source: z.string().trim().min(1).max(160),
  recordedOn: z.string().date(),
  shareWithTool149: z.boolean().default(false),
  shareGrantedAt: z.string().datetime({ offset: true }).optional(),
}).strict().superRefine((item, context) => {
  if (item.field === 'current_weight_kg' && (item.value <= 0 || item.value > 500)) {
    context.addIssue({ code: 'custom', path: ['value'], message: 'Weight must be greater than 0 and no more than 500 kg.' });
  }
  if (item.field !== 'current_weight_kg' && (item.value < 3 || item.value > 70)) {
    context.addIssue({ code: 'custom', path: ['value'], message: 'Body-fat percentage must be between 3 and 70.' });
  }
  const expectedUnit = item.field === 'current_weight_kg' ? 'kg' : '%';
  if (item.unit !== expectedUnit) {
    context.addIssue({ code: 'custom', path: ['unit'], message: `This field requires the canonical ${expectedUnit} unit.` });
  }
  if (item.shareWithTool149 && !item.shareGrantedAt) {
    context.addIssue({ code: 'custom', path: ['shareGrantedAt'], message: 'Explicit sharing requires a recorded consent time.' });
  }
  if (!item.shareWithTool149 && item.shareGrantedAt) {
    context.addIssue({ code: 'custom', path: ['shareGrantedAt'], message: 'Consent time must be removed when sharing is revoked.' });
  }
});

export const PersonalFitnessContextListSchema = z.array(PersonalFitnessContextItemSchema).max(30).superRefine((items, context) => {
  const ids = items.map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: 'custom', message: 'Context item identifiers must be unique.' });
  }
});

export type PersonalFitnessContextField = z.infer<typeof PersonalFitnessContextFieldSchema>;
export type PersonalFitnessContextTarget = z.infer<typeof PersonalFitnessContextTargetSchema>;
export type PersonalFitnessContextItem = z.infer<typeof PersonalFitnessContextItemSchema>;
