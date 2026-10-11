/**
 * Tool #054 — Glucose Tracker (Educational)
 * Layer 54: glucose statistics, estimated A1c, time-in-range.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15.2, §19, §40):
 *  - Statistics only; not a diagnosis. Severe hypo/hyper readings escalate.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface GlucoseReading {
  /** mg/dL */
  value: number;
  /** ISO timestamp. */
  at: string;
}

export interface GlucoseTrackerInput {
  readings: GlucoseReading[];
  /** Target range in mg/dL (defaults to 70–180). */
  target_low?: number;
  target_high?: number;
}

export interface GlucoseTrackerResult {
  count: number;
  mean_mg_dl: number;
  min_mg_dl: number;
  max_mg_dl: number;
  std_dev_mg_dl: number;
  time_in_range_pct: number;
  estimated_a1c_pct: number;
  hypo_count: number;
  hyper_count: number;
  emergency: boolean;
  emergency_message: string | null;
  educational_notice: string;
}

const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

/** eAG (mg/dL) → estimated A1c: A1c = (eAG + 46.7) / 28.7 (ADAG-derived). */
export function estimatedA1c(meanMgDl: number): number {
  return round((meanMgDl + 46.7) / 28.7, 1);
}

export function analyzeGlucose(input: GlucoseTrackerInput): GlucoseTrackerResult {
  const low = input.target_low ?? 70;
  const high = input.target_high ?? 180;
  const values = input.readings.map((r) => r.value).filter((v) => Number.isFinite(v));

  if (values.length === 0) {
    return {
      count: 0,
      mean_mg_dl: 0,
      min_mg_dl: 0,
      max_mg_dl: 0,
      std_dev_mg_dl: 0,
      time_in_range_pct: 0,
      estimated_a1c_pct: 0,
      hypo_count: 0,
      hyper_count: 0,
      emergency: false,
      emergency_message: null,
      educational_notice: 'No readings supplied.',
    };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const inRange = values.filter((v) => v >= low && v <= high).length;
  const hypo = values.filter((v) => v < 54).length;
  const hyper = values.filter((v) => v >= 250).length;

  return {
    count: values.length,
    mean_mg_dl: round(mean),
    min_mg_dl: round(Math.min(...values)),
    max_mg_dl: round(Math.max(...values)),
    std_dev_mg_dl: round(Math.sqrt(variance)),
    time_in_range_pct: round((inRange / values.length) * 100, 0),
    estimated_a1c_pct: estimatedA1c(mean),
    hypo_count: hypo,
    hyper_count: hyper,
    emergency: hypo > 0 || hyper > 0,
    emergency_message:
      hypo > 0
        ? 'URGENT: at least one reading is severely hypoglycaemic (<54 mg/dL). Treat immediately and seek care if severe.'
        : hyper > 0
          ? 'URGENT: at least one reading is severely hyperglycaemic (≥250 mg/dL). Seek clinical advice, especially if you feel unwell.'
          : null,
    educational_notice:
      'Educational statistics only. Estimated A1c is derived from your readings and is not a lab result.',
  };
}
