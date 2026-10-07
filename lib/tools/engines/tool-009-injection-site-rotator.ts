/**
 * Tool #009 — Injection Site Rotator
 * Layer 9: Injection Schedule Planner & Rotation Tracker
 * Platform: MrXSteroid.com | Core: Injection Site Management & Rotation
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Track injection sites (deltoid, glute, quad, etc.)
 * - Rotation schedule calculator
 * - abscess risk assessment
 * - Oil vs water-based compound tracking
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface InjectionSite {
  id: string;
  name_en: string;
  name_ar: string;
  location: 'deltoid' | 'glute' | 'quad' | 'pectoral' | 'bicep' | 'other';
  oil_based: boolean;
  last_injection_date: string;
  next_safe_date: string;
  rotation_priority: number; // Lower = rotate sooner
}

export interface InjectionRotationPlan {
  current_site: InjectionSite;
  next_sites: InjectionSite[];
  recommended_interval_days: number;
  total_sites_rotated: number;
  days_since_last_injection: number;
}