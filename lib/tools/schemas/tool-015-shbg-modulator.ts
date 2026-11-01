import { z } from 'zod';

export const SHBGInputSchema = z.object({
  total_testosterone_ng_dL: z.number().finite().positive(),
  shbg_nmol_L: z.number().finite().positive(),
  albumin_g_dL: z.number().finite().positive(),
}).strict();

export const SHBGResultSchema = z.object({
  status: z.literal('CALCULATED'),
  formula: z.literal('VERMEULEN_MASS_ACTION'),
  free_testosterone_nmol_L: z.number().finite().positive(),
  free_testosterone_ng_dL: z.number().finite().positive(),
  free_testosterone_percentage: z.number().finite().positive(),
  bioavailable_testosterone_nmol_L: z.number().finite().positive(),
  bioavailable_testosterone_ng_dL: z.number().finite().positive(),
  assumptions: z.object({
    albumin_molecular_weight_g_mol: z.literal(66500),
    albumin_association_constant_L_mol: z.literal(36000),
    shbg_association_constant_L_mol: z.literal(1_000_000_000),
  }).strict(),
}).strict();

export type SHBGInput = z.infer<typeof SHBGInputSchema>;
export type SHBGResult = z.infer<typeof SHBGResultSchema>;
