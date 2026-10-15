/**
 * lib/tools/schemas/tool-111-smart-food-macro-substitution.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #111 — Layer 2: Zod validation boundary for the Smart Food & Macro
 *  Substitution Engine.
 * ═══════════════════════════════════════════════════════════════════════════
 * Follows the `lib/tools/schemas/aromatization-risk.ts` convention:
 * `.strict()` objects, finite numbers, bilingual error messages (AR first).
 */
import { z } from 'zod';
import {
  FoodCategory,
  DataSource,
  DataQuality,
  Unit,
  UnitSystem,
  Locale,
  type FoodItem,
  type EngineInput,
} from '../engines/staging/tool-111-smart-food-macro-substitution-engine';

/** Zod enum for FoodCategory (re-exported from engine for validation) */
const FoodCategoryEnum = z.enum([
  'PROTEIN', 'CARBS', 'FAT', 'DAIRY', 'VEGETABLE', 'FRUIT', 'GRAIN',
  'LEGUME', 'NUT_SEED', 'MEAT', 'POULTRY', 'FISH', 'EGG', 'PROCESSED',
  'SUPPLEMENT', 'OTHER',
] as const);

/** Zod enum for DataSource */
const DataSourceEnum = z.enum([
  'USDA', 'brand', 'manufacturer', 'estimated',
] as const);

/** Zod enum for DataQuality */
const DataQualityEnum = z.enum(['high', 'medium', 'low'] as const);

/** Zod enum for Unit */
const UnitEnum = z.enum([
  'g', 'kg', 'oz', 'lb', 'ml', 'l', 'fl_oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice',
] as const);

/** Zod enum for UnitSystem */
const UnitSystemEnum = z.enum(['metric', 'imperial'] as const);

/** Zod enum for Locale */
const LocaleEnum = z.enum(['ar', 'en'] as const);

/** FoodItem schema with bilingual validation */
const FoodItemSchema = z
  .object({
    id: z.string().min(1, 'معرف الطعام مطلوب'),
    name: z.string().min(1, 'اسم الطعام مطلوب'),
    nameEn: z.string().min(1, 'اسم الطعام بالإنجليزية مطلوب'),
    macrosPer100g: z
      .object({
        protein: z.number().finite('البروتين يجب أن يكون رقماً').min(0, 'البروتين لا يمكن أن يكون سالباً'),
        carbs: z.number().finite('الكربوهيدرات يجب أن تكون رقماً').min(0, 'الكربوهيدرات لا يمكن أن تكون سالبة'),
        fat: z.number().finite('الدهون يجب أن تكون رقماً').min(0, 'الدهون لا يمكن أن تكون سالبة'),
        calories: z.number().finite('السعرات يجب أن تكون رقماً').min(0, 'السعرات لا يمكن أن تكون سالبة'),
        fiber: z.number().finite().min(0).optional(),
        sugar: z.number().finite().min(0).optional(),
        sodium: z.number().finite().min(0).optional(),
      })
      .strict(),
    servingSize: z.number().finite().min(0).optional(),
    servingUnit: UnitEnum.optional(),
    category: FoodCategoryEnum,
    aliases: z.array(z.string()).optional(),
    dataSource: DataSourceEnum,
    dataQuality: DataQualityEnum,
    lastUpdated: z.string().min(1, 'تاريخ التحديث مطلوب'),
  })
  .strict();

/** Target macros schema (optional) */
const TargetMacrosSchema = z
  .object({
    protein: z.number().finite().min(0).optional(),
    carbs: z.number().finite().min(0).optional(),
    fat: z.number().finite().min(0).optional(),
    calories: z.number().finite().min(0).optional(),
  })
  .strict()
  .optional();

/** EngineInput schema - the main validation boundary */
export const Tool111InputSchema = z
  .object({
    originalFood: FoodItemSchema,
    substituteFood: FoodItemSchema,
    originalQuantity: z
      .number()
      .finite('الكمية يجب أن تكون رقماً')
      .positive('الكمية يجب أن تكون موجبة')
      .max(10000, 'الكمية لا يمكن أن تتجاوز 10000'),
    originalUnit: UnitEnum,
    targetMacros: TargetMacrosSchema,
    unitSystem: UnitSystemEnum.optional(),
    locale: LocaleEnum.optional(),
  })
  .strict();

/** Validated input type */
export type Tool111InputValidated = z.infer<typeof Tool111InputSchema>;

/** Throwing parse — strict boundary used by UI save paths and API routes */
export function parseTool111Input(raw: unknown): Tool111InputValidated {
  return Tool111InputSchema.parse(raw);
}

/** Safe parse — typed error instead of a throw */
export function tryParseTool111Input(
  raw: unknown,
): { ok: true; data: Tool111InputValidated } | { ok: false; error: z.ZodError } {
  const result = Tool111InputSchema.safeParse(raw);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, error: result.error };
}

/** Default valid input for testing */
export const DEFAULT_TOOL_111_INPUT: EngineInput = {
  originalFood: {
    id: 'chicken-breast',
    name: 'صدر دجاج',
    nameEn: 'Chicken Breast',
    macrosPer100g: { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
    servingSize: 100,
    servingUnit: 'g',
    category: 'PROTEIN',
    dataSource: 'USDA',
    dataQuality: 'high',
    lastUpdated: '2024-01-01',
  },
  substituteFood: {
    id: 'tofu-firm',
    name: 'توفو صلب',
    nameEn: 'Firm Tofu',
    macrosPer100g: { protein: 15.7, carbs: 2.3, fat: 8.7, calories: 144 },
    servingSize: 100,
    servingUnit: 'g',
    category: 'PROTEIN',
    dataSource: 'USDA',
    dataQuality: 'high',
    lastUpdated: '2024-01-01',
  },
  originalQuantity: 100,
  originalUnit: 'g',
  unitSystem: 'metric',
  locale: 'en',
};