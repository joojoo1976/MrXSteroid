/** Tool #068 — Gynecomastia Tracker — input schema (zod). */
import { z } from 'zod';

export const GynecomastiaEntrySchema = z.object({
  month: z.number().min(0).max(600),
  stage: z.number().min(1).max(4),
  size_mm: z.number().min(0).max(300),
  tender: z.boolean(),
});

export const GynecomastiaInputSchema = z.object({
  entries: z.array(GynecomastiaEntrySchema).min(1).max(120),
  unilateral: z.boolean(),
  nipple_discharge: z.boolean(),
  androgen_exposure: z.boolean(),
});

export type GynecomastiaEntry = z.infer<typeof GynecomastiaEntrySchema>;
export type GynecomastiaInput = z.infer<typeof GynecomastiaInputSchema>;
