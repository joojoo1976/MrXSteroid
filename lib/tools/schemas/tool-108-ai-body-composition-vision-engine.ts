import { z } from 'zod';

export const VisionInputSchema = z.object({
  weight_kg: z.number().min(30).max(250),
  height_cm: z.number().min(120).max(230),
  age_years: z.number().min(16).max(85),
  sex: z.enum(['male', 'female']),
  neck_cm: z.number().min(20).max(60),
  waist_cm: z.number().min(40).max(200),
  hips_cm: z.number().min(50).max(250),
  chest_cm: z.number().min(50).max(350),
  photo_count: z.number().min(0).max(12),
  photo_quality: z.enum(['poor', 'medium', 'high']),
});

export type VisionInput = z.infer<typeof VisionInputSchema>;
