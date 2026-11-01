import { z } from 'zod';

const StudySchema = z.object({
  type: z.enum(['rct', 'meta_analysis', 'observational', 'animal', 'in_vitro', 'theoretical']),
  sample_size: z.number().finite().positive().max(10000).optional(),
  effect_size: z.number().finite().optional(),
  p_value: z.number().finite().min(0).max(1).optional(),
  quality_score: z.number().finite().min(0).max(10).optional(),
  outcome: z.string().trim().min(1).max(200),
  year: z.number().finite().min(1950).max(2030),
});

const SupplementSchema = z.object({
  id: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(100),
  category: z.enum(['vitamin', 'mineral', 'amino_acid', 'herbal', 'prohormone', 'peptide', 'other']),
  studies: z.array(StudySchema).max(20).default([]),
  claimed_benefits: z.array(z.string().trim().min(1).max(100)).max(10).default([]),
  typical_dose: z.string().max(100).default(''),
  safety_notes: z.string().max(500).optional(),
});

export const SupplementInputSchema = z.object({
  supplements: z.array(SupplementSchema).min(1, 'At least one supplement required').max(20),
  goals: z.array(z.string().trim().min(1).max(50)).max(10).default([]),
});

export type SupplementInput = z.infer<typeof SupplementInputSchema>;
