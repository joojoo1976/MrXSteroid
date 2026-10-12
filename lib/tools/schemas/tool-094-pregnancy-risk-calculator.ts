import { z } from 'zod';

export const PregnancyRiskCalculatorInputSchema = z.object({
  compound_class: z.enum([
    'anabolic_androgenic_steroid',
    'sarm',
    'aromatase_inhibitor_or_serm',
    'retinoid_isotretinoin',
    'thermogenic_adrenergic',
  ]),
  weeks_since_last_exposure: z.number().min(0).max(104),
  currently_pregnant_or_attempting_conception: z.boolean(),
  unprotected_intercourse_during_exposure: z.boolean(),
});

export type PregnancyRiskCalculatorInput = z.infer<typeof PregnancyRiskCalculatorInputSchema>;
