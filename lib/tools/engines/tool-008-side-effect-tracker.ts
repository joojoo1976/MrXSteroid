/**
 * Tool #008 — Side Effect Tracker
 * Layer 8: Symptom Logging & Health Alert System
 * Platform: MrXSteroid.com | Core: HPTA Recovery Monitoring & Symptom Tracking
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Log side effects (gynecomastia, mood, libido, etc.)
 * - Track severity and duration
 * - Auto-alerts for concerning patterns
 * - Correlation with compound usage
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface SideEffectLog {
  id: string;
  date: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  category: 'estrogenic' | 'androgenic' | 'cardiovascular' | 'hepatotoxic' | 'psychological' | 'other';
  notes: string;
  compound_related?: string;
}

export interface UserSideEffectProfile {
  user_id: string;
  total_logs: number;
  most_common_symptoms: string[];
  severity_trend: 'improving' | 'stable' | 'worsening';
  last_assessment_date: string;
  risk_level: 'low' | 'moderate' | 'high';
}

export interface SideEffectPattern {
  symptom: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'rare';
  average_severity: number;
  first_observed: string;
  last_observed: string;
}