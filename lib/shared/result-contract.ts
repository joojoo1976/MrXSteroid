// lib/shared/result-contract.ts
/**
 * lib/shared/result-contract.ts
 * Unified Bilingual Result Contract for SmartTools
 * Standardized result format with Arabic/English support
 */

export interface BilingualLabels {
  en: Record<string, string>;
  ar: Record<string, string>;
}

export interface BilingualExplanation {
  en: string;
  ar: string;
}

export interface BilingualResult<Data = unknown> {
  /** Risk/result tier identifier */
  tier: string;
  
  /** Numerical score (0-100 typically) */
  score: number;
  
  /** Optional risk level string */
  riskLevel?: string;
  
  /** Localized display labels */
  labels: BilingualLabels;
  
  /** Localized explanation text */
  explanation: BilingualExplanation;
  
  /** Tool-specific result data */
  data: Data;
  
  /** Metadata for traceability and context */
  metadata: {
    /** Display unit system used */
    unitSystem: 'metric' | 'imperial';
    
    /** Locale used for localization */
    locale: 'ar' | 'en';
    
    /** Engine version that produced this result */
    engineVersion: string;
    
    /** ISO 8601 timestamp of calculation */
    calculatedAt: string;
  };
}

/**
 * Helper to create a bilingual result with common structure
 */
export function createBilingualResult<Data>(
  tier: string,
  score: number,
  labels: BilingualLabels,
  explanation: BilingualExplanation,
  data: Data,
  metadata: {
    unitSystem: 'metric' | 'imperial';
    locale: 'ar' | 'en';
    engineVersion: string;
    calculatedAt: string;
  },
  riskLevel?: string
): BilingualResult<Data> {
  return {
    tier,
    score,
    riskLevel,
    labels,
    explanation,
    data,
    metadata,
  };
}

/**
 * Type guard to check if a result is a valid BilingualResult
 */
export function isBilingualResult(value: unknown): value is BilingualResult {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.tier === 'string' &&
    typeof v.score === 'number' &&
    typeof v.labels === 'object' &&
    typeof v.explanation === 'object' &&
    typeof v.data !== 'undefined' &&
    typeof v.metadata === 'object'
  );
}