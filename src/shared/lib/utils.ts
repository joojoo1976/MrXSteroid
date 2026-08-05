import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with locale support
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale?: string): string {
  const resolvedLocale = locale || 'en-US';

  // SAR needs special handling because Intl uses "SAR" not ﷼
  if (currency === 'SAR' && !locale) {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${formatted} ﷼`;
  }

  return new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date with various formats
 */
export function formatDate(
  date: Date,
  format: 'standard' | 'short' | 'long' | 'relative' | 'iso' = 'standard',
  isRTL: boolean = false
): string {
  if (isNaN(date.getTime())) return 'Invalid Date';

  const locale = isRTL ? 'ar' : 'en-US';

  switch (format) {
    case 'iso':
      return date.toISOString().split('T')[0];
    case 'short':
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
      }).format(date);
    case 'long':
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(date);
    case 'relative': {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return isRTL ? 'اليوم' : 'Today';
      if (diffDays === 1) return isRTL ? 'أمس' : 'Yesterday';
      if (diffDays < 7) return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
    case 'standard':
    default:
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
  }
}

type WeightUnit = 'kg' | 'lbs' | 'g' | 'oz';
type LengthUnit = 'cm' | 'inches' | 'm' | 'ft';

const WEIGHT_TO_KG: Record<WeightUnit, number> = {
  kg: 1,
  lbs: 0.45359237,
  g: 0.001,
  oz: 0.0283495231,
};

const LENGTH_TO_CM: Record<LengthUnit, number> = {
  cm: 1,
  inches: 2.54,
  m: 100,
  ft: 30.48,
};

/**
 * Convert weight between units
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (!(from in WEIGHT_TO_KG)) throw new Error(`Invalid weight unit: ${from}`);
  if (!(to in WEIGHT_TO_KG)) throw new Error(`Invalid weight unit: ${to}`);
  const valueInKg = value * WEIGHT_TO_KG[from];
  return valueInKg / WEIGHT_TO_KG[to];
}

/**
 * Convert length between units
 */
export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  if (!(from in LENGTH_TO_CM)) throw new Error(`Invalid length unit: ${from}`);
  if (!(to in LENGTH_TO_CM)) throw new Error(`Invalid length unit: ${to}`);
  const valueInCm = value * LENGTH_TO_CM[from];
  return valueInCm / LENGTH_TO_CM[to];
}

/**
 * Creates a debounced function that delays invoking func 
 */
export function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: unknown[]) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  }) as T;
}

/**
 * Creates a throttled function that only invokes func at most once per wait ms
 */
export function throttle<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: unknown[]) => {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);

    if (remaining <= 0) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      func(...args);
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutId = null;
        func(...args);
      }, remaining);
    }
  }) as T;
}

/**
 * Validate email format
 */
export function isValidEmail(email: unknown): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if password meets strength requirements
 */
export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSpecial;
}
