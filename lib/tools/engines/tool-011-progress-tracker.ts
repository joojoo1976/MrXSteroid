/**
 * Tool #011 — Progress Tracker
 * Layer 11: HPTA Recovery & Physique Progression Monitoring
 * Platform: MrXSteroid.com | Core: Progress Visualization & Trend Analysis
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Track weight, strength, and body fat over time
 * - Visual trend graphs (line charts)
 * - Compare current cycle vs previous cycles
 * - Auto-detect plateau/stagnation
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface ProgressEntry {
  id: string;
  date: string;
  weight_kg?: number;
  weight_lbs?: number;
  strength_kg?: number;  // lift weight in kg
  strength_lbs?: number; // lift weight in lbs
  body_fat_pct?: number;
  notes?: string;
  cycle_id?: string;
}

export interface ProgressTrend {
  metric: 'weight' | 'strength' | 'body_fat';
  label: string;
  dataPoints: ProgressEntry[];
  trendDirection: 'up' | 'down' | 'stable' | 'unknown';
  avgChangePerWeek: number;
}

export interface CycleComparison {
  cycleName: string;
  startDate: string;
  endDate: string;
  entries: ProgressEntry[];
  netWeightChange: number;
  strengthChange: number;
  bodyFatChange: number;
}