import { z } from 'zod';

const ExerciseInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  joint: z.enum(['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'spine']),
  sets: z.number().finite().int().positive().max(20),
  reps: z.number().finite().int().positive().max(50),
  weight_kg: z.number().finite().positive().max(500),
  rpe: z.number().finite().min(1).max(10).optional(),
  range_of_motion: z.enum(['partial', 'full', 'extended']),
});

export const JointStressInputSchema = z.object({
  exercises: z.array(ExerciseInputSchema).min(1).max(20),
  age: z.number().finite().min(13).max(100),
  training_age_years: z.number().finite().min(0).max(30),
  sleep_hours: z.number().finite().min(4).max(12),
  protein_g_per_kg: z.number().finite().min(0).max(5),
  collagen_intake_g: z.number().finite().min(0).max(50).optional(),
  omega3_g: z.number().finite().min(0).max(10).optional(),
  previous_injuries: z.array(z.string().trim().min(1).max(100)).max(10).default([]),
  chronic_pain_joints: z.array(z.string().trim().min(1).max(100)).max(10).default([]),
}).strict();

export type JointStressInput = z.infer<typeof JointStressInputSchema>;

