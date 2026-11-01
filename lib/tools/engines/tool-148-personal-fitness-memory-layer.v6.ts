import { PersonalFitnessContextListSchema, PersonalFitnessContextItemSchema, type PersonalFitnessContextItem } from '../schemas/tool-148-personal-fitness-memory-layer';
import { CrossToolResultEnvelopeV7Schema, type CrossToolResultEnvelopeV7 } from '../shared-data/cross-tool-result.v7';

export type PersonalFitnessContextValidation =
  | { status: 'READY'; item: PersonalFitnessContextItem }
  | { status: 'INVALID_INPUT'; errors: Array<{ field: string; message: string }> };

export function validatePersonalFitnessContextItem(raw: unknown): PersonalFitnessContextValidation {
  const parsed = PersonalFitnessContextItemSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 'INVALID_INPUT',
      errors: parsed.error.issues.map((issue) => ({ field: String(issue.path.at(-1) ?? 'item'), message: issue.message })),
    };
  }
  return { status: 'READY', item: parsed.data };
}

export function validatePersonalFitnessContextList(raw: unknown): { valid: true; items: PersonalFitnessContextItem[] } | { valid: false; errors: string[] } {
  const parsed = PersonalFitnessContextListSchema.safeParse(raw);
  return parsed.success
    ? { valid: true, items: parsed.data }
    : { valid: false, errors: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'items'}: ${issue.message}`) };
}

/** Returns only items the user explicitly opted to share with the named tool. */
export function selectPersonalContextForTool(
  items: readonly PersonalFitnessContextItem[],
  targetTool: 'tool-149-physique-trajectory-simulator',
): CrossToolResultEnvelopeV7[] {
  const validation = validatePersonalFitnessContextList(items);
  if (!validation.valid) return [];
  if (targetTool !== 'tool-149-physique-trajectory-simulator') return [];
  return validation.items.flatMap((item) => {
    if (!item.shareWithTool149 || !item.shareGrantedAt) return [];
    const candidate = {
      schemaVersion: 1 as const,
      resultId: item.id,
      sourceToolId: 'tool-148-personal-fitness-memory-layer',
      sourceToolVersion: '6.0.0',
      createdAt: item.shareGrantedAt,
      privacyClass: 'SENSITIVE' as const,
      fields: [{
        key: item.field,
        value: item.value,
        unit: item.unit,
        origin: 'USER_PROVIDED' as const,
        // Do not send the user's source/date metadata to the consuming tool.
        sourceLabel: 'User-entered value',
      }],
      consent: { grantedAt: item.shareGrantedAt, targetToolIds: [targetTool] },
    };
    const parsed = CrossToolResultEnvelopeV7Schema.safeParse(candidate);
    return parsed.success ? [parsed.data] : [];
  });
}
