import { z } from 'zod';

const temperatureC = z.number().finite().min(-273.15).max(1000).optional();
export const StorageExcursionInputSchema = z.object({
  productName: z.string().trim().max(160).optional(),
  productState: z.enum(['unopened', 'in_use', 'reconstituted']).optional(),
  queriedAt: z.string().datetime({ offset: true }).optional(),
  labelReference: z.string().trim().max(1000).optional(),
  labelRangeMinC: temperatureC,
  labelRangeMaxC: temperatureC,
  observedMinC: temperatureC,
  observedMaxC: temperatureC,
}).superRefine((input, ctx) => {
  if (input.labelRangeMinC !== undefined && input.labelRangeMaxC !== undefined && input.labelRangeMinC > input.labelRangeMaxC) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['labelRangeMaxC'], message: 'Label temperature minimum must not exceed its maximum.' });
  }
  if (input.observedMinC !== undefined && input.observedMaxC !== undefined && input.observedMinC > input.observedMaxC) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['observedMaxC'], message: 'Observed temperature minimum must not exceed its maximum.' });
  }
});

export type StorageExcursionInput = z.infer<typeof StorageExcursionInputSchema>;
export interface StorageExcursionResult {
  status: 'not_evaluable' | 'within_entered_range' | 'outside_entered_range';
  productName: string | null;
  productState: StorageExcursionInput['productState'] | null;
  queriedAt: string | null;
  labelReference: string | null;
  labelRangeC: { min: number; max: number } | null;
  observedRangeC: { min: number; max: number } | null;
  evaluation: string;
  reviewInstruction: string | null;
  missingFields: string[];
}

const DAILYMED_BASE = 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=';
const SET_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeDailyMedReference(reference: string | undefined): string | null {
  const value = reference?.trim();
  if (!value) return null;
  if (SET_ID.test(value)) return `${DAILYMED_BASE}${value}`;
  try {
    const url = new URL(value);
    const setId = url.searchParams.get('setid');
    if (url.protocol === 'https:' && url.hostname === 'dailymed.nlm.nih.gov' && url.pathname.toLowerCase() === '/dailymed/druginfo.cfm' && setId && SET_ID.test(setId)) {
      return `${DAILYMED_BASE}${setId}`;
    }
  } catch { /* unrecognized references are not treated as label evidence */ }
  return null;
}

export function assessStorageExcursionV6(input: StorageExcursionInput): StorageExcursionResult {
  const data = StorageExcursionInputSchema.parse(input);
  const labelReference = normalizeDailyMedReference(data.labelReference);
  const missingFields: string[] = [];
  if (!data.productName) missingFields.push('productName');
  if (!data.productState) missingFields.push('productState');
  if (!data.queriedAt) missingFields.push('queriedAt');
  if (!labelReference) missingFields.push('DailyMed label reference');
  if (data.labelRangeMinC === undefined || data.labelRangeMaxC === undefined) missingFields.push('complete label storage range');
  if (data.observedMinC === undefined || data.observedMaxC === undefined) missingFields.push('complete observed temperature range');

  const common = {
    productName: data.productName?.trim() || null,
    productState: data.productState ?? null,
    queriedAt: data.queriedAt ?? null,
    labelReference,
    labelRangeC: data.labelRangeMinC === undefined || data.labelRangeMaxC === undefined ? null : { min: data.labelRangeMinC, max: data.labelRangeMaxC },
    observedRangeC: data.observedMinC === undefined || data.observedMaxC === undefined ? null : { min: data.observedMinC, max: data.observedMaxC },
    missingFields,
  };
  if (missingFields.length > 0) {
    return { ...common, status: 'not_evaluable', evaluation: 'No storage range was assumed. The record is incomplete or lacks a verifiable DailyMed label reference.', reviewInstruction: null };
  }
  const outside = data.observedMinC! < data.labelRangeMinC! || data.observedMaxC! > data.labelRangeMaxC!;
  return outside
    ? { ...common, status: 'outside_entered_range', evaluation: 'Recorded temperatures extend beyond the label range entered by the user. This comparison does not determine product condition.', reviewInstruction: 'Follow the product-specific storage instructions and contact a pharmacist or manufacturer for product-specific guidance.' }
    : { ...common, status: 'within_entered_range', evaluation: 'Recorded temperatures fall within the label range entered by the user. This comparison does not assess product quality, stability, sterility, or suitability for use.', reviewInstruction: null };
}
