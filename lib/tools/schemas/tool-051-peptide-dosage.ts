/** Tool #051 — Peptide Dosage Calculator — input schema (zod). */
import { z } from 'zod';

export const PeptideDosageInputSchema = z.object({
  vial_mg: z.number().min(0).max(500),
  diluent_ml: z.number().min(0.1).max(100),
  vial_iu: z.number().min(0).max(100000).optional(),
  unit: z.enum(['mcg', 'mg', 'iu']),
  user_stated_amount: z.number().min(0).max(100000).optional(),
  syringe_units_per_ml: z.number().min(1).max(1000),
});

export type PeptideDosageInput = z.infer<typeof PeptideDosageInputSchema>;
