// lib/shared/unit-system.ts
/**
 * lib/shared/unit-system.ts
 * Unified Unit System Service for SmartTools
 * Metric/Imperial conversions, persistence, and display
 */

export type UnitSystem = 'metric' | 'imperial';

/** Conversion constants */
export const UNIT_CONSTANTS = {
  KG_TO_LBS: 2.20462,
  MG_PER_OZ: 28349.523125,
} as const;

/** Precision settings */
export const PRECISION = {
  MG_TO_OZ_DP: 6,    // mg → oz: 6 decimal places
  OZ_TO_MG_DP: 1,    // oz → mg: 1 decimal place
  KG_TO_LBS_DP: 0,   // kg → lbs: integer
  LBS_TO_KG_DP: 1,   // lbs → kg: 1 decimal place
} as const;

/** Storage key for unit system preference */
const STORAGE_KEY = 'measurementSystem';

/**
 * Core conversion functions
 */
export const unitConversions = {
  /** kg → lbs (rounded to integer) */
  kgToLbs: (kg: number): number => Math.round(kg * 2.20462),
  
  /** lbs → kg (1 decimal place) */
  lbsToKg: (lbs: number): number => Math.round((lbs / 2.20462) * 10) / 10,
  
  /** mg → oz (6 decimal places) */
  mgToOz: (mg: number): number => Math.round((mg / 28349.523125) * 1e6) / 1e6,
  
  /** oz → mg (1 decimal place) */
  ozToMg: (oz: number): number => Math.round(oz * 28349.523125 * 10) / 10,
} as const;

/**
 * LocalStorage persistence for unit system
 */
export const unitStorage = {
  /** Get stored unit system, default to metric */
  getStored: (): UnitSystem => {
    if (typeof window === 'undefined') return 'metric';
    try {
      const stored = localStorage.getItem('measurementSystem');
      if (stored === 'metric' || stored === 'imperial') return stored;
    } catch {
      // Ignore localStorage errors
    }
    return 'metric';
  },
  
  /** Store unit system preference */
  store: (system: UnitSystem): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('measurementSystem', system);
    } catch {
      // Ignore localStorage errors
    }
  },
} as const;

/**
 * Type for unit label categories
 */
type UnitLabelCategory = 'system' | 'dose' | 'weight' | 'height';

/**
 * Type for unit label object
 */
type UnitLabelObject = {
  en: string;
  ar: string;
};

/**
 * Type for unit labels structure
 */
type UnitLabels = {
  metric: {
    en: string;
    ar: string;
    dose: UnitLabelObject;
    weight: UnitLabelObject;
    height: UnitLabelObject;
  };
  imperial: {
    en: string;
    ar: string;
    dose: UnitLabelObject;
    weight: UnitLabelObject;
    height: UnitLabelObject;
  };
};

/**
 * Display labels for unit systems
 */
export const unitLabels: UnitLabels = {
  metric: {
    en: 'Metric (mg/kg/cm)',
    ar: 'متري (ملغ/كغ/سم)',
    dose: { en: 'mg/week', ar: 'ملغ/أسبوع' },
    weight: { en: 'kg', ar: 'كغ' },
    height: { en: 'cm', ar: 'سم' },
  },
  imperial: {
    en: 'Imperial (mg/lb/in)',
    ar: 'إمبراطوري (ملغ/رطل/إنش)',
    dose: { en: 'oz/week', ar: 'أونصة/أسبوع' },
    weight: { en: 'lbs', ar: 'رطل' },
    height: { en: 'in', ar: 'إنش' },
  },
} as const;

/**
 * Get display label for current unit system and locale
 */
export function getUnitLabel(
  system: UnitSystem,
  category: 'system' | 'dose' | 'weight' | 'height',
  locale: 'ar' | 'en'
): string {
  // Use type assertion to help TypeScript narrow the union type
  const systemLabels = unitLabels[system] as UnitLabels['metric'];
  
  if (category === 'system') {
    return locale === 'ar' ? systemLabels.ar : systemLabels.en;
  }
  
  const labels = systemLabels[category as keyof typeof systemLabels] as UnitLabelObject;
  return locale === 'ar' ? labels.ar : labels.en;
}

/**
 * Round-trip validation: ensures conversions don't drift
 */
export function validateRoundTrip(): boolean {
  const testValues = [1, 10, 100, 300, 500, 1000, 2000];
  
  for (const mg of testValues) {
    const oz = unitConversions.mgToOz(mg);
    const back = unitConversions.ozToMg(oz);
    if (Math.abs(back - mg) > 0.5) {
      return false;
    }
  }
  
  // Test kg ↔ lbs
  for (const kg of [1, 10, 50, 85, 100, 150]) {
    const lbs = unitConversions.kgToLbs(kg);
    const back = unitConversions.lbsToKg(lbs);
    if (Math.abs(back - kg) > 0.1) {
      return false;
    }
  }
  
  return true;
}