/**
 * lib/tools/schemas/injection.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #3 — Layer 2: Zod validation boundary for Interactive Injection Map input.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

const InjectionSiteSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  maxVolumeMl: z.number().finite().positive(),
  depthMm: z.number().finite().positive(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  landmarksEn: z.array(z.string()).min(1),
  landmarksAr: z.array(z.string()).min(1),
});

export const InjectionInputSchema = z
  .object({
    sites: z.array(InjectionSiteSchema).min(1, 'يجب تحديد موقع حقن واحد على الأقل'),
    lastUsedSites: z.array(z.string()).optional(),
    preferredSides: z.array(z.enum(['left', 'right'])).optional(),
    unitSystem: z.enum(['metric', 'imperial']).optional(),
  })
  .strict();

export type InjectionInput = z.infer<typeof InjectionInputSchema>;