import { z } from 'zod';

const VelocityPointSchema = z.object({
  weight_kg: z.number().finite().positive().max(500),
  velocity_m_s: z.number().finite().positive().max(3),
});

export const VelocityInputSchema = z.object({
  velocity_profile: z.array(VelocityPointSchema).min(2).max(10),
  target_weight_kg: z.number().finite().positive().max(500),
  target_velocity_m_s: z.number().finite().positive().max(3).optional(),
  target_rpe: z.number().finite().min(1).max(10).optional(),
  target_rir: z.number().finite().min(0).max(10).optional(),
}).strict();

export type VelocityInput = z.infer<typeof VelocityInputSchema>;

