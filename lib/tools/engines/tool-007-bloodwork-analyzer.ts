/**
 * Tool #007 — Bloodwork Analyzer
 * Layer 7: Lab Result Interpretation & HPTA Assessment
 * Platform: MrXSteroid.com | Core: Clinical Laboratory Data Analysis
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Interpret common bloodwork markers
 * - HPTA (Hypothalamic-Pituitary-Testicular Axis) status assessment
 * - Reference ranges male/female
 * - Post-cycle vs TRT vs baseline comparison
 * - Auto-detect suppression patterns
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface BloodworkMarker {
  name_en: string;
  name_ar: string;
  category: 'estrogen' | 'gonadotropins' | 'liver' | 'lipids' | 'complete_blood' | 'other';
  unit: 'pg/mL' | 'mIU/mL' | 'mg/dL' | 'U/L' | '10^3/µL' | 'ng/dL';
  reference_range_male: string;
  reference_range_female: string;
  high_flag: string;
  low_flag: string;
  significance: 'critical' | 'high' | 'moderate' | 'mild';
}

export interface BloodworkResult {
  test_date: string;
  markers: BloodworkMarker[];
  overall_assessment: 'optimal' | 'suboptimal' | 'concerning' | 'critical';
  hpta_status: 'fully_recovered' | 'partially_suppressed' | 'severely_suppressed' | 'unknown';
  recommendations: string[];
}

export interface BloodworkComparison {
  baseline: BloodworkResult;
  current: BloodworkResult;
  changes: MarkerChange[];
}

export interface MarkerChange {
  marker_name: string;
  direction: 'increased' | 'decreased' | 'stable';
  change_percentage: number;
  clinical_significance: string;
}