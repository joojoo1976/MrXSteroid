import { z } from 'zod';
export const ProgressEntrySchema=z.object({recordedOn:z.string().date(),metric:z.string().trim().min(1).max(80),value:z.number().finite().max(1000000),unit:z.string().trim().max(24).optional(),note:z.string().trim().max(240).optional()}).strict();
export const ProgressInputSchema=z.object({entries:z.array(ProgressEntrySchema).max(200)}).strict();
export function recordProgress(raw:unknown){const input=ProgressInputSchema.parse(raw);return {status:input.entries.length?'RECORDED':'PARTIAL' as const,resultType:'USER_PROVIDED' as const,entries:input.entries,disclaimer:'User-provided progress log only; no health judgment, prediction, or performance promise.'};}
