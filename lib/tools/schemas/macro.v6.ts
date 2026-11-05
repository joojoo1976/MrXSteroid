import { z } from 'zod';

const ageSchema = z.number().finite('age must be a finite number').min(19, 'age must be between 19 and 100').max(100, 'age must be between 19 and 100');
const sexSchema = z.enum(['male', 'female']);
const heightSchema = z.number().finite('heightCm must be a finite number').min(100, 'heightCm must be between 100 and 250').max(250, 'heightCm must be between 100 and 250');
const weightSchema = z.number().finite('weightKg must be a finite number').min(30, 'weightKg must be between 30 and 300').max(300, 'weightKg must be between 30 and 300');
const activitySchema = z.number().finite('activityLevel must be a finite number').min(1.2, 'activityLevel must be between 1.2 and 1.9').max(1.9, 'activityLevel must be between 1.2 and 1.9');
const phaseSchema = z.enum(['bulk', 'cut', 'maintenance', 'recomp']).refine(
  (phase) => phase !== 'recomp',
  'SPEC v3 defines bulk, cut, and maintenance only; recomp has no approved formula',
);
const goalSchema = z.enum(['bulk', 'cut', 'maintain', 'recomp']).refine(
  (goal) => goal !== 'recomp',
  'Recomposition has no approved Macro v6 formula',
);
const targetBodyFatSchema = z.number().finite('targetBodyFatPct must be finite').min(0, 'targetBodyFatPct must be between 0 and 100').max(100, 'targetBodyFatPct must be between 0 and 100');
const leanMassSchema = z.number().finite('leanMassKg must be finite').positive('leanMassKg must be positive');
const dietPreferenceSchema = z.enum(['balanced', 'high-protein', 'low-carb', 'ketogenic', 'high-carb']);
const targetWeightSchema = z.number().finite('targetWeightKg must be finite').positive('targetWeightKg must be finite and positive');
const unitSystemSchema = z.enum(['metric', 'imperial']);

function addCrossFieldIssues(
  input: {
    goal?: string | null;
    phase?: string | null;
    weightKg?: number | null;
    leanMassKg?: number | null;
    targetWeightKg?: number | null;
  },
  context: z.RefinementCtx,
) {
  if (input.goal && input.phase && input.goal !== 'recomp' && input.phase !== 'recomp') {
    const goalPhases = { bulk: 'bulk', cut: 'cut', maintain: 'maintenance' } as const;
    if (goalPhases[input.goal as keyof typeof goalPhases] !== input.phase) {
      context.addIssue({ code: 'custom', path: ['goal'], message: 'goal must match the selected calculation phase' });
    }
  }

  if (input.leanMassKg != null && input.weightKg != null && input.leanMassKg > input.weightKg) {
    context.addIssue({ code: 'custom', path: ['leanMassKg'], message: 'leanMassKg must be no greater than weightKg' });
  }

  if (input.targetWeightKg != null && input.weightKg != null) {
    if (input.phase === 'cut' && input.targetWeightKg >= input.weightKg) {
      context.addIssue({ code: 'custom', path: ['targetWeightKg'], message: 'Target weight must be lower than current weight for cut phase' });
    }
    if (input.phase === 'bulk' && input.targetWeightKg <= input.weightKg) {
      context.addIssue({ code: 'custom', path: ['targetWeightKg'], message: 'Target weight must be higher than current weight for bulk phase' });
    }
  }
}

const macroInputV6Shape = {
  age: ageSchema,
  sex: sexSchema,
  heightCm: heightSchema,
  weightKg: weightSchema,
  activityLevel: activitySchema,
  phase: phaseSchema,
  goal: goalSchema.optional(),
  targetBodyFatPct: targetBodyFatSchema.optional(),
  leanMassKg: leanMassSchema.optional(),
  dietPreference: dietPreferenceSchema.optional(),
  targetWeightKg: targetWeightSchema.optional(),
  unitSystem: unitSystemSchema.optional(),
};

/** Complete, strict runtime contract for Macro v6 canonical inputs (kg/cm). */
export const MacroInputV6Schema = z.object(macroInputV6Shape).strict().superRefine(addCrossFieldIssues);

/** Partial form-state contract; null and missing required fields remain incomplete, not invalid. */
export const MacroInputV6PartialSchema = z.object({
  age: ageSchema.nullish(),
  sex: sexSchema.nullish(),
  heightCm: heightSchema.nullish(),
  weightKg: weightSchema.nullish(),
  activityLevel: activitySchema.nullish(),
  phase: phaseSchema.nullish(),
  goal: goalSchema.nullish(),
  targetBodyFatPct: targetBodyFatSchema.nullish(),
  leanMassKg: leanMassSchema.nullish(),
  dietPreference: dietPreferenceSchema.nullish(),
  targetWeightKg: targetWeightSchema.nullish(),
  unitSystem: unitSystemSchema.nullish(),
}).strict().superRefine(addCrossFieldIssues);

export type MacroInputV6Contract = z.infer<typeof MacroInputV6Schema>;
