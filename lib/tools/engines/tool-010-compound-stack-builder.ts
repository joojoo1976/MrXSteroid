/**
 * Tool #010 — Compound Stack Builder
 * Layer 10: Stack Synergy & Interaction Calculator
 * Platform: MrXSteroid.com | Core: Compound Interaction & Synergy Analysis
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Build compound stacks with synergy scoring
 * - Detect antagonistic compound combinations
 * - Calculate estimated SHBG impact
 * - Visual stack composition radar
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface StackCompound {
  id: number;
  name_en: string;
  name_ar: string;
  family: string;
  weekly_dose_mg: number;
  duration_weeks: number;
  synergy_score: number; // -100 (antagonistic) to +100 (synergistic)
  primary_effect: 'mass' | 'cutting' | 'recovery' | 'performance';
  aromatization_factor: number;
}

export interface CompoundStack {
  name: string;
  compounds: StackCompound[];
  total_weekly_dose: number;
  estimated_suppression: number; // 0-100%
  synergy_rating: 'negative' | 'neutral' | 'positive';
  recommendations: string[];
}