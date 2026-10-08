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

/**
 * Layer 3 entry point: weekly trend analysis per metric.
 * Returns one ProgressTrend for weight, strength and body-fat, each with the
 * direction of travel and the average change per week over the logged span.
 */
export function calculateProgress(entries: ProgressEntry[]): ProgressTrend[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const trends: ProgressTrend[] = [];

  const buildTrend = (
    metric: ProgressTrend['metric'],
    label: string,
    pick: (e: ProgressEntry) => number | undefined
  ): void => {
    const dataPoints = sorted.filter((e) => pick(e) !== undefined);
    if (dataPoints.length < 2) {
      trends.push({ metric, label, dataPoints, trendDirection: 'unknown', avgChangePerWeek: 0 });
      return;
    }
    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];
    const firstVal = pick(first) ?? 0;
    const lastVal = pick(last) ?? 0;
    const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
    const weeks = Math.max(1, days / 7);
    const delta = lastVal - firstVal;
    const avgChangePerWeek = Math.round((delta / weeks) * 100) / 100;
    const trendDirection: ProgressTrend['trendDirection'] =
      Math.abs(delta) < 0.5 ? 'stable' : delta > 0 ? 'up' : 'down';
    trends.push({ metric, label, dataPoints, trendDirection, avgChangePerWeek });
  };

  buildTrend('weight', 'Weight (kg)', (e) => e.weight_kg ?? (e.weight_lbs !== undefined ? e.weight_lbs / 2.20462 : undefined));
  buildTrend('strength', 'Strength (kg)', (e) => e.strength_kg ?? (e.strength_lbs !== undefined ? e.strength_lbs / 2.20462 : undefined));
  buildTrend('body_fat', 'Body Fat (%)', (e) => e.body_fat_pct);

  return trends;
}