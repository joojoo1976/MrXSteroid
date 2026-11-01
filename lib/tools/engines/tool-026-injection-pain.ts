import type { InjectionExperienceEntry, InjectionExperienceResult } from '../schemas/tool-026-injection-pain';
import { InjectionExperienceInputSchema } from '../schemas/tool-026-injection-pain';

/** Returns user-entered event notes without scoring or clinical interpretation. */
export function buildInjectionExperienceSessionV7(
  entries: readonly InjectionExperienceEntry[],
): InjectionExperienceResult {
  const validated = InjectionExperienceInputSchema.parse({ entries });
  return {
    resultOrigin: 'USER_PROVIDED',
    assessment: 'NOT_AVAILABLE',
    reason: 'NO_CLINICAL_ASSESSMENT_CONFIGURED',
    entries: validated.entries.map((entry) => ({ ...entry })),
  };
}
