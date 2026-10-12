import { z } from 'zod';

export const SarmToAasTransitionInputSchema = z.object({
  sarm_compound: z.enum([
    'ostarine_mk2866',
    'ligandrol_lgd4033',
    'rad140_testolone',
    'andarine_s4',
    'yk11',
    'cardarine_gw501516',
  ]),
  sarm_use_weeks: z.number().min(1).max(104),
  suppression_severity: z.enum(['mild', 'moderate', 'severe']),
  prior_aas_use: z.boolean(),
  target_aas_ester: z.enum([
    'testosterone_propionate',
    'masteron_propionate',
    'trenbolone_acetate',
    'testosterone_enanthate',
    'testosterone_cypionate',
    'sustanon_250',
    'nandrolone_decanoate',
    'testosterone_undecanoate',
  ]),
  has_current_bloodwork: z.boolean(),
});

export type SarmToAasTransitionInput = z.infer<typeof SarmToAasTransitionInputSchema>;


