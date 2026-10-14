// lib/shared/schema-contract.ts
/**
 * lib/shared/schema-contract.ts
 * Unified Schema Contract for SmartTools
 * Layer 2 — Zod validation boundary with bilingual error messages
 */

import { z } from 'zod';

export interface ToolSchema<Input> {
  /** Zod schema for validation */
  schema: z.ZodSchema<Input>;
  
  /** Parse and validate, throws on failure */
  parse: (raw: unknown) => Input;
  
  /** Safe parse - returns typed result without throwing */
  tryParse: (raw: unknown) => 
    | { ok: true; data: Input }
    | { ok: false; error: z.ZodError };
}

/**
 * Creates a standardized tool schema with bilingual error support
 */
export function createToolSchema<Input>(
  schema: z.ZodSchema<Input>
): ToolSchema<Input> {
  return {
    schema,
    parse: (raw: unknown) => schema.parse(raw),
    tryParse: (raw: unknown) => {
      const result = schema.safeParse(raw);
      return result.success
        ? { ok: true, data: result.data }
        : { ok: false, error: result.error };
    },
  };
}

/**
 * Standard field types with bilingual validation messages
 */
export const SchemaFields = {
  /** Positive integer with min/max bounds */
  positiveInt: (min: number, max: number, fieldNameAr: string, fieldNameEn: string) =>
    z.number()
      .int(`${fieldNameAr} يجب أن يكون رقمًا صحيحًا`)
      .min(min, `${fieldNameAr} يجب أن يكون ${min} على الأقل`)
      .max(max, `${fieldNameAr} يجب أن يكون ${max} كحد أقصى`),
  
  /** Finite number with bounds */
  finiteNumber: (min: number, max: number, fieldNameAr: string, fieldNameEn: string) =>
    z.number()
      .finite(`${fieldNameAr} يجب أن يكون رقمًا`)
      .min(min, `${fieldNameAr} يجب أن يكون ${min} على الأقل`)
      .max(max, `${fieldNameAr} يجب أن يكون ${max} كحد أقصى`),
  
  /** Percentage (0-100) */
  percentage: (fieldNameAr: string, fieldNameEn: string) =>
    z.number()
      .finite(`${fieldNameAr} يجب أن يكون رقمًا`)
      .min(0, `${fieldNameAr} يجب أن يكون 0 أو أكثر`)
      .max(100, `${fieldNameAr} يجب أن يكون 100 كحد أقصى`),
  
  /** Enum with bilingual error */
  enum: <T extends string>(
    values: readonly T[],
    fieldNameAr: string,
    fieldNameEn: string
  ) => {
    // Convert readonly array to tuple for z.enum
    const tuple = values as [T, ...T[]];
    return z.enum(tuple).catch(() => {
      throw new Error(`${fieldNameAr} يجب أن يكون أحد القيم المسموحة`);
    });
  },
  
  /** Strict object (rejects extra keys) */
  strictObject: <T extends z.ZodRawShape>(shape: T) =>
    z.object(shape).strict(),
} as const;

/**
 * Common bilingual error messages
 */
export const BilingualErrors = {
  required: (fieldAr: string, fieldEn: string) => ({
    ar: `${fieldAr} مطلوب`,
    en: `${fieldEn} is required`,
  }),
  invalidType: (fieldAr: string, fieldEn: string, expectedAr: string, expectedEn: string) => ({
    ar: `${fieldAr} يجب أن يكون ${expectedAr}`,
    en: `${fieldEn} must be ${expectedEn}`,
  }),
  outOfRange: (fieldAr: string, fieldEn: string, min: number, max: number) => ({
    ar: `${fieldAr} يجب أن يكون بين ${min} و ${max}`,
    en: `${fieldEn} must be between ${min} and ${max}`,
  }),
} as const;