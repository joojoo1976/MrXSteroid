/**
 * Tool #009 — Injection Site Rotator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const InjectionSiteSchema = z.object({
  id: z.string().uuid(),
  name_en: z.string(),
  name_ar: z.string(),
  location: z.enum(['deltoid', 'glute', 'quad', 'pectoral', 'bicep', 'other']),
  oil_based: z.boolean(),
  last_injection_date: z.string().datetime(),
  next_safe_date: z.string().datetime(),
  rotation_priority: z.number().int().min(1),
});

export type InjectionSite = z.infer<typeof InjectionSiteSchema>;

export const InjectionRotationPlanSchema = z.object({
  current_site: InjectionSiteSchema,
  next_sites: z.array(InjectionSiteSchema),
  recommended_interval_days: z.number().int().min(1),
  total_sites_rotated: z.number().int().default(0),
  days_since_last_injection: z.number().int().min(0),
});

export type InjectionRotationPlan = z.infer<typeof InjectionRotationPlanSchema>;