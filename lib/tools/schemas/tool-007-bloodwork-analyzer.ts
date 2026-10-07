/**
 * Tool #007 — Bloodwork Analyzer
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const BloodworkMarkerSchema = z.object({
  name_en: z.string(),
  name_ar: z.string(),
  category: z.enum(['estrogen', 'gonadotropins', 'liver', 'lipids', 'complete_blood', 'other']),
  unit: z.enum(['pg/mL', 'mIU/mL', 'mg/dL', 'U/L', '10^3/µL', 'ng/dL']),
  reference_range_male: z.string(),
  reference_range_female: z.string(),
  high_flag: z.string(),
  low_flag: z.string(),
  significance: z.enum(['critical', 'high', 'moderate', 'mild']),
});

export type BloodworkMarker = z.infer<typeof BloodworkMarkerSchema>;

export const BloodworkResultSchema = z.object({
  test_date: z.string(),
  markers: z.array(BloodworkMarkerSchema),
  overall_assessment: z.enum(['optimal', 'suboptimal', 'concerning', 'critical']),
  hpta_status: z.enum(['fully_recovered', 'partially_suppressed', 'severely_suppressed', 'unknown']),
  recommendations: z.array(z.string()),
});

export type BloodworkResult = z.infer<typeof BloodworkResultSchema>;

export const BloodworkComparisonSchema = z.object({
  baseline: BloodworkResult,
  current: BloodworkResult,
  changes: z.array(z.object({
    marker_name: z.string(),
    direction: z.enum(['increased', 'decreased', 'stable']),
    change_percentage: z.number(),
    clinical_significance: z.string(),
  })),
});

export type BloodworkComparison = z.infer<typeof BloodworkComparisonSchema>;