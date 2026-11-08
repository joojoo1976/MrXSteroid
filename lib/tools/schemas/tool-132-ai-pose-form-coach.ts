/**
 * lib/tools/schemas/tool-132-ai-pose-form-coach.ts
 * Tool #132 — AI Pose Form Coach — Zod Schema
 */

import { z } from 'zod';

export const PoseCoachInputSchema = z.object({
  exercise: z.enum(['squat', 'deadlift', 'bench', 'overhead_press', 'row']).default('squat'),
  videoUrl: z.string().optional(),
  checklist: z.array(z.object({
    item: z.string(),
    passed: z.boolean(),
  })).optional(),
});

export type PoseCoachInput = z.infer<typeof PoseCoachInputSchema>;

export const PoseCoachResultSchema = z.object({
  formScore: z.number().min(0).max(100).nullable(),
  checklist: z.array(z.object({
    item: z.string(),
    importance: z.string(),
    passed: z.boolean(),
  })),
  poseAnalysis: z.object({
    kneeAngle: z.number(),
    backAngle: z.number(),
  }).nullable(),
  personalizedCue: z.string(),
  confidence: z.number().nullable(),
  source: z.string(),
  scope_notice: z.string(),
});

export type PoseCoachResult = z.infer<typeof PoseCoachResultSchema>;